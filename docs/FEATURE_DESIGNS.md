# Feature Design Specifications

## Overview

This document contains comprehensive design specifications for 5 new features to be implemented in Desperados Destiny. Each design leverages existing infrastructure where possible.

---

# 1. SHOP/STORE SYSTEM

## Concept
**"The General Store"** - A western-themed marketplace where players purchase equipment, consumables, and supplies using gold. Fits the game's immersive location-based design.

## User Stories
- As a player, I want to browse items by category
- As a player, I want to see item stats and compare to my equipment
- As a player, I want to purchase items using gold
- As a player, I want to sell items from my inventory
- As a player, I want to see "hot deals" or featured items

## Data Models

### Item.model.ts (NEW)
```typescript
interface IItem {
  _id: ObjectId;
  itemId: string;           // Unique identifier: "weapon-revolver-uncommon"
  name: string;             // "Six-Shooter Revolver"
  description: string;      // Flavor text
  type: ItemType;           // weapon, armor, consumable, tool, mount
  subtype: string;          // pistol, rifle, hat, boots, etc.
  rarity: ItemRarity;       // common, uncommon, rare, epic, legendary

  // Economics
  buyPrice: number;         // Shop purchase price
  sellPrice: number;        // What player gets when selling (typically 50%)

  // Requirements
  levelRequired: number;
  factionRequired?: string; // Faction-exclusive items

  // Effects/Stats
  effects: ItemEffect[];    // [{stat: 'combat', modifier: 5}, {stat: 'cunning', modifier: -2}]
  durability?: number;      // For equipment (null = infinite)
  stackable: boolean;       // Can stack in inventory
  maxStack: number;         // Max per slot (default 99)

  // Availability
  isAvailable: boolean;     // Currently purchasable
  limitedStock?: number;    // null = infinite, number = limited per player/day

  // Metadata
  icon: string;             // Icon identifier
  createdAt: Date;
}

enum ItemType {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  CONSUMABLE = 'consumable',
  TOOL = 'tool',
  MOUNT = 'mount',
  MATERIAL = 'material'
}

enum ItemRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

interface ItemEffect {
  stat: string;       // combat, cunning, spirit, craft, health, energy
  modifier: number;   // +/- value
  type: 'flat' | 'percent';
}
```

### Update Character.model.ts
```typescript
// Enhanced inventory structure
interface InventoryItem {
  itemId: string;           // Reference to Item._id or itemId
  quantity: number;
  acquiredAt: Date;
  durability?: number;      // Current durability (for equipment)
  equipped?: boolean;       // Is this item currently equipped
}

// Add equipment slots
interface Equipment {
  weapon?: string;          // itemId
  armor?: string;
  hat?: string;
  boots?: string;
  accessory?: string;
  mount?: string;
}
```

## API Endpoints

### Shop Routes (shop.routes.ts)
```typescript
// Browse shop
GET /api/shop/items                    // All available items (paginated)
GET /api/shop/items/:itemId            // Single item details
GET /api/shop/categories               // Get all categories
GET /api/shop/items?type=weapon        // Filter by type
GET /api/shop/items?rarity=rare        // Filter by rarity
GET /api/shop/featured                 // Featured/deal items

// Transactions
POST /api/shop/purchase                // Buy item
POST /api/shop/sell                    // Sell item from inventory

// Request/Response
POST /api/shop/purchase
Body: { itemId: string, quantity: number }
Response: {
  success: boolean,
  item: InventoryItem,
  newBalance: number,
  transaction: GoldTransaction
}

POST /api/shop/sell
Body: { itemId: string, quantity: number }
Response: {
  success: boolean,
  goldReceived: number,
  newBalance: number
}
```

## Frontend Components

### Shop.tsx (New Page)
```typescript
// Main shop page structure
const Shop: React.FC = () => {
  // State
  const [items, setItems] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  return (
    <div className="flex gap-6">
      {/* Sidebar - Categories */}
      <aside className="w-48">
        <CategoryNav categories={categories} onSelect={setSelectedCategory} />
        <CartSummary cart={cart} onCheckout={handleCheckout} />
      </aside>

      {/* Main - Item Grid */}
      <main className="flex-1">
        <ShopHeader balance={character.gold} />
        <FeaturedItems items={featured} />
        <ItemGrid items={items} onSelect={setSelectedItem} onAddToCart={addToCart} />
      </main>

      {/* Modal - Item Details */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onPurchase={handlePurchase}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};
```

### UI Layout (Western Theme)

```
+------------------------------------------+
| THE GENERAL STORE          Gold: 1,234   |
+------------------------------------------+
| Categories  |  FEATURED DEALS            |
| ----------- |  [Deal 1] [Deal 2] [Deal 3]|
| All Items   |  --------------------------+
| > Weapons   |  WEAPONS                   |
|   Pistols   |  +-------+ +-------+       |
|   Rifles    |  |Revolvr| |Shotgun|       |
|   Melee     |  | $500  | | $800  |       |
| > Armor     |  +-------+ +-------+       |
| > Consumabl |                            |
| > Tools     |  +-------+ +-------+       |
| > Mounts    |  |Rifle  | |Dagger |       |
|             |  | $1200 | | $300  |       |
| CART (2)    |  +-------+ +-------+       |
| Revolver x1 |                            |
| Whiskey x3  |  [Load More...]            |
| ----------- |                            |
| Total: 650  |                            |
| [Checkout]  |                            |
+------------------------------------------+
```

### Item Card Component
```typescript
const ItemCard: React.FC<{ item: Item }> = ({ item }) => (
  <div className="bg-wood-dark border border-wood-grain rounded-lg p-3 hover:border-gold-light">
    <div className="text-3xl text-center mb-2">{item.icon}</div>
    <h4 className={`font-western text-sm ${rarityColors[item.rarity]}`}>
      {item.name}
    </h4>
    <p className="text-xs text-desert-stone">{item.type}</p>
    <div className="flex justify-between items-center mt-2">
      <span className="text-gold-light font-bold">{item.buyPrice}g</span>
      <button className="btn-sm">Buy</button>
    </div>
  </div>
);
```

## Item Catalog (Seed Data)

### Weapons
| Name | Type | Rarity | Price | Effects |
|------|------|--------|-------|---------|
| Rusty Revolver | weapon/pistol | common | 100 | +2 combat |
| Six-Shooter | weapon/pistol | uncommon | 500 | +5 combat |
| Peacemaker | weapon/pistol | rare | 2000 | +10 combat, +2 cunning |
| Sawed-Off Shotgun | weapon/shotgun | uncommon | 800 | +8 combat, -2 cunning |
| Hunting Rifle | weapon/rifle | uncommon | 1200 | +7 combat, +3 cunning |
| Bowie Knife | weapon/melee | common | 150 | +3 combat |
| Tomahawk | weapon/melee | rare | 1500 | +8 combat, +2 spirit |

### Armor
| Name | Type | Rarity | Price | Effects |
|------|------|--------|-------|---------|
| Leather Vest | armor/chest | common | 200 | +5 HP |
| Reinforced Duster | armor/chest | uncommon | 600 | +10 HP, +2 cunning |
| Cavalry Boots | armor/boots | common | 150 | +3 spirit |
| Felt Hat | armor/hat | common | 100 | +1 cunning |
| Stetson | armor/hat | uncommon | 400 | +3 cunning, +2 spirit |

### Consumables
| Name | Type | Rarity | Price | Effects |
|------|------|--------|-------|---------|
| Whiskey | consumable/drink | common | 25 | +10 energy |
| Tequila | consumable/drink | uncommon | 75 | +25 energy |
| Bandages | consumable/medical | common | 50 | Heal 20 HP |
| Snake Oil | consumable/medical | uncommon | 200 | Remove wanted level |
| Dynamite | consumable/explosive | rare | 500 | +50% crime success |

### Mounts
| Name | Type | Rarity | Price | Effects |
|------|------|--------|-------|---------|
| Old Mule | mount | common | 500 | -10% travel time |
| Mustang | mount | uncommon | 2000 | -25% travel time |
| Appaloosa | mount | rare | 5000 | -40% travel time, +3 spirit |

## Implementation Priority
1. Item model and seed data
2. Shop service and controller
3. Basic shop page with item grid
4. Purchase flow
5. Sell flow
6. Equipment system
7. Item effects application

---

# 2. CHARACTER PROFILE SYSTEM

## Concept
**"Wanted Poster"** - View any character's public profile styled as a wanted poster or character dossier. Shows stats, achievements, gang affiliation, and combat record.

## User Stories
- As a player, I want to view other players' profiles
- As a player, I want to see someone's combat record before fighting them
- As a player, I want to see what gang someone belongs to
- As a player, I want to customize my own profile (bio, display settings)

## Data Models

### Add to Character.model.ts
```typescript
interface CharacterProfile {
  bio: string;              // Player-written bio (max 500 chars)
  title: string;            // Custom title or achievement-based
  isPublic: boolean;        // Allow others to view profile
  showStats: boolean;       // Show detailed stats
  showInventory: boolean;   // Show inventory count
  showGold: boolean;        // Show gold amount
  featuredAchievement?: string;
}
```

### Achievement.model.ts (NEW - Optional Enhancement)
```typescript
interface IAchievement {
  _id: ObjectId;
  characterId: ObjectId;
  achievementId: string;    // 'first_blood', 'gang_founder', etc.
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  rarity: 'common' | 'rare' | 'legendary';
}
```

## API Endpoints

### Profile Routes
```typescript
// Public profile (anyone can view)
GET /api/characters/profile/:name       // Get public profile by character name

// Own profile management
GET /api/characters/:id/profile         // Get own full profile
PUT /api/characters/:id/profile         // Update profile settings
PUT /api/characters/:id/profile/bio     // Update bio

// Response structure
{
  character: {
    name: string;
    faction: string;
    level: number;
    title: string;
    bio: string;
    appearance: CharacterAppearance;

    // Conditional on privacy settings
    stats?: CharacterStats;
    gold?: number;
    inventoryCount?: number;

    // Always public
    gangName?: string;
    gangRole?: string;
    combatRecord: { wins: number, losses: number };
    wantedLevel: number;

    // Activity
    lastActive: Date;
    createdAt: Date;
  },
  achievements?: Achievement[];
  recentActivity?: ActivityLog[];
}
```

## Frontend Components

### Profile.tsx (New Page)
```typescript
const Profile: React.FC = () => {
  const { name } = useParams();
  const [profile, setProfile] = useState<ProfileData | null>(null);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Wanted Poster Header */}
      <div className="relative bg-[url('/textures/parchment.png')] p-8 rounded-lg">
        <h1 className="text-center font-western text-4xl text-wood-dark">
          {profile.wantedLevel > 0 ? 'WANTED' : 'CITIZEN'}
        </h1>

        {/* Character Portrait */}
        <div className="flex justify-center my-6">
          <CharacterAvatar appearance={profile.appearance} size="xl" />
        </div>

        <h2 className="text-center font-western text-3xl text-wood-dark">
          {profile.name}
        </h2>
        <p className="text-center text-wood-medium">
          {profile.title || `Level ${profile.level} ${profile.faction}`}
        </p>

        {/* Bounty Amount */}
        {profile.wantedLevel > 0 && (
          <div className="text-center mt-4">
            <span className="text-2xl font-western text-red-800">
              BOUNTY: ${profile.bountyAmount}
            </span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard label="Wins" value={profile.combatRecord.wins} icon="trophy" />
        <StatCard label="Losses" value={profile.combatRecord.losses} icon="skull" />
        <StatCard label="Gang" value={profile.gangName || 'Lone Wolf'} icon="users" />
        <StatCard label="Member Since" value={formatDate(profile.createdAt)} icon="calendar" />
      </div>

      {/* Bio Section */}
      {profile.bio && (
        <Card variant="leather" className="mt-6 p-4">
          <h3 className="font-western text-gold-light mb-2">About</h3>
          <p className="text-desert-sand font-serif italic">"{profile.bio}"</p>
        </Card>
      )}

      {/* Detailed Stats (if public) */}
      {profile.stats && (
        <Card variant="wood" className="mt-6 p-4">
          <h3 className="font-western text-gold-light mb-4">Stats</h3>
          <div className="grid grid-cols-4 gap-4 text-center">
            <StatDisplay label="Combat" value={profile.stats.combat} />
            <StatDisplay label="Cunning" value={profile.stats.cunning} />
            <StatDisplay label="Spirit" value={profile.stats.spirit} />
            <StatDisplay label="Craft" value={profile.stats.craft} />
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-4 mt-6">
        <Button onClick={() => navigate(`/game/combat?target=${profile.name}`)}>
          Challenge to Duel
        </Button>
        <Button variant="secondary" onClick={handleAddFriend}>
          Add Friend
        </Button>
        <Button variant="secondary" onClick={handleSendMail}>
          Send Mail
        </Button>
      </div>
    </div>
  );
};
```

### UI Layout

```
+------------------------------------------+
|          ~~~~~ WANTED ~~~~~               |
|                                          |
|           [Character Avatar]              |
|                                          |
|           "DUSTY MCGRAW"                  |
|        Level 25 Frontera Outlaw          |
|                                          |
|         BOUNTY: $5,000 GOLD              |
+------------------------------------------+
|  Wins   | Losses |  Gang     | Joined   |
|   47    |   12   | Los Lobos | Jan 2024 |
+------------------------------------------+
| ABOUT                                    |
| "The fastest gun in the west, or so they |
| say. Cross me and find out."             |
+------------------------------------------+
| STATS                                    |
| Combat: 45  Cunning: 32  Spirit: 28      |
+------------------------------------------+
| [Challenge] [Add Friend] [Send Mail]     |
+------------------------------------------+
```

## Profile Customization (Own Profile)

### ProfileSettings.tsx
```typescript
const ProfileSettings: React.FC = () => (
  <div className="space-y-6">
    <Card variant="leather" className="p-4">
      <h3>Profile Bio</h3>
      <textarea
        maxLength={500}
        placeholder="Tell others about yourself..."
        value={bio}
        onChange={e => setBio(e.target.value)}
      />
      <p className="text-xs text-desert-stone">{bio.length}/500</p>
    </Card>

    <Card variant="wood" className="p-4">
      <h3>Privacy Settings</h3>
      <Toggle label="Public Profile" checked={isPublic} />
      <Toggle label="Show Stats" checked={showStats} />
      <Toggle label="Show Gold" checked={showGold} />
      <Toggle label="Show Inventory" checked={showInventory} />
    </Card>

    <Button onClick={handleSave}>Save Profile</Button>
  </div>
);
```

## Implementation Priority
1. Public profile API endpoint
2. Basic Profile.tsx page
3. Profile viewing from leaderboard/friends
4. Profile customization
5. Achievements system (enhancement)

---

# 3. SETTINGS/PREFERENCES SYSTEM

## Concept
**"The Preferences"** - Comprehensive settings page for account management, game preferences, notifications, and privacy controls.

## User Stories
- As a player, I want to change my email/password
- As a player, I want to control notification preferences
- As a player, I want to toggle sound/music settings
- As a player, I want to manage privacy settings
- As a player, I want to delete my account if needed

## Data Models

### Add to User.model.ts
```typescript
interface UserPreferences {
  // Notifications
  notifications: {
    email: boolean;           // Receive email notifications
    push: boolean;            // Browser push notifications
    mailReceived: boolean;    // Notify on new mail
    friendRequest: boolean;   // Notify on friend requests
    gangInvite: boolean;      // Notify on gang invitations
    combatChallenge: boolean; // Notify when challenged
    warUpdates: boolean;      // Notify on gang war updates
  };

  // Display
  display: {
    theme: 'dark' | 'light' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    animations: boolean;
    showTutorials: boolean;
  };

  // Audio
  audio: {
    masterVolume: number;     // 0-100
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
  };

  // Privacy
  privacy: {
    showOnlineStatus: boolean;
    allowFriendRequests: boolean;
    allowGangInvites: boolean;
    allowChallenges: boolean;
  };

  // Gameplay
  gameplay: {
    autoHealInTown: boolean;
    confirmActions: boolean;  // Confirm before actions
    quickSell: boolean;       // Skip sell confirmation
  };
}
```

## API Endpoints

### Settings Routes
```typescript
// Preferences
GET /api/users/preferences              // Get all preferences
PUT /api/users/preferences              // Update preferences
PUT /api/users/preferences/:section     // Update specific section

// Account
PUT /api/users/email                    // Change email
PUT /api/users/password                 // Change password
DELETE /api/users/account               // Delete account (with confirmation)

// Security
GET /api/users/sessions                 // Active sessions
DELETE /api/users/sessions/:id          // Log out specific session
POST /api/users/2fa/enable              // Enable 2FA (future)
```

## Frontend Components

### Settings.tsx (New Page)
```typescript
const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('account');

  return (
    <div className="flex gap-6">
      {/* Settings Navigation */}
      <aside className="w-48 space-y-1">
        <SettingsNavItem icon="user" label="Account" section="account" />
        <SettingsNavItem icon="bell" label="Notifications" section="notifications" />
        <SettingsNavItem icon="eye" label="Privacy" section="privacy" />
        <SettingsNavItem icon="palette" label="Display" section="display" />
        <SettingsNavItem icon="volume" label="Audio" section="audio" />
        <SettingsNavItem icon="gamepad" label="Gameplay" section="gameplay" />
      </aside>

      {/* Settings Content */}
      <main className="flex-1">
        {activeSection === 'account' && <AccountSettings />}
        {activeSection === 'notifications' && <NotificationSettings />}
        {activeSection === 'privacy' && <PrivacySettings />}
        {activeSection === 'display' && <DisplaySettings />}
        {activeSection === 'audio' && <AudioSettings />}
        {activeSection === 'gameplay' && <GameplaySettings />}
      </main>
    </div>
  );
};
```

### Section Components

#### AccountSettings.tsx
```typescript
const AccountSettings: React.FC = () => (
  <div className="space-y-6">
    <Card variant="leather" className="p-4">
      <h3 className="font-western text-lg mb-4">Account Information</h3>
      <div className="space-y-4">
        <div>
          <label>Email</label>
          <div className="flex gap-2">
            <Input value={email} disabled />
            <Button size="sm" onClick={() => setShowEmailModal(true)}>
              Change
            </Button>
          </div>
        </div>
        <div>
          <label>Password</label>
          <Button onClick={() => setShowPasswordModal(true)}>
            Change Password
          </Button>
        </div>
      </div>
    </Card>

    <Card variant="wood" className="p-4 border-red-600">
      <h3 className="font-western text-lg text-red-600 mb-4">Danger Zone</h3>
      <p className="text-sm text-desert-stone mb-4">
        Once you delete your account, there is no going back.
        All characters and progress will be permanently lost.
      </p>
      <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
        Delete Account
      </Button>
    </Card>
  </div>
);
```

#### NotificationSettings.tsx
```typescript
const NotificationSettings: React.FC = () => (
  <Card variant="leather" className="p-4">
    <h3 className="font-western text-lg mb-4">Notification Preferences</h3>
    <div className="space-y-3">
      <Toggle
        label="Email Notifications"
        description="Receive important updates via email"
        checked={prefs.notifications.email}
        onChange={v => updatePref('notifications.email', v)}
      />
      <Toggle
        label="New Mail"
        description="Notify when you receive in-game mail"
        checked={prefs.notifications.mailReceived}
        onChange={v => updatePref('notifications.mailReceived', v)}
      />
      <Toggle
        label="Friend Requests"
        description="Notify when someone sends a friend request"
        checked={prefs.notifications.friendRequest}
        onChange={v => updatePref('notifications.friendRequest', v)}
      />
      <Toggle
        label="Gang Invitations"
        description="Notify when invited to join a gang"
        checked={prefs.notifications.gangInvite}
        onChange={v => updatePref('notifications.gangInvite', v)}
      />
      <Toggle
        label="Combat Challenges"
        description="Notify when challenged to a duel"
        checked={prefs.notifications.combatChallenge}
        onChange={v => updatePref('notifications.combatChallenge', v)}
      />
      <Toggle
        label="Gang War Updates"
        description="Notify on war progress and results"
        checked={prefs.notifications.warUpdates}
        onChange={v => updatePref('notifications.warUpdates', v)}
      />
    </div>
  </Card>
);
```

### UI Layout

```
+------------------------------------------+
| SETTINGS                                  |
+------------------------------------------+
| Account      | ACCOUNT INFORMATION       |
| Notifications| ------------------------- |
| Privacy      | Email: user@email.com [Change] |
| Display      |                           |
| Audio        | Password: ******** [Change] |
| Gameplay     |                           |
|              | ------------------------- |
|              | DANGER ZONE               |
|              | [Delete Account]          |
+------------------------------------------+
```

## Implementation Priority
1. User preferences model update
2. Preferences API endpoints
3. Settings page with navigation
4. Account settings (email/password)
5. Notification preferences
6. Privacy settings
7. Display/audio settings
8. Account deletion flow

---

# 4. NOTIFICATIONS SYSTEM UI

## Concept
**"The Telegraph"** - Real-time notification system with a bell icon, toast notifications, and a dedicated notifications page. Leverages complete backend already built.

## User Stories
- As a player, I want to see unread notification count
- As a player, I want real-time notifications as they happen
- As a player, I want to click notifications to go to relevant content
- As a player, I want to mark notifications as read
- As a player, I want to delete old notifications

## Frontend Components

### NotificationBell.tsx (Header Component)
```typescript
const NotificationBell: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch unread count on mount
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Listen for real-time notifications
  useEffect(() => {
    socket.on('notification:new', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      showToast(notification);
    });
    return () => socket.off('notification:new');
  }, []);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative">
        <BellIcon className="h-6 w-6 text-desert-sand" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-wood-dark border border-wood-grain rounded-lg shadow-xl z-50">
          <div className="p-3 border-b border-wood-grain flex justify-between">
            <h3 className="font-western text-gold-light">Notifications</h3>
            <button onClick={markAllRead} className="text-xs text-desert-stone hover:text-gold-light">
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-desert-stone">No notifications</p>
            ) : (
              notifications.map(n => (
                <NotificationItem key={n._id} notification={n} onClick={() => handleClick(n)} />
              ))
            )}
          </div>
          <div className="p-2 border-t border-wood-grain">
            <Link to="/game/notifications" className="block text-center text-sm text-gold-light hover:underline">
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
```

### NotificationItem.tsx
```typescript
const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const icons: Record<NotificationType, string> = {
    MAIL_RECEIVED: '📨',
    FRIEND_REQUEST: '🤝',
    FRIEND_ACCEPTED: '✅',
    GANG_INVITATION: '🤠',
    GANG_WAR_UPDATE: '⚔️',
    COMBAT_DEFEAT: '💀',
    JAIL_RELEASED: '🔓',
    SKILL_TRAINED: '📚',
  };

  return (
    <div className={`p-3 border-b border-wood-grain/30 hover:bg-wood-medium/50 cursor-pointer ${
      !notification.isRead ? 'bg-wood-medium/20' : ''
    }`}>
      <div className="flex gap-3">
        <span className="text-xl">{icons[notification.type]}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${notification.isRead ? 'text-desert-stone' : 'text-desert-sand font-medium'}`}>
            {notification.title}
          </p>
          <p className="text-xs text-desert-stone truncate">
            {notification.message}
          </p>
          <p className="text-xs text-desert-stone/70 mt-1">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead && (
          <div className="w-2 h-2 bg-gold-light rounded-full self-center" />
        )}
      </div>
    </div>
  );
};
```

### NotificationToast.tsx
```typescript
const NotificationToast: React.FC<{ notification: Notification; onClose: () => void }> = ({ notification, onClose }) => (
  <div className="fixed bottom-4 right-4 bg-wood-dark border border-gold-light/50 rounded-lg shadow-xl p-4 max-w-sm animate-slide-in-right z-50">
    <div className="flex gap-3">
      <span className="text-2xl">{getIcon(notification.type)}</span>
      <div className="flex-1">
        <h4 className="font-western text-gold-light">{notification.title}</h4>
        <p className="text-sm text-desert-sand">{notification.message}</p>
      </div>
      <button onClick={onClose} className="text-desert-stone hover:text-white">
        ×
      </button>
    </div>
    {notification.link && (
      <Link to={notification.link} className="block mt-2 text-sm text-gold-light hover:underline">
        View details →
      </Link>
    )}
  </div>
);
```

### Notifications.tsx (Full Page)
```typescript
const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-western text-gold-light">Notifications</h1>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={markAllRead}>
            Mark all read
          </Button>
          <Button size="sm" variant="secondary" onClick={clearAll}>
            Clear all
          </Button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        <FilterTab label="All" value="all" />
        <FilterTab label="Unread" value="unread" />
        <FilterTab label="Combat" value="combat" />
        <FilterTab label="Social" value="social" />
        <FilterTab label="Gang" value="gang" />
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {notifications.map(n => (
          <NotificationCard
            key={n._id}
            notification={n}
            onMarkRead={() => markAsRead(n._id)}
            onDelete={() => deleteNotification(n._id)}
          />
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <Button variant="secondary" className="w-full mt-4" onClick={loadMore}>
          Load more
        </Button>
      )}
    </div>
  );
};
```

### UI Layout - Bell Dropdown

```
+------------------------+
| Notifications   [Mark all] |
+------------------------+
| 📨 New Mail               |
|    From: Dusty McGraw     |
|    2 minutes ago      [•] |
+------------------------+
| 🤝 Friend Request         |
|    Snake Eyes wants...    |
|    1 hour ago             |
+------------------------+
| ⚔️ Gang War Update        |
|    Los Lobos contributed  |
|    3 hours ago            |
+------------------------+
|    View all notifications |
+------------------------+
```

## Socket.io Integration

### useNotifications.ts (Hook)
```typescript
const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();

    // Socket listeners
    const socket = getSocket();

    socket.on('notification:new', (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show toast
      toast.custom(<NotificationToast notification={notification} />);
    });

    return () => {
      socket.off('notification:new');
    };
  }, []);

  const markAsRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev =>
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await api.patch('/notifications/mark-all-read');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markAsRead, markAllAsRead };
};
```

## Implementation Priority
1. NotificationBell component in Header
2. useNotifications hook with Socket.io
3. NotificationToast component
4. Notifications page
5. Filter/sort functionality
6. Sound effects for notifications

---

# 5. GANG WARS UI

## Concept
**"The Siege"** - Comprehensive gang war interface showing active wars, contribution progress, territory control visualization, and war history. Complete backend exists.

## User Stories
- As a gang leader, I want to declare war on territories
- As a gang member, I want to contribute gold to war efforts
- As a player, I want to see war progress in real-time
- As a player, I want to see war history and results

## Frontend Components

### GangWars.tsx (Section in Gang.tsx or Separate Page)
```typescript
const GangWars: React.FC = () => {
  const [activeWars, setActiveWars] = useState<GangWar[]>([]);
  const [selectedWar, setSelectedWar] = useState<GangWar | null>(null);

  return (
    <div className="space-y-6">
      {/* Active Wars */}
      <Card variant="leather" className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-western text-gold-light">Active Wars</h3>
          {canDeclareWar && (
            <Button onClick={() => setShowDeclareModal(true)}>
              Declare War
            </Button>
          )}
        </div>

        {activeWars.length === 0 ? (
          <p className="text-desert-stone text-center py-8">
            No active wars. Your gang is at peace.
          </p>
        ) : (
          <div className="space-y-4">
            {activeWars.map(war => (
              <WarCard key={war._id} war={war} onClick={() => setSelectedWar(war)} />
            ))}
          </div>
        )}
      </Card>

      {/* War History */}
      <Card variant="wood" className="p-4">
        <h3 className="text-xl font-western text-gold-light mb-4">War History</h3>
        <WarHistoryTable gangId={currentGang._id} />
      </Card>

      {/* Modals */}
      {showDeclareModal && (
        <DeclareWarModal onClose={() => setShowDeclareModal(false)} />
      )}
      {selectedWar && (
        <WarDetailModal war={selectedWar} onClose={() => setSelectedWar(null)} />
      )}
    </div>
  );
};
```

### WarCard.tsx
```typescript
const WarCard: React.FC<{ war: GangWar }> = ({ war }) => {
  const isAttacker = war.attackerGangId === currentGang._id;
  const timeRemaining = new Date(war.resolveAt).getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));

  return (
    <div className="bg-wood-dark/50 rounded-lg p-4 border border-wood-grain hover:border-gold-light transition-colors cursor-pointer">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-western text-lg text-gold-light">
            Battle for {war.territoryId}
          </h4>
          <p className="text-sm text-desert-stone">
            {isAttacker ? 'Attacking' : 'Defending'} • {hoursLeft}h remaining
          </p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          war.capturePoints >= 60 ? 'bg-green-600' :
          war.capturePoints >= 40 ? 'bg-yellow-600' : 'bg-red-600'
        }`}>
          {war.capturePoints}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-8 bg-wood-dark rounded-full overflow-hidden mb-4">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-red-500"
          style={{ width: `${war.capturePoints}%` }}
        />
        <div
          className="absolute right-0 top-0 h-full bg-gradient-to-l from-blue-600 to-blue-500"
          style={{ width: `${100 - war.capturePoints}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white drop-shadow">
            {war.attackerGangName} vs {war.defenderGangName || 'Unclaimed'}
          </span>
        </div>
      </div>

      {/* Funding */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-xs text-desert-stone">Attacker Funding</p>
          <p className="font-western text-gold-light">{war.attackerFunding}g</p>
        </div>
        <div>
          <p className="text-xs text-desert-stone">Defender Funding</p>
          <p className="font-western text-gold-light">{war.defenderFunding}g</p>
        </div>
      </div>
    </div>
  );
};
```

### DeclareWarModal.tsx
```typescript
const DeclareWarModal: React.FC = () => {
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [fundingAmount, setFundingAmount] = useState(1000);

  return (
    <Modal title="Declare War" onClose={onClose}>
      <div className="space-y-6">
        {/* Territory Selection */}
        <div>
          <label className="block text-sm font-western text-desert-sand mb-2">
            Target Territory
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {availableTerritories.map(territory => (
              <button
                key={territory.id}
                onClick={() => setSelectedTerritory(territory.id)}
                className={`p-3 rounded border text-left ${
                  selectedTerritory === territory.id
                    ? 'border-gold-light bg-wood-dark'
                    : 'border-wood-grain hover:border-gold-light/50'
                }`}
              >
                <p className="font-western text-sm">{territory.name}</p>
                <p className="text-xs text-desert-stone">
                  {territory.controllingGang || 'Unclaimed'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Funding Amount */}
        <div>
          <label className="block text-sm font-western text-desert-sand mb-2">
            Initial War Fund
          </label>
          <input
            type="range"
            min={1000}
            max={gang.bank}
            step={100}
            value={fundingAmount}
            onChange={e => setFundingAmount(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-desert-stone">
            <span>1,000g (min)</span>
            <span className="text-gold-light font-bold">{fundingAmount}g</span>
            <span>{gang.bank}g (max)</span>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-wood-dark/50 rounded p-3 text-sm">
          <p className="text-desert-sand mb-2">Requirements:</p>
          <ul className="space-y-1 text-desert-stone">
            <li className={hasWarChest ? 'text-green-500' : 'text-red-500'}>
              {hasWarChest ? '✓' : '✗'} War Chest upgrade
            </li>
            <li className={fundingAmount >= 1000 ? 'text-green-500' : 'text-red-500'}>
              {fundingAmount >= 1000 ? '✓' : '✗'} Minimum 1,000g funding
            </li>
            <li className={!hasActiveWar ? 'text-green-500' : 'text-red-500'}>
              {!hasActiveWar ? '✓' : '✗'} No other active wars
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleDeclare}
            className="flex-1"
            disabled={!canDeclare}
          >
            Declare War
          </Button>
        </div>
      </div>
    </Modal>
  );
};
```

### WarDetailModal.tsx (Contribution Interface)
```typescript
const WarDetailModal: React.FC<{ war: GangWar }> = ({ war }) => {
  const [contributionAmount, setContributionAmount] = useState(100);

  return (
    <Modal title={`Battle for ${war.territoryId}`} onClose={onClose} size="lg">
      <div className="space-y-6">
        {/* War Status */}
        <div className="text-center">
          <p className="text-sm text-desert-stone mb-2">Time Remaining</p>
          <CountdownTimer target={war.resolveAt} className="text-3xl font-western text-gold-light" />
        </div>

        {/* Capture Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-red-500 font-western">{war.attackerGangName}</span>
            <span className="text-blue-500 font-western">{war.defenderGangName || 'Defenders'}</span>
          </div>
          <div className="relative h-10 bg-wood-dark rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
              style={{ width: `${war.capturePoints}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-white drop-shadow">
                {war.capturePoints}% / 60% needed
              </span>
            </div>
          </div>
        </div>

        {/* Contribution Form */}
        <Card variant="wood" className="p-4">
          <h4 className="font-western text-gold-light mb-4">Contribute to War Effort</h4>
          <div className="flex gap-4">
            <input
              type="number"
              min={1}
              max={character.gold}
              value={contributionAmount}
              onChange={e => setContributionAmount(Number(e.target.value))}
              className="flex-1 bg-wood-dark border border-wood-grain rounded px-3 py-2"
            />
            <Button onClick={handleContribute}>
              Contribute {contributionAmount}g
            </Button>
          </div>
          <p className="text-xs text-desert-stone mt-2">
            Your gold: {character.gold}g
          </p>
        </Card>

        {/* Top Contributors */}
        <div>
          <h4 className="font-western text-gold-light mb-3">Top Contributors</h4>
          <div className="grid grid-cols-2 gap-4">
            {/* Attackers */}
            <div>
              <p className="text-xs text-red-500 mb-2">Attackers</p>
              {war.attackerContributions.slice(0, 5).map((c, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-desert-sand">{c.characterName}</span>
                  <span className="text-gold-light">{c.amount}g</span>
                </div>
              ))}
            </div>
            {/* Defenders */}
            <div>
              <p className="text-xs text-blue-500 mb-2">Defenders</p>
              {war.defenderContributions.slice(0, 5).map((c, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-desert-sand">{c.characterName}</span>
                  <span className="text-gold-light">{c.amount}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* War Log */}
        <div>
          <h4 className="font-western text-gold-light mb-3">Battle Log</h4>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {war.warLog.map((entry, i) => (
              <p key={i} className="text-xs text-desert-stone">
                <span className="text-desert-sand">{formatTime(entry.timestamp)}</span>
                {' '}{entry.message}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
```

### UI Layout - War Card

```
+------------------------------------------+
| BATTLE FOR RED GULCH                     |
| Attacking • 18h remaining           [72%]|
+------------------------------------------+
| [==========RED=========][==BLUE==]       |
|      Los Lobos vs The Marshals           |
+------------------------------------------+
| Attacker Funding  |  Defender Funding    |
|     5,200g        |       3,100g         |
+------------------------------------------+
```

### Real-time Updates

```typescript
// Socket listeners for war updates
useEffect(() => {
  const socket = getSocket();

  socket.on('territory:war_contributed', (data) => {
    // Update war progress in real-time
    setActiveWars(prev => prev.map(war =>
      war._id === data.warId
        ? { ...war, capturePoints: data.newCapturePoints }
        : war
    ));

    // Show contribution toast
    toast.success(`${data.contributor} contributed ${data.amount}g!`);
  });

  socket.on('territory:conquered', (data) => {
    toast.success(`${data.winner} conquered ${data.territory}!`);
    fetchActiveWars(); // Refresh wars
  });

  socket.on('territory:defended', (data) => {
    toast.info(`${data.defender} successfully defended ${data.territory}!`);
    fetchActiveWars();
  });

  return () => {
    socket.off('territory:war_contributed');
    socket.off('territory:conquered');
    socket.off('territory:defended');
  };
}, []);
```

## Implementation Priority
1. WarCard component showing active wars
2. War contribution interface
3. DeclareWarModal
4. Real-time Socket.io updates
5. War history table
6. Countdown timers
7. Contribution leaderboard

---

# IMPLEMENTATION ROADMAP

## Phase 1: Quick Wins (Backend Ready)
1. **Notifications UI** - Backend complete, just need frontend
2. **Gang Wars UI** - Backend complete, just need frontend

## Phase 2: Profile & Settings
3. **Character Profile** - Need public endpoint + Profile page
4. **Settings Page** - Need User preferences model + Settings page

## Phase 3: Shop System
5. **Shop/Store** - Most complex, needs full stack

## Estimated Effort

| Feature | Backend | Frontend | Total |
|---------|---------|----------|-------|
| Notifications UI | Done | 8 hours | 8 hours |
| Gang Wars UI | Done | 12 hours | 12 hours |
| Character Profile | 4 hours | 8 hours | 12 hours |
| Settings | 6 hours | 10 hours | 16 hours |
| Shop System | 16 hours | 20 hours | 36 hours |

**Total: ~84 hours of development**

---

# DESIGN NOTES

## Consistent Western Theme
- Use leather/wood card variants
- Font: Western headers, serif body
- Colors: gold-light, desert-sand, wood tones
- Icons: Period-appropriate emojis

## Mobile Responsiveness
- All components must work on mobile
- Use collapsible sidebars
- Stack grids on small screens
- Touch-friendly buttons (min 44px)

## Performance Considerations
- Paginate all lists (10-20 items)
- Debounce search/filter inputs
- Lazy load images
- Use virtual scrolling for long lists

## Accessibility
- Proper ARIA labels
- Keyboard navigation
- Color contrast compliance
- Screen reader support

/**
 * Art Asset Data for AI Generation Dashboard
 * Contains all identified art assets organized by category with AI prompts
 */

export type AssetPriority = 'high' | 'medium' | 'low';
export type AssetDifficulty = 'easy' | 'moderate' | 'hard';
export type AssetStatus = 'pending' | 'uploaded' | 'integrated';

export interface ArtAsset {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  prompt: string; // Default prompt (Z Image Turbo optimized)
  geminiPrompt?: string; // Gemini Nano Banana optimized prompt (supports negative constraints)
  priority: AssetPriority;
  difficulty: AssetDifficulty;
  status: AssetStatus;
  uploadedImage?: string; // base64 or URL
  notes?: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
  priority: AssetPriority;
}

// Style prefix for consistent generation
export const STYLE_PREFIX = `Stylized Western illustration, vintage poster art style, bold colors, hand-painted look, dramatic lighting, 1880s American frontier, warm sepia undertones`;

// =============================================================================
// GEMINI NANO BANANA OPTIMIZED PROMPTS
// =============================================================================
// Key techniques from Google's Nano Banana documentation:
// 1. NARRATIVE DESCRIPTIONS - "Describe the scene, don't just list keywords"
// 2. SIX ELEMENTS - Subject, Composition, Action, Setting, Style, Details
// 3. NEGATIVE CONSTRAINTS WORK - Can use "Do not include X" phrasing
// 4. TEXT RENDERING - Excellent at rendering text in images
// 5. PHOTOGRAPHY LANGUAGE - Camera angles, lens types, lighting
// 6. TRANSPARENT BG WORKAROUND - Generate on white, then black, composite
//
// Sources:
// - https://blog.google/products/gemini/prompting-tips-nano-banana-pro/
// - https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/
// - https://ai.google.dev/gemini-api/docs/image-generation
// =============================================================================

// Gemini Nano Banana style prefixes - narrative format
export const GEMINI_STYLES = {
  character: `Create a stylized Western character portrait in vintage poster art style. The image should feature bold linework, dramatic expression, and a weathered frontier face with rich warm colors. Frame the subject in a chest-up composition with an illustrated, hand-painted look reminiscent of 1880s American frontier art.`,

  location: `Generate a stylized Western landscape in vintage travel poster style. Use bold shapes and atmospheric perspective with golden hour lighting. The scene should have a hand-painted illustration quality with a panoramic view capturing the drama of the American frontier.`,

  item: `Create a game icon illustration of a Western frontier item. Use bold outlines in vintage advertisement style with warm earth tones. The design should be simple, iconic, and suitable for a game UI with a clean background.`,

  animal: `Generate a stylized Western animal illustration in naturalist poster art style. Use bold confident strokes showing the animal in a dynamic pose with a warm color palette. The style should resemble an illustrated field guide of frontier wildlife.`,

  building: `Create an illustration of an Old West wooden building in a frontier town setting. Show dusty streets and 1880s architecture in a stylized illustration style with warm afternoon lighting.`,

  card: `Generate a traditional playing card design viewed flat from the front. The card should have an antique Victorian style with aged cream parchment paper texture and an ornate vintage border featuring decorative scrollwork framing the edges. Use sepia and cream tones with a vintage 1880s printing aesthetic.`,

  emblem: `Create a Western emblem design in vintage badge style. Use bold graphics with symbolic imagery and ornate border details. The texture should suggest aged metal or tooled leather.`,
};

// Legacy Z Image Turbo style prefixes (kept for compatibility)
export const STYLE_PREFIXES = {
  character: `Stylized Western character portrait, vintage poster art, bold linework, dramatic expression, weathered frontier face, rich warm colors, illustrated style, chest-up composition`,
  location: `Stylized Western landscape, vintage travel poster style, bold shapes, atmospheric perspective, golden hour lighting, hand-painted illustration, panoramic view`,
  item: `Stylized Western item illustration, clean background, bold outlines, vintage advertisement style, warm earth tones, simple iconic design, game icon format`,
  animal: `Stylized Western animal illustration, naturalist poster art, bold confident strokes, dynamic pose, warm palette, frontier wildlife, illustrated field guide style`,
  building: `Old West wooden building, frontier town, dusty street, 1880s architecture, stylized illustration, warm afternoon light`,
  card: `Traditional playing card, exact rectangular card shape with rounded corners, flat front view centered on solid background, antique Victorian style, aged cream parchment paper texture, ornate vintage border with decorative scrollwork framing the card edges`,
  cardArt: `Western vintage playing card design, ornate illustration, aged paper texture, classic card format, stylized artwork, saloon aesthetic`,
  emblem: `Western emblem design, vintage badge style, bold graphics, symbolic imagery, ornate border details, aged metal or leather texture`,
};

// Card-specific prompt suffix for consistent styling
// Z Image Turbo Note: Model ignores negative prompts - use purely additive/descriptive language
export const CARD_BG_SUFFIX = `, weathered antique paper texture, sepia and cream tones, vintage 1880s printing style, elegant Victorian decorative corners, solid bright green background (#00FF00) behind card for easy cutout`;

// Gemini Nano Banana card suffix - supports negative constraints and transparent backgrounds
export const GEMINI_CARD_SUFFIX = ` The card should have weathered antique paper texture with sepia and cream tones in a vintage 1880s printing style. Place the card on a solid pure white background for easy extraction.`;

// Gemini-optimized Joker prompts - traditional card layout with J and stars
export const GEMINI_JOKER_PROMPTS = {
  red: `Generate a traditional Joker playing card design. The card shows a single full-body illustration of a medieval court jester standing in the center. The jester wears a red and gold motley costume with bells and a three-pointed cap, holding an ornate scepter with a golden bauble. The letter "J" appears in the top-left and bottom-right corners with a small star symbol (★) beneath each J. The word "JOKER" appears in elegant serif lettering at the bottom of the card. The card has an ornate Victorian border with decorative star ornaments in all four corners. Use antique cream parchment texture with sepia tones. Place the card on a solid pure white background.`,

  black: `Generate a traditional Joker playing card design. The card shows a single full-body illustration of a medieval court jester standing in the center. The jester wears a black and silver motley costume with bells and a three-pointed cap, holding an ornate scepter with a silver bauble. The letter "J" appears in the top-left and bottom-right corners with a small star symbol (★) beneath each J. The word "JOKER" appears in elegant serif lettering at the bottom of the card. The card has an ornate Victorian border with decorative star ornaments in all four corners. Use antique cream parchment texture with sepia tones. Place the card on a solid pure white background.`,
};

export const ASSET_CATEGORIES: AssetCategory[] = [
  { id: 'playing-cards', name: 'Playing Cards', icon: '🃏', description: 'Card deck for gambling and duels', count: 54, priority: 'high' },
  { id: 'faction-emblems', name: 'Faction Emblems', icon: '🛡️', description: 'Logos for major factions', count: 6, priority: 'high' },
  { id: 'npc-portraits', name: 'NPC Portraits', icon: '🤠', description: 'Character portraits for NPCs', count: 70, priority: 'high' },
  { id: 'item-icons', name: 'Item Icons', icon: '🔫', description: 'Weapons, armor, consumables', count: 75, priority: 'high' },
  { id: 'building-exteriors', name: 'Building Exteriors', icon: '🏛️', description: 'Town building illustrations', count: 15, priority: 'high' },
  { id: 'location-backgrounds', name: 'Location Backgrounds', icon: '🏜️', description: 'Environment backgrounds', count: 22, priority: 'high' },
  { id: 'animals', name: 'Animals', icon: '🦌', description: 'Huntable wildlife', count: 30, priority: 'medium' },
  { id: 'horse-breeds', name: 'Horse Breeds', icon: '🐴', description: 'Horse illustrations', count: 16, priority: 'medium' },
  { id: 'skill-icons', name: 'Skill Icons', icon: '⚔️', description: 'Ability and skill icons', count: 20, priority: 'medium' },
  { id: 'achievement-badges', name: 'Achievement Badges', icon: '🏆', description: 'Achievement medals', count: 15, priority: 'low' },
  { id: 'weather-overlays', name: 'Weather Overlays', icon: '🌤️', description: 'Weather effect overlays', count: 11, priority: 'medium' },
  { id: 'ui-elements', name: 'UI Elements', icon: '🖼️', description: 'Frames, borders, decorations', count: 10, priority: 'low' },
  { id: 'boss-characters', name: 'Boss Characters', icon: '💀', description: 'Major boss designs', count: 10, priority: 'medium' },
  { id: 'gambling-tables', name: 'Gambling Tables', icon: '🎰', description: 'Table backgrounds', count: 6, priority: 'low' },
  { id: 'cosmic-horror', name: 'Cosmic Horror', icon: '👁️', description: 'End-game eldritch zones', count: 4, priority: 'low' },
];

// Generate all assets
export const generateAllAssets = (): ArtAsset[] => {
  const assets: ArtAsset[] = [];

  // ==================== PLAYING CARDS ====================
  // Card Back
  assets.push({
    id: 'card-back',
    name: 'Card Back Design',
    category: 'playing-cards',
    prompt: `${STYLE_PREFIXES.card}, playing card back, intricate symmetrical Victorian pattern, deep burgundy and antique gold colors, ornate filigree design, vintage 1880s style${CARD_BG_SUFFIX}`,
    priority: 'high',
    difficulty: 'easy',
    status: 'pending',
  });

  // Jokers - single full illustration
  // Use geminiPrompt for Gemini Nano Banana (supports negative constraints to exclude suit symbols)
  // Use prompt for Z Image Turbo (may add suit symbols - post-process if needed)
  assets.push({
    id: 'joker-1',
    name: 'Joker (Red)',
    category: 'playing-cards',
    prompt: `${STYLE_PREFIXES.card}, Joker card, single court jester illustration, medieval fool wearing red and gold motley costume with bells, three-pointed jester cap, holding scepter with bauble, full body standing pose, the word JOKER at bottom, Victorian engraving style${CARD_BG_SUFFIX}`,
    geminiPrompt: GEMINI_JOKER_PROMPTS.red,
    priority: 'high',
    difficulty: 'easy',
    status: 'pending',
  });
  assets.push({
    id: 'joker-2',
    name: 'Joker (Black)',
    category: 'playing-cards',
    prompt: `${STYLE_PREFIXES.card}, Joker card, single court jester illustration, medieval fool wearing black and silver motley costume with bells, three-pointed jester cap, holding scepter with bauble, full body standing pose, the word JOKER at bottom, Victorian engraving style${CARD_BG_SUFFIX}`,
    geminiPrompt: GEMINI_JOKER_PROMPTS.black,
    priority: 'high',
    difficulty: 'easy',
    status: 'pending',
  });

  // Face Cards - traditional style with Victorian elegance
  const faceCards = [
    { rank: 'King', suit: 'Spades' },
    { rank: 'Queen', suit: 'Spades' },
    { rank: 'Jack', suit: 'Spades' },
    { rank: 'King', suit: 'Hearts' },
    { rank: 'Queen', suit: 'Hearts' },
    { rank: 'Jack', suit: 'Hearts' },
    { rank: 'King', suit: 'Diamonds' },
    { rank: 'Queen', suit: 'Diamonds' },
    { rank: 'Jack', suit: 'Diamonds' },
    { rank: 'King', suit: 'Clubs' },
    { rank: 'Queen', suit: 'Clubs' },
    { rank: 'Jack', suit: 'Clubs' },
  ];

  faceCards.forEach(card => {
    const suitSymbol = card.suit === 'Spades' ? '♠' : card.suit === 'Hearts' ? '♥' : card.suit === 'Diamonds' ? '♦' : '♣';
    const suitColor = (card.suit === 'Hearts' || card.suit === 'Diamonds') ? 'red' : 'black';
    assets.push({
      id: `card-${card.rank.toLowerCase()}-${card.suit.toLowerCase()}`,
      name: `${card.rank} of ${card.suit} ${suitSymbol}`,
      category: 'playing-cards',
      subcategory: 'face-cards',
      prompt: `${STYLE_PREFIXES.card}, ${card.rank} of ${card.suit} playing card, traditional double-ended court card design, ${suitColor} ${card.suit.toLowerCase()} suit symbols, elegant Victorian royal figure, classic card proportions${CARD_BG_SUFFIX}`,
      priority: 'high',
      difficulty: 'easy',
      status: 'pending',
    });
  });

  // Number cards (Ace through 10) - standard pip layouts
  const suits = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
  const ranks = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  suits.forEach(suit => {
    ranks.forEach(rank => {
      const suitSymbol = suit === 'Spades' ? '♠' : suit === 'Hearts' ? '♥' : suit === 'Diamonds' ? '♦' : '♣';
      const suitColor = (suit === 'Hearts' || suit === 'Diamonds') ? 'red' : 'black';
      assets.push({
        id: `card-${rank.toLowerCase()}-${suit.toLowerCase()}`,
        name: `${rank} of ${suit} ${suitSymbol}`,
        category: 'playing-cards',
        subcategory: 'number-cards',
        prompt: `${STYLE_PREFIXES.card}, ${rank} of ${suit} playing card, ${suitColor} ${suit.toLowerCase()} pip symbols in standard arrangement, ${rank === 'Ace' ? 'large ornate center pip' : `${rank} pips`}, vintage Victorian style${CARD_BG_SUFFIX}`,
        priority: 'high',
        difficulty: 'easy',
        status: 'pending',
      });
    });
  });

  // ==================== FACTION EMBLEMS ====================
  const factions = [
    { id: 'settler-alliance', name: 'Settler Alliance', theme: 'Blue shield, American eagle clutching arrows, frontier flag elements, silver stars, patriotic frontier' },
    { id: 'nahi-coalition', name: 'Nahi Coalition', theme: 'Green circle, stylized thunderbird, sacred geometry patterns, nature spirits, feathers, turquoise accents' },
    { id: 'frontera-cartel', name: 'Frontera Cartel', theme: 'Red banner, skull wearing sombrero, crossed pistols, rose thorns, blood red and black' },
    { id: 'chinese-diaspora', name: 'Chinese Diaspora', theme: 'Gold medallion, stylized dragon, fortune coins, bamboo elements, jade accents, prosperity symbols' },
    { id: 'us-military', name: 'US Military', theme: 'Brass cavalry insignia, crossed sabers, fort silhouette, military blue and gold, eagle' },
    { id: 'railroad-company', name: 'Railroad Company', theme: 'Black and gold locomotive emblem, iron rails crossing, industrial steam, progress symbol' },
  ];

  factions.forEach(faction => {
    assets.push({
      id: `emblem-${faction.id}`,
      name: faction.name,
      category: 'faction-emblems',
      prompt: `${STYLE_PREFIXES.emblem}, ${faction.theme}, faction emblem, symmetrical design, powerful symbolism`,
      priority: 'high',
      difficulty: 'easy',
      status: 'pending',
    });
  });

  // ==================== NPC PORTRAITS - NAMED ====================
  const namedNpcs = [
    { id: 'kane-blackwood', name: 'Kane Blackwood', desc: 'Grizzled town marshal, silver star badge, weathered face of justice, gray stubble, piercing eyes, leather duster' },
    { id: 'el-rey-martinez', name: 'El Rey Martinez', desc: 'Charismatic cartel king, elegant danger, gold tooth, fine clothes, dangerous smile, scar across cheek' },
    { id: 'elder-wise-sky', name: 'Elder Wise Sky', desc: 'Ancient shaman, wise knowing eyes, ceremonial paint, feathers in gray hair, peaceful power' },
    { id: 'captain-marcus-cross', name: 'Captain Marcus Cross', desc: 'Stern cavalry officer, military bearing, brass buttons, commanding presence, thick mustache' },
    { id: 'the-prophet', name: 'The Prophet', desc: 'Mysterious fortune teller, partially veiled face, supernatural hints in eyes, jewelry, cryptic smile' },
    { id: 'war-chief-red-thunder', name: 'War Chief Red Thunder', desc: 'Fierce warrior leader, war paint, commanding presence, battle scars, feathered headdress' },
    { id: 'silent-rain', name: 'Silent Rain', desc: 'Serene healer, herbs and medicine pouch, Spirit Springs guardian, gentle eyes, healing hands' },
    { id: 'lucky-jack-malone', name: '"Lucky" Jack Malone', desc: 'Slick gambler, card sharp, knowing wink, fancy vest, hidden ace, charming rogue' },
    { id: 'buck-callahan', name: 'Buck Callahan', desc: 'Tough ranch foreman, cattle brand on arm, honest weathered face, working cowboy, dependable' },
    { id: 'big-bill-harrison', name: 'Big Bill Harrison', desc: 'Wealthy mine owner, gold dust on clothes, ruthless success in eyes, expensive hat, imposing' },
    { id: 'samuel-two-gun-wade', name: 'Samuel "Two-Gun" Wade', desc: 'Saloon owner, two pearl-handled revolvers, friendly but dangerous, bartender apron over fine vest' },
    { id: 'the-bone-mother', name: 'The Bone Mother', desc: 'Guardian spirit of the dead, skeletal features showing through translucent skin, ancient and terrible' },
    { id: 'sky-watcher', name: 'Sky-Watcher', desc: 'Guardian shaman of Thunderbird Peak, cloud patterns in eyes, storm energy, sacred duty' },
    { id: 'hank-wheeler', name: 'Hank Wheeler', desc: 'Railroad foreman, soot-stained, muscular, determined builder, railroad spike in hand' },
    { id: 'laughing-coyote', name: 'Laughing Coyote', desc: 'Trickster spirit avatar, shifting features, mischievous grin, coyote ears showing, supernatural' },
  ];

  namedNpcs.forEach(npc => {
    assets.push({
      id: `npc-${npc.id}`,
      name: npc.name,
      category: 'npc-portraits',
      subcategory: 'named',
      prompt: `${STYLE_PREFIXES.character}, ${npc.desc}, 1880s American frontier, portrait composition`,
      priority: 'high',
      difficulty: 'easy',
      status: 'pending',
    });
  });

  // ==================== NPC PORTRAITS - GENERIC TYPES ====================
  const genericNpcs = [
    { id: 'marshal-male', name: 'Marshal (Male)', desc: 'Frontier lawman, silver badge, stern justice, worn boots' },
    { id: 'marshal-female', name: 'Marshal (Female)', desc: 'Female frontier marshal, no-nonsense, badge on vest, rifle ready' },
    { id: 'outlaw-1', name: 'Outlaw (Bandana)', desc: 'Rough outlaw, bandana over face, dangerous eyes, dusty clothes' },
    { id: 'outlaw-2', name: 'Outlaw (Scarred)', desc: 'Scarred bandit, missing teeth, mean expression, wanted look' },
    { id: 'outlaw-3', name: 'Outlaw (Young)', desc: 'Young desperado, cocky expression, eager for trouble, quick draw' },
    { id: 'shopkeeper-male', name: 'Shopkeeper (Male)', desc: 'Friendly merchant, apron, spectacles, welcoming smile, general store' },
    { id: 'shopkeeper-female', name: 'Shopkeeper (Female)', desc: 'Frontier shopkeeper woman, practical dress, kind but shrewd eyes' },
    { id: 'bartender-male', name: 'Bartender (Male)', desc: 'Saloon bartender, waxed mustache, vest and arm garters, polishing glass' },
    { id: 'bartender-female', name: 'Bartender (Female)', desc: 'Saloon barmaid, world-weary wisdom, serving tray, seen it all' },
    { id: 'cavalry-soldier', name: 'Cavalry Soldier', desc: 'US Cavalry trooper, blue uniform, yellow stripe, young and disciplined' },
    { id: 'cavalry-officer', name: 'Cavalry Officer', desc: 'Cavalry lieutenant, blue coat with brass, saber, commanding' },
    { id: 'prospector', name: 'Prospector', desc: 'Grizzled gold miner, pickaxe, wild beard, gold fever in eyes, dusty' },
    { id: 'ranch-hand', name: 'Ranch Hand', desc: 'Working cowboy, lasso coiled, sun-weathered, honest labor' },
    { id: 'saloon-girl', name: 'Saloon Performer', desc: 'Saloon entertainer, feathered dress, stage makeup, confident performer' },
    { id: 'native-warrior', name: 'Native Warrior', desc: 'Coalition brave, war paint, proud bearing, traditional dress with modern weapons' },
    { id: 'native-elder', name: 'Native Elder', desc: 'Wise tribal elder, ceremonial dress, deep wrinkles of wisdom, peace pipe' },
    { id: 'bounty-hunter-male', name: 'Bounty Hunter (Male)', desc: 'Ruthless manhunter, collection of wanted posters, cold calculating eyes' },
    { id: 'bounty-hunter-female', name: 'Bounty Hunter (Female)', desc: 'Female bounty hunter, practical gear, deadly serious, tracker' },
    { id: 'preacher', name: 'Frontier Preacher', desc: 'Fire and brimstone preacher, Bible in hand, wild eyes, black coat' },
    { id: 'doctor', name: 'Frontier Doctor', desc: 'Town doctor, medical bag, blood-stained apron, exhausted but dedicated' },
  ];

  genericNpcs.forEach(npc => {
    assets.push({
      id: `npc-generic-${npc.id}`,
      name: npc.name,
      category: 'npc-portraits',
      subcategory: 'generic',
      prompt: `${STYLE_PREFIXES.character}, ${npc.desc}, 1880s American frontier, portrait composition`,
      priority: 'high',
      difficulty: 'easy',
      status: 'pending',
    });
  });

  // ==================== ITEM ICONS - WEAPONS ====================
  const weapons = [
    { id: 'colt-revolver', name: 'Colt Single Action Revolver', desc: 'iconic six-shooter, pearl handle, blued steel' },
    { id: 'winchester-rifle', name: 'Winchester Lever-Action', desc: 'lever-action rifle, brass receiver, wooden stock' },
    { id: 'double-barrel-shotgun', name: 'Double-Barrel Shotgun', desc: 'side-by-side shotgun, walnut stock, intimidating' },
    { id: 'sawed-off-shotgun', name: 'Sawed-Off Shotgun', desc: 'cut-down shotgun, concealed carry, outlaw weapon' },
    { id: 'hunting-rifle', name: 'Hunting Rifle', desc: 'long-range rifle with scope, precision weapon' },
    { id: 'derringer', name: 'Derringer Pistol', desc: 'tiny concealed pistol, gambler backup, pearl grip' },
    { id: 'bowie-knife', name: 'Bowie Knife', desc: 'large frontier knife, brass guard, leather sheath' },
    { id: 'cavalry-saber', name: 'Cavalry Saber', desc: 'military sword, brass basket hilt, curved blade' },
    { id: 'tomahawk', name: 'Tomahawk', desc: 'traditional throwing axe, decorated handle, sharp blade' },
    { id: 'throwing-knives', name: 'Throwing Knives', desc: 'set of balanced throwing knives, leather roll' },
    { id: 'bow-arrows', name: 'Bow & Arrows', desc: 'Native hunting bow with quiver of arrows' },
    { id: 'dynamite', name: 'Dynamite Bundle', desc: 'sticks of dynamite tied together, fuse visible' },
    { id: 'lasso', name: 'Lasso', desc: 'coiled rope lasso, honda knot, cowboy essential' },
    { id: 'bullwhip', name: 'Bullwhip', desc: 'long leather whip, braided handle, cracking tip' },
    { id: 'brass-knuckles', name: 'Brass Knuckles', desc: 'fighting brass knuckles, worn and dented' },
  ];

  weapons.forEach(weapon => {
    assets.push({
      id: `item-weapon-${weapon.id}`,
      name: weapon.name,
      category: 'item-icons',
      subcategory: 'weapons',
      prompt: `${STYLE_PREFIXES.item}, ${weapon.desc}, 1880s frontier weapon, clean background for game icon`,
      priority: 'high',
      difficulty: 'easy',
      status: 'pending',
    });
  });

  // ==================== ITEM ICONS - ARMOR/CLOTHING ====================
  const armor = [
    { id: 'cowboy-hat', name: 'Cowboy Hat', desc: 'classic wide-brim cowboy hat, leather band' },
    { id: 'cavalry-hat', name: 'Cavalry Hat', desc: 'military campaign hat, brass insignia' },
    { id: 'bowler-hat', name: 'Bowler Hat', desc: 'city-style bowler derby hat, formal' },
    { id: 'sombrero', name: 'Sombrero', desc: 'wide Mexican sombrero, decorated brim' },
    { id: 'duster-coat', name: 'Duster Coat', desc: 'long riding duster coat, weather-worn' },
    { id: 'leather-vest', name: 'Leather Vest', desc: 'frontier leather vest, brass buttons' },
    { id: 'cavalry-jacket', name: 'Cavalry Jacket', desc: 'blue military jacket, yellow trim' },
    { id: 'poncho', name: 'Poncho', desc: 'Mexican serape poncho, colorful stripes' },
    { id: 'chaps', name: 'Leather Chaps', desc: 'cowboy chaps, fringed leather, riding gear' },
    { id: 'riding-boots', name: 'Riding Boots', desc: 'tall leather cowboy boots, pointed toe' },
    { id: 'work-boots', name: 'Work Boots', desc: 'sturdy frontier work boots, worn' },
    { id: 'fancy-boots', name: 'Fancy Boots', desc: 'decorated dress boots, silver tips' },
    { id: 'gun-belt', name: 'Gun Belt', desc: 'leather gun belt with holster, bullets' },
    { id: 'spurs', name: 'Spurs', desc: 'silver riding spurs, jingle-bob' },
    { id: 'bandolier', name: 'Bandolier', desc: 'ammunition bandolier, brass cartridges' },
  ];

  armor.forEach(item => {
    assets.push({
      id: `item-armor-${item.id}`,
      name: item.name,
      category: 'item-icons',
      subcategory: 'armor',
      prompt: `${STYLE_PREFIXES.item}, ${item.desc}, 1880s frontier clothing, clean background for game icon`,
      priority: 'high',
      difficulty: 'easy',
      status: 'pending',
    });
  });

  // ==================== ITEM ICONS - CONSUMABLES ====================
  const consumables = [
    { id: 'health-tonic', name: 'Health Tonic', desc: 'medicine bottle with cork, amber liquid, healing elixir' },
    { id: 'energy-tonic', name: 'Energy Tonic', desc: 'stimulant bottle, green liquid, stamina boost' },
    { id: 'whiskey-bottle', name: 'Whiskey Bottle', desc: 'frontier whiskey bottle, aged brown glass' },
    { id: 'bandages', name: 'Bandages', desc: 'roll of medical bandages, clean white cloth' },
    { id: 'jerky', name: 'Beef Jerky', desc: 'dried meat strips, trail food, leather pouch' },
    { id: 'canned-beans', name: 'Canned Beans', desc: 'tin can of beans, frontier staple food' },
    { id: 'hardtack', name: 'Hardtack Biscuits', desc: 'hard survival biscuits, army rations' },
    { id: 'coffee', name: 'Coffee Beans', desc: 'burlap sack of coffee beans, frontier essential' },
    { id: 'tobacco', name: 'Tobacco Pouch', desc: 'leather tobacco pouch, rolling papers' },
    { id: 'ammo-box', name: 'Ammunition Box', desc: 'wooden ammo crate, brass cartridges visible' },
    { id: 'gun-oil', name: 'Gun Oil', desc: 'small oil can for weapon maintenance' },
    { id: 'lockpicks', name: 'Lockpick Set', desc: 'set of thieves tools, leather roll' },
    { id: 'rope-coil', name: 'Rope Coil', desc: 'coiled hemp rope, utility item' },
    { id: 'lantern', name: 'Oil Lantern', desc: 'frontier oil lantern, brass and glass' },
    { id: 'compass', name: 'Compass', desc: 'brass navigation compass, explorer tool' },
  ];

  consumables.forEach(item => {
    assets.push({
      id: `item-consumable-${item.id}`,
      name: item.name,
      category: 'item-icons',
      subcategory: 'consumables',
      prompt: `${STYLE_PREFIXES.item}, ${item.desc}, 1880s frontier item, clean background for game icon`,
      priority: 'medium',
      difficulty: 'easy',
      status: 'pending',
    });
  });

  // ==================== BUILDING EXTERIORS ====================
  const buildings = [
    { id: 'saloon', name: 'Saloon', desc: 'Western saloon with swinging doors, horses tied outside, SALOON sign, two-story with balcony' },
    { id: 'general-store', name: 'General Store', desc: 'frontier general store, supply barrels on porch, awning, MERCANTILE sign' },
    { id: 'gunsmith', name: 'Gunsmith Shop', desc: 'gunsmith workshop, rifle rack visible in window, GUNS & AMMO sign' },
    { id: 'bank', name: 'Bank', desc: 'sturdy brick bank building, iron vault door visible, BANK sign, security' },
    { id: 'sheriff-office', name: 'Sheriff Office', desc: 'sheriff office with jail, barred windows, wanted posters, SHERIFF sign' },
    { id: 'hotel', name: 'Hotel', desc: 'two-story frontier hotel, balcony with railings, HOTEL sign' },
    { id: 'stable', name: 'Livery Stable', desc: 'large stable barn, hay bales, horse visible, LIVERY sign' },
    { id: 'blacksmith', name: 'Blacksmith', desc: 'blacksmith forge, anvil outside, smoke from chimney, horseshoe sign' },
    { id: 'church', name: 'Church', desc: 'wooden frontier church, steeple with bell, cross on top' },
    { id: 'railroad-station', name: 'Railroad Station', desc: 'train depot platform, railroad tracks, water tower, DEPOT sign' },
    { id: 'trading-post', name: 'Trading Post', desc: 'frontier trading post, furs and native crafts displayed, rustic' },
    { id: 'cantina', name: 'Cantina', desc: 'Mexican-style cantina, terracotta tiles, colorful, CANTINA sign' },
    { id: 'mine-entrance', name: 'Mine Entrance', desc: 'mine shaft entrance, timber supports, ore cart on tracks' },
    { id: 'ranch-house', name: 'Ranch House', desc: 'frontier ranch homestead, windmill, corral fence, cattle' },
    { id: 'military-barracks', name: 'Military Barracks', desc: 'military fort barracks, American flag, regimented, palisade wall' },
  ];

  buildings.forEach(building => {
    assets.push({
      id: `building-${building.id}`,
      name: building.name,
      category: 'building-exteriors',
      prompt: `${STYLE_PREFIXES.building}, ${building.desc}, 3/4 view angle, consistent with frontier town aesthetic`,
      priority: 'high',
      difficulty: 'easy',
      status: 'pending',
    });
  });

  // ==================== LOCATION BACKGROUNDS ====================
  const locations = [
    { id: 'red-gulch', name: 'Red Gulch', desc: 'canyon town nestled in red rock walls, main street visible, dusty frontier settlement' },
    { id: 'fort-ashford', name: 'Fort Ashford', desc: 'wooden palisade military fort, cavalry flags, organized military outpost' },
    { id: 'the-frontera', name: 'The Frontera', desc: 'lawless border town, Mexican influence, Rio Sangre visible, outlaw haven' },
    { id: 'whiskey-bend', name: 'Whiskey Bend', desc: 'railroad boom town, multiple saloons, train tracks, vice and gambling' },
    { id: 'kaiowa-mesa', name: 'Kaiowa Mesa', desc: 'sacred plateau 800ft elevation, indigenous sacred site, spiritual atmosphere' },
    { id: 'spirit-springs', name: 'Spirit Springs', desc: 'mystical hot springs, steam rising, healing waters, sacred neutral ground' },
    { id: 'thunderbirds-perch', name: "Thunderbird's Perch", desc: 'mountain peak at 10500ft, clouds swirling, lightning, sacred peak' },
    { id: 'goldfingers-mine', name: "Goldfinger's Mine", desc: 'haunted gold mine entrance, ghostly glow, abandoned equipment, eerie' },
    { id: 'sangre-canyon', name: 'Sangre Canyon', desc: '30-mile red rock canyon, Rio Sangre river flowing, dramatic cliffs' },
    { id: 'longhorn-ranch', name: 'Longhorn Ranch', desc: 'vast cattle ranch, prairie grassland, herd of longhorns, ranch buildings' },
    { id: 'dusty-trail', name: 'Dusty Trail', desc: 'main stagecoach route, way station visible, desert road stretching' },
    { id: 'dead-mans-stretch', name: "Dead Man's Stretch", desc: 'treacherous canyon pass, narrow path, vultures circling, dangerous' },
    { id: 'the-badlands', name: 'The Badlands', desc: 'volcanic desolation, sulfur vents steaming, cracked earth, hostile' },
    { id: 'the-wastes', name: 'The Wastes', desc: 'lawless desert wasteland, raider camps in distance, harsh sun' },
    { id: 'echo-caves', name: 'Echo Caves', desc: 'prophetic cave system entrance, mysterious acoustics, ancient drawings' },
    { id: 'whispering-stones', name: 'Whispering Stones', desc: 'ancient stone circle, 7 standing stones, mystical energy, twilight' },
    { id: 'bone-garden', name: 'Bone Garden', desc: 'ancient burial site, thousands of grave cairns, solemn, sacred' },
    { id: 'smugglers-den', name: "Smuggler's Den", desc: 'hidden cave hideout, contraband visible, secret entrance' },
    { id: 'coyotes-crossroads', name: "Coyote's Crossroads", desc: 'lonely frontier crossroads, trickster energy, multiple paths' },
    { id: 'sacred-springs', name: 'Sacred Springs', desc: 'hidden Coalition initiation site, clear water, ceremonial elements' },
    { id: 'the-scar', name: 'The Scar', desc: 'massive cosmic fissure, purple eldritch energy, reality distortion, forbidden' },
    { id: 'railroad-wound', name: 'The Railroad Wound', desc: 'ghost train tracks through sacred land, spectral locomotive visible' },
  ];

  locations.forEach(location => {
    assets.push({
      id: `location-${location.id}`,
      name: location.name,
      category: 'location-backgrounds',
      prompt: `${STYLE_PREFIXES.location}, ${location.desc}, panoramic 16:9 aspect ratio, atmospheric depth`,
      priority: 'high',
      difficulty: 'moderate',
      status: 'pending',
    });
  });

  // ==================== ANIMALS ====================
  const animals = [
    // Small game
    { id: 'rabbit', name: 'Cottontail Rabbit', desc: 'prairie cottontail rabbit, alert ears, brown fur', category: 'small' },
    { id: 'prairie-dog', name: 'Prairie Dog', desc: 'prairie dog standing upright, alert pose, sandy fur', category: 'small' },
    { id: 'squirrel', name: 'Ground Squirrel', desc: 'western ground squirrel, bushy tail, foraging', category: 'small' },
    { id: 'raccoon', name: 'Raccoon', desc: 'masked raccoon, striped tail, clever eyes', category: 'small' },
    { id: 'armadillo', name: 'Armadillo', desc: 'nine-banded armadillo, armored shell, desert creature', category: 'small' },
    // Birds
    { id: 'wild-turkey', name: 'Wild Turkey', desc: 'wild turkey with colorful plumage, proud stance', category: 'birds' },
    { id: 'pheasant', name: 'Ring-necked Pheasant', desc: 'colorful pheasant, long tail feathers, game bird', category: 'birds' },
    { id: 'bald-eagle', name: 'Bald Eagle', desc: 'majestic bald eagle, white head, powerful wingspan', category: 'birds' },
    { id: 'vulture', name: 'Turkey Vulture', desc: 'circling vulture, red head, ominous, scavenger', category: 'birds' },
    // Medium predators
    { id: 'coyote', name: 'Coyote', desc: 'prairie coyote, tan fur, alert hunter, howling pose', category: 'predator' },
    { id: 'red-fox', name: 'Red Fox', desc: 'red fox, white-tipped tail, cunning expression', category: 'predator' },
    { id: 'badger', name: 'Badger', desc: 'fierce badger, striped face, muscular, digging claws', category: 'predator' },
    { id: 'rattlesnake', name: 'Diamondback Rattlesnake', desc: 'coiled rattlesnake, diamond pattern, rattle raised, dangerous', category: 'predator' },
    // Large game
    { id: 'whitetail-deer', name: 'White-Tailed Deer', desc: 'graceful whitetail buck, antlers, alert in forest', category: 'large' },
    { id: 'mule-deer', name: 'Mule Deer', desc: 'mule deer with large ears, desert adapted', category: 'large' },
    { id: 'pronghorn', name: 'Pronghorn Antelope', desc: 'swift pronghorn, distinctive horns, prairie runner', category: 'large' },
    { id: 'wild-boar', name: 'Wild Boar', desc: 'aggressive wild boar, tusks, bristly fur, dangerous', category: 'large' },
    { id: 'elk', name: 'Bull Elk', desc: 'majestic bull elk, massive antlers, bugling pose', category: 'large' },
    { id: 'bighorn-sheep', name: 'Bighorn Sheep', desc: 'mountain bighorn ram, curved horns, rocky terrain', category: 'large' },
    // Dangerous predators
    { id: 'black-bear', name: 'Black Bear', desc: 'American black bear, powerful stance, forest setting', category: 'dangerous' },
    { id: 'grizzly-bear', name: 'Grizzly Bear', desc: 'massive grizzly bear, silver-tipped fur, fearsome', category: 'dangerous' },
    { id: 'mountain-lion', name: 'Mountain Lion', desc: 'stalking cougar, tawny coat, predator eyes, muscular', category: 'dangerous' },
    { id: 'gray-wolf', name: 'Gray Wolf', desc: 'gray wolf, pack leader presence, intelligent eyes', category: 'dangerous' },
    { id: 'bison', name: 'American Bison', desc: 'massive bison, shaggy mane, powerful, iconic western', category: 'dangerous' },
    // Legendary
    { id: 'old-red', name: 'Old Red (Demon Bear)', desc: 'crimson-scarred legendary grizzly, supernatural red eyes, massive scars, terror of the frontier', category: 'legendary' },
    { id: 'white-elk', name: 'White Elk (Spectral)', desc: 'ghostly white elk, ethereal glow, spirit animal, translucent', category: 'legendary' },
    { id: 'phantom-coyote', name: 'Phantom Coyote', desc: 'supernatural trickster coyote, shifting form, mischievous, spirit', category: 'legendary' },
    { id: 'ancient-bison', name: 'Ancient Bison', desc: 'last great herd leader, scarred veteran, enormous, wise', category: 'legendary' },
    { id: 'shadow-wolf', name: 'Shadow Wolf', desc: 'pack alpha, black as night, supernatural presence, fear', category: 'legendary' },
    { id: 'sacred-puma', name: 'Sacred Puma', desc: 'mountain guardian spirit, golden coat, supernatural protector', category: 'legendary' },
  ];

  animals.forEach(animal => {
    assets.push({
      id: `animal-${animal.id}`,
      name: animal.name,
      category: 'animals',
      subcategory: animal.category,
      prompt: `${STYLE_PREFIXES.animal}, ${animal.desc}, natural habitat, Western American frontier wildlife`,
      priority: animal.category === 'legendary' ? 'high' : 'medium',
      difficulty: animal.category === 'legendary' ? 'moderate' : 'easy',
      status: 'pending',
    });
  });

  // ==================== HORSE BREEDS ====================
  const horses = [
    { id: 'quarter-horse', name: 'Quarter Horse', desc: 'muscular quarter horse, versatile working horse, sorrel coat' },
    { id: 'mustang', name: 'Mustang', desc: 'wild mustang, untamed spirit, paint markings, frontier freedom' },
    { id: 'paint-horse', name: 'Paint Horse', desc: 'beautiful paint horse, pinto markings, flashy coat pattern' },
    { id: 'arabian', name: 'Arabian', desc: 'elegant Arabian horse, dished face, high tail carriage, grace' },
    { id: 'thoroughbred', name: 'Thoroughbred', desc: 'racing thoroughbred, sleek build, speed and power, bay coat' },
    { id: 'morgan', name: 'Morgan Horse', desc: 'sturdy Morgan horse, compact powerful build, versatile' },
    { id: 'appaloosa', name: 'Appaloosa', desc: 'spotted Appaloosa, leopard pattern, Native American horse' },
    { id: 'belgian-draft', name: 'Belgian Draft', desc: 'massive Belgian draft horse, powerful workhorse, feathered feet' },
  ];

  // Horse color variants available: Bay, Chestnut, Palomino, Buckskin, Black, Gray, Roan, Dun
  horses.forEach(horse => {
    // Base breed
    assets.push({
      id: `horse-${horse.id}`,
      name: horse.name,
      category: 'horse-breeds',
      prompt: `${STYLE_PREFIXES.animal}, ${horse.desc}, proud stance, Western ranch setting, full body profile`,
      priority: 'medium',
      difficulty: 'moderate',
      status: 'pending',
    });
  });

  // ==================== SKILL ICONS ====================
  const skills = [
    { id: 'gunslinger', name: 'Gunslinger', desc: 'smoking revolver, quick draw, deadly aim' },
    { id: 'brawler', name: 'Brawler', desc: 'raised fists, fighting stance, bare knuckle' },
    { id: 'marksman', name: 'Marksman', desc: 'rifle scope crosshairs, precision targeting' },
    { id: 'duelist', name: 'Duelist', desc: 'two crossed pistols, honor duel, showdown' },
    { id: 'lockpicking', name: 'Lockpicking', desc: 'lockpick in keyhole, thief skill, stealth' },
    { id: 'stealth', name: 'Stealth', desc: 'shadow silhouette, sneaking figure, hidden' },
    { id: 'disguise', name: 'Disguise', desc: 'theatrical mask, identity change, deception' },
    { id: 'pickpocket', name: 'Pickpocket', desc: 'nimble fingers, wallet grab, sleight of hand' },
    { id: 'charm', name: 'Charm', desc: 'winning smile, hearts, charisma effect' },
    { id: 'intimidation', name: 'Intimidation', desc: 'fierce glare, fear effect, domination' },
    { id: 'bribery', name: 'Bribery', desc: 'coin purse, palm grease, corruption' },
    { id: 'persuasion', name: 'Persuasion', desc: 'speech bubble, convincing, negotiation' },
    { id: 'blacksmith', name: 'Blacksmithing', desc: 'hammer and anvil, forge fire, metalwork' },
    { id: 'leatherwork', name: 'Leatherworking', desc: 'leather hide, stitching awl, tanning' },
    { id: 'alchemy', name: 'Alchemy', desc: 'bubbling potion, mystical flask, brewing' },
    { id: 'hunting', name: 'Hunting', desc: 'rifle with scope, deer tracks, wilderness' },
    { id: 'tracking', name: 'Tracking', desc: 'footprints trail, magnifying glass, following' },
    { id: 'riding', name: 'Riding', desc: 'horseshoe, saddle, equestrian mastery' },
    { id: 'gambling', name: 'Gambling', desc: 'dice and cards, lucky streak, chance' },
    { id: 'medicine', name: 'Medicine', desc: 'healing herbs, bandages, medical cross' },
  ];

  skills.forEach(skill => {
    assets.push({
      id: `skill-${skill.id}`,
      name: skill.name,
      category: 'skill-icons',
      prompt: `${STYLE_PREFIXES.item}, skill icon, ${skill.desc}, circular badge format, bold symbolism, game ability icon`,
      priority: 'medium',
      difficulty: 'easy',
      status: 'pending',
    });
  });

  // ==================== ACHIEVEMENT BADGES ====================
  const achievements = [
    { id: 'first-blood', name: 'First Blood', desc: 'combat skull with blood drop, first kill achievement' },
    { id: 'sharpshooter', name: 'Sharpshooter', desc: 'bullseye target, perfect accuracy, precision medal' },
    { id: 'wealthy', name: 'Wealthy', desc: 'pile of gold coins, prosperity, riches achievement' },
    { id: 'property-owner', name: 'Property Owner', desc: 'house deed, land ownership, establishment' },
    { id: 'gang-leader', name: 'Gang Leader', desc: 'crown over crossed pistols, leadership, authority' },
    { id: 'explorer', name: 'Explorer', desc: 'compass and map, discovery, wanderer' },
    { id: 'trader', name: 'Master Trader', desc: 'handshake over coins, commerce, dealing' },
    { id: 'craftsman', name: 'Master Craftsman', desc: 'hammer and gear, creation, artisan' },
    { id: 'hunter', name: 'Legendary Hunter', desc: 'mounted trophy head, hunting prowess' },
    { id: 'gambler', name: 'High Roller', desc: 'royal flush cards, gambling master' },
    { id: 'outlaw', name: 'Notorious Outlaw', desc: 'wanted poster, infamous, criminal fame' },
    { id: 'hero', name: 'Frontier Hero', desc: 'silver star badge, heroism, justice' },
    { id: 'survivor', name: 'Survivor', desc: 'phoenix rising, endurance, persistence' },
    { id: 'veteran', name: 'Grizzled Veteran', desc: 'crossed sabers, military service, experience' },
    { id: 'legend', name: 'Living Legend', desc: 'golden laurel wreath, ultimate achievement, fame' },
  ];

  achievements.forEach(achievement => {
    assets.push({
      id: `achievement-${achievement.id}`,
      name: achievement.name,
      category: 'achievement-badges',
      prompt: `${STYLE_PREFIXES.emblem}, achievement badge, ${achievement.desc}, medal format, prestigious, collectible badge design`,
      priority: 'low',
      difficulty: 'easy',
      status: 'pending',
    });
  });

  // ==================== WEATHER OVERLAYS ====================
  const weather = [
    { id: 'clear-day', name: 'Clear Day', desc: 'bright sunny sky, golden sunlight, blue sky, perfect visibility' },
    { id: 'clear-night', name: 'Clear Night', desc: 'starry night sky, full moon, peaceful darkness, stars visible' },
    { id: 'cloudy', name: 'Cloudy', desc: 'overcast gray clouds, muted light, threatening sky' },
    { id: 'sandstorm', name: 'Sandstorm', desc: 'swirling sand particles, reduced visibility, desert storm, orange haze' },
    { id: 'dust-storm', name: 'Dust Storm', desc: 'dust devil, brown particles, choking dust, frontier hazard' },
    { id: 'heat-wave', name: 'Heat Wave', desc: 'shimmer effect, intense sun, heat distortion, scorching' },
    { id: 'rain', name: 'Rainstorm', desc: 'falling rain streaks, puddles, gray wet atmosphere' },
    { id: 'fog', name: 'Dense Fog', desc: 'thick fog, limited visibility, mysterious, eerie white mist' },
    { id: 'thunderstorm', name: 'Thunderstorm', desc: 'lightning bolts, dark clouds, heavy rain, dramatic storm' },
    { id: 'supernatural-mist', name: 'Supernatural Mist', desc: 'purple-tinted fog, eldritch energy, reality distortion, cosmic' },
    { id: 'blizzard', name: 'Blizzard', desc: 'driving snow, white-out conditions, freezing cold, winter storm' },
  ];

  weather.forEach(w => {
    assets.push({
      id: `weather-${w.id}`,
      name: w.name,
      category: 'weather-overlays',
      prompt: `Weather overlay effect, ${w.desc}, semi-transparent, atmospheric screen effect, 16:9 aspect ratio, suitable for game UI overlay`,
      priority: 'medium',
      difficulty: 'moderate',
      status: 'pending',
    });
  });

  // ==================== UI ELEMENTS ====================
  const uiElements = [
    { id: 'wood-frame', name: 'Wood Frame Border', desc: 'rustic wooden frame border, aged wood texture, western decor' },
    { id: 'leather-frame', name: 'Leather Frame Border', desc: 'tooled leather border, stitched edges, western saddle style' },
    { id: 'rope-border', name: 'Rope Border', desc: 'twisted rope border, lasso style, cowboy decoration' },
    { id: 'wanted-poster', name: 'Wanted Poster Template', desc: 'blank wanted poster, aged paper, torn edges, WANTED header' },
    { id: 'telegram', name: 'Telegram Paper', desc: 'telegram message paper, WESTERN UNION style header, typed text area' },
    { id: 'parchment', name: 'Parchment Scroll', desc: 'aged parchment paper, rolled edges, quest document style' },
    { id: 'compass-rose', name: 'Compass Rose', desc: 'ornate compass rose, navigation element, map decoration, cardinal directions' },
    { id: 'bullet-holes', name: 'Bullet Hole Decoration', desc: 'scattered bullet holes, wood splintering, action decoration' },
    { id: 'western-divider', name: 'Western Divider', desc: 'decorative horizontal divider, western motifs, scrollwork' },
    { id: 'brand-iron', name: 'Brand Iron Symbol', desc: 'cattle brand mark, burned into wood, ownership mark' },
  ];

  uiElements.forEach(element => {
    assets.push({
      id: `ui-${element.id}`,
      name: element.name,
      category: 'ui-elements',
      prompt: `UI design element, ${element.desc}, clean edges, suitable for game interface, transparent or clean background`,
      priority: 'low',
      difficulty: 'easy',
      status: 'pending',
    });
  });

  // ==================== BOSS CHARACTERS ====================
  const bosses = [
    { id: 'el-rey', name: 'El Rey Martinez (Boss)', desc: 'Cartel King final form, ornate golden pistols, cape, scar, dangerous elegance, throne of bones' },
    { id: 'warden-perdition', name: 'Warden of Perdition', desc: 'demonic prison warden, chains and keys, hellfire eyes, tortured souls, supernatural jailer' },
    { id: 'el-carnicero', name: 'El Carnicero (The Butcher)', desc: 'massive butcher outlaw, blood-stained apron, meat cleaver, terrifying brute' },
    { id: 'pale-rider', name: 'The Pale Rider', desc: 'skeletal horseman, pale horse, death incarnate, ghostly presence, scythe' },
    { id: 'wendigo', name: 'The Wendigo', desc: 'gaunt antlered monster, starving horror, Native legend, cannibal spirit, frozen terror' },
    { id: 'general-sangre', name: 'General Sangre', desc: 'blood-soaked military commander, corrupt officer, medals and gore, battlefield horror' },
    { id: 'the-maw', name: 'The Maw', desc: 'cosmic tentacled horror, devourer of worlds, eldritch abomination, multiple eyes, reality tear' },
    { id: 'the-devourer', name: 'The Devourer', desc: 'final cosmic boss, massive entity, consumption incarnate, ultimate horror, void creature' },
    { id: 'what-waits-below', name: 'What-Waits-Below', desc: 'dormant cosmic entity, underground horror, ancient evil, sleeping god, impossible geometry' },
    { id: 'corrupted-shaman', name: 'Corrupted Shaman', desc: 'twisted medicine man, dark spirits, corruption visible, fallen healer, nightmare magic' },
  ];

  bosses.forEach(boss => {
    assets.push({
      id: `boss-${boss.id}`,
      name: boss.name,
      category: 'boss-characters',
      prompt: `${STYLE_PREFIXES.character}, boss character design, ${boss.desc}, intimidating presence, full body, dramatic lighting, dangerous`,
      priority: 'medium',
      difficulty: 'moderate',
      status: 'pending',
    });
  });

  // ==================== GAMBLING TABLES ====================
  const gamblingTables = [
    { id: 'blackjack', name: 'Blackjack Table', desc: 'green felt blackjack table, card positions marked, saloon setting' },
    { id: 'poker', name: 'Poker Table', desc: 'round poker table, velvet felt, chip positions, saloon atmosphere' },
    { id: 'roulette', name: 'Roulette Table', desc: 'roulette wheel and betting board, red and black, spinning wheel' },
    { id: 'craps', name: 'Craps Table', desc: 'craps table layout, dice area, betting zones, felt surface' },
    { id: 'faro', name: 'Faro Table', desc: 'faro card layout, spade suit, Old West gambling, historic' },
    { id: 'wheel-fortune', name: 'Wheel of Fortune', desc: 'carnival wheel of fortune, prize segments, spinning wheel, saloon game' },
  ];

  gamblingTables.forEach(table => {
    assets.push({
      id: `gambling-${table.id}`,
      name: table.name,
      category: 'gambling-tables',
      prompt: `Gambling table design, ${table.desc}, top-down view, Western saloon style, 16:9 aspect ratio, game background`,
      priority: 'low',
      difficulty: 'moderate',
      status: 'pending',
    });
  });

  // ==================== COSMIC HORROR ZONES ====================
  const cosmicZones = [
    { id: 'outer-waste', name: 'The Outer Waste', desc: 'corrupted frontier zone, purple-tinted sky, twisted vegetation, reality distortion, level 30-32 area' },
    { id: 'bleeding-heart', name: 'The Bleeding Heart', desc: 'organic horror landscape, pulsing flesh walls, biological nightmare, corruption center' },
    { id: 'hollow-spiral', name: 'The Hollow Spiral', desc: 'impossible geometry, reality breakdown, Lovecraftian architecture, sanity-affecting visuals' },
    { id: 'the-mouth', name: 'The Mouth', desc: 'entity literal form, cosmic maw, maximum horror, final zone, consumption incarnate' },
  ];

  cosmicZones.forEach(zone => {
    assets.push({
      id: `cosmic-${zone.id}`,
      name: zone.name,
      category: 'cosmic-horror',
      prompt: `Eldritch horror landscape, ${zone.desc}, Lovecraftian cosmic horror meets Western frontier, unsettling atmosphere, panoramic 16:9`,
      priority: 'low',
      difficulty: 'hard',
      status: 'pending',
    });
  });

  return assets;
};

// Pre-generate all assets
export const ALL_ASSETS: ArtAsset[] = generateAllAssets();

// Helper to get assets by category
export const getAssetsByCategory = (categoryId: string): ArtAsset[] => {
  return ALL_ASSETS.filter(asset => asset.category === categoryId);
};

// Helper to get category stats
export const getCategoryStats = (categoryId: string) => {
  const assets = getAssetsByCategory(categoryId);
  return {
    total: assets.length,
    pending: assets.filter(a => a.status === 'pending').length,
    uploaded: assets.filter(a => a.status === 'uploaded').length,
    integrated: assets.filter(a => a.status === 'integrated').length,
  };
};

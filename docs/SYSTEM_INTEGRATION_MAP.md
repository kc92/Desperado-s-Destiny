# System Integration Map
## Logical Architecture & Data Flow

This document maps the connections between Frontend Components, State Management (Zustand), and Backend Services. Use this as a reference when implementing new features to ensure consistency.

---

## 1. Core Architecture

The application uses a **Hybrid Communication Model**:
*   **REST API (HTTP):** Used for transactional actions (Create Character, Buy Item, Attack).
*   **WebSockets (Socket.io):** Used for real-time updates (Chat, Gang War Status, Notifications).

### Data Flow Pattern
1.  **UI Component** triggers Action (e.g., `AttackButton`).
2.  **Zustand Store** (`useCombatStore`) calls **API Service** (`combat.service.ts`).
3.  **API Service** sends `POST /api/combat/turn`.
4.  **Backend Controller** (`combat.controller.ts`) processes logic via `CombatService`.
5.  **Backend** updates DB and returns `CombatResult`.
6.  **Store** updates local state with result.
7.  *(Optional)* **Backend Socket** emits `combat:update` to room if multiplayer.

---

## 2. Feature Integration Maps

### ⚔️ Combat System (PvE/PvP)
*   **Frontend Store:** `client/src/store/useCombatStore.ts`
*   **Backend Service:** `server/src/services/combat.service.ts`
*   **Database Model:** `CombatEncounter` (Ephemeral), `Character` (Persistent)

| Action | Frontend Trigger | API Endpoint | Socket Event | Shared Type |
| :--- | :--- | :--- | :--- | :--- |
| **Start Fight** | `startCombat(npcId)` | `POST /api/combat/start` | - | `CombatState` |
| **Play Card** | `playTurn(cards)` | `POST /api/combat/turn/:id` | - | `CombatResult` |
| **Flee** | `fleeCombat()` | `POST /api/combat/flee/:id` | - | - |
| **PvP Update** | - | - | `duel:update` | `DuelState` |

**⚠️ Known Issue:** The frontend calls `/api/combat/:id/flee` but backend expects `/api/combat/flee/:id`. Needs fix in Phase 3.

### 👤 Character & Progression
*   **Frontend Store:** `client/src/store/useCharacterStore.ts`
*   **Backend Service:** `server/src/services/character.service.ts`

| Action | Frontend Trigger | API Endpoint | Socket Event | Shared Type |
| :--- | :--- | :--- | :--- | :--- |
| **Create** | `createCharacter(...)` | `POST /api/characters` | - | `Character` |
| **Select** | `selectCharacter(id)` | `PATCH /api/characters/:id/select` | `character:join` | - |
| **Level Up** | - | - | `character:levelup` | `LevelUpPayload` |
| **Reputation** | - | - | `reputation:update` | `ReputationUpdate` |

### 💬 Social & Gangs
*   **Frontend Store:** `client/src/store/useChatStore.ts` / `useGangStore.ts`
*   **Backend Socket:** `server/src/socket/index.ts`

| Action | Frontend Trigger | API Endpoint | Socket Event | Shared Type |
| :--- | :--- | :--- | :--- | :--- |
| **Send Chat** | `sendMessage(msg)` | - | `chat:message` | `ChatMessage` |
| **Create Gang** | `createGang(name)` | `POST /api/gangs` | - | `Gang` |
| **Territory** | - | - | `territory:update` | `TerritoryState` |
| **War Status** | - | - | `war:update` | `WarStatus` |

### 💰 Economy (Marketplace)
*   **Frontend Store:** `client/src/store/useMarketplaceStore.ts`
*   **Backend Service:** `server/src/services/marketplace.service.ts`

| Action | Frontend Trigger | API Endpoint | Socket Event | Shared Type |
| :--- | :--- | :--- | :--- | :--- |
| **List Item** | `createListing(...)` | `POST /api/market` | - | `Listing` |
| **Buy Item** | `buyNow(id)` | `POST /api/market/:id/buy` | - | `Transaction` |
| **Sold Notif** | - | - | `market:sold` | `SaleNotification` |

---

## 3. Planned Integrations (Roadmap)

These new systems must follow the established pattern.

### ⚒️ Profession Engine (Phase 2)
*   **Store:** `useCharacterStore` (Expand `skills` slice)
*   **Endpoint:** `POST /api/profession/gather`
    *   **Input:** `{ nodeId, toolId }`
    *   **Output:** `{ success: boolean, loot: Item[], xp: number }`
*   **Socket:** `energy:update` (Triggered by server side cost).

### ⚔️ Frontier War (Phase 2.9)
*   **Store:** `useGangStore` (Add `war` slice)
*   **Endpoint:** `POST /api/war/declare`
*   **Socket:** `war:declared` (Global broadcast to Sector).

---

## 4. Critical Shared Types
Defined in `shared/src/types/`:
*   `item.types.ts`: Base definition for all Inventory items.
*   `combat.types.ts`: Poker hand structures and Combat states.
*   `socket.types.ts`: Typed definitions for all Socket.io payloads.

**Rule:** Never hardcode strings or types. Always import from `@desperados/shared`.
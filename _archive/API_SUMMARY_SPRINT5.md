# Sprint 5 API Summary
## Social Features - Complete Endpoint Documentation

**Version:** 1.0.0
**Sprint:** Sprint 5
**Date:** 2025-11-16

---

## Overview

Sprint 5 added **50+ new endpoints** across 7 feature domains:
1. Chat System (4 endpoints + Socket events)
2. Gang System (9 endpoints)
3. Territory System (5 endpoints)
4. Gang Wars (1 endpoint)
5. Mail System (6 endpoints)
6. Friend System (6 endpoints)
7. Notification System (4 endpoints)

**Total New Endpoints:** 35 REST + 15+ Socket.io events

---

## Authentication

All endpoints (except health checks) require JWT authentication.

**Headers:**
```
Authorization: Bearer <jwt-token>
X-Character-ID: <character-id>
```

---

## Chat System

### REST Endpoints

#### Send Message
```http
POST /api/chat/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomType": "GLOBAL" | "FACTION" | "GANG" | "WHISPER",
  "roomId": "string",
  "content": "string (max 500 chars)",
  "recipientId": "string (whisper only)"
}

Response 201:
{
  "success": true,
  "data": {
    "_id": "string",
    "senderId": "string",
    "senderName": "string",
    "roomType": "GLOBAL",
    "roomId": "string",
    "content": "string",
    "timestamp": "2025-11-16T20:00:00.000Z",
    "isSystemMessage": false
  }
}
```

#### Get Message History
```http
GET /api/chat/messages/:roomType/:roomId?limit=50&offset=0
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "senderId": "string",
      "senderName": "string",
      "content": "string",
      "timestamp": "2025-11-16T20:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Delete Message (Admin Only)
```http
DELETE /api/chat/messages/:id
Authorization: Bearer <token>
X-Admin-Role: required

Response 200:
{
  "success": true,
  "message": "Message deleted successfully"
}
```

#### Get Available Rooms
```http
GET /api/chat/rooms
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "global": {
      "id": "global",
      "name": "Global Chat",
      "type": "GLOBAL"
    },
    "faction": {
      "id": "FRONTERA",
      "name": "Frontera Chat",
      "type": "FACTION"
    },
    "gang": {
      "id": "gang-id",
      "name": "Gang Name",
      "type": "GANG"
    }
  }
}
```

### Socket.io Events

**Connect:**
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'jwt-token' }
});
```

**Join Character Room:**
```javascript
socket.emit('character:join', characterId);

socket.on('character:joined', (data) => {
  // { characterId, room, message }
});
```

**Send Message:**
```javascript
socket.emit('message:send', {
  roomType: 'GLOBAL',
  roomId: 'global',
  content: 'Hello world!'
});
```

**Receive Message:**
```javascript
socket.on('message:new', (message) => {
  // { _id, senderId, senderName, content, timestamp, ... }
});
```

**Typing Indicator:**
```javascript
socket.emit('user:typing', { roomId: 'global' });

socket.on('user:typing', (data) => {
  // { userId, userName, roomId }
});
```

**Online Status:**
```javascript
socket.on('user:online', (data) => {
  // { userId, characterId }
});

socket.on('user:offline', (data) => {
  // { userId, characterId }
});
```

---

## Gang System

### Create Gang
```http
POST /api/gangs
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string (3-30 chars, unique)",
  "tag": "string (2-6 chars, unique)",
  "description": "string (max 500 chars)"
}

Requirements:
- 2000 gold
- Level 10+
- Not in another gang

Response 201:
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "string",
    "tag": "string",
    "description": "string",
    "leaderId": "character-id",
    "members": [{
      "characterId": "character-id",
      "role": "LEADER",
      "joinedAt": "2025-11-16T20:00:00.000Z"
    }],
    "bank": {
      "gold": 0,
      "capacity": 10000
    },
    "upgrades": [],
    "stats": {
      "level": 1,
      "experience": 0,
      "wins": 0,
      "losses": 0,
      "territoriesOwned": 0
    },
    "createdAt": "2025-11-16T20:00:00.000Z"
  }
}
```

### Get Gang Details
```http
GET /api/gangs/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    // Full gang object with populated member details
  }
}
```

### Invite Member (Officer+)
```http
POST /api/gangs/:id/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "characterId": "string"
}

Permissions: LEADER, OFFICER

Response 200:
{
  "success": true,
  "message": "Invitation sent"
}
```

### Kick Member (Officer+)
```http
POST /api/gangs/:id/kick
Authorization: Bearer <token>
Content-Type: application/json

{
  "characterId": "string"
}

Permissions: LEADER, OFFICER (cannot kick leader/officers)

Response 200:
{
  "success": true,
  "message": "Member kicked successfully"
}
```

### Promote Member (Leader Only)
```http
POST /api/gangs/:id/promote
Authorization: Bearer <token>
Content-Type: application/json

{
  "characterId": "string",
  "role": "OFFICER" | "MEMBER"
}

Permissions: LEADER only

Response 200:
{
  "success": true,
  "data": {
    // Updated gang with new member roles
  }
}
```

### Deposit Gold
```http
POST /api/gangs/:id/bank/deposit
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000
}

Requirements:
- Have sufficient gold
- Be gang member

Response 200:
{
  "success": true,
  "data": {
    "newBalance": 5000,
    "bankBalance": 15000
  }
}
```

### Withdraw Gold (Leader+)
```http
POST /api/gangs/:id/bank/withdraw
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000,
  "reason": "Buying upgrades"
}

Permissions: LEADER only

Response 200:
{
  "success": true,
  "data": {
    "newBalance": 3000,
    "bankBalance": 14000
  }
}
```

### Purchase Upgrade
```http
POST /api/gangs/:id/upgrades/:upgradeId
Authorization: Bearer <token>

Permissions: LEADER only

Upgrades:
- memberSlots: 1000g (10→15→25→35→50 members)
- vaultSize: 5000g (10k→25k→50k→75k→100k capacity)
- warChest: 10000g (Enable territory wars)
- hideout: 15000g (Gang headquarters)

Response 200:
{
  "success": true,
  "data": {
    // Updated gang with new upgrade
  }
}
```

### Disband Gang (Leader Only)
```http
DELETE /api/gangs/:id
Authorization: Bearer <token>

Permissions: LEADER only
Effect: Distributes bank gold evenly to all members

Response 200:
{
  "success": true,
  "message": "Gang disbanded successfully",
  "goldDistributed": 1000
}
```

---

## Territory System

### List All Territories
```http
GET /api/territories
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "name": "El Paso",
      "description": "Border town gateway",
      "difficulty": "MEDIUM",
      "ownerGangId": "gang-id | null",
      "benefits": {
        "goldBonus": 15,
        "xpBonus": 10
      },
      "defenseRating": 50
    }
  ]
}
```

### Get Territory Details
```http
GET /api/territories/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "Tombstone",
    "ownerGang": {
      "_id": "string",
      "name": "Gang Name",
      "tag": "TAG"
    },
    "activeWars": [
      {
        "_id": "string",
        "attackerGang": { /* gang details */ },
        "status": "ACTIVE",
        "startTime": "2025-11-16T20:00:00.000Z",
        "endTime": "2025-11-17T20:00:00.000Z",
        "attackerPoints": 150,
        "defenderPoints": 80
      }
    ]
  }
}
```

### Declare War (Leader Only)
```http
POST /api/territories/:id/declare-war
Authorization: Bearer <token>

Requirements:
- Gang has 'warChest' upgrade
- Territory not already under attack by your gang
- Not your own territory

Response 201:
{
  "success": true,
  "data": {
    "_id": "war-id",
    "territoryId": "territory-id",
    "attackerGangId": "your-gang-id",
    "defenderGangId": "owner-gang-id | null",
    "status": "ACTIVE",
    "startTime": "2025-11-16T20:00:00.000Z",
    "endTime": "2025-11-17T20:00:00.000Z",
    "attackerPoints": 0,
    "defenderPoints": 0
  }
}
```

### List Active Wars
```http
GET /api/wars
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "territory": { /* territory details */ },
      "attackerGang": { /* gang details */ },
      "defenderGang": { /* gang details */ },
      "status": "ACTIVE",
      "attackerPoints": 150,
      "defenderPoints": 120,
      "timeRemaining": "22h 30m"
    }
  ]
}
```

### Get War Details
```http
GET /api/wars/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "_id": "string",
    "territory": { /* full territory */ },
    "attackerGang": { /* full gang */ },
    "defenderGang": { /* full gang */ },
    "contributions": [
      {
        "characterId": "string",
        "characterName": "string",
        "points": 50,
        "side": "ATTACKER"
      }
    ],
    "attackerPoints": 150,
    "defenderPoints": 120,
    "status": "ACTIVE",
    "startTime": "2025-11-16T20:00:00.000Z",
    "endTime": "2025-11-17T20:00:00.000Z"
  }
}
```

---

## Gang Wars

### Contribute to War
```http
POST /api/wars/:id/contribute
Authorization: Bearer <token>
Content-Type: application/json

{
  "points": 10
}

Requirements:
- Be member of attacking or defending gang
- Points based on actions (crimes, combat, etc.)

Response 200:
{
  "success": true,
  "data": {
    "totalPoints": 160,
    "yourContribution": 60,
    "side": "ATTACKER"
  }
}
```

---

## Mail System

### Send Mail
```http
POST /api/mail
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "character-id",
  "subject": "string (max 100 chars)",
  "body": "string (max 1000 chars)",
  "goldAmount": 100 (optional)
}

Note: Gold is escrowed from sender immediately

Response 201:
{
  "success": true,
  "data": {
    "_id": "mail-id",
    "senderId": "your-character-id",
    "recipientId": "character-id",
    "subject": "string",
    "body": "string",
    "goldAmount": 100,
    "goldClaimed": false,
    "isRead": false,
    "createdAt": "2025-11-16T20:00:00.000Z"
  }
}
```

### Get Inbox
```http
GET /api/mail/inbox?page=1&limit=20
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "sender": {
        "_id": "string",
        "name": "Sender Name"
      },
      "subject": "string",
      "body": "string",
      "goldAmount": 100,
      "goldClaimed": false,
      "isRead": false,
      "createdAt": "2025-11-16T20:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Get Sent Mail
```http
GET /api/mail/sent?page=1&limit=20
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [ /* sent mail list */ ],
  "pagination": { /* pagination info */ }
}
```

### Claim Gold Attachment
```http
POST /api/mail/:id/claim
Authorization: Bearer <token>

Requirements:
- Mail has gold attachment
- Not already claimed
- You are the recipient

Response 200:
{
  "success": true,
  "data": {
    "goldClaimed": 100,
    "newBalance": 5100
  }
}
```

### Delete Mail
```http
DELETE /api/mail/:id
Authorization: Bearer <token>

Note: Soft delete - only marks as deleted for you

Response 200:
{
  "success": true,
  "message": "Mail deleted successfully"
}
```

### Report Mail
```http
POST /api/mail/:id/report
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "SPAM" | "HARASSMENT" | "SCAM" | "OTHER",
  "details": "string (optional)"
}

Response 200:
{
  "success": true,
  "message": "Mail reported successfully"
}
```

---

## Friend System

### Send Friend Request
```http
POST /api/friends/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "character-id"
}

Response 201:
{
  "success": true,
  "data": {
    "_id": "friend-id",
    "userId": "your-character-id",
    "friendId": "character-id",
    "status": "PENDING",
    "createdAt": "2025-11-16T20:00:00.000Z"
  }
}
```

### Get Friends List
```http
GET /api/friends
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "friend": {
        "_id": "character-id",
        "name": "Friend Name",
        "level": 15,
        "faction": "FRONTERA",
        "isOnline": true
      },
      "status": "ACCEPTED",
      "createdAt": "2025-11-16T20:00:00.000Z"
    }
  ]
}
```

### Get Friend Requests
```http
GET /api/friends/requests
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "requester": {
        "_id": "character-id",
        "name": "Requester Name",
        "level": 12
      },
      "status": "PENDING",
      "createdAt": "2025-11-16T20:00:00.000Z"
    }
  ]
}
```

### Accept Friend Request
```http
POST /api/friends/:id/accept
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "_id": "friend-id",
    "status": "ACCEPTED"
  }
}
```

### Reject Friend Request
```http
POST /api/friends/:id/reject
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Friend request rejected"
}
```

### Unfriend
```http
DELETE /api/friends/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Friend removed successfully"
}
```

### Block User
```http
POST /api/friends/block/:userId
Authorization: Bearer <token>

Effect: Prevents all future friend requests from this user

Response 200:
{
  "success": true,
  "message": "User blocked successfully"
}
```

---

## Notification System

### Get Notifications
```http
GET /api/notifications?page=1&limit=20
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "type": "FRIEND_REQUEST",
      "title": "New Friend Request",
      "message": "John Doe sent you a friend request",
      "link": "/friends/requests",
      "isRead": false,
      "createdAt": "2025-11-16T20:00:00.000Z",
      "metadata": {
        "requesterId": "character-id"
      }
    }
  ],
  "unreadCount": 5
}
```

### Mark as Read
```http
POST /api/notifications/:id/read
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Mark All as Read
```http
POST /api/notifications/read-all
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "All notifications marked as read"
}
```

### Delete Notification
```http
DELETE /api/notifications/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

### Socket.io - Real-time Notifications
```javascript
socket.on('notification:new', (notification) => {
  // { _id, type, title, message, link, createdAt, metadata }
});
```

---

## Notification Types

1. **FRIEND_REQUEST** - Someone sent you a friend request
2. **FRIEND_ACCEPTED** - Your friend request was accepted
3. **MAIL_RECEIVED** - You received new mail
4. **GANG_INVITE** - You were invited to a gang
5. **GANG_WAR_DECLARED** - Your gang is under attack
6. **GANG_WAR_WON** - Your gang won a territory war
7. **GANG_WAR_LOST** - Your gang lost a territory war
8. **TERRITORY_CONQUERED** - Your gang conquered a new territory

---

## Rate Limits

**Global Rate Limit:**
- 100 requests per 15 minutes per IP

**Chat Rate Limit:**
- 3 messages per 10 seconds per user
- Violation: 5-minute mute (escalating)

**Mail Rate Limit:**
- 10 messages per hour

**Friend Request Rate Limit:**
- 20 requests per day

---

## Error Responses

**Standard Error Format:**
```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

**Validation Error:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": {
    "name": ["Name must be between 3 and 30 characters"],
    "email": ["Invalid email format"]
  }
}
```

---

## WebSocket Events Summary

**Connection Events:**
- `connect` - Connected to server
- `disconnect` - Disconnected from server
- `error` - Connection error

**Character Events:**
- `character:join` - Join character room
- `character:joined` - Joined successfully
- `character:leave` - Leave character room
- `character:online` - Character came online
- `character:offline` - Character went offline

**Chat Events:**
- `message:send` - Send message
- `message:new` - Receive message
- `user:typing` - User is typing
- `room:join` - Join chat room
- `room:leave` - Leave chat room

**Mail Events:**
- `mail:received` - New mail received

**Friend Events:**
- `friend:request` - Friend request received
- `friend:accepted` - Friend request accepted

**Notification Events:**
- `notification:new` - New notification

**Gang Events:**
- `gang:updated` - Gang data updated
- `gang:war:started` - New war started
- `gang:war:ended` - War ended

---

## Testing

**Example using cURL:**

```bash
# Login to get JWT token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.data.token')

# Send chat message
curl -X POST http://localhost:5000/api/chat/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"roomType":"GLOBAL","roomId":"global","content":"Hello world!"}'

# Get inbox
curl -X GET http://localhost:5000/api/mail/inbox \
  -H "Authorization: Bearer $TOKEN"
```

**Example using JavaScript:**

```javascript
// Fetch API
const response = await fetch('http://localhost:5000/api/gangs', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Gang',
    tag: 'TAG',
    description: 'Best gang ever'
  })
});

const data = await response.json();
```

---

## Postman Collection

Import this collection for easy API testing:

```json
{
  "info": {
    "name": "Desperados Destiny Sprint 5",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [{
      "key": "token",
      "value": "{{jwt_token}}",
      "type": "string"
    }]
  },
  "item": [
    {
      "name": "Chat",
      "item": [
        { "name": "Send Message", "request": { "method": "POST", "url": "{{base_url}}/api/chat/messages" } },
        { "name": "Get History", "request": { "method": "GET", "url": "{{base_url}}/api/chat/messages/GLOBAL/global" } }
      ]
    },
    {
      "name": "Gangs",
      "item": [
        { "name": "Create Gang", "request": { "method": "POST", "url": "{{base_url}}/api/gangs" } },
        { "name": "Get Gang", "request": { "method": "GET", "url": "{{base_url}}/api/gangs/:id" } }
      ]
    }
  ],
  "variable": [
    { "key": "base_url", "value": "http://localhost:5000" },
    { "key": "jwt_token", "value": "" }
  ]
}
```

---

**API Documentation Version:** 1.0.0
**Sprint:** Sprint 5 (Social Features)
**Last Updated:** 2025-11-16
**Maintained By:** Agent 7

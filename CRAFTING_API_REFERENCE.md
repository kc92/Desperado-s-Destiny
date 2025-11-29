# Crafting API Quick Reference

## Endpoints

```
GET    /api/crafting/recipes              Get all available recipes
GET    /api/crafting/recipes/:category    Get recipes by category
GET    /api/crafting/can-craft/:recipeId  Check if can craft
POST   /api/crafting/craft                Craft an item
GET    /api/crafting/stations             Get crafting stations
```

## Categories
- `weapon` - Guns, knives, explosives (10 recipes)
- `armor` - Vests, boots, belts (5 recipes)
- `consumable` - Tonics, elixirs, food (15 recipes)
- `material` - Leather, metal, blackpowder (10 recipes)
- `ammo` - Bullets, arrows, shells (5 recipes)

## Example Requests

### Get All Recipes
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5000/api/crafting/recipes?characterId=ABC123"
```

### Get Weapons
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5000/api/crafting/recipes/weapon"
```

### Check If Can Craft
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:5000/api/crafting/can-craft/basic-knife?characterId=ABC123"
```

### Craft Item
```bash
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"characterId":"ABC123","recipeId":"basic-knife"}' \
     "http://localhost:5000/api/crafting/craft"
```

## Rate Limits
- Crafting: 30 per minute
- Other endpoints: 100 per 15 minutes (API-wide)

## Recipe Structure
```typescript
{
  recipeId: string,           // Unique ID (e.g., "basic-knife")
  name: string,               // Display name
  description: string,        // Flavor text
  category: string,           // weapon/armor/consumable/ammo/material
  ingredients: [              // Required materials
    { itemId: string, quantity: number }
  ],
  output: {                   // Crafted item
    itemId: string,
    quantity: number
  },
  skillRequired: {            // Minimum skill needed
    skillId: string,          // craft/spirit/cunning/combat
    level: number
  },
  craftTime: number,          // Minutes (currently unused)
  xpReward: number,           // XP awarded on craft
  isUnlocked: boolean         // Recipe availability
}
```

## Error Codes
- `400` - Bad request (missing fields, invalid category)
- `401` - Unauthorized (no auth token)
- `403` - Forbidden (not your character)
- `404` - Not found (recipe/character doesn't exist)
- `429` - Rate limit exceeded
- `500` - Server error

## Common Ingredients
**Metals:** metal-scrap, metal-ingot, gold-ingot, iron-ore, lead
**Leather:** raw-hide, leather-strip, tanned-hide
**Chemicals:** blackpowder, gun-oil, sulfur, saltpeter
**Organics:** herbs, animal-fat, snake-venom, meat
**Textiles:** cloth, rope, hemp, feathers
**Consumables:** water, alcohol, coffee-beans, tobacco

## Skill Requirements
- `craft` (Level 1-25) - Most weapons, armor, materials
- `spirit` (Level 1-15) - Health tonics, remedies, antivenom
- `cunning` (Level 8-12) - Poisons, snake oil
- `combat` (Level 10-22) - Advanced weapons

## Database Seeding
```bash
# Seed all 50 recipes
cd server
npx ts-node src/seeds/recipes.seed.ts
```

## Testing
```bash
# Run comprehensive API test
node test-crafting-api.js
```

## Integration Notes
- Uses `requireAuth` middleware (JWT token required)
- Uses `requireCharacter` middleware (validates ownership)
- Integrates with `QuestService.onItemCollected()` for quest progress
- Transaction-safe using MongoDB sessions
- Awards XP via `character.addExperience()`

## File Locations
- **Controller:** `server/src/controllers/crafting.controller.ts` (234 lines)
- **Routes:** `server/src/routes/crafting.routes.ts` (55 lines)
- **Seeds:** `server/src/seeds/recipes.seed.ts` (775 lines, 50 recipes)
- **Service:** `server/src/services/crafting.service.ts` (existing)
- **Model:** `server/src/models/Recipe.model.ts` (existing)

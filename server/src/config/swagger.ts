/**
 * Swagger/OpenAPI Configuration
 * API documentation setup
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Desperados Destiny API',
      version: '1.0.0',
      description: 'API documentation for Desperados Destiny - a mythic wild west MMORPG',
      contact: {
        name: 'Desperados Destiny Team'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' }
          }
        },
        Character: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            faction: { type: 'string', enum: ['SETTLER_ALLIANCE', 'NAHI_COALITION', 'FRONTERA'] },
            level: { type: 'number' },
            experience: { type: 'number' },
            gold: { type: 'number' },
            energy: { type: 'number' },
            maxEnergy: { type: 'number' }
          }
        },
        Action: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string', enum: ['CRIME', 'COMBAT', 'CRAFT', 'SOCIAL'] },
            energyCost: { type: 'number' },
            targetScore: { type: 'number' },
            difficulty: { type: 'number' }
          }
        },
        Quest: {
          type: 'object',
          properties: {
            questId: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string' },
            levelRequired: { type: 'number' },
            objectives: { type: 'array', items: { type: 'object' } },
            rewards: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Characters', description: 'Character management' },
      { name: 'Actions', description: 'Game actions and challenges' },
      { name: 'Combat', description: 'PvE and PvP combat' },
      { name: 'Quests', description: 'Quest management' },
      { name: 'Skills', description: 'Skill training' },
      { name: 'Gangs', description: 'Gang system' },
      { name: 'Mail', description: 'In-game mail' },
      { name: 'Friends', description: 'Social features' },
      { name: 'Shop', description: 'Item shop' },
      { name: 'Duels', description: 'PvP duels' },
      { name: 'Tournaments', description: 'Tournament system' }
    ]
  },
  apis: ['./src/routes/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);

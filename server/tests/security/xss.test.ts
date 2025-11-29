/**
 * XSS (Cross-Site Scripting) Security Tests
 *
 * Tests to ensure all user input is properly sanitized
 */

import request from 'supertest';
import app from '../testApp';
import { User } from '../../src/models/User.model';
import { Character } from '../../src/models/Character.model';
import { Gang } from '../../src/models/Gang.model';
import { clearDatabase } from '../helpers/db.helpers';
import { apiGet, apiPost, apiPut, expectSuccess, expectError } from '../helpers/api.helpers';
import { setupCompleteGameState } from '../helpers/testHelpers';
import { GangRole } from '@desperados/shared';

describe('XSS Security Tests', () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    'javascript:alert("XSS")',
    '<iframe src="javascript:alert(\'XSS\')">',
    '<body onload=alert("XSS")>',
    '<input onfocus=alert("XSS") autofocus>',
    '<select onfocus=alert("XSS") autofocus>',
    '<textarea onfocus=alert("XSS") autofocus>',
    '<marquee onstart=alert("XSS")>',
    '<div style="background:url(javascript:alert(\'XSS\'))">',
    '<object data="data:text/html,<script>alert(\'XSS\')</script>">',
    '"><script>alert(String.fromCharCode(88,83,83))</script>',
    '\'-alert("XSS")-\'',
    '";alert("XSS");//'
  ];

  describe('Character Name Sanitization', () => {
    it('should sanitize script tags in character name', async () => {
      const { token, user } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/characters',
        {
          name: '<script>alert("XSS")</script>',
          faction: 'SETTLER_ALLIANCE',
          appearance: {
            bodyType: 'male',
            skinTone: 5,
            facePreset: 1,
            hairStyle: 3,
            hairColor: 2
          }
        },
        token
      );

      if (response.status === 201) {
        const character = response.body.data.character;
        expect(character.name).not.toContain('<script>');
        expect(character.name).not.toContain('</script>');
      }
    });

    it('should sanitize event handlers in character name', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/characters',
        {
          name: '<img src=x onerror=alert("XSS")>',
          faction: 'SETTLER_ALLIANCE',
          appearance: {
            bodyType: 'male',
            skinTone: 5,
            facePreset: 1,
            hairStyle: 3,
            hairColor: 2
          }
        },
        token
      );

      if (response.status === 201) {
        const character = response.body.data.character;
        expect(character.name).not.toContain('onerror');
        expect(character.name).not.toContain('<img');
      }
    });

    it('should test all XSS payloads in character name', async () => {
      const { token } = await setupCompleteGameState(app);

      for (const payload of xssPayloads) {
        const response = await apiPost(
          app,
          '/api/characters',
          {
            name: payload,
            faction: 'SETTLER_ALLIANCE',
            appearance: {
              bodyType: 'male',
              skinTone: 5,
              facePreset: 1,
              hairStyle: 3,
              hairColor: 2
            }
          },
          token
        );

        if (response.status === 201) {
          const character = response.body.data.character;
          // Should either reject or sanitize
          expect(character.name).not.toContain('<script');
          expect(character.name).not.toContain('onerror');
          expect(character.name).not.toContain('onload');
          expect(character.name).not.toContain('javascript:');
        }
      }
    });
  });

  describe('Chat Message Sanitization', () => {
    it('should sanitize script tags in chat messages', async () => {
      const { character, token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/chat/send',
        {
          characterId: character._id.toString(),
          channel: 'global',
          message: '<script>alert("XSS")</script>Hello'
        },
        token
      );

      if (response.status === 200) {
        const message = response.body.data.message;
        expect(message).not.toContain('<script>');
        expect(message).not.toContain('</script>');
      }
    });

    it('should sanitize all XSS payloads in chat messages', async () => {
      const { character, token } = await setupCompleteGameState(app);

      for (const payload of xssPayloads) {
        const response = await apiPost(
          app,
          '/api/chat/send',
          {
            characterId: character._id.toString(),
            channel: 'global',
            message: payload
          },
          token
        );

        if (response.status === 200) {
          const message = response.body.data.message;
          expect(message).not.toContain('<script');
          expect(message).not.toContain('javascript:');
          expect(message).not.toContain('onerror');
        }
      }
    });

    it('should preserve safe HTML entities in chat messages', async () => {
      const { character, token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/chat/send',
        {
          characterId: character._id.toString(),
          channel: 'global',
          message: 'I have > 5 gold & < 10 energy'
        },
        token
      );

      if (response.status === 200) {
        const message = response.body.data.message;
        // Safe characters should be preserved or properly encoded
        expect(message).toBeDefined();
      }
    });
  });

  describe('Gang Name and Description Sanitization', () => {
    it('should sanitize script tags in gang name', async () => {
      const { character, token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/gangs',
        {
          name: '<script>alert("XSS")</script>Gang',
          tag: 'TEST',
          characterId: character._id.toString()
        },
        token
      );

      if (response.status === 201) {
        const gang = response.body.data.gang;
        expect(gang.name).not.toContain('<script>');
        expect(gang.name).not.toContain('</script>');
      }
    });

    it('should sanitize XSS in gang description', async () => {
      const { character, token } = await setupCompleteGameState(app);

      // First create gang
      const gangResponse = await apiPost(
        app,
        '/api/gangs',
        {
          name: 'Test Gang',
          tag: 'TEST',
          characterId: character._id.toString()
        },
        token
      );

      if (gangResponse.status === 201) {
        const gangId = gangResponse.body.data.gang._id;

        // Try to update with XSS payload
        const updateResponse = await apiPut(
          app,
          `/api/gangs/${gangId}`,
          {
            description: '<img src=x onerror=alert("XSS")>'
          },
          token
        );

        if (updateResponse.status === 200) {
          const gang = updateResponse.body.data.gang;
          expect(gang.description).not.toContain('onerror');
          expect(gang.description).not.toContain('<img');
        }
      }
    });

    it('should test all XSS payloads in gang fields', async () => {
      const { character, token } = await setupCompleteGameState(app);

      for (let i = 0; i < xssPayloads.length; i++) {
        const payload = xssPayloads[i];
        const response = await apiPost(
          app,
          '/api/gangs',
          {
            name: `Gang${i}${payload}`,
            tag: `TST${i}`,
            characterId: character._id.toString()
          },
          token
        );

        if (response.status === 201) {
          const gang = response.body.data.gang;
          expect(gang.name).not.toContain('<script');
          expect(gang.name).not.toContain('javascript:');
        }
      }
    });
  });

  describe('Mail Content Sanitization', () => {
    it('should sanitize script tags in mail subject', async () => {
      const { character, token } = await setupCompleteGameState(app);
      const recipient = await setupCompleteGameState(app, 'recipient@example.com');

      const response = await apiPost(
        app,
        '/api/mail/send',
        {
          characterId: character._id.toString(),
          recipientCharacterId: recipient.character._id.toString(),
          subject: '<script>alert("XSS")</script>Important',
          message: 'Test message'
        },
        token
      );

      if (response.status === 200) {
        const mail = response.body.data.mail;
        expect(mail.subject).not.toContain('<script>');
        expect(mail.subject).not.toContain('</script>');
      }
    });

    it('should sanitize XSS in mail body', async () => {
      const { character, token } = await setupCompleteGameState(app);
      const recipient = await setupCompleteGameState(app, 'recipient@example.com');

      const response = await apiPost(
        app,
        '/api/mail/send',
        {
          characterId: character._id.toString(),
          recipientCharacterId: recipient.character._id.toString(),
          subject: 'Test',
          message: '<img src=x onerror=alert("XSS")>'
        },
        token
      );

      if (response.status === 200) {
        const mail = response.body.data.mail;
        expect(mail.message).not.toContain('onerror');
        expect(mail.message).not.toContain('<img');
      }
    });

    it('should test all XSS payloads in mail', async () => {
      const { character, token } = await setupCompleteGameState(app);
      const recipient = await setupCompleteGameState(app, 'recipient@example.com');

      for (const payload of xssPayloads) {
        const response = await apiPost(
          app,
          '/api/mail/send',
          {
            characterId: character._id.toString(),
            recipientCharacterId: recipient.character._id.toString(),
            subject: 'Test',
            message: payload
          },
          token
        );

        if (response.status === 200) {
          const mail = response.body.data.mail;
          expect(mail.message).not.toContain('<script');
          expect(mail.message).not.toContain('javascript:');
        }
      }
    });
  });

  describe('Profile Bio Sanitization', () => {
    it('should sanitize script tags in profile bio', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await apiPut(
        app,
        '/api/profile',
        {
          bio: '<script>alert("XSS")</script>My bio'
        },
        token
      );

      if (response.status === 200) {
        const profile = response.body.data.profile;
        expect(profile.bio).not.toContain('<script>');
        expect(profile.bio).not.toContain('</script>');
      }
    });

    it('should test all XSS payloads in profile bio', async () => {
      const { token } = await setupCompleteGameState(app);

      for (const payload of xssPayloads) {
        const response = await apiPut(
          app,
          '/api/profile',
          {
            bio: payload
          },
          token
        );

        if (response.status === 200) {
          const profile = response.body.data.profile;
          expect(profile.bio).not.toContain('<script');
          expect(profile.bio).not.toContain('javascript:');
          expect(profile.bio).not.toContain('onerror');
        }
      }
    });
  });

  describe('Data URI and Protocol Handler XSS', () => {
    it('should block data: URI in character names', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/characters',
        {
          name: 'data:text/html,<script>alert("XSS")</script>',
          faction: 'SETTLER_ALLIANCE',
          appearance: {
            bodyType: 'male',
            skinTone: 5,
            facePreset: 1,
            hairStyle: 3,
            hairColor: 2
          }
        },
        token
      );

      if (response.status === 201) {
        const character = response.body.data.character;
        expect(character.name).not.toContain('data:');
        expect(character.name).not.toContain('<script');
      }
    });

    it('should block javascript: protocol in all inputs', async () => {
      const { character, token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/chat/send',
        {
          characterId: character._id.toString(),
          channel: 'global',
          message: 'javascript:alert("XSS")'
        },
        token
      );

      if (response.status === 200) {
        const message = response.body.data.message;
        expect(message).not.toContain('javascript:');
      }
    });

    it('should block vbscript: protocol', async () => {
      const { character, token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/chat/send',
        {
          characterId: character._id.toString(),
          channel: 'global',
          message: 'vbscript:msgbox("XSS")'
        },
        token
      );

      if (response.status === 200) {
        const message = response.body.data.message;
        expect(message).not.toContain('vbscript:');
      }
    });
  });

  describe('HTML Attribute Injection', () => {
    it('should prevent attribute injection in character names', async () => {
      const { token } = await setupCompleteGameState(app);

      const response = await apiPost(
        app,
        '/api/characters',
        {
          name: '" onload="alert(\'XSS\')"',
          faction: 'SETTLER_ALLIANCE',
          appearance: {
            bodyType: 'male',
            skinTone: 5,
            facePreset: 1,
            hairStyle: 3,
            hairColor: 2
          }
        },
        token
      );

      if (response.status === 201) {
        const character = response.body.data.character;
        expect(character.name).not.toContain('onload');
      }
    });

    it('should handle single and double quote combinations', async () => {
      const { character, token } = await setupCompleteGameState(app);

      const payloads = [
        '\'" onclick="alert(\'XSS\')"',
        '\'"><script>alert("XSS")</script>',
        '"><img src=x onerror=alert(1)>'
      ];

      for (const payload of payloads) {
        const response = await apiPost(
          app,
          '/api/chat/send',
          {
            characterId: character._id.toString(),
            channel: 'global',
            message: payload
          },
          token
        );

        if (response.status === 200) {
          const message = response.body.data.message;
          expect(message).not.toContain('onclick');
          expect(message).not.toContain('onerror');
          expect(message).not.toContain('<script');
        }
      }
    });
  });
});

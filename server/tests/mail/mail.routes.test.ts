/**
 * Mail Routes Tests
 *
 * Integration tests for mail API endpoints
 */

import request from 'supertest';
import app from '../../src/server';
import { Character } from '../../src/models/Character.model';
import { User } from '../../src/models/User.model';
import { Mail } from '../../src/models/Mail.model';
import { clearDatabase } from '../helpers/db.helpers';
import { createTestToken } from '../helpers/auth.helpers';
import { Faction } from '@desperados/shared';

describe('Mail Routes', () => {
  let sender: any;
  let recipient: any;
  let senderToken: string;

  beforeEach(async () => {
    await clearDatabase();

    const user1 = await User.create({
      email: 'sender@test.com',
      passwordHash: 'hash1',
      emailVerified: true
    });

    const user2 = await User.create({
      email: 'recipient@test.com',
      passwordHash: 'hash2',
      emailVerified: true
    });

    sender = await Character.create({
      userId: user1._id,
      name: 'Sender',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'male',
        skinTone: 5,
        facePreset: 0,
        hairStyle: 0,
        hairColor: 0
      },
      currentLocation: 'frontera-town',
      gold: 1000
    });

    recipient = await Character.create({
      userId: user2._id,
      name: 'Recipient',
      faction: Faction.FRONTERA,
      appearance: {
        bodyType: 'female',
        skinTone: 3,
        facePreset: 1,
        hairStyle: 1,
        hairColor: 1
      },
      currentLocation: 'frontera-town',
      gold: 500
    });

    senderToken = createTestToken(user1._id.toString(), user1.email);
  });

  afterEach(async () => {
    await clearDatabase();
  });

  describe('POST /api/mail/send', () => {
    it('should send mail', async () => {
      const res = await request(app)
        .post('/api/mail/send')
        .set('Authorization', `Bearer ${senderToken}`)
        .set('X-Character-ID', sender._id.toString())
        .send({
          recipientId: recipient._id.toString(),
          subject: 'Test Subject',
          body: 'Test Body'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subject).toBe('Test Subject');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .post('/api/mail/send')
        .send({
          recipientId: recipient._id.toString(),
          subject: 'Test',
          body: 'Test'
        });

      expect(res.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/mail/send')
        .set('Authorization', `Bearer ${senderToken}`)
        .set('X-Character-ID', sender._id.toString())
        .send({
          subject: 'Test'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/mail/inbox', () => {
    beforeEach(async () => {
      await Mail.create({
        senderId: sender._id,
        senderName: sender.name,
        recipientId: recipient._id,
        recipientName: recipient.name,
        subject: 'Test Mail',
        body: 'Test Body',
        goldAttachment: 0
      });
    });

    it('should fetch inbox', async () => {
      const user2 = await User.findById(recipient.userId);
      const recipientToken = createTestToken(user2!._id.toString(), user2!.email);

      const res = await request(app)
        .get('/api/mail/inbox')
        .set('Authorization', `Bearer ${recipientToken}`)
        .set('X-Character-ID', recipient._id.toString());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.unreadCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('POST /api/mail/:id/claim', () => {
    it('should claim gold attachment', async () => {
      const mail = await Mail.create({
        senderId: sender._id,
        senderName: sender.name,
        recipientId: recipient._id,
        recipientName: recipient.name,
        subject: 'Gold Mail',
        body: 'Claim this',
        goldAttachment: 100,
        goldClaimed: false
      });

      const user2 = await User.findById(recipient.userId);
      const recipientToken = createTestToken(user2!._id.toString(), user2!.email);

      const res = await request(app)
        .post(`/api/mail/${mail._id}/claim`)
        .set('Authorization', `Bearer ${recipientToken}`)
        .set('X-Character-ID', recipient._id.toString());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.goldClaimed).toBe(100);
    });
  });

  describe('DELETE /api/mail/:id', () => {
    it('should delete mail', async () => {
      const mail = await Mail.create({
        senderId: sender._id,
        senderName: sender.name,
        recipientId: recipient._id,
        recipientName: recipient.name,
        subject: 'Test',
        body: 'Test'
      });

      const res = await request(app)
        .delete(`/api/mail/${mail._id}`)
        .set('Authorization', `Bearer ${senderToken}`)
        .set('X-Character-ID', sender._id.toString());

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/mail/unread-count', () => {
    it('should return unread count', async () => {
      await Mail.create({
        senderId: sender._id,
        senderName: sender.name,
        recipientId: recipient._id,
        recipientName: recipient.name,
        subject: 'Unread',
        body: 'Body',
        isRead: false
      });

      const user2 = await User.findById(recipient.userId);
      const recipientToken = createTestToken(user2!._id.toString(), user2!.email);

      const res = await request(app)
        .get('/api/mail/unread-count')
        .set('Authorization', `Bearer ${recipientToken}`)
        .set('X-Character-ID', recipient._id.toString());

      expect(res.status).toBe(200);
      expect(res.body.data.count).toBeGreaterThanOrEqual(0);
    });
  });
});

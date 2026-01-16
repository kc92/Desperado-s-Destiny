/**
 * Email Service
 * Handles sending emails for verification, password reset, and notifications
 * Supports Resend (preferred) and SMTP (fallback)
 */

import nodemailer from 'nodemailer';
import config from '../config';
import logger from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;

  /**
   * Send email via Resend API
   */
  private static async sendViaResend(options: EmailOptions): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return false;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: config.email?.from || 'Desperados Destiny <noreply@desperadosdestiny.com>',
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error(`[Email/Resend] API error: ${response.status}`, errorData);
        return false;
      }

      const data = await response.json();
      logger.info(`[Email/Resend] Successfully sent to ${options.to}: ${options.subject} (id: ${data.id})`);
      return true;
    } catch (error: any) {
      logger.error(`[Email/Resend] Failed to send to ${options.to}: ${error.message || error}`);
      return false;
    }
  }

  /**
   * Initialize the SMTP transporter (fallback)
   */
  private static getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      const smtpHost = config.email?.smtp?.host || 'smtp.mailtrap.io';
      const isOffice365 = smtpHost.includes('office365') || smtpHost.includes('outlook');

      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: config.email?.smtp?.port || 587,
        secure: false, // Use STARTTLS
        requireTLS: isOffice365, // M365 requires TLS
        auth: {
          user: config.email?.smtp?.user || '',
          pass: config.email?.smtp?.pass || ''
        },
        // Timeout settings to prevent hanging
        connectionTimeout: 10000, // 10 seconds to establish connection
        greetingTimeout: 10000,   // 10 seconds for server greeting
        socketTimeout: 30000,     // 30 seconds for socket inactivity
      });

      logger.info(`[Email] SMTP transporter configured for ${smtpHost}`);
    }
    return this.transporter;
  }

  /**
   * Send an email via SMTP (fallback)
   */
  private static async sendViaSMTP(options: EmailOptions): Promise<boolean> {
    try {
      // In development without SMTP config, log instead
      if (!config.email?.smtp?.user) {
        logger.info(`[DEV EMAIL] To: ${options.to}, Subject: ${options.subject}`);
        logger.info(`[DEV EMAIL] Content: ${options.text || options.html.substring(0, 200)}...`);
        return true;
      }

      const transporter = this.getTransporter();

      await transporter.sendMail({
        from: config.email?.from || 'noreply@desperados-destiny.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      });

      logger.info(`[Email/SMTP] Successfully sent to ${options.to}: ${options.subject}`);
      return true;
    } catch (error: any) {
      logger.error(`[Email/SMTP] Failed to send to ${options.to}: ${error.message || error}`, {
        code: error.code,
        command: error.command,
        responseCode: error.responseCode,
      });
      return false;
    }
  }

  /**
   * Send an email - tries Resend first, falls back to SMTP
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    // Try Resend first (preferred for production)
    if (process.env.RESEND_API_KEY) {
      const result = await this.sendViaResend(options);
      if (result) return true;
      logger.warn('[Email] Resend failed, falling back to SMTP');
    }

    // Fall back to SMTP
    return this.sendViaSMTP(options);
  }

  /**
   * Send verification email
   */
  static async sendVerificationEmail(
    email: string,
    username: string,
    token: string
  ): Promise<boolean> {
    const verifyUrl = `${config.clientUrl}/verify-email?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Georgia, serif; background: #f4f1e8; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border: 3px solid #8b4513; padding: 30px; }
          h1 { color: #8b4513; font-family: 'Times New Roman', serif; }
          .button { display: inline-block; padding: 12px 24px; background: #daa520; color: #000; text-decoration: none; font-weight: bold; border: 2px solid #8b4513; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to Desperados Destiny, ${username}!</h1>
          <p>Howdy, partner! You're almost ready to ride into the Sangre Territory.</p>
          <p>Click the button below to verify your email and start your adventure:</p>
          <p><a href="${verifyUrl}" class="button">Verify Email</a></p>
          <p>Or copy this link: ${verifyUrl}</p>
          <p>This link expires in 24 hours.</p>
          <div class="footer">
            <p>If you didn't create this account, please ignore this email.</p>
            <p>Happy trails!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Desperados Destiny',
      html,
      text: `Welcome to Desperados Destiny, ${username}! Verify your email: ${verifyUrl}`
    });
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    username: string,
    token: string
  ): Promise<boolean> {
    const resetUrl = `${config.clientUrl}/reset-password?token=${token}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Georgia, serif; background: #f4f1e8; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border: 3px solid #8b4513; padding: 30px; }
          h1 { color: #8b4513; font-family: 'Times New Roman', serif; }
          .button { display: inline-block; padding: 12px 24px; background: #daa520; color: #000; text-decoration: none; font-weight: bold; border: 2px solid #8b4513; }
          .warning { color: #b22222; font-weight: bold; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Password Reset Request</h1>
          <p>Howdy ${username},</p>
          <p>We received a request to reset your password. Click below to set a new one:</p>
          <p><a href="${resetUrl}" class="button">Reset Password</a></p>
          <p>Or copy this link: ${resetUrl}</p>
          <p class="warning">This link expires in 1 hour.</p>
          <div class="footer">
            <p>If you didn't request this, your account may be compromised. Please secure it immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Desperados Destiny',
      html,
      text: `Reset your password: ${resetUrl}. This link expires in 1 hour.`
    });
  }

  /**
   * Send welcome email after verification
   */
  static async sendWelcomeEmail(
    email: string,
    username: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Georgia, serif; background: #f4f1e8; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border: 3px solid #8b4513; padding: 30px; }
          h1 { color: #8b4513; font-family: 'Times New Roman', serif; }
          .button { display: inline-block; padding: 12px 24px; background: #daa520; color: #000; text-decoration: none; font-weight: bold; border: 2px solid #8b4513; }
          ul { line-height: 1.8; }
          .footer { margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome to the Frontier, ${username}!</h1>
          <p>Your journey in the Sangre Territory begins now.</p>
          <h3>Getting Started:</h3>
          <ul>
            <li>Create your first character and choose your faction</li>
            <li>Learn the ways of the Destiny Deck - poker hands determine your fate</li>
            <li>Train your skills to gain advantages</li>
            <li>Join a gang or ride solo</li>
            <li>Make your fortune through honest work or... other means</li>
          </ul>
          <p><a href="${config.clientUrl}" class="button">Start Playing</a></p>
          <div class="footer">
            <p>May your draws be favorable and your aim true.</p>
            <p>Happy trails, partner!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Desperados Destiny!',
      html,
      text: `Welcome to Desperados Destiny, ${username}! Start playing at ${config.clientUrl}`
    });
  }
}

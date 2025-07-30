/**
 * Email Service for Authentication
 * 
 * Production-ready email service for verification, password reset,
 * and authentication-related communications.
 */

import nodemailer from 'nodemailer'
import { generateSecureToken, generateVerificationCode } from './password'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
  replyTo?: string
}

interface EmailTemplate {
  subject: string
  html: string
  text: string
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null
  private config: EmailConfig

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      from: process.env.SMTP_FROM || 'noreply@futureme.app',
      replyTo: process.env.SMTP_REPLY_TO
    }
  }

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: this.config.auth,
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 10, // 10 messages per second max
      })

      // Verify connection
      try {
        await this.transporter.verify()
        console.log('Email service connected successfully')
      } catch (error) {
        console.error('Email service connection failed:', error)
        throw new Error('Failed to connect to email service')
      }
    }

    return this.transporter
  }

  private getEmailTemplate(type: string, data: Record<string, any>): EmailTemplate {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    switch (type) {
      case 'email-verification':
        return {
          subject: 'Verify your FutureMe account',
          html: this.getEmailVerificationHTML(data.verificationUrl, data.name, data.code),
          text: this.getEmailVerificationText(data.verificationUrl, data.name, data.code)
        }

      case 'password-reset':
        return {
          subject: 'Reset your FutureMe password',
          html: this.getPasswordResetHTML(data.resetUrl, data.name),
          text: this.getPasswordResetText(data.resetUrl, data.name)
        }

      case 'welcome':
        return {
          subject: 'Welcome to FutureMe!',
          html: this.getWelcomeHTML(data.name, data.loginUrl),
          text: this.getWelcomeText(data.name, data.loginUrl)
        }

      case 'password-changed':
        return {
          subject: 'Your FutureMe password was changed',
          html: this.getPasswordChangedHTML(data.name),
          text: this.getPasswordChangedText(data.name)
        }

      case 'account-deleted':
        return {
          subject: 'Your FutureMe account has been deleted',
          html: this.getAccountDeletedHTML(data.name),
          text: this.getAccountDeletedText(data.name)
        }

      default:
        throw new Error(`Unknown email template type: ${type}`)
    }
  }

  private getEmailVerificationHTML(verificationUrl: string, name: string, code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your FutureMe account</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #a50cf2 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">FutureMe</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Transform your future, one action at a time</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 20px;">
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hi ${name}!</h2>
      
      <p style="color: #4b5563; font-size: 16px; margin: 0 0 20px 0;">
        Welcome to FutureMe! We're excited to have you join our community of forward-thinking individuals.
      </p>

      <p style="color: #4b5563; font-size: 16px; margin: 0 0 30px 0;">
        Please verify your email address to get started with your transformation journey.
      </p>

      <!-- Verification Code -->
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 0 0 30px 0;">
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">Your verification code:</p>
        <div style="font-size: 32px; font-weight: bold; color: #a50cf2; letter-spacing: 4px; font-family: monospace;">${code}</div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 0 0 30px 0;">
        <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #a50cf2 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Verify Email Address
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px 0;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="color: #a50cf2; font-size: 14px; word-break: break-all; margin: 0 0 30px 0;">
        ${verificationUrl}
      </p>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          This verification link will expire in 24 hours. If you didn't create a FutureMe account, you can safely ignore this email.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        © 2024 FutureMe. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`
  }

  private getEmailVerificationText(verificationUrl: string, name: string, code: string): string {
    return `Hi ${name}!

Welcome to FutureMe! We're excited to have you join our community.

Please verify your email address to get started with your transformation journey.

Your verification code: ${code}

Click here to verify: ${verificationUrl}

Or copy and paste this link into your browser:
${verificationUrl}

This verification link will expire in 24 hours. If you didn't create a FutureMe account, you can safely ignore this email.`
  }

  private getPasswordResetHTML(resetUrl: string, name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your FutureMe password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #a50cf2 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">FutureMe</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Password Reset Request</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 20px;">
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hi ${name}!</h2>
      
      <p style="color: #4b5563; font-size: 16px; margin: 0 0 20px 0;">
        We received a request to reset your FutureMe password.
      </p>

      <p style="color: #4b5563; font-size: 16px; margin: 0 0 30px 0;">
        Click the button below to create a new password:
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 0 0 30px 0;">
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #a50cf2 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Reset Password
        </a>
      </div>

      <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px 0;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="color: #a50cf2; font-size: 14px; word-break: break-all; margin: 0 0 30px 0;">
        ${resetUrl}
      </p>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          This password reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        © 2024 FutureMe. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`
  }

  private getPasswordResetText(resetUrl: string, name: string): string {
    return `Hi ${name}!

We received a request to reset your FutureMe password.

Click here to reset your password: ${resetUrl}

Or copy and paste this link into your browser:
${resetUrl}

This password reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.`
  }

  private getWelcomeHTML(name: string, loginUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to FutureMe!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #a50cf2 0%, #7c3aed 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to FutureMe!</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Your transformation journey begins now</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 20px;">
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hi ${name}!</h2>
      
      <p style="color: #4b5563; font-size: 16px; margin: 0 0 20px 0;">
        Congratulations! Your email has been verified and your FutureMe account is now active.
      </p>

      <p style="color: #4b5563; font-size: 16px; margin: 0 0 30px 0;">
        You're now ready to start building the future you envision. Here's what you can do:
      </p>

      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 0 0 30px 0;">
        <ul style="color: #4b5563; font-size: 16px; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 10px;">Define your 5-year vision across different life areas</li>
          <li style="margin-bottom: 10px;">Get AI-powered daily actions to achieve your goals</li>
          <li style="margin-bottom: 10px;">Track your progress and build winning streaks</li>
          <li>Connect with a community of forward-thinking individuals</li>
        </ul>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 0 0 30px 0;">
        <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #a50cf2 0%, #7c3aed 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px;">
          Start Your Journey
        </a>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
          If you have any questions, feel free to reach out to our support team. We're here to help you succeed!
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        © 2024 FutureMe. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`
  }

  private getWelcomeText(name: string, loginUrl: string): string {
    return `Hi ${name}!

Congratulations! Your email has been verified and your FutureMe account is now active.

You're now ready to start building the future you envision. Here's what you can do:

• Define your 5-year vision across different life areas
• Get AI-powered daily actions to achieve your goals  
• Track your progress and build winning streaks
• Connect with a community of forward-thinking individuals

Get started: ${loginUrl}

If you have any questions, feel free to reach out to our support team. We're here to help you succeed!`
  }

  private getPasswordChangedHTML(name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Changed - FutureMe</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Password Changed</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Your account is secure</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 20px;">
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hi ${name}!</h2>
      
      <p style="color: #4b5563; font-size: 16px; margin: 0 0 20px 0;">
        Your FutureMe password has been successfully changed.
      </p>

      <p style="color: #4b5563; font-size: 16px; margin: 0 0 30px 0;">
        If you made this change, no further action is required. Your account remains secure.
      </p>

      <div style="background-color: #fef3cd; border: 1px solid #fbbf24; padding: 15px; border-radius: 6px; margin: 0 0 30px 0;">
        <p style="color: #92400e; font-size: 14px; margin: 0;">
          <strong>Didn't make this change?</strong> Please contact our support team immediately if you didn't authorize this password change.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        © 2024 FutureMe. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`
  }

  private getPasswordChangedText(name: string): string {
    return `Hi ${name}!

Your FutureMe password has been successfully changed.

If you made this change, no further action is required. Your account remains secure.

If you didn't authorize this password change, please contact our support team immediately.`
  }

  private getAccountDeletedHTML(name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Deleted - FutureMe</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Account Deleted</h1>
      <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">We're sorry to see you go</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 20px;">
      <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Goodbye ${name}</h2>
      
      <p style="color: #4b5563; font-size: 16px; margin: 0 0 20px 0;">
        Your FutureMe account has been successfully deleted as requested.
      </p>

      <p style="color: #4b5563; font-size: 16px; margin: 0 0 30px 0;">
        All your personal data has been removed from our systems in compliance with GDPR and privacy regulations.
      </p>

      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 0 0 30px 0;">
        <p style="color: #4b5563; font-size: 14px; margin: 0;">
          Thank you for being part of the FutureMe community. If you ever decide to return, we'll be here to help you continue your transformation journey.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 14px; margin: 0;">
        © 2024 FutureMe. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`
  }

  private getAccountDeletedText(name: string): string {
    return `Goodbye ${name}

Your FutureMe account has been successfully deleted as requested.

All your personal data has been removed from our systems in compliance with GDPR and privacy regulations.

Thank you for being part of the FutureMe community. If you ever decide to return, we'll be here to help you continue your transformation journey.`
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(email: string, name: string, token: string): Promise<boolean> {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const verificationUrl = `${baseUrl}/auth/verify?token=${token}`
      const code = generateVerificationCode()
      
      const template = this.getEmailTemplate('email-verification', {
        verificationUrl,
        name,
        code
      })

      const transporter = await this.getTransporter()
      
      await transporter.sendMail({
        from: this.config.from,
        to: email,
        replyTo: this.config.replyTo,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      console.log(`Email verification sent to ${email}`)
      return true
    } catch (error) {
      console.error('Failed to send email verification:', error)
      return false
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, name: string, token: string): Promise<boolean> {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`
      
      const template = this.getEmailTemplate('password-reset', {
        resetUrl,
        name
      })

      const transporter = await this.getTransporter()
      
      await transporter.sendMail({
        from: this.config.from,
        to: email,
        replyTo: this.config.replyTo,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      console.log(`Password reset email sent to ${email}`)
      return true
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      return false
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcome(email: string, name: string): Promise<boolean> {
    try {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const loginUrl = `${baseUrl}/auth/signin`
      
      const template = this.getEmailTemplate('welcome', {
        name,
        loginUrl
      })

      const transporter = await this.getTransporter()
      
      await transporter.sendMail({
        from: this.config.from,
        to: email,
        replyTo: this.config.replyTo,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      console.log(`Welcome email sent to ${email}`)
      return true
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      return false
    }
  }

  /**
   * Send password changed notification
   */
  async sendPasswordChanged(email: string, name: string): Promise<boolean> {
    try {
      const template = this.getEmailTemplate('password-changed', { name })

      const transporter = await this.getTransporter()
      
      await transporter.sendMail({
        from: this.config.from,
        to: email,
        replyTo: this.config.replyTo,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      console.log(`Password changed notification sent to ${email}`)
      return true
    } catch (error) {
      console.error('Failed to send password changed notification:', error)
      return false
    }
  }

  /**
   * Send account deleted confirmation
   */
  async sendAccountDeleted(email: string, name: string): Promise<boolean> {
    try {
      const template = this.getEmailTemplate('account-deleted', { name })

      const transporter = await this.getTransporter()
      
      await transporter.sendMail({
        from: this.config.from,
        to: email,
        replyTo: this.config.replyTo,
        subject: template.subject,
        html: template.html,
        text: template.text
      })

      console.log(`Account deleted confirmation sent to ${email}`)
      return true
    } catch (error) {
      console.error('Failed to send account deleted confirmation:', error)
      return false
    }
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      const transporter = await this.getTransporter()
      await transporter.verify()
      return true
    } catch (error) {
      console.error('Email service test failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()
export default emailService
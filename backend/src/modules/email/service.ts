import { Resend } from 'resend'

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export interface EmailData {
  to: string
  from?: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private resend: Resend
  private defaultFrom: string

  constructor() {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required')
    }

    this.resend = new Resend(apiKey)
    this.defaultFrom = process.env.EMAIL_FROM || 'noreply@yourdomain.com'
  }

  async sendEmail(data: EmailData): Promise<any> {
    try {
      const result = await this.resend.emails.send({
        from: data.from || this.defaultFrom,
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
      })

      console.log('Email sent successfully:', result)
      return result
    } catch (error) {
      console.error('Failed to send email:', error)
      throw error
    }
  }

  // Employee Invite Email Template
  async sendEmployeeInvite(data: {
    to: string
    firstName: string
    lastName: string
    companyName: string
    inviteUrl: string
    inviterName: string
  }): Promise<any> {
    const subject = `You've been invited to join ${data.companyName}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Employee Invitation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e9ecef; }
            .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 You're Invited!</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.firstName} ${data.lastName},</h2>
              <p>You've been invited by <strong>${data.inviterName}</strong> to join <strong>${data.companyName}</strong> as an employee.</p>
              <p>This invitation will allow you to:</p>
              <ul>
                <li>Make purchases on behalf of ${data.companyName}</li>
                <li>Access company-specific pricing and approvals</li>
                <li>Manage your spending limits and preferences</li>
              </ul>
              <p style="text-align: center;">
                <a href="${data.inviteUrl}" class="button">Accept Invitation</a>
              </p>
              <p><strong>Note:</strong> This invitation link will expire in 7 days for security reasons.</p>
            </div>
            <div class="footer">
              <p>If you didn't expect this invitation, please ignore this email.</p>
              <p>This is an automated message from your B2B platform.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
Hello ${data.firstName} ${data.lastName},

You've been invited by ${data.inviterName} to join ${data.companyName} as an employee.

This invitation will allow you to:
- Make purchases on behalf of ${data.companyName}
- Access company-specific pricing and approvals
- Manage your spending limits and preferences

Accept your invitation here: ${data.inviteUrl}

Note: This invitation link will expire in 7 days for security reasons.

If you didn't expect this invitation, please ignore this email.
    `

    return this.sendEmail({
      to: data.to,
      subject,
      html,
      text,
    })
  }

  // Password Reset Email Template
  async sendPasswordReset(data: {
    to: string
    firstName: string
    resetUrl: string
  }): Promise<any> {
    const subject = 'Reset Your Password'

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e9ecef; }
            .button { display: inline-block; background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.firstName},</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${data.resetUrl}" class="button">Reset Password</a>
              </p>
              <p><strong>Note:</strong> This link will expire in 1 hour for security reasons.</p>
              <p>If you didn't request a password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from your B2B platform.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
Hello ${data.firstName},

We received a request to reset your password. Click the link below to create a new password:

${data.resetUrl}

Note: This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email.
    `

    return this.sendEmail({
      to: data.to,
      subject,
      html,
      text,
    })
  }

  // Order Confirmation Email Template
  async sendOrderConfirmation(data: {
    to: string
    firstName: string
    orderNumber: string
    orderUrl: string
    total: string
    currency: string
  }): Promise<any> {
    const subject = `Order Confirmation - ${data.orderNumber}`

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e9ecef; }
            .button { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; color: #6c757d; }
            .order-details { background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Order Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.firstName},</h2>
              <p>Thank you for your order! We've received your order and it's being processed.</p>
              
              <div class="order-details">
                <h3>Order Details:</h3>
                <p><strong>Order Number:</strong> ${data.orderNumber}</p>
                <p><strong>Total Amount:</strong> ${data.total} ${data.currency}</p>
              </div>
              
              <p style="text-align: center;">
                <a href="${data.orderUrl}" class="button">View Order</a>
              </p>
              
              <p>We'll send you another email when your order ships.</p>
            </div>
            <div class="footer">
              <p>Thank you for choosing our B2B platform!</p>
            </div>
          </div>
        </body>
      </html>
    `

    const text = `
Hello ${data.firstName},

Thank you for your order! We've received your order and it's being processed.

Order Details:
- Order Number: ${data.orderNumber}
- Total Amount: ${data.total} ${data.currency}

View your order: ${data.orderUrl}

We'll send you another email when your order ships.

Thank you for choosing our B2B platform!
    `

    return this.sendEmail({
      to: data.to,
      subject,
      html,
      text,
    })
  }
}

export default EmailService

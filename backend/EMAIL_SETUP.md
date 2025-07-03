# Email Setup Guide

This guide explains how to configure email functionality for both development and production environments.

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

### Required Variables

```bash
# Email Configuration
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL Configuration
STOREFRONT_URL=http://localhost:8000  # Development
# STOREFRONT_URL=https://yourdomain.com  # Production
```

### Optional Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/medusa

# CORS Configuration
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:8000

# JWT and Cookie Secrets
JWT_SECRET=your_jwt_secret_here
COOKIE_SECRET=your_cookie_secret_here
```

## Development vs Production Configuration

### Development Environment

- **STOREFRONT_URL**: `http://localhost:8000` (your local frontend)
- **EMAIL_FROM**: Can use a test email or your verified domain
- **RESEND_API_KEY**: Your Resend API key

### Production Environment

- **STOREFRONT_URL**: `https://yourdomain.com` (your live frontend)
- **EMAIL_FROM**: Must be a verified domain in Resend
- **RESEND_API_KEY**: Your production Resend API key

## Resend Setup

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Verify your domain (required for production)
4. Add the API key to your environment variables

## Testing Email Functionality

1. Start your backend server: `yarn dev`
2. Start your frontend server: `yarn dev` (runs on port 8000)
3. Send an employee invite from the frontend
4. Check the email inbox for the invitation
5. Click the invite link (should work with localhost:8000 in development)

## Production Deployment

When deploying to production:

1. Update `STOREFRONT_URL` to your actual domain
2. Ensure your domain is verified in Resend
3. Update CORS settings to allow your production domain
4. Use strong JWT and cookie secrets
5. Set up proper SSL certificates

## Troubleshooting

### Invite Links Not Working

- Check that `STOREFRONT_URL` matches your frontend URL
- Ensure the frontend has the `/invite/[token]` route implemented
- Verify the invite token is being generated correctly

### Emails Not Sending

- Verify your Resend API key is correct
- Check that your domain is verified in Resend
- Ensure `EMAIL_FROM` is a valid email address

### CORS Errors

- Update CORS settings to include your frontend domain
- For development: `http://localhost:8000`
- For production: `https://yourdomain.com`

## Features

The email system supports:

- **Employee Invites**: Send invitations to join companies
- **Password Resets**: Send password reset links
- **Order Confirmations**: Send order confirmation emails

## Testing

For development, you can use Resend's sandbox mode or set up a test domain. All emails will be sent through Resend's infrastructure.

## Production Considerations

1. **Domain Verification**: Verify your domain in Resend for better deliverability
2. **Email Templates**: Customize email templates in `src/modules/email/service.ts`
3. **Rate Limits**: Resend has generous rate limits (3,000 emails/month free)
4. **Monitoring**: Use Resend's dashboard to monitor email delivery and bounces

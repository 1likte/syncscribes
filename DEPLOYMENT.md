# Production Deployment Guide

This guide provides step-by-step instructions for deploying MasterBook to production.

## Prerequisites

- Node.js 18+ and npm
- Database (PostgreSQL recommended, SQLite for small deployments)
- Stripe account with API keys
- Domain name (for production)
- Server/VPS or hosting platform (Vercel, Railway, Render, etc.)

## Environment Variables

### Required Environment Variables

Create a `.env.production` file (or set these in your hosting platform):

```bash
# NextAuth Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key-minimum-32-characters

# Database
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"

# Stripe Configuration (use LIVE keys in production)
STRIPE_SECRET_KEY=sk_live_your_live_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_stripe_publishable_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Admin Credentials (MUST CHANGE!)
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-secure-admin-password

# Node Environment
NODE_ENV=production
```

### Generating NEXTAUTH_SECRET

Generate a secure secret key:

```bash
openssl rand -base64 32
```

### Local Development Variables

For local development, create a `.env.local` file:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-dev-secret-key

# Database (SQLite for local dev)
DATABASE_URL="file:./dev.db"

# Stripe Configuration (use TEST keys)
STRIPE_SECRET_KEY=sk_test_your_test_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_test_stripe_publishable_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Credentials (for local testing)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Node Environment
NODE_ENV=development
```

## Database Setup

### Option 1: PostgreSQL (Recommended for Production)

1. Create a PostgreSQL database on your hosting provider
2. Update `DATABASE_URL` in your environment variables
3. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
5. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

### Option 2: SQLite (For Small Deployments)

SQLite works for production but has limitations:
- No concurrent writes
- File system must be persistent
- Not recommended for high traffic

If using SQLite:
1. Ensure the database file path is persistent
2. Use a volume mount or persistent storage
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Database Migrations

Always run migrations before starting the app:

```bash
# Generate migration (if schema changed)
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

## Build and Deployment

### 1. Install Dependencies

```bash
npm ci
```

### 2. Build the Application

```bash
npm run build
```

This should complete without errors. If you encounter build errors, fix them before deploying.

### 3. Start Production Server

```bash
npm start
```

## Deployment Platforms

### Vercel

1. Push code to GitHub/GitLab
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Vercel automatically:
- Runs `npm run build`
- Handles serverless functions
- Provides HTTPS

### Railway / Render

1. Connect your repository
2. Set environment variables
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Deploy

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

Update `next.config.js` to enable standalone output:

```js
const nextConfig = {
  output: 'standalone',
  // ... rest of config
}
```

### Traditional VPS Deployment

1. Install Node.js and npm on server
2. Clone repository
3. Install dependencies: `npm ci`
4. Set environment variables
5. Run database migrations
6. Build: `npm run build`
7. Use PM2 to run: `pm2 start npm --name "masterbook" -- start`
8. Set up reverse proxy (nginx) for HTTPS
9. Configure domain DNS

## Stripe Webhook Setup

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

## Post-Deployment Checklist

- [ ] All environment variables set correctly
- [ ] Database migrations applied
- [ ] Build completes successfully
- [ ] Application starts without errors
- [ ] HTTPS enabled (required for Stripe)
- [ ] Stripe webhook configured and tested
- [ ] Admin account can log in
- [ ] User registration works
- [ ] Book creation works
- [ ] Payment checkout works
- [ ] Webhook receives events
- [ ] Error logging/monitoring set up

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is strong and unique
- [ ] `ADMIN_PASSWORD` is changed from default
- [ ] Database credentials are secure
- [ ] Stripe keys are production keys (not test keys)
- [ ] HTTPS is enabled
- [ ] Environment variables are not committed to git
- [ ] `.env.production` is in `.gitignore`

## Troubleshooting

### Build Fails

- Check for TypeScript errors: `npm run build`
- Ensure all environment variables are set
- Check Node.js version (18+ required)

### Database Connection Errors

- Verify `DATABASE_URL` is correct
- Check database is accessible from server
- Ensure migrations are applied

### NextAuth Errors

- Verify `NEXTAUTH_URL` matches your domain exactly
- Check `NEXTAUTH_SECRET` is set
- Ensure cookies work (HTTPS required)

### Stripe Errors

- Verify using production keys in production
- Check webhook endpoint is accessible
- Verify webhook secret matches

## Monitoring

Set up monitoring for:
- Application errors
- Database connection health
- Stripe webhook delivery
- Server resource usage

## Backup Strategy

1. Database backups (automated daily)
2. File uploads backup (if using file storage)
3. Environment variables backup (store securely)

## Performance Optimization

- Enable Next.js image optimization
- Use CDN for static assets
- Database connection pooling
- Enable caching where appropriate

## Support

For issues, check:
- Application logs
- Database logs
- Server logs
- Stripe webhook logs


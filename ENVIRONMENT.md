# Environment Variables Reference

Complete reference for all environment variables used in MasterBook.

## Required Variables

### NextAuth Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXTAUTH_URL` | Full URL of your application | `https://yourdomain.com` | Yes |
| `NEXTAUTH_SECRET` | Secret key for JWT encryption (32+ chars) | Generate with `openssl rand -base64 32` | Yes |

### Database

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | Database connection string | `postgresql://user:pass@host:5432/db` | Yes |

**SQLite format:** `file:./dev.db`  
**PostgreSQL format:** `postgresql://user:password@host:5432/database?schema=public`

### Stripe Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `STRIPE_SECRET_KEY` | Stripe secret API key | `sk_live_...` or `sk_test_...` | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_live_...` or `pk_test_...` | Yes |

**Note:** Use `live` keys for production, `test` keys for development.

### App Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_APP_URL` | Public URL of your application | `https://yourdomain.com` | Yes |

### Admin Credentials

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `ADMIN_USERNAME` | Admin login username | `admin` | Yes |
| `ADMIN_PASSWORD` | Admin login password | Strong password | Yes |

**Security Note:** Change default admin credentials in production!

## Optional Variables

| Variable | Description | Example | Default |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_IMAGE_DOMAINS` | Comma-separated image domains | `yourdomain.com,cdn.domain.com` | `localhost` |
| `NODE_ENV` | Node environment | `production`, `development` | Auto-set |

## Local Development Setup

Create a `.env.local` file:

```bash
# Copy from .env.example and adjust values
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local-dev-secret-change-in-production
DATABASE_URL="file:./dev.db"
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## Production Setup

Create a `.env.production` file (or set in hosting platform):

```bash
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-secure-key>
DATABASE_URL="postgresql://..."
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
ADMIN_USERNAME=<your-username>
ADMIN_PASSWORD=<secure-password>
NODE_ENV=production
```

## Generating Secrets

### NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Strong Password

Use a password manager or generate:
```bash
openssl rand -base64 24
```

## Environment-Specific Notes

### Development
- Use SQLite for simplicity
- Use Stripe test keys
- `NEXTAUTH_URL` should be `http://localhost:3000`
- Logging is more verbose

### Production
- Use PostgreSQL for scalability
- Use Stripe live keys
- `NEXTAUTH_URL` must match your domain exactly
- HTTPS is required
- Logging is minimized
- Admin credentials must be strong

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use different secrets** for dev/staging/production
3. **Rotate secrets** periodically
4. **Use strong passwords** (16+ characters)
5. **Limit access** to environment variables
6. **Use secret managers** (AWS Secrets Manager, Vercel Env, etc.)

## Verification

To verify all required variables are set:

```bash
# Check if variables are loaded
node -e "console.log(process.env.NEXTAUTH_URL)"
```

Or check in your application logs during startup.


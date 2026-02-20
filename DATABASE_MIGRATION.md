# Database Migration Guide

This guide covers migrating from SQLite to PostgreSQL for production deployment.

## Current Setup

The application currently uses SQLite, which is fine for development but should be migrated to PostgreSQL for production due to:

- Better concurrent write support
- Better performance at scale
- Better reliability
- Industry standard for production apps

## Migration Steps

### 1. Update Prisma Schema

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

### 2. Set Up PostgreSQL Database

Choose a provider:
- **Vercel Postgres** (if using Vercel)
- **Supabase** (free tier available)
- **Railway** (simple setup)
- **AWS RDS** (enterprise)
- **DigitalOcean Managed Database**
- **Self-hosted PostgreSQL**

Get your connection string:
```
postgresql://user:password@host:5432/database?schema=public
```

### 3. Update Environment Variables

Set `DATABASE_URL` in your production environment:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

### 4. Run Migrations

```bash
# Generate Prisma Client for PostgreSQL
npx prisma generate

# Push schema to PostgreSQL (creates tables)
npx prisma db push

# Or create a migration
npx prisma migrate dev --name init_postgresql
```

### 5. Migrate Existing Data (if needed)

If you have existing SQLite data to migrate:

#### Option A: Using Prisma Migrate (Recommended)

1. Export data from SQLite:
```bash
# Create a migration script
npx prisma migrate dev --create-only --name export_sqlite
```

2. Import to PostgreSQL manually or use a migration tool

#### Option B: Manual Migration

1. Export SQLite data to SQL/CSV
2. Transform data format if needed
3. Import to PostgreSQL

### 6. Verify Migration

```bash
# Check database connection
npx prisma db pull

# View data in Prisma Studio
npx prisma studio
```

## Schema Differences to Note

### SQLite vs PostgreSQL

| Feature | SQLite | PostgreSQL |
|---------|--------|------------|
| Boolean | Integer (0/1) | Boolean |
| String length | No limit | Can set limits |
| JSON | TEXT | Native JSON/JSONB |
| Case sensitivity | Case-insensitive by default | Case-sensitive |
| Full-text search | FTS5 extension | Full-text search built-in |

### Current Schema Compatibility

The current schema is mostly compatible, but note:

1. **String fields** - No length limits defined (works in both)
2. **Boolean fields** - Currently using String status fields (compatible)
3. **JSON storage** - Using String for tags (works in both, but PostgreSQL native JSON is better)

## Recommended Schema Improvements for PostgreSQL

### 1. Use Native JSON Type

Update the Book model:

```prisma
model Book {
  // ... existing fields
  tags Json  // Change from String to Json
  // ... rest
}
```

### 2. Add Indexes for Performance

```prisma
model Book {
  // ... fields
  @@index([category])
  @@index([status])
  @@index([authorId])
  @@map("books")
}

model Purchase {
  // ... fields
  @@index([userId])
  @@index([bookId])
  @@index([status])
  @@map("purchases")
}
```

### 3. Add Missing Fields

The code references fields that should be in the schema:

**Book.price field** (CRITICAL - code uses this):
```prisma
model Book {
  // ... existing fields
  price Float @default(0.0)  // ADD THIS
  // ... rest
}
```

**Purchase compound unique constraint** (if needed):
```prisma
model Purchase {
  // ... fields
  @@unique([userId, bookId])  // Prevents duplicate purchases
  @@map("purchases")
}
```

## Connection Pooling

For production, use a connection pooler like PgBouncer or use Prisma's built-in pooling:

```
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public&connection_limit=10&pool_timeout=20"
```

Or use a connection pooler URL:
```
DATABASE_URL="postgresql://user:password@pgbouncer-host:6432/database?schema=public"
```

## Backup Strategy

Set up automated backups:

1. **Daily backups** using pg_dump
2. **Point-in-time recovery** (if using managed PostgreSQL)
3. **Backup retention** (keep 7-30 days)

Example backup command:
```bash
pg_dump -h host -U user -d database > backup_$(date +%Y%m%d).sql
```

## Monitoring

Monitor:
- Connection count
- Query performance
- Database size
- Slow queries
- Replication lag (if using replication)

## Troubleshooting

### Connection Errors

- Check firewall rules allow your IP
- Verify credentials
- Check SSL requirements (some providers require SSL)

### Migration Errors

- Ensure database user has CREATE TABLE permissions
- Check for conflicting table names
- Verify schema name is correct

### Performance Issues

- Add indexes on frequently queried fields
- Use connection pooling
- Monitor slow queries
- Consider read replicas for heavy read workloads

## SQLite Fallback (Not Recommended)

If you must use SQLite in production:

1. Ensure file system is persistent (no ephemeral storage)
2. Use a single process (no clustering)
3. Set up file backups
4. Monitor file size
5. Be aware of write concurrency limitations

**Note:** SQLite should only be used for very small deployments with low traffic.


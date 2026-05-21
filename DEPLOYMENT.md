# FitFlow CRM Deployment

## Current database setup

The app is configured for Vercel Neon Postgres:

```env
BHW_DATABASE_POSTGRES_PRISMA_URL="postgresql://..."
DEMO_PASSWORD="FitFlow2026!"
```

Vercel creates the prefixed Neon variables automatically when the database is connected through Vercel Storage.

## Before deploying to Vercel

1. Create a Vercel project.
2. Add a hosted Postgres database through Vercel Storage, Neon, Supabase, or another provider.
3. In Vercel environment variables, confirm these exist:

```env
BHW_DATABASE_POSTGRES_PRISMA_URL="postgresql://..."
DEMO_PASSWORD="use-a-strong-temporary-password"
```

4. Pull env vars locally:

```bash
npx vercel env pull .env.development.local
```

5. Push the schema:

```bash
set -a; source .env.development.local; set +a; npx prisma db push
```

6. Deploy:

```bash
npx vercel --prod
```

## Demo logins

The seed helper creates demo owner accounts:

```text
jeffs-training@fitflow.local
bluebird-boutique-gym@fitflow.local
glowline-med-spa@fitflow.local
```

Their password is controlled by `DEMO_PASSWORD`.

For production, replace these demo accounts with real owner onboarding and unique passwords before onboarding customers.

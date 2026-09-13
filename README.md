# SMM Panel Platform

A fully-featured, production-ready SMM (Social Media Marketing) panel built with Next.js 15, React 19, Tailwind CSS, Prisma 7, and PostgreSQL.

## Features

- **Authentication:** Secure credential-based login and registration via Auth.js.
- **Provider API Integration:** Modular abstract layer to connect and sync with common SMM provider APIs (e.g. `action=services`, `action=add`).
- **Dynamic Pricing:** Fetches provider pricing and safely applies a configurable markup (e.g. +30%) for customer prices. 
- **Customer Dashboard:** Real-time wallet balance, recent transactions, order history, and intuitive service selection form.
- **Admin Panel:** Complete control over Users (balance adjustments with audit logs), Providers (sync trigger and management), and Orders.
- **Wallet & Transactions:** Atomic double-entry style tracking for deposits, order payments, refunds, and admin adjustments. Prevents negative balances and double refunds.
- **Cron Job Readiness:** An endpoint (`/api/cron/sync-orders`) ready to be hit by a cron service (Vercel Cron, cron-job.org) to poll pending order statuses and execute automatic refunds for canceled or partial orders.
- **Payment Architecture:** Extendable payment webhooks and forms ready for integration with Stripe, crypto gateways, or regional payment systems like PromptPay.

## Prerequisites

- Node.js 20+
- PostgreSQL Database
- Redis (optional, if you plan to add Upstash for rate-limiting)

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Rename `.env.example` to `.env` and fill in your details:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/smm_panel"
   AUTH_SECRET="your_secure_random_secret"
   
   SMM_API_URL="https://provider.example.com/api/v2"
   SMM_API_KEY="your_api_key_here"
   SMM_PROVIDER_NAME="Main Provider"
   
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Database Migration:**
   Apply the Prisma schema to your PostgreSQL database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

## Getting Started

1. Go to `/register` and create an account. The first registered user automatically becomes the `ADMIN`.
2. As an Admin, navigate to the **Dashboard** -> **Admin Panel** -> **Providers**.
3. If you configured the `SMM_API_URL` and `KEY` in your `.env`, a default provider is initialized. Click **Sync Services** to pull in the provider's catalog and populate your database with markup pricing.
4. As a normal User, go to **Add Funds** to simulate a deposit.
5. Go to **New Order** to place a test order. The system will deduct balance, contact the provider API, and store the `providerOrderId`.

## Deployment

This project is optimized for deployment on Vercel.

1. Connect your GitHub repository to Vercel.
2. Add the environment variables from your `.env` to the Vercel project settings.
3. Vercel will automatically run `npm run build` and deploy.
4. To enable order status polling, configure a [Vercel Cron Job](https://vercel.com/docs/cron-jobs) targeting `/api/cron/sync-orders`.

## Important Security Notes

- This implementation includes a simulated payment webhook route (`/api/payments/checkout-simulation`) for demonstration. In a real production deployment, **remove this simulation** and implement cryptographic signature verification for your payment gateway webhooks.
- Ensure `AUTH_SECRET` is generated using a secure random generator (e.g. `openssl rand -hex 32`).
- The system prevents negative balances using Prisma `$transaction` operations. Keep this architecture intact when modifying the wallet logic.

# WooCommerce Frontend Store

A modern, high-performance web storefront interacting with WooCommerce via the REST API. Built using React, Vite, Tailwind CSS, and powered by a custom Express backend for secure API proxying.

## Prerequisites

- **Node.js**: v18 or higher recommended.
- **WooCommerce Backend**: A WordPress site with the WooCommerce plugin installed.
- **WooCommerce API Keys**: You need to generate REST API keys (Read/Write permissions) in WordPress under **WooCommerce > Settings > Advanced > REST API**.

## Environment Configuration

This project requires environment variables to connect to your WooCommerce store securely. In a local environment, create a `.env` file in the root directory:

```env
VITE_WOO_API_URL=https://your-wordpress-site.com/wp-json/wc/v3
VITE_WOO_CONSUMER_KEY=ck_your_consumer_key_here
VITE_WOO_CONSUMER_SECRET=cs_your_consumer_secret_here
VITE_WOO_CF7_ID=your_contact_form_7_id
```

> **Security Note:** The Express server proxies requests to WooCommerce to ensure your `CONSUMER_KEY` and `CONSUMER_SECRET` do not leak to the client browser.

## Local Development

1. Install required dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

---

## Deployment Guide

### Option 1: CI/CD Pipeline (GitHub Actions)

This project has been configured with a GitHub Actions workflow for automated CI/CD deployments (located in `.github/workflows/deploy.yml`).

To configure the workflow to build successfully with your private keys:

1. Go to your GitHub Repository.
2. Navigate to **Settings > Secrets and variables > Actions**.
3. Click **New repository secret** and add each of the following keys with their respective values:
   - `VITE_WOO_API_URL`
   - `VITE_WOO_CONSUMER_KEY`
   - `VITE_WOO_CONSUMER_SECRET`
   - `VITE_WOO_CF7_ID`

When you push code to the `main` branch, the GitHub Action will automatically:
- Trigger the build workflow.
- Inject the secret variables into the production `.env` file.
- Build the Node.js application `npm run build`.
- Execute your deployment steps.

### Option 2: Manual VPS / Dedicated Server Deployment

If you are hosting this application manually on a Linux server using a process manager like **PM2**:

1. Clone your code onto the server:
   ```bash
   git clone <your-repo-url>
   cd <your-project-folder>
   ```

2. Create your `.env` file with your live store credentials:
   ```bash
   nano .env
   # Paste your WooCommerce credentials here and save
   ```

3. Install dependencies and build the project:
   ```bash
   npm install
   npm run build
   ```

4. Start the application using a process manager (like PM2):
   ```bash
   npm install -g pm2
   pm2 start npm --name "woo-frontend" -- start
   ```

## Key Technologies

- **Frontend**: React, React Router, Tailwind CSS, Framer Motion (for animations), Lucide React (Icons).
- **Backend**: Express.js (serves API proxy and static frontend files).
- **Tooling**: Vite, TypeScript, ESLint.

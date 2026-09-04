# 🚀 STUDIX — Full Deployment Guide

This guide walks you through deploying **Studix** to **Render** (Backend API) and **Vercel** (Frontend Client), backed by **Supabase PostgreSQL & Cloud Storage**.

---

## 📋 Architecture Overview
- **Frontend**: React 19 + Vite + Tailwind CSS (Deployed on **Vercel**)
- **Backend**: Node.js + Express + Multer (Deployed on **Render**)
- **Database & Storage**: Supabase Live PostgreSQL + `academic-resources` bucket
- **AI Engine**: OpenRouter / Google Gemini 2.0 Flash

---

## Step 1: Push Code to GitHub

Your GitHub CLI is already logged in as `@shivachaitanya27`.

Run the following commands in the project root:

```bash
# 1. Stage all clean source files (.env and node_modules are protected by .gitignore)
git add .

# 2. Make initial commit
git commit -m "Production release: Studix DSU Academic Platform"

# 3. Create a public or private GitHub repository and push
gh repo create studix-academic-app --public --source=. --remote=origin --push
```

*(If you already have an existing repository URL, run: `git remote add origin <URL> && git push -u origin main`)*

---

## Step 2: Deploy Backend API on Render (Free Tier)

Render hosts Node.js / Express servers with SSL automatically.

1. Go to **[render.com](https://dashboard.render.com/)** and log in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your GitHub repository: `studix-academic-app`.
4. Configure service settings:
   - **Name**: `studix-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
5. Add **Environment Variables** under the Environment tab:
   | Key | Value | Note |
   |---|---|---|
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `10000` | Render default port |
   | `CLIENT_URL` | `https://studix-app.vercel.app` | (Update with your Vercel URL in Step 3) |
   | `SUPABASE_URL` | `https://znsmeomxgvyfbwpuplpu.supabase.co` | From your Supabase project |
   | `SUPABASE_ANON_KEY` | *(Your Supabase anon key)* | From your `.env` |
   | `SUPABASE_SERVICE_ROLE_KEY` | *(Your Supabase service role key)* | From your `.env` |
   | `JWT_SECRET` | *(Generate a 32+ char random string)* | Secret for auth tokens |
   | `OPENROUTER_API_KEY` | *(Your OpenRouter key for AI)* | From your `.env` |
   | `OPENROUTER_GEMINI_MODEL`| `google/gemini-2.5-flash` | Gemini model ID |
6. Click **Create Web Service**.
7. Once deployed, copy your backend URL:
   `https://studix-api-xxxx.onrender.com`

---

## Step 3: Deploy Frontend on Vercel

Vercel provides global CDN edge distribution for Vite / React single-page apps.

1. Go to **[vercel.com](https://vercel.com/)** and sign in with GitHub.
2. Click **Add New...** → **Project**.
3. Import your GitHub repository: `studix-academic-app`.
4. In the configuration screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`client`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://studix-api-xxxx.onrender.com/api/v1` *(Your Render URL from Step 2)* |
   | `VITE_SUPABASE_URL` | `https://znsmeomxgvyfbwpuplpu.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | *(Your Supabase public anon key)* |
6. Click **Deploy**.
7. Vercel will build and assign your domain (e.g. `https://studix-app.vercel.app`).
8. *(Optional Final Touch)*: Go back to Render → Environment Variables and update `CLIENT_URL` with your new Vercel domain to allow strict CORS access.

---

## Step 4: Supabase Database Verification
- Your Supabase database is already live on the cloud.
- If you ever need to reset or apply updates to database tables:
  Open **[Supabase SQL Editor](https://supabase.com/dashboard/project/znsmeomxgvyfbwpuplpu/sql)** and execute [`database/schema.sql`](file:///c:/Users/ASUS/OneDrive/Desktop/FOOD%20MUCH%20APP/database/schema.sql).

---

## 🎉 Done!
Your application is live, fully connected, and ready for campus usage!

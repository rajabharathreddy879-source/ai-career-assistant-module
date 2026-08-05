# Complete Deployment Guide (Vercel + Render + Supabase)

This guide provides step-by-step instructions to deploy your full-stack **AI Career Assistant SaaS Platform** using **Supabase** (Database & Auth), **Render** (Node.js/Express Backend), and **Vercel** (Vite + React Frontend).

---

## 1. Supabase Setup (Database & Authentication)

### Step 1: Create a Supabase Project
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project**, select an organization, name your project `ai-career-assistant`, and set a database password.
3. Save your project credentials:
   - **Project URL** (`https://<project-ref>.supabase.co`)
   - **Anon Key** (`eyJ...`)
   - **Service Role Key** (`eyJ...`)

### Step 2: Run Database Migrations & RLS Script
1. In the Supabase Dashboard, open the **SQL Editor**.
2. Copy the contents of [`lib/db/schema.sql`](./lib/db/schema.sql).
3. Paste into the SQL Editor and click **Run**.
4. This creates tables (`profiles`, `chat_sessions`, `chat_messages`, `resumes`, `reports`), indexes, and RLS policies.

### Step 3: Enable Authentication Providers
1. Go to **Authentication -> Providers**.
2. **Email**: Ensure Email provider is enabled.
3. **Google OAuth** (Optional): Enable Google provider with your Google Cloud OAuth Client ID & Secret.

---

## 2. Render Deployment (Express Backend API)

### Step 1: Deploy Web Service on Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: [`https://github.com/rajabharathreddy879-source/ai-career-assistant-module`](https://github.com/rajabharathreddy879-source/ai-career-assistant-module).
4. Configure service settings:
   - **Name**: `ai-career-assistant-api`
   - **Environment**: `Node`
   - **Build Command**: `pnpm --filter @workspace/api-server run build`
   - **Start Command**: `pnpm --filter @workspace/api-server run start`

### Step 2: Configure Environment Variables in Render
Add the following in the **Environment** tab:

| Key | Value / Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `GEMINI_API_KEY` | Your Google Gemini API Key |
| `SUPABASE_URL` | Your Supabase Project URL (`https://<ref>.supabase.co`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase Service Role Key |

5. Click **Deploy Web Service**. Note down your deployed backend URL:
   `https://ai-career-assistant-api.onrender.com`

---

## 3. Vercel Deployment (Vite + React Frontend)

### Step 1: Import Project on Vercel
1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Select your GitHub repository: `ai-career-assistant-module`.
4. Configure framework & root settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `pnpm --filter @workspace/career-chat run build`
   - **Output Directory**: `artifacts/career-chat/dist`

### Step 2: Configure Environment Variables in Vercel
Add the following under **Environment Variables**:

| Key | Value |
| :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key |

### Step 3: API Proxy Rewrites
Update `vercel.json` rewrite destination with your deployed Render URL:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://ai-career-assistant-api.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

4. Click **Deploy**. Your Vercel frontend is live!

---

## 4. Verification & Testing

1. Open your live Vercel URL (e.g. `https://ai-career-assistant.vercel.app`).
2. Register a new user at `/signup`.
3. Check Supabase `profiles` table to confirm profile synchronization.
4. Navigate to `/chat`, paste a resume or job description, and send a message.
5. Confirm real-time Gemini AI response streaming and chat history saving.

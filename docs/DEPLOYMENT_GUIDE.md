# Deployment Guide - Arshinagar Account Management

## Overview
This guide will help you deploy the frontend (Next.js) and backend (Express + MongoDB) for free.

---

## Backend Deployment (Render + MongoDB Atlas)

### Step 1: Set up MongoDB Atlas (Free Database)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Sign up/Login
3. Create a **Free M0 Cluster** (512MB)
4. **Network Access**: Add `0.0.0.0/0` (allow from anywhere)
5. **Database Access**: Create a database user with password
6. Get your **Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/dbname`)
   - Replace `<password>` with your actual password

### Step 2: Deploy Backend to Render

#### Option A: Using render.yaml (Recommended)

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will detect `backend/render.yaml`
5. Set the **Root Directory** to `backend`
6. **Important**: Add these environment variables in the Render dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `CORS_ORIGIN`: Your frontend URL (e.g., `https://your-app.vercel.app`)
   - `API_BASE_URL`: Your Render backend URL (e.g., `https://arshinagar-backend.onrender.com`)
7. Click **"Apply"** and wait for deployment

#### Option B: Manual Setup

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `arshinagar-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Add environment variables (see `.env.example` in backend folder)
6. Click **"Create Web Service"**

### Step 3: Test Backend

Once deployed, visit: `https://your-backend-url.onrender.com/api/health`

You should see a health check response.

---

## Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend folder
cd frontend

# Deploy
vercel

# For production
vercel --prod
```

#### Option B: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
5. Add **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL
     Example: `https://arshinagar-backend.onrender.com`
6. Click **"Deploy"**

### Step 2: Update CORS on Backend

After frontend is deployed:

1. Go back to your Render dashboard
2. Update the `CORS_ORIGIN` environment variable to your Vercel URL
   Example: `https://arshinagar-accounts.vercel.app`
3. Save and wait for backend to redeploy

---

## Environment Variables Checklist

### Backend (Render)
Required:
- ✅ `NODE_ENV=production`
- ✅ `MONGODB_URI` (from MongoDB Atlas)
- ✅ `JWT_SECRET` (generate a random 32+ char string)
- ✅ `JWT_REFRESH_SECRET` (generate a random 32+ char string)
- ✅ `CORS_ORIGIN` (your Vercel frontend URL)
- ✅ `API_BASE_URL` (your Render backend URL)

Optional:
- `SMS_ENABLED=false` (set to true if you have SMS gateway)
- `SMS_API_KEY`, `SMS_GATEWAY_URL`, `SMS_SENDER_ID` (if SMS enabled)

### Frontend (Vercel)
Required:
- ✅ `NEXT_PUBLIC_API_URL` (your Render backend URL)

---

## Important Notes

### Free Tier Limitations

**Render Free Tier:**
- Service spins down after 15 minutes of inactivity
- First request after inactivity takes ~30-60 seconds (cold start)
- 750 hours/month free (enough for 1 service running 24/7)

**Vercel Free Tier:**
- 100GB bandwidth/month
- Fast edge network
- No cold starts

**MongoDB Atlas Free Tier:**
- 512MB storage
- Shared cluster
- Good for small-medium apps

### Cold Start Solution

If you want to prevent Render cold starts, use a free cron job service like:
- [cron-job.org](https://cron-job.org)
- [UptimeRobot](https://uptimerobot.com)

Set it to ping your backend every 10 minutes: `https://your-backend.onrender.com/api/health`

---

## Testing Deployment

1. **Backend Test:**
   ```bash
   curl https://your-backend-url.onrender.com/api/health
   ```

2. **Frontend Test:**
   - Visit your Vercel URL
   - Try logging in
   - Check browser console for any API errors

3. **Check Logs:**
   - **Render**: Dashboard → Your Service → Logs tab
   - **Vercel**: Dashboard → Your Project → Deployments → Click deployment → Runtime Logs

---

## Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Check build logs in Render dashboard
- Verify MongoDB connection string is correct

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is set in Vercel
- Check CORS settings on backend
- Check browser network tab for errors

### Database connection errors
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check database user credentials
- Test connection string locally first

---

## Next Steps

1. ✅ Set up custom domain (optional)
2. ✅ Enable HTTPS (automatic on both platforms)
3. ✅ Set up monitoring and alerts
4. ✅ Configure CI/CD for auto-deployments
5. ✅ Set up database backups

---

## Alternative Free Hosting Options

### Backend Alternatives:
- **Railway** ($5 credit/month)
- **Fly.io** (3 shared VMs free)
- **Koyeb** (1 service free)
- **Cyclic** (unlimited apps)

### Frontend Alternatives:
- **Netlify** (similar to Vercel)
- **Cloudflare Pages** (generous free tier)
- **GitHub Pages** (static sites only)

---

## Support

If you encounter issues:
1. Check the error logs on Render/Vercel
2. Verify all environment variables are set
3. Test API endpoints with Postman/curl
4. Check MongoDB Atlas connection

For more help, check:
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)

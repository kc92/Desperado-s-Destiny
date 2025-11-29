# 🤠 DESPERADOS DESTINY - SIMPLE DEV SETUP

> **Ultra-Simple Development Environment - 3 Commands to Start!**

## Prerequisites
- ✅ Node.js 18+
- ✅ Docker Desktop running

---

## 🚀 START DEVELOPMENT (3 Steps!)

### 1️⃣ Start Infrastructure (MongoDB + Redis)
```bash
docker-compose -f docker-compose.dev.simple.yml up -d
```
⏱️ Takes ~10 seconds. Both services start healthy!

### 2️⃣ Start Backend API (Terminal 1)
```bash
cd server
cp .env.development .env
npm install
npm run dev
```
🎯 Backend runs on **http://localhost:5000**

### 3️⃣ Start Frontend (Terminal 2)
```bash
cd client
cp .env.development .env
npm install
npm run dev
```
🎮 Game runs on **http://localhost:5173**

---

## ✅ Test It Works

1. Open **http://localhost:5173** in your browser
2. Click **Register** → Create account
3. Click **Create Character** → Pick faction & name
4. **PLAY THE GAME!** 🎲

---

## 🛑 STOP Development

```bash
# Stop infrastructure
docker-compose -f docker-compose.dev.simple.yml down

# Stop backend/frontend with Ctrl+C in their terminals
```

---

## 🧹 CLEAN RESET (If Things Break)

```bash
# Stop and remove ALL data (fresh start)
docker-compose -f docker-compose.dev.simple.yml down -v

# Then restart from Step 1
```

---

## 📊 What's Running?

| Service | Port | URL | Notes |
|---------|------|-----|-------|
| **Frontend** | 5173 | http://localhost:5173 | React + Vite |
| **Backend API** | 5000 | http://localhost:5000/api | Express + Socket.io |
| **MongoDB** | 27017 | mongodb://localhost:27017 | Single node, NO auth |
| **Redis** | 6379 | redis://localhost:6379 | NO password |

---

## 🔧 Useful Commands

### Check Infrastructure Status
```bash
docker-compose -f docker-compose.dev.simple.yml ps
```

### View Logs
```bash
docker-compose -f docker-compose.dev.simple.yml logs -f mongodb
docker-compose -f docker-compose.dev.simple.yml logs -f redis
```

### Connect to MongoDB (inspect data)
```bash
docker exec -it desperados-mongo-dev mongosh desperados-destiny
```

### Connect to Redis (inspect cache)
```bash
docker exec -it desperados-redis-dev redis-cli
```

---

## 🚨 Troubleshooting

### Port Already in Use?
```bash
# Check what's using ports
netstat -ano | findstr :27017  # MongoDB
netstat -ano | findstr :6379   # Redis
netstat -ano | findstr :5000   # Backend
netstat -ano | findstr :5173   # Frontend
```

### Backend Won't Connect to MongoDB?
1. Check MongoDB is running: `docker ps | findstr mongo`
2. Check `.env` file: `MONGODB_URI=mongodb://localhost:27017/desperados-destiny`
3. No auth needed for dev!

### Frontend Can't Reach Backend?
1. Check backend is running on port 5000
2. Open DevTools Console → Check for CORS errors
3. Backend should show `Server running on port 5000` message

---

## 🚢 Deploy to Production (Later!)

This simple setup is **dev-only**. For production:

### Frontend → Vercel
```bash
cd client
npm run build
# Deploy dist/ folder to Vercel
```
Set environment variables:
- `VITE_API_URL=https://your-backend.railway.app`
- `VITE_WS_URL=https://your-backend.railway.app`

### Backend → Railway
1. Connect Railway to GitHub repo
2. Railway auto-deploys on push
3. Add MongoDB + Redis as Railway services
4. Set environment variables from Railway dashboard

### MongoDB → Railway/MongoDB Atlas
- Railway: Add MongoDB service (gets connection string)
- Atlas: Free tier available at mongodb.com/cloud/atlas

### Redis → Railway/Upstash
- Railway: Add Redis service (gets connection string)
- Upstash: Free tier at upstash.com

---

**🤠 Happy coding, partner! Now git ridin' and build that Destiny Deck UI!**

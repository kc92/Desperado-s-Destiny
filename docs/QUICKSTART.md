# DESPERADOS DESTINY - QUICK START GUIDE

Get up and running in under 5 minutes!

---

## One-Command Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd desperados-destiny

# 2. Run setup (creates .env with secure secrets)
npm run setup

# 3. Install dependencies
npm install

# 4. Start everything with Docker
npm run dev
```

Wait 30-60 seconds for services to start, then visit:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000/health

---

## What Just Happened?

### Setup Script (`npm run setup`)
- Created `.env` file from `.env.example`
- Generated secure JWT secrets
- Created necessary directories
- Set up MongoDB initialization script

### Docker Services Started (`npm run dev`)
- **MongoDB** - Database running on port 27017
- **Redis** - Cache running on port 6379
- **Backend** - Node.js API on port 5000
- **Frontend** - React app on port 5173

---

## Verify Everything Works

```bash
# Check service health
npm run health
```

You should see:
```
✓ Backend API is healthy
✓ Frontend is healthy
✅ System is ready!
```

---

## Common Commands

```bash
# Development
npm run dev              # Start all services
npm run stop             # Stop all services
npm run logs             # View all logs

# Specific logs
npm run logs:backend     # Backend only
npm run logs:frontend    # Frontend only

# Clean up
npm run clean            # Remove all containers and volumes
```

---

## Troubleshooting

### Port Already in Use

If you see "port already allocated" errors:

1. Check what's using the port:
   ```bash
   # Windows
   netstat -ano | findstr :5000

   # Mac/Linux
   lsof -i :5000
   ```

2. Stop the conflicting service or change ports in `.env`

### Docker Not Running

Make sure Docker Desktop is running:
```bash
docker --version
```

If not installed, download from: https://www.docker.com/products/docker-desktop

### Services Not Healthy

Wait a bit longer (MongoDB takes ~30 seconds to start), then check:
```bash
npm run logs
```

Look for errors in the output.

---

## Next Steps

1. **Read the docs:**
   - [DEVELOPMENT.md](DEVELOPMENT.md) - Complete development guide
   - [CONTRIBUTING.md](CONTRIBUTING.md) - Code style and workflow
   - [docs/game-design-document.md](docs/game-design-document.md) - Game design

2. **Explore the code:**
   - `server/src/` - Backend code
   - `client/src/` - Frontend code
   - `shared/types/` - Shared TypeScript types

3. **Start coding:**
   - Pick an issue from the backlog
   - Create a feature branch
   - Make your changes (hot reload is enabled!)
   - Run tests and lint before committing

---

## Need Help?

- Check [DEVELOPMENT.md](DEVELOPMENT.md) for detailed troubleshooting
- Review logs: `npm run logs`
- Check service status: `docker-compose ps`

---

**That's it! You're ready to build the frontier.**

Happy coding, partner! 🤠

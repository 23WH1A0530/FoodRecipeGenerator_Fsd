# RecipeVault Pro — Claude Code Quick Start

## If you have Claude Code in VS Code, paste this ONE command into the terminal:

```bash
cd backend && npm install && cd ../frontend && npm install && cd ../backend && node seed.js && npm start &
```

Then open a second terminal and run:
```bash
cd frontend && npm run dev
```

Then open: http://localhost:3000
Login: demo@recipevault.com / demo1234

---

## BEFORE running — edit backend/.env:

Replace line 1 with your MongoDB Atlas URI:
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.XXXXX.mongodb.net/recipevault?retryWrites=true&w=majority
```

Get free MongoDB Atlas at: https://cloud.mongodb.com

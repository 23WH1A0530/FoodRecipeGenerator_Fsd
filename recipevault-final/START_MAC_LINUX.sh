#!/bin/bash
clear
echo ""
echo "============================================================"
echo "  RecipeVault Pro - BTech Mini Project"
echo "  Full Stack MERN Application"
echo "============================================================"
echo ""

# Check Node.js
if ! command -v node &>/dev/null; then
    echo " [ERROR] Node.js is NOT installed!"
    echo ""
    echo " Install from: https://nodejs.org"
    echo " Then run this script again."
    exit 1
fi

echo " [OK] Node.js: $(node --version)"

# Check .env configured
if grep -q "YOUR_MONGODB_ATLAS_URI_HERE" backend/.env; then
    echo ""
    echo "============================================================"
    echo "  IMPORTANT: Configure MongoDB Atlas URI first!"
    echo "============================================================"
    echo ""
    echo " Steps:"
    echo " 1. Go to https://cloud.mongodb.com"
    echo " 2. Create free M0 cluster"
    echo " 3. Database Access > Add user: admin / admin1234"
    echo " 4. Network Access > Allow 0.0.0.0/0"
    echo " 5. Connect > Drivers > Copy URI"
    echo " 6. Open backend/.env and replace YOUR_MONGODB_ATLAS_URI_HERE"
    echo " 7. Run this script again"
    echo ""
    exit 1
fi

echo " [OK] MongoDB URI configured"
echo ""

# Install backend
echo " [1/4] Installing backend dependencies..."
cd backend && npm install
if [ $? -ne 0 ]; then echo " [ERROR] Backend install failed!"; exit 1; fi
echo " [OK] Backend ready"
cd ..

# Install frontend
echo ""
echo " [2/4] Installing frontend dependencies..."
cd frontend && npm install
if [ $? -ne 0 ]; then echo " [ERROR] Frontend install failed!"; exit 1; fi
echo " [OK] Frontend ready"
cd ..

# Seed
echo ""
echo " [3/4] Seeding database with 10 recipes..."
cd backend && node seed.js
if [ $? -ne 0 ]; then echo " [ERROR] Seed failed! Check MongoDB URI."; cd ..; exit 1; fi
cd ..
echo " [OK] Database seeded"

echo ""
echo "============================================================"
echo "  STARTING SERVERS..."
echo "============================================================"
echo ""
echo "  Backend  >> http://localhost:5000"
echo "  Frontend >> http://localhost:3000"
echo ""
echo "  Login: demo@recipevault.com / demo1234"
echo "============================================================"
echo ""

# Start backend
cd backend && npm start &
BACKEND=$!
cd ..

sleep 3

# Start frontend
cd frontend && npm run dev &
FRONTEND=$!
cd ..

sleep 3

# Open browser (Mac)
if command -v open &>/dev/null; then
    open http://localhost:3000
elif command -v xdg-open &>/dev/null; then
    xdg-open http://localhost:3000
fi

echo " Both servers running. Press Ctrl+C to stop."
wait $BACKEND $FRONTEND

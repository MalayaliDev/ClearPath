# 🎓 ClearPath – Intelligent Complaint Management Portal

**A modern, full-stack complaint resolution platform for educational institutions**

ClearPath streamlines student complaints, enables AI-powered mentor support, and provides comprehensive staff management tools with a beautiful, intuitive interface. Built as a Brototype competition submission showcasing production-ready architecture and innovative features.

---

## � What Makes ClearPath Special

| Feature | Benefit |
|---------|---------|
| 📝 **Smart Complaints** | Students submit, track, and resolve complaints in real-time |
| 🤖 **AI Mentor Lab** | Intelligent coaching and response suggestions for staff |
| 📚 **PDF Knowledge Base** | Upload PDFs → AI generates summaries, Q&A, and study materials |
| 📊 **Exam Generator** | Create custom MCQ exams from uploaded materials |
| 👥 **Staff Dashboard** | Complete admin panel for user & ticket management |
| 🎨 **Beautiful UI** | Warm, modern design with smooth animations |
| 📱 **Fully Responsive** | Works perfectly on desktop, tablet, and mobile |
| 🔐 **Secure & Fast** | JWT auth, role-based access, optimized performance |

## ⚡ Quick Start (5 minutes)

### Prerequisites
- Node.js v16+
- MongoDB Atlas account
- Git

### Step 1: Backend Setup

```bash
cd backend
npm install

# Create .env file
echo "MONGO_URI=your_mongodb_uri" > .env
echo "JWT_SECRET=your_secret_key_here" >> .env
echo "PORT=5000" >> .env

# Start backend
npm run dev
```

✅ Backend runs on `http://localhost:5000`

### Step 2: Frontend Setup

```bash
cd frontend
npm install

# Create .env.local file
echo "VITE_API_URL=http://localhost:5000" > .env.local

# Start frontend
npm run dev
```

✅ Frontend runs on `http://localhost:5173`

### Step 3: Login & Explore

1. Open `http://localhost:5173`
2. Login with your credentials (sent via Google Form)
3. Explore all features!

## 🎯 Core Features

- **📝 Complaint Management** – Submit, track, and resolve complaints in real-time
- **🤖 Mentor Lab** – AI coaching and smart response suggestions for staff
- **📚 PDF Lab** – Upload PDFs, get AI summaries, interactive Q&A
- **📊 Exam Lab** – Generate custom MCQ exams from PDFs
- **👥 User Management** – Role-based access for students, staff, and admins
- **🔐 Security** – JWT auth, password hashing, protected routes, CORS

## � API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/complaints` | GET/POST | List/create complaints |
| `/api/complaints/:id` | GET/PUT/DELETE | Manage complaint |
| `/api/pdf/upload` | POST | Upload PDF |
| `/api/pdf/uploads/recent` | GET | Get recent uploads |
| `/api/pdf/chats` | GET | Get chat history |
| `/api/pdf/ask` | POST | Ask PDF question |
| `/api/exam/history` | GET | Get exam history |
| `/api/user/profile` | GET/PUT | User profile |

## 🛠 Tech Stack

**Frontend:** React 18 • Vite • Tailwind CSS • Lucide Icons • Axios • React Router

**Backend:** Node.js • Express • MongoDB • Mongoose • JWT • bcryptjs

## � Deployment

### Deploy Backend (Railway/Render/Fly.io)

```bash
# Set environment variables
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
NODE_ENV=production

# Deploy
npm start
```

### Deploy Frontend (Vercel/Netlify)

```bash
# Build
npm run build

# Set environment variable
VITE_API_URL=your_backend_url

# Deploy dist/ folder
# Enable SPA routing: rewrite /* → /index.html
```

## 🐛 Troubleshooting

**401 Errors?** Clear localStorage, sign out, and log back in.

**MongoDB Issues?** Verify URI format and IP whitelist in MongoDB Atlas.

**CORS Errors?** Update allowed origins in `backend/src/app.js`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 🎉 Made by

**Malayali Developer (AKA Ryan)**

Built with ❤️ for the Brototype Competition

---

**Version:** 1.0.0 | **Last Updated:** December 2025 | **Status:** Active Development

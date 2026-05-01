# 🛡️ VitalWatch — AI Public Health Awareness Chatbot

Modern React + Tailwind CSS frontend with **role-based authentication**, multi-page routing, and a full component architecture.

---

## 👥 3 User Roles

| Role           | Access                                      | Demo Login                         |
|----------------|---------------------------------------------|------------------------------------|
| 👤 Public User  | AI Chatbot, disease alerts, map, reports    | `user@demo.com` / `user123`        |
| 🛠️ Admin        | User management, alert CRUD, report ingestion | `admin@demo.com` / `admin123`    |
| 👑 Super Admin  | Full platform — system config, audit logs, admin promotion | `super@demo.com` / `super123` |

---

## 📁 Project Structure

```
vitalwatch/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
│
└── src/
    ├── main.jsx                          ← Entry point
    ├── App.jsx                           ← BrowserRouter + all routes
    ├── index.css                         ← Tailwind + base styles
    │
    ├── context/
    │   └── AuthContext.jsx               ← Global auth state (login/logout/user/role)
    │
    ├── routes/
    │   └── ProtectedRoute.jsx            ← Role-based route guard
    │
    ├── data/
    │   └── mockData.js                   ← All mock data + AI bot response engine
    │
    ├── components/
    │   ├── ui/
    │   │   ├── index.jsx                 ← Reusable UI: Badge, Button, Input, StatCard, Avatar…
    │   │   └── Toast.jsx                 ← Global toast notification system
    │   │
    │   ├── layout/
    │   │   └── Navbar.jsx                ← Universal sticky nav (role-aware, tab-based)
    │   │
    │   ├── chat/
    │   │   ├── ChatWindow.jsx            ← Full chat UI with state & AI response
    │   │   └── ChatParts.jsx             ← MessageBubble, TypingIndicator, QuickPills
    │   │
    │   └── dashboard/
    │       └── DashWidgets.jsx           ← DiseaseSidebar, OutbreakMap, WeeklyTrend,
    │                                         NotificationPanel, SOSButton, RightPanel
    │
    └── pages/
        ├── LandingPage.jsx               ← Public marketing/landing page
        │
        ├── auth/
        │   ├── LoginPage.jsx             ← Login form + demo account filler
        │   ├── SignupPage.jsx            ← Registration form with validation
        │   └── UnauthorizedPage.jsx      ← 403 page
        │
        ├── user/
        │   └── UserDashboard.jsx         ← Chat + alerts + map + 3-col layout
        │
        ├── admin/
        │   └── AdminDashboard.jsx        ← Tabbed: Overview, Users, Reports, Alerts
        │
        └── superadmin/
            └── SuperAdminDashboard.jsx   ← Tabbed: Overview, Users, Admins, System, Logs
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser
http://localhost:5173
```

---

## 🔐 Auth Flow

1. Visit `/` → Landing page
2. Click **Sign In** → `/login`
3. On login success, **auto-redirected** based on role:
   - `user`       → `/dashboard`
   - `admin`      → `/admin`
   - `superadmin` → `/superadmin`
4. Accessing a page above your role → `/unauthorized`

---

## 🔌 Connecting Your Backend

### 1. Replace mock auth in `AuthContext.jsx`
```js
// Replace mock lookup with:
const res = await fetch("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password })
});
const { user, token } = await res.json();
```

### 2. Replace chat bot in `ChatWindow.jsx`
```js
// Replace getBotResponse(text) with:
const res = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: text, location: user.location })
});
```

### 3. Replace mock data arrays in `mockData.js`
- `ALERTS`, `DISEASES`, `TRENDS` → fetch from FastAPI/Node.js + MongoDB
- `ADMIN_USERS` → fetch from your users collection

---

## 🛠️ Tech Stack

| Layer      | Tech                            |
|------------|---------------------------------|
| Framework  | React 18 + React Router v6      |
| Styling    | Tailwind CSS 3                  |
| Bundler    | Vite 5                          |
| Auth       | Context API (swap with JWT)     |
| Fonts      | Syne (headings) + DM Sans       |
| Backend    | FastAPI / Node.js (connect later)|
| Database   | MongoDB + Vector DB (connect later)|

---

## ⚠️ Disclaimer

VitalWatch is a **health awareness tool**, not a medical diagnostic tool.
Always consult a qualified healthcare provider for medical concerns.

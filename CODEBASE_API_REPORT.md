# VitalWatch Codebase - Complete API & Functions Report
**Generated: May 2, 2026**

---

## 📋 TABLE OF CONTENTS
1. [Backend API Endpoints](#backend-api-endpoints)
2. [Backend Services & Business Logic](#backend-services--business-logic)
3. [Authentication & Authorization](#authentication--authorization-system)
4. [Frontend Architecture](#frontend-architecture)
5. [Integration Points](#integration-points-frontend--backend)
6. [Technology Stack](#key-technologies--patterns)

---

## 🔌 BACKEND API ENDPOINTS

### **AUTH ROUTER** (`/auth`)
Public authentication endpoints

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/auth/register` | `register()` | Public signup for new users. Validates input, checks duplicate emails, creates user with "user" role, hashes password, increments total user count, logs audit entry. Returns user object without password. |
| POST | `/auth/login` | `login()` | Login for all 3 roles (user, admin, superadmin). Checks User collection first, then SuperAdmin collection. Validates password, sets JWT token in cookie (24h expiry), updates lastLogin timestamp, logs audit entry. Returns token, role, and user details. |
| POST | `/auth/logout` | `logout()` | Clears accessToken cookie, requires `verifyToken` middleware. Returns success message. |
| GET | `/auth/me` | `getMe()` | Get current authenticated user details. Requires `Auth` middleware. Returns req.user object. |

---

### **ADMIN ROUTER** (`/admin`)
*All endpoints require `verifyToken` and `isAdmin` middleware*

Report management and user oversight endpoints

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/admin/report/upload` | `uploadReport()` | Upload health report (PDF/DOC/DOCX, max 20MB). Streams file to GridFS, saves metadata to Report collection. Triggers background RAG ingestion asynchronously. Logs audit entry. Returns report ID and status "uploaded". |
| GET | `/admin/report/all` | `getAllReports()` | Fetch all uploaded reports sorted by newest first. Populates uploadedBy user details. Returns array of report objects. |
| GET | `/admin/report/download/:id` | `downloadReport()` | Download report file from GridFS. Sets Content-Type and Content-Disposition headers. Pipes binary stream to response. |
| PATCH | `/admin/report/:id/status` | `updateReportStatus()` | Update report status (uploaded/processing/processed/failed). Validates status enum. Logs audit entry. Returns updated report. |
| DELETE | `/admin/report/:id` | `deleteReport()` | Delete report file from GridFS and metadata. Requires `canDeleteReports` permission. Logs audit entry with DANGER level. |
| GET | `/admin/users` | `getAllUsers()` | Fetch all regular users (role="user"). Requires `canViewUsers` permission. Returns users sorted by newest first. |

---

### **USER ROUTER** (`/user`)
*All endpoints require `verifyToken` middleware*

User profile management

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/user/profile` | `getProfile()` | Get authenticated user's profile (excludes password). Returns full user object. |
| PATCH | `/user/profile` | `updateProfile()` | Update user name and location fields. Validates fields. Returns updated user object. |

---

### **SUPERADMIN ROUTER** (`/superadmin`)
*All endpoints require `verifyToken` and `isSuperAdmin` middleware*

Platform-wide governance and administration

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/superadmin/stats` | `getStats()` | Get platform statistics: total users, total admins, total reports, system uptime. Recalculates counts from DB for accuracy. Updates SuperAdmin record with fresh stats. Returns platformStats object. |
| GET | `/superadmin/users` | `getAllUsers()` | Get all users and admins (all non-superadmin users). Sorted by newest first. Returns array of user objects. |
| PATCH | `/superadmin/promote/:userId` | `promoteToAdmin()` | Promote user to admin role. Sets granular permissions (canUploadReports, canManageAlerts, canViewUsers, canSendNotifications, canDeleteReports). Defaults to true except canDeleteReports=false. Increments totalAdmins stat. Logs WARN audit. Returns promoted user object. |
| PATCH | `/superadmin/demote/:userId` | `demoteToUser()` | Demote admin to user. Clears all permissions. Decrements totalAdmins stat. Logs WARN audit. |
| PATCH | `/superadmin/ban/:userId` | `banUser()` | Ban user (set isActive=false). Logs DANGER audit. |
| PATCH | `/superadmin/unban/:userId` | `unbanUser()` | Unban user (set isActive=true). Logs INFO audit. |
| DELETE | `/superadmin/delete/:userId` | `deleteUser()` | Permanently delete user from DB. Logs DANGER audit. |
| GET | `/superadmin/audit-logs` | `getAuditLogs()` | Fetch last 100 audit logs sorted newest first. Returns array of audit log objects. |

---

### **CHAT ROUTER** (`/chat`)
AI-powered disease report Q&A

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | `/chat/message` | `sendMessage()` | Chat with "Mr.Vital" AI chatbot about uploaded reports. Validates non-empty message. Calls `askReportRag()` service with message and user location. Increments AI query counter. Logs audit entry. Returns question, answer, reply, and sources (report names). |

---

### **REPORT ROUTER** (`/report`)
Public read-only report access

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| GET | `/report/all` | `getAllReports()` | Fetch all reports (no auth required). Returns array sorted newest first. |
| GET | `/report/download/:id` | `downloadReport()` | Download report file from GridFS (no auth required). |
| DELETE | `/report/:id` | `deleteReport()` | Delete report (requires `verifyToken` and `isAdmin`). |

---

## 🛠 BACKEND SERVICES & BUSINESS LOGIC

### **reportRag.js** - AI Query Engine for Disease Reports

**Purpose:** Answer user questions about uploaded disease outbreak reports using RAG (Retrieval-Augmented Generation) with OpenAI API.

**Key Functions:**

#### 1. **`classifyIntent(question)`** 
**GPT-4o-mini powered intent classification**
- Classifies question type:
  - `"aggregation"` - totals/counts (e.g., "How many dengue cases in India?")
  - `"lookup"` - specific location/disease (e.g., "Cases in Karnataka")
  - `"general"` - symptoms/advice (e.g., "How to prevent dengue?")
- Extracts entities: state, district, disease, temporal info
- Returns structured intent object with metadata

#### 2. **`getLatestWeek()`** 
**Temporal reference resolution**
- Queries ReportChunk collection for latest week/year combo
- Used when user says "this week" or "current"
- Returns week number and year

#### 3. **`buildTemporalFilter(intent)`** 
**MongoDB query filter builder**
- Converts intent timeFrame to MongoDB filters
- Supports:
  - `"latest"` - current week data
  - `"specific_week"` - exact week number
  - `"all"` - no temporal filtering
- Used by aggregation and vector search

#### 4. **`handleAggregation(intent)`** 
**Disease statistics aggregation path**
- Groups ReportChunks by disease/state
- Sums total cases and deaths
- **Filter relaxation logic:** 
  - Try strict filters first (all constraints)
  - If no results, drop temporal filter
  - If still no results, drop district filter
  - Returns top 30 results sorted by case count
- Used for user questions like "How many total cases this week?"

#### 5. **`vectorSearch(question, intent)`** 
**Vector similarity RAG search**
- Embeds user question using `getEmbedding()` function
- Searches ReportChunk embeddings with cosine similarity
- Similarity threshold: 0.20
- Returns top 8 (TOP_K) most relevant chunks
- **Filter relaxation:** Same as aggregation - tries strict → loose filters
- Used for context-specific questions

#### 6. **`generateContext(results)`** 
**LLM-powered response generation**
- Formats retrieved chunks or aggregation results into context
- Calls OpenAI to synthesize user-friendly answer
- Returns natural language response + source references

**Data Flow:**
```
User Question 
  ↓
classifyIntent() [GPT determines type & entities]
  ↓
handleAggregation() OR vectorSearch() [Fetch data]
  ↓
generateContext() [Format + generate response]
  ↓
OpenAI response generation [Natural language]
  ↓
Return answer + sources to user
```

---

### **ingest.service.js** - Report Processing Pipeline

**Purpose:** Background ingestion of uploaded health reports into RAG knowledge base for semantic search capability.

**Processing Workflow:**

1. **Idempotency Check** 
   - Skip if ReportChunks already exist for this report ID
   - Prevents duplicate processing

2. **Download from GridFS** 
   - Retrieve PDF/DOC file from MongoDB GridFS bucket
   - Handles multiple file formats

3. **Extract Text** 
   - Uses `extractPdfText()` utility
   - Parses document text for processing

4. **Extract Outbreaks (LLM-powered)** 
   - Calls `extractOutbreakChunks()` 
   - Uses GPT to identify:
     - Disease type
     - State/district location
     - Number of cases
     - Number of deaths
   - Chunks document into semantic segments

5. **Batch Embedding** 
   - Chunks batched (size: 100)
   - Each batch embedded using OpenAI `getEmbeddingsBatch()`
   - Stores vector embeddings for cosine similarity search

6. **Store in MongoDB** 
   - Inserts ReportChunks collection entries
   - Fields: text, embeddings, disease, state, district, cases, deaths, week, year, reportId
   - Enables vector similarity search

7. **Update Report Status** 
   - Sets report.status = "processed"
   - Report now searchable via chat

**Status Progression:**
```
uploaded → processing → processed (or failed)
```

**Error Handling:**
- If ingestion fails: status set to "failed"
- Logs DANGER level audit event
- Report remains in system but unsearchable

---

## 🔐 AUTHENTICATION & AUTHORIZATION SYSTEM

### User Roles

| Role | Collection | Access Level | Use Case |
|------|-----------|--------------|----------|
| **user** | Users | Limited | Regular citizens querying disease data |
| **admin** | Users | Elevated | Health officials managing reports |
| **superadmin** | SuperAdmins | Full | Platform administrators |

### Authentication Flow

1. User submits email + password
2. Backend queries Users or SuperAdmins collection
3. Password validated (bcrypt)
4. JWT token generated (24 hour expiry)
5. Token stored in:
   - HttpOnly cookie (secure, no XSS access)
   - localStorage (for frontend routing logic)
6. Token sent with every API request in Authorization header

### Token & Middleware Stack

**Middleware Chain:**
- `verifyToken` - Decodes JWT, populates `req.user`
- `Auth` - Alias for verifyToken
- `isAdmin` - Requires role === "admin" OR "superadmin"
- `isSuperAdmin` - Requires role === "superadmin"

### Admin Permission System

Granular permissions for admins (users promoted to admin role):

| Permission | Default | Controls |
|------------|---------|----------|
| `canUploadReports` | true | Upload health reports |
| `canManageAlerts` | true | Create/modify alerts |
| `canViewUsers` | true | List all users |
| `canSendNotifications` | true | Send notifications |
| `canDeleteReports` | false | Delete reports (restricted) |

**Permission Behavior:**
- When user promoted to admin: defaults to true except `canDeleteReports`=false
- Prevents accidental mass deletion on promotion
- Superadmin must explicitly grant delete permissions

### Security Features

- HttpOnly cookies prevent JavaScript access
- CORS restricted to `http://localhost:5173`
- Password hashing with bcrypt
- JWT expiration enforced
- Audit trails for sensitive operations (promote/demote/ban/delete)
- Role-based access control on every endpoint

---

## 🎨 FRONTEND ARCHITECTURE

### Pages

#### **[LandingPage.jsx](LandingPage.jsx)** - Public Marketing
- Feature showcase (6 capabilities with icons)
- Live disease outbreak corridor animation
- SOS emergency markers (hotlines, clinics)
- Floating animated germs/viruses
- Call-to-action buttons (Signup/Login)
- Animated sky gradient background

---

#### **[LoginPage.jsx](LoginPage.jsx)** - User Authentication
- Email/password form with validation
- **Demo accounts for testing:**
  - User account
  - Admin account
  - SuperAdmin account
- Single-click demo login via buttons
- Form validation before submit
- **Uses:** `useAuth()` hook → `login(email, password)`
- **Flow:** Form validation → `/auth/login` API call → JWT storage → Redirect based on role:
  - User → `/dashboard`
  - Admin → `/admin`
  - SuperAdmin → `/superadmin`
- Animated background with floating microorganisms

---

#### **[SignupPage.jsx](SignupPage.jsx)** - User Registration
- Registration form with fields:
  - Name (required)
  - Email (valid format)
  - Location (for geolocation features)
  - Password (6+ characters)
  - Confirm password (must match)
- **Client-side validations:**
  - Name not empty
  - Valid email format
  - Password minimum 6 characters
  - Password and confirm match
- **API Call:** `POST /auth/register`
- **Success Flow:** Register → Redirect to LoginPage → User logs in
- **Error Display:** Shows API error messages

---

#### **[UserDashboard.jsx](UserDashboard.jsx)** - Regular User Interface
**Purpose:** Disease outbreak monitoring and AI-powered report Q&A

**UI Tabs:**
1. **Chat** - Mr.Vital AI chatbot
2. **Alerts** - Disease alerts (toasts)
3. **Disease Map** - Geographic outbreak visualization
4. **Reports** - View uploaded reports

**Components Rendered:**
- ChatWindow - AI chatbot interface
- DashWidgets - Data visualizations:
  - DiseaseSidebar - Diseases found in reports
  - DataSourcesPanel - Report sources
  - OutbreakMap - Geographic view
  - WeeklyTrend - Time series

**Hero Stats Section:**
- Report count
- Data sources count
- Processed reports count

**Visual Elements:**
- Floating animated germs (🦠)
- Ambulances, hospitals icons
- Interactive toast notifications

**API Calls:**
- `GET /report/all` - Fetch all available reports
- `POST /chat/message` - Send question to Mr.Vital
- `GET /user/profile` - Current user details (from AuthContext)

---

#### **[AdminDashboard.jsx](AdminDashboard.jsx)** - Admin Report Management
**Purpose:** Upload reports, manage lifecycle, oversee users

**UI Tabs:**
1. **Overview** - Summary stats
2. **Users** - View all regular users
3. **Reports** - Upload/manage reports
4. **Alerts** - Create/manage alerts

**Reports Tab Features:**
- **Upload Section:**
  - File input (accepts PDF/DOC/DOCX)
  - Max file size: 20MB (enforced by backend)
  - Validation before submit
  - Async ingestion happens in background
  
- **Reports List:**
  - Sortable report table
  - Filter by source
  - Filter by status (uploaded/processing/processed/failed)
  - Download button per report
  - Status dropdown to change status
  - Delete button (if permission allows)

**Users Tab Features:**
- Table of all regular users (role="user")
- User details displayed

**API Calls:**
- `GET /admin/report/all` - Fetch all reports
- `GET /admin/users` - Fetch all users
- `POST /admin/report/upload` - Upload new report
- `PATCH /admin/report/{id}/status` - Update status
- `DELETE /admin/report/{id}` - Delete report
- `GET /admin/report/download/{id}` - Download file

---

#### **[SuperAdminDashboard.jsx](SuperAdminDashboard.jsx)** - Platform Governance
**Purpose:** Full platform administration and compliance

**UI Tabs:**
1. **Overview** - Platform statistics
2. **All Users** - User management table
3. **Admins** - Admin management
4. **Audit Logs** - Compliance & audit trail

**Overview Tab:**
- **Statistics Display:**
  - Total users registered
  - Total admins
  - Reports processed
  - System uptime

**Users Tab Features:**
- User/Admin table
- Columns: Name, Email, Role, Status, Actions
- Action buttons:
  - **Promote User → Admin** - Via `PATCH /superadmin/promote/{userId}`
  - **Demote Admin → User** - Via `PATCH /superadmin/demote/{userId}`
  - **Ban User** - Via `PATCH /superadmin/ban/{userId}` (isActive=false)
  - **Unban User** - Via `PATCH /superadmin/unban/{userId}` (isActive=true)
  - **Delete User** - Via `DELETE /superadmin/delete/{userId}` (permanent)

**Admins Tab:**
- Shows all current admins (user.role="admin")
- Able to demote admins
- Able to view/manage permissions

**Audit Logs Tab:**
- Last 100 audit events
- Columns:
  - **Level** - INFO/WARN/DANGER color-coded
  - **Action** - What was done (e.g., "promote", "ban", "delete")
  - **Actor** - Which admin performed action
  - **Timestamp** - When action occurred
  - **User** - User affected
- Used for compliance and security audit trails

**API Calls:**
- `GET /superadmin/stats` - Platform statistics
- `GET /superadmin/users` - All users and admins
- `PATCH /superadmin/promote/{userId}` - Promote
- `PATCH /superadmin/demote/{userId}` - Demote
- `PATCH /superadmin/ban/{userId}` - Ban
- `PATCH /superadmin/unban/{userId}` - Unban
- `DELETE /superadmin/delete/{userId}` - Delete permanently
- `GET /superadmin/audit-logs` - Get audit logs

---

### Components

#### **[ChatWindow.jsx](ChatWindow.jsx)** - AI Chatbot Interface
**Purpose:** User interaction with Mr.Vital disease AI

**Features:**
- **Message List:**
  - User messages (right-aligned, blue bubble)
  - Bot messages (left-aligned, gray bubble)
  - Auto-scroll to latest message
  
- **Quick Pill Buttons:**
  - Pre-written questions for easy access
  - Examples: "Show dengue cases", "Latest reports"
  - One-click question submission

- **Message Input:**
  - Textarea for multi-line input
  - Send button with icon
  - Disabled while waiting for response

- **Typing Indicator:**
  - Three animated dots while bot processing
  - Shows user bot is thinking

- **Sources Display:**
  - Reports used as source listed below bot response
  - Shows data attribution

**API Integration:**
- `POST /chat/message` endpoint
- Sends: message text, user location (from profile), conversation history
- Receives: question, answer, reply, sources array

---

#### **[ChatParts.jsx](ChatParts.jsx)** - Chat UI Subcomponents
**Reusable chat UI building blocks:**

- **`MessageBubble()`**
  - Renders individual message
  - User vs bot styling
  - Timestamp display
  - Markdown support

- **`TypingIndicator()`**
  - Three animated dots
  - Indicates bot processing

- **`QuickPills()`**
  - Button pills for common questions
  - Configurable questions array
  - Click handler for question selection

- **`RiskCard()`**
  - Risk assessment display
  - Percentage bars for risk levels
  - Color-coded severity

- **`Bold()`**
  - Markdown bold text parser
  - Converts **text** to bold HTML

---

#### **[DashWidgets.jsx](DashWidgets.jsx)** - Dashboard Data Displays
**Purpose:** Visualize disease and report data

**Components:**

- **`DiseaseSidebar()`**
  - Lists diseases found in uploaded reports
  - Shows case count per disease
  - Built from report text scanning

- **`DataSourcesPanel()`**
  - Lists all report data sources
  - Shows number of reports per source
  - Source attribution tracking

- **`buildDiseaseSummary()`**
  - Scans report text for disease keywords
  - Detects: dengue, malaria, cholera, TB, COVID, measles, typhoid, plague, ebola, zika
  - Aggregates case counts

- **`buildSourceSummary()`**
  - Groups reports by source/origin
  - Counts reports per source
  - Data provenance tracking

- **Placeholder Components:**
  - OutbreakMap - Geographic visualization (UI defined, logic in progress)
  - WeeklyTrend - Time series chart (UI defined, logic in progress)

---

#### **[Navbar.jsx](Navbar.jsx)** - Tab Navigation
**Purpose:** Navigate between dashboard sections

- Tab button rendering
- Active tab highlighting
- OnTabChange callback
- Used by: UserDashboard, AdminDashboard, SuperAdminDashboard

---

#### **[Toast.jsx](Toast.jsx)** - Notification System
**Purpose:** Non-blocking user notifications

**Features:**
- Configurable:
  - Icon (emoji or icon component)
  - Title
  - Body message
  - Urgency level (info/warning/danger)
- Auto-dismiss after timeout
- Manual close button
- Slide animation in/out
- Positioned bottom-right corner

**Used for:** Alerts, confirmations, error messages

---

### Context (Global State)

#### **[AuthContext.jsx](AuthContext.jsx)** - Authentication State Management
**Purpose:** Centralized auth state across entire app

**State Variables:**
- `user` - Current logged-in user object:
  - userId, email, name, role, location, lastLogin, etc.
  - Persisted to localStorage
  - Cleared on logout
  
- `error` - Last authentication error message
  - Used for error display
  - Cleared on successful action

**Hook: `useAuth()`**

```javascript
const { user, login, logout, error, setError } = useAuth()
```

**Functions:**

- **`login(email, password)`**
  - Calls `POST /auth/login`
  - Validates credentials
  - Returns: `{ ok: true/false, role: 'user'|'admin'|'superadmin', user: {...} }`
  - Stores token in httpOnly cookie (24h)
  - Stores user in localStorage
  - Returns role for navigation routing

- **`logout()`**
  - Calls `POST /auth/logout`
  - Clears httpOnly cookie
  - Clears localStorage
  - Resets user state to null

- **`useEffect()` on mount**
  - Auto-refreshes user from token on page load
  - Calls `GET /auth/me` to verify token
  - Restores user session if token valid
  - Critical for page refresh persistence

**Data Flow:**
```
User Data Flow:
Login Form
  ↓
login() function
  ↓
POST /auth/login
  ↓
Store in localStorage + httpOnly cookie
  ↓
Update AuthContext.user
  ↓
App-wide user access via useAuth() hook
  ↓
On page refresh:
  - useEffect reads token from localStorage
  - Calls GET /auth/me
  - Restores user object
```

---

## 🔗 INTEGRATION POINTS (Frontend ↔ Backend)

### Complete Data Flow Map

| Feature | Frontend Component | Backend Endpoint | Request | Response |
|---------|-------------------|------------------|---------|----------|
| **Register** | SignupPage form | `POST /auth/register` | name, email, location, password | user object |
| **Login** | LoginPage form | `POST /auth/login` | email, password | token, role, user |
| **Logout** | Navbar/any page | `POST /auth/logout` | accessToken (cookie) | success message |
| **Auto-refresh User** | AuthContext useEffect | `GET /auth/me` | JWT token | current user |
| **Get Profile** | UserDashboard | `GET /user/profile` | JWT token | user object |
| **Update Profile** | (Future UI) | `PATCH /user/profile` | name, location | updated user |
| **Upload Report** | AdminDashboard file input | `POST /admin/report/upload` | FormData + file | report ID, status |
| **List Reports** | UserDashboard, AdminDashboard | `GET /admin/report/all` or `GET /report/all` | JWT token | report array |
| **Download Report** | Download button | `GET /admin/report/download/:id` | report ID | binary file stream |
| **Update Report Status** | Status dropdown | `PATCH /admin/report/:id/status` | status enum | updated report |
| **Delete Report** | Delete button | `DELETE /admin/report/:id` | report ID | success message |
| **List Users** | AdminDashboard, SuperAdminDashboard | `GET /admin/users` or `GET /superadmin/users` | JWT token | user array |
| **AI Chat Query** | ChatWindow | `POST /chat/message` | message, location, history | answer, sources |
| **Promote User** | SuperAdminDashboard user table | `PATCH /superadmin/promote/:userId` | userId | promoted user |
| **Demote Admin** | SuperAdminDashboard user table | `PATCH /superadmin/demote/:userId` | userId | demoted user |
| **Ban User** | SuperAdminDashboard user table | `PATCH /superadmin/ban/:userId` | userId | banned user |
| **Unban User** | SuperAdminDashboard user table | `PATCH /superadmin/unban/:userId` | userId | unbanned user |
| **Delete User** | SuperAdminDashboard user table | `DELETE /superadmin/delete/:userId` | userId | success message |
| **Platform Stats** | SuperAdminDashboard overview | `GET /superadmin/stats` | JWT token | stats object |
| **Audit Logs** | SuperAdminDashboard logs tab | `GET /superadmin/audit-logs` | JWT token | audit log array |

---

## 🏗 KEY TECHNOLOGIES & PATTERNS

### Backend Stack
- **Framework:** Express.js REST API
- **Database:** MongoDB
- **File Storage:** GridFS for PDF/DOC files
- **Authentication:** JWT tokens
- **AI/ML:** OpenAI API (GPT-4o-mini, embeddings)
- **Search:** Vector embeddings + cosine similarity (RAG)
- **Async Processing:** Background job processing for report ingestion
- **Logging:** Audit logging system with levels (INFO/WARN/DANGER)

### Frontend Stack
- **Framework:** React with React Router
- **State Management:** Context API (Auth context)
- **Styling:** Tailwind CSS
- **Notifications:** Custom Toast component
- **Text Processing:** Markdown parsing (Bold component)
- **Build Tool:** Vite
- **Icons/Visuals:** Animated components, floating elements

### Architectural Patterns

| Pattern | Usage | Location |
|---------|-------|----------|
| **REST API** | Backend endpoint communication | All `/api/` routes |
| **JWT Authentication** | Secure session management | Auth middleware |
| **RBAC (Role-Based Access Control)** | Authorization | Middleware (isAdmin, isSuperAdmin) |
| **Middleware Chain** | Request processing | verifyToken → Auth → isAdmin |
| **Context API** | Global state (auth) | AuthContext.jsx |
| **RAG (Retrieval-Augmented Generation)** | AI Q&A | reportRag.js service |
| **Vector Embeddings** | Semantic search | OpenAI embeddings |
| **GridFS** | Large file storage | Report file storage |
| **Async/Background Jobs** | Report ingestion | ingest.service.js |
| **Audit Logging** | Compliance & tracking | All sensitive operations |
| **Entity Extraction** | LLM-powered data extraction | reportRag.js, ingest.service.js |

### Security Features
- HttpOnly cookies (prevent XSS)
- CORS restriction to localhost:5173
- bcrypt password hashing
- JWT expiration (24 hours)
- Role-based access control
- Permission-based operations
- Audit trails for sensitive actions
- Input validation (frontend + backend)

### Data Persistence
| Data | Storage | Purpose |
|------|---------|---------|
| User accounts | MongoDB Users collection | Login, profile |
| Admin accounts | MongoDB Users collection (role=admin) | Elevated access |
| SuperAdmin accounts | MongoDB SuperAdmins collection | Full platform control |
| Reports | MongoDB Reports collection + GridFS | Metadata + file storage |
| Report chunks | MongoDB ReportChunks collection | RAG vector search |
| Audit logs | MongoDB AuditLog collection | Compliance tracking |
| Embeddings | ReportChunk.embeddings field | Vector similarity search |

---

## 📊 SYSTEM SUMMARY

### What is VitalWatch?
A **disease outbreak intelligence platform** designed for:
- **Citizens:** Monitor disease outbreaks, chat with AI about diseases
- **Health Officials:** Upload outbreak reports, track data
- **Platform Admins:** Manage users, generate audit trails

### Key Capabilities
1. **Report Management** - Upload, store, download health reports
2. **AI-Powered Q&A** - Ask Mr.Vital about disease outbreaks using RAG
3. **Vector Search** - Semantic search across embedded report chunks
4. **User Management** - Register, authenticate, manage roles/permissions
5. **Audit Logging** - Track all sensitive operations for compliance
6. **Disease Intelligence** - Extract disease data, aggregate statistics

### Data Processing Pipeline
```
Upload Report (PDF/DOC)
  ↓ (GridFS storage)
Background Ingestion
  ↓
Extract Text & Entities (LLM)
  ↓
Chunk & Embed (OpenAI embeddings)
  ↓
Store in ReportChunks
  ↓
User asks question
  ↓
Vector search + retrieval
  ↓
Generate response (OpenAI)
  ↓
Return answer + sources
```

### Technology Integration
- **Frontend** communicates with **Backend REST APIs**
- **Backend** queries **MongoDB** for data
- **Async processes** ingest reports in background
- **OpenAI API** provides LLM and embedding services
- **Authentication** via JWT tokens across all protected endpoints

---

**Report Generated:** May 2, 2026  
**Codebase:** VitalWatch (Frontend + Backend)  
**Coverage:** All APIs, services, components, and integration points

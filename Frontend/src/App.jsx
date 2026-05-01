import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import ToastContainer from "./components/ui/Toast";
 
import LandingPage          from "./pages/LandingPage";
import LoginPage            from "./pages/auth/LoginPage";  
import SignupPage           from "./pages/auth/SignupPage";   
import UnauthorizedPage     from "./pages/auth/UnauthorizedPage";
import UserDashboard        from "./pages/user/UserDashboard";
import AdminDashboard       from "./pages/admin/AdminDashboard";
import SuperAdminDashboard  from "./pages/superadmin/SuperAdminDashboard";
 
function PublicOnly({ children }) {
  const { user } = useAuth();
  if (!user) return children;
  if (user.role === "superadmin") return <Navigate to="/superadmin" replace />;
  if (user.role === "admin")      return <Navigate to="/admin"      replace />;
  return <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      

      <Route path="/"             element={<LandingPage />} />
      <Route path="/login"        element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/signup"       element={<PublicOnly><SignupPage /></PublicOnly>} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

     
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={["user","admin","superadmin"]}>
          <UserDashboard />
        </ProtectedRoute>
      } />
 


      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={["admin","superadmin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />



      <Route path="/superadmin"
       element={
        <ProtectedRoute allowedRoles={["superadmin"]}>
          <SuperAdminDashboard />
        </ProtectedRoute>
      } />
 
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

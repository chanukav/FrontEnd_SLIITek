import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AdminLayout } from "./components/admin/layout/AdminLayout"
import { Dashboard } from "./pages/admin/Dashboard/Dashboard"
import { Users } from "./pages/admin/Users/Users"
import { Reports } from "./pages/admin/Reports/Reports"
import { Notifications } from "./pages/admin/Notifications/Notifications"
import { Settings } from "./pages/admin/Settings/Settings"
import { UserLayout } from "./components/user/layout/UserLayout"
import { Dashboard as UserDashboard } from "./pages/user/Dashboard/Dashboard"
import { Profile as UserProfile } from "./pages/user/Profile/Profile"
import { Notifications as UserNotifications } from "./pages/user/Notifications/Notifications"
import { Messages as UserMessages } from "./pages/user/Messages/Messages"
import { Settings as UserSettings } from "./pages/user/Settings/Settings"
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/User/login";
import SignupPage from "./pages/User/SIgnUP";
import ForgotPassword from "./pages/User/ForgotPassword";
import UserDashboard from "./pages/User/UserDashboard";
import StaffDashboard from "./pages/User/StaffDashboard";
import { useAuth } from "./context/AuthContext";

const DashboardRedirect = () => {
  const { auth } = useAuth();

  if (auth?.user?.role === "admin" || auth?.user?.role === "moderator") {
    return <Navigate to="/dashboard/staff" replace />;
  }

  return <Navigate to="/dashboard/user" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<UserDashboard />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="notifications" element={<UserNotifications />} />
          <Route path="messages" element={<UserMessages />} />
          <Route path="settings" element={<UserSettings />} />
        </Route>
      </Routes>
    </Router>
  )
      <AuthProvider>
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<SignupPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
          <Route
            path="/dashboard/user"
            element={
              <ProtectedRoute allowedRoles={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff"
            element={
              <ProtectedRoute allowedRoles={["admin", "moderator"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner"
import { AdminLayout } from "./components/admin/layout/AdminLayout"
import { Dashboard } from "./pages/admin/Dashboard/Dashboard"
import { Users } from "./pages/admin/Users/Users"
import { Reports } from "./pages/admin/Reports/Reports"
import { Notifications } from "./pages/admin/Notifications/Notifications"
import { Settings } from "./pages/admin/Settings/Settings"
import { Profile as UserProfile } from "./pages/User/Profile/Profile"
import { Messages as UserMessages } from "./pages/User/Messages/Messages"
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/User/login";
import SignupPage from "./pages/User/SIgnUP";
import VerifyEmailPage from "./pages/User/VerifyEmail";
import ForgotPassword from "./pages/User/ForgotPassword";
import StaffDashboard from "./pages/User/StaffDashboard";
import NewUserDashboard from "./pages/User/NewUserDashboard";
import CommunitiesPage from "./pages/User/CommunitiesPage";
import { useAuth } from "./context/AuthContext";
import QuestionsPage from "./pages/Questions";
import QuestionDetailsPage from "./pages/QuestionDetails";
import EditQuestionPage from "./pages/EditQuestion";
import LandingPage from "./pages/Landing/LandingPage";
import HomePage from "./pages/Home/HomePage";

const DashboardRedirect = () => {
  const { auth } = useAuth();
  // Everyone goes to /home after login
  return <Navigate to="/home" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="bottom-right" richColors closeButton />
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth routes */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/questions"
            element={
              <ProtectedRoute>
                <QuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions/:id"
            element={
              <ProtectedRoute>
                <QuestionDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions/:id/edit"
            element={
              <ProtectedRoute>
                <EditQuestionPage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin", "moderator"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="reports" element={<Reports />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Role based dashboard redirects */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

          {/* Primary user dashboard — NewUserDashboard (single source of truth) */}
          <Route
            path="/dashboard/user"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "moderator"]}>
                <NewUserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/profile"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "moderator"]}>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/notifications"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "moderator"]}>
                <Navigate to="/dashboard/user?tab=notifications" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/messages"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "moderator"]}>
                <UserMessages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/settings"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "moderator"]}>
                <Navigate to="/dashboard/user?tab=settings" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/questions"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "moderator"]}>
                <QuestionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/user/communities"
            element={
              <ProtectedRoute allowedRoles={["user", "admin", "moderator"]}>
                <CommunitiesPage />
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

          {/* Home — main app shell (all logged-in roles) */}
          <Route
            path="/home/*"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
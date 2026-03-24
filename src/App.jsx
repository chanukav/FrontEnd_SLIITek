import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/User/login";
import Dashboard from "./pages/User/dashboard";
import SignupPage from "./pages/User/SIgnUP";
import ForgotPassword from "./pages/User/ForgotPassword";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<SignupPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
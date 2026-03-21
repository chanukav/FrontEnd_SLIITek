import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AdminLayout } from "./components/admin/layout/AdminLayout"
import { Dashboard } from "./pages/admin/Dashboard/Dashboard"
import { Users } from "./pages/admin/Users/Users"
import { Reports } from "./pages/admin/Reports/Reports"
import { Notifications } from "./pages/admin/Notifications/Notifications"
import { Settings } from "./pages/admin/Settings/Settings"

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
      </Routes>
    </Router>
  )
}

export default App

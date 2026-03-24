import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

const UserDashboard = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const res = await api.get("/auth/login-logs", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      setLogs(res.data);
    };

    fetchLogs().catch(console.error);
  }, [auth.token]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#c9cedc] p-6">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white shadow-xl border border-[#343e43]/20">
        <header className="flex items-center justify-between rounded-t-2xl bg-[#343e43] px-6 py-4 text-white">
          <h1 className="text-2xl font-bold">User Dashboard</h1>
          <button onClick={handleLogout} className="rounded-lg bg-[#f9bf3b] px-4 py-2 font-semibold text-[#343e43]">Logout</button>
        </header>

        <div className="p-6">
          <p className="text-lg text-[#343e43]">Welcome, {auth.user?.name}</p>
          <p className="text-[#343e43]/80">{auth.user?.email}</p>

          <h2 className="mt-6 text-xl font-semibold text-[#343e43]">Recent Login Activity</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-[#343e43]/20">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#343e43] text-white">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index} className="border-t border-[#343e43]/10">
                    <td className="px-4 py-3">{new Date(log.time).toLocaleString()}</td>
                    <td className="px-4 py-3">{log.ip}</td>
                    <td className="px-4 py-3 capitalize">{log.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

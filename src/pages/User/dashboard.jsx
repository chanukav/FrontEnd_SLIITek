import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

const Dashboard = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const successCount = logs.filter((log) => log.status === "success").length;
  const failedCount = logs.filter((log) => log.status !== "success").length;
  const latestLogin = logs.length ? new Date(logs[0].time).toLocaleString() : "No records yet";

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/auth/login-logs", {
          params: { email: auth.user?.email },
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        setLogs(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    if (auth.user?.email) fetchLogs();
  }, [auth.user?.email, auth.token]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.log(error);
    } finally {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c9cedc] p-6">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/40 bg-white/10 p-10 shadow-2xl backdrop-blur-xl md:p-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white md:text-4xl">Dashboard</h1>
            <p className="mt-2 text-white/80">
              Welcome, {auth.user?.name}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full bg-white px-6 py-3 font-bold text-black shadow-md transition hover:opacity-90"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/30 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-white/70">Name</p>
            <p className="mt-1 font-semibold text-white">{auth.user?.name || "N/A"}</p>
          </div>

          <div className="rounded-2xl border border-white/30 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-white/70">Email</p>
            <p className="mt-1 font-semibold text-white">{auth.user?.email || "N/A"}</p>
          </div>

          <div className="rounded-2xl border border-white/30 bg-white/10 p-5 backdrop-blur">
            <p className="text-sm text-white/70">Role</p>
            <p className="mt-1 font-semibold uppercase text-white">{auth.user?.role || "N/A"}</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/30 bg-white/10 p-6 backdrop-blur">
          <h2 className="text-xl font-bold text-white">States Overview</h2>
          <p className="mt-1 text-sm text-white/80">Live summary of your account and login activity state.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/70">Total Logs</p>
              <p className="mt-2 text-2xl font-bold text-white">{logs.length}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/70">Successful</p>
              <p className="mt-2 text-2xl font-bold text-emerald-300">{successCount}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/70">Failed</p>
              <p className="mt-2 text-2xl font-bold text-rose-300">{failedCount}</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/70">Latest Login</p>
              <p className="mt-2 text-sm font-semibold text-white">{latestLogin}</p>
            </div>
          </div>
        </div>

        {auth.user?.role === "admin" && (
          <div className="mt-8 rounded-2xl border border-red-400/50 bg-red-500/20 p-6 text-white backdrop-blur">
            <h2 className="text-xl font-bold">Admin Access</h2>
            <p className="mt-2 text-white/90">Only admins can manage users and full system settings.</p>
          </div>
        )}

        {auth.user?.role === "manager" && (
          <div className="mt-8 rounded-2xl border border-amber-400/50 bg-amber-500/20 p-6 text-white backdrop-blur">
            <h2 className="text-xl font-bold">Manager Access</h2>
            <p className="mt-2 text-white/90">Managers can monitor reports and manage limited modules.</p>
          </div>
        )}

        {auth.user?.role === "user" && (
          <div className="mt-8 rounded-2xl border border-emerald-400/50 bg-emerald-500/20 p-6 text-white backdrop-blur">
            <h2 className="text-xl font-bold">User Access</h2>
            <p className="mt-2 text-white/90">Users can view their own dashboard and profile details.</p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-bold text-white">Recent Login Activity</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/30 bg-white/10 backdrop-blur">
            <table className="w-full text-left">
              <thead className="border-b border-white/30 bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-sm font-semibold text-white">Time</th>
                  <th className="px-4 py-3 text-sm font-semibold text-white">IP</th>
                  <th className="px-4 py-3 text-sm font-semibold text-white">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index} className="border-t border-white/20">
                    <td className="px-4 py-3 text-white/90">
                      {new Date(log.time).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-white/90">{log.ip}</td>
                    <td className="px-4 py-3 capitalize">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${log.status === "success" ? "bg-emerald-500/30 text-emerald-200" : "bg-rose-500/30 text-rose-200"}`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!logs.length && (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-sm text-white/60">
                      No login activity found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { auth, logout } = useAuth();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/login-logs?email=${auth.user?.email}`
        );
        setLogs(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    if (auth.user?.email) fetchLogs();
  }, [auth.user?.email]);

  return (
    <div className="min-h-screen bg-slate-100 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow dark:bg-slate-900 dark:text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Welcome, {auth.user?.name}
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl bg-red-500 px-4 py-2 text-white"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border p-5">
            <p className="text-sm text-slate-500">Name</p>
            <p className="mt-1 font-semibold">{auth.user?.name}</p>
          </div>

          <div className="rounded-2xl border p-5">
            <p className="text-sm text-slate-500">Email</p>
            <p className="mt-1 font-semibold">{auth.user?.email}</p>
          </div>

          <div className="rounded-2xl border p-5">
            <p className="text-sm text-slate-500">Role</p>
            <p className="mt-1 font-semibold uppercase">{auth.user?.role}</p>
          </div>
        </div>

        {auth.user?.role === "admin" && (
          <div className="mt-8 rounded-2xl bg-red-100 p-6 text-red-800">
            <h2 className="text-xl font-bold">Admin Access</h2>
            <p className="mt-2">Only admins can manage users and full system settings.</p>
          </div>
        )}

        {auth.user?.role === "manager" && (
          <div className="mt-8 rounded-2xl bg-yellow-100 p-6 text-yellow-800">
            <h2 className="text-xl font-bold">Manager Access</h2>
            <p className="mt-2">Managers can monitor reports and manage limited modules.</p>
          </div>
        )}

        {auth.user?.role === "user" && (
          <div className="mt-8 rounded-2xl bg-green-100 p-6 text-green-800">
            <h2 className="text-xl font-bold">User Access</h2>
            <p className="mt-2">Users can view their own dashboard and profile details.</p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-bold">Recent Login Activity</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3">
                      {new Date(log.time).toLocaleString()}
                    </td>
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

export default Dashboard;
import { useCallback, useEffect, useState } from "react"
import { Search, Trash2, UserCheck, UserX, Users as UsersIcon, Shield, User } from "lucide-react"

import { Button } from "../../../components/ui/button"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "../../../components/ui/dialog"
import { useAuth } from "../../../context/AuthContext"
import { api } from "../../../lib/api"

function getInitials(name) {
  if (!name || typeof name !== "string") return "?"
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

const roleStyle = {
  admin: "pill-yellow",
  moderator: "pill-blue",
  user: "pill-gray",
}

function roleLabel(role) {
  const r = String(role || "").toLowerCase()
  if (r === "admin") return "Admin"
  if (r === "moderator") return "Moderator"
  return "User"
}

export function Users() {
  const { auth } = useAuth()
  const currentUserId = auth?.user?.id ? String(auth.user.id) : null

  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [stats, setStats] = useState({ total: 0, active: 0, blocked: 0 })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setLoadError("")
    try {
      const params = roleFilter === "all" ? {} : { role: roleFilter }
      const res = await api.get("/admin/users", { params })
      const payload = res.data?.data
      if (payload?.stats) {
        setStats({
          total: payload.stats.total ?? 0,
          active: payload.stats.active ?? 0,
          blocked: payload.stats.blocked ?? 0,
        })
      }
      setUsers(Array.isArray(payload?.users) ? payload.users : [])
    } catch (e) {
      setLoadError(e?.response?.data?.message || e?.message || "Failed to load users")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [roleFilter])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleBlock = async (userRow) => {
    if (!userRow?.id || userRow.id === currentUserId) return
    const nextBlocked = userRow.status === "Active"
    try {
      await api.patch(`/admin/users/${userRow.id}/block`, { isBlocked: nextBlocked })
      await loadUsers()
    } catch (e) {
      window.alert(e?.response?.data?.message || e?.message || "Could not update user")
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedUser?.id) return
    try {
      await api.delete(`/admin/users/${selectedUser.id}`)
      setDeleteModalOpen(false)
      setSelectedUser(null)
      await loadUsers()
    } catch (e) {
      window.alert(e?.response?.data?.message || e?.message || "Could not delete user")
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Header ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">User Management</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage accounts, roles, and access control.</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-48">
            <label htmlFor="user-role-filter" className="sr-only">Filter by role</label>
            <select
              id="user-role-filter"
              className="input-theme w-full text-sm"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              className="input-theme pl-9"
              placeholder="Search by name or email…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loadError && (
        <p className="text-sm font-medium text-red-600">{loadError}</p>
      )}

      {/* ── Quick Stats ──────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: UsersIcon, label: "Total", value: stats.total, color: "#2563eb", bg: "#dbeafe" },
          { icon: UserCheck, label: "Active", value: stats.active, color: "#059669", bg: "#d1fae5" },
          { icon: UserX, label: "Blocked", value: stats.blocked, color: "#dc2626", bg: "#fee2e2" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 shadow-soft">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
              <s.icon className="h-4.5 w-4.5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-foreground leading-none">
                {loading ? "…" : s.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground text-sm">
                  Loading users…
                </td>
              </tr>
            )}
            {!loading && filteredUsers.map(user => {
              const rk = String(user.role || "").toLowerCase()
              const pillClass = roleStyle[rk] || "pill-gray"
              const isSelf = currentUserId && user.id === currentUserId
              return (
                <tr key={user.id} className="group">
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: user.status === "Blocked" ? "#fee2e2" : "#dbeafe",
                          color: user.status === "Blocked" ? "#dc2626" : "#2563eb",
                        }}
                      >
                        {getInitials(user.name)}
                      </div>
                      <span className="font-semibold text-foreground text-sm">{user.name}</span>
                    </div>
                  </td>

                  <td className="text-muted-foreground">{user.email}</td>

                  <td>
                    <span className={`pill ${pillClass}`}>
                      {rk === "admin" && <Shield className="h-2.5 w-2.5" />}
                      {rk === "moderator" && <User className="h-2.5 w-2.5" />}
                      {roleLabel(user.role)}
                    </span>
                  </td>

                  <td>
                    <span className={`pill ${user.status === "Active" ? "pill-green" : "pill-red"}`}>
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: user.status === "Active" ? "#059669" : "#dc2626", display: "inline-block" }}
                      />
                      {user.status}
                    </span>
                  </td>

                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        type="button"
                        disabled={isSelf}
                        onClick={() => handleToggleBlock(user)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40 disabled:pointer-events-none ${
                          user.status === "Active"
                            ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                            : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {user.status === "Active" ? "Block" : "Unblock"}
                      </button>
                      <button
                        type="button"
                        disabled={isSelf}
                        onClick={() => { setSelectedUser(user); setDeleteModalOpen(true) }}
                        className="h-8 w-8 rounded-lg flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-40 disabled:pointer-events-none"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}

            {!loading && filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-16 text-muted-foreground text-sm">
                  <UsersIcon className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{filteredUsers.length}</span> of{" "}
          <span className="font-medium text-foreground">{users.length}</span> users
          {roleFilter !== "all" && (
            <span className="text-muted-foreground"> (role filter)</span>
          )}
        </p>
        <div className="flex gap-2">
          <button
            disabled
            className="px-4 py-1.5 text-sm rounded-lg border border-border text-muted-foreground disabled:opacity-40"
          >
            Previous
          </button>
          <button className="px-4 py-1.5 text-sm rounded-lg border border-border hover:bg-muted transition-colors">
            Next
          </button>
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-foreground">{selectedUser?.name}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

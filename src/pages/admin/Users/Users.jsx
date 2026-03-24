import { useState } from "react"
import { Search, Trash2, UserCheck, UserX, Users as UsersIcon, Shield, User } from "lucide-react"

import { Card, CardContent } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "../../../components/ui/dialog"

const initialUsers = [
  { id: 1, name: "Alice Johnson",  email: "alice@example.com",   role: "Admin",     status: "Active" },
  { id: 2, name: "Bob Smith",      email: "bob@example.com",     role: "User",      status: "Blocked" },
  { id: 3, name: "Charlie Davis",  email: "charlie@example.com", role: "User",      status: "Active" },
  { id: 4, name: "Diana Prince",   email: "diana@example.com",   role: "Moderator", status: "Active" },
  { id: 5, name: "Evan Wright",    email: "evan@example.com",    role: "User",      status: "Active" },
]

function getInitials(name) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

const roleStyle = {
  Admin:     "pill-yellow",
  Moderator: "pill-blue",
  User:      "pill-gray",
}

export function Users() {
  const [searchTerm, setSearchTerm]   = useState("")
  const [users, setUsers]             = useState(initialUsers)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser]       = useState(null)

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggleBlock = (id) => {
    setUsers(users.map(u =>
      u.id === id ? { ...u, status: u.status === "Active" ? "Blocked" : "Active" } : u
    ))
  }

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id))
      setDeleteModalOpen(false)
      setSelectedUser(null)
    }
  }

  const activeCount  = users.filter(u => u.status === "Active").length
  const blockedCount = users.filter(u => u.status === "Blocked").length

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Header ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">User Management</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Manage accounts, roles, and access control.</p>
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

      {/* ── Quick Stats ──────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: UsersIcon, label: "Total",   value: users.length,  color: "#2563eb", bg: "#dbeafe" },
          { icon: UserCheck, label: "Active",  value: activeCount,   color: "#059669", bg: "#d1fae5" },
          { icon: UserX,     label: "Blocked", value: blockedCount,  color: "#dc2626", bg: "#fee2e2" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl border border-border p-4 flex items-center gap-3 shadow-soft">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
              <s.icon className="h-4.5 w-4.5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-extrabold text-foreground leading-none">{s.value}</p>
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
            {filteredUsers.map(user => (
              <tr key={user.id} className="group">
                {/* User */}
                <td>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: user.status === "Blocked" ? "#fee2e2" : "#dbeafe",
                        color:      user.status === "Blocked" ? "#dc2626" : "#2563eb",
                      }}
                    >
                      {getInitials(user.name)}
                    </div>
                    <span className="font-semibold text-foreground text-sm">{user.name}</span>
                  </div>
                </td>

                {/* Email */}
                <td className="text-muted-foreground">{user.email}</td>

                {/* Role */}
                <td>
                  <span className={`pill ${roleStyle[user.role] || "pill-gray"}`}>
                    {user.role === "Admin" && <Shield className="h-2.5 w-2.5" />}
                    {user.role === "Moderator" && <User className="h-2.5 w-2.5" />}
                    {user.role}
                  </span>
                </td>

                {/* Status */}
                <td>
                  <span className={`pill ${user.status === "Active" ? "pill-green" : "pill-red"}`}>
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: user.status === "Active" ? "#059669" : "#dc2626", display: "inline-block" }}
                    />
                    {user.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    <button
                      onClick={() => handleToggleBlock(user.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                        user.status === "Active"
                          ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                          : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {user.status === "Active" ? "Block" : "Unblock"}
                    </button>
                    <button
                      onClick={() => { setSelectedUser(user); setDeleteModalOpen(true) }}
                      className="h-8 w-8 rounded-lg flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
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

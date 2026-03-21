import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header setIsOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-6 pb-12 px-4 sm:px-6 lg:px-8 custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

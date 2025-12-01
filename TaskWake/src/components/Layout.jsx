"use client"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import { useTheme } from "../context/ThemeContext"
import { useState } from "react"

const Layout = ({ children }) => {
  const { isDark } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 lg:ml-80 transition-all duration-300">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default Layout

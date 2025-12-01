"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, User, Settings, LogOut, Crown } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { Link } from "react-router-dom"

const UserMenu = () => {
  const { user, logout } = useAuth()
  const { isDark } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 p-2 rounded-xl transition-colors ${
          isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
        }`}
      >
        <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-8 h-8 rounded-full" />
        <div className="hidden sm:block text-left">
          <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{user.name}</p>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Pro Member</p>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-64 rounded-xl shadow-lg border animate-scale-in ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          {/* User Info */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <img src={user.avatar || "/placeholder.svg"} alt={user.name} className="w-12 h-12 rounded-full" />
              <div>
                <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{user.name}</p>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{user.email}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Crown className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">Pro Member</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile Settings</span>
            </Link>

            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>App Settings</span>
            </Link>

            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            <button
              onClick={handleLogout}
              className={`flex items-center space-x-3 px-4 py-2 text-sm w-full text-left transition-colors ${
                isDark ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-gray-100"
              }`}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu

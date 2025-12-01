"use client"
import { Link, useLocation } from "react-router-dom"
import {
  Home,
  Calendar,
  BarChart3,
  Bell,
  FileText,
  Users,
  Crown,
  User,
  LogIn,
  UserPlus,
  Settings,
  List,
} from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import { useTask } from "../context/TaskContext"
import { useState, useMemo } from "react"
import Button from "./Button"
import AuthModal from "./AuthModal"

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation()
  const { isDark } = useTheme()
  const { isAuthenticated, user } = useAuth()
  const { tasks } = useTask()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState("login")

  // Calculate real user stats
  const userStats = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return {
        activeTasks: 0,
        completionRate: 0,
      }
    }

    const activeTasks = tasks.filter((task) => !task.completed).length
    const completedTasks = tasks.filter((task) => task.completed).length
    const totalTasks = tasks.length
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      activeTasks,
      completionRate,
    }
  }, [tasks])

  const navItems = [
    {
      path: "/",
      icon: Home,
      label: "Dashboard",
      gradient: "sidebar-home",
      active: location.pathname === "/",
      description: "Overview & Quick Actions",
    },
    {
      path: "/tasks",
      icon: List,
      label: "All Tasks",
      gradient: "sidebar-tasks",
      active: location.pathname === "/tasks",
      description: "View & Manage Tasks",
    },
    {
      path: "/calendar",
      icon: Calendar,
      label: "Calendar",
      gradient: "sidebar-calendar",
      active: location.pathname === "/calendar",
      description: "Schedule & Timeline",
    },
    {
      path: "/stats",
      icon: BarChart3,
      label: "Analytics",
      gradient: "sidebar-priority",
      active: location.pathname === "/stats",
      description: "Progress & Insights",
    },
    {
      path: "/reminders",
      icon: Bell,
      label: "Reminders",
      gradient: "sidebar-reminders",
      active: location.pathname === "/reminders",
      description: "Notifications & Alerts",
    },
    {
      path: "/templates",
      icon: FileText,
      label: "Templates",
      gradient: "sidebar-templates",
      active: location.pathname === "/templates",
      description: "Quick Task Templates",
    },
    {
      path: "/collaboration",
      icon: Users,
      label: "Team",
      gradient: "sidebar-collaboration",
      active: location.pathname === "/collaboration",
      description: "Shared & Collaboration",
    },
  ]

  const openAuthModal = (mode) => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 z-50 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} border-r overflow-y-auto`}
      >
        {/* User Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          {isAuthenticated ? (
            /* Logged in user */
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={user.avatar || "/placeholder.svg?height=48&width=48"}
                    alt={user.name}
                    className="w-12 h-12 rounded-full ring-2 ring-blue-500"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{user.name}</p>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{user.email}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Crown className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Pro Member</span>
                  </div>
                </div>
              </div>

              {/* Real User Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-blue-50"}`}>
                  <p className="text-2xl font-bold text-blue-600">{userStats.activeTasks}</p>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Active Tasks</p>
                </div>
                <div className={`p-3 rounded-xl ${isDark ? "bg-gray-800" : "bg-green-50"}`}>
                  <p className="text-2xl font-bold text-green-600">{userStats.completionRate}%</p>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Completion</p>
                </div>
              </div>
            </div>
          ) : (
        
            <>
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 mb-4">
                <User className="h-8 w-8 text-white" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                Welcome to TaskWave
              </h3>
              <p className={`text-sm mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                Sign in to unlock all features and save your progress
              </p>
              <div className="space-y-2">
                <Button className="w-full btn-gradient" size="sm" onClick={() => openAuthModal("login")}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
                <Button variant="ghost" className="w-full" size="sm" onClick={() => openAuthModal("signup")}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </div>
            </>
          )}
        </div>

    
        <div className="p-4 space-y-2">
          <h4
            className={`text-xs font-semibold uppercase tracking-wider mb-4 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            Navigation
          </h4>
          {navItems.map(({ path, icon: Icon, label, gradient, active, description }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 p-4 rounded-2xl transition-all duration-200 hover-lift group relative overflow-hidden ${
                active
                  ? `${gradient} text-white shadow-lg transform scale-105`
                  : `hover:bg-gray-100 dark:hover:bg-gray-800 ${isDark ? "text-gray-300" : "text-gray-600"}`
              }`}
            >
              {/* Background decoration for active item */}
              {active && <div className="absolute inset-0 bg-white bg-opacity-10 rounded-2xl"></div>}

              <div
                className={`p-2 rounded-xl relative z-10 ${
                  active
                    ? "bg-white bg-opacity-20"
                    : "bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-white" : "text-gray-600 dark:text-gray-400"}`} />
              </div>

              <div className="flex-1 relative z-10">
                <p className={`font-semibold ${active ? "text-white" : ""}`}>{label}</p>
                <p className={`text-xs ${active ? "text-white text-opacity-80" : "text-gray-500 dark:text-gray-400"}`}>
                  {description}
                </p>
              </div>

              {active && <div className="w-2 h-2 rounded-full bg-white ml-auto relative z-10 animate-pulse"></div>}
            </Link>
          ))}
        </div>

     
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            to="/settings"
            onClick={() => setIsOpen(false)}
            className={`flex items-center space-x-3 p-4 rounded-2xl transition-all duration-200 hover-lift group ${
              location.pathname === "/settings"
                ? "bg-gray-200 dark:bg-gray-800"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            } ${isDark ? "text-gray-300" : "text-gray-600"}`}
          >
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700">
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="font-semibold">Settings</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Preferences & Config</p>
            </div>
          </Link>
        </div>

        {/* Pro Version Upgrade */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-2xl p-4 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white bg-opacity-10 rounded-2xl"></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="h-5 w-5" />
                <span className="font-bold">TaskWave Pro+</span>
              </div>
              <p className="text-sm text-white text-opacity-90 mb-3">Unlock AI-powered features & unlimited storage</p>
              <Button
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-0 backdrop-blur-sm"
                size="sm"
              >
                ✨ Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </div>

   
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
    </>
  )
}

export default Sidebar

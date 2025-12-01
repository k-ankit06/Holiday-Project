"use client"
import { Link, useLocation } from "react-router-dom"
import {
  Sun,
  Moon,
  MessageSquare,
  Menu,
  X,
  LogIn,
  UserPlus,
  Search,
  Zap,
  BarChart3,
  TrendingUp,
  Activity,
  PieChart,
} from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import { useTask } from "../context/TaskContext"
import { useState, useMemo } from "react"
import Button from "./Button"
import AuthModal from "./AuthModal"
import UserMenu from "./UserMenu"

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const { isAuthenticated } = useAuth()
  const { tasks } = useTask()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState("login")
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Calculate analytics data
  const analytics = useMemo(() => {
    if (!tasks.length) return null

    const completed = tasks.filter((task) => task.completed).length
    const pending = tasks.filter((task) => !task.completed).length
    const overdue = tasks.filter((task) => {
      if (task.completed || !task.dueDate) return false
      return new Date(task.dueDate) < new Date()
    }).length

    const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0

    // Priority distribution
    const highPriority = tasks.filter((task) => task.priority === "high").length
    const mediumPriority = tasks.filter((task) => task.priority === "medium").length
    const lowPriority = tasks.filter((task) => task.priority === "low").length

    // Recent activity (tasks created in last 7 days)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recentTasks = tasks.filter((task) => new Date(task.createdAt) > weekAgo).length

    return {
      total: tasks.length,
      completed,
      pending,
      overdue,
      completionRate,
      highPriority,
      mediumPriority,
      lowPriority,
      recentTasks,
    }
  }, [tasks])

  const openAuthModal = (mode) => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  const navLinks = [
    { path: "/", label: "Dashboard" },
    { path: "/calendar", label: "Calendar" },
    { path: "/stats", label: "Analytics" },
    { path: "/reminders", label: "Reminders" },
  ]

  return (
    <>
      <nav
        className={`sticky top-0 z-50 border-b transition-colors duration-300 backdrop-blur-md ${
          isDark ? "bg-gray-900/90 border-gray-800" : "bg-white/90 border-gray-200"
        }`}
      >
        <div className="px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-6">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1
                    className={`text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`}
                  >
                    TaskWave Pro
                  </h1>
                  <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Productivity Suite</p>
                </div>
              </Link>

              {/* Navigation Links */}
              {isAuthenticated && (
                <div className="hidden lg:flex items-center space-x-1">
                  {navLinks.map(({ path, label }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        location.pathname === path
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Center - Search (when authenticated) */}
            {isAuthenticated && (
              <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks, projects..."
                    className={`w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      isDark
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                        : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* Analytics Toolbar */}
              {isAuthenticated && analytics && (
                <div className="relative">
                  <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className={`p-2 rounded-xl transition-colors ${
                      showAnalytics
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}
                    title="Quick Analytics"
                  >
                    <BarChart3 className="h-5 w-5" />
                  </button>

                  {/* Analytics Dropdown */}
                  {showAnalytics && (
                    <div
                      className={`absolute right-0 top-12 w-80 rounded-2xl shadow-2xl border z-50 ${
                        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                            Quick Analytics
                          </h3>
                          <button
                            onClick={() => setShowAnalytics(false)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </button>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className={`p-3 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                            <div className="flex items-center space-x-2">
                              <Activity className="h-4 w-4 text-blue-500" />
                              <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Total</span>
                            </div>
                            <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                              {analytics.total}
                            </p>
                          </div>

                          <div className={`p-3 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Completed</span>
                            </div>
                            <p className={`text-lg font-bold text-green-600`}>{analytics.completed}</p>
                          </div>

                          <div className={`p-3 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                            <div className="flex items-center space-x-2">
                              <PieChart className="h-4 w-4 text-yellow-500" />
                              <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Pending</span>
                            </div>
                            <p className={`text-lg font-bold text-yellow-600`}>{analytics.pending}</p>
                          </div>

                          <div className={`p-3 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                            <div className="flex items-center space-x-2">
                              <Activity className="h-4 w-4 text-red-500" />
                              <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Overdue</span>
                            </div>
                            <p className={`text-lg font-bold text-red-600`}>{analytics.overdue}</p>
                          </div>
                        </div>

                        {/* Completion Rate */}
                        <div className={`p-3 rounded-xl mb-4 ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                              Completion Rate
                            </span>
                            <span
                              className={`text-sm font-bold ${
                                analytics.completionRate >= 80
                                  ? "text-green-600"
                                  : analytics.completionRate >= 60
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {analytics.completionRate}%
                            </span>
                          </div>
                          <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                analytics.completionRate >= 80
                                  ? "bg-green-500"
                                  : analytics.completionRate >= 60
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{ width: `${analytics.completionRate}%` }}
                            />
                          </div>
                        </div>

                        {/* Priority Distribution */}
                        <div className={`p-3 rounded-xl ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
                          <h4 className={`text-sm font-medium mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                            Priority Distribution
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-red-600">High Priority</span>
                              <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                                {analytics.highPriority}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-yellow-600">Medium Priority</span>
                              <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                                {analytics.mediumPriority}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-green-600">Low Priority</span>
                              <span className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                                {analytics.lowPriority}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Action */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <Link
                            to="/stats"
                            onClick={() => setShowAnalytics(false)}
                            className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Detailed Analytics
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {isDark ? (
                  <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>

              {/* Feedback */}
              <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Auth section */}
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => openAuthModal("login")}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                  <Button size="sm" className="btn-gradient" onClick={() => openAuthModal("signup")}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode={authMode} />
    </>
  )
}

export default Navbar

"use client"

import { useState, useMemo } from "react"
import {
  Bell,
  BellRing,
  Clock,
  Calendar,
  Plus,
  Settings,
  Volume2,
  Smartphone,
  Mail,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { useTask } from "../context/TaskContext"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import { useNotification } from "../hooks/useNotification"
import Button from "../components/Button"
import Modal from "../components/Modal"

const RemindersPage = () => {
  const { tasks, updateTask } = useTask()
  const { isAuthenticated } = useAuth()
  const { isDark } = useTheme()
  const { showNotification, scheduleNotification } = useNotification()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedReminder, setSelectedReminder] = useState(null)
  const [reminderSettings, setReminderSettings] = useState({
    sound: true,
    email: false,
    push: true,
    beforeTime: 15, // minutes
  })

  // Get tasks with reminders
  const reminders = useMemo(() => {
    return tasks
      .filter((task) => task.reminder && task.dueDate && !task.completed)
      .map((task) => {
        const dueDate = new Date(task.dueDate)
        const now = new Date()
        const timeDiff = dueDate.getTime() - now.getTime()
        const isOverdue = timeDiff < 0
        const isUpcoming = timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000 // Next 24 hours

        return {
          ...task,
          dueDate,
          timeDiff,
          isOverdue,
          isUpcoming,
          timeUntilDue: formatTimeUntilDue(timeDiff),
          priority: task.priority || "medium",
        }
      })
      .sort((a, b) => a.timeDiff - b.timeDiff)
  }, [tasks])

  const upcomingReminders = reminders.filter((r) => r.isUpcoming)
  const overdueReminders = reminders.filter((r) => r.isOverdue)
  const todayReminders = reminders.filter((r) => {
    const today = new Date()
    return r.dueDate.toDateString() === today.toDateString()
  })

  function formatTimeUntilDue(timeDiff) {
    const absTimeDiff = Math.abs(timeDiff)
    const days = Math.floor(absTimeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((absTimeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((absTimeDiff % (1000 * 60 * 60)) / (1000 * 60))

    if (timeDiff < 0) {
      if (days > 0) return `${days} day${days > 1 ? "s" : ""} overdue`
      if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} overdue`
      return `${minutes} minute${minutes > 1 ? "s" : ""} overdue`
    } else {
      if (days > 0) return `in ${days} day${days > 1 ? "s" : ""}`
      if (hours > 0) return `in ${hours} hour${hours > 1 ? "s" : ""}`
      return `in ${minutes} minute${minutes > 1 ? "s" : ""}`
    }
  }

  const testNotification = () => {
    showNotification("Test Reminder", "This is how your reminders will look! 🔔")
  }

  const snoozeReminder = (taskId, minutes = 15) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      const newDueDate = new Date(task.dueDate)
      newDueDate.setMinutes(newDueDate.getMinutes() + minutes)

      updateTask({
        ...task,
        dueDate: newDueDate.toISOString(),
      })

      showNotification("Reminder Snoozed", `Task snoozed for ${minutes} minutes`)
    }
  }

  const markAsComplete = (taskId) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      updateTask({
        ...task,
        completed: true,
        completedAt: new Date().toISOString(),
      })
      showNotification("Task Completed", "Great job! Task marked as complete 🎉")
    }
  }

  const ReminderCard = ({ reminder, showActions = true }) => {
    const priorityColors = {
      high: "from-red-500 to-pink-500",
      medium: "from-yellow-500 to-orange-500",
      low: "from-green-500 to-emerald-500",
    }

    const statusColors = {
      overdue: "border-red-500 bg-red-50 dark:bg-red-900/20",
      upcoming: "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
      today: "border-purple-500 bg-purple-50 dark:bg-purple-900/20",
    }

    const getStatus = () => {
      if (reminder.isOverdue) return "overdue"
      if (reminder.isUpcoming) return "upcoming"
      return "today"
    }

    return (
      <div
        className={`p-4 rounded-2xl border-2 transition-all duration-200 hover:shadow-lg hover-lift ${statusColors[getStatus()]}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-xl bg-gradient-to-r ${priorityColors[reminder.priority]} text-white`}>
              {reminder.isOverdue ? <AlertTriangle className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{reminder.title}</h3>
              {reminder.description && (
                <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>{reminder.description}</p>
              )}
              <div className="flex items-center space-x-4 mt-2 text-xs">
                <span
                  className={`flex items-center space-x-1 ${reminder.isOverdue ? "text-red-600" : "text-blue-600"}`}
                >
                  <Clock className="h-3 w-3" />
                  <span>{reminder.timeUntilDue}</span>
                </span>
                <span className={`flex items-center space-x-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  <Calendar className="h-3 w-3" />
                  <span>{reminder.dueDate.toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center space-x-2">
            <Button size="sm" onClick={() => markAsComplete(reminder.id)} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-1" />
              Complete
            </Button>
            <Button size="sm" variant="secondary" onClick={() => snoozeReminder(reminder.id, 15)}>
              <Clock className="h-4 w-4 mr-1" />
              Snooze 15m
            </Button>
            <Button size="sm" variant="ghost" onClick={() => snoozeReminder(reminder.id, 60)}>
              1h
            </Button>
          </div>
        )}
      </div>
    )
  }

  const StatCard = ({ icon: Icon, title, count, color, gradient }) => (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${gradient} text-white hover-lift`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-opacity-80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{count}</p>
        </div>
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
          <Bell className="h-12 w-12 text-white" />
        </div>
        <h1 className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Reminders</h1>
        <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Sign in to manage your task reminders and notifications
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Reminders & Notifications</h1>
          <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Stay on top of your tasks with smart reminders
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={testNotification} variant="ghost">
            <Volume2 className="h-4 w-4 mr-2" />
            Test Notification
          </Button>
          <Button onClick={() => setIsSettingsOpen(true)} variant="secondary">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={AlertTriangle}
          title="Overdue"
          count={overdueReminders.length}
          gradient="from-red-500 to-pink-500"
        />
        <StatCard icon={Clock} title="Today" count={todayReminders.length} gradient="from-purple-500 to-indigo-500" />
        <StatCard icon={Bell} title="Upcoming" count={upcomingReminders.length} gradient="from-blue-500 to-cyan-500" />
      </div>

      {/* Overdue Reminders */}
      {overdueReminders.length > 0 && (
        <div
          className={`p-6 rounded-2xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className={`text-xl font-semibold text-red-600`}>Overdue Tasks</h2>
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full text-xs font-medium">
              {overdueReminders.length}
            </span>
          </div>
          <div className="space-y-4">
            {overdueReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      {/* Today's Reminders */}
      {todayReminders.length > 0 && (
        <div
          className={`p-6 rounded-2xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          <div className="flex items-center space-x-2 mb-4">
            <BellRing className="h-5 w-5 text-purple-500" />
            <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Today's Reminders</h2>
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium">
              {todayReminders.length}
            </span>
          </div>
          <div className="space-y-4">
            {todayReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div
          className={`p-6 rounded-2xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Bell className="h-5 w-5 text-blue-500" />
            <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Upcoming Reminders</h2>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
              {upcomingReminders.length}
            </span>
          </div>
          <div className="space-y-4">
            {upcomingReminders.map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {reminders.length === 0 && (
        <div
          className={`text-center py-12 rounded-2xl border-2 border-dashed ${isDark ? "border-gray-700" : "border-gray-300"}`}
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bell className="h-12 w-12 text-white" />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            No Active Reminders
          </h3>
          <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Create tasks with due dates and enable reminders to see them here
          </p>
          <Button className="btn-gradient">
            <Plus className="h-5 w-5 mr-2" />
            Create Task with Reminder
          </Button>
        </div>
      )}

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Reminder Settings">
        <div className="space-y-6">
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Notification Preferences
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Sound Notifications</p>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Play sound when reminders trigger
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReminderSettings((prev) => ({ ...prev, sound: !prev.sound }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    reminderSettings.sound ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reminderSettings.sound ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Push Notifications</p>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Browser push notifications
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setReminderSettings((prev) => ({ ...prev, push: !prev.push }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    reminderSettings.push ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reminderSettings.push ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Email Reminders</p>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Send email notifications</p>
                  </div>
                </div>
                <button
                  onClick={() => setReminderSettings((prev) => ({ ...prev, email: !prev.email }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    reminderSettings.email ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      reminderSettings.email ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Default Reminder Time
            </h3>
            <select
              value={reminderSettings.beforeTime}
              onChange={(e) =>
                setReminderSettings((prev) => ({ ...prev, beforeTime: Number.parseInt(e.target.value) }))
              }
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value={5}>5 minutes before</option>
              <option value={15}>15 minutes before</option>
              <option value={30}>30 minutes before</option>
              <option value={60}>1 hour before</option>
              <option value={120}>2 hours before</option>
              <option value={1440}>1 day before</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsSettingsOpen(false)}>Save Settings</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default RemindersPage

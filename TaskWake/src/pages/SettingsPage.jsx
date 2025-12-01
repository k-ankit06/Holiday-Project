
import { useState } from "react"
import { Moon, Sun, Download, Trash2, Bell, BellOff, Users, Folder, FileText, Wifi, WifiOff, Cloud } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useTask } from "../context/TaskContext"
import { useNotification } from "../hooks/useNotification"
import { syncService } from "../services/syncService"
import Button from "../components/Button"
import CategoryManager from "../components/CategoryManager"
import TemplateManager from "../components/TemplateManager"
import TeamCollaboration from "../components/TeamCollaboration"

const SettingsPage = () => {
  const { isDark, toggleTheme } = useTheme()
  const { tasks, categories, templates, teamMembers, syncStatus, syncData } = useTask()
  const { showNotification } = useNotification()
  const [activeTab, setActiveTab] = useState("general")

  const tabs = [
    { id: "general", label: "General", icon: Sun },
    { id: "categories", label: "Categories", icon: Folder },
    { id: "templates", label: "Templates", icon: FileText },
    { id: "team", label: "Team", icon: Users },
    { id: "sync", label: "Sync & Data", icon: Cloud },
  ]

  const exportToCSV = () => {
    if (tasks.length === 0) {
      showNotification("Export Failed", "No tasks to export")
      return
    }

    const headers = [
      "Title",
      "Description",
      "Category",
      "Priority",
      "Due Date",
      "Status",
      "Assigned To",
      "Tags",
      "Created At",
      "Completed At",
    ]

    const csvContent = [
      headers.join(","),
      ...tasks.map((task) => {
        const category = categories.find((c) => c.id === task.categoryId)
        const assignee = teamMembers.find((m) => m.id === task.assignedTo)

        return [
          `"${task.title}"`,
          `"${task.description || ""}"`,
          `"${category?.name || ""}"`,
          task.priority || "",
          task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
          task.completed ? "Completed" : "Pending",
          `"${assignee?.name || ""}"`,
          `"${task.tags?.join(", ") || ""}"`,
          new Date(task.createdAt).toLocaleDateString(),
          task.completedAt ? new Date(task.completedAt).toLocaleDateString() : "",
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `taskwave-export-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showNotification("Export Successful", `${tasks.length} tasks exported to CSV`)
  }

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const testNotification = () => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        showNotification("Test Notification", "Notifications are working correctly!")
      } else if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            showNotification("Test Notification", "Notifications are now enabled!")
          }
        })
      } else {
        alert("Notifications are blocked. Please enable them in your browser settings.")
      }
    } else {
      alert("This browser does not support notifications.")
    }
  }

  const handleManualSync = async () => {
    try {
      await syncData()
      showNotification("Sync Successful", "Data synchronized with cloud")
    } catch (error) {
      showNotification("Sync Failed", "Failed to sync data")
    }
  }

  const connectionStatus = syncService.getConnectionStatus()

  const SettingCard = ({ icon: Icon, title, description, children }) => (
    <div className={`p-6 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
            <Icon className={`h-5 w-5 ${isDark ? "text-gray-300" : "text-gray-600"}`} />
          </div>
          <div>
            <h3 className={`text-lg font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{description}</p>
          </div>
        </div>
        <div className="ml-4">{children}</div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
       
            <SettingCard icon={isDark ? Sun : Moon} title="Theme" description="Switch between light and dark mode">
              <Button onClick={toggleTheme} variant="secondary" className="flex items-center space-x-2">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
              </Button>
            </SettingCard>

            
            <SettingCard
              icon={Notification.permission === "granted" ? Bell : BellOff}
              title="Notifications"
              description="Manage task reminder notifications"
            >
              <Button onClick={testNotification} variant="secondary" className="flex items-center space-x-2">
                {Notification.permission === "granted" ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                <span>{Notification.permission === "granted" ? "Test Notifications" : "Enable Notifications"}</span>
              </Button>
            </SettingCard>

            <SettingCard icon={Download} title="Export Data" description="Download your tasks as a CSV file">
              <Button
                onClick={exportToCSV}
                variant="secondary"
                disabled={tasks.length === 0}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Export CSV</span>
              </Button>
            </SettingCard>

          
            <SettingCard icon={Trash2} title="Clear All Data" description="Remove all tasks and reset the application">
              <Button onClick={clearAllData} variant="danger" className="flex items-center space-x-2">
                <Trash2 className="h-4 w-4" />
                <span>Clear All Data</span>
              </Button>
            </SettingCard>
          </div>
        )

      case "categories":
        return <CategoryManager />

      case "templates":
        return <TemplateManager />

      case "team":
        return <TeamCollaboration />

      case "sync":
        return (
          <div className="space-y-6">
          
            <SettingCard
              icon={connectionStatus.isOnline ? Wifi : WifiOff}
              title="Connection Status"
              description="Current online/offline status"
            >
              <div className="flex items-center space-x-2">
                {connectionStatus.isOnline ? (
                  <span className="flex items-center text-green-600 dark:text-green-400">
                    <Wifi className="h-4 w-4 mr-1" />
                    Online
                  </span>
                ) : (
                  <span className="flex items-center text-red-600 dark:text-red-400">
                    <WifiOff className="h-4 w-4 mr-1" />
                    Offline
                  </span>
                )}
              </div>
            </SettingCard>

         
            <SettingCard icon={Cloud} title="Cloud Sync" description="Synchronize your data across devices">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                    Status: {syncStatus}
                  </p>
                  {connectionStatus.lastSync && (
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Last sync: {new Date(connectionStatus.lastSync).toLocaleString()}
                    </p>
                  )}
                  {connectionStatus.queueLength > 0 && (
                    <p className={`text-xs text-yellow-600 dark:text-yellow-400`}>
                      {connectionStatus.queueLength} items pending sync
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleManualSync}
                  variant="secondary"
                  disabled={syncStatus === "syncing"}
                  className="flex items-center space-x-2"
                >
                  <Cloud className="h-4 w-4" />
                  <span>{syncStatus === "syncing" ? "Syncing..." : "Sync Now"}</span>
                </Button>
              </div>
            </SettingCard>

       
            <div
              className={`p-6 rounded-lg border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
            >
              <h3 className={`text-lg font-medium mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                Storage Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Total Tasks</p>
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>{tasks.length}</p>
                </div>
                <div>
                  <p className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Categories</p>
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>{categories.length}</p>
                </div>
                <div>
                  <p className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Templates</p>
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>{templates.length}</p>
                </div>
                <div>
                  <p className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Team Members</p>
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>{teamMembers.length}</p>
                </div>
                <div>
                  <p className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Storage Used</p>
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                    {Math.round(
                      (JSON.stringify(tasks).length +
                        JSON.stringify(categories).length +
                        JSON.stringify(templates).length) /
                        1024,
                    )}{" "}
                    KB
                  </p>
                </div>
                <div>
                  <p className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>Browser Support</p>
                  <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                    {typeof Storage !== "undefined" ? "LocalStorage ✓" : "LocalStorage ✗"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Settings</h1>
        <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Manage your TaskWave Pro preferences and data
        </p>
      </div>

  
      <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

  
      {renderTabContent()}
    </div>
  )
}

export default SettingsPage

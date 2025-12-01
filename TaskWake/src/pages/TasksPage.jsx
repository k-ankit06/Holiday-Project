
import { useState, useEffect } from "react"
import {
  MagnifyingGlassIcon,
  PlusIcon,
  Bars3Icon,
  Squares2X2Icon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline"

const TasksPage = () => {
  const [isDark, setIsDark] = useState(false) // Example theme state
  const [tasks, setTasks] = useState([
    { id: 1, title: "Design new dashboard", status: "completed" },
    { id: 2, title: "Create user flow", status: "in progress" },
    { id: 3, title: "Implement login page", status: "open" },
    { id: 4, title: "Fix bug in checkout", status: "urgent" },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [viewMode, setViewMode] = useState("grid") 

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme")
    setIsDark(storedTheme === "dark")
  }, [])

  const handleThemeToggle = () => {
    const newTheme = !isDark ? "dark" : "light"
    setIsDark(!isDark)
    localStorage.setItem("theme", newTheme)
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
  }

  const handleFilter = (event) => {
    setFilterStatus(event.target.value)
  }

  const filteredTasks = tasks.filter((task) => {
    const searchMatch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
    const statusMatch = filterStatus === "all" || task.status === filterStatus
    return searchMatch && statusMatch
  })

  const completedTasksCount = tasks.filter((task) => task.status === "completed").length
  const urgentTasksCount = tasks.filter((task) => task.status === "urgent").length
  const inProgressTasksCount = tasks.filter((task) => task.status === "in progress").length
  const openTasksCount = tasks.filter((task) => task.status === "open").length

  const StatsCard = ({ icon: Icon, title, count, color }) => (
    <div
      className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg ${
        isDark ? "bg-gray-800 border-gray-700 hover:bg-gray-750" : "bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>{title}</p>
          <p className={`text-3xl font-bold mt-1 ${isDark ? "text-white" : "text-gray-900"}`}>{count}</p>
        </div>
        <div
          className={`p-3 rounded-full ${
            color === "blue"
              ? isDark
                ? "bg-blue-900/50"
                : "bg-blue-100"
              : color === "green"
                ? (isDark ? "bg-green-900/50" : "bg-green-100")
                : color === "yellow"
                  ? isDark
                    ? "bg-yellow-900/50"
                    : "bg-yellow-100"
                  : color === "red"
                    ? isDark
                      ? "bg-red-900/50"
                      : "bg-red-100"
                    : isDark
                      ? "bg-gray-700"
                      : "bg-gray-100"
          }`}
        >
          <Icon
            className={`h-6 w-6 ${
              color === "blue"
                ? isDark
                  ? "text-blue-400"
                  : "text-blue-600"
                : color === "green"
                  ? (isDark ? "text-green-400" : "text-green-600")
                  : color === "yellow"
                    ? isDark
                      ? "text-yellow-400"
                      : "text-yellow-600"
                    : color === "red"
                      ? isDark
                        ? "text-red-400"
                        : "text-red-600"
                      : isDark
                        ? "text-gray-400"
                        : "text-gray-600"
            }`}
          />
        </div>
      </div>
    </div>
  )

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <button onClick={handleThemeToggle}>Toggle Theme</button>
      <div className="container mx-auto p-6">
        <h1 className={`text-3xl font-semibold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>Tasks</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard icon={CheckBadgeIcon} title="Completed" count={completedTasksCount} color="blue" />
          <StatsCard icon={ExclamationTriangleIcon} title="Urgent" count={urgentTasksCount} color="red" />
          <StatsCard icon={ClockIcon} title="In Progress" count={inProgressTasksCount} color="yellow" />
          <StatsCard icon={PlusIcon} title="Open" count={openTasksCount} color="green" />
        </div>

        <div
          className={`p-6 rounded-xl border mb-6 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full md:w-1/2">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                placeholder="Search tasks"
                className={`w-full pl-10 pr-4 py-2 rounded-xl border ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div>
              <select
                className={`py-2 px-4 rounded-xl border ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-700"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                value={filterStatus}
                onChange={handleFilter}
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="in progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              className={`p-2 rounded-md ${
                viewMode === "grid"
                  ? "bg-blue-500 text-white"
                  : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setViewMode("grid")}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              className={`p-2 rounded-md ${
                viewMode === "list"
                  ? "bg-blue-500 text-white"
                  : isDark
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setViewMode("list")}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-6 rounded-xl border transition-all duration-200 hover:shadow-lg cursor-pointer ${
                  isDark
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                    : "bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{task.title}</h3>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Status: {task.status}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md cursor-pointer ${
                  isDark
                    ? "bg-gray-800 border-gray-700 hover:bg-gray-750"
                    : "bg-white border-gray-200 hover:bg-gray-50 shadow-sm"
                }`}
              >
                <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{task.title}</h3>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Status: {task.status}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TasksPage

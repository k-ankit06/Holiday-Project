
import { useMemo } from "react"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js"
import { Doughnut, Bar, Line } from "react-chartjs-2"
import { CheckCircle, Clock, TrendingUp, Calendar } from "lucide-react"
import { useTask } from "../context/TaskContext"
import { useTheme } from "../context/ThemeContext"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement)

const StatsPage = () => {
  const { tasks } = useTask()
  const { isDark } = useTheme()

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length
    const pending = tasks.filter((task) => !task.completed).length
    const overdue = tasks.filter(
      (task) => !task.completed && task.dueDate && new Date(task.dueDate) < new Date(),
    ).length

    const priorityStats = {
      high: tasks.filter((task) => task.priority === "high").length,
      medium: tasks.filter((task) => task.priority === "medium").length,
      low: tasks.filter((task) => task.priority === "low").length,
    }

 
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      return {
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        completed: tasks.filter(
          (task) => task.completed && task.completedAt && task.completedAt.split("T")[0] === dateStr,
        ).length,
      }
    }).reverse()

    return {
      total: tasks.length,
      completed,
      pending,
      overdue,
      completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
      priorityStats,
      weeklyData,
    }
  }, [tasks])

  const chartColors = {
    primary: isDark ? "#3B82F6" : "#2563EB",
    success: isDark ? "#10B981" : "#059669",
    warning: isDark ? "#F59E0B" : "#D97706",
    danger: isDark ? "#EF4444" : "#DC2626",
    secondary: isDark ? "#6B7280" : "#4B5563",
  }

  const completionChartData = {
    labels: ["Completed", "Pending", "Overdue"],
    datasets: [
      {
        data: [stats.completed, stats.pending - stats.overdue, stats.overdue],
        backgroundColor: [chartColors.success, chartColors.secondary, chartColors.danger],
        borderWidth: 0,
      },
    ],
  }

  const priorityChartData = {
    labels: ["High", "Medium", "Low"],
    datasets: [
      {
        label: "Tasks by Priority",
        data: [stats.priorityStats.high, stats.priorityStats.medium, stats.priorityStats.low],
        backgroundColor: [chartColors.danger, chartColors.warning, chartColors.success],
        borderColor: isDark ? "#374151" : "#F9FAFB",
        borderWidth: 1,
      },
    ],
  }

  const weeklyChartData = {
    labels: stats.weeklyData.map((d) => d.date),
    datasets: [
      {
        label: "Tasks Completed",
        data: stats.weeklyData.map((d) => d.completed),
        borderColor: chartColors.primary,
        backgroundColor: chartColors.primary + "20",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDark ? "#E5E7EB" : "#374151",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDark ? "#9CA3AF" : "#6B7280",
        },
        grid: {
          color: isDark ? "#374151" : "#E5E7EB",
        },
      },
      y: {
        ticks: {
          color: isDark ? "#9CA3AF" : "#6B7280",
        },
        grid: {
          color: isDark ? "#374151" : "#E5E7EB",
        },
      },
    },
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
    const colorClasses = {
      blue: isDark ? "text-blue-400" : "text-blue-600",
      green: isDark ? "text-green-400" : "text-green-600",
      yellow: isDark ? "text-yellow-400" : "text-yellow-600",
      red: isDark ? "text-red-400" : "text-red-600",
    }

    return (
      <div
        className={`p-6 rounded-lg border transition-all duration-200 hover:shadow-lg ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
            <Icon className={`h-6 w-6 ${colorClasses[color]}`} />
          </div>
          <div className="ml-4">
            <p className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>{title}</p>
            <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>
            {subtitle && <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-500"}`}>{subtitle}</p>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Task Statistics</h1>
        <p className={`mt-1 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          Track your productivity and task completion trends
        </p>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Calendar} title="Total Tasks" value={stats.total} color="blue" />
        <StatCard
          icon={CheckCircle}
          title="Completed"
          value={stats.completed}
          subtitle={`${stats.completionRate}% completion rate`}
          color="green"
        />
        <StatCard icon={Clock} title="Pending" value={stats.pending} color="yellow" />
        <StatCard icon={TrendingUp} title="Overdue" value={stats.overdue} color="red" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Completion Status Chart */}
        <div
          className={`p-6 rounded-lg border transition-all duration-200 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            Task Completion Status
          </h3>
          <div className="h-64">
            <Doughnut
              data={completionChartData}
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: "bottom",
                    labels: {
                      color: isDark ? "#E5E7EB" : "#374151",
                      padding: 20,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

      
        <div
          className={`p-6 rounded-lg border transition-all duration-200 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Tasks by Priority</h3>
          <div className="h-64">
            <Bar data={priorityChartData} options={chartOptions} />
          </div>
        </div>
      </div>

   
      <div
        className={`p-6 rounded-lg border transition-all duration-200 ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"
        }`}
      >
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
          Weekly Completion Trend
        </h3>
        <div className="h-64">
          <Line data={weeklyChartData} options={chartOptions} />
        </div>
      </div>

      {/* Additional Insights */}
      {stats.total > 0 && (
        <div
          className={`mt-8 p-6 rounded-lg border transition-all duration-200 ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200 shadow-sm"
          }`}
        >
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
              <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                <strong>Productivity Score:</strong> {stats.completionRate}%
              </p>
              <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {stats.completionRate >= 80
                  ? "Excellent!"
                  : stats.completionRate >= 60
                    ? "Good progress"
                    : "Room for improvement"}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-50"}`}>
              <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                <strong>Most Common Priority:</strong>{" "}
                {
                  Object.entries(stats.priorityStats).reduce((a, b) =>
                    stats.priorityStats[a[0]] > stats.priorityStats[b[0]] ? a : b,
                  )[0]
                }
              </p>
              <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                Focus on balancing task priorities
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StatsPage

"use client"

import { useState, useMemo } from "react"
import { Plus, Timer, TrendingUp, CheckCircle, Clock, AlertTriangle, Target, LogIn } from "lucide-react"
import { useTask } from "../context/TaskContext"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import Button from "../components/Button"
import TaskCard from "../components/TaskCard"
import TaskForm from "../components/TaskForm"
import Modal from "../components/Modal"
import AuthModal from "../components/AuthModal"
import PomodoroTimer from "../components/PomodoroTimer"

const HomePage = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTask, isAuthenticated } = useTask()
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [quickTaskTitle, setQuickTaskTitle] = useState("")
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [timerModalOpen, setTimerModalOpen] = useState(false)

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((task) => task.completed).length
    const pending = tasks.filter((task) => !task.completed).length
    const overdue = tasks.filter(
      (task) => !task.completed && task.dueDate && new Date(task.dueDate) < new Date(),
    ).length

    return { total, completed, pending, overdue }
  }, [tasks])

  const handleAddTask = (taskData) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }
    addTask(taskData)
    setIsModalOpen(false)
  }

  const handleEditTask = (task) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleUpdateTask = (taskData) => {
    updateTask(taskData)
    setEditingTask(null)
    setIsModalOpen(false)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
  }

  const handleQuickAdd = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }
    if (quickTaskTitle.trim()) {
      addTask({
        title: quickTaskTitle.trim(),
        description: "",
        priority: "medium",
        dueDate: null,
        reminder: false,
      })
      setQuickTaskTitle("")
    }
  }

  const handleShowTimer = () => {
    setTimerModalOpen(true)
  }

  const StatCard = ({ icon: Icon, title, value, gradient, delay = 0 }) => (
    <div
      className={`p-6 rounded-2xl hover-lift animate-fade-in ${gradient} ${
        isDark ? "text-white glass-effect" : "text-white shadow-lg border border-gray-200"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-opacity-90 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )

  const recentTasks = tasks.slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="text-center animate-fade-in">
        <h1 className="text-4xl lg:text-5xl font-bold gradient-text mb-4">
          {isAuthenticated ? `Welcome back, ${user?.name?.split(" ")[0]}!` : "Welcome to TaskWave Pro"}
        </h1>
        <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          {isAuthenticated ? "Ready to tackle your tasks today?" : "Manage your tasks with style and efficiency"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Target} title="Total Tasks" value={stats.total} gradient="stats-total" delay={0} />
        <StatCard icon={CheckCircle} title="Completed" value={stats.completed} gradient="stats-completed" delay={100} />
        <StatCard icon={Clock} title="Pending" value={stats.pending} gradient="stats-pending" delay={200} />
        <StatCard icon={AlertTriangle} title="Overdue" value={stats.overdue} gradient="stats-overdue" delay={300} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-4 animate-slide-up">
        <Button
          onClick={() => (isAuthenticated ? setIsModalOpen(true) : setAuthModalOpen(true))}
          className="btn-gradient hover-lift"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Task
        </Button>
        <Button variant="ghost" className="hover-lift" onClick={handleShowTimer}>
          <Timer className="h-5 w-5 mr-2" />
          Show Timer
        </Button>
        <div className="ml-auto flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-gray-400" />
          <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Productivity Score: {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Quick Add Task */}
      <div
        className={`p-6 rounded-2xl border animate-scale-in ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Quick Add Task</h2>
        <div className="flex space-x-3">
          <input
            type="text"
            value={quickTaskTitle}
            onChange={(e) => setQuickTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleQuickAdd()}
            placeholder="What needs to be done? ✨"
            className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              isDark
                ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500"
            }`}
          />
          <Button onClick={handleQuickAdd} disabled={!quickTaskTitle.trim()} className="btn-gradient px-6">
            Add Task ✨
          </Button>
        </div>
        <div className="mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => (isAuthenticated ? setIsModalOpen(true) : setAuthModalOpen(true))}
          >
            More Options
          </Button>
        </div>
      </div>

      {/* Auth Required Message */}
      {!isAuthenticated && (
        <div
          className={`p-6 rounded-2xl border-2 border-dashed animate-fade-in ${
            isDark ? "bg-gray-800 border-gray-600" : "bg-blue-50 border-blue-300"
          }`}
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <LogIn className="h-8 w-8 text-white" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Sign in to get started
            </h3>
            <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Create an account or sign in to start managing your tasks with TaskWave Pro
            </p>
            <Button onClick={() => setAuthModalOpen(true)} className="btn-gradient">
              <LogIn className="h-5 w-5 mr-2" />
              Sign In to Continue
            </Button>
          </div>
        </div>
      )}

      {/* Recent Tasks */}
      {isAuthenticated && recentTasks.length > 0 && (
        <div
          className={`p-6 rounded-2xl border animate-fade-in ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <h2 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Recent Tasks</h2>
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={deleteTask} onToggle={toggleTask} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State for authenticated users */}
      {isAuthenticated && tasks.length === 0 && (
        <div className={`text-center py-12 animate-fade-in`}>
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Target className="h-12 w-12 text-white" />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>No tasks yet</h3>
          <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Create your first task to get started with TaskWave Pro
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="btn-gradient">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Task
          </Button>
        </div>
      )}

      {/* Task Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTask ? "Edit Task" : "Add New Task"}>
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleAddTask}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode="login" />

      {/* Pomodoro Timer Modal */}
      <PomodoroTimer isOpen={timerModalOpen} onClose={() => setTimerModalOpen(false)} />
    </div>
  )
}

export default HomePage

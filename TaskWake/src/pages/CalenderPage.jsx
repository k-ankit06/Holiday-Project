"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { useTask } from "../context/TaskContext"
import { useTheme } from "../context/ThemeContext"
import Button from "../components/Button"
import TaskCard from "../components/TaskCard"
import Modal from "../components/Modal"
import TaskForm from "../components/TaskForm"

const CalendarPage = () => {
  const { tasks, addTask, updateTask, deleteTask, toggleTask } = useTask()
  const { isDark } = useTheme()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      const dateStr = current.toISOString().split("T")[0]
      const dayTasks = tasks.filter((task) => task.dueDate && task.dueDate.split("T")[0] === dateStr)

      days.push({
        date: new Date(current),
        dateStr,
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString(),
        tasks: dayTasks,
      })

      current.setDate(current.getDate() + 1)
    }

    return days
  }, [currentDate, tasks])

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const handleDateClick = (day) => {
    setSelectedDate(day)
  }

  const handleAddTask = (taskData) => {
    if (selectedDate) {
      taskData.dueDate = selectedDate.dateStr + "T12:00:00.000Z"
    }
    addTask(taskData)
    setIsModalOpen(false)
  }

  const handleEditTask = (task) => {
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

  const selectedDateTasks = selectedDate ? selectedDate.tasks : []

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h1>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigateMonth(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className={`rounded-lg border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className={`p-3 text-center text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
              {calendarData.map((day, index) => (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`min-h-[100px] p-2 border-r border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors ${
                    !day.isCurrentMonth
                      ? isDark
                        ? "bg-gray-800 text-gray-600"
                        : "bg-gray-50 text-gray-400"
                      : isDark
                        ? "bg-gray-900 hover:bg-gray-800"
                        : "bg-white hover:bg-gray-50"
                  } ${selectedDate?.dateStr === day.dateStr ? (isDark ? "bg-blue-900" : "bg-blue-50") : ""}`}
                >
                  <div
                    className={`text-sm font-medium mb-1 ${
                      day.isToday ? "text-blue-600 font-bold" : isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.tasks.slice(0, 2).map((task) => (
                      <div
                        key={task.id}
                        className={`text-xs p-1 rounded truncate ${
                          task.completed
                            ? isDark
                              ? "bg-green-800 text-green-200"
                              : "bg-green-100 text-green-800"
                            : task.priority === "high"
                              ? isDark
                                ? "bg-red-800 text-red-200"
                                : "bg-red-100 text-red-800"
                              : task.priority === "medium"
                                ? isDark
                                  ? "bg-yellow-800 text-yellow-200"
                                  : "bg-yellow-100 text-yellow-800"
                                : isDark
                                  ? "bg-blue-800 text-blue-200"
                                  : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {task.title}
                      </div>
                    ))}
                    {day.tasks.length > 2 && (
                      <div className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        +{day.tasks.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Date Tasks */}
        <div className="w-full lg:w-80">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                {selectedDate ? `Tasks for ${selectedDate.date.toLocaleDateString()}` : "Select a date"}
              </h2>
              {selectedDate && (
                <Button size="sm" onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>

            {selectedDate ? (
              selectedDateTasks.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onDelete={deleteTask}
                      onToggle={toggleTask}
                    />
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                  <p>No tasks for this date</p>
                  <Button size="sm" className="mt-2" onClick={() => setIsModalOpen(true)}>
                    Add Task
                  </Button>
                </div>
              )
            ) : (
              <div className={`text-center py-8 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <p>Click on a date to view tasks</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingTask ? "Edit Task" : "Add New Task"}>
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleAddTask}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  )
}

export default CalendarPage

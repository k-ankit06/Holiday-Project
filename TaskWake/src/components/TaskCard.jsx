"use client"
import { Calendar, Clock, Flag, Edit, Trash2, Check } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import Button from "./Button"

const TaskCard = ({ task, onEdit, onDelete, onToggle }) => {
  const { isDark } = useTheme()

  const priorityColors = {
    low: isDark ? "text-green-400" : "text-green-600",
    medium: isDark ? "text-yellow-400" : "text-yellow-600",
    high: isDark ? "text-red-400" : "text-red-600",
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed

  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
        isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
      } ${task.completed ? "opacity-75" : ""} ${isOverdue ? "border-red-500" : ""}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={() => onToggle(task.id)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                task.completed
                  ? "bg-green-500 border-green-500"
                  : isDark
                    ? "border-gray-600 hover:border-green-500"
                    : "border-gray-300 hover:border-green-500"
              }`}
            >
              {task.completed && <Check className="w-3 h-3 text-white" />}
            </button>
            <h3
              className={`font-medium ${
                task.completed ? "line-through text-gray-500" : isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p
              className={`text-sm mb-3 ${
                task.completed ? "line-through text-gray-500" : isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs">
            {task.dueDate && (
              <div
                className={`flex items-center space-x-1 ${
                  isOverdue ? "text-red-500" : isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            )}

            {task.priority && (
              <div className={`flex items-center space-x-1 ${priorityColors[task.priority]}`}>
                <Flag className="w-3 h-3" />
                <span className="capitalize">{task.priority}</span>
              </div>
            )}

            {task.reminder && (
              <div className={`flex items-center space-x-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                <Clock className="w-3 h-3" />
                <span>Reminder</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1 ml-4">
          <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TaskCard

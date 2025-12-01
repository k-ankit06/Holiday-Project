"use client"

import { useState, useEffect } from "react"
import { Plus, X, Tag, Paperclip } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useTask } from "../context/TaskContext"
import Button from "./Button"

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const { isDark } = useTheme()
  const { categories, templates, teamMembers } = useTask()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
    reminder: false,
    categoryId: "",
    assignedTo: "",
    tags: [],
    estimatedTime: "",
    attachments: [],
    isRecurring: false,
    recurringPattern: "daily",
    recurringEnd: "",
  })
  const [newTag, setNewTag] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        priority: task.priority || "medium",
        reminder: task.reminder || false,
        categoryId: task.categoryId || "",
        assignedTo: task.assignedTo || "",
        tags: task.tags || [],
        estimatedTime: task.estimatedTime || "",
        attachments: task.attachments || [],
        isRecurring: task.isRecurring || false,
        recurringPattern: task.recurringPattern || "daily",
        recurringEnd: task.recurringEnd ? task.recurringEnd.split("T")[0] : "",
      })
    }
  }, [task])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    onSubmit({
      ...task,
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      recurringEnd: formData.recurringEnd ? new Date(formData.recurringEnd).toISOString() : null,
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleTemplateSelect = (templateId) => {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setFormData((prev) => ({
        ...prev,
        title: template.title,
        description: template.description,
        priority: template.priority,
        categoryId: template.categoryId,
        estimatedTime: template.estimatedTime,
        tags: template.tags || [],
      }))
    }
    setSelectedTemplate("")
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newAttachments = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
    }))

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
    }))
  }

  const removeAttachment = (attachmentId) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.id !== attachmentId),
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
      {/* Template Selection */}
      {!task && templates.length > 0 && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            Start from Template
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="">Choose a template...</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            Task Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
            }`}
            placeholder="Enter task title"
            required
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
            }`}
            placeholder="Enter task description"
          />
        </div>
      </div>

      {/* Task Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            Category
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="">No Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            Due Date
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            Estimated Time (hours)
          </label>
          <input
            type="number"
            name="estimatedTime"
            value={formData.estimatedTime}
            onChange={handleChange}
            min="0"
            step="0.5"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
            }`}
            placeholder="0"
          />
        </div>
      </div>

      {/* Assignment */}
      {teamMembers.length > 0 && (
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            Assign To
          </label>
          <select
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="">Unassigned</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tags */}
      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                isDark ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
              }`}
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
            }`}
            placeholder="Add tag"
          />
          <Button type="button" onClick={addTag} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Attachments */}
      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
          Attachments
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
          }`}
        />
        {formData.attachments.length > 0 && (
          <div className="mt-2 space-y-2">
            {formData.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className={`flex items-center justify-between p-2 rounded border ${
                  isDark ? "border-gray-600 bg-gray-700" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  <Paperclip className="w-4 h-4 mr-2" />
                  <span className="text-sm">{attachment.name}</span>
                  <span className={`text-xs ml-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    ({Math.round(attachment.size / 1024)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recurring Task Options */}
      <div className="space-y-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isRecurring"
            id="isRecurring"
            checked={formData.isRecurring}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isRecurring" className={`ml-2 text-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            Recurring Task
          </label>
        </div>

        {formData.isRecurring && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Repeat
              </label>
              <select
                name="recurringPattern"
                value={formData.recurringPattern}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                End Date
              </label>
              <input
                type="date"
                name="recurringEnd"
                value={formData.recurringEnd}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            name="reminder"
            id="reminder"
            checked={formData.reminder}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="reminder" className={`ml-2 text-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            Set reminder notification
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{task ? "Update Task" : "Add Task"}</Button>
      </div>
    </form>
  )
}

export default TaskForm

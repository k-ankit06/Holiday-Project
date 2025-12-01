"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Copy, X } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useTask } from "../context/TaskContext"
import Button from "./Button"
import Modal from "./Modal"

const TemplateManager = () => {
  const { isDark } = useTheme()
  const { templates, categories, addTemplate, updateTemplate, deleteTemplate, addTaskFromTemplate } = useTask()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    priority: "medium",
    categoryId: "",
    estimatedTime: "",
    tags: [],
    defaultDueDate: "", // days from creation
  })
  const [newTag, setNewTag] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.title.trim()) return

    if (editingTemplate) {
      updateTemplate({ ...editingTemplate, ...formData })
    } else {
      addTemplate(formData)
    }

    handleCloseModal()
  }

  const handleEdit = (template) => {
    setEditingTemplate(template)
    setFormData({
      name: template.name,
      title: template.title,
      description: template.description || "",
      priority: template.priority || "medium",
      categoryId: template.categoryId || "",
      estimatedTime: template.estimatedTime || "",
      tags: template.tags || [],
      defaultDueDate: template.defaultDueDate || "",
    })
    setIsModalOpen(true)
  }

  const handleDelete = (templateId) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteTemplate(templateId)
    }
  }

  const handleUseTemplate = (templateId) => {
    addTaskFromTemplate(templateId)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTemplate(null)
    setFormData({
      name: "",
      title: "",
      description: "",
      priority: "medium",
      categoryId: "",
      estimatedTime: "",
      tags: [],
      defaultDueDate: "",
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Task Templates</h2>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          <p className="text-lg mb-2">No templates yet</p>
          <p className="text-sm">Create templates for tasks you do regularly</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => {
            const category = categories.find((c) => c.id === template.categoryId)
            return (
              <div
                key={template.id}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  isDark
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className={`font-medium mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{template.name}</h3>
                    <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"}`}>{template.title}</p>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <Button variant="ghost" size="sm" onClick={() => handleUseTemplate(template.id)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {template.description && (
                  <p className={`text-xs mb-3 ${isDark ? "text-gray-400" : "text-gray-500"}`}>{template.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {category && (
                    <span className="px-2 py-1 rounded-full text-white" style={{ backgroundColor: category.color }}>
                      {category.name}
                    </span>
                  )}

                  <span
                    className={`px-2 py-1 rounded-full ${
                      template.priority === "high"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : template.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {template.priority}
                  </span>

                  {template.estimatedTime && (
                    <span
                      className={`px-2 py-1 rounded-full ${isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"}`}
                    >
                      {template.estimatedTime}h
                    </span>
                  )}
                </div>

                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-2 py-1 rounded ${isDark ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"}`}
                      >
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        +{template.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Template Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTemplate ? "Edit Template" : "Add New Template"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Template Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholder="e.g., Weekly Report"
              required
            />
          </div>

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
              placeholder="Task title that will be used"
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
              placeholder="Template description"
            />
          </div>

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

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Default Due Date (days)
              </label>
              <input
                type="number"
                name="defaultDueDate"
                value={formData.defaultDueDate}
                onChange={handleChange}
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Days from creation"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    isDark ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
                  }`}
                >
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

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">{editingTemplate ? "Update Template" : "Add Template"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TemplateManager

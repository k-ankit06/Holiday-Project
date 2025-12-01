"use client"

import { useState } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useTask } from "../context/TaskContext"
import Button from "./Button"
import Modal from "./Modal"

const CategoryManager = () => {
  const { isDark } = useTheme()
  const { categories, addCategory, updateCategory, deleteCategory } = useTask()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    color: "#3B82F6",
    icon: "folder",
    description: "",
  })

  const iconOptions = [
    { value: "folder", label: "Folder", icon: "📁" },
    { value: "briefcase", label: "Work", icon: "💼" },
    { value: "user", label: "Personal", icon: "👤" },
    { value: "shopping-cart", label: "Shopping", icon: "🛒" },
    { value: "heart", label: "Health", icon: "❤️" },
    { value: "book", label: "Learning", icon: "📚" },
    { value: "home", label: "Home", icon: "🏠" },
    { value: "car", label: "Travel", icon: "🚗" },
  ]

  const colorOptions = [
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#8B5CF6", // Purple
    "#F97316", // Orange
    "#06B6D4", // Cyan
    "#84CC16", // Lime
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    if (editingCategory) {
      updateCategory({ ...editingCategory, ...formData })
    } else {
      addCategory(formData)
    }

    handleCloseModal()
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
      description: category.description || "",
    })
    setIsModalOpen(true)
  }

  const handleDelete = (categoryId) => {
    if (
      window.confirm("Are you sure you want to delete this category? Tasks in this category will become uncategorized.")
    ) {
      deleteCategory(categoryId)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCategory(null)
    setFormData({
      name: "",
      color: "#3B82F6",
      icon: "folder",
      description: "",
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Categories</h2>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
              isDark
                ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                  style={{ backgroundColor: category.color }}
                >
                  {iconOptions.find((opt) => opt.value === category.icon)?.icon || "📁"}
                </div>
                <div>
                  <h3 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{category.name}</h3>
                  {category.description && (
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{category.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

     
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? "Edit Category" : "Add New Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholder="Enter category name"
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
              rows={2}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {iconOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, icon: option.value }))}
                  className={`p-2 rounded border text-center transition-colors ${
                    formData.icon === option.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                      : isDark
                        ? "border-gray-600 hover:border-gray-500"
                        : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="text-lg">{option.icon}</div>
                  <div className="text-xs mt-1">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color ? "border-gray-400 scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">{editingCategory ? "Update Category" : "Add Category"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CategoryManager

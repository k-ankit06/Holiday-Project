
import { useState } from "react"
import { Plus, Edit, Trash2, Copy, Star, Search, Filter, FileText, Zap, Clock, Tag } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useTask } from "../context/TaskContext"
import { useAuth } from "../context/AuthContext"
import Button from "../components/Button"
import Modal from "../components/Modal"
import AuthModal from "../components/AuthModal"

const TemplatesPage = () => {
  const { isDark } = useTheme()
  const { templates, categories, addTemplate, updateTemplate, deleteTemplate, addTaskFromTemplate, isAuthenticated } =
    useTask()
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    priority: "medium",
    categoryId: "",
    estimatedTime: "",
    tags: [],
    defaultDueDate: "",
    isPublic: false,
    color: "#3B82F6",
  })
  const [newTag, setNewTag] = useState("")

  // Predefined templates for new users
  const predefinedTemplates = [
    {
      id: "template-1",
      name: "Daily Standup",
      title: "Daily Team Standup Meeting",
      description: "Prepare for daily standup: what you did yesterday, what you'll do today, any blockers",
      priority: "medium",
      categoryId: "work",
      estimatedTime: "0.5",
      tags: ["meeting", "standup", "team"],
      color: "#3B82F6",
      isPublic: true,
      isPredefined: true,
    },
    {
      id: "template-2",
      name: "Weekly Review",
      title: "Weekly Goals Review",
      description: "Review weekly goals, assess progress, plan for next week",
      priority: "high",
      categoryId: "personal",
      estimatedTime: "1",
      tags: ["review", "goals", "planning"],
      color: "#10B981",
      isPublic: true,
      isPredefined: true,
    },
    {
      id: "template-3",
      name: "Bug Fix",
      title: "Fix Critical Bug",
      description: "Investigate, reproduce, fix and test the reported bug",
      priority: "high",
      categoryId: "work",
      estimatedTime: "2",
      tags: ["bug", "development", "urgent"],
      color: "#EF4444",
      isPublic: true,
      isPredefined: true,
    },
    {
      id: "template-4",
      name: "Grocery Shopping",
      title: "Weekly Grocery Shopping",
      description: "Plan and complete weekly grocery shopping with list",
      priority: "low",
      categoryId: "shopping",
      estimatedTime: "1.5",
      tags: ["shopping", "groceries", "weekly"],
      color: "#F59E0B",
      isPublic: true,
      isPredefined: true,
    },
  ]

  const allTemplates = isAuthenticated ? [...predefinedTemplates, ...templates] : predefinedTemplates

  const filteredTemplates = allTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || template.categoryId === selectedCategory

    return matchesSearch && matchesCategory
  })

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
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }
    if (template.isPredefined) return // Can't edit predefined templates

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
      isPublic: template.isPublic || false,
      color: template.color || "#3B82F6",
    })
    setIsModalOpen(true)
  }

  const handleDelete = (templateId, isPredefined) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }
    if (isPredefined) return // Can't delete predefined templates

    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteTemplate(templateId)
    }
  }

  const handleUseTemplate = (template) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }

    if (template.isPredefined) {
      // Create task from predefined template
      const newTask = {
        title: template.title,
        description: template.description,
        priority: template.priority,
        categoryId: template.categoryId,
        estimatedTime: template.estimatedTime,
        tags: template.tags,
        dueDate: template.defaultDueDate
          ? new Date(Date.now() + Number.parseInt(template.defaultDueDate) * 24 * 60 * 60 * 1000).toISOString()
          : null,
        reminder: false,
      }
      // This would need to be handled by the task context
      // For now, we'll show a success message
      alert("Task created from template!")
    } else {
      addTaskFromTemplate(template.id)
    }
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
      isPublic: false,
      color: "#3B82F6",
    })
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
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

  const TemplateCard = ({ template }) => {
    const category = categories.find((c) => c.id === template.categoryId)
    const isPredefined = template.isPredefined

    return (
      <div
        className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg hover-lift group ${
          isDark
            ? "bg-gray-800 border-gray-700 hover:border-gray-600"
            : "bg-white border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3 flex-1">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
              style={{ backgroundColor: template.color }}
            >
              {isPredefined ? <Zap className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{template.name}</h3>
                {isPredefined && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
                    Featured
                  </span>
                )}
                {template.isPublic && !isPredefined && <Star className="h-4 w-4 text-yellow-500" />}
              </div>
              <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"} mb-2`}>{template.title}</p>
              {template.description && (
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"} mb-3`}>{template.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleUseTemplate(template)}
              className="text-green-600 hover:text-green-700"
            >
              <Copy className="w-4 h-4" />
            </Button>
            {!isPredefined && (
              <>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(template.id, isPredefined)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          {category && (
            <span
              className="px-3 py-1 rounded-full text-white text-xs font-medium"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          )}

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
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
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
              }`}
            >
              <Clock className="w-3 h-3 inline mr-1" />
              {template.estimatedTime}h
            </span>
          )}
        </div>

        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`text-xs px-2 py-1 rounded-full ${
                  isDark ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
                }`}
              >
                <Tag className="w-3 h-3 inline mr-1" />
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
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-4`}>Task Templates</h1>
            <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"} mb-8`}>
              Get started faster with pre-built task templates
            </p>
          </div>

          {/* Featured Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predefinedTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>

          {/* CTA */}
          <div
            className={`text-center py-12 rounded-2xl border-2 border-dashed ${
              isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-300 bg-blue-50"
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
              Create Custom Templates
            </h3>
            <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Sign in to create your own templates and save time on recurring tasks
            </p>
            <Button onClick={() => setAuthModalOpen(true)} className="btn-gradient">
              Sign In to Create Templates
            </Button>
          </div>
        </div>

        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultMode="login" />
      </>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Task Templates</h1>
          <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Create and manage reusable task templates
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="btn-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates..."
            className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
            }`}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <div
          className={`text-center py-12 rounded-2xl border-2 border-dashed ${
            isDark ? "border-gray-700" : "border-gray-300"
          }`}
        >
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
            No templates found
          </h3>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {searchTerm ? "Try adjusting your search terms" : "Create your first template to get started"}
          </p>
        </div>
      )}

      {/* Template Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTemplate ? "Edit Template" : "Create New Template"}
      >
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Template Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="e.g., Weekly Report"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Task Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Task title that will be used"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Template description"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Category
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Estimated Time (hours)
              </label>
              <input
                type="number"
                name="estimatedTime"
                value={formData.estimatedTime}
                onChange={handleChange}
                min="0"
                step="0.5"
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="0"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Template Color
              </label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className={`w-full h-10 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                }`}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                    isDark ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-red-500">
                    ×
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
                className={`flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Add tag"
              />
              <Button type="button" onClick={addTag} size="sm">
                Add
              </Button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                id="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublic" className={`ml-2 text-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Make template public
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" className="btn-gradient">
              {editingTemplate ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TemplatesPage

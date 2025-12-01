
import { useState, useEffect } from "react"
import { Filter, Search, Tag, ChevronDown, ChevronUp } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useTask } from "../context/TaskContext"
import { createAdvancedFilter, getFilterPresets } from "../utils/advancedFilters"
import Button from "./Button"

const AdvancedFilters = ({ filters, onFiltersChange, onApplyPreset }) => {
  const { isDark } = useTheme()
  const { categories, teamMembers } = useTask()
  const [isExpanded, setIsExpanded] = useState(false)
  const [activePreset, setActivePreset] = useState(null)
  const [customTags, setCustomTags] = useState([])
  const [newTag, setNewTag] = useState("")

  const filterPresets = getFilterPresets()

  useEffect(() => {
    const allTags = new Set()
    setCustomTags(Array.from(allTags))
  }, [])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    onFiltersChange(newFilters)
    setActivePreset(null)
  }

  const handleDateRangeChange = (key, value) => {
    const newFilters = {
      ...filters,
      dateRange: { ...filters.dateRange, [key]: value },
    }
    onFiltersChange(newFilters)
    setActivePreset(null)
  }

  const handleTagToggle = (tag) => {
    const newTags = filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag]

    handleFilterChange("tags", newTags)
  }

  const handlePresetClick = (preset) => {
    setActivePreset(preset.id)
    onApplyPreset(preset.filters)
  }

  const clearAllFilters = () => {
    onFiltersChange(createAdvancedFilter())
    setActivePreset(null)
  }

  const hasActiveFilters = () => {
    const defaultFilters = createAdvancedFilter()
    return (
      filters.search !== defaultFilters.search ||
      filters.status !== defaultFilters.status ||
      filters.priority !== defaultFilters.priority ||
      filters.category !== defaultFilters.category ||
      filters.assignee !== defaultFilters.assignee ||
      filters.dateRange.start !== defaultFilters.dateRange.start ||
      filters.dateRange.end !== defaultFilters.dateRange.end ||
      filters.tags.length > 0 ||
      filters.hasAttachments !== defaultFilters.hasAttachments ||
      filters.isShared !== defaultFilters.isShared
    )
  }

  return (
    <div className={`border rounded-lg ${isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <h3 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Advanced Filters</h3>
            {hasActiveFilters() && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters() && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {filterPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                activePreset === preset.id
                  ? "bg-blue-600 text-white"
                  : isDark
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Search tasks, descriptions, tags..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="all">All Priorities</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
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

            {teamMembers.length > 0 && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                  Assignee
                </label>
                <select
                  value={filters.assignee}
                  onChange={(e) => handleFilterChange("assignee", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="all">All Assignees</option>
                  <option value="">Unassigned</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Date Range
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={filters.dateRange.type}
                onChange={(e) => handleDateRangeChange("type", e.target.value)}
                className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="dueDate">Due Date</option>
                <option value="createdAt">Created Date</option>
                <option value="completedAt">Completed Date</option>
              </select>
              <input
                type="date"
                value={filters.dateRange.start || ""}
                onChange={(e) => handleDateRangeChange("start", e.target.value)}
                className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="Start date"
              />
              <input
                type="date"
                value={filters.dateRange.end || ""}
                onChange={(e) => handleDateRangeChange("end", e.target.value)}
                className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
                placeholder="End date"
              />
            </div>
          </div>

          {customTags.length > 0 && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {customTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      filters.tags.includes(tag)
                        ? "bg-blue-600 text-white"
                        : isDark
                          ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Tag className="w-3 h-3 mr-1 inline" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hasAttachments"
                checked={filters.hasAttachments}
                onChange={(e) => handleFilterChange("hasAttachments", e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hasAttachments" className={`ml-2 text-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Has attachments
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isShared"
                checked={filters.isShared}
                onChange={(e) => handleFilterChange("isShared", e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isShared" className={`ml-2 text-sm ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Shared with others
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="createdAt">Created Date</option>
                <option value="dueDate">Due Date</option>
                <option value="title">Title</option>
                <option value="priority">Priority</option>
                <option value="category">Category</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Group By
            </label>
            <select
              value={filters.groupBy || ""}
              onChange={(e) => handleFilterChange("groupBy", e.target.value || null)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="">No Grouping</option>
              <option value="category">Category</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              {teamMembers.length > 0 && <option value="assignee">Assignee</option>}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdvancedFilters
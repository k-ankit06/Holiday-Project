export const createAdvancedFilter = () => ({
  search: "",
  status: "all", 
  priority: "all", 
  category: "all",
  assignee: "all",
  dateRange: {
    start: null,
    end: null,
    type: "dueDate", 
  },
  tags: [],
  hasAttachments: false,
  isShared: false,
  sortBy: "createdAt", 
  sortOrder: "desc",
  groupBy: null,
})

export const applyAdvancedFilters = (tasks, filters, categories = [], teamMembers = []) => {
  let filteredTasks = [...tasks]


  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filteredTasks = filteredTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower)) ||
        (task.tags && task.tags.some((tag) => tag.toLowerCase().includes(searchLower))),
    )
  }


  if (filters.status !== "all") {
    switch (filters.status) {
      case "completed":
        filteredTasks = filteredTasks.filter((task) => task.completed)
        break
      case "pending":
        filteredTasks = filteredTasks.filter((task) => !task.completed)
        break
      case "overdue":
        filteredTasks = filteredTasks.filter(
          (task) => !task.completed && task.dueDate && new Date(task.dueDate) < new Date(),
        )
        break
    }
  }

 
  if (filters.priority !== "all") {
    filteredTasks = filteredTasks.filter((task) => task.priority === filters.priority)
  }


  if (filters.category !== "all") {
    filteredTasks = filteredTasks.filter((task) => task.categoryId === filters.category)
  }


  if (filters.assignee !== "all") {
    filteredTasks = filteredTasks.filter((task) => task.assignedTo === filters.assignee)
  }

  if (filters.dateRange.start || filters.dateRange.end) {
    filteredTasks = filteredTasks.filter((task) => {
      const taskDate = task[filters.dateRange.type]
      if (!taskDate) return false

      const date = new Date(taskDate)
      const start = filters.dateRange.start ? new Date(filters.dateRange.start) : null
      const end = filters.dateRange.end ? new Date(filters.dateRange.end) : null

      if (start && date < start) return false
      if (end && date > end) return false

      return true
    })
  }

 
  if (filters.tags.length > 0) {
    filteredTasks = filteredTasks.filter((task) => task.tags && filters.tags.every((tag) => task.tags.includes(tag)))
  }


  if (filters.hasAttachments) {
    filteredTasks = filteredTasks.filter((task) => task.attachments && task.attachments.length > 0)
  }


  if (filters.isShared) {
    filteredTasks = filteredTasks.filter((task) => task.sharedWith && task.sharedWith.length > 0)
  }


  filteredTasks = sortTasks(filteredTasks, filters.sortBy, filters.sortOrder)


  if (filters.groupBy) {
    return groupTasks(filteredTasks, filters.groupBy, categories, teamMembers)
  }

  return filteredTasks
}

const sortTasks = (tasks, sortBy, sortOrder) => {
  return [...tasks].sort((a, b) => {
    let aValue, bValue

    switch (sortBy) {
      case "title":
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case "dueDate":
        aValue = a.dueDate ? new Date(a.dueDate) : new Date("9999-12-31")
        bValue = b.dueDate ? new Date(b.dueDate) : new Date("9999-12-31")
        break
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        aValue = priorityOrder[a.priority] || 0
        bValue = priorityOrder[b.priority] || 0
        break
      case "category":
        aValue = a.categoryId || ""
        bValue = b.categoryId || ""
        break
      case "createdAt":
      default:
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
    return 0
  })
}

const groupTasks = (tasks, groupBy, categories, teamMembers) => {
  const groups = {}

  tasks.forEach((task) => {
    let groupKey

    switch (groupBy) {
      case "category":
        const category = categories.find((c) => c.id === task.categoryId)
        groupKey = category ? category.name : "Uncategorized"
        break
      case "priority":
        groupKey = task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : "No Priority"
        break
      case "assignee":
        const assignee = teamMembers.find((m) => m.id === task.assignedTo)
        groupKey = assignee ? assignee.name : "Unassigned"
        break
      case "status":
        if (task.completed) {
          groupKey = "Completed"
        } else if (task.dueDate && new Date(task.dueDate) < new Date()) {
          groupKey = "Overdue"
        } else {
          groupKey = "Pending"
        }
        break
      default:
        groupKey = "All Tasks"
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(task)
  })

  return groups
}

export const getFilterPresets = () => [
  {
    id: "today",
    name: "Due Today",
    filters: {
      ...createAdvancedFilter(),
      status: "pending",
      dateRange: {
        start: new Date().toISOString().split("T")[0],
        end: new Date().toISOString().split("T")[0],
        type: "dueDate",
      },
    },
  },
  {
    id: "overdue",
    name: "Overdue Tasks",
    filters: {
      ...createAdvancedFilter(),
      status: "overdue",
    },
  },
  {
    id: "high-priority",
    name: "High Priority",
    filters: {
      ...createAdvancedFilter(),
      priority: "high",
      status: "pending",
    },
  },
  {
    id: "this-week",
    name: "This Week",
    filters: {
      ...createAdvancedFilter(),
      dateRange: {
        start: getWeekStart().toISOString().split("T")[0],
        end: getWeekEnd().toISOString().split("T")[0],
        type: "dueDate",
      },
    },
  },
  {
    id: "shared-with-me",
    name: "Shared with Me",
    filters: {
      ...createAdvancedFilter(),
      isShared: true,
    },
  },
]

const getWeekStart = () => {
  const date = new Date()
  const day = date.getDay()
  const diff = date.getDate() - day
  return new Date(date.setDate(diff))
}

const getWeekEnd = () => {
  const date = getWeekStart()
  return new Date(date.setDate(date.getDate() + 6))
}

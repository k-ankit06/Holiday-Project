export const filterTasks = (tasks, filters) => {
  return tasks.filter((task) => {
  
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))

      if (!matchesSearch) return false
    }

  
    if (filters.status && filters.status !== "all") {
      if (filters.status === "completed" && !task.completed) return false
      if (filters.status === "pending" && task.completed) return false
      if (filters.status === "overdue" && (!task.dueDate || task.completed || new Date(task.dueDate) >= new Date()))
        return false
    }


    if (filters.priority && filters.priority !== "all") {
      if (task.priority !== filters.priority) return false
    }

    if (filters.dateFrom || filters.dateTo) {
      if (!task.dueDate) return false

      const taskDate = new Date(task.dueDate)
      if (filters.dateFrom && taskDate < new Date(filters.dateFrom)) return false
      if (filters.dateTo && taskDate > new Date(filters.dateTo)) return false
    }

    return true
  })
}

export const sortTasks = (tasks, sortBy = "createdAt", sortOrder = "desc") => {
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

export const getTaskStats = (tasks) => {
  const total = tasks.length
  const completed = tasks.filter((task) => task.completed).length
  const pending = total - completed
  const overdue = tasks.filter((task) => !task.completed && task.dueDate && new Date(task.dueDate) < new Date()).length

  const priorityStats = {
    high: tasks.filter((task) => task.priority === "high").length,
    medium: tasks.filter((task) => task.priority === "medium").length,
    low: tasks.filter((task) => task.priority === "low").length,
  }

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    total,
    completed,
    pending,
    overdue,
    completionRate,
    priorityStats,
  }
}

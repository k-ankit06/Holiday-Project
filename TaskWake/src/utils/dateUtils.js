export const formatDate = (dateString) => {
  if (!dateString) return ""

  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const formatDateTime = (dateString) => {
  if (!dateString) return ""

  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const isOverdue = (dueDate, completed = false) => {
  if (!dueDate || completed) return false
  return new Date(dueDate) < new Date()
}

export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null

  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

export const getWeekDates = (date = new Date()) => {
  const week = []
  const startDate = new Date(date)
  startDate.setDate(date.getDate() - date.getDay())

  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate)
    day.setDate(startDate.getDate() + i)
    week.push(day)
  }

  return week
}

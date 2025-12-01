"use client"

import { useEffect } from "react"

export const useNotification = () => {
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }, [])

  const scheduleNotification = (task) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const dueDate = new Date(task.dueDate)
      const now = new Date()
      const timeDiff = dueDate.getTime() - now.getTime()

      if (timeDiff > 0) {
        setTimeout(() => {
          new Notification("TaskWave Pro Reminder", {
            body: `Task "${task.title}" is due!`,
            icon: "/favicon.ico",
            tag: task.id,
          })
        }, timeDiff)
      }
    }
  }

  const showNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
      })
    }
  }

  return { scheduleNotification, showNotification }
}

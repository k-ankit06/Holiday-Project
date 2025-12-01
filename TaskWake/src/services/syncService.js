// Mock sync service - replace with actual Firebase/Supabase implementation
class SyncService {
  constructor() {
    this.isOnline = navigator.onLine
    this.syncQueue = []
    this.lastSync = localStorage.getItem("taskwave-last-sync")

    // Listen for online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true
      this.processSyncQueue()
    })

    window.addEventListener("offline", () => {
      this.isOnline = false
    })
  }

  async syncAll(data) {
    if (!this.isOnline) {
      this.addToSyncQueue("syncAll", data)
      return
    }

    try {
      // Mock API call - replace with actual implementation
      await this.mockApiCall("/api/sync", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          userId: this.getCurrentUserId(),
          timestamp: new Date().toISOString(),
        }),
      })

      localStorage.setItem("taskwave-last-sync", new Date().toISOString())
      return { success: true }
    } catch (error) {
      this.addToSyncQueue("syncAll", data)
      throw error
    }
  }

  async syncTasks(tasks) {
    if (!this.isOnline) {
      this.addToSyncQueue("syncTasks", tasks)
      return
    }

    try {
      await this.mockApiCall("/api/tasks/sync", {
        method: "POST",
        body: JSON.stringify({
          tasks,
          userId: this.getCurrentUserId(),
        }),
      })
    } catch (error) {
      this.addToSyncQueue("syncTasks", tasks)
      throw error
    }
  }

  async shareTask(taskId, userEmail) {
    if (!this.isOnline) {
      this.addToSyncQueue("shareTask", { taskId, userEmail })
      return
    }

    try {
      const response = await this.mockApiCall("/api/tasks/share", {
        method: "POST",
        body: JSON.stringify({
          taskId,
          userEmail,
          sharedBy: this.getCurrentUserId(),
        }),
      })
      return response
    } catch (error) {
      this.addToSyncQueue("shareTask", { taskId, userEmail })
      throw error
    }
  }

  async getSharedTasks() {
    if (!this.isOnline) return []

    try {
      const response = await this.mockApiCall(`/api/tasks/shared/${this.getCurrentUserId()}`)
      return response.tasks || []
    } catch (error) {
      console.error("Error fetching shared tasks:", error)
      return []
    }
  }

  async inviteTeamMember(email, role = "member") {
    if (!this.isOnline) {
      this.addToSyncQueue("inviteTeamMember", { email, role })
      return
    }

    try {
      const response = await this.mockApiCall("/api/team/invite", {
        method: "POST",
        body: JSON.stringify({
          email,
          role,
          invitedBy: this.getCurrentUserId(),
        }),
      })
      return response
    } catch (error) {
      this.addToSyncQueue("inviteTeamMember", { email, role })
      throw error
    }
  }

  addToSyncQueue(action, data) {
    this.syncQueue.push({
      action,
      data,
      timestamp: new Date().toISOString(),
    })
    localStorage.setItem("taskwave-sync-queue", JSON.stringify(this.syncQueue))
  }

  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return

    const queue = [...this.syncQueue]
    this.syncQueue = []

    for (const item of queue) {
      try {
        switch (item.action) {
          case "syncAll":
            await this.syncAll(item.data)
            break
          case "syncTasks":
            await this.syncTasks(item.data)
            break
          case "shareTask":
            await this.shareTask(item.data.taskId, item.data.userEmail)
            break
          case "inviteTeamMember":
            await this.inviteTeamMember(item.data.email, item.data.role)
            break
        }
      } catch (error) {
        // Re-add failed items to queue
        this.addToSyncQueue(item.action, item.data)
      }
    }

    localStorage.setItem("taskwave-sync-queue", JSON.stringify(this.syncQueue))
  }

  getCurrentUserId() {
    // Mock user ID - replace with actual authentication
    let userId = localStorage.getItem("taskwave-user-id")
    if (!userId) {
      userId = "user_" + Math.random().toString(36).substr(2, 9)
      localStorage.setItem("taskwave-user-id", userId)
    }
    return userId
  }

  async mockApiCall(url, options = {}) {
    // Mock API delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

    // Mock success/failure
    if (Math.random() > 0.9) {
      throw new Error("Network error")
    }

    return {
      success: true,
      data: options.body ? JSON.parse(options.body) : null,
      timestamp: new Date().toISOString(),
    }
  }

  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      queueLength: this.syncQueue.length,
    }
  }
}

export const syncService = new SyncService()

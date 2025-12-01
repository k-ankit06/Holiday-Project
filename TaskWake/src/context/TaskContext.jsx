"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { useAuth } from "./AuthContext"
import { useNotification } from "../hooks/useNotification"
import { syncService } from "../services/syncService"

const TaskContext = createContext()

export const useTask = () => {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error("useTask must be used within a TaskProvider")
  }
  return context
}

const taskReducer = (state, action) => {
  switch (action.type) {
    case "SET_TASKS":
      return { ...state, tasks: action.payload }
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload }
    case "SET_TEMPLATES":
      return { ...state, templates: action.payload }
    case "SET_TEAM_MEMBERS":
      return { ...state, teamMembers: action.payload }
    case "SET_SYNC_STATUS":
      return { ...state, syncStatus: action.payload }
    case "RESET_DATA":
      return { ...initialState }
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] }
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] }
    case "ADD_TEMPLATE":
      return { ...state, templates: [...state.templates, action.payload] }
    case "ADD_TEAM_MEMBER":
      return { ...state, teamMembers: [...state.teamMembers, action.payload] }
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) => (task.id === action.payload.id ? action.payload : task)),
      }
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((cat) => (cat.id === action.payload.id ? action.payload : cat)),
      }
    case "UPDATE_TEMPLATE":
      return {
        ...state,
        templates: state.templates.map((template) => (template.id === action.payload.id ? action.payload : template)),
      }
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      }
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((cat) => cat.id !== action.payload),
      }
    case "DELETE_TEMPLATE":
      return {
        ...state,
        templates: state.templates.filter((template) => template.id !== action.payload),
      }
    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : null }
            : task,
        ),
      }
    case "SHARE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.taskId
            ? { ...task, sharedWith: [...(task.sharedWith || []), action.payload.userId] }
            : task,
        ),
      }
    default:
      return state
  }
}

const initialState = {
  tasks: [],
  categories: [
    { id: "work", name: "Work", color: "#3B82F6", icon: "briefcase" },
    { id: "personal", name: "Personal", color: "#10B981", icon: "user" },
    { id: "shopping", name: "Shopping", color: "#F59E0B", icon: "shopping-cart" },
    { id: "health", name: "Health", color: "#EF4444", icon: "heart" },
  ],
  templates: [],
  teamMembers: [],
  syncStatus: "idle",
}

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState)
  const { user, isAuthenticated } = useAuth()
  const { scheduleNotification } = useNotification()

  // Load user-specific data when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData(user.id)
    } else {
      // Reset data when user logs out
      dispatch({ type: "RESET_DATA" })
    }
  }, [user, isAuthenticated])

  // Save data whenever state changes (only if user is authenticated)
  useEffect(() => {
    if (isAuthenticated && user) {
      saveUserData(user.id)
    }
  }, [state.tasks, state.categories, state.templates, state.teamMembers, user, isAuthenticated])

  const getUserDataKey = (userId, dataType) => `taskwave-${userId}-${dataType}`

  const loadUserData = (userId) => {
    try {
      const savedTasks = localStorage.getItem(getUserDataKey(userId, "tasks"))
      const savedCategories = localStorage.getItem(getUserDataKey(userId, "categories"))
      const savedTemplates = localStorage.getItem(getUserDataKey(userId, "templates"))
      const savedTeamMembers = localStorage.getItem(getUserDataKey(userId, "team-members"))

      if (savedTasks) dispatch({ type: "SET_TASKS", payload: JSON.parse(savedTasks) })
      if (savedCategories) dispatch({ type: "SET_CATEGORIES", payload: JSON.parse(savedCategories) })
      if (savedTemplates) dispatch({ type: "SET_TEMPLATES", payload: JSON.parse(savedTemplates) })
      if (savedTeamMembers) dispatch({ type: "SET_TEAM_MEMBERS", payload: JSON.parse(savedTeamMembers) })
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const saveUserData = (userId) => {
    try {
      localStorage.setItem(getUserDataKey(userId, "tasks"), JSON.stringify(state.tasks))
      localStorage.setItem(getUserDataKey(userId, "categories"), JSON.stringify(state.categories))
      localStorage.setItem(getUserDataKey(userId, "templates"), JSON.stringify(state.templates))
      localStorage.setItem(getUserDataKey(userId, "team-members"), JSON.stringify(state.teamMembers))
    } catch (error) {
      console.error("Error saving user data:", error)
    }
  }

  const syncData = async () => {
    if (!isAuthenticated) return

    try {
      dispatch({ type: "SET_SYNC_STATUS", payload: "syncing" })
      await syncService.syncAll({
        tasks: state.tasks,
        categories: state.categories,
        templates: state.templates,
        teamMembers: state.teamMembers,
        userId: user.id,
      })
      dispatch({ type: "SET_SYNC_STATUS", payload: "synced" })
    } catch (error) {
      console.error("Sync error:", error)
      dispatch({ type: "SET_SYNC_STATUS", payload: "error" })
    }
  }

  const addTask = (task) => {
    if (!isAuthenticated) return

    const newTask = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completed: false,
      userId: user.id,
      sharedWith: task.sharedWith || [],
      comments: [],
      attachments: [],
    }
    dispatch({ type: "ADD_TASK", payload: newTask })

    if (newTask.dueDate && newTask.reminder) {
      scheduleNotification(newTask)
    }
  }

  const addTaskFromTemplate = (templateId) => {
    if (!isAuthenticated) return

    const template = state.templates.find((t) => t.id === templateId)
    if (template) {
      const newTask = {
        ...template,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        completed: false,
        userId: user.id,
        dueDate: template.defaultDueDate
          ? new Date(Date.now() + template.defaultDueDate * 24 * 60 * 60 * 1000).toISOString()
          : null,
      }
      dispatch({ type: "ADD_TASK", payload: newTask })
    }
  }

  const updateTask = (task) => {
    if (!isAuthenticated) return

    dispatch({ type: "UPDATE_TASK", payload: task })
    if (task.dueDate && task.reminder && !task.completed) {
      scheduleNotification(task)
    }
  }

  const deleteTask = (id) => {
    if (!isAuthenticated) return
    dispatch({ type: "DELETE_TASK", payload: id })
  }

  const toggleTask = (id) => {
    if (!isAuthenticated) return
    dispatch({ type: "TOGGLE_TASK", payload: id })
  }

  const shareTask = (taskId, userId) => {
    if (!isAuthenticated) return
    dispatch({ type: "SHARE_TASK", payload: { taskId, userId } })
  }

  const addCategory = (category) => {
    if (!isAuthenticated) return

    const newCategory = {
      ...category,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      userId: user.id,
    }
    dispatch({ type: "ADD_CATEGORY", payload: newCategory })
  }

  const updateCategory = (category) => {
    if (!isAuthenticated) return
    dispatch({ type: "UPDATE_CATEGORY", payload: category })
  }

  const deleteCategory = (id) => {
    if (!isAuthenticated) return
    dispatch({ type: "DELETE_CATEGORY", payload: id })
  }

  const addTemplate = (template) => {
    if (!isAuthenticated) return

    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      userId: user.id,
    }
    dispatch({ type: "ADD_TEMPLATE", payload: newTemplate })
  }

  const updateTemplate = (template) => {
    if (!isAuthenticated) return
    dispatch({ type: "UPDATE_TEMPLATE", payload: template })
  }

  const deleteTemplate = (id) => {
    if (!isAuthenticated) return
    dispatch({ type: "DELETE_TEMPLATE", payload: id })
  }

  const addTeamMember = (member) => {
    if (!isAuthenticated) return

    const newMember = {
      ...member,
      id: Date.now().toString(),
      joinedAt: new Date().toISOString(),
      addedBy: user.id,
    }
    dispatch({ type: "ADD_TEAM_MEMBER", payload: newMember })
  }

  return (
    <TaskContext.Provider
      value={{
        ...state,
        addTask,
        addTaskFromTemplate,
        updateTask,
        deleteTask,
        toggleTask,
        shareTask,
        addCategory,
        updateCategory,
        deleteCategory,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        addTeamMember,
        syncData,
        isAuthenticated,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

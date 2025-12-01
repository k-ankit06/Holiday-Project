"use client"

import { useState } from "react"
import { Plus, Users, Mail, Crown, User, Share2, MessageCircle } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useTask } from "../context/TaskContext"
import { syncService } from "../services/syncService"
import Button from "./Button"
import Modal from "./Modal"

const TeamCollaboration = () => {
  const { isDark } = useTheme()
  const { teamMembers, tasks, addTeamMember, shareTask } = useTask()
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "member",
    message: "",
  })
  const [shareData, setShareData] = useState({
    userEmail: "",
    message: "",
    permissions: "view", // view, edit
  })

  const handleInviteSubmit = async (e) => {
    e.preventDefault()
    if (!inviteData.email.trim()) return

    try {
      await syncService.inviteTeamMember(inviteData.email, inviteData.role)

      // Add to local team members (in real app, this would come from server)
      addTeamMember({
        name: inviteData.email.split("@")[0],
        email: inviteData.email,
        role: inviteData.role,
        status: "pending",
        avatar: `https://ui-avatars.com/api/?name=${inviteData.email}&background=random`,
      })

      setInviteData({ email: "", role: "member", message: "" })
      setIsInviteModalOpen(false)
    } catch (error) {
      console.error("Error inviting team member:", error)
    }
  }

  const handleShareTask = async (e) => {
    e.preventDefault()
    if (!shareData.userEmail.trim() || !selectedTask) return

    try {
      await syncService.shareTask(selectedTask.id, shareData.userEmail)
      shareTask(selectedTask.id, shareData.userEmail)

      setShareData({ userEmail: "", message: "", permissions: "view" })
      setIsShareModalOpen(false)
      setSelectedTask(null)
    } catch (error) {
      console.error("Error sharing task:", error)
    }
  }

  const openShareModal = (task) => {
    setSelectedTask(task)
    setIsShareModalOpen(true)
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-500" />
      case "manager":
        return <Users className="w-4 h-4 text-blue-500" />
      default:
        return <User className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900"
      case "pending":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900"
      case "inactive":
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900"
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900"
    }
  }

  const sharedTasks = tasks.filter((task) => task.sharedWith && task.sharedWith.length > 0)

  return (
    <div className="space-y-8">
      {/* Team Members Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Team Members</h2>
          <Button onClick={() => setIsInviteModalOpen(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        </div>

        {teamMembers.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No team members yet</p>
            <p className="text-sm">Invite team members to collaborate on tasks</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  isDark
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}&background=random`}
                    alt={member.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{member.name}</h3>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{member.email}</p>
                  </div>
                  {getRoleIcon(member.role)}
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status || "active")}`}
                  >
                    {member.status || "active"}
                  </span>
                  <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shared Tasks Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>Shared Tasks</h2>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            {sharedTasks.length} task{sharedTasks.length !== 1 ? "s" : ""} shared
          </p>
        </div>

        {sharedTasks.length === 0 ? (
          <div className={`text-center py-12 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No shared tasks yet</p>
            <p className="text-sm">Share tasks with team members to collaborate</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sharedTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  isDark
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`font-medium mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>{task.title}</h3>
                    {task.description && (
                      <p className={`text-sm mb-2 ${isDark ? "text-gray-300" : "text-gray-600"}`}>{task.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs">
                      <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                        Shared with {task.sharedWith.length} member{task.sharedWith.length !== 1 ? "s" : ""}
                      </span>
                      {task.dueDate && (
                        <span className={isDark ? "text-gray-400" : "text-gray-500"}>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openShareModal(task)}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Share Section */}
      <div>
        <h2 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Quick Share</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tasks
            .filter((task) => !task.completed && (!task.sharedWith || task.sharedWith.length === 0))
            .slice(0, 6)
            .map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded border cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  isDark ? "border-gray-700" : "border-gray-200"
                }`}
                onClick={() => openShareModal(task)}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{task.title}</span>
                  <Share2 className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Team Member">
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Email Address *
            </label>
            <input
              type="email"
              value={inviteData.email}
              onChange={(e) => setInviteData((prev) => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholder="colleague@example.com"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Role
            </label>
            <select
              value={inviteData.role}
              onChange={(e) => setInviteData((prev) => ({ ...prev, role: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Personal Message (Optional)
            </label>
            <textarea
              value={inviteData.message}
              onChange={(e) => setInviteData((prev) => ({ ...prev, message: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholder="Add a personal message to the invitation..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Share Task Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={`Share Task: ${selectedTask?.title}`}
      >
        <form onSubmit={handleShareTask} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Share with Email *
            </label>
            <input
              type="email"
              value={shareData.userEmail}
              onChange={(e) => setShareData((prev) => ({ ...prev, userEmail: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholder="colleague@example.com"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Permissions
            </label>
            <select
              value={shareData.permissions}
              onChange={(e) => setShareData((prev) => ({ ...prev, permissions: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Message (Optional)
            </label>
            <textarea
              value={shareData.message}
              onChange={(e) => setShareData((prev) => ({ ...prev, message: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholder="Add a message about this shared task..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsShareModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Share2 className="w-4 h-4 mr-2" />
              Share Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TeamCollaboration

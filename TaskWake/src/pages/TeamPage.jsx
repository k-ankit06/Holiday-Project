
import { useState } from "react"
import {
  Users,
  Mail,
  Crown,
  User,
  Share2,
  MessageCircle,
  Settings,
  Search,
  UserPlus,
  Shield,
  Activity,
  Clock,
  CheckCircle,
} from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useTask } from "../context/TaskContext"
import { useAuth } from "../context/AuthContext"
import { syncService } from "../services/syncService"
import Button from "../components/Button"
import Modal from "../components/Modal"
import AuthModal from "../components/AuthModal"

const TeamPage = () => {
  const { isDark } = useTheme()
  const { teamMembers, tasks, addTeamMember, shareTask, isAuthenticated } = useTask()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("members")
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: "",
    role: "member",
    message: "",
  })
  const [shareData, setShareData] = useState({
    userEmail: "",
    message: "",
    permissions: "view",
  })


  const allMembers = isAuthenticated ? teamMembers : []
  const sharedTasks = tasks.filter((task) => task.sharedWith && task.sharedWith.length > 0)

  const handleInviteSubmit = async (e) => {
    e.preventDefault()
    if (!inviteData.email.trim()) return

    try {
      await syncService.inviteTeamMember(inviteData.email, inviteData.role)

      addTeamMember({
        name: inviteData.email.split("@")[0],
        email: inviteData.email,
        role: inviteData.role,
        status: "pending",
        avatar: `https://ui-avatars.com/api/?name=${inviteData.email}&background=random`,
        tasksCompleted: 0,
        tasksAssigned: 0,
        lastActive: "Never",
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
        return <Shield className="w-4 h-4 text-blue-500" />
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

  const MemberCard = ({ member }) => (
    <div
      className={`p-6 rounded-2xl border transition-all duration-200 hover:shadow-lg hover-lift ${
        isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img
              src={member.avatar || "/placeholder.svg"}
              alt={member.name}
              className="w-12 h-12 rounded-full ring-2 ring-blue-500"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                member.status === "active"
                  ? "bg-green-500"
                  : member.status === "pending"
                    ? "bg-yellow-500"
                    : "bg-gray-400"
              }`}
            ></div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{member.name}</h3>
              {getRoleIcon(member.role)}
            </div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{member.email}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                {member.status}
              </span>
              <span className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>{member.role}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <MessageCircle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{member.tasksCompleted || 0}</p>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Completed</p>
        </div>
        <div className="text-center">
          <p className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{member.tasksAssigned || 0}</p>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Assigned</p>
        </div>
        <div className="text-center">
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>Last active</p>
          <p className={`text-xs font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
            {member.lastActive || "Never"}
          </p>
        </div>
      </div>
    </div>
  )

  const TaskCard = ({ task }) => (
    <div
      className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
        isDark ? "bg-gray-800 border-gray-700 hover:border-gray-600" : "bg-white border-gray-200 hover:border-gray-300"
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
              Shared with {task.sharedWith?.length || 0} member{(task.sharedWith?.length || 0) !== 1 ? "s" : ""}
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
  )

  if (!isAuthenticated) {
    return (
      <>
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <Users className="h-12 w-12 text-white" />
          </div>
          <h1 className={`text-3xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Team Collaboration</h1>
          <p className={`text-lg mb-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Sign in to collaborate with your team and share tasks
          </p>
          <Button onClick={() => setAuthModalOpen(true)} className="btn-gradient">
            Sign In to Join Team
          </Button>
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
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Team Collaboration</h1>
          <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Manage your team and collaborate on tasks
          </p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)} className="btn-gradient">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className={`p-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-opacity-80 text-sm font-medium">Total Members</p>
              <p className="text-3xl font-bold mt-1">{allMembers.length}</p>
            </div>
            <Users className="h-8 w-8 text-white text-opacity-80" />
          </div>
        </div>

        <div className={`p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-opacity-80 text-sm font-medium">Active Members</p>
              <p className="text-3xl font-bold mt-1">{allMembers.filter((m) => m.status === "active").length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-white text-opacity-80" />
          </div>
        </div>

        <div className={`p-6 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-opacity-80 text-sm font-medium">Shared Tasks</p>
              <p className="text-3xl font-bold mt-1">{sharedTasks.length}</p>
            </div>
            <Share2 className="h-8 w-8 text-white text-opacity-80" />
          </div>
        </div>

        <div className={`p-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-opacity-80 text-sm font-medium">Pending Invites</p>
              <p className="text-3xl font-bold mt-1">{allMembers.filter((m) => m.status === "pending").length}</p>
            </div>
            <Clock className="h-8 w-8 text-white text-opacity-80" />
          </div>
        </div>
      </div>


      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { id: "members", label: "Team Members", icon: Users },
          { id: "shared", label: "Shared Tasks", icon: Share2 },
          { id: "activity", label: "Activity", icon: Activity },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>


      {activeTab === "members" && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search team members..."
              className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            />
          </div>


          {allMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allMembers
                .filter(
                  (member) =>
                    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    member.email.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .map((member) => (
                  <MemberCard key={member.id} member={member} />
                ))}
            </div>
          ) : (
            <div
              className={`text-center py-12 rounded-2xl border-2 border-dashed ${
                isDark ? "border-gray-700" : "border-gray-300"
              }`}
            >
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                No team members yet
              </h3>
              <p className={`text-sm mb-6 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Invite team members to start collaborating
              </p>
              <Button onClick={() => setIsInviteModalOpen(true)} className="btn-gradient">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite First Member
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "shared" && (
        <div className="space-y-6">
          {sharedTasks.length > 0 ? (
            <div className="space-y-4">
              {sharedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div
              className={`text-center py-12 rounded-2xl border-2 border-dashed ${
                isDark ? "border-gray-700" : "border-gray-300"
              }`}
            >
              <Share2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                No shared tasks yet
              </h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Share tasks with team members to see them here
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div
          className={`p-8 rounded-2xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>Team Activity</h3>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Team activity feed coming soon</p>
          </div>
        </div>
      )}

     
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Team Member">
        <form onSubmit={handleInviteSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Email Address *
            </label>
            <input
              type="email"
              value={inviteData.email}
              onChange={(e) => setInviteData((prev) => ({ ...prev, email: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholder="colleague@example.com"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Role
            </label>
            <select
              value={inviteData.role}
              onChange={(e) => setInviteData((prev) => ({ ...prev, role: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Personal Message (Optional)
            </label>
            <textarea
              value={inviteData.message}
              onChange={(e) => setInviteData((prev) => ({ ...prev, message: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              placeholder="Add a personal message to the invitation..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="btn-gradient">
              <Mail className="w-4 h-4 mr-2" />
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

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

export default TeamPage

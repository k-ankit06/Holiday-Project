"use client"

import { useState } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Lock,
  Trash2,
  Github,
  Linkedin,
  Twitter,
  Settings,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useTask } from "../context/TaskContext"
import { useAuth } from "../context/AuthContext"
import Button from "../components/Button"
import Modal from "../components/Modal"

const ProfilePage = () => {
  const { isDark } = useTheme()
  const { tasks } = useTask()
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Empty profile data - user needs to fill
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    location: "",
    website: "",
    bio: "",
    github: "",
    linkedin: "",
    twitter: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    taskReminders: true,
    weeklyReports: false,
    twoFactorAuth: false,
    profileVisibility: "public",
  })

  // Calculate user stats
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = tasks.filter(
    (task) => !task.completed && (!task.dueDate || new Date(task.dueDate) >= new Date()),
  ).length
  const overdueTasks = tasks.filter(
    (task) => !task.completed && task.dueDate && new Date(task.dueDate) < new Date(),
  ).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!")
      return
    }
    try {
      // Password change logic here
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setIsPasswordModalOpen(false)
    } catch (error) {
      console.error("Error changing password:", error)
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // Account deletion logic here
      setIsDeleteModalOpen(false)
    } catch (error) {
      console.error("Error deleting account:", error)
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className={`p-6 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-opacity-80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {description && <p className="text-white text-opacity-70 text-xs mt-1">{description}</p>}
        </div>
        <Icon className="h-8 w-8 text-white text-opacity-80" />
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Profile Settings</h1>
          <p className={`mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          icon={Target}
          color="from-blue-500 to-purple-600"
          description="All time"
        />
        <StatCard
          title="Completed"
          value={completedTasks}
          icon={CheckCircle}
          color="from-green-500 to-emerald-600"
          description={`${completionRate}% success rate`}
        />
        <StatCard
          title="Pending"
          value={pendingTasks}
          icon={Clock}
          color="from-orange-500 to-red-600"
          description="Active tasks"
        />
        <StatCard
          title="Overdue"
          value={overdueTasks}
          icon={AlertTriangle}
          color="from-red-500 to-pink-600"
          description="Need attention"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { id: "profile", label: "Profile", icon: User },
          { id: "account", label: "Account", icon: Settings },
          { id: "privacy", label: "Privacy", icon: Shield },
          { id: "notifications", label: "Notifications", icon: Bell },
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

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture */}
          <div
            className={`p-6 rounded-2xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
          >
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  {(profileData.name || user?.name || "U").charAt(0).toUpperCase()}
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors">
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <h3 className={`text-xl font-semibold mt-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                {profileData.name || user?.name || "Your Name"}
              </h3>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {profileData.email || user?.email || "your.email@example.com"}
              </p>
            </div>
          </div>

          {/* Profile Information */}
          <div
            className={`lg:col-span-2 p-6 rounded-2xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                Personal Information
              </h3>
              <Button
                variant={isEditing ? "secondary" : "primary"}
                onClick={() => (isEditing ? setIsEditing(false) : setIsEditing(true))}
              >
                {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } ${!isEditing ? "opacity-60" : ""}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your email address"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } ${!isEditing ? "opacity-60" : ""}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } ${!isEditing ? "opacity-60" : ""}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, location: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your location"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } ${!isEditing ? "opacity-60" : ""}`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                  Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, website: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your website URL"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } ${!isEditing ? "opacity-60" : ""}`}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                  Bio
                </label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } ${!isEditing ? "opacity-60" : ""}`}
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-8">
              <h4 className={`text-md font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Social Links</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={profileData.github}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, github: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="GitHub profile URL"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } ${!isEditing ? "opacity-60" : ""}`}
                  />
                </div>

                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={profileData.linkedin}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, linkedin: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="LinkedIn profile URL"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } ${!isEditing ? "opacity-60" : ""}`}
                  />
                </div>

                <div className="relative">
                  <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={profileData.twitter}
                    onChange={(e) => setProfileData((prev) => ({ ...prev, twitter: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Twitter profile URL"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } ${!isEditing ? "opacity-60" : ""}`}
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button variant="secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile} className="btn-gradient">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "account" && (
        <div className="space-y-6">
          <div
            className={`p-6 rounded-2xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
          >
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
              Account Security
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Password</h4>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Last changed 3 months ago</p>
                </div>
                <Button onClick={() => setIsPasswordModalOpen(true)}>
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                    Two-Factor Authentication
                  </h4>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    Add an extra layer of security to your account
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => setSettings((prev) => ({ ...prev, twoFactorAuth: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-2xl border border-red-200 ${isDark ? "bg-red-900/20" : "bg-red-50"}`}>
            <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-600">Delete Account</h4>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "privacy" && (
        <div
          className={`p-6 rounded-2xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          <h3 className={`text-lg font-semibold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>Privacy Settings</h3>
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Profile Visibility
              </label>
              <select
                value={settings.profileVisibility}
                onChange={(e) => setSettings((prev) => ({ ...prev, profileVisibility: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              >
                <option value="public">Public - Anyone can see your profile</option>
                <option value="team">Team Only - Only team members can see your profile</option>
                <option value="private">Private - Only you can see your profile</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTab === "notifications" && (
        <div
          className={`p-6 rounded-2xl border ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}
        >
          <h3 className={`text-lg font-semibold mb-6 ${isDark ? "text-white" : "text-gray-900"}`}>
            Notification Preferences
          </h3>
          <div className="space-y-6">
            {[
              {
                key: "emailNotifications",
                title: "Email Notifications",
                description: "Receive notifications via email",
              },
              {
                key: "pushNotifications",
                title: "Push Notifications",
                description: "Receive browser push notifications",
              },
              {
                key: "taskReminders",
                title: "Task Reminders",
                description: "Get reminded about upcoming tasks",
              },
              {
                key: "weeklyReports",
                title: "Weekly Reports",
                description: "Receive weekly productivity reports",
              },
            ].map(({ key, title, description }) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h4>
                  <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Change Password">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
              }`}
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Lock className="w-4 h-4 mr-2" />
              Change Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Account Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Account">
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Warning</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>
                    This action cannot be undone. This will permanently delete your account and remove all your data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProfilePage

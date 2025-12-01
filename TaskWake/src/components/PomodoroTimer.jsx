"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Settings, Coffee, Clock, Target, Volume2, VolumeX } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import { useNotification } from "../hooks/useNotification"
import Button from "./Button"
import Modal from "./Modal"

const PomodoroTimer = ({ isOpen, onClose }) => {
  const { isDark } = useTheme()
  const { showNotification } = useNotification()
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [currentSession, setCurrentSession] = useState("work") // work, shortBreak, longBreak
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const intervalRef = useRef(null)
  const audioRef = useRef(null)

  const [settings, setSettings] = useState({
    workTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
  })

  const sessionTypes = {
    work: {
      label: "Focus Time",
      icon: Target,
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-600 dark:text-red-400",
      time: settings.workTime * 60,
    },
    shortBreak: {
      label: "Short Break",
      icon: Coffee,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-600 dark:text-green-400",
      time: settings.shortBreakTime * 60,
    },
    longBreak: {
      label: "Long Break",
      icon: Clock,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      time: settings.longBreakTime * 60,
    },
  }

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleSessionComplete()
    } else {
      clearInterval(intervalRef.current)
    }

    return () => clearInterval(intervalRef.current)
  }, [isRunning, timeLeft])

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio("/notification.mp3") // You would need to add this sound file
    audioRef.current.volume = 0.5
  }, [])

  const handleSessionComplete = () => {
    setIsRunning(false)

    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback if audio fails
        console.log("Audio playback failed")
      })
    }

    if (currentSession === "work") {
      const newCompletedPomodoros = completedPomodoros + 1
      setCompletedPomodoros(newCompletedPomodoros)

      showNotification(
        "Pomodoro Complete! 🍅",
        `Great job! You've completed ${newCompletedPomodoros} pomodoro${newCompletedPomodoros > 1 ? "s" : ""} today.`,
      )

      // Determine next session
      const nextSession = newCompletedPomodoros % settings.longBreakInterval === 0 ? "longBreak" : "shortBreak"
      setCurrentSession(nextSession)
      setTimeLeft(sessionTypes[nextSession].time)

      if (settings.autoStartBreaks) {
        setIsRunning(true)
      }
    } else {
      // Break completed
      showNotification("Break Complete! ⏰", "Time to get back to work! Stay focused and productive.")

      setCurrentSession("work")
      setTimeLeft(sessionTypes.work.time)

      if (settings.autoStartPomodoros) {
        setIsRunning(true)
      }
    }
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(sessionTypes[currentSession].time)
  }

  const switchSession = (sessionType) => {
    setIsRunning(false)
    setCurrentSession(sessionType)
    setTimeLeft(sessionTypes[sessionType].time)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const totalTime = sessionTypes[currentSession].time
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const handleSettingsSubmit = (e) => {
    e.preventDefault()
    setIsSettingsOpen(false)
    // Reset current session time if settings changed
    if (!isRunning) {
      setTimeLeft(sessionTypes[currentSession].time)
    }
  }

  const currentSessionData = sessionTypes[currentSession]
  const SessionIcon = currentSessionData.icon

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="">
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-xl bg-gradient-to-r ${currentSessionData.color}`}>
                <SessionIcon className="h-5 w-5 text-white" />
              </div>
              <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {currentSessionData.label}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={soundEnabled ? "text-blue-600" : "text-gray-400"}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Timer Display */}
          <div className="relative">
            <div className="w-64 h-64 mx-auto relative">
              {/* Progress Ring */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                  className="transition-all duration-1000 ease-in-out"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" className={currentSessionData.textColor} />
                    <stop offset="100%" className={currentSessionData.textColor} />
                  </linearGradient>
                </defs>
              </svg>

              {/* Timer Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                    {formatTime(timeLeft)}
                  </div>
                  <div className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {Math.round(getProgress())}% Complete
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Session Switcher */}
          <div className="flex justify-center space-x-2">
            {Object.entries(sessionTypes).map(([key, session]) => {
              const Icon = session.icon
              return (
                <button
                  key={key}
                  onClick={() => switchSession(key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    currentSession === key
                      ? `${session.bgColor} ${session.textColor}`
                      : `${isDark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{session.label}</span>
                </button>
              )
            })}
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={toggleTimer}
              className={`btn-gradient px-8 py-3 text-lg ${isRunning ? "from-red-500 to-pink-500" : ""}`}
            >
              {isRunning ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
              {isRunning ? "Pause" : "Start"}
            </Button>
            <Button onClick={resetTimer} variant="secondary" className="px-6 py-3">
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </Button>
          </div>

          {/* Stats */}
          <div className={`p-4 rounded-xl ${isDark ? "bg-gray-800" : "bg-gray-50"}`}>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {completedPomodoros}
                </div>
                <div className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>Completed Today</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  {Math.floor((completedPomodoros * settings.workTime) / 60)}h
                </div>
                <div className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>Focus Time</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Timer Settings">
        <form onSubmit={handleSettingsSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Work Time (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.workTime}
                onChange={(e) => setSettings((prev) => ({ ...prev, workTime: Number.parseInt(e.target.value) }))}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Short Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreakTime}
                onChange={(e) => setSettings((prev) => ({ ...prev, shortBreakTime: Number.parseInt(e.target.value) }))}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Long Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreakTime}
                onChange={(e) => setSettings((prev) => ({ ...prev, longBreakTime: Number.parseInt(e.target.value) }))}
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-200" : "text-gray-700"}`}>
                Long Break Interval
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={settings.longBreakInterval}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, longBreakInterval: Number.parseInt(e.target.value) }))
                }
                className={`w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Auto-start Breaks</p>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Automatically start break timers
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, autoStartBreaks: !prev.autoStartBreaks }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoStartBreaks ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoStartBreaks ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>Auto-start Pomodoros</p>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Automatically start work timers after breaks
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSettings((prev) => ({ ...prev, autoStartPomodoros: !prev.autoStartPomodoros }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoStartPomodoros ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoStartPomodoros ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="btn-gradient">
              Save Settings
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

export default PomodoroTimer

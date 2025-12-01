"use client"

import { useEffect } from "react"
import { X } from "lucide-react"
import { useTheme } from "../context/ThemeContext"
import Button from "./Button"

const Modal = ({ isOpen, onClose, title, children }) => {
  const { isDark } = useTheme()

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div
          className={`relative w-full max-w-md transform rounded-lg p-6 shadow-xl transition-all ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{title}</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal

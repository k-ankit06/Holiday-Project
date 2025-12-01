
import { useTheme } from "../context/ThemeContext"

const Button = ({ children, variant = "primary", size = "md", className = "", disabled = false, ...props }) => {
  const { isDark } = useTheme()

  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variants = {
    primary: isDark
      ? "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500"
      : "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: isDark
      ? "bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-500"
      : "bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500",
    danger: isDark
      ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500"
      : "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    ghost: isDark
      ? "hover:bg-gray-700 text-gray-300 focus:ring-gray-500"
      : "hover:bg-gray-100 text-gray-700 focus:ring-gray-500",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : ""

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

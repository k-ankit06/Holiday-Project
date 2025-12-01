import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ThemeProvider } from "./context/ThemeContext"
import { TaskProvider } from "./context/TaskContext"
import Layout from "./components/Layout"
import HomePage from "./pages/HomePage"
import ProfilePage from "./pages/ProfilePage"
import TasksPage from "./pages/TasksPage"
import CalendarPage from "./pages/CalenderPage"
import StatsPage from "./pages/StatsPage"
import RemindersPage from "./pages/RemindersPage"
import TemplatesPage from "./pages/TemplatesPage"
import TeamPage from "./pages/TeamPage"
import SettingsPage from "./pages/SettingsPage"

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TaskProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/reminders" element={<RemindersPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/collaboration" element={<TeamPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Layout>
          </Router>
        </TaskProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App

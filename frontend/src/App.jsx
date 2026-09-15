import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PublicLayout from './layouts/PublicLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Charities from './pages/Charities'
import CharityDetail from './pages/CharityDetail'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/charities" element={<Charities />} />
          <Route path="/charities/:slug" element={<CharityDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/*" element={
          <ProtectedRoute adminOnly>
            <Admin />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App

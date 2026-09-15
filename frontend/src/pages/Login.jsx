import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!form.email || !form.password) {
      return setError('Please enter email and password')
    }

    setLoading(true)
    try {
      await login(form.email.trim().toLowerCase(), form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 bg-[#f8f6f1]">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] tracking-tight">
              Welcome back
            </h1>
            <p className="mt-3 text-[#5a5a5a]">
              Sign in to continue your journey.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/30 focus:border-[#1a5c4a] transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Your password"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/30 focus:border-[#1a5c4a] transition pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a8a] hover:text-[#1a1a1a]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-base disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center mt-8 text-sm text-[#5a5a5a]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#1a5c4a] font-medium hover:underline">
              Create one
            </Link>
          </p>

          <div className="mt-10 p-4 bg-white/60 rounded-xl border border-black/5 text-center text-sm text-[#5a5a5a]">
            <p className="font-medium text-[#1a1a1a] mb-1">Demo Credentials</p>
            <p>User: demo@digitalheroes-demo.com</p>
            <p>Admin: admin@digitalheroes-demo.com</p>
            <p className="text-xs mt-1 opacity-70">Password: DemoUser2026! / DemoAdmin2026!</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Heart,
  Trophy,
  Gift,
  BarChart3,
  LogOut,
  Menu,
  X,
  Search,
  Shield,
  Activity
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Admin() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscribers: 0,
    totalCharities: 0,
    totalScores: 0,
    estimatedPrizePool: 0,
    charityContributionTotals: 0
  })

  const [users, setUsers] = useState([])
  const [charities, setCharities] = useState([])
  const [userSearch, setUserSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!isAdmin) {
      navigate('/dashboard')
      return
    }

    fetchOverview()
  }, [isAuthenticated, isAdmin])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab, userSearch])

  const fetchOverview = async () => {
    setLoading(true)

    try {
      const [charityRes, analyticsRes] = await Promise.all([
        api.get('/charities'),
        api.get('/admin/analytics').catch(() => null)
      ])

      const charityList = charityRes.data.charities || []

      setCharities(charityList)

      if (analyticsRes?.data?.analytics) {
        const a = analyticsRes.data.analytics

        setStats({
          totalUsers: a.totalUsers || 0,
          activeSubscribers: a.activeSubscribers || 0,
          totalCharities: a.totalCharities || 0,
          totalScores: a.totalScores || 0,
          estimatedPrizePool: a.estimatedPrizePool || 0,
          charityContributionTotals:
            a.charityContributionTotals || 0
        })
      } else {
        setStats((s) => ({
          ...s,
          totalCharities: charityList.length
        }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const params = userSearch
        ? `?search=${encodeURIComponent(userSearch)}`
        : ''

      const res = await api.get(`/admin/users${params}`)

      setUsers(res.data.users || [])
    } catch (err) {
      console.error(err)
      setUsers([])
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users
    },
    {
      id: 'charities',
      label: 'Charities',
      icon: Heart
    },
    {
      id: 'draws',
      label: 'Draws',
      icon: Trophy
    },
    {
      id: 'winners',
      label: 'Winners',
      icon: Gift
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3
    }
  ]

  return (
    <div className="min-h-screen bg-[#f5f4f0] flex">

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1a1a] text-white
          transform transition-transform duration-200
          lg:translate-x-0 lg:static
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full relative">

          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-white/10">
            <Link to="/" className="font-bold tracking-tight">
              digital<span className="text-[#4ade80]">.</span>heroes
            </Link>

            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5
                    rounded-lg text-sm font-medium transition
                    ${
                      activeTab === item.id
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* User + Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">

            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#1a5c4a] flex items-center justify-center text-sm font-semibold">
                {user?.name?.charAt(0) || 'A'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.name}
                </p>

                <p className="text-xs text-white/50 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">

          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div>
              <h1 className="font-semibold text-[#1a1a1a] capitalize">
                {activeTab}
              </h1>

              <p className="text-xs text-[#8a8a8a]">
                Admin Panel
              </p>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1a5c4a]/10 text-[#1a5c4a] text-xs font-medium rounded-full">
            <Shield size={12} />
            Admin
          </span>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">

          {loading ? (
            <div className="text-center py-20 text-[#5a5a5a]">
              Loading...
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  stats={stats}
                  charities={charities}
                />
              )}

              {activeTab === 'users' && (
                <UsersTab
                  users={users}
                  userSearch={userSearch}
                  setUserSearch={setUserSearch}
                />
              )}

              {activeTab === 'charities' && (
                <CharitiesTab charities={charities} />
              )}

              {activeTab === 'draws' && (
                <ComingSoon
                  title="Draw Management"
                  desc="Configure, simulate and publish monthly draws"
                />
              )}

              {activeTab === 'winners' && (
                <ComingSoon
                  title="Winner Verification"
                  desc="Review proof uploads and manage payouts"
                />
              )}

              {activeTab === 'analytics' && (
                <ComingSoon
                  title="Analytics"
                  desc="Subscriber growth, prize pool history, charity impact"
                />
              )}
            </>
          )}

        </main>
      </div>
    </div>
  )
}

function OverviewTab({ stats, charities }) {
  const featuredCharities = charities.filter(
    (charity) => charity.isFeatured
  )

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers}
          icon={Users}
        />

        <StatCard
          label="Active Subscribers"
          value={stats.activeSubscribers}
          icon={Activity}
          accent
        />

        <StatCard
          label="Charities"
          value={stats.totalCharities}
          icon={Heart}
        />

        <StatCard
          label="Scores Logged"
          value={stats.totalScores}
          icon={Trophy}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <h2 className="font-semibold text-[#1a1a1a] mb-4">
            Financial Overview
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5a5a5a]">
                Estimated Prize Pool
              </span>

              <span className="font-semibold">
                ₹{stats.estimatedPrizePool.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[#5a5a5a]">
                Charity Contributions
              </span>

              <span className="font-semibold text-[#1a5c4a]">
                ₹{stats.charityContributionTotals.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <h2 className="font-semibold text-[#1a1a1a] mb-4">
            Featured Charities
          </h2>

          {featuredCharities.length === 0 ? (
            <p className="text-sm text-[#8a8a8a]">
              No featured charities found.
            </p>
          ) : (
            <div className="space-y-3">
              {featuredCharities.map((charity) => (
                <div
                  key={charity._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#f8f6f1]"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#1a5c4a]/10 flex items-center justify-center">
                    <Heart
                      size={16}
                      className="text-[#1a5c4a]"
                    />
                  </div>

                  <div>
                    <p className="font-medium text-sm">
                      {charity.name}
                    </p>

                    <p className="text-xs text-[#8a8a8a] capitalize">
                      {charity.category || 'Charity'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function UsersTab({
  users,
  userSearch,
  setUserSearch
}) {
  return (
    <div className="space-y-4">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            Users
          </h2>

          <p className="text-sm text-[#8a8a8a]">
            Manage registered users
          </p>
        </div>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a]"
          />

          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full sm:w-72 pl-9 pr-4 py-2.5 bg-white border border-black/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1a5c4a]/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">

        {users.length === 0 ? (
          <div className="p-10 text-center text-sm text-[#8a8a8a]">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-[#f8f6f1] border-b border-black/5">
                <tr>
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-5 py-3">Role</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Subscription</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-black/5">
                {users.map((item) => (
                  <tr key={item._id}>

                    <td className="px-5 py-4 font-medium">
                      {item.name}
                    </td>

                    <td className="px-5 py-4 text-[#5a5a5a]">
                      {item.email}
                    </td>

                    <td className="px-5 py-4 capitalize">
                      {item.role}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          item.isActive
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-5 py-4 capitalize">
                      {item.subscription?.status || 'none'}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>
    </div>
  )
}

function CharitiesTab({ charities }) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-6">

      <h2 className="font-semibold mb-4">
        Charities ({charities.length})
      </h2>

      <div className="space-y-3">
        {charities.map((charity) => (
          <div
            key={charity._id}
            className="flex items-center justify-between p-3 rounded-xl bg-[#f8f6f1]"
          >
            <div>
              <p className="font-medium text-sm">
                {charity.name}
              </p>

              <p className="text-xs text-[#8a8a8a] capitalize">
                {charity.category || 'Charity'}
              </p>
            </div>

            {charity.isFeatured && (
              <span className="text-xs text-[#1a5c4a]">
                Featured
              </span>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}

function ComingSoon({ title, desc }) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-12 text-center">
      <h2 className="text-xl font-semibold mb-2">
        {title}
      </h2>

      <p className="text-[#5a5a5a]">
        {desc}
      </p>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent
}) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-5">

      <div className="flex items-center gap-2 mb-2">
        <Icon
          size={16}
          className={
            accent
              ? 'text-[#1a5c4a]'
              : 'text-[#8a8a8a]'
          }
        />

        <span className="text-xs font-medium text-[#5a5a5a] uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p
        className={`text-xl font-bold ${
          accent
            ? 'text-[#1a5c4a]'
            : 'text-[#1a1a1a]'
        }`}
      >
        {value}
      </p>

    </div>
  )
}
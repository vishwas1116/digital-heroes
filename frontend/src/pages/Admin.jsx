import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Heart, Trophy, Gift,
  BarChart3, LogOut, Menu, X, Search, Shield, Activity,
  Play, Upload, RefreshCw, Plus
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
  const [charities, setCharities] = useState([])
  const [users, setUsers] = useState([])
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

      setCharities(charityRes.data.charities || [])

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
        setStats(s => ({
          ...s,
          totalCharities: charityRes.data.charities?.length || 0
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
    } catch {
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
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1a1a] text-white transform transition-transform duration-200 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
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

        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === item.id
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

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
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
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

              {activeTab === 'draws' && <DrawsTab />}

              {activeTab === 'winners' && <WinnersTab />}

              {activeTab === 'analytics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                      label="Est. Prize Pool"
                      value={`₹${stats.estimatedPrizePool?.toLocaleString() || 0}`}
                      icon={Trophy}
                      accent
                    />

                    <StatCard
                      label="Charity Totals"
                      value={`₹${stats.charityContributionTotals?.toLocaleString() || 0}`}
                      icon={Heart}
                    />

                    <StatCard
                      label="Active Subs"
                      value={stats.activeSubscribers}
                      icon={Activity}
                    />
                  </div>

                  <ComingSoon
                    title="Charts"
                    desc="Recharts graphs for growth & draw history coming next"
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function OverviewTab({ stats, charities }) {
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

      <div className="bg-white rounded-2xl border border-black/5 p-6">
        <h2 className="font-semibold mb-4">
          Featured Charities
        </h2>

        <div className="space-y-3">
          {charities
            .filter(c => c.isFeatured)
            .map(c => (
              <div
                key={c._id}
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
                    {c.name}
                  </p>

                  <p className="text-xs text-[#8a8a8a] capitalize">
                    {c.category}
                  </p>
                </div>
              </div>
            ))}

          {charities.filter(c => c.isFeatured).length === 0 && (
            <p className="text-sm text-[#8a8a8a]">
              No featured charities
            </p>
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
    <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
      <div className="p-5 border-b border-black/5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h2 className="font-semibold">
          Users ({users.length})
        </h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a8a]" />

          <input
            type="text"
            placeholder="Search users..."
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/30 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#f8f6f1] text-[#5a5a5a]">
            <tr>
              <th className="text-left px-5 py-3 font-medium">
                Name
              </th>
              <th className="text-left px-5 py-3 font-medium">
                Email
              </th>
              <th className="text-left px-5 py-3 font-medium">
                Role
              </th>
              <th className="text-left px-5 py-3 font-medium">
                Plan
              </th>
              <th className="text-left px-5 py-3 font-medium">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-black/5">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-[#8a8a8a]"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr
                  key={u._id}
                  className="hover:bg-[#fafafa]"
                >
                  <td className="px-5 py-3 font-medium">
                    {u.name}
                  </td>

                  <td className="px-5 py-3 text-[#5a5a5a]">
                    {u.email}
                  </td>

                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        u.role === 'admin'
                          ? 'bg-[#1a5c4a]/10 text-[#1a5c4a]'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="px-5 py-3 capitalize">
                    {u.subscription?.plan || 'none'}
                  </td>

                  <td className="px-5 py-3">
                    <span
                      className={
                        u.subscription?.status === 'active'
                          ? 'text-[#1a5c4a]'
                          : 'text-amber-600'
                      }
                    >
                      {u.subscription?.status || 'none'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CharitiesTab({ charities }) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
      <div className="p-5 border-b border-black/5">
        <h2 className="font-semibold">
          Charities ({charities.length})
        </h2>
      </div>

      <div className="divide-y divide-black/5">
        {charities.map(c => (
          <div
            key={c._id}
            className="px-5 py-4 flex items-center justify-between hover:bg-[#fafafa]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1a5c4a]/10 flex items-center justify-center">
                <Heart
                  size={16}
                  className="text-[#1a5c4a]"
                />
              </div>

              <div>
                <p className="font-medium text-sm">
                  {c.name}
                </p>

                <p className="text-xs text-[#8a8a8a] capitalize">
                  {c.category}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {c.isFeatured && (
                <span className="px-2 py-0.5 bg-[#1a5c4a]/10 text-[#1a5c4a] text-xs rounded-full">
                  Featured
                </span>
              )}

              <span
                className={`text-xs ${
                  c.isActive
                    ? 'text-[#1a5c4a]'
                    : 'text-red-500'
                }`}
              >
                {c.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DrawsTab() {
  const [draws, setDraws] = useState([])
  const [pool, setPool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [simulating, setSimulating] = useState(null)
  const [publishing, setPublishing] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    method: 'random'
  })

  const [selectedSim, setSelectedSim] = useState(null)

  const load = async () => {
    setLoading(true)

    try {
      const [dRes, pRes] = await Promise.all([
        api.get('/draws'),
        api.get('/draws/pool/preview').catch(() => null)
      ])

      setDraws(dRes.data.draws || [])

      if (pRes?.data) {
        setPool(pRes.data)
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load draws'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async e => {
    e.preventDefault()

    setCreating(true)
    setError('')
    setMessage('')

    try {
      await api.post('/draws', form)

      setMessage('Draft draw created')
      load()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Create failed'
      )
    } finally {
      setCreating(false)
    }
  }

  const handleSimulate = async (id, method) => {
    setSimulating(id)
    setError('')
    setMessage('')

    try {
      const res = await api.post(
        `/draws/${id}/simulate`,
        { method }
      )

      setSelectedSim(res.data.simulation)

      setMessage(
        'Simulation complete — review results below'
      )

      load()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Simulation failed'
      )
    } finally {
      setSimulating(null)
    }
  }

  const handlePublish = async id => {
    if (
      !confirm(
        'Publish this draw? This creates winner records and cannot be undone easily.'
      )
    ) {
      return
    }

    setPublishing(id)
    setError('')
    setMessage('')

    try {
      await api.post(`/draws/${id}/publish`)

      setMessage('Draw published. Winners created.')
      setSelectedSim(null)

      load()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Publish failed'
      )
    } finally {
      setPublishing(null)
    }
  }

  const monthName = m =>
    new Date(2000, m - 1).toLocaleString(
      'en',
      { month: 'long' }
    )

  return (
    <div className="space-y-6">
      {message && (
        <div className="bg-[#1a5c4a]/10 text-[#1a5c4a] text-sm px-4 py-3 rounded-xl">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {pool && (
        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <h2 className="font-semibold mb-4">
            Current Prize Pool Preview
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
            <div>
              <p className="text-[#8a8a8a] text-xs">
                Active subs
              </p>
              <p className="font-bold text-lg">
                {pool.pool?.activeSubscribersAtDraw}
              </p>
            </div>

            <div>
              <p className="text-[#8a8a8a] text-xs">
                Total pool
              </p>
              <p className="font-bold text-lg">
                ₹{pool.pool?.total?.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-[#8a8a8a] text-xs">
                Jackpot 40%
              </p>
              <p className="font-bold text-lg text-[#1a5c4a]">
                ₹{pool.pool?.jackpot?.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-[#8a8a8a] text-xs">
                4-match 35%
              </p>
              <p className="font-bold text-lg">
                ₹{pool.pool?.fourMatch?.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-[#8a8a8a] text-xs">
                3-match 25%
              </p>
              <p className="font-bold text-lg">
                ₹{pool.pool?.threeMatch?.toLocaleString()}
              </p>
            </div>
          </div>

          {pool.rollover > 0 && (
            <p className="text-sm text-amber-700 mt-3">
              Jackpot rollover from previous: ₹
              {pool.rollover.toLocaleString()}
            </p>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-black/5 p-6">
        <h2 className="font-semibold mb-4">
          Create Monthly Draw
        </h2>

        <form
          onSubmit={handleCreate}
          className="flex flex-wrap gap-3 items-end"
        >
          <div>
            <label className="text-xs text-[#5a5a5a]">
              Month
            </label>

            <select
              value={form.month}
              onChange={e =>
                setForm(p => ({
                  ...p,
                  month: Number(e.target.value)
                }))
              }
              className="block mt-1 px-3 py-2 rounded-lg border border-black/10 text-sm"
            >
              {Array.from(
                { length: 12 },
                (_, i) => (
                  <option
                    key={i + 1}
                    value={i + 1}
                  >
                    {monthName(i + 1)}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="text-xs text-[#5a5a5a]">
              Year
            </label>

            <input
              type="number"
              value={form.year}
              onChange={e =>
                setForm(p => ({
                  ...p,
                  year: Number(e.target.value)
                }))
              }
              className="block mt-1 px-3 py-2 rounded-lg border border-black/10 text-sm w-24"
            />
          </div>

          <div>
            <label className="text-xs text-[#5a5a5a]">
              Method
            </label>

            <select
              value={form.method}
              onChange={e =>
                setForm(p => ({
                  ...p,
                  method: e.target.value
                }))
              }
              className="block mt-1 px-3 py-2 rounded-lg border border-black/10 text-sm"
            >
              <option value="random">
                Random
              </option>

              <option value="algorithmic">
                Algorithmic (score-weighted)
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={creating}
            className="btn-primary py-2 px-4 text-sm"
          >
            <Plus size={16} />
            {creating
              ? 'Creating...'
              : 'Create Draft'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        <div className="p-5 border-b border-black/5 flex items-center justify-between">
          <h2 className="font-semibold">
            Draws
          </h2>

          <button
            onClick={load}
            className="text-sm text-[#1a5c4a] flex items-center gap-1 hover:underline"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-[#8a8a8a]">
            Loading...
          </div>
        ) : draws.length === 0 ? (
          <div className="p-8 text-center text-[#8a8a8a]">
            No draws yet. Create one above.
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {draws.map(d => (
              <div
                key={d._id}
                className="p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {monthName(d.month)} {d.year}
                    </p>

                    <p className="text-sm text-[#5a5a5a]">
                      Status:{' '}
                      <span className="capitalize font-medium">
                        {d.status}
                      </span>
                      {' · '}
                      Method: {d.method}

                      {d.winningNumbers?.length > 0 && (
                        <>
                          {' · '}
                          Numbers:{' '}
                          <span className="font-mono text-[#1a5c4a]">
                            {d.winningNumbers.join(', ')}
                          </span>
                        </>
                      )}
                    </p>

                    <p className="text-xs text-[#8a8a8a] mt-1">
                      Pool: ₹
                      {(d.prizePool?.total || 0).toLocaleString()}
                      {d.activeSubscribersAtDraw != null &&
                        ` · ${d.activeSubscribersAtDraw} subscribers`}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(d.status === 'draft' ||
                      d.status === 'simulated') && (
                      <>
                        <button
                          onClick={() =>
                            handleSimulate(
                              d._id,
                              'random'
                            )
                          }
                          disabled={
                            simulating === d._id
                          }
                          className="btn-secondary py-2 px-3 text-xs"
                        >
                          <Play size={14} />
                          {simulating === d._id
                            ? '...'
                            : 'Simulate Random'}
                        </button>

                        <button
                          onClick={() =>
                            handleSimulate(
                              d._id,
                              'algorithmic'
                            )
                          }
                          disabled={
                            simulating === d._id
                          }
                          className="btn-secondary py-2 px-3 text-xs"
                        >
                          <Play size={14} />
                          {simulating === d._id
                            ? '...'
                            : 'Simulate Algo'}
                        </button>
                      </>
                    )}

                    {d.status === 'simulated' && (
                      <button
                        onClick={() =>
                          handlePublish(d._id)
                        }
                        disabled={
                          publishing === d._id
                        }
                        className="btn-primary py-2 px-3 text-xs"
                      >
                        <Upload size={14} />
                        {publishing === d._id
                          ? '...'
                          : 'Publish'}
                      </button>
                    )}

                    {d.status === 'simulated' &&
                      d.simulationData && (
                        <button
                          onClick={() =>
                            setSelectedSim(
                              d.simulationData
                            )
                          }
                          className="text-xs text-[#1a5c4a] underline"
                        >
                          View last sim
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSim && (
        <div className="bg-[#1a1a1a] text-white rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">
            Simulation Result
          </h2>

          <p className="text-sm text-white/60 mb-2">
            Method: {selectedSim.method}
          </p>

          <p className="text-2xl font-mono font-bold text-[#4ade80] mb-4">
            {selectedSim.winningNumbers?.join(' · ')}
          </p>

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60">
                5-match (Jackpot)
              </p>

              <p className="text-xl font-bold">
                {selectedSim.potentialWinners?.fiveMatch?.count || 0}
                {' '}winners
              </p>

              <p>
                ₹
                {(selectedSim.potentialWinners?.fiveMatch?.prizeEach || 0).toLocaleString()}
                {' '}each
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60">
                4-match
              </p>

              <p className="text-xl font-bold">
                {selectedSim.potentialWinners?.fourMatch?.count || 0}
                {' '}winners
              </p>

              <p>
                ₹
                {(selectedSim.potentialWinners?.fourMatch?.prizeEach || 0).toLocaleString()}
                {' '}each
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-white/60">
                3-match
              </p>

              <p className="text-xl font-bold">
                {selectedSim.potentialWinners?.threeMatch?.count || 0}
                {' '}winners
              </p>

              <p>
                ₹
                {(selectedSim.potentialWinners?.threeMatch?.prizeEach || 0).toLocaleString()}
                {' '}each
              </p>
            </div>
          </div>

          {selectedSim.rolloverIfNoFiveMatch > 0 && (
            <p className="mt-4 text-amber-300 text-sm">
              No 5-match → jackpot ₹
              {selectedSim.rolloverIfNoFiveMatch.toLocaleString()}
              {' '}will roll over
            </p>
          )}

          <button
            onClick={() => setSelectedSim(null)}
            className="mt-4 text-sm text-white/60 hover:text-white"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}

function WinnersTab() {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [rejectId, setRejectId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [busy, setBusy] = useState(null)

  const load = async () => {
    setLoading(true)

    try {
      const params = filter
        ? `?status=${filter}`
        : ''

      const res = await api.get(
        `/winners${params}`
      )

      setWinners(res.data.winners || [])
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Failed to load winners'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [filter])

  const handleVerify = async (id, action) => {
    if (
      action === 'reject' &&
      !rejectReason.trim()
    ) {
      setError('Rejection reason required')
      return
    }

    setBusy(id + action)
    setError('')
    setMessage('')

    try {
      await api.put(
        `/winners/${id}/verify`,
        {
          action,
          rejectionReason:
            action === 'reject'
              ? rejectReason
              : undefined
        }
      )

      setMessage(
        action === 'approve'
          ? 'Winner approved'
          : 'Proof rejected'
      )

      setRejectId(null)
      setRejectReason('')

      load()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Action failed'
      )
    } finally {
      setBusy(null)
    }
  }

  const handlePayout = async id => {
    if (
      !confirm(
        'Mark this payout as paid?'
      )
    ) {
      return
    }

    setBusy(id + 'pay')
    setError('')

    try {
      await api.put(
        `/winners/${id}/payout`,
        {
          notes: 'Manual payout by admin'
        }
      )

      setMessage(
        'Payout marked as paid'
      )

      load()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Payout failed'
      )
    } finally {
      setBusy(null)
    }
  }

  const monthName = m =>
    m
      ? new Date(
          2000,
          m - 1
        ).toLocaleString(
          'en',
          { month: 'short' }
        )
      : ''

  const apiBase =
    import.meta.env.VITE_API_URL?.replace(
      '/api',
      ''
    ) || 'http://localhost:5001'

  return (
    <div className="space-y-4">
      {message && (
        <div className="bg-[#1a5c4a]/10 text-[#1a5c4a] text-sm px-4 py-3 rounded-xl">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          '',
          'pending_proof',
          'proof_submitted',
          'approved',
          'rejected'
        ].map(s => (
          <button
            key={s || 'all'}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium ${
              filter === s
                ? 'bg-[#1a5c4a] text-white'
                : 'bg-white border border-black/10 text-[#5a5a5a]'
            }`}
          >
            {s
              ? s.replace('_', ' ')
              : 'All'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#8a8a8a]">
            Loading...
          </div>
        ) : winners.length === 0 ? (
          <div className="p-8 text-center text-[#8a8a8a]">
            No winners yet. Publish a draw first.
          </div>
        ) : (
          <div className="divide-y divide-black/5">
            {winners.map(w => (
              <div
                key={w._id}
                className="p-5"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold">
                      {w.user?.name || 'User'}{' '}
                      <span className="text-[#5a5a5a] font-normal text-sm">
                        ({w.user?.email})
                      </span>
                    </p>

                    <p className="text-sm text-[#5a5a5a] mt-1">
                      {monthName(w.draw?.month)}{' '}
                      {w.draw?.year} ·{' '}
                      {w.matchType}-match · ₹
                      {(w.prizeAmount || 0).toLocaleString()}
                    </p>

                    <p className="text-xs text-[#8a8a8a] mt-1">
                      Verification:{' '}
                      <span className="font-medium capitalize">
                        {w.verification?.status?.replace(
                          '_',
                          ' '
                        )}
                      </span>
                      {' · '}
                      Payout:{' '}
                      <span className="font-medium capitalize">
                        {w.payout?.status}
                      </span>
                    </p>

                    {w.verification?.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1">
                        Reason:{' '}
                        {w.verification.rejectionReason}
                      </p>
                    )}

                    {w.verification?.proofImage && (
                      <a
                        href={`${apiBase}${w.verification.proofImage}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-2 text-xs text-[#1a5c4a] underline"
                      >
                        View proof image
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {w.verification?.status ===
                      'proof_submitted' && (
                      <>
                        <button
                          onClick={() =>
                            handleVerify(
                              w._id,
                              'approve'
                            )
                          }
                          disabled={busy}
                          className="btn-primary py-1.5 px-3 text-xs"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            setRejectId(w._id)
                          }
                          className="btn-secondary py-1.5 px-3 text-xs"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {w.verification?.status ===
                      'approved' &&
                      w.payout?.status ===
                        'pending' && (
                        <button
                          onClick={() =>
                            handlePayout(w._id)
                          }
                          disabled={busy}
                          className="btn-primary py-1.5 px-3 text-xs"
                        >
                          Mark Paid
                        </button>
                      )}
                  </div>
                </div>

                {rejectId === w._id && (
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <input
                      value={rejectReason}
                      onChange={e =>
                        setRejectReason(
                          e.target.value
                        )
                      }
                      placeholder="Rejection reason..."
                      className="flex-1 px-3 py-2 text-sm rounded-lg border border-black/10"
                    />

                    <button
                      onClick={() =>
                        handleVerify(
                          w._id,
                          'reject'
                        )
                      }
                      className="btn-primary py-2 px-3 text-xs"
                    >
                      Confirm Reject
                    </button>

                    <button
                      onClick={() => {
                        setRejectId(null)
                        setRejectReason('')
                      }}
                      className="btn-secondary py-2 px-3 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ComingSoon({ title, desc }) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#1a5c4a]/10 flex items-center justify-center mx-auto mb-4">
        <Trophy className="w-6 h-6 text-[#1a5c4a]" />
      </div>

      <h2 className="text-xl font-semibold mb-2">
        {title}
      </h2>

      <p className="text-[#5a5a5a] max-w-md mx-auto">
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
        className={`text-xl sm:text-2xl font-bold ${
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
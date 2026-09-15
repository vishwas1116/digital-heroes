import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Trophy,
  Heart,
  Target,
  CreditCard,
  LogOut,
  Plus,
  Trash2,
  ChevronRight,
  Award,
  Activity
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Dashboard() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showScoreForm, setShowScoreForm] = useState(false)
  const [scoreForm, setScoreForm] = useState({
    value: '',
    date: '',
    note: ''
  })
  const [scoreError, setScoreError] = useState('')
  const [scoreLoading, setScoreLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    fetchScores()
  }, [isAuthenticated])

  const fetchScores = async () => {
    try {
      const res = await api.get('/scores')
      setScores(res.data.scores || res.data || [])
    } catch (err) {
      setScores([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddScore = async (e) => {
    e.preventDefault()
    setScoreError('')

    const value = Number(scoreForm.value)

    if (!value || value < 1 || value > 45) {
      return setScoreError('Score must be between 1 and 45')
    }

    if (!scoreForm.date) {
      return setScoreError('Date is required')
    }

    setScoreLoading(true)

    try {
      await api.post('/scores', {
        value,
        date: scoreForm.date,
        note: scoreForm.note
      })

      setShowScoreForm(false)
      setScoreForm({
        value: '',
        date: '',
        note: ''
      })

      fetchScores()
    } catch (err) {
      setScoreError(
        err.response?.data?.message || 'Failed to add score'
      )
    } finally {
      setScoreLoading(false)
    }
  }

  const handleDeleteScore = async (id) => {
    if (!confirm('Delete this score?')) return

    try {
      await api.delete(`/scores/${id}`)
      fetchScores()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const subscription = user?.subscription || {}
  const isActive = subscription.status === 'active'

  return (
    <div className="min-h-screen bg-[#f8f6f1]">
      <header className="bg-white border-b border-black/5 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg tracking-tight">
            digital<span className="text-[#1a5c4a]">.</span>heroes
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-[#5a5a5a] hidden sm:block">
              {user?.name}
            </span>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="text-sm font-medium text-[#1a5c4a] hover:underline"
              >
                Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-[#5a5a5a] hover:text-[#1a1a1a]"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
            Welcome back, {user?.name?.split(' ')[0] || 'Player'}
          </h1>

          <p className="text-[#5a5a5a] mt-1">
            Your performance. Your impact. Your rewards.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={CreditCard}
            label="Subscription"
            value={isActive ? 'Active' : subscription.status || 'None'}
            sub={
              isActive && subscription.currentPeriodEnd
                ? `Renews ${new Date(
                    subscription.currentPeriodEnd
                  ).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short'
                  })}`
                : subscription.plan !== 'none'
                  ? subscription.plan
                  : 'Subscribe to unlock'
            }
            accent={isActive}
          />

          <StatCard
            icon={Target}
            label="Scores"
            value={scores.length}
            sub="Latest 5 retained"
          />

          <StatCard
            icon={Heart}
            label="Charity Impact"
            value={`${user?.charityContributionPercent || 10}%`}
            sub="of your subscription"
          />

          <StatCard
            icon={Trophy}
            label="Total Won"
            value="₹0"
            sub="Pending payouts: 0"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl border border-black/5 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold text-[#1a1a1a]">
                    Your Scores
                  </h2>
                  <p className="text-sm text-[#5a5a5a]">
                    Stableford • Latest 5 only
                  </p>
                </div>

                <button
                  onClick={() => setShowScoreForm(!showScoreForm)}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  <Plus size={16} />
                  Add Score
                </button>
              </div>

              {showScoreForm && (
                <form
                  onSubmit={handleAddScore}
                  className="mb-6 p-4 bg-[#f8f6f1] rounded-xl space-y-3"
                >
                  {scoreError && (
                    <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      {scoreError}
                    </div>
                  )}

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-[#5a5a5a]">
                        Score (1-45)
                      </label>

                      <input
                        type="number"
                        min="1"
                        max="45"
                        value={scoreForm.value}
                        onChange={(e) =>
                          setScoreForm((p) => ({
                            ...p,
                            value: e.target.value
                          }))
                        }
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-black/10 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#5a5a5a]">
                        Date
                      </label>

                      <input
                        type="date"
                        value={scoreForm.date}
                        onChange={(e) =>
                          setScoreForm((p) => ({
                            ...p,
                            date: e.target.value
                          }))
                        }
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-black/10 bg-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#5a5a5a]">
                        Note (optional)
                      </label>

                      <input
                        type="text"
                        value={scoreForm.note}
                        onChange={(e) =>
                          setScoreForm((p) => ({
                            ...p,
                            note: e.target.value
                          }))
                        }
                        placeholder="e.g. Morning round"
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-black/10 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={scoreLoading}
                      className="btn-primary py-2 px-4 text-sm"
                    >
                      {scoreLoading ? 'Saving...' : 'Save Score'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowScoreForm(false)}
                      className="btn-secondary py-2 px-4 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {loading ? (
                <div className="text-center py-10 text-[#5a5a5a]">
                  Loading scores...
                </div>
              ) : scores.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-10 h-10 text-[#1a5c4a]/30 mx-auto mb-3" />
                  <p className="text-[#5a5a5a]">No scores yet</p>
                  <p className="text-sm text-[#8a8a8a] mt-1">
                    Add your first Stableford score to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scores.map((score, i) => (
                    <div
                      key={score._id || i}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f8f6f1] transition group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                            i === 0
                              ? 'bg-[#1a5c4a] text-white'
                              : 'bg-[#1a5c4a]/10 text-[#1a5c4a]'
                          }`}
                        >
                          {score.value}
                        </div>

                        <div>
                          <p className="font-medium text-[#1a1a1a]">
                            {new Date(score.date).toLocaleDateString(
                              'en-IN',
                              {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }
                            )}
                          </p>

                          {score.note && (
                            <p className="text-xs text-[#8a8a8a]">
                              {score.note}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteScore(score._id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-[#8a8a8a] hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-black/5 p-6">
              <h2 className="text-lg font-semibold text-[#1a1a1a] mb-1">
                Draw Participation
              </h2>

              <p className="text-sm text-[#5a5a5a] mb-5">
                Your numbers come from your latest 5 scores
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#f8f6f1]">
                  <p className="text-xs font-medium text-[#5a5a5a] uppercase tracking-wide">
                    Next Draw
                  </p>
                  <p className="text-xl font-semibold mt-1">
                    September 2026
                  </p>
                  <p className="text-sm text-[#8a8a8a] mt-1">
                    Ends in ~15 days
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#f8f6f1]">
                  <p className="text-xs font-medium text-[#5a5a5a] uppercase tracking-wide">
                    Draws Entered
                  </p>
                  <p className="text-xl font-semibold mt-1">0</p>
                  <p className="text-sm text-[#8a8a8a] mt-1">
                    Keep scoring to participate
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-black/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-[#1a5c4a]" />
                <h2 className="text-lg font-semibold text-[#1a1a1a]">
                  Your Charity
                </h2>
              </div>

              {user?.charity ? (
                <div>
                  <p className="font-medium text-[#1a1a1a]">
                    {typeof user.charity === 'object'
                      ? user.charity.name
                      : 'Selected Charity'}
                  </p>

                  <p className="text-sm text-[#5a5a5a] mt-1">
                    Contributing{' '}
                    <span className="font-semibold text-[#1a5c4a]">
                      {user.charityContributionPercent}%
                    </span>{' '}
                    of your subscription
                  </p>

                  <Link
                    to="/charities"
                    className="inline-flex items-center gap-1 text-sm text-[#1a5c4a] mt-3 hover:underline"
                  >
                    Change charity
                    <ChevronRight size={14} />
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-[#5a5a5a] text-sm">
                    No charity selected yet
                  </p>

                  <Link
                    to="/charities"
                    className="btn-primary py-2 px-4 text-sm mt-3 inline-flex"
                  >
                    Choose a charity
                  </Link>
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-black/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-[#1a5c4a]" />
                <h2 className="text-lg font-semibold text-[#1a1a1a]">
                  Winnings
                </h2>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[#5a5a5a]">Total won</span>
                  <span className="font-semibold">₹0</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-[#5a5a5a]">Pending payout</span>
                  <span className="font-semibold">₹0</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-[#5a5a5a]">Paid out</span>
                  <span className="font-semibold">₹0</span>
                </div>
              </div>

              <p className="text-xs text-[#8a8a8a] mt-4">
                Win a draw and upload proof to claim your prize.
              </p>
            </section>

            <section className="bg-[#1a5c4a] text-white rounded-2xl p-6">
              <h2 className="font-semibold mb-3">Quick Actions</h2>

              <div className="space-y-2">
                <button
                  onClick={() => setShowScoreForm(true)}
                  className="w-full text-left px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm"
                >
                  + Add new score
                </button>

                <Link
                  to="/charities"
                  className="block w-full text-left px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm"
                >
                  Browse charities
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon
          size={16}
          className={accent ? 'text-[#1a5c4a]' : 'text-[#8a8a8a]'}
        />

        <span className="text-xs font-medium text-[#5a5a5a] uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p
        className={`text-xl sm:text-2xl font-bold ${
          accent ? 'text-[#1a5c4a]' : 'text-[#1a1a1a]'
        }`}
      >
        {value}
      </p>

      {sub && (
        <p className="text-xs text-[#8a8a8a] mt-0.5">
          {sub}
        </p>
      )}
    </div>
  )
}
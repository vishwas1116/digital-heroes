import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Trophy, Heart, Target, CreditCard, LogOut, Plus,
  Trash2, ChevronRight, Award, Activity
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Dashboard() {
  const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showScoreForm, setShowScoreForm] = useState(false)
  const [scoreForm, setScoreForm] = useState({ value: '', date: '', note: '' })
  const [scoreError, setScoreError] = useState('')
  const [scoreLoading, setScoreLoading] = useState(false)
  const [winnings, setWinnings] = useState([])
  const [winningsSummary, setWinningsSummary] = useState({ totalWon: 0, pendingPayout: 0, paid: 0 })
  const [uploadingProof, setUploadingProof] = useState(null)
  const [subLoading, setSubLoading] = useState(false)
  const [donationTotal, setDonationTotal] = useState(0)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadAll()
  }, [isAuthenticated, authLoading])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [scoresRes, winRes, donRes] = await Promise.allSettled([
        api.get('/scores'),
        api.get('/winners/me'),
        api.get('/donations/me')
      ])
      if (scoresRes.status === 'fulfilled') {
        setScores(scoresRes.value.data.scores || scoresRes.value.data || [])
      }
      if (winRes.status === 'fulfilled') {
        setWinnings(winRes.value.data.winners || [])
        setWinningsSummary(winRes.value.data.summary || { totalWon: 0, pendingPayout: 0, paid: 0 })
      }
      if (donRes.status === 'fulfilled') {
        setDonationTotal(donRes.value.data.total || 0)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddScore = async (e) => {
    e.preventDefault()
    setScoreError('')
    const value = Number(scoreForm.value)
    if (!value || value < 1 || value > 45) return setScoreError('Score must be between 1 and 45')
    if (!scoreForm.date) return setScoreError('Date is required')
    setScoreLoading(true)
    try {
      await api.post('/scores', { value, date: scoreForm.date, note: scoreForm.note })
      setShowScoreForm(false)
      setScoreForm({ value: '', date: '', note: '' })
      loadAll()
    } catch (err) {
      setScoreError(err.response?.data?.message || 'Failed to add score')
    } finally {
      setScoreLoading(false)
    }
  }

  const handleDeleteScore = async (id) => {
    if (!confirm('Delete this score?')) return
    try {
      await api.delete(`/scores/${id}`)
      loadAll()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete')
    }
  }

  const handleUploadProof = async (winnerId, file) => {
    if (!file) return
    setUploadingProof(winnerId)
    try {
      const formData = new FormData()
      formData.append('proof', file)
      await api.post(`/winners/${winnerId}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      loadAll()
      alert('Proof uploaded. Waiting for admin review.')
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingProof(null)
    }
  }

  const handleActivateSubscription = async (plan) => {
    setSubLoading(true)
    try {
      const checkout = await api.post('/subscriptions/checkout', { plan })
      if (checkout.data.mode === 'stripe' && checkout.data.url) {
        window.location.href = checkout.data.url
        return
      }
      await api.post('/subscriptions/activate-demo', { plan })
      window.location.reload()
    } catch (err) {
      alert(err.response?.data?.message || 'Subscription failed')
    } finally {
      setSubLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Cancel subscription? Access continues until period end.')) return
    try {
      await api.post('/subscriptions/cancel')
      window.location.reload()
    } catch (err) {
      alert(err.response?.data?.message || 'Cancel failed')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6f1] text-[#5a5a5a]">
        Loading...
      </div>
    )
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
            <span className="text-sm text-[#5a5a5a] hidden sm:block">{user?.name}</span>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-sm font-medium text-[#1a5c4a] hover:underline">Admin</Link>
            )}
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-[#5a5a5a] hover:text-[#1a1a1a]">
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">
            Welcome back, {user?.name?.split(' ')[0] || 'Player'}
          </h1>
          <p className="text-[#5a5a5a] mt-1">Your performance. Your impact. Your rewards.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={CreditCard}
            label="Subscription"
            value={isActive ? 'Active' : (subscription.status || 'None')}
            sub={
              isActive && subscription.currentPeriodEnd
                ? `Renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                : 'Subscribe to unlock'
            }
            accent={isActive}
          />
          <StatCard icon={Target} label="Scores" value={scores.length} sub="Latest 5 retained" />
          <StatCard icon={Heart} label="Charity Impact" value={`${user?.charityContributionPercent || 10}%`} sub="of your subscription" />
          <StatCard
            icon={Trophy}
            label="Total Won"
            value={`₹${(winningsSummary.totalWon || 0).toLocaleString()}`}
            sub={`Pending: ₹${(winningsSummary.pendingPayout || 0).toLocaleString()}`}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl border border-black/5 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-semibold">Your Scores</h2>
                  <p className="text-sm text-[#5a5a5a]">Stableford · Latest 5 only</p>
                </div>
                <button onClick={() => setShowScoreForm(!showScoreForm)} className="btn-primary py-2 px-4 text-sm">
                  <Plus size={16} /> Add Score
                </button>
              </div>

              {showScoreForm && (
                <form onSubmit={handleAddScore} className="mb-6 p-4 bg-[#f8f6f1] rounded-xl space-y-3">
                  {scoreError && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{scoreError}</div>}
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-medium text-[#5a5a5a]">Score (1-45)</label>
                      <input
                        type="number"
                        min="1"
                        max="45"
                        value={scoreForm.value}
                        onChange={(e) => setScoreForm((p) => ({ ...p, value: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-black/10 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#5a5a5a]">Date</label>
                      <input
                        type="date"
                        value={scoreForm.date}
                        onChange={(e) => setScoreForm((p) => ({ ...p, date: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-black/10 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#5a5a5a]">Note</label>
                      <input
                        type="text"
                        value={scoreForm.note}
                        placeholder="Optional"
                        onChange={(e) => setScoreForm((p) => ({ ...p, note: e.target.value }))}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-black/10 bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={scoreLoading} className="btn-primary py-2 px-4 text-sm">
                      {scoreLoading ? 'Saving...' : 'Save Score'}
                    </button>
                    <button type="button" onClick={() => setShowScoreForm(false)} className="btn-secondary py-2 px-4 text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {loading ? (
                <div className="text-center py-10 text-[#5a5a5a]">Loading scores...</div>
              ) : scores.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-10 h-10 text-[#1a5c4a]/30 mx-auto mb-3" />
                  <p className="text-[#5a5a5a]">No scores yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {scores.map((score, i) => (
                    <div key={score._id || i} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f8f6f1] group">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                            i === 0 ? 'bg-[#1a5c4a] text-white' : 'bg-[#1a5c4a]/10 text-[#1a5c4a]'
                          }`}
                        >
                          {score.value}
                        </div>
                        <div>
                          <p className="font-medium">
                            {score.date
                              ? new Date(score.date).toLocaleDateString('en-IN', {
                                  weekday: 'short',
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '—'}
                          </p>
                          {score.note && <p className="text-xs text-[#8a8a8a]">{score.note}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteScore(score._id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-[#8a8a8a] hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-black/5 p-6">
              <h2 className="text-lg font-semibold mb-1">Draw Participation</h2>
              <p className="text-sm text-[#5a5a5a] mb-5">Your numbers come from your latest 5 scores</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#f8f6f1]">
                  <p className="text-xs font-medium text-[#5a5a5a] uppercase tracking-wide">Next Draw</p>
                  <p className="text-xl font-semibold mt-1">Monthly</p>
                </div>
                <div className="p-4 rounded-xl bg-[#f8f6f1]">
                  <p className="text-xs font-medium text-[#5a5a5a] uppercase tracking-wide">Your numbers</p>
                  <p className="text-xl font-semibold mt-1 font-mono">
                    {scores.length ? scores.map((s) => s.value).join(' · ') : '—'}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white rounded-2xl border border-black/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-[#1a5c4a]" />
                <h2 className="text-lg font-semibold">Your Charity</h2>
              </div>
              {user?.charity ? (
                <div>
                  <p className="font-medium">
                    {typeof user.charity === 'object' ? user.charity.name : 'Selected Charity'}
                  </p>
                  <p className="text-sm text-[#5a5a5a] mt-1">
                    Contributing{' '}
                    <span className="font-semibold text-[#1a5c4a]">
                      {user.charityContributionPercent || 10}%
                    </span>
                  </p>
                  <Link to="/charities" className="inline-flex items-center gap-1 text-sm text-[#1a5c4a] mt-3 hover:underline">
                    Change charity <ChevronRight size={14} />
                  </Link>
                  {donationTotal > 0 && (
                    <p className="text-xs text-[#8a8a8a] mt-3">
                      Independent donations: ₹{donationTotal.toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-[#5a5a5a] text-sm">No charity selected yet</p>
                  <Link to="/charities" className="btn-primary py-2 px-4 text-sm mt-3 inline-flex">
                    Choose a charity
                  </Link>
                </div>
              )}
            </section>

            <section className="bg-white rounded-2xl border border-black/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-[#1a5c4a]" />
                <h2 className="text-lg font-semibold">Winnings</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#5a5a5a]">Total won</span>
                  <span className="font-semibold">₹{(winningsSummary.totalWon || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5a5a5a]">Pending payout</span>
                  <span className="font-semibold">₹{(winningsSummary.pendingPayout || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5a5a5a]">Paid out</span>
                  <span className="font-semibold">₹{(winningsSummary.paid || 0).toLocaleString()}</span>
                </div>
              </div>
              {winnings.map((w) => (
                <div key={w._id} className="text-sm mt-3 border-t border-black/5 pt-3">
                  <p className="font-medium">
                    {w.matchType}-match · ₹{(w.prizeAmount || 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-[#8a8a8a] capitalize">
                    {(w.verification?.status || '').replace('_', ' ')} · {w.payout?.status}
                  </p>
                  {['pending_proof', 'rejected'].includes(w.verification?.status) && (
                    <label className="mt-2 inline-block text-xs text-[#1a5c4a] underline cursor-pointer">
                      {uploadingProof === w._id ? 'Uploading...' : 'Upload score proof'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingProof === w._id}
                        onChange={(e) => handleUploadProof(w._id, e.target.files?.[0])}
                      />
                    </label>
                  )}
                </div>
              ))}
            </section>

            <section className="bg-white rounded-2xl border border-black/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-[#1a5c4a]" />
                <h2 className="text-lg font-semibold">Subscription</h2>
              </div>
              {isActive ? (
                <div>
                  <p className="text-sm">
                    Plan: <span className="font-semibold capitalize">{subscription.plan}</span>
                  </p>
                  <p className="text-sm mt-1">
                    Status: <span className="text-[#1a5c4a] font-medium">Active</span>
                  </p>
                  {subscription.status !== 'cancelled' && (
                    <button onClick={handleCancelSubscription} className="mt-4 text-xs text-red-600 hover:underline">
                      Cancel subscription
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-[#5a5a5a] mb-4">Subscribe to enter draws.</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleActivateSubscription('monthly')}
                      disabled={subLoading}
                      className="w-full btn-primary py-2.5 text-sm"
                    >
                      {subLoading ? 'Processing...' : 'Monthly — ₹999'}
                    </button>
                    <button
                      onClick={() => handleActivateSubscription('yearly')}
                      disabled={subLoading}
                      className="w-full btn-secondary py-2.5 text-sm"
                    >
                      Yearly — ₹9,999
                    </button>
                  </div>
                </div>
              )}
            </section>

            <section className="bg-[#1a5c4a] text-white rounded-2xl p-6">
              <h2 className="font-semibold mb-3">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setShowScoreForm(true)}
                  className="w-full text-left px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
                >
                  + Add new score
                </button>
                <Link
                  to="/charities"
                  className="block w-full text-left px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
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
        <Icon size={16} className={accent ? 'text-[#1a5c4a]' : 'text-[#8a8a8a]'} />
        <span className="text-xs font-medium text-[#5a5a5a] uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-xl sm:text-2xl font-bold ${accent ? 'text-[#1a5c4a]' : 'text-[#1a1a1a]'}`}>{value}</p>
      {sub && <p className="text-xs text-[#8a8a8a] mt-0.5">{sub}</p>}
    </div>
  )
}
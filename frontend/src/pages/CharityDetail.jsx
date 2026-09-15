import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../services/api'

export default function CharityDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [charity, setCharity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [donateAmount, setDonateAmount] = useState('500')
  const [donating, setDonating] = useState(false)
  const [donateMsg, setDonateMsg] = useState('')

  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

  useEffect(() => {
    const fetchCharity = async () => {
      try {
        const res = await api.get(`/charities/${slug}`)
        setCharity(res.data.charity)
      } catch (error) {
        setMessage(
          error.response?.data?.message || 'Charity not found'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCharity()
  }, [slug])

  const handleSelect = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    try {
      await api.put(`/users/charity`, {
        charityId: charity._id
      })

      setMessage('Charity selected successfully!')
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Failed to select charity'
      )
    }
  }

  const handleDonate = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const amt = Number(donateAmount)

    if (!amt || amt < 1) {
      setDonateMsg('Enter a valid amount')
      return
    }

    if (amt > 500000) {
      setDonateMsg('Maximum donation amount is ₹5,00,000')
      return
    }

    setDonating(true)
    setDonateMsg('')

    try {
      const res = await api.post('/donations', {
        charityId: charity._id,
        amount: amt
      })

      setDonateMsg(
        res.data.message || 'Donation successful!'
      )

      setDonateAmount('500')
    } catch (err) {
      setDonateMsg(
        err.response?.data?.message || 'Donation failed'
      )
    } finally {
      setDonating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#5a5a5a]">Loading...</p>
      </div>
    )
  }

  if (!charity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#1a1a1a] mb-2">
            Charity not found
          </h1>

          <p className="text-[#5a5a5a] mb-4">
            {message}
          </p>

          <Link
            to="/charities"
            className="text-[#1a5c4a] hover:underline"
          >
            Back to charities
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] py-10">
      <div className="max-w-6xl mx-auto px-4">
        <Link
          to="/charities"
          className="text-sm text-[#1a5c4a] hover:underline"
        >
          ← Back to charities
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 mt-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl overflow-hidden border border-black/5 shadow-sm">
              {charity.image && (
                <img
                  src={charity.image}
                  alt={charity.name}
                  className="w-full h-72 object-cover"
                />
              )}

              <div className="p-6 md:p-8">
                <h1 className="text-3xl font-bold text-[#1a1a1a]">
                  {charity.name}
                </h1>

                {charity.description && (
                  <p className="mt-4 text-[#5a5a5a] leading-relaxed">
                    {charity.description}
                  </p>
                )}

                {message && (
                  <div className="mt-5 p-3 rounded-lg bg-[#1a5c4a]/5 text-sm text-[#1a5c4a]">
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
              <h2 className="font-semibold text-[#1a1a1a] mb-2">
                Support this charity
              </h2>

              <p className="text-sm text-[#5a5a5a] mb-4">
                Choose this charity to receive your subscription
                contribution.
              </p>

              <button
                onClick={handleSelect}
                className="btn-primary w-full py-3"
              >
                Select this charity
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-center text-[#8a8a8a] mt-3">
                  <Link
                    to="/login"
                    className="text-[#1a5c4a] hover:underline"
                  >
                    Login
                  </Link>{' '}
                  to select
                </p>
              )}

              {/* Independent donation */}
              <div className="mt-6 pt-6 border-t border-black/5">
                <h3 className="font-semibold text-[#1a1a1a] mb-1 text-sm">
                  Independent donation
                </h3>

                <p className="text-xs text-[#5a5a5a] mb-3">
                  Not tied to subscription — 100% to this cause.
                </p>

                {donateMsg && (
                  <p className="text-xs text-[#1a5c4a] mb-2">
                    {donateMsg}
                  </p>
                )}

                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="500000"
                    value={donateAmount}
                    onChange={(e) =>
                      setDonateAmount(e.target.value)
                    }
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-black/10"
                    placeholder="Amount ₹"
                  />

                  <button
                    onClick={handleDonate}
                    disabled={donating}
                    className="btn-primary py-2 px-4 text-sm disabled:opacity-50"
                  >
                    {donating ? '...' : 'Give'}
                  </button>
                </div>

                <div className="flex gap-2 mt-2 flex-wrap">
                  {[100, 500, 1000, 2500].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() =>
                        setDonateAmount(String(a))
                      }
                      className="text-xs px-2 py-1 rounded-full border border-black/10 text-[#5a5a5a] hover:border-[#1a5c4a]/40"
                    >
                      ₹{a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Heart } from 'lucide-react'
import api from '../services/api'

export default function Charities() {
  const [charities, setCharities] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const categories = [
    { value: '', label: 'All' },
    { value: 'health', label: 'Health' },
    { value: 'education', label: 'Education' },
    { value: 'environment', label: 'Environment' },
    { value: 'community', label: 'Community' },
    { value: 'sports', label: 'Sports' },
    { value: 'children', label: 'Children' }
  ]

  useEffect(() => {
    fetchCharities()
  }, [search, category])

  const fetchCharities = async () => {
    setLoading(true)

    try {
      const params = new URLSearchParams()

      if (search) params.append('search', search)
      if (category) params.append('category', category)

      const res = await api.get(`/charities?${params}`)

      setCharities(res.data.charities || [])
    } catch (err) {
      console.error(err)
      setCharities([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f1] pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-medium tracking-widest text-[#1a5c4a] uppercase mb-3">
            Make an Impact
          </p>

          <h1 className="text-3xl sm:text-5xl font-bold text-[#1a1a1a] tracking-tight">
            Choose a cause you care about
          </h1>

          <p className="mt-4 text-lg text-[#5a5a5a] max-w-2xl mx-auto">
            Every subscription directs a portion of your fee to a charity you select.
            Minimum 10%. You can increase it anytime.
          </p>
        </motion.div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">

          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a8a8a]" />

            <input
              type="text"
              placeholder="Search charities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5c4a]/30"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  category === cat.value
                    ? 'bg-[#1a5c4a] text-white'
                    : 'bg-white border border-black/10 text-[#5a5a5a] hover:border-[#1a5c4a]/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center py-20 text-[#5a5a5a]">
            Loading charities...
          </div>

        ) : charities.length === 0 ? (

          /* Empty State */
          <div className="text-center py-20">
            <Heart className="w-12 h-12 text-[#1a5c4a]/20 mx-auto mb-4" />

            <p className="text-[#5a5a5a]">
              No charities found
            </p>
          </div>

        ) : (

          /* Charity Grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {charities.map((charity, i) => (
              <motion.div
                key={charity._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/charities/${charity.slug || charity._id}`}
                  className="block bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-lg hover:border-[#1a5c4a]/20 transition group"
                >

                  {/* Image */}
                  <div className="aspect-[16/10] bg-[#f0f0f0] relative overflow-hidden">

                    {charity.image ? (
                      <img
                        src={charity.image}
                        alt={charity.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#1a5c4a]/5">
                        <Heart className="w-12 h-12 text-[#1a5c4a]/30" />
                      </div>
                    )}

                    {/* Featured */}
                    {charity.isFeatured && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#1a5c4a] text-white text-xs font-medium rounded-full">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">

                    <p className="text-xs font-medium text-[#1a5c4a] uppercase tracking-wide mb-1">
                      {charity.category}
                    </p>

                    <h3 className="text-lg font-semibold text-[#1a1a1a] group-hover:text-[#1a5c4a] transition">
                      {charity.name}
                    </h3>

                    <p className="text-sm text-[#5a5a5a] mt-2 line-clamp-2">
                      {charity.shortDescription || charity.description}
                    </p>

                    {charity.impactStatement && (
                      <p className="text-xs text-[#1a5c4a] mt-3 font-medium">
                        {charity.impactStatement}
                      </p>
                    )}

                  </div>
                </Link>
              </motion.div>
            ))}

          </div>
        )}
      </div>
    </div>
  )
}
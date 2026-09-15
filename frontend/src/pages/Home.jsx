import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Trophy, Target, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-28 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center"
          >
            <p className="text-sm font-medium tracking-widest text-[#1a5c4a] uppercase mb-6">
              Play · Give · Win
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#1a1a1a] leading-[0.95]">
              NO MORE<br />
              <span className="text-[#1a5c4a]">MISSED IMPACT.</span>
            </h1>
            <p className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-[#4a4a4a] leading-relaxed">
              Track your Stableford scores. Fuel a charity you care about. Enter monthly prize draws. 
              Your game can move something forward.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary text-base px-8 py-4">
                Start playing with purpose
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/charities" className="btn-secondary text-base px-8 py-4">
                Explore charities
              </Link>
            </div>
            <p className="mt-8 text-sm text-[#6b6b6b]">
              2,000+ projects delivered · Featured in Forbes India & YourStory
            </p>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: 'Track performance', desc: 'Enter your latest Stableford scores. Only your best five stay active — always.' },
              { icon: Heart, title: 'Choose impact', desc: 'Direct at least 10% of your subscription to a charity you believe in. Increase it anytime.' },
              { icon: Trophy, title: 'Enter the draw', desc: 'Every month your scores become your numbers. Match 3, 4 or 5 to share the prize pool.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="card p-8"
              >
                <div className="w-12 h-12 rounded-full bg-[#1a5c4a]/10 flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-[#1a5c4a]" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-[#4a4a4a] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Prize pool */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Transparent prize pools
            </h2>
            <p className="text-lg text-[#4a4a4a] mb-8">
              A fixed portion of every subscription fuels the monthly prize pool. Distribution is automatic and fair.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-4">
                <span className="w-16 h-10 rounded-full bg-[#1a5c4a] text-white flex items-center justify-center font-bold text-sm">40%</span>
                <span>5-number match · Jackpot (rolls over if unclaimed)</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="w-16 h-10 rounded-full bg-[#1a5c4a]/80 text-white flex items-center justify-center font-bold text-sm">35%</span>
                <span>4-number match</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="w-16 h-10 rounded-full bg-[#1a5c4a]/60 text-white flex items-center justify-center font-bold text-sm">25%</span>
                <span>3-number match</span>
              </li>
            </ul>
          </div>
          <div className="card p-10 bg-[#1a1a1a] text-white">
            <p className="text-sm uppercase tracking-widest text-white/60 mb-4">This month</p>
            <p className="text-5xl font-bold mb-2">₹4,82,000</p>
            <p className="text-white/70 mb-8">Current prize pool</p>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-[#1a5c4a] rounded-full" />
            </div>
            <p className="mt-4 text-sm text-white/50">Growing with every new subscriber</p>
          </div>
        </div>
      </section>

      {/* Charity CTA */}
      <section className="py-24 px-6 bg-[#1a5c4a] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Users className="w-12 h-12 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Your subscription creates real impact
          </h2>
          <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
            Every member chooses a charity. Minimum 10% of the fee goes directly to the cause. 
            You can raise that percentage. Independent donations are always welcome.
          </p>
          <Link to="/charities" className="inline-flex items-center gap-2 rounded-full bg-white text-[#1a5c4a] px-8 py-4 font-semibold hover:bg-white/90 transition">
            Browse charities
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Ready to play with purpose?
          </h2>
          <p className="text-lg text-[#4a4a4a] mb-12">
            Join the community that turns golf scores into community support and real rewards.
          </p>
          <Link to="/register" className="btn-primary text-lg px-10 py-5">
            Create your account
          </Link>
        </div>
      </section>
    </div>
  )
}

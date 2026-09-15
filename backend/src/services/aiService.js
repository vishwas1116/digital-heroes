const KNOWLEDGE = [
  {
    keys: [
      'draw',
      'how does the draw',
      'lottery',
      'match',
      '5-number',
      '4-number',
      '3-number'
    ],
    answer: `Monthly draws work like this:
• Your latest 5 Stableford scores become your entry numbers (1–45).
• Admin runs a Random or Algorithmic draw of 5 winning numbers.
• Match 5 → Jackpot (40% of pool, rolls over if unclaimed)
• Match 4 → 35% of pool (split equally)
• Match 3 → 25% of pool (split equally)
Simulation must happen before publish.`
  },

  {
    keys: [
      'prize',
      'pool',
      'calculate',
      'money',
      'how much'
    ],
    answer: `Prize pool = ~30% of active subscription fees + any jackpot rollover.
Distribution: 40% (5-match) / 35% (4-match) / 25% (3-match).
Multiple winners in the same tier split that tier equally.`
  },

  {
    keys: [
      'score',
      'stableford',
      'enter score',
      'sixth',
      '5 scores'
    ],
    answer: `Score rules:
• Range 1–45 (Stableford)
• One score per date only
• Only your latest 5 scores are kept
• Adding a 6th score automatically removes the oldest
• You can edit or delete existing scores`
  },

  {
    keys: [
      'charity',
      'contribution',
      'donate',
      '10%'
    ],
    answer: `Charity impact:
• Choose a charity at signup or later
• Minimum 10% of your subscription goes to that charity
• You can increase the percentage anytime
• Independent donations (not tied to gameplay) are also supported`
  },

  {
    keys: [
      'subscription',
      'monthly',
      'yearly',
      'price',
      'cancel',
      'plan'
    ],
    answer: `Plans:
• Monthly — ₹999
• Yearly — ₹9,999 (about 17% savings)
Active subscription is required for draws and full features.
You can cancel anytime; access continues until the period ends.`
  },

  {
    keys: [
      'winner',
      'proof',
      'verify',
      'payout',
      'claim'
    ],
    answer: `If you win:
1. Upload a screenshot of your scores as proof
2. Admin reviews → Approve or Reject (with reason)
3. Approved → payout status Pending → Admin marks Paid
Only winners can upload proof.`
  },

  {
    keys: [
      'next draw',
      'when',
      'monthly'
    ],
    answer: `Draws run on a monthly cadence. Admin configures and publishes each month after simulation. Check your dashboard for participation and upcoming draw info.`
  },

  {
    keys: [
      'hello',
      'hi',
      'hey',
      'help'
    ],
    answer: `Hey! I'm Hero Guide. I can explain draws, scores, charity contributions, subscriptions, prizes, and winner verification. What do you want to know?`
  }
]

function knowledgeAnswer(message) {
  const lower = message.toLowerCase()

  let best = null
  let bestScore = 0

  for (const item of KNOWLEDGE) {
    let score = 0

    for (const key of item.keys) {
      if (lower.includes(key)) {
        score += key.length
      }
    }

    if (score > bestScore) {
      bestScore = score
      best = item
    }
  }

  if (best && bestScore > 0) {
    return best.answer
  }

  return `I can help with:
• How draws & prizes work
• Score entry rules (rolling 5)
• Charity contribution (min 10%)
• Subscriptions (monthly / yearly)
• Winner proof & payouts

Try asking: "How does the draw work?" or "What happens when I enter a sixth score?"`
}

exports.chat = async (message, history = []) => {
  if (!message || !message.trim()) {
    return {
      reply: 'Please type a question.',
      source: 'validation'
    }
  }

  const apiKey = process.env.AI_API_KEY

  const useAI =
    apiKey &&
    !apiKey.includes('your_openai') &&
    !apiKey.includes('your_grok')

  if (useAI) {
    try {
      const provider = process.env.AI_PROVIDER || 'openai'

      const baseUrl =
        provider === 'grok'
          ? 'https://api.x.ai/v1/chat/completions'
          : 'https://api.openai.com/v1/chat/completions'

      const model =
        provider === 'grok'
          ? 'grok-beta'
          : 'gpt-4o-mini'

      const systemPrompt = `You are Hero Guide, the helpful assistant for Digital Heroes — a golf performance + charity + monthly prize draw platform.

Be concise, friendly, and accurate.

Key facts:
- Scores: Stableford 1-45, max 5 retained, one per date, 6th replaces oldest
- Draws: monthly, 5 numbers, match 3/4/5, prize split 25%/35%/40%, jackpot rolls over
- Charity: min 10% of subscription, user selectable
- Plans: Monthly ₹999, Yearly ₹9999

If unsure, say so and point users to the dashboard.`

      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },

        ...history
          .slice(-6)
          .map(h => ({
            role: h.role,
            content: h.content
          })),

        {
          role: 'user',
          content: message
        }
      ]

      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 400,
          temperature: 0.4
        })
      })

      if (!res.ok) {
        throw new Error(`AI API ${res.status}`)
      }

      const data = await res.json()

      const reply =
        data.choices?.[0]?.message?.content ||
        knowledgeAnswer(message)

      return {
        reply,
        source: 'ai'
      }

    } catch (err) {
      console.warn(
        'AI fallback:',
        err.message
      )

      return {
        reply: knowledgeAnswer(message),
        source: 'fallback'
      }
    }
  }

  return {
    reply: knowledgeAnswer(message),
    source: 'knowledge'
  }
}
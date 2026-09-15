const Score = require('../models/Score')

/**
 * Add or update a score for a user.
 *
 * Business rules:
 * - Score must be 1-45
 * - One score per date
 * - Only latest 5 scores retained
 * - New score replaces oldest if more than 5
 */

exports.addOrUpdateScore = async (userId, value, date, note = '') => {
  if (value < 1 || value > 45) {
    throw new Error('Score must be between 1 and 45')
  }

  const scoreDate = new Date(date)
  scoreDate.setHours(0, 0, 0, 0)

  let existing = await Score.findOne({
    user: userId,
    date: scoreDate
  })

  if (existing) {
    existing.value = value
    existing.note = note

    await existing.save()

    return existing
  }

  const score = await Score.create({
    user: userId,
    value,
    date: scoreDate,
    note
  })

  const allScores = await Score
    .find({ user: userId })
    .sort({ date: 1 })

  if (allScores.length > 5) {
    const toRemove = allScores.slice(
      0,
      allScores.length - 5
    )

    await Score.deleteMany({
      _id: {
        $in: toRemove.map(score => score._id)
      }
    })
  }

  return score
}

exports.getUserScores = async (userId) => {
  return await Score
    .find({ user: userId })
    .sort({ date: -1 })
    .limit(5)
}

exports.deleteScore = async (userId, scoreId) => {
  const score = await Score.findOne({
    _id: scoreId,
    user: userId
  })

  if (!score) {
    throw new Error('Score not found')
  }

  await score.deleteOne()

  return {
    message: 'Score deleted'
  }
}

exports.updateScore = async (
  userId,
  scoreId,
  updates
) => {
  const score = await Score.findOne({
    _id: scoreId,
    user: userId
  })

  if (!score) {
    throw new Error('Score not found')
  }

  if (updates.value !== undefined) {
    if (
      updates.value < 1 ||
      updates.value > 45
    ) {
      throw new Error(
        'Score must be between 1 and 45'
      )
    }

    score.value = updates.value
  }

  if (updates.note !== undefined) {
    score.note = updates.note
  }

  if (updates.date !== undefined) {
    const newDate = new Date(updates.date)

    newDate.setHours(0, 0, 0, 0)

    const conflict = await Score.findOne({
      user: userId,
      date: newDate,
      _id: { $ne: scoreId }
    })

    if (conflict) {
      throw new Error(
        'A score already exists for this date'
      )
    }

    score.date = newDate
  }

  await score.save()

  return score
}
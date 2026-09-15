const Winner = require('../models/Winner');
const path = require('path');
const fs = require('fs');

exports.listWinners = async (req, res) => {
  try {
    const { status, matchType } = req.query;
    let query = {};

    if (status) query['verification.status'] = status;
    if (matchType) query.matchType = matchType;

    const winners = await Winner.find(query)
      .populate('user', 'name email')
      .populate('draw', 'month year winningNumbers status')
      .sort({ createdAt: -1 });

    res.json({ success: true, winners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyWinnings = async (req, res) => {
  try {
    const winners = await Winner.find({ user: req.user._id })
      .populate('draw', 'month year winningNumbers status publishedAt')
      .sort({ createdAt: -1 });

    const totalWon = winners
      .filter(w => w.verification.status === 'approved')
      .reduce((sum, w) => sum + (w.prizeAmount || 0), 0);

    const pendingPayout = winners
      .filter(
        w =>
          w.verification.status === 'approved' &&
          w.payout.status === 'pending'
      )
      .reduce((sum, w) => sum + (w.prizeAmount || 0), 0);

    const paid = winners
      .filter(w => w.payout.status === 'paid')
      .reduce((sum, w) => sum + (w.prizeAmount || 0), 0);

    res.json({
      success: true,
      winners,
      summary: {
        totalWon,
        pendingPayout,
        paid
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.uploadProof = async (req, res) => {
  try {
    const winner = await Winner.findById(req.params.id);

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: 'Winner record not found'
      });
    }

    if (winner.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not your winning record'
      });
    }

    if (!['pending_proof', 'rejected'].includes(winner.verification.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot upload proof when status is ${winner.verification.status}`
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Proof image is required'
      });
    }

    if (winner.verification.proofImage) {
      const oldPath = path.join(
        __dirname,
        '../../uploads',
        path.basename(winner.verification.proofImage)
      );

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    winner.verification.proofImage = `/uploads/${req.file.filename}`;
    winner.verification.proofSubmittedAt = new Date();
    winner.verification.status = 'proof_submitted';
    winner.verification.rejectionReason = undefined;

    await winner.save();

    res.json({
      success: true,
      message: 'Proof uploaded. Waiting for admin review.',
      winner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.verifyWinner = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be approve or reject'
      });
    }

    const winner = await Winner.findById(req.params.id)
      .populate('user', 'name email');

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: 'Winner not found'
      });
    }

    if (winner.verification.status !== 'proof_submitted') {
      return res.status(400).json({
        success: false,
        message: 'Proof must be submitted before verification'
      });
    }

    if (action === 'approve') {
      winner.verification.status = 'approved';
      winner.verification.rejectionReason = undefined;
      winner.payout.status = 'pending';
    } else {
      if (!rejectionReason || !rejectionReason.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
      }

      winner.verification.status = 'rejected';
      winner.verification.rejectionReason = rejectionReason.trim();
    }

    winner.verification.reviewedBy = req.user._id;
    winner.verification.reviewedAt = new Date();

    await winner.save();

    res.json({
      success: true,
      message: action === 'approve'
        ? 'Winner approved'
        : 'Proof rejected',
      winner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.markPayout = async (req, res) => {
  try {
    const { transactionId, notes } = req.body;

    const winner = await Winner.findById(req.params.id)
      .populate('user', 'name email');

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: 'Winner not found'
      });
    }

    if (winner.verification.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved winners can be paid'
      });
    }

    if (winner.payout.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Already marked as paid'
      });
    }

    winner.payout.status = 'paid';
    winner.payout.paidAt = new Date();
    winner.payout.transactionId = transactionId || undefined;
    winner.payout.notes = notes || undefined;

    await winner.save();

    res.json({
      success: true,
      message: 'Payout marked as paid',
      winner
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
const express = require('express');
const router = express.Router();
const { getAll, runQuery } = require('../database');
const summaryGenerator = require('../services/summaryGenerator');
const emailService = require('../services/emailService');

// Generate summary for transcript (manual trigger)
router.post('/:transcriptId/generate', async (req, res, next) => {
  try {
    const messages = await getAll('SELECT * FROM transcript_messages WHERE transcript_id = ? ORDER BY timestamp_ms ASC', [req.params.transcriptId]);
    const summaryText = summaryGenerator.generate(messages);

    const result = await runQuery('INSERT INTO meeting_summary (transcript_id, summary_text) VALUES (?, ?)', [req.params.transcriptId, summaryText]);

    // send summary email to attendees
    emailService.sendSummaryToTranscriptAttendees(req.params.transcriptId, summaryText).catch(err => console.error('Email summary error', err));

    res.json({ success: true, data: { id: result.id, summary: summaryText } });
  } catch (error) { next(error); }
});

// Get latest summary for a transcript
router.get('/:transcriptId', async (req, res, next) => {
  try {
    const rows = await getAll('SELECT * FROM meeting_summary WHERE transcript_id = ? ORDER BY created_at DESC LIMIT 1', [req.params.transcriptId]);
    res.json({ success: true, data: rows[0] || null });
  } catch (error) { next(error); }
});

module.exports = router;

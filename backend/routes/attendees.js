const express = require('express');
const router = express.Router();
const { runQuery, getAll } = require('../database');

// Add attendees for a transcript
router.post('/:transcriptId', async (req, res, next) => {
  try {
    const { attendees } = req.body; // [{name, email}, ...]
    if (!Array.isArray(attendees)) return res.status(400).json({ success: false, error: 'attendees must be array' });

    const inserted = [];
    for (const a of attendees) {
      const result = await runQuery(
        'INSERT INTO attendees (transcript_id, name, email) VALUES (?, ?, ?)',
        [req.params.transcriptId, a.name, a.email]
      );
      inserted.push({ id: result.id, ...a });
    }
    res.status(201).json({ success: true, data: inserted });
  } catch (error) { next(error); }
});

// Get attendees for a transcript
router.get('/:transcriptId', async (req, res, next) => {
  try {
    const rows = await getAll('SELECT * FROM attendees WHERE transcript_id = ?', [req.params.transcriptId]);
    res.json({ success: true, data: rows });
  } catch (error) { next(error); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { runQuery, getOne, getAll } = require('../database');
const { validateTranscript } = require('../middleware/validation');

router.post('/', validateTranscript, async (req, res, next) => {
  try {
    const { title, speaker_count, language, detection_mode } = req.body;
    const result = await runQuery(
      'INSERT INTO transcripts (title, speaker_count, language, detection_mode) VALUES (?, ?, ?, ?)',
      [title || 'Untitled', speaker_count, language, detection_mode]
    );
    res.status(201).json({ success: true, data: { id: result.id } });
  } catch (error) { next(error); }
});

router.post('/:id/messages', async (req, res, next) => {
  try {
    const { speaker_name, message_text, timestamp_ms, confidence_score } = req.body;
    const result = await runQuery(
      'INSERT INTO transcript_messages (transcript_id, speaker_name, message_text, timestamp_ms, confidence_score) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, speaker_name, message_text, timestamp_ms || 0, confidence_score || 0]
    );
    res.status(201).json({ success: true, data: { message_id: result.id } });
  } catch (error) { next(error); }
});

router.get('/:id/messages', async (req, res, next) => {
  try {
    const messages = await getAll(
      'SELECT * FROM transcript_messages WHERE transcript_id = ? ORDER BY timestamp_ms ASC',
      [req.params.id]
    );
    res.json({ success: true, data: messages });
  } catch (error) { next(error); }
});

module.exports = router;

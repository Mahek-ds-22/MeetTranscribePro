const express = require('express');
const router = express.Router();
const { runQuery, getAll } = require('../database');
const taskManager = require('../services/taskManager');
const emailService = require('../services/emailService');

// Create tasks (bulk)
router.post('/:transcriptId', async (req, res, next) => {
  try {
    const { tasks } = req.body; // [{ attendee_id, task_text, due_date }, ...]
    if (!Array.isArray(tasks)) return res.status(400).json({ success: false, error: 'tasks must be array' });

    const created = [];
    for (const t of tasks) {
      const result = await runQuery(
        'INSERT INTO tasks (transcript_id, attendee_id, task_text, due_date) VALUES (?, ?, ?, ?)',
        [req.params.transcriptId, t.attendee_id, t.task_text, t.due_date || null]
      );
      const taskObj = { id: result.id, transcript_id: parseInt(req.params.transcriptId), ...t };
      created.push(taskObj);
      // send email per task (async)
      emailService.sendTaskEmail(t.attendee_id, taskObj).catch(err => console.error('Email error', err));
    }

    res.status(201).json({ success: true, data: created });
  } catch (error) { next(error); }
});

// List tasks for transcript
router.get('/:transcriptId', async (req, res, next) => {
  try {
    const tasks = await getAll(`
      SELECT t.*, a.name as attendee_name, a.email as attendee_email
      FROM tasks t
      LEFT JOIN attendees a ON t.attendee_id = a.id
      WHERE t.transcript_id = ?
      ORDER BY t.created_at DESC
    `, [req.params.transcriptId]);

    res.json({ success: true, data: tasks });
  } catch (error) { next(error); }
});

module.exports = router;

// Small helper wrapper for task creation & updates.
// For demo we just expose a createTask helper.

const { runQuery, getOne } = require('../database');

async function createTask(transcriptId, attendeeId, taskText, dueDate) {
  const result = await runQuery(
    'INSERT INTO tasks (transcript_id, attendee_id, task_text, due_date) VALUES (?, ?, ?, ?)',
    [transcriptId, attendeeId, taskText, dueDate]
  );
  return { id: result.id, transcript_id: transcriptId, attendee_id: attendeeId, task_text: taskText, due_date: dueDate };
}

module.exports = { createTask };

const nodemailer = require('nodemailer');
const { getAll } = require('../database');

// configure transporter from env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: (process.env.SMTP_SECURE === 'true'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

async function sendMail(to, subject, html, text) {
  const from = process.env.EMAIL_FROM || 'MeetTranscribe <no-reply@example.com>';
  const mail = { from, to, subject, text: text || '', html: html || undefined };
  return transporter.sendMail(mail);
}

async function sendSummaryToTranscriptAttendees(transcriptId, summaryText) {
  const attendees = await getAll('SELECT * FROM attendees WHERE transcript_id = ?', [transcriptId]);
  const subject = `Meeting Summary (transcript #${transcriptId})`;
  const html = `<p>Hi,</p><p>Here is the meeting summary:</p><pre>${escapeHtml(summaryText)}</pre><p>— MeetTranscribe</p>`;
  const text = `Meeting Summary:\n\n${summaryText}`;
  const results = [];
  for (const a of attendees) {
    try {
      const r = await sendMail(a.email, subject, html, text);
      results.push({ email: a.email, accepted: r.accepted });
    } catch (err) {
      console.error('Failed to send summary to', a.email, err);
      results.push({ email: a.email, error: err.message });
    }
  }
  return results;
}

// send task email to a single attendee by attendee_id (fetch attendee)
async function sendTaskEmail(attendeeId, taskObj) {
  const rows = await getAll('SELECT * FROM attendees WHERE id = ?', [attendeeId]);
  const attendee = rows[0];
  if (!attendee) throw new Error('Attendee not found');

  const subject = `New Task Assigned: ${shorten(taskObj.task_text, 60)}`;
  const html = `<p>Hi ${escapeHtml(attendee.name || '')},</p>
    <p>You have been assigned a new task:</p>
    <p><strong>${escapeHtml(taskObj.task_text)}</strong></p>
    <p>Due: ${taskObj.due_date || 'No due date'}</p>
    <p>— MeetTranscribe</p>`;
  const text = `Task: ${taskObj.task_text}\nDue: ${taskObj.due_date || 'No due date'}`;

  try {
    const r = await sendMail(attendee.email, subject, html, text);
    return { email: attendee.email, accepted: r.accepted };
  } catch (err) {
    console.error('Failed to send task email to', attendee.email, err);
    throw err;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"]/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[s]));
}
function shorten(s, n) { return s && s.length > n ? s.slice(0, n-1) + '…' : s; }

module.exports = { sendMail, sendSummaryToTranscriptAttendees, sendTaskEmail };

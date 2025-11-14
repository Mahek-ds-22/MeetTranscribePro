// Simple rule-based summary generator (placeholder).
// Replace with an AI summarizer or more advanced NLP later.

function generate(messages) {
  if (!messages || messages.length === 0) return 'No content to summarize.';
  // Approach: collect the first sentence of important messages and top speakers
  const bySpeaker = {};
  messages.forEach(m => {
    const s = m.speaker_name || 'Unknown';
    bySpeaker[s] = (bySpeaker[s] || 0) + 1;
  });
  // top 3 speakers
  const topSpeakers = Object.entries(bySpeaker).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);

  // collect up to 5 longest messages as "important"
  const sorted = [...messages].sort((a,b)=> (b.message_text?.length||0) - (a.message_text?.length||0));
  const highlights = sorted.slice(0,5).map(m => `${m.speaker_name || 'Unknown'}: ${shorten(m.message_text || '', 300)}`);

  const summary = [
    `Participants (top): ${topSpeakers.join(', ')}`,
    '',
    'Highlights:',
    ...highlights,
    '',
    `Generated on ${new Date().toISOString()}`
  ].join('\n');

  return summary;
}

function shorten(s, n) { return s && s.length > n ? s.slice(0, n-1) + '…' : s; }

module.exports = { generate };

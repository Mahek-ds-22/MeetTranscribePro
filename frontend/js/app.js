document.addEventListener('DOMContentLoaded', () => {
  const applyBtn = document.getElementById('apply-config-btn');
  const configPanel = document.getElementById('config-panel');
  const calPanel = document.getElementById('calibration-panel');
  const recPanel = document.getElementById('recording-panel');
  const resPanel = document.getElementById('results-panel');

  applyBtn.addEventListener('click', () => {
    configPanel.style.display='none';
    calPanel.style.display='block';
    // quick populate speaker cards
    const speakerCount = parseInt(document.getElementById('speaker-count').value || '2',10);
    const container = document.getElementById('speaker-cards');
    container.innerHTML='';
    for(let i=0;i<speakerCount;i++){
      const div=document.createElement('div');
      div.textContent=`Speaker ${i+1} - calibrate (demo)`;
      div.style.padding='8px';
      div.style.border='1px solid #eee';
      div.style.margin='6px 0';
      container.appendChild(div);
    }
  });

  document.getElementById('goto-recording').addEventListener('click', ()=>{
    document.getElementById('calibration-panel').style.display='none';
    recPanel.style.display='block';
  });

  // start/stop recording buttons: demo uses fake messages
  document.getElementById('start-recording-btn').addEventListener('click', ()=>{
    document.getElementById('start-recording-btn').disabled=true;
    document.getElementById('stop-recording-btn').disabled=false;
    window.fakeInterval = setInterval(()=> {
      // post a fake message to server
      const text = ['Update on feature','We need to ship this','Action item: Follow up','Decision made: proceed'][Math.floor(Math.random()*4)];
      fetch('/api/transcripts', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({title:'Demo',speaker_count:2,language:'en-US',detection_mode:'automatic'})})
        .then(r=>r.json()).then(resp=>{
          const tid = resp.data.id;
          // add message
          fetch(`/api/transcripts/${tid}/messages`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({speaker_name:'Speaker 1', message_text: text, timestamp_ms: Date.now()})});
          // display locally
          const el = document.getElementById('transcript-live');
          const msg = document.createElement('div'); msg.textContent = `Speaker 1: ${text}`; msg.style.padding='6px'; msg.style.borderBottom='1px solid #eee';
          el.appendChild(msg);
        });
    }, 2500);
  });

  document.getElementById('stop-recording-btn').addEventListener('click', ()=>{
    clearInterval(window.fakeInterval);
    document.getElementById('stop-recording-btn').disabled=true;
    document.getElementById('start-recording-btn').disabled=false;
    resPanel.style.display='block';
  });

  // buttons for summary/attendees/tasks wired to summaryUI/tasksUI
  document.getElementById('generate-summary-btn').addEventListener('click', async () => {
    // For demo simply generate summary for transcript id 1 (if exists)
    const id = 1;
    const resp = await fetch(`/api/summary/${id}/generate`, {method:'POST'});
    const json = await resp.json();
    alert('Summary generated (check console).');
    console.log(json);
  });

  document.getElementById('manage-attendees-btn').addEventListener('click', ()=> {
    document.getElementById('attendees-modal').style.display='block';
  });

  document.getElementById('save-attendees-btn').addEventListener('click', async () => {
    const raw = document.getElementById('attendees-input').value.trim();
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const arr = lines.map(l => {
      const [name,email] = l.split(',').map(s => s.trim());
      return { name, email };
    });
    const transcriptId = 1;
    await fetch(`/api/attendees/${transcriptId}`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({attendees: arr})});
    document.getElementById('attendees-modal').style.display='none';
    alert('Attendees saved');
  });

  document.getElementById('assign-tasks-btn').addEventListener('click', ()=> {
    document.getElementById('tasks-modal').style.display='block';
  });

  document.getElementById('save-tasks-btn').addEventListener('click', async () => {
    const raw = document.getElementById('tasks-input').value.trim();
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const tasks = lines.map(l => {
      const [attendee_id, task_text, due_date] = l.split(',').map(s=>s.trim());
      return { attendee_id: parseInt(attendee_id,10), task_text, due_date: due_date || null };
    });
    const transcriptId = 1;
    await fetch(`/api/tasks/${transcriptId}`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({tasks})});
    document.getElementById('tasks-modal').style.display='none';
    alert('Tasks created and emails triggered (if SMTP configured).');
  });
});

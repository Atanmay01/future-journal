const prompts = [
    "What did you learn today?",
    "What advice would you give your younger self?",
    "Describe a moment you're proud of.",
    "Where do you want to be one year from now?",
    "What do you fear most—and why?"
  ];
  
  function newPrompt() {
    const prompt = prompts[Math.floor(Math.random() * prompts.length)];
    document.getElementById("prompt").textContent = prompt;
  }
  
  newPrompt();
  
  document.getElementById('toggle-dark').onclick = () => {
    document.body.classList.toggle('dark');
  };
  
  let mediaRecorder, audioChunks = [];
  const recordBtn = document.getElementById('recordBtn');
  const audioPlayer = document.getElementById('audioPlayer');
  
  recordBtn.addEventListener('click', async () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      recordBtn.textContent = "🎙 Start Recording";
      return;
    }
  
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];
  
    mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      audioPlayer.src = url;
      audioPlayer.style.display = "block";
    };
  
    mediaRecorder.start();
    recordBtn.textContent = "⏹ Stop Recording";
  });
  
  function saveEntry() {
    const text = document.getElementById('entry').value.trim();
    const dateStr = document.getElementById('customDate').value;
    const direction = document.getElementById('direction').value;
    const deliveryDate = new Date(dateStr);
  
    if (!text && !audioPlayer.src) {
      alert('Please enter some text or record a voice note.');
      return;
    }
  
    const entry = {
      text,
      audio: audioPlayer.src || null,
      showOn: deliveryDate.toISOString(),
      direction
    };
  
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    entries.push(entry);
    localStorage.setItem('journalEntries', JSON.stringify(entries));
  
    alert('Entry saved!');
    document.getElementById('entry').value = '';
    audioPlayer.style.display = 'none';
    audioPlayer.src = '';
    displayEntries();
  }
  
  function displayEntries() {
    const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    const container = document.getElementById('entries');
    const count = document.getElementById('entryCount');
    container.innerHTML = '';
  
    const now = new Date();
    let shown = 0;
  
    entries.forEach(e => {
      const showDate = new Date(e.showOn);
      const shouldShow = (e.direction === 'future' && now >= showDate) ||
                         (e.direction === 'past' && now <= showDate);
  
      if (shouldShow) {
        const div = document.createElement('div');
        div.className = 'entry';
        div.innerHTML = `
          <strong>${e.direction === 'future' ? 'From the Past You' : 'To Your Past Self'}</strong><br>
          <p>${e.text}</p>
          ${e.audio ? `<audio controls src="${e.audio}"></audio>` : ''}
          <small>Scheduled for: ${new Date(e.showOn).toDateString()}</small>
        `;
        container.appendChild(div);
        shown++;
      }
    });
  
    count.textContent = entries.length;
  }
  
  window.onload = displayEntries;
  
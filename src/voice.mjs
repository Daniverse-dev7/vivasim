// Recordings stay in memory and are discarded when the question changes or page closes.
export function setupVoice() {
  const record = document.getElementById('voice-record');
  const stop = document.getElementById('voice-stop');
  const discard = document.getElementById('voice-discard');
  const playback = document.getElementById('voice-playback');
  const status = document.getElementById('voice-status');
  const speak = document.getElementById('voice-speak');
  let recorder, stream, url, timer;
  let generation = 0;
  let pending = false;
  const supported = !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
  record.disabled = !supported;
  if (!supported) status.textContent = 'Recording is unavailable in this browser. You can still practice aloud and type your answer.';
  speak.disabled = !('speechSynthesis' in window);
  function release() { stream?.getTracks().forEach(track => track.stop()); stream = null; clearTimeout(timer); }
  function reset() {
    generation++;
    if (recorder?.state === 'recording') recorder.stop();
    recorder = null;
    release();
    if (url) URL.revokeObjectURL(url);
    url = null;
    playback.removeAttribute('src'); playback.hidden = true;
    stop.disabled = true; discard.disabled = true; record.disabled = !supported || pending;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    status.textContent = supported ? 'Record up to three minutes. Audio stays in this tab; type your answer for feedback.' : 'Recording is unavailable in this browser.';
  }
  record.addEventListener('click', async () => {
    reset();
    const current = generation;
    pending = true; record.disabled = true;
    try {
      const acquired = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (current !== generation) { acquired.getTracks().forEach(track => track.stop()); return; }
      stream = acquired;
      const chunks = [];
      const instance = new MediaRecorder(stream);
      recorder = instance;
      instance.addEventListener('dataavailable', e => { if (e.data.size) chunks.push(e.data); });
      instance.addEventListener('stop', () => {
        if (current !== generation) return;
        release();
        url = URL.createObjectURL(new Blob(chunks, { type: instance.mimeType }));
        playback.src = url; playback.hidden = false;
        stop.disabled = true; record.disabled = false; discard.disabled = false;
        status.textContent = 'Listen to your answer, then type its main points below for feedback. Audio is not transcribed or scored.';
      });
      instance.addEventListener('error', () => { reset(); status.textContent = 'Recording failed. Try again or type your answer.'; });
      instance.start();
      stop.disabled = false;
      status.textContent = 'Recording… Stops automatically after three minutes.';
      timer = setTimeout(() => { if (instance.state === 'recording') instance.stop(); }, 180000);
    } catch (error) {
      release();
      const reasons = {
        NotAllowedError: 'Microphone access was unavailable. Allow microphone access in browser settings or type your answer.',
        NotFoundError: 'No microphone was found. Connect one or type your answer.',
        NotReadableError: 'The microphone is busy or unavailable. Close other recording apps or type your answer.',
        NotSupportedError: 'Audio recording is unsupported in this browser. Try another browser or type your answer.',
        SecurityError: 'Microphone access is blocked by browser security settings. You can type your answer.'
      };
      status.textContent = reasons[error?.name] || 'Microphone access was unavailable. Check browser permissions or type your answer.';
    }
    finally { pending = false; if (recorder?.state !== 'recording') record.disabled = !supported; }
  });
  stop.addEventListener('click', () => { if (recorder?.state === 'recording') recorder.stop(); });
  discard.addEventListener('click', reset);
  speak.addEventListener('click', () => {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(document.getElementById('question').textContent);
    // Use a local voice only; never send the report excerpt to a remote speech service.
    const local = speechSynthesis.getVoices().find(voice => voice.localService && voice.lang.startsWith('en'));
    if (!local) { status.textContent = 'No local English voice is available on this device. Read the question on screen.'; return; }
    utterance.voice = local;
    speechSynthesis.speak(utterance);
  });
  window.addEventListener('pagehide', reset);
  return reset;
}

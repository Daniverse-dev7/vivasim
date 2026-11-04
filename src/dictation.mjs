// Speech recognition may use the browser vendor's remote service. Consent is per question.
export function setupDictation(resetVoice) {
  const $ = id => document.getElementById(id);
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const consent = $('dictation-consent'), start = $('dictation-start'), stop = $('dictation-stop');
  const preview = $('dictation-preview'), apply = $('dictation-apply'), status = $('dictation-status');
  let recognition = null, generation = 0, timer;
  let restoreControls = () => {};
  function controls() {
    start.disabled = !Recognition || !consent.checked || !!recognition;
    stop.disabled = !recognition;
    preview.disabled = !!recognition;
    apply.disabled = !!recognition || !preview.value.trim();
  }
  function release() {
    clearTimeout(timer);
    restoreControls(); restoreControls = () => {};
    recognition = null;
    controls();
  }
  function abort() {
    generation++;
    const current = recognition;
    release();
    try { current?.abort(); } catch { /* Already stopped by browser. */ }
  }
  function reset() {
    abort(); consent.checked = false; preview.value = '';
    status.textContent = Recognition ? 'Optional: dictate, review the transcript, then add it to your answer.' : 'Speech-to-text is unavailable in this browser. Recording and typed answers remain available.';
    controls();
  }
  start.addEventListener('click', () => {
    if (!Recognition || !consent.checked || recognition) return;
    if (preview.value && !confirm('Replace the current transcript preview? Your answer below will be kept.')) return;
    resetVoice();
    preview.value = '';
    const token = ++generation;
    const segments = new Map();
    let failed = false;
    try {
      const instance = new Recognition();
      recognition = instance;
      instance.lang = 'en-US'; instance.continuous = true; instance.interimResults = false;
      const mediaButtons = [$('voice-record'), $('voice-speak')];
      const disabled = mediaButtons.map(button => button.disabled);
      mediaButtons.forEach(button => { button.disabled = true; });
      restoreControls = () => mediaButtons.forEach((button, i) => { button.disabled = disabled[i]; });
      instance.onresult = event => {
        if (token !== generation || !consent.checked) return;
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) segments.set(i, String(event.results[i][0].transcript));
        }
        preview.value = [...segments.values()].join(' ').slice(0, 5000);
        if (preview.value.length >= 5000) { status.textContent = 'Transcript reached the 5,000-character limit. Review it before adding.'; instance.stop(); }
      };
      instance.onerror = event => {
        if (token !== generation) return;
        failed = true;
        status.textContent = event.error === 'not-allowed' || event.error === 'service-not-allowed'
          ? 'Speech permission was denied. You can type your answer or use local recording.'
          : 'Speech recognition is unavailable or interrupted. Review any captured text, or type your answer.';
        abort();
      };
      instance.onend = () => {
        if (token !== generation) return;
        release();
        if (!failed) status.textContent = preview.value ? 'Review and correct the transcript before adding it to your answer.' : 'No speech was captured. Try again or type your answer.';
      };
      controls(); instance.start();
      status.textContent = 'Listening in English… Stops after three minutes. Your browser may send audio to its speech service.';
      timer = setTimeout(() => { if (token === generation) { instance.stop(); } }, 180000);
    } catch { abort(); status.textContent = 'Speech recognition could not start. Try again or type your answer.'; }
  });
  stop.addEventListener('click', () => {
    // Invalidate late events immediately; retain only text already visible for review.
    abort(); status.textContent = 'Stopped. Review the captured transcript before adding it.';
  });
  consent.addEventListener('change', () => { if (!consent.checked) { abort(); status.textContent = 'Speech recognition stopped. Consent is required to restart.'; } controls(); });
  preview.addEventListener('input', controls);
  apply.addEventListener('click', () => {
    if (recognition || !preview.value.trim()) return;
    const answer = $('answer');
    answer.value = [answer.value.trim(), preview.value.trim()].filter(Boolean).join('\n\n');
    answer.dispatchEvent(new Event('input', { bubbles: true }));
    preview.value = ''; controls(); answer.focus();
    status.textContent = 'Transcript added. Edit your answer before submitting for heuristic feedback.';
  });
  window.addEventListener('pagehide', reset);
  window.addEventListener('vivasim-local-voice', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { abort(); status.textContent = 'Dictation stopped when you left the tab. Review captured text before restarting.'; } });
  reset();
  return reset;
}

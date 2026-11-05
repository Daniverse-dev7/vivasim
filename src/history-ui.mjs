import { listSessions, deleteSession, clearSessions } from './history.mjs';
import { summarize, feedbackLines } from './engine.mjs';
export function downloadSession(session) {
  const url = URL.createObjectURL(new Blob([JSON.stringify({app:'VivaSim',...session}, null, 2)], {type:'application/json'}));
  const link = document.createElement('a'); link.href = url; link.download = 'vivasim-session.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function setupHistory() {
  const list = document.getElementById('history-list');
  const notice = document.getElementById('history-status');
  const detail = document.getElementById('history-detail');
  let revision = 0;
  function node(tag, text) { const element = document.createElement(tag); element.textContent = text; return element; }
  function button(text, fn) { const element = node('button', text); element.className = 'ghost'; element.addEventListener('click', fn); return element; }
  function show(session) {
    detail.replaceChildren(node('h3', session.title || 'Saved practice session'), node('p', new Date(session.completedAt).toLocaleString()));
    for (const answer of session.answers) {
      const article = node('article', ''); article.className = 'review-item';
      article.append(node('h4', session.questions[answer.questionIndex]), node('p', answer.answer || '(Skipped)'), node('p', `Practice heuristic: ${answer.score}/100 · ${answer.wordCount} words`));
      const guidance = node('ul', '');
      for (const text of feedbackLines(answer)) guidance.append(node('li', text));
      article.append(guidance); detail.append(article);
    }
    detail.append(button('Close saved session', () => { detail.hidden = true; }));
    detail.hidden = false; detail.focus();
  }
  async function refresh() {
    const current = ++revision;
    try {
      const sessions = await listSessions();
      if (current !== revision) return;
      list.replaceChildren();
      notice.textContent = sessions.length ? `${sessions.length} / 50 sessions saved on this device.` : 'No saved sessions yet.';
      for (const session of sessions) {
        const card = node('article', ''); card.className = 'review-item';
        card.append(node('h3', session.title || 'Practice session'), node('p', `${new Date(session.completedAt).toLocaleString()} · ${session.answers.length}/5 questions · heuristic ${summarize(session.answers).score}/100`));
        const actions = node('div', ''); actions.className = 'actions';
        actions.append(button('View saved session', () => show(session)), button('Export saved session', () => downloadSession(session)), button('Delete saved session', async () => {
          if (!confirm('Delete this saved session from this device? The current practice draft is separate.')) return;
          try { await deleteSession(session.id); detail.hidden = true; await refresh(); }
          catch (error) { notice.textContent = error.message; }
        }));
        card.append(actions); list.append(card);
      }
    } catch (error) { if (current === revision) notice.textContent = error.message; }
  }
  document.getElementById('history-refresh').addEventListener('click', refresh);
  document.getElementById('history-clear').addEventListener('click', async () => {
    if (!confirm('Delete all saved sessions from this device? Export any sessions you want to keep first.')) return;
    try { await clearSessions(); detail.hidden = true; await refresh(); }
    catch (error) { notice.textContent = error.message; }
  });
  void refresh();
  return refresh;
}

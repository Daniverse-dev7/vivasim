const DB = 'vivasim-history-v1';
const STORE = 'sessions';
export const SESSION_LIMIT = 50;
let connection;
let queue = Promise.resolve();

export function sessionSnapshot(state) {
  if (!state.results?.length) throw new Error('Answer at least one question before saving a session.');
  const session = {
    id: state.sessionId,
    completedAt: state.completedAt,
    title: typeof state.project?.title === 'string' ? state.project.title.slice(0, 160) : '',
    questions: state.questions,
    answers: state.results.map(({questionIndex, answer, score, wordCount}) => ({questionIndex, answer, score, wordCount})),
    mode: 'offline heuristic practice',
  };
  if (!validSession(session) || JSON.stringify(session).length > 250000) throw new Error('This session is too large or invalid for history. Export the current results instead.');
  return structuredClone(session);
}
function validSession(s) {
  return s && typeof s.id === 'string' && s.id.length <= 100 && typeof s.completedAt === 'string' && Number.isFinite(Date.parse(s.completedAt)) && typeof s.title === 'string' && s.title.length <= 160 && Array.isArray(s.questions) && s.questions.length === 5 && s.questions.every(q => typeof q === 'string') && Array.isArray(s.answers) && s.answers.length > 0 && s.answers.length <= 5 && s.answers.every(a => a && Number.isInteger(a.questionIndex) && a.questionIndex >= 0 && a.questionIndex < 5 && typeof a.answer === 'string' && Number.isFinite(a.score) && a.score >= 0 && a.score <= 100 && Number.isFinite(a.wordCount));
}
function open() {
  if (!connection) connection = new Promise((resolve, reject) => {
    let request;
    try { request = indexedDB.open(DB, 1); } catch { reject(new Error('History storage is unavailable. Export your results before leaving.')); return; }
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, {keyPath:'id'});
    request.onerror = () => reject(new Error('History storage is unavailable. Export your results before leaving.'));
    request.onblocked = () => reject(new Error('Close other VivaSim tabs and retry history storage.'));
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => { db.close(); connection = undefined; };
      resolve(db);
    };
  }).catch(error => { connection = undefined; throw error; });
  return connection;
}
// Serialize writes, reads and clear operations, including while the DB is opening.
function transaction(mode, action) {
  const operation = queue.then(async () => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      let result, failure;
      tx.oncomplete = () => resolve(result);
      tx.onerror = tx.onabort = () => reject(failure || new Error('History could not be saved or read. Export your results and check browser storage.'));
      action(tx.objectStore(STORE), value => { result = value; }, message => { failure = new Error(message); tx.abort(); });
    });
  });
  queue = operation.catch(() => {});
  return operation;
}
export function saveSession(session) {
  if (!validSession(session) || JSON.stringify(session).length > 250000) return Promise.reject(new Error('Invalid session.'));
  return transaction('readwrite', (store, done, fail) => {
    const existing = store.get(session.id);
    existing.onsuccess = () => {
      const count = store.count();
      count.onsuccess = () => {
        if (!existing.result && count.result >= SESSION_LIMIT) { fail('History is full (50 sessions). Export or delete an older session, then save again.'); return; }
        store.put(session); done(session.id);
      };
    };
  });
}
export function listSessions() {
  return transaction('readonly', (store, done) => {
    const request = store.getAll();
    request.onsuccess = () => done(request.result.filter(validSession).sort((a,b) => b.completedAt.localeCompare(a.completedAt)));
  });
}
export function deleteSession(id) { return transaction('readwrite', store => { store.delete(id); }); }
export function clearSessions() { return transaction('readwrite', store => { store.clear(); }); }

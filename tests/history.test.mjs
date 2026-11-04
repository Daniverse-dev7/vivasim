import test from 'node:test';
import assert from 'node:assert/strict';
import { sessionSnapshot } from '../src/history.mjs';
const state = {sessionId:'session-1', completedAt:'2026-11-04T12:00:00Z', project:{title:'Synthetic project'}, report:'PRIVATE RAW REPORT', questions:['A','B','C','D','E'], results:[{questionIndex:0,answer:'Synthetic answer',score:50,wordCount:2}], answerDraft:'UNSUBMITTED'};
test('history snapshots omit raw reports, unfinished drafts and extra fields', () => {
  const snapshot = sessionSnapshot(state);
  assert.equal(snapshot.title, 'Synthetic project');
  assert.equal('report' in snapshot, false);
  assert.equal('answerDraft' in snapshot, false);
  snapshot.answers[0].answer = 'Changed';
  assert.equal(state.results[0].answer, 'Synthetic answer');
});
test('history rejects invalid or oversized results instead of silently truncating', () => {
  assert.throws(() => sessionSnapshot({...state,results:[]}), /at least/);
  assert.throws(() => sessionSnapshot({...state,results:[{...state.results[0],answer:'a'.repeat(250001)}]}), /too large/);
  assert.throws(() => sessionSnapshot({...state,results:[{...state.results[0],questionIndex:6}]}), /invalid/);
});

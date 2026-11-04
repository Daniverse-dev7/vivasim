import test from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../app/api/analyze/route';

test('streamed requests enforce a byte cap without a Content-Length header', async () => {
  const response = await POST(new Request('http://localhost/api/analyze', {method:'POST', body:'x'.repeat(500001)}));
  assert.equal(response.status, 413);
});
test('stalled request bodies time out and release their active slot', async () => {
  let canceled = false;
  const body = new ReadableStream<Uint8Array>({cancel() { canceled = true; }});
  const req = new Request('http://localhost/api/analyze', {method:'POST', body, duplex:'half'} as RequestInit);
  assert.equal((await POST(req)).status, 408);
  assert.equal(canceled, true);
  const next = await POST(new Request('http://localhost/api/analyze', {method:'POST', body:'{}'}));
  assert.equal(next.status, 400);
});

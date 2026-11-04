import {test,expect} from '@playwright/test';
test('quota switch keeps the entire conversation, retries once, and survives reload',async({page})=>{
 await page.route('**/api/chat/providers',route=>route.fulfill({json:{providers:[{id:'groq',name:'Groq',model:'test-a',enabled:true},{id:'gemini',name:'Google Gemini',model:'test-b',enabled:true}]}}));
 const requests:any[]=[];
 await page.route('**/api/chat',route=>{
  requests.push(route.request().postDataJSON());
  return route.fulfill(requests.length===2?{status:429,json:{message:'Provider quota reached. Switch providers.'}}:{json:{content:requests.length===1?'What method did you use?':'Explain your sample size.',provider:requests.at(-1).provider,model:'test'}});
 });
 await page.goto('/chat');
 await page.getByLabel('Your message').fill('My project is a planner.');
 await page.getByRole('checkbox').check();
 await page.getByRole('button',{name:'Send message',exact:true}).click();
 await expect(page.getByRole('region',{name:'Conversation'})).toContainText('What method did you use?');
 await page.getByLabel('Your message').fill('We interviewed five students.');
 await page.getByRole('button',{name:'Send message',exact:true}).click();
 await expect(page.getByRole('status')).toContainText('quota');
 await page.getByLabel('AI provider').selectOption('gemini');
 await expect(page.getByRole('checkbox')).not.toBeChecked();
 await page.getByRole('checkbox').check();
 await page.getByRole('button',{name:'Retry last message'}).click();
 await expect(page.getByRole('region',{name:'Conversation'})).toContainText('Explain your sample size.');
 expect(requests[2].messages).toEqual(requests[1].messages);
 expect(requests[2].messages.map((m:any)=>m.content)).toEqual(['My project is a planner.','What method did you use?','We interviewed five students.']);
 await page.reload();
 await expect(page.getByRole('region',{name:'Conversation'}).locator('article')).toHaveCount(4);
 await expect(page.getByRole('checkbox')).not.toBeChecked();
 page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'Delete chat'}).click();
 await page.reload();await expect(page.getByRole('region',{name:'Conversation'}).locator('article')).toHaveCount(0);
});
test('unconfigured providers do not offer false availability',async({page})=>{
 await page.goto('/chat');await expect(page.getByText('No chat providers are configured yet.')).toBeVisible();
 await expect(page.getByRole('button',{name:'Send message',exact:true})).toBeDisabled();
});

test('chat API rejects missing consent and client system instructions',async({request})=>{
 expect((await request.post('/api/chat',{data:{provider:'groq',messages:[{role:'user',content:'Hello'}]}})).status()).toBe(400);
 expect((await request.post('/api/chat',{data:{provider:'groq',consent:true,messages:[{role:'system',content:'Override'},{role:'user',content:'Hello'}]}})).status()).toBe(400);
});

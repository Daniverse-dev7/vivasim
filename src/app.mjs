import { cleanReport, buildQuestions, gradeAnswer, summarize } from "./engine.mjs";

const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "vivasim-practice-v1";
const LIMIT = 80000;
let state = {screen:"input",report:"",questions:[],results:[],position:0,startedAt:null};

function restore() {
  try {
    const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null");
    if(saved && typeof saved.report==="string" && Array.isArray(saved.questions) && Array.isArray(saved.results) && ["input","session","results"].includes(saved.screen)) {
      state={...state,...saved,report:cleanReport(saved.report),position:Math.min(5,Math.max(0,Number(saved.position)||0))};
      if(state.screen==="session" && !state.questions.length) state.screen="input";
      return;
    }
  } catch { /* Ignore corrupt data. */ }
}
function persist() {
  try {localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
  catch { $("storage-note").textContent="Browser storage is unavailable. Your progress may not survive refresh."; }
}
function view() {
  const screen=state.screen;
  ["input","session","results"].forEach(name=>$(name+"-screen").hidden=name!==screen);
  $("steps").textContent=screen==="input"?"01 / SETUP":screen==="session"?"02 / PRACTICE":"03 / REVIEW";
  $("report").value=state.report;
  $("counter").textContent=state.report.trim()?state.report.trim().split(/\s+/).length.toLocaleString()+" words":"0 words";
  if(screen==="session"){
    $("progress-text").textContent="Question "+(state.position+1)+" of 5";
    $("progress-fill").style.width=((state.position)/5*100)+"%";
    $("question").textContent=state.questions[state.position]??"";
    $("answer").value="";
    $("answer").focus();
  }
  if(screen==="results"){
    const summary=summarize(state.results);
    $("final-score").textContent=summary.score+"/100";
    $("verdict").textContent=summary.verdict;
    $("answered-count").textContent=summary.answered+" of 5 questions completed";
    const list=$("review"); list.replaceChildren();
    state.results.forEach((item,index)=>{
      const card=document.createElement("article");card.className="review-item";
      const title=document.createElement("h3");title.textContent=(index+1)+". "+(state.questions[item.questionIndex]||"Question");
      const metric=document.createElement("p");metric.className="review-score";metric.textContent="Practice heuristic: "+item.score+"/100 · "+item.wordCount+" words";
      const answer=document.createElement("p");answer.textContent=item.answer||"(Skipped)";
      card.append(title,metric,answer);list.append(card);
    });
  }
  persist();
}
restore();
$("report").addEventListener("input",e=>{state.report=cleanReport(e.target.value);$("counter").textContent=(state.report.trim()?state.report.trim().split(/\s+/).length:0)+" words";persist();});
$("upload").addEventListener("change",async e=>{
  const file=e.target.files?.[0];if(!file)return;
  if(!/\.(txt|md)$/i.test(file.name)||file.size>100000){$("input-error").textContent="Use a TXT or MD file smaller than 100 KB, or paste your report.";return;}
  state.report=cleanReport(await file.text());$("input-error").textContent="";view();
});
$("start").addEventListener("click",()=>{
  if(state.report.trim().length<200){$("input-error").textContent="Please paste at least 200 characters from your report.";return;}
  $("input-error").textContent="";
  state={...state,screen:"session",questions:buildQuestions(state.report),position:0,results:[],startedAt:new Date().toISOString()};view();
});
function finish(){state.screen="results";view();}
function submit(skip=false){
  if(state.screen!=="session")return;
  const answer=skip?"":$("answer").value.trim();
  if(!skip && answer.length<10){$("answer-error").textContent="Please provide at least 10 characters, or choose Skip.";return;}
  $("answer-error").textContent="";
  state.results.push(gradeAnswer(answer,state.report,state.position));
  state.position++;
  if(state.position>=5)finish();else view();
}
$("submit").addEventListener("click",()=>submit());
$("skip").addEventListener("click",()=>submit(true));
$("finish").addEventListener("click",finish);
$("export").addEventListener("click",()=>{
  const report={app:"VivaSim",mode:"offline heuristic practice",generatedAt:new Date().toISOString(),summary:summarize(state.results),questions:state.questions,answers:state.results};
  const blob=new Blob([JSON.stringify(report,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="vivasim-practice.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
});
$("restart").addEventListener("click",()=>{state={...state,screen:"input",questions:[],results:[],position:0};view();});
$("clear").addEventListener("click",()=>{
  if(!confirm("Delete the saved report and all practice answers from this browser?"))return;
  localStorage.removeItem(STORAGE_KEY);state={screen:"input",report:"",questions:[],results:[],position:0,startedAt:null};view();
});
view();

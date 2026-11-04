import test from "node:test";
import assert from "node:assert/strict";
import { cleanReport, reportKeywords, buildQuestions, gradeAnswer, summarize } from "../src/engine.mjs";

test("normalizes and limits pasted report",()=>{assert.equal(cleanReport("  abc   def  "),"abc def");assert.equal(cleanReport("a".repeat(90000)).length,80000)});
test("returns five report-grounded question prompts",()=>{const r="Our system uses a custom model for classification.\nWe evaluated accuracy on held-out data.";const q=buildQuestions(r);assert.equal(q.length,5);assert.match(q[0],/method|problem/i)});
test("extracts repeated technical keywords",()=>{assert.ok(reportKeywords("neural neural neural classification dataset").includes("neural"))});
test("short answers score zero",()=>{assert.equal(gradeAnswer("yes","neural dataset",0).score,0)});
test("longer grounded answers do not score below empty answers",()=>{const r="neural classifier dataset validation accuracy";const a=gradeAnswer("We implemented a neural classifier and evaluated accuracy using our dataset because we needed a reproducible result with validation metrics.",r,0);assert.ok(a.score>0)});
test("summary calculates mean safely",()=>{assert.deepEqual(summarize([]),{score:0,answered:0,verdict:"No answers yet"});assert.equal(summarize([{score:40},{score:80}]).score,60)});

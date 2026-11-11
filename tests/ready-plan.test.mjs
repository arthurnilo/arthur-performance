import assert from 'node:assert/strict';
import {moduleURL} from './load-module.mjs';
const url=p=>new URL('../'+p,import.meta.url);
const {prepareToss,trainingDate,dailyTraining,unitFor,previousLoad,choiceKey}=await import(moduleURL(url('lib/toss-ready.ts')));
const {tossPlan,setsFor}=await import(moduleURL(url('lib/toss.ts')));
const {stateSchema}=await import(moduleURL(url('lib/state-schema.ts')));
const {initial}=await import(moduleURL(url('lib/program.ts')));
const a=prepareToss(undefined,'2026-11-11'),b=prepareToss(undefined,'2026-11-16');
assert.equal(a.preset,'ready-v1');assert.deepEqual(initial().metrics,[],'new friends must not inherit a fabricated weight');
assert.equal(trainingDate(a,1,1),'2026-11-11');assert.equal(trainingDate(a,1,2),'2026-11-13');assert.equal(trainingDate(a,1,3),'2026-11-16');assert.equal(trainingDate(a,2,1),'2026-11-18');
assert.equal(new Set(Object.values(a.schedule)).size,48);
for(let week=1;week<=16;week++)for(let day=1;day<=3;day++){
 const plan=tossPlan(week,day);
 plan.forEach((ex,i)=>{const key=choiceKey(week,day,i),selected=a.choices[key];assert(selected);if(ex.options)assert(ex.options.includes(selected),`invalid choice ${week}/${day}/${i}`);else assert.equal(selected,ex.name);assert.equal(a.choices['unit-'+key],unitFor(ex,selected));});
 assert([1,3,5].includes(new Date(trainingDate(a,week,day)+'T12:00:00Z').getUTCDay()));
}
assert.equal(dailyTraining(a,'2026-11-11').due.day,1);assert.equal(dailyTraining(a,'2026-11-12').due,undefined);assert.equal(dailyTraining(a,'2026-11-12').next.date,'2026-11-13');
assert.equal(dailyTraining(a,'2026-11-13').due.day,2,'missed D1 must not stack onto Friday');
const session={id:'done',date:'2026-11-11',week:1,day:1,started:1,sets:[{key:'0-0',exercise:'Back Squat (barbell)',kg:60,value:6,unit:'reps',rir:2,quality:true}],minutes:60,notes:'',warmup:'Beastmode',warmupDone:true};
a.sessions.push(session);
assert.equal(dailyTraining(a,'2026-11-11').due,undefined);assert(dailyTraining(a,'2026-11-11').completed);
assert.equal(previousLoad(a,'Back Squat (barbell)'),'60');assert.equal(previousLoad(b,'Back Squat (barbell)'),'');
assert.equal(b.sessions.length,0,'templates and histories must not share references between accounts');
const legacy={start:'2026-11-11',choices:{[choiceKey(1,1,2)]:'Good Morning (barbell)'},schedule:{'1-1':'2026-11-12'},sessions:[session],technique:[]};
const upgraded=prepareToss(legacy);assert.equal(upgraded.sessions[0],session);assert.equal(upgraded.schedule['1-1'],'2026-11-12');assert.equal(upgraded.choices[choiceKey(1,1,2)],'Good Morning (barbell)');
const oldDraft={...legacy,draft:session};assert.equal(prepareToss(oldDraft),oldDraft,'never rewrite an active workout');
assert.deepEqual(stateSchema.parse({...initial(),profile:{name:'Meu amigo',goal:'Força'},toss:upgraded}).toss,upgraded);
assert(!stateSchema.safeParse({...initial(),profile:{name:'',goal:''}}).success);
console.log('Ready plan: 48 scheduled sessions, 432 exercise choices, day-of-training, no backlog, legacy/draft preservation and separate account defaults passed.');

import {addDays,today} from './program';
import {phase,tossPlan,type TossExercise} from './toss';
import type {TossState,TossSet} from './toss-schema';
// Defaults are per account. No account IDs, names, histories or private PDF links are shared.
export const choiceKey=(week:number,day:number,index:number)=>`${phase(week)}-${day}-${index}`;
export function pickExercise(ex:TossExercise,next?:TossExercise){
 if(!ex.options)return ex.name;
 const preference:Record<number,string[]>={
  1:['3sec Squat Jump','Box Jump (repeated)'],
  2:['Hang Power Snatch (barbell)','Hang Power Clean (barbell)'],
  3:['Wall Ball','2-Handed Kettlebell Swing'],
  4:['Backward Lunge (barbell)','Front Squat (barbell)'],
  5:['Standing Barbell Press (from chest)','Elevated-feet Push Up'],
  6:['Romanian Deadlift (barbell)'],
  7:['1-Arm Bent Over Row (dumbbell)','Pull Up (variations)'],
  8:['1-Arm Cupie Hold (dumbbell)','Plate Hold'],
  9:['Hammer Curl (dumbbells)','Forearm Extension (barbell)','Popeye (forward & backward) (barbell)'],
  10:['External Shoulder Rotation (low)','Band Pull Apart'],
  11:next?.name==='Dead Bug'?['Russian Twist (plate)']:['Dead Bug','Superman']
 };
 return preference[ex.category]?.find(name=>ex.options!.includes(name))||ex.options[0];
}
export function unitFor(ex:TossExercise,name:string):TossSet['unit']{
 if(/Carry/.test(name))return 'metros';
 if(/Hold|Balance \(|Side Plank/.test(name)&&!/Press/.test(name))return 'segundos';
 return 'reps';
}
export function scheduledDates(start:string){
 // Place D1 on the first Mon/Wed/Fri on or after start; D2/D3 follow in order.
 const dates:string[]=[];
 for(let offset=0;dates.length<48;offset++){
  const d=addDays(start,offset),weekday=new Date(d+'T12:00:00Z').getUTCDay();
  if([1,3,5].includes(weekday))dates.push(d);
 }
 return dates;
}
export function prepareToss(value?:TossState,start=today()):TossState{
 if(value?.preset==='ready-v1'||value?.draft)return value;
 const origin=value?.start||start,dates=scheduledDates(origin),choices:Record<string,string>={},schedule:Record<string,string>={};
 for(let week=1;week<=16;week++)for(let day=1;day<=3;day++){
  schedule[`${week}-${day}`]=dates[(week-1)*3+day-1];
  const plan=tossPlan(week,day);
  plan.forEach((ex,i)=>{const key=choiceKey(week,day,i),name=pickExercise(ex,plan[i+1]);choices[key]=name;choices[`unit-${key}`]=unitFor(ex,name)});
 }
 return {start:origin,choices:{...choices,...value?.choices},schedule:{...schedule,...value?.schedule},sessions:value?.sessions||[],technique:value?.technique||[],preset:'ready-v1'};
}
export function trainingDate(state:TossState,week:number,day:number){
 return state.schedule[`${week}-${day}`]||addDays(state.start,(week-1)*7+[0,2,4,5][day-1]);
}
export function dailyTraining(state:TossState,date=today()){
 const items=Array.from({length:16},(_,i)=>[1,2,3].map(day=>({week:i+1,day,date:trainingDate(state,i+1,day)}))).flat().sort((a,b)=>a.date.localeCompare(b.date)||a.week-b.week||a.day-b.day);
 const done=(item:typeof items[number])=>state.sessions.some(s=>s.week===item.week&&s.day===item.day&&s.date===item.date);
 const due=items.find(item=>item.date===date&&!done(item));
 const completed=items.some(item=>item.date===date&&done(item));
 const next=items.find(item=>item.date>date&&!done(item));
 return {due,completed,next};
}
export function previousLoad(state:TossState,exercise:string){
 for(const session of [...state.sessions].reverse()){
  const set=[...session.sets].reverse().find(set=>set.exercise===exercise);
  if(set)return String(set.kg);
 }
 return '';
}

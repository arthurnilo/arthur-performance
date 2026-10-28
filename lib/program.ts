import type {Caverna} from './caverna';
export type Exercise={id:string;name:string;group:string;sets:number;lo:number;hi:number;rest:number;note?:string;power?:boolean};
const e=(id:string,name:string,group:string,sets:number,lo:number,hi:number,rest=90,note=''):Exercise=>({id,name,group,sets,lo,hi,rest,note});
export const workouts=[
 {name:'Upper A',focus:'Peito, costas e ombros',minutes:50,color:'green',ex:[e('bench','Supino reto','Peito',3,6,8,150,'Aquecimento progressivo antes das séries válidas.'),e('row','Remada apoiada','Costas',3,8,12,90,'Supersérie A: alterne com o supino inclinado.'),e('incline','Supino inclinado com halteres','Peito',3,8,12,90,'Supersérie A • cargas por halter.'),e('pulldown','Puxada frontal','Costas',3,8,12),e('lateral','Elevação lateral','Ombros',3,12,20,60,'Supersérie B: alterne com tríceps.'),e('triceps','Tríceps na polia','Tríceps',2,10,15,60)]},
 {name:'Lower A',focus:'Quadríceps e força',minutes:50,color:'blue',ex:[e('squat','Agachamento livre','Quadríceps',3,5,8,180,'RIR 2–3. Priorize amplitude e técnica.'),e('press','Leg press','Quadríceps',3,8,12,120),e('curl','Mesa flexora','Posteriores',3,10,15,75),e('extension','Cadeira extensora','Quadríceps',2,12,15,60),e('calf','Panturrilha em pé','Panturrilhas',3,10,15,60,'Supersérie: alterne com abdominal.'),e('abs','Abdominal na polia','Core',2,10,15,60)]},
 {name:'Upper B',focus:'Costas, ombros e braços',minutes:50,color:'green',ex:[e('pulldown','Puxada frontal','Costas',3,6,10,120),e('ohp','Desenvolvimento com halteres','Ombros',3,6,10,120,'Cargas por halter.'),e('row','Remada apoiada','Costas',3,8,12,90),e('fly','Crucifixo na máquina','Peito',3,10,15,75),e('biceps','Rosca com halteres','Bíceps',3,10,15,60,'Supersérie: alterne com tríceps. Cargas por halter.'),e('triceps','Tríceps na polia','Tríceps',3,10,15,60),e('rear','Crucifixo inverso','Ombros',2,12,20,60)]},
 {name:'Lower B',focus:'Posteriores e glúteos',minutes:45,color:'blue',ex:[e('rdl','Terra romeno','Posteriores',3,8,10,120,'RIR 3 na quinta. Reduza se o cheer exigir mais.'),e('hip','Elevação pélvica','Glúteos',3,8,12,90),e('curl','Mesa flexora','Posteriores',2,10,15,75),e('calf','Panturrilha em pé','Panturrilhas',3,10,15,60),e('abs','Abdominal na polia','Core',2,10,15,60)]},
 {name:'Full Body',focus:'Complementar + potência',minutes:45,color:'purple',ex:[{...e('jump','Salto vertical','Potência',3,3,3,90,'Tripla extensão + ação dos braços. Encerre se perder altura ou qualidade.'),power:true},e('incline','Supino inclinado com halteres','Peito',3,8,12,90),e('split','Agachamento búlgaro','Quadríceps',2,8,12,90,'Repetições por perna. RIR 3 antes do cheer do fim de semana.'),e('lateral','Elevação lateral','Ombros',3,12,20,60),e('biceps','Rosca com halteres','Bíceps',2,10,15,60),e('hip','Elevação pélvica','Glúteos',2,10,15,75)]}
];
export const days=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
export const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date());
export const addDays=(d:string,n:number)=>{const v=new Date(d+'T12:00:00');v.setDate(v.getDate()+n);return v.toISOString().slice(0,10)};
export const monday=(d:string)=>addDays(d,-((new Date(d+'T12:00:00').getDay()+6)%7));
export type SetLog={ex:string;group:string;kg:number;reps:number;rir:number;power?:boolean};
export type Session={date:string;workout:number;sets:SetLog[];minutes:number;kind?:string;deload?:boolean};
export type Metric={date:string;weight:number;waist?:number;arm?:number;thigh?:number};
export type Recovery={date:string;sleep:number;energy:number;soreness:number;pain:boolean};
export type State={caverna?:Caverna;start:string;schedules:Record<string,number[]>;history:Session[];metrics:Metric[];recovery:Recovery[];deloads:Record<string,boolean>;draft?:{selected:number;budget:number;light:boolean;startTime:number;logs:Record<string,SetLog>;inputs:Record<string,{kg:string;reps:string;rir:string}>}};
export const initial=():State=>({start:monday(today()),schedules:{},history:[],metrics:[{date:today(),weight:78}],recovery:[],deloads:{}});
export const readiness=(r?:Recovery)=>r?Math.round(Math.max(0,Math.min(100, r.sleep/8*35+r.energy*10+(5-r.soreness)*3-(r.pain?40:0)))):null;
export function plan(id:number,budget:number,light:boolean,deload:boolean){
 let ex=workouts[id].ex.map(x=>({...x,sets:deload?Math.max(1,Math.ceil(x.sets/2)):light?Math.max(1,x.sets-1):x.sets}));
 const duration=()=>Math.ceil(7+ex.reduce((a,x)=>a+x.sets*(x.power?.3:.65)+Math.max(0,x.sets-1)*x.rest/60+1,0));
 while(duration()>budget && ex.some(x=>x.sets>1)){const x=[...ex].reverse().find(x=>x.sets>1)!;x.sets--}
 return {ex,minutes:duration()};
}
export function suggestion(ex:Exercise,history:Session[],suppress=false){
 const last=[...history].reverse().find(s=>s.sets.some(x=>x.ex===ex.id));
 if(!last)return {kg:'',text:'Defina sua carga inicial com técnica e RIR adequado.'};
 const sets=last.sets.filter(x=>x.ex===ex.id);const kg=sets[0].kg;
 const increase=!suppress&&!last.deload&&!ex.power&&sets.length>=ex.sets&&sets.every(x=>x.reps>=ex.hi&&x.rir>=2&&x.kg===kg)&&kg>0;
 return {kg:String(increase?Math.round(kg*1.025*2)/2:kg),text:increase?'Topo da faixa atingido: sugestão de +2,5%. Ajuste à menor carga disponível.':'Mantenha a carga e evolua as repetições antes de aumentar.'};
}

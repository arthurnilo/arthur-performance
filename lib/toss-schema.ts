import {z} from 'zod';
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>!Number.isNaN(Date.parse(s)));
const n=(min:number,max:number)=>z.number().finite().min(min).max(max);
const set=z.object({key:z.string().max(80),exercise:z.string().max(100),kg:n(0,500),value:n(0,10000),left:n(0,10000).optional(),unit:z.enum(['reps','segundos','metros']),rir:n(0,10),quality:z.boolean()});
const session=z.object({id:z.string().max(80),date,week:n(1,16).int(),day:n(1,4).int(),conditioningId:n(0,11).int().optional(),started:n(0,9999999999999),sets:z.array(set).max(300),minutes:n(0,10000),notes:z.string().max(500),warmup:z.string().max(80),warmupDone:z.boolean()});
export const tossSchema=z.object({
 start:date,choices:z.record(z.string().max(80),z.string().max(100)),schedule:z.record(z.string().max(80),date),
 sessions:z.array(session).max(1000),draft:session.optional(),
 technique:z.array(z.object({date,attempts:n(1,1000).int(),good:n(0,1000).int(),focus:z.enum(['Dip vertical','Extensão e trajetória','Sincronização pernas e braços','Recepção estável']),note:z.string().max(500)}).refine(x=>x.good<=x.attempts)).max(1000)
});
export type TossState=z.infer<typeof tossSchema>;
export type TossSession=TossState['sessions'][number];
export type TossSet=TossSession['sets'][number];

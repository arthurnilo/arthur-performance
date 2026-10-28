import { z } from 'zod';
const day=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!Number.isNaN(Date.parse(v)));
export const cavernaSchema=z.object({
 start:day, duration:z.number().int().min(7).max(90),
 target:z.string().trim().min(1).max(80), trigger:z.string().trim().min(1).max(160),
 barrier:z.string().trim().min(1).max(160), replacement:z.string().trim().min(1).max(160),
 reviews:z.array(z.object({date:day,focus:z.number().int().min(0).max(480),environment:z.boolean(),connection:z.boolean(),note:z.string().max(300)})).max(1000),
 urges:z.array(z.object({at:z.string().datetime(),intensity:z.number().int().min(1).max(5),trigger:z.string().max(160),outcome:z.enum(['atravessei','deslize']),next:z.string().max(160)})).max(1000)
});
export type Caverna=z.infer<typeof cavernaSchema>;
export function progress(c:Caverna,date:string){
 const elapsed=Math.floor((Date.parse(date+'T12:00:00Z')-Date.parse(c.start+'T12:00:00Z'))/86400000);
 return {day:Math.max(0,Math.min(c.duration,elapsed+1)),complete:elapsed>=c.duration,reviews:c.reviews.filter(r=>r.date>=c.start&&r.date<=date).length};
}

import { z } from 'zod';
import {cavernaSchema} from './caverna';
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!Number.isNaN(Date.parse(v)),'Data inválida');
const num=(min:number,max:number)=>z.number().finite().min(min).max(max);
const set=z.object({ex:z.string().max(60),group:z.string().max(40),kg:num(0,500),reps:num(1,100).int(),rir:num(0,10),power:z.boolean().optional()});
export const stateSchema=z.object({
 caverna:cavernaSchema.optional(),
 start:date,
 schedules:z.record(date,z.array(num(-2,4).int()).length(7)),
 history:z.array(z.object({date,workout:num(-1,4).int(),sets:z.array(set).max(300),minutes:num(0,100000),kind:z.string().max(60).optional(),deload:z.boolean().optional()})).max(10000),
 metrics:z.array(z.object({date,weight:num(30,300),waist:num(10,250).optional(),arm:num(10,250).optional(),thigh:num(10,250).optional()})).max(10000),
 recovery:z.array(z.object({date,sleep:num(0,14),energy:num(1,5),soreness:num(0,5),pain:z.boolean()})).max(10000),
 deloads:z.record(date,z.boolean()).default({}),
 draft:z.object({selected:num(0,4).int(),budget:num(45,60).int(),light:z.boolean(),startTime:num(0,9999999999999),logs:z.record(z.string().max(80),set),inputs:z.record(z.string().max(80),z.object({kg:z.string().max(12),reps:z.string().max(12),rir:z.string().max(12)}))}).optional()
});

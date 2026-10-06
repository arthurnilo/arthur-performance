import { createClient } from '@supabase/supabase-js';
import { stateSchema } from '../../../lib/state-schema';
export const dynamic='force-dynamic';
async function authenticate(req:Request){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return {error:Response.json({error:'Supabase não configurado na hospedagem.'},{status:503})};
 const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/i)?.[1];
 if(!token)return {error:Response.json({error:'Entre novamente para acessar seus dados.'},{status:401})};
 const db=createClient(url,key,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 const {data:{user},error}=await db.auth.getUser(token);
 if(error||!user)return {error:Response.json({error:'Sessão expirada. Entre novamente.'},{status:401})};
 return {db,user};
}
export async function GET(req:Request){
 const auth=await authenticate(req);if(auth.error)return auth.error;
 const {data,error}=await auth.db!.from('athlete_state').select('data,revision').eq('user_id',auth.user!.id).maybeSingle();
 if(error)return Response.json({error:'Não foi possível carregar os dados. Verifique o SQL e as políticas do Supabase.'},{status:503});
 return Response.json({data:data?.data??null,revision:data?.revision??0},{headers:{'Cache-Control':'no-store'}});
}
export async function PUT(req:Request){
 const auth=await authenticate(req);if(auth.error)return auth.error;
 const raw=await req.text();if(raw.length>1000000)return Response.json({error:'Limite de 1 MB atingido. Exporte seus dados.'},{status:413});
 let body;try{body=JSON.parse(raw)}catch{return Response.json({error:'JSON inválido.'},{status:400})}
 const parsed=stateSchema.safeParse(body.data);
 if(!parsed.success||!Number.isSafeInteger(body.revision)||body.revision<0)return Response.json({error:'Dados inválidos. Confira os campos e tente novamente.'},{status:400});
 const {data,error}=await auth.db!.rpc('save_athlete_state',{p_data:parsed.data,p_expected_revision:body.revision});
 if(error){if(error.code==='40001')return Response.json({error:'Os registros foram alterados em outro dispositivo. Recarregue antes de continuar.'},{status:409});return Response.json({error:'Falha ao salvar. Verifique sua conexão e a instalação do SQL no Supabase.'},{status:503})}
 return Response.json({revision:data},{headers:{'Cache-Control':'no-store'}});
}

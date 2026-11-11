import { createClient, type SupabaseClient } from '@supabase/supabase-js';
let client: SupabaseClient | undefined;
export function isConfigured(){return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)}
export function getSupabase(){
 if(!isConfigured()) throw new Error('Configure as variáveis do Supabase e reinicie o aplicativo.');
 return client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
}
export async function apiFetch(url:string,init:RequestInit={},expectedUserId?:string){
 const {data:{session},error}=await getSupabase().auth.getSession();
 if(error||!session)throw new Error('Sessão expirada. Entre novamente.');
 if(expectedUserId&&session.user.id!==expectedUserId)throw new Error('A conta mudou. Recarregue para acessar os dados da conta atual.');
 const headers=new Headers(init.headers);headers.set('Authorization',`Bearer ${session.access_token}`);if(expectedUserId)headers.set('X-Account-Id',expectedUserId);
 return fetch(url,{...init,headers,cache:'no-store'});
}

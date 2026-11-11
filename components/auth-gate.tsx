'use client';
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {getSupabase,isConfigured} from '../lib/supabase';
import type {Session,User} from '@supabase/supabase-js';
const AccountContext=createContext<User|null>(null);
export function useAccount(){const user=useContext(AccountContext);if(!user)throw Error('Entre na sua conta para continuar.');return user}
function authMessage(error:unknown){const text=error instanceof Error?error.message:'Não foi possível concluir. Tente novamente.';return /fetch|network|load failed/i.test(text)?'Não foi possível conectar ao serviço de login. Confira a conexão e a disponibilidade do Supabase.':text}
export default function AuthGate({children}:{children:ReactNode}){
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[mode,setMode]=useState<'login'|'signup'|'forgot'|'reset'>('login'),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{
  if(!isConfigured()){setReady(true);return}
  let active=true,eventSeen=false;
  const sb=getSupabase();
  const {data:{subscription}}=sb.auth.onAuthStateChange((event,s)=>{if(!active)return;eventSeen=true;setSession(s);setReady(true);if(event==='PASSWORD_RECOVERY')setMode('reset')});
  sb.auth.getSession().then(({data,error})=>{if(!active||eventSeen)return;setSession(data.session);if(error)setMessage(authMessage(error));setReady(true)}).catch(e=>{if(active){setMessage(authMessage(e));setReady(true)}});
  return()=>{active=false;subscription.unsubscribe()};
 },[]);
 if(!ready)return <div className="authscreen"><p>Carregando sua sessão…</p></div>;
 if(!isConfigured())return <div className="authscreen"><div className="authcard"><h1>Vamos conectar seus dados.</h1><p>Configure a URL e a chave pública do Supabase na hospedagem e faça um novo deploy.</p></div></div>;
 if(session&&mode!=='reset')return <AccountContext.Provider key={session.user.id} value={session.user}><div key={session.user.id}>{children}</div></AccountContext.Provider>;
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');try{
  const sb=getSupabase(),address=email.trim().toLowerCase();
  if(mode==='login'){const {error}=await sb.auth.signInWithPassword({email:address,password});if(error)throw error}
  if(mode==='signup'){if(name.trim().length<2)throw Error('Informe seu nome com pelo menos dois caracteres.');const {data,error}=await sb.auth.signUp({email:address,password,options:{emailRedirectTo:window.location.origin,data:{full_name:name.trim()}}});if(error)throw error;if(!data.session)setMessage('Confira seu e-mail para confirmar sua conta. Depois entre com sua senha.')}
  if(mode==='forgot'){const {error}=await sb.auth.resetPasswordForEmail(address,{redirectTo:window.location.origin});if(error)throw error;setMessage('Se houver uma conta para esse e-mail, você receberá o link para redefinir a senha.')}
  if(mode==='reset'){const {error}=await sb.auth.updateUser({password});if(error)throw error;setMode('login');setPassword('')}
 }catch(err){setMessage(authMessage(err))}finally{setBusy(false)}}
 return <div className="authscreen"><div className="authcard"><div className="eyebrow">ARTHUR PERFORMANCE</div><h1>{mode==='signup'?'Crie seu espaço de treino.':mode==='forgot'?'Recupere seu acesso.':mode==='reset'?'Escolha uma nova senha.':'Seu treino. Sua conta.'}</h1><p>Cada pessoa tem calendário, cargas, medidas e histórico próprios. Use seu e-mail e sua senha.</p><form onSubmit={submit}>{mode==='signup'&&<label>Seu nome<input autoComplete="name" required minLength={2} maxLength={60} value={name} onChange={e=>setName(e.target.value)}/></label>}{mode!=='reset'&&<label>E-mail<input autoComplete="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>}{mode!=='forgot'&&<label>Senha<input autoComplete={mode==='login'?'current-password':'new-password'} type="password" minLength={mode==='login'?1:8} required value={password} onChange={e=>setPassword(e.target.value)}/></label>}{message&&<p role="status" className="authmessage">{message}</p>}<button disabled={busy} className="btn dark">{busy?'Aguarde…':mode==='login'?'Entrar':mode==='signup'?'Criar minha conta':mode==='forgot'?'Enviar link':'Salvar nova senha'}</button></form>{mode!=='reset'&&<div className="authlinks"><button disabled={busy} onClick={()=>{setMode(mode==='login'?'signup':'login');setMessage('');setPassword('')}}>{mode==='login'?'Criar minha conta':'Já tenho uma conta'}</button><button disabled={busy} onClick={()=>{setMode('forgot');setMessage('');setPassword('')}}>Esqueci a senha</button></div>}</div></div>
}

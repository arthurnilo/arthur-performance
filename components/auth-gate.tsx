'use client';
import {useEffect,useState,type ReactNode} from 'react';
import {getSupabase,isConfigured} from '../lib/supabase';
import type {Session} from '@supabase/supabase-js';
export default function AuthGate({children}:{children:ReactNode}){
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false),[mode,setMode]=useState<'login'|'signup'|'forgot'|'reset'>('login'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{if(!isConfigured()){setReady(true);return}const sb=getSupabase();sb.auth.getSession().then(({data,error})=>{setSession(data.session);if(error)setMessage(error.message);setReady(true)});const {data:{subscription}}=sb.auth.onAuthStateChange((event,s)=>{setSession(s);setReady(true);if(event==='PASSWORD_RECOVERY')setMode('reset')});return()=>subscription.unsubscribe()},[]);
 if(!ready)return <div className="authscreen"><p>Carregando sua sessão…</p></div>;
 if(!isConfigured())return <div className="authscreen"><div className="authcard"><h1>Vamos conectar seus dados.</h1><p>Copie .env.example para .env.local e preencha a URL e a chave pública do Supabase. Na Vercel, configure as mesmas variáveis e faça um novo deploy.</p></div></div>;
 if(session&&mode!=='reset')return <div key={session.user.id}>{children}</div>;
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');try{
 const sb=getSupabase();
 if(mode==='login'){const {error}=await sb.auth.signInWithPassword({email,password});if(error)throw error;}
 if(mode==='signup'){const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin}});if(error)throw error;if(!data.session)setMessage('Confira seu e-mail para confirmar a conta. Depois entre com sua senha.');}
 if(mode==='forgot'){const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});if(error)throw error;setMessage('Se houver uma conta para esse e-mail, você receberá o link para redefinir a senha.');}
 if(mode==='reset'){const {error}=await sb.auth.updateUser({password});if(error)throw error;setMode('login');setPassword('');}
 }catch(err){setMessage((err as Error).message)}finally{setBusy(false)}}
 return <div className="authscreen"><div className="authcard"><div className="eyebrow">ARTHUR PERFORMANCE</div><h1>{mode==='signup'?'Seu próximo nível começa aqui.':mode==='forgot'?'Recupere seu acesso.':mode==='reset'?'Escolha uma nova senha.':'Seu treino. Em qualquer lugar.'}</h1><p>Entre com a mesma conta no celular e no computador para acessar seus treinos.</p><form onSubmit={submit}>{mode!=='reset'&&<label>E-mail<input autoComplete="email" type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>}{mode!=='forgot'&&<label>Senha<input autoComplete={mode==='login'?'current-password':'new-password'} type="password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label>}{message&&<p role="status" className="authmessage">{message}</p>}<button disabled={busy} className="btn dark">{busy?'Aguarde…':mode==='login'?'Entrar':mode==='signup'?'Criar conta':mode==='forgot'?'Enviar link':'Salvar nova senha'}</button></form>{mode!=='reset'&&<div className="authlinks"><button onClick={()=>{setMode(mode==='login'?'signup':'login');setMessage('')}}>{mode==='login'?'Criar minha conta':'Já tenho uma conta'}</button><button onClick={()=>{setMode('forgot');setMessage('')}}>Esqueci a senha</button></div>}</div></div>
}

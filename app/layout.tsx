import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Arthur Performance — Seu treino do dia',description:'TOSS Progress: força, potência e controle para o cheer. Treinos e evolução por usuário.'};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body>{children}</body></html>}

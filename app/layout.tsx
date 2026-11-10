import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Projeto Caveira — TOSS Progress',description:'TOSS Progress: força, potência e controle para o cheer. Hábitos e modo caverna.'};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body>{children}</body></html>}

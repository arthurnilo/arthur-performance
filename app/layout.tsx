import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Projeto Caveira — Corpo e foco',description:'Hipertrofia em primeiro lugar. Treinamento híbrido, hábitos e modo caverna.'};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body>{children}</body></html>}

import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Arthur Performance — Seu próximo nível',description:'Hipertrofia em primeiro lugar. Seu treinamento híbrido, planejado e acompanhado.'};
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="pt-BR"><body>{children}</body></html>}

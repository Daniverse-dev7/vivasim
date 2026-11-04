import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: "Danii’s VivaSim — Survive your viva before it happens", description: 'Private, browser-first project defense preparation. Review your report and practice explaining your work.' };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}

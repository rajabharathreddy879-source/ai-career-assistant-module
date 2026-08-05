import { Sidebar } from './layout/Sidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}

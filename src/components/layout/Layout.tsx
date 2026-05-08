import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-20 pb-8">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            {children}
          </div>
          <Sidebar />
        </div>
      </main>
    </div>
  );
};

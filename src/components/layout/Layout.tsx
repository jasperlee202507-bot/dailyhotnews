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
      {/* 移动端 Header 两行较高，加大 pt；桌面保持原视觉 */}
      <main className="mx-auto max-w-[1600px] px-3 pb-8 pt-[7.75rem] sm:px-4 sm:pt-[8.25rem] lg:flex lg:gap-6 lg:px-4 lg:pt-24 xl:px-6">
        <div className="min-w-0 flex-1">{children}</div>
        <Sidebar />
      </main>
    </div>
  );
};

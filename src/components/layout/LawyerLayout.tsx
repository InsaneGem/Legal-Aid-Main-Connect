import { ReactNode } from 'react';
import { LawyerNavbar } from './LawyerNavbar';
interface LawyerLayoutProps {
  children: ReactNode;
}
export const LawyerLayout = ({ children }: LawyerLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <LawyerNavbar />
      <main className="flex-1 pt-16">
        {children}
      </main>
    </div>
  );
};
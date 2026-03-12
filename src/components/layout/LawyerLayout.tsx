import { ReactNode } from 'react';
import { LawyerNavbar } from './LawyerNavbar';
import { LawyerFooter } from './LawyerFooter';
interface LawyerLayoutProps {
  children: ReactNode;
  showLawyerFooter?: boolean;
}
export const LawyerLayout = ({ children, showLawyerFooter=true }: LawyerLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <LawyerNavbar />
      {/* <main className="flex-1 pt-16"> */}
       <main className="flex-1 pt-[88px]">
        {children}
      </main>
        {showLawyerFooter && <LawyerFooter />}
    </div>
  );
};
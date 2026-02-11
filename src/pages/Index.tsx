import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/home/HeroSection';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { StatsSection } from '@/components/home/StatsSection';
import { CTASection } from '@/components/home/CTASection';

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturesSection />
      <CategoriesSection />
      <StatsSection />
      <CTASection />
    </MainLayout>
  );
};

export default Index;

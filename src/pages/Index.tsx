import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSection } from '@/components/home/HeroSection';
// import { FeaturesSection } from '@/components/home/FeaturesSection';
import { TrustBar } from '@/components/home/TrustBar';
import { HowItWorks } from '@/components/home/MainHowItWorks';
import { FeatureShowcase } from '@/components/home/FeatureShowcase';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { WhyChoose } from '@/components/home/WhyChoose';
import { StatsSection } from '@/components/home/StatsSection';
// import { CTASection } from '@/components/home/CTASection';
import { TestimonialSection } from '@/components/home/TestimonialSection';
import { ForLawyersCTA } from '@/components/home/ForLawyersCTA';
import { FAQSection } from '@/components/home/FAQSection';
import { FinalCTA } from '@/components/home/FinalCTA';

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      {/* <FeaturesSection /> */}
      <TrustBar />
      <HowItWorks />
      <FeatureShowcase />
      <CategoriesSection />
       <WhyChoose />
      <StatsSection />
      {/* <CTASection /> */}
      <TestimonialSection />
      <ForLawyersCTA />
      <FAQSection />
      <FinalCTA />
    </MainLayout>
  );
};

export default Index;

import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Star } from 'lucide-react';

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[90vh] flex items-center hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm text-white/90">500+ Verified Lawyers Online Now</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up">
            Expert Legal Advice
            <br />
            <span className="text-white/80">At Your Fingertips</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Connect with verified lawyers instantly via chat, audio, or video. 
            Get professional legal consultation from the comfort of your home.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button 
              size="lg" 
              variant="secondary"
              className="text-base px-8 py-6 font-semibold group"
              onClick={() => navigate('/lawyers')}
            >
              Consult a Lawyer Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-base px-8 py-6 border-white/30 text-white hover:bg-white/10 hover:text-white"
              onClick={() => navigate('/signup?role=lawyer')}
            >
              Join as a Lawyer
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 text-white/80">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Verified Lawyers</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Clock className="h-5 w-5" />
              <span className="text-sm">24/7 Available</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Star className="h-5 w-5" />
              <span className="text-sm">4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

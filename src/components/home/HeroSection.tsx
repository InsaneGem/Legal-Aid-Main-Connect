import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Star, Lock, CheckCircle, Eye, Currency, IndianRupee } from 'lucide-react';
import mainPageTheme from "../../assets/main_page_theme.jpg";
import Consultation from './../../pages/Consultation';


export const HeroSection = () => {
  const navigate = useNavigate();

  return (

   <section className="relative min-h-[75vh] sm:min-h-[85vh] lg:min-h-[95vh] flex items-center overflow-hidden">

          <div className="absolute inset-0">
              <img 
                src={mainPageTheme} 
                alt="Supreme Court with lawyers" 
                className="absolute inset-0 w-full h-full object-cover object-center"
               />
               <div className="absolute inset-0 bg-black/35" />
               <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            </div>

      

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          {/* <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8 animate-fade-in"> */}
          {/* <div className="inline-flex items-center gap-2 bg-black/30 backdrop-blur-md border border-white/15 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm text-white/90">500+ Verified Lawyers Online Now</span>
          </div> */}

          {/* Headline */}
          {/* <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up"> */}
           <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up drop-shadow-lg">
            Expert Legal Advice
            <br />
            {/* <span className="text-white/80">At Your Fingertips</span> */}
            <span className="text-amber-100/90">At Your Fingertips</span>
          </h1>

          {/* Subheadline */}
          {/* <p className="text-lg md:text-xl text-white/70 mb-8 max-w-2xl animate-slide-up" style={{ animationDelay: '0.1s' }}> */}
           <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl animate-slide-up drop-shadow-md" style={{ animationDelay: '0.1s' }}>
            Connect with verified lawyers instantly via chat, audio, or video. 
            Get professional legal consultation from the comfort of your home.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button 
              size="lg" 
              variant="secondary"
              // className="text-base px-8 py-6 font-semibold group"
               className="text-base px-8 py-6 font-semibold group bg-white text-black hover:bg-amber-50"
              onClick={() => navigate('/signup?role=client')}
            >
              Consult a Lawyer Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-base px-8 py-6 font-semibold group"
              // className="text-base px-8 py-6 border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
              onClick={() => navigate('/signup?role=lawyer')}
            >
              Join as a Lawyer
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap gap-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {/* <div className="flex items-center gap-2 text-white/80"> */}
            <div className="flex items-center gap-2 text-white/90 drop-shadow-md">
              <Shield className="h-5 w-5" />
              <span className="text-sm">Verified Lawyers only</span>
            </div>
            {/* <div className="flex items-center gap-2 text-white/80"> */}
             <div className="flex items-center gap-2 text-white/90 drop-shadow-md">
              <Clock className="h-5 w-5" />
              <span className="text-sm">24/7 Available</span>
            </div>
            {/* <div className="flex items-center gap-2 text-white/80"> */}
            <div className="flex items-center gap-2 text-white/90 drop-shadow-md">
              <Star className="h-5 w-5" />
              <span className="text-sm">0.0/5 Rating</span>
            </div>
            <div className="flex items-center gap-2 text-white/90 drop-shadow-md">
              <Lock className="h-5 w-5" />
              <span className="text-sm">Secure Consultation</span>
            </div>
            <div className="flex items-center gap-2 text-white/90 drop-shadow-md">
              <Eye className="h-5 w-5" />
              <span className="text-sm">Private & Confidential</span>
            </div>
            <div className="flex items-center gap-2 text-white/90 drop-shadow-md">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Trusted by Clients Worldwide</span>
            </div>
            <div className="flex items-center gap-2 text-white/90 drop-shadow-md">
              <IndianRupee className="h-5 w-5" />
              <span className="text-sm">Affordable Pricing</span>
            </div>


          </div>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t " />
    </section>
  );
};

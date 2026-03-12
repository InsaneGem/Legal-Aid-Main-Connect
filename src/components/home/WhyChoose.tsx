import { CheckCircle2 } from 'lucide-react';
import constitutionofindia from "../../assets/Constitution of India.jpg";
const advantages = [
  'Bar-council verified lawyers with proven track records',
  'Instant consultations via chat, audio, or video',
  'Transparent pay-per-minute pricing with no hidden fees',
  '24/7 availability across multiple time zones',
  'End-to-end encrypted and 100% confidential sessions',
  'Multi-language support for global accessibility',
  'Dedicated dashboard to track all your legal matters',
  'Satisfaction guarantee with easy refund policy',
];
export const WhyChoose = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Visual */}
          <div className="relative animate-fade-in">
            <div className="aspect-square max-w-md mx-auto rounded-2xl hero-gradient p-12 flex items-center justify-center shadow-elegant">
              {/* <div className="text-center">
                <div className="font-serif text-6xl font-bold text-primary-foreground mb-4">LM</div>
                <div className="text-primary-foreground/70 text-lg">Your Legal Partner</div>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {['Trusted', 'Secure', 'Verified', 'Fast'].map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground text-xs font-medium backdrop-blur-sm border border-primary-foreground/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div> */}
              <div className="absolute inset-0">
              <img 
                src={constitutionofindia} 
                alt="Supreme Court with lawyers" 
                className="absolute inset-0 w-full h-full object-contain object-center"
               />
               {/* <div className="absolute inset-0 bg-black/35" /> */}
               {/* <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" /> */}
            </div>

            </div>
            {/* Decorative floating cards */}
            {/* <div className="absolute -top-4 -right-4 bg-card border border-border rounded-lg p-3 shadow-card animate-slide-up hidden md:block">
              <div className="text-xs font-semibold">⭐ 4.9 Rating</div>
            </div> */}
            {/* <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-lg p-3 shadow-card animate-slide-up hidden md:block" style={{ animationDelay: '0.2s' }}>
              <div className="text-xs font-semibold">✅ 50K+ Sessions</div>
            </div> */}
          </div>
          {/* Right - Advantages */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Why LEGALMATE</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
              The Smarter Way to Get Legal Help
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              LEGALMATE connects you with top-tier legal professionals through a modern, secure, and affordable platform built for today's world.
            </p>
            <ul className="space-y-4">
              {advantages.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success mt-0.5 shrink-0" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

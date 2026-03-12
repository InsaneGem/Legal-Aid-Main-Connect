import { Search, CalendarCheck, Scale } from 'lucide-react';
const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Search a Lawyer',
    description: 'Browse through our verified lawyers by specialization, language, rating, and availability.',
  },
  {
    icon: CalendarCheck,
    step: '02',
    title: 'Book Consultation',
    description: 'Choose your preferred mode — chat, audio, or video — and book an instant or scheduled session.',
  },
  {
    icon: Scale,
    step: '03',
    title: 'Get Legal Advice',
    description: 'Receive expert legal guidance from the comfort of your home. Pay only for what you use.',
  },
];
export const HowItWorks = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Simple Process</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Getting legal help has never been easier. Three simple steps to connect with an expert.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-border" />
          {steps.map((item, index) => (
            <div
              key={item.title}
              className="relative text-center p-8 animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative z-10 w-16 h-16 mx-auto rounded-full bg-primary flex items-center justify-center mb-6 shadow-elegant">
                <item.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">Step {item.step}</span>
              <h3 className="font-serif text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
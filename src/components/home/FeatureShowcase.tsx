import { CalendarCheck, ShieldCheck, CreditCard, Video, FileSearch, Languages } from 'lucide-react';
const features = [
  { icon: CalendarCheck, title: 'Instant Booking', description: 'Book consultations with available lawyers in seconds.' },
  { icon: ShieldCheck, title: 'Verified Profiles', description: 'Every lawyer is bar-council verified before onboarding.' },
  { icon: CreditCard, title: 'Secure Payments', description: 'Pay-per-minute billing with encrypted transactions.' },
  { icon: Video, title: 'Video Consultation', description: 'HD video calls for face-to-face legal discussions.' },
  { icon: FileSearch, title: 'Case Tracking', description: 'Track your consultations, notes, and history in one place.' },
  { icon: Languages, title: 'Multi-Language', description: 'Lawyers available in multiple languages for your comfort.' },
];
export const FeatureShowcase = () => {
  return (
    <section className="py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">Platform Features</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive suite of tools designed for seamless legal consultations.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 bg-card rounded-xl border border-border hover:shadow-elegant hover:border-foreground/10 transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/5 border border-border flex items-center justify-center mb-5 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                <feature.icon className="h-6 w-6 text-foreground group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

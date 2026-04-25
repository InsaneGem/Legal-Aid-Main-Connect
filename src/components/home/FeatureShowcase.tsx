
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
    <section className="py-12 sm:py-16 -mt-5 md:-mt-5 md:py-20 bg-muted/30 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Platform Features
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Everything You Need
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            A complete suite designed for seamless legal consultations.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">

          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="
                group
                p-3 sm:p-4 md:p-5
                rounded-lg sm:rounded-xl
                border border-black/10
                bg-background/80 backdrop-blur-md
                shadow-sm
                hover:shadow-md hover:-translate-y-0.5
                transition-all duration-300
              "
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* ICON */}
              <div className="
                w-9 h-9 sm:w-10 sm:h-10
                rounded-md
                bg-primary/10
                flex items-center justify-center
                mb-3
                group-hover:bg-primary group-hover:text-primary-foreground
                transition-all duration-300
              ">
                <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:text-white transition-colors" />
              </div>

              {/* TITLE */}
              <h3 className="font-medium text-sm sm:text-base mb-1">
                {feature.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
                {feature.description}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};
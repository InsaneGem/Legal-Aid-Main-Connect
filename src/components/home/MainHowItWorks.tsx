
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
    description: 'Choose chat, audio, or video. Book instantly or schedule as per your convenience.',
  },
  {
    icon: Scale,
    step: '03',
    title: 'Get Legal Advice',
    description: 'Receive expert guidance from anywhere. Pay only for what you use.',
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-12 md:py-20 -mt-5 md:-mt-5 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center mb-12 md:mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Working Process
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Get legal help in just three simple steps. Fast, secure, and hassle-free.
          </p>
        </div>

        {/* STEPS */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-8">

          {/* CONNECTOR LINE (DESKTOP ONLY) */}
          <div className="hidden md:block absolute top-20 left-[15%] right-[15%] h-[2px] bg-border/60" />

          {steps.map((item, index) => (
            <div
              key={item.title}
              className="
  group relative
  rounded-xl sm:rounded-2xl
  border border-black/10
  bg-white/50 dark:bg-background/10
  backdrop-blur-xl
  p-4 sm:p-6 md:p-8
  text-center
  shadow-md
  hover:shadow-2xl hover:-translate-y-1
  transition-all duration-300
"
            >
              {/* STEP NUMBER BADGE */}
              <div className="
                absolute left-1/2 -translate-x-1/2
                text-[8px] px-3 py-1
                rounded-full
                bg-primary text-primary-foreground
                font-semibold tracking-wider
                shadow
              ">
                STEP {item.step}
              </div>

              {/* ICON */}
              <div className="
               w-12 h-12 sm:w-14 sm:h-14 mb-3 sm:mb-5
                rounded-xl
                bg-primary/10
                flex items-center justify-center
                group-hover:bg-primary/20
                transition-all duration-300
              ">
                <item.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>

              {/* TITLE */}
              <h3 className="font-serif -mt-5 md:-mt-5  text-base sm:text-lg md:text-xl font-semibold mb-2">
                {item.title}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-muted-foreground text-[11px] -mt-2 md:-mt-2 sm:text-xs md:text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};
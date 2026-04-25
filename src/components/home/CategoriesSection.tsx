

import { Link } from 'react-router-dom';
import {
  Users, Shield, Building, Home, Globe, Briefcase,
  Calculator, Lightbulb, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const categories = [
  { name: 'Family Law', icon: Users, description: 'Divorce, custody, adoption' },
  { name: 'Criminal Law', icon: Shield, description: 'Defense, bail, appeals' },
  { name: 'Corporate Law', icon: Building, description: 'Business, contracts' },
  { name: 'Property Law', icon: Home, description: 'Real estate, disputes' },
  { name: 'Immigration Law', icon: Globe, description: 'Visas, citizenship' },
  { name: 'Labor Law', icon: Briefcase, description: 'Employment rights' },
  { name: 'Tax Law', icon: Calculator, description: 'Tax planning, disputes' },
  { name: 'Intellectual Property', icon: Lightbulb, description: 'Patents, trademarks' },
];

export const CategoriesSection = () => {
  return (
    <section className="py-12 sm:py-16 -mt-5 md:-mt-5 md:py-20 bg-muted/30 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center mb-10 sm:mb-14">
          {/* <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Try once
          </p> */}
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
            Practice Areas
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
            Find lawyers specialized in your specific legal needs
          </p>



        </div>


        {/* GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">

          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={`/login?role=client=${encodeURIComponent(category.name)}`}
              className="
                group
                p-3 sm:p-4 md:p-5
                rounded-lg sm:rounded-xl
                border border-black/10
                bg-background/80 backdrop-blur-md
                shadow-sm
                hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30
                transition-all duration-300
              "
              style={{ animationDelay: `${index * 0.04}s` }}
            >
              {/* ICON */}
              <div className="
                w-9 h-9 sm:w-10 sm:h-10
                rounded-md
                bg-primary/10
                flex items-center justify-center
                mb-2 sm:mb-3
                group-hover:bg-primary
                transition-all duration-300
              ">
                <category.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary group-hover:text-white transition-colors" />
              </div>

              {/* TITLE */}
              <h3 className="font-medium text-sm sm:text-base leading-tight mb-0.5">
                {category.name}
              </h3>

              {/* DESCRIPTION */}
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
                {category.description}
              </p>
            </Link>


          ))}


        </div>
        {/* BOTTOM CTA BUTTON */}
        <div className="flex justify-center mt-8 sm:mt-10">
          <Button
            variant="outline"
            size="sm"
            className="group rounded-full px-5"
            asChild
          >
            <Link to="/login?role=client">
              View All
              <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>


      </div>

    </section>


  );
};
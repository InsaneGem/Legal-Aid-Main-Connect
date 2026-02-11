import { Link } from 'react-router-dom';
import { 
  Users, Shield, Building, Home, Globe, Briefcase, 
  Calculator, Lightbulb, Scale, ShieldCheck, ArrowRight 
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
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
              Practice Areas
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Find lawyers specialized in your specific legal needs
            </p>
          </div>
          <Button variant="ghost" className="mt-4 md:mt-0 group" asChild>
            <Link to="/categories">
              View All Areas
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={`/lawyers?category=${encodeURIComponent(category.name)}`}
              className="group p-6 bg-card border border-border rounded-lg hover:shadow-card hover:border-primary/20 transition-all duration-300 animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <category.icon className="h-8 w-8 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-1">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

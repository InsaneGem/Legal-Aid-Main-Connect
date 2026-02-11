import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Scale, 
  Building2, 
  Users, 
  FileText, 
  Briefcase, 
  Shield,
  Home,
  Car,
  Landmark,
  Heart,
  Globe,
  Gavel,
  ArrowRight
} from 'lucide-react';
const categories = [
  {
    icon: Users,
    name: 'Family Law',
    description: 'Divorce, child custody, adoption, domestic violence, alimony, and matrimonial disputes.',
    lawyers: 45,
    color: 'bg-rose-500/10 text-rose-600'
  },
  {
    icon: Briefcase,
    name: 'Corporate Law',
    description: 'Business formation, contracts, mergers & acquisitions, compliance, and corporate governance.',
    lawyers: 38,
    color: 'bg-blue-500/10 text-blue-600'
  },
  {
    icon: Gavel,
    name: 'Criminal Law',
    description: 'Criminal defense, bail matters, white-collar crimes, cybercrime, and fraud cases.',
    lawyers: 52,
    color: 'bg-red-500/10 text-red-600'
  },
  {
    icon: Home,
    name: 'Property Law',
    description: 'Real estate transactions, property disputes, tenant rights, land acquisition, and title verification.',
    lawyers: 41,
    color: 'bg-green-500/10 text-green-600'
  },
  {
    icon: FileText,
    name: 'Civil Litigation',
    description: 'Contract disputes, debt recovery, defamation, consumer protection, and injunctions.',
    lawyers: 36,
    color: 'bg-purple-500/10 text-purple-600'
  },
  {
    icon: Building2,
    name: 'Employment Law',
    description: 'Wrongful termination, workplace harassment, employment contracts, and labor disputes.',
    lawyers: 29,
    color: 'bg-orange-500/10 text-orange-600'
  },
  {
    icon: Shield,
    name: 'Insurance Law',
    description: 'Insurance claims, policy disputes, medical insurance, and accident claims.',
    lawyers: 24,
    color: 'bg-cyan-500/10 text-cyan-600'
  },
  {
    icon: Landmark,
    name: 'Tax Law',
    description: 'Income tax, GST, tax planning, tax disputes, and regulatory compliance.',
    lawyers: 31,
    color: 'bg-amber-500/10 text-amber-600'
  },
  {
    icon: Globe,
    name: 'Immigration Law',
    description: 'Visa applications, citizenship, deportation defense, and work permits.',
    lawyers: 22,
    color: 'bg-indigo-500/10 text-indigo-600'
  },
  {
    icon: Heart,
    name: 'Medical Law',
    description: 'Medical malpractice, patient rights, healthcare regulations, and insurance disputes.',
    lawyers: 18,
    color: 'bg-pink-500/10 text-pink-600'
  },
  {
    icon: Car,
    name: 'Motor Accident Claims',
    description: 'Vehicle accidents, insurance claims, personal injury, and compensation recovery.',
    lawyers: 27,
    color: 'bg-slate-500/10 text-slate-600'
  },
  {
    icon: Scale,
    name: 'Constitutional Law',
    description: 'Fundamental rights, PIL, judicial review, and constitutional remedies.',
    lawyers: 15,
    color: 'bg-teal-500/10 text-teal-600'
  },
];
const Categories = () => {
  const navigate = useNavigate();
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            Practice Areas
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto animate-fade-in">
            Find specialized lawyers across various legal domains. Our verified experts 
            are ready to help you with any legal matter.
          </p>
        </div>
      </section>
      {/* Categories Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Card 
                key={category.name}
                className="card-premium group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => navigate(`/lawyers?category=${encodeURIComponent(category.name)}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 rounded-xl ${category.color} flex items-center justify-center`}>
                      <category.icon className="h-7 w-7" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {category.lawyers} Lawyers
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="font-serif text-xl mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm mb-4">
                    {category.description}
                  </p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto group/btn">
                    Find Lawyers
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-serif text-4xl font-bold text-primary mb-2">12+</div>
              <div className="text-muted-foreground">Practice Areas</div>
            </div>
            <div>
              <div className="font-serif text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Verified Lawyers</div>
            </div>
            <div>
              <div className="font-serif text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Consultations</div>
            </div>
            <div>
              <div className="font-serif text-4xl font-bold text-primary mb-2">4.9</div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">
            Can't Find Your Category?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Contact us and we'll help you find the right legal expert for your specific needs.
          </p>
          <Button size="lg" onClick={() => navigate('/contact')}>
            Contact Us
          </Button>
        </div>
      </section>
    </MainLayout>
  );
};
export default Categories;
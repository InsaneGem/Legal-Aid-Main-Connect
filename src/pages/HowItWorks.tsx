import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  UserCheck, 
  Calendar, 
  MessageSquare, 
  Video, 
  Shield,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Find Your Lawyer',
    description: 'Browse our verified network of experienced lawyers. Filter by practice area, language, experience, and ratings to find the perfect match for your legal needs.',
    details: ['Search by specialization', 'View detailed profiles', 'Check verified credentials', 'Read client reviews']
  },
  {
    icon: UserCheck,
    title: 'Review & Select',
    description: 'Compare lawyer profiles, check their qualifications, bar council verification, and read reviews from previous clients to make an informed decision.',
    details: ['Bar council verified', 'Experience details', 'Success rate stats', 'Client testimonials']
  },
  {
    icon: Calendar,
    title: 'Book Consultation',
    description: 'Choose your preferred consultation type - chat, audio, or video call. Select a convenient time slot and make a secure payment to confirm your booking.',
    details: ['Flexible scheduling', 'Multiple modes', 'Secure payments', 'Instant confirmation']
  },
  {
    icon: MessageSquare,
    title: 'Get Legal Advice',
    description: 'Connect with your lawyer through our secure platform. Discuss your case, get expert legal advice, and receive guidance on your next steps.',
    details: ['End-to-end encrypted', 'Private & confidential', 'Document sharing', 'Session recording']
  },
];

const features = [
  {
    icon: Shield,
    title: 'Verified Lawyers',
    description: 'All lawyers on our platform undergo strict verification including Bar Council registration and credential checks.'
  },
  {
    icon: Video,
    title: 'Multiple Consultation Modes',
    description: 'Choose from chat, audio, or video consultations based on your preference and the complexity of your case.'
  },
  {
    icon: CheckCircle2,
    title: 'Secure & Confidential',
    description: 'Your conversations are protected with end-to-end encryption. We take attorney-client privilege seriously.'
  },
];

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            How LEGALMATE Works
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8 animate-fade-in">
            Getting expert legal advice has never been easier. Follow these simple steps 
            to connect with verified lawyers and get the help you need.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            {steps.map((step, index) => (
              <div 
                key={step.title}
                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center animate-slide-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                      <step.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-serif font-bold text-muted-foreground/30">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <h3 className="font-serif text-2xl font-semibold">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4 ml-20">
                    {step.description}
                  </p>
                  <ul className="grid grid-cols-2 gap-2 ml-20">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <Card className="card-premium">
                    <CardContent className="p-8 flex items-center justify-center min-h-[250px]">
                      <step.icon className="h-32 w-32 text-muted-foreground/20" />
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">
            Why Choose LEGALMATE?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="card-premium animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Join thousands of clients who have received expert legal guidance through LEGALMATE.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="group"
              onClick={() => navigate('/lawyers')}
            >
              Find a Lawyer
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/signup?role=lawyer')}
            >
              Join as Lawyer
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default HowItWorks;

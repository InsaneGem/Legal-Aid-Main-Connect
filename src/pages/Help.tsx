import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  Search,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Users,
  CreditCard,
  Shield,
  HelpCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

const helpCategories = [
  {
    icon: Users,
    title: 'Getting Started',
    description: 'Learn how to create an account, find lawyers, and book your first consultation.',
    articles: ['How to sign up', 'Finding the right lawyer', 'Booking a consultation'],
    link: '/faq#getting-started'
  },
  {
    icon: MessageCircle,
    title: 'Consultations',
    description: 'Everything about chat, audio, and video consultations on our platform.',
    articles: ['Joining a consultation', 'Consultation types', 'Recording sessions'],
    link: '/faq#consultations'
  },
  {
    icon: CreditCard,
    title: 'Payments & Billing',
    description: 'Information about payment methods, pricing, invoices, and refunds.',
    articles: ['Payment methods', 'Understanding pricing', 'Requesting refunds'],
    link: '/faq#payments'
  },
  {
    icon: Shield,
    title: 'Privacy & Security',
    description: 'How we protect your data and ensure confidential attorney-client communication.',
    articles: ['Data protection', 'End-to-end encryption', 'Privacy practices'],
    link: '/privacy'
  },
  {
    icon: FileText,
    title: 'For Lawyers',
    description: 'Resources for lawyers joining our platform and managing their practice.',
    articles: ['Joining as a lawyer', 'Setting up your profile', 'Managing bookings'],
    link: '/faq#lawyers'
  },
  {
    icon: HelpCircle,
    title: 'Technical Support',
    description: 'Troubleshooting common issues with video calls, audio, and the platform.',
    articles: ['Video call issues', 'Audio problems', 'Browser compatibility'],
    link: '/faq#technical'
  },
];

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            Help Center
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8 animate-fade-in">
            Find answers to your questions and get the support you need.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-xl mx-auto relative animate-slide-up">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for help articles..."
              className="pl-12 h-14 text-lg bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-2xl font-bold text-center mb-12">
            Browse Help Topics
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <Card 
                key={category.title}
                className="card-premium group cursor-pointer hover:shadow-xl transition-all animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => navigate(category.link)}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-serif text-xl group-hover:text-primary transition-colors">
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    {category.description}
                  </p>
                  <ul className="space-y-2">
                    {category.articles.map((article) => (
                      <li key={article} className="flex items-center gap-2 text-sm">
                        <ArrowRight className="h-3 w-3 text-primary" />
                        {article}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-2xl font-bold text-center mb-4">
            Still Need Help?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Our support team is available to assist you with any questions or concerns.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="card-premium text-center">
              <CardContent className="pt-8">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Get a response within 24 hours
                </p>
                <Button variant="outline" onClick={() => navigate('/contact')}>
                  Send Email
                </Button>
              </CardContent>
            </Card>
            
            <Card className="card-premium text-center">
              <CardContent className="pt-8">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Chat with us Mon-Sat, 9am-6pm
                </p>
                <Button variant="outline">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
            
            <Card className="card-premium text-center">
              <CardContent className="pt-8">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Phone Support</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Call us for urgent matters
                </p>
                <Button variant="outline">
                  +1 (800) 123-4567
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-xl font-bold mb-6">Quick Links</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/faq')}>
              FAQ <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={() => navigate('/terms')}>
              Terms of Service <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={() => navigate('/privacy')}>
              Privacy Policy <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="ghost" onClick={() => navigate('/refund')}>
              Refund Policy <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Help;

// import { MainLayout } from '@/components/layout/MainLayout';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Users, Scale, Shield, Phone, MapPin,
  FileText, ArrowRight, BookOpen, HandHeart, Gavel, Globe
} from 'lucide-react';

const eligibilityCriteria = [
  'Members of Scheduled Castes or Scheduled Tribes',
  'Victims of trafficking or bonded labour',
  'Women and children',
  'Persons with disabilities (mental or physical)',
  'Persons in custody (including protective custody)',
  'Industrial workmen',
  'Victims of mass disasters, ethnic violence, caste atrocity, flood, drought, earthquake, or industrial disaster',
  'Persons whose annual income does not exceed ₹3,00,000 (Supreme Court) or ₹1,00,000 (other courts, varies by state)',
];

const legalAidBodies = [
  {
    icon: Gavel,
    title: 'National Legal Services Authority (NALSA)',
    description: 'The apex body constituted under the Legal Services Authorities Act, 1987 to provide free legal services to eligible persons and organize Lok Adalats for amicable settlement of disputes.',
    website: 'https://nalsa.gov.in',
    services: ['Free legal representation', 'Lok Adalats', 'Legal awareness camps', 'Victim compensation schemes']
  },
  {
    icon: Scale,
    title: 'State Legal Services Authorities (SLSA)',
    description: 'Each state has its own Legal Services Authority that works under NALSA to provide free legal aid at the state level. They coordinate with District Legal Services Authorities.',
    services: ['State-level free legal aid', 'Permanent Lok Adalats', 'Para-legal volunteer programs', 'Legal literacy missions']
  },
  {
    icon: Users,
    title: 'District Legal Services Authorities (DLSA)',
    description: 'Established in every district, DLSAs are the most accessible point for free legal aid. They operate front offices in district courts where any eligible person can walk in and seek help.',
    services: ['Front office legal assistance', 'District Lok Adalats', 'Legal aid clinics', 'ADR (Alternative Dispute Resolution) centres']
  },
  {
    icon: BookOpen,
    title: 'Legal Aid Clinics in Law Schools',
    description: 'Many law universities run free legal aid clinics where law students, supervised by faculty, provide basic legal advice and assistance to the community.',
    services: ['Free legal consultations', 'Drafting of legal documents', 'Legal awareness workshops', 'Community outreach programs']
  },
];

const proBonoInfo = [
  {
    icon: HandHeart,
    title: 'What is Pro Bono?',
    description: 'Pro bono legal work refers to professional legal services provided voluntarily and without charge. Many advocates in India dedicate a portion of their practice to pro bono work for the underprivileged.'
  },
  {
    icon: Globe,
    title: 'Bar Council Guidelines',
    description: 'The Bar Council of India encourages advocates to undertake pro bono work. Several High Courts and Bar Associations maintain panels of advocates willing to appear pro bono in deserving cases.'
  },
  {
    icon: Shield,
    title: 'LEGALMATE Pro Bono Initiative',
    description: 'On LEGALMATE, select lawyers offer free initial consultations for eligible clients. Look for the "Pro Bono Available" badge on lawyer profiles to find lawyers offering free legal assistance.'
  },
];

const helplineNumbers = [
  { name: 'NALSA Helpline', number: '15100', description: 'National toll-free legal aid helpline' },
  { name: 'Women Helpline', number: '181', description: 'For women in distress' },
  { name: 'Child Helpline', number: '1098', description: 'For children in need of care and protection' },
  { name: 'Senior Citizen Helpline', number: '14567', description: 'Elder abuse and assistance' },
  { name: 'Cyber Crime Helpline', number: '1930', description: 'Report cyber crimes and online fraud' },
  { name: 'Consumer Helpline', number: '1915', description: 'Consumer grievance redressal' },
];

const LegalAid = () => {
  const navigate = useNavigate();

  return (
    // <MainLayout>
    <ClientLayout>
      {/* Hero */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
            <Heart className="h-4 w-4 text-white" />
            <span className="text-white/90 text-sm font-medium">Access to Justice for All</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            Legal Aid & Pro Bono
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto animate-fade-in">
            Free and reduced-cost legal services are a constitutional right under Article 39A. 
            Learn about the resources available to ensure no one is denied justice due to economic hardship.
          </p>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold mb-3">Who Is Eligible for Free Legal Aid?</h2>
            <p className="text-muted-foreground">
              Under Section 12 of the Legal Services Authorities Act, 1987, the following persons are entitled to free legal services:
            </p>
          </div>
          <Card className="card-premium">
            <CardContent className="pt-6">
              <ul className="grid md:grid-cols-2 gap-4">
                {eligibilityCriteria.map((criteria) => (
                  <li key={criteria} className="flex items-start gap-3">
                    <ArrowRight className="h-4 w-4 text-primary mt-1 shrink-0" />
                    <span className="text-sm">{criteria}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Legal Aid Bodies */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-2xl font-bold text-center mb-12">Legal Aid Organizations</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {legalAidBodies.map((body, index) => (
              <Card key={body.title} className="card-premium animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <body.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-serif text-lg">{body.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{body.description}</p>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Services Offered</h4>
                  <ul className="space-y-1.5">
                    {body.services.map((service) => (
                      <li key={service} className="flex items-center gap-2 text-sm">
                        <ArrowRight className="h-3 w-3 text-primary" />
                        {service}
                      </li>
                    ))}
                  </ul>
                  {body.website && (
                    <Button variant="outline" size="sm" className="mt-4" asChild>
                      <a href={body.website} target="_blank" rel="noopener noreferrer">Visit Website</a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pro Bono */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-2xl font-bold text-center mb-12">Pro Bono Legal Services</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {proBonoInfo.map((info, index) => (
              <Card key={info.title} className="card-premium animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <info.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{info.title}</h3>
                  <p className="text-muted-foreground text-sm">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Helpline Numbers */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-2xl font-bold text-center mb-4">Important Helpline Numbers</h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            These toll-free helpline numbers are available 24/7 for immediate assistance.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {helplineNumbers.map((helpline) => (
              <Card key={helpline.name} className="card-premium">
                <CardContent className="pt-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{helpline.name}</h3>
                    <p className="text-primary font-bold text-lg">{helpline.number}</p>
                    <p className="text-muted-foreground text-xs">{helpline.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <Scale className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold mb-4">Connect with a Lawyer</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Whether you need free legal aid or affordable legal services, LEGALMATE connects you with the right legal professional.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/lawyers')}>Browse Lawyers</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>Contact Support</Button>
          </div>
        </div>
      </section>
    {/* </MainLayout> */}
    </ClientLayout>
  );
};

export default LegalAid;

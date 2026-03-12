// import { MainLayout } from '@/components/layout/MainLayout';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Scale, Users, Home, Briefcase, Heart, 
  GraduationCap, Vote, FileText, AlertTriangle,
  ArrowRight, BookOpen, Gavel
} from 'lucide-react';

const fundamentalRights = [
  {
    icon: Shield,
    title: 'Right to Equality (Articles 14–18)',
    description: 'Every citizen is equal before the law. Discrimination on grounds of religion, race, caste, sex, or place of birth is prohibited. Untouchability is abolished and equality of opportunity in public employment is guaranteed.',
    details: [
      'Equal protection under the law for all persons',
      'No discrimination by the State on grounds of religion, race, caste, sex, or place of birth',
      'Equal opportunity in matters of public employment',
      'Abolition of untouchability and its practice in any form',
      'Abolition of titles except military and academic distinctions'
    ]
  },
  {
    icon: Users,
    title: 'Right to Freedom (Articles 19–22)',
    description: 'Citizens enjoy six fundamental freedoms including freedom of speech and expression, peaceful assembly, forming associations, movement throughout India, residence, and practicing any profession or business.',
    details: [
      'Freedom of speech and expression',
      'Right to assemble peacefully without arms',
      'Right to form associations or unions',
      'Right to move freely throughout India',
      'Right to reside and settle in any part of India',
      'Protection against arrest and detention in certain cases'
    ]
  },
  {
    icon: AlertTriangle,
    title: 'Right Against Exploitation (Articles 23–24)',
    description: 'Human trafficking, forced labour, and child labour in factories are strictly prohibited. No child below 14 years shall be employed in any hazardous occupation.',
    details: [
      'Prohibition of traffic in human beings and forced labour',
      'Prohibition of employment of children below 14 years in hazardous jobs',
      'Protection against bonded labour practices',
      'Right to fair wages and humane working conditions'
    ]
  },
  {
    icon: Heart,
    title: 'Right to Freedom of Religion (Articles 25–28)',
    description: 'Every person has the right to freely profess, practice, and propagate any religion. Religious communities can manage their own affairs and establish institutions.',
    details: [
      'Freedom of conscience and free profession, practice, and propagation of religion',
      'Freedom to manage religious affairs',
      'Freedom from taxation for promotion of any particular religion',
      'Freedom from religious instruction in certain educational institutions'
    ]
  },
  {
    icon: GraduationCap,
    title: 'Cultural & Educational Rights (Articles 29–30)',
    description: 'Minorities have the right to conserve their culture, language, and script. They also have the right to establish and administer educational institutions of their choice.',
    details: [
      'Protection of interests of minorities',
      'Right of minorities to establish and administer educational institutions',
      'Protection of language, script, and culture of minorities',
      'No citizen denied admission to educational institutions on grounds of religion, race, caste, or language'
    ]
  },
  {
    icon: Gavel,
    title: 'Right to Constitutional Remedies (Article 32)',
    description: 'Citizens can approach the Supreme Court or High Courts for enforcement of fundamental rights. Dr. B.R. Ambedkar called this the "heart and soul" of the Constitution.',
    details: [
      'Right to move the Supreme Court for enforcement of fundamental rights',
      'Power of Supreme Court to issue writs including habeas corpus, mandamus, prohibition, certiorari, and quo warranto',
      'Parliament may empower any other court to exercise these powers',
      'Right cannot be suspended except during a national emergency'
    ]
  }
];

const additionalRights = [
  {
    icon: FileText,
    title: 'Right to Information (RTI)',
    description: 'Under the RTI Act 2005, any citizen can request information from public authorities, promoting transparency and accountability in government.',
  },
  {
    icon: Home,
    title: 'Consumer Rights',
    description: 'The Consumer Protection Act 2019 provides rights including right to safety, right to be informed, right to choose, right to be heard, right to seek redressal, and right to consumer education.',
  },
  {
    icon: Briefcase,
    title: 'Labour Rights',
    description: 'Workers are protected under various labour laws ensuring minimum wages, safe working conditions, social security benefits, and protection against unfair dismissal.',
  },
  {
    icon: Vote,
    title: 'Right to Vote',
    description: 'Every citizen of India who is 18 years or above is entitled to vote in elections. The right to vote is a constitutional right under Article 326.',
  },
];

const KnowYourRights = () => {
  const navigate = useNavigate();

  return (
    // <MainLayout>
    <ClientLayout>
      {/* Hero */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
            <Scale className="h-4 w-4 text-white" />
            <span className="text-white/90 text-sm font-medium">Constitutional Rights of India</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            Know Your Rights
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto animate-fade-in">
            Understanding your fundamental legal rights is the first step towards justice. 
            Learn about the rights guaranteed to every citizen under the Constitution of India.
          </p>
        </div>
      </section>

      {/* Fundamental Rights */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl font-bold mb-3">Fundamental Rights</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Part III of the Indian Constitution (Articles 12–35) guarantees six fundamental rights to all citizens.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fundamentalRights.map((right, index) => (
              <Card 
                key={right.title}
                className="card-premium animate-slide-up border-t-2 border-t-primary/10"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <right.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-serif text-lg">{right.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{right.description}</p>
                  <ul className="space-y-2">
                    {right.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-3 w-3 text-primary mt-1.5 shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Rights */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-2xl font-bold text-center mb-12">Other Important Rights</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalRights.map((right, index) => (
              <Card key={right.title} className="card-premium animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <right.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{right.title}</h3>
                  <p className="text-muted-foreground text-sm">{right.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold mb-4">Need Legal Advice?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            If you believe your rights have been violated, consult with a qualified lawyer on LEGALMATE to understand your legal options.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/lawyers')}>Find a Lawyer</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/legal-guides')}>Read Legal Guides</Button>
          </div>
        </div>
      </section>
    {/* </MainLayout> */}
    </ClientLayout>
  );
};

export default KnowYourRights;

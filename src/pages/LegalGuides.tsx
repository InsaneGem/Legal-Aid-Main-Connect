// import { MainLayout } from '@/components/layout/MainLayout';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  FileText, Home, Briefcase, Users, Car, Heart,
  Building, Shield, Scale, ArrowRight, BookOpen,
  ClipboardList, AlertCircle
} from 'lucide-react';

const legalGuides = [
  {
    icon: ClipboardList,
    title: 'Filing an FIR (First Information Report)',
    category: 'Criminal Law',
    steps: [
      'Visit the nearest police station with jurisdiction over the area where the offence occurred.',
      'Provide a written or oral complaint describing the incident in detail.',
      'The officer in charge is legally bound to register an FIR for cognizable offences under Section 154 of CrPC.',
      'If the police refuse, you can send a written complaint to the Superintendent of Police or file a complaint before the Magistrate under Section 156(3) CrPC.',
      'Obtain a free copy of the FIR as per your right under law.',
      'Zero FIR can be filed at any police station regardless of jurisdiction.'
    ],
    important: 'Under Section 154 CrPC, the police cannot refuse to register an FIR for a cognizable offence. If refused, you can approach the Superintendent of Police or a Judicial Magistrate.'
  },
  {
    icon: Home,
    title: 'Property Registration Process',
    category: 'Property Law',
    steps: [
      'Verify the property title by conducting a title search at the Sub-Registrar office for at least 30 years.',
      'Obtain an Encumbrance Certificate (EC) to ensure the property is free from legal dues or mortgages.',
      'Draft a Sale Deed on stamp paper of the appropriate value as per state stamp duty rates.',
      'Both buyer and seller must visit the Sub-Registrar office with two witnesses for document registration.',
      'Pay the applicable stamp duty (typically 5–7% of property value) and registration fee (1%).',
      'After registration, apply for mutation of property records at the local municipal office.',
      'Obtain a certified copy of the registered Sale Deed for your records.'
    ],
    important: 'Always verify the RERA registration for under-construction properties. Check for any pending litigation using the e-Courts portal.'
  },
  {
    icon: Heart,
    title: 'Filing for Divorce',
    category: 'Family Law',
    steps: [
      'Determine the type of divorce: Mutual Consent (Section 13B, Hindu Marriage Act) or Contested Divorce.',
      'For Mutual Consent: Both spouses jointly file a petition before the Family Court with required documents.',
      'A mandatory cooling-off period of 6 months (waivable by court) is required after the first motion.',
      'After the cooling period, file the second motion to confirm the intention to divorce.',
      'For Contested Divorce: File a petition on specified grounds such as cruelty, adultery, desertion (2+ years), mental disorder, or conversion.',
      'The court may refer the case for mediation before proceeding to trial.',
      'Gather evidence, witness testimonies, and relevant documents to support your case.'
    ],
    important: 'Mediation is encouraged by courts before proceeding with contested divorces. Free legal aid is available for those who cannot afford a lawyer.'
  },
  {
    icon: Briefcase,
    title: 'Filing a Labour Complaint',
    category: 'Employment Law',
    steps: [
      'Document the violation: unpaid wages, wrongful termination, harassment, or unsafe conditions.',
      "File a complaint with the Labour Commissioner's office in your district.",
      'For wage disputes, approach the Authority under the Payment of Wages Act within 12 months.',
      'For wrongful termination, file a case before the Industrial Tribunal or Labour Court.',
      'Sexual harassment complaints should be filed with the Internal Complaints Committee (ICC) or Local Complaints Committee (LCC).',
      'Under the Industrial Disputes Act, a conciliation proceeding is initiated before the matter goes to court.',
      'Keep copies of employment contracts, salary slips, and all correspondence as evidence.'
    ],
    important: 'Employees in establishments with 10+ workers are protected under the Sexual Harassment of Women at Workplace Act, 2013.'
  },
  {
    icon: Car,
    title: 'Motor Accident Claim',
    category: 'Insurance Law',
    steps: [
      'Report the accident to the nearest police station and obtain an FIR copy.',
      'Get a medical examination report documenting all injuries sustained.',
      'File a claim petition before the Motor Accident Claims Tribunal (MACT) in the district where the accident occurred.',
      'The claim can be filed by the victim, legal heirs (in case of death), or an authorized agent.',
      'Submit supporting documents: FIR, medical bills, income proof, vehicle registration, insurance details.',
      'The Tribunal determines compensation based on the multiplier method considering age, income, and disability.',
      'Claims under Section 166 MV Act have no cap on compensation amount.'
    ],
    important: 'There is no limitation period for filing a motor accident claim, but it is advisable to file within 6 months of the accident.'
  },
  {
    icon: Building,
    title: 'Consumer Complaint Filing',
    category: 'Consumer Law',
    steps: [
      'Send a legal notice to the opposite party detailing the deficiency in service or defect in goods.',
      'If unresolved, file a complaint on the e-Daakhil portal (edaakhil.nic.in) or directly at the Consumer Forum.',
      'District Forum: Claims up to ₹1 crore. State Commission: ₹1 crore to ₹10 crore. National Commission: Above ₹10 crore.',
      'Attach supporting documents: bills, receipts, warranty cards, correspondence, photographs.',
      'No court fee is required for claims up to ₹5 lakhs. Nominal fees for higher amounts.',
      'The complaint must be filed within 2 years from the date of the cause of action.',
      'Hearings are conducted, and the Forum can order compensation, replacement, refund, or punitive damages.'
    ],
    important: 'E-filing is available through the e-Daakhil portal. The Consumer Protection Act, 2019 also covers e-commerce transactions and unfair trade practices.'
  },
];

const quickLinks = [
  { title: 'e-Courts Services', description: 'Check case status online', url: 'https://ecourts.gov.in' },
  { title: 'e-Daakhil Portal', description: 'File consumer complaints online', url: 'https://edaakhil.nic.in' },
  { title: 'NALSA', description: 'Free legal aid services', url: 'https://nalsa.gov.in' },
  { title: 'India Code', description: 'Access all Indian laws', url: 'https://www.indiacode.nic.in' },
];

const LegalGuides = () => {
  const navigate = useNavigate();

  return (
    // <MainLayout>
    <ClientLayout>
      {/* Hero */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
            <BookOpen className="h-4 w-4 text-white" />
            <span className="text-white/90 text-sm font-medium">Step-by-Step Procedures</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            Legal Guides
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto animate-fade-in">
            Comprehensive step-by-step guides for common legal procedures in India. 
            Understand the process before consulting with a lawyer.
          </p>
        </div>
      </section>

      {/* Guides */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="space-y-10">
            {legalGuides.map((guide, index) => (
              <Card 
                key={guide.title} 
                className="card-premium animate-slide-up overflow-hidden"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="border-b bg-secondary/50">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <guide.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{guide.category}</span>
                      <CardTitle className="font-serif text-xl mt-1">{guide.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <ol className="space-y-3 mb-6">
                    {guide.steps.map((step, stepIndex) => (
                      <li key={stepIndex} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {stepIndex + 1}
                        </span>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="bg-secondary rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Important Note</span>
                      <p className="text-sm mt-1">{guide.important}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-2xl font-bold text-center mb-10">Useful Government Portals</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {quickLinks.map((link) => (
              <Card key={link.title} className="card-premium text-center">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-1">{link.title}</h3>
                  <p className="text-muted-foreground text-xs mb-3">{link.description}</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">Visit Portal</a>
                  </Button>
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
          <h2 className="font-serif text-2xl font-bold mb-4">Need Professional Legal Help?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            These guides are for informational purposes. For specific legal matters, consult a qualified lawyer on LEGALMATE.
          </p>
          <Button size="lg" onClick={() => navigate('/lawyers')}>Consult a Lawyer Now</Button>
        </div>
      </section>
    {/* </MainLayout> */}
    </ClientLayout>
  );
};

export default LegalGuides;

// import { MainLayout } from '@/components/layout/MainLayout';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Shield, AlertTriangle, FileText, Phone, Globe,
  ShoppingCart, CreditCard, Wifi, Home, Car,
  ArrowRight, Scale, CheckCircle, XCircle
} from 'lucide-react';

const consumerRights = [
  { title: 'Right to Safety', description: 'Protection against goods and services that are hazardous to life and property.', icon: Shield },
  { title: 'Right to Be Informed', description: 'Right to be informed about quality, quantity, potency, purity, standard, and price of goods or services.', icon: FileText },
  { title: 'Right to Choose', description: 'Right to access a variety of goods and services at competitive prices.', icon: ShoppingCart },
  { title: 'Right to Be Heard', description: 'Right to be heard and assured that consumer interests will receive due consideration.', icon: Phone },
  { title: 'Right to Seek Redressal', description: 'Right to seek redressal against unfair trade practices, exploitation, or restrictive trade practices.', icon: Scale },
  { title: 'Right to Consumer Education', description: 'Right to acquire knowledge and skills to be an informed consumer throughout life.', icon: Globe },
];

const commonFrauds = [
  {
    icon: CreditCard,
    title: 'Online Banking & UPI Fraud',
    description: 'Fraudsters impersonate bank officials and request OTPs, PINs, or card details. They may use phishing links or fake UPI payment requests.',
    prevention: [
      'Never share OTP, PIN, CVV, or card details with anyone',
      'Banks never ask for sensitive details over phone or SMS',
      'Verify UPI payment requests carefully before approving',
      'Report immediately to your bank and call 1930 (Cyber Crime Helpline)'
    ]
  },
  {
    icon: Wifi,
    title: 'E-Commerce Fraud',
    description: 'Fake websites, counterfeit products, non-delivery of goods, or different products delivered than what was ordered on online shopping platforms.',
    prevention: [
      'Shop only from verified and reputed e-commerce platforms',
      'Check seller ratings and reviews before purchasing',
      'Use Cash on Delivery for unfamiliar sellers',
      'File a complaint on the National Consumer Helpline (1915) or e-Daakhil portal'
    ]
  },
  {
    icon: Home,
    title: 'Real Estate Fraud',
    description: 'Selling the same property to multiple buyers, misrepresenting property details, delays in possession beyond RERA timelines, or charging hidden costs.',
    prevention: [
      'Verify RERA registration of the project on the state RERA website',
      "Conduct a thorough title search at the Sub-Registrar's office",
      'Never pay advance without a proper registered agreement',
      'File complaints with the respective state RERA authority'
    ]
  },
  {
    icon: Car,
    title: 'Insurance Fraud',
    description: 'Mis-selling of insurance policies, unreasonable claim rejections, hidden terms, or agents misrepresenting policy benefits and coverage.',
    prevention: [
      'Read all policy documents carefully before signing',
      "Verify the agent's license on IRDAI's website",
      'File complaints with the Insurance Ombudsman if claims are unfairly rejected',
      'Use the free 15-day look-in period to cancel unwanted policies'
    ]
  },
];

const filingSteps = [
  {
    step: 1,
    title: 'Send a Legal Notice',
    description: 'Draft and send a legal notice to the opposite party through registered post, clearly stating your grievance and the relief sought. Allow 15–30 days for response.'
  },
  {
    step: 2,
    title: 'Register on e-Daakhil Portal',
    description: 'Visit edaakhil.nic.in and create an account. This is the official online portal for filing consumer complaints across all Consumer Commissions in India.'
  },
  {
    step: 3,
    title: 'Choose the Right Forum',
    description: 'District Commission: Up to ₹1 Crore | State Commission: ₹1 Cr – ₹10 Cr | National Commission: Above ₹10 Crore. File in the jurisdiction where the opposite party resides or the transaction took place.'
  },
  {
    step: 4,
    title: 'Prepare Your Complaint',
    description: 'Draft the complaint with details of the transaction, the deficiency or defect, the loss suffered, and the relief claimed. Attach bills, receipts, warranty cards, correspondence, and photographs.'
  },
  {
    step: 5,
    title: 'Pay the Court Fee',
    description: 'No fee for claims up to ₹5 lakhs. Nominal fees ranging from ₹200 to ₹5,000 for higher amounts. Fee can be paid online through the e-Daakhil portal.'
  },
  {
    step: 6,
    title: 'Attend Hearings',
    description: 'After filing, the Commission issues notice to the opposite party. Both parties present evidence and arguments. The Commission orders appropriate relief including compensation, refund, replacement, or punitive damages.'
  },
];

const ConsumerProtection = () => {
  const navigate = useNavigate();

  return (
    // <MainLayout>
    <ClientLayout>
      {/* Hero */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-6">
            <Shield className="h-4 w-4 text-white" />
            <span className="text-white/90 text-sm font-medium">Consumer Protection Act, 2019</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            Consumer Protection
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto animate-fade-in">
            Know your rights as a consumer, learn how to identify fraud, and understand 
            the process of filing complaints for effective redressal.
          </p>
        </div>
      </section>

      {/* Consumer Rights */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl font-bold mb-3">Your 6 Consumer Rights</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The Consumer Protection Act, 2019 guarantees these fundamental rights to every consumer in India.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {consumerRights.map((right, index) => (
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

      {/* Common Frauds */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl font-bold mb-3">Common Consumer Frauds & Prevention</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stay alert and protect yourself from these prevalent consumer frauds in India.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {commonFrauds.map((fraud, index) => (
              <Card key={fraud.title} className="card-premium animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                      <fraud.icon className="h-5 w-5 text-destructive" />
                    </div>
                    <CardTitle className="font-serif text-lg">{fraud.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{fraud.description}</p>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">How to Protect Yourself</h4>
                  <ul className="space-y-2">
                    {fraud.prevention.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-3.5 w-3.5 text-primary mt-1 shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Filing Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-14">
            <h2 className="font-serif text-2xl font-bold mb-3">How to File a Consumer Complaint</h2>
            <p className="text-muted-foreground">
              Follow these steps to file a complaint under the Consumer Protection Act, 2019.
            </p>
          </div>
          <div className="space-y-6">
            {filingSteps.map((item) => (
              <div key={item.step} className="flex gap-5 animate-slide-up" style={{ animationDelay: `${item.step * 0.05}s` }}>
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center shrink-0 text-sm">
                  {item.step}
                </div>
                <div className="pb-6 border-b last:border-0">
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <AlertTriangle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold mb-4">Been a Victim of Consumer Fraud?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Don't stay silent. Consult with a consumer rights lawyer on LEGALMATE to get expert guidance on filing your complaint and recovering damages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/lawyers')}>Consult a Lawyer</Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/legal-guides')}>Read Legal Guides</Button>
          </div>
        </div>
      </section>
    {/* </MainLayout> */}
    </ClientLayout>
  );
};

export default ConsumerProtection;

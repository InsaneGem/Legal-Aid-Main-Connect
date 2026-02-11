import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle, MessageCircle } from 'lucide-react';

const faqCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    questions: [
      {
        q: 'How do I create an account on LEGALMATE?',
        a: 'Creating an account is simple. Click on "Get Started" or "Sign Up" button, enter your email address, create a password, and fill in your basic details. You can sign up as a client seeking legal advice or as a lawyer offering services.'
      },
      {
        q: 'Is LEGALMATE free to use?',
        a: 'Creating an account and browsing lawyer profiles is completely free. You only pay when you book a consultation with a lawyer. Each lawyer sets their own consultation rates, which are clearly displayed on their profile.'
      },
      {
        q: 'How do I find the right lawyer for my case?',
        a: 'You can search for lawyers by practice area, experience level, language, ratings, and availability. Each lawyer profile includes their qualifications, specializations, client reviews, and consultation rates to help you make an informed decision.'
      },
      {
        q: 'Are the lawyers on LEGALMATE verified?',
        a: 'Yes, all lawyers on our platform undergo a thorough verification process. We verify their Bar Council registration, educational qualifications, and professional credentials before they can offer consultations.'
      }
    ]
  },
  {
    id: 'consultations',
    title: 'Consultations',
    questions: [
      {
        q: 'What types of consultations are available?',
        a: 'We offer three types of consultations: Chat (text-based messaging), Audio Call (voice conversation), and Video Call (face-to-face video conference). Choose based on your preference and the complexity of your legal matter.'
      },
      {
        q: 'How long is a typical consultation?',
        a: 'Consultation duration varies based on the lawyer and type of consultation. Most consultations range from 15 minutes to 1 hour. You can see the exact duration and pricing before booking.'
      },
      {
        q: 'Can I share documents during a consultation?',
        a: 'Yes, you can share documents securely during chat consultations. For audio and video calls, you can share your screen or upload documents beforehand for the lawyer to review.'
      },
      {
        q: 'Are consultations recorded?',
        a: 'Consultations can be recorded with mutual consent for your reference. All recordings are stored securely and are only accessible to you and your lawyer. You can request to have recordings deleted at any time.'
      },
      {
        q: 'What if I miss my scheduled consultation?',
        a: 'If you miss a scheduled consultation without prior notice, you may be charged a no-show fee. We recommend rescheduling at least 2 hours before your appointment if you cannot make it.'
      }
    ]
  },
  {
    id: 'payments',
    title: 'Payments & Billing',
    questions: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards, UPI, net banking, and popular digital wallets. All payments are processed through secure, encrypted payment gateways.'
      },
      {
        q: 'How is the consultation fee calculated?',
        a: 'Each lawyer sets their own rates, either per session or per minute. The total cost is displayed before you confirm your booking. For per-minute billing, you will only be charged for the actual duration of the consultation.'
      },
      {
        q: 'Can I get a refund if I am not satisfied?',
        a: 'Yes, we have a fair refund policy. If you experience technical issues that prevent the consultation, or if the lawyer fails to join, you will receive a full refund. For other concerns, please contact our support team.'
      },
      {
        q: 'Will I receive an invoice for my consultation?',
        a: 'Yes, you will receive a detailed invoice via email after each consultation. You can also access all your invoices from your dashboard under the billing section.'
      }
    ]
  },
  {
    id: 'lawyers',
    title: 'For Lawyers',
    questions: [
      {
        q: 'How can I join LEGALMATE as a lawyer?',
        a: 'Click on "Join as Lawyer" and complete the registration process. You will need to provide your Bar Council registration number, educational qualifications, and practice details. Our team will verify your credentials within 24-48 hours.'
      },
      {
        q: 'How do I set my consultation rates?',
        a: 'Once verified, you can set your own consultation rates from your dashboard. You can choose between per-session or per-minute pricing for different consultation types.'
      },
      {
        q: 'When and how do I receive payments?',
        a: 'Payments are processed weekly. You can withdraw your earnings to your bank account once you have reached the minimum withdrawal threshold. All transactions are tracked in your wallet.'
      },
      {
        q: 'What is the platform commission?',
        a: 'LEGALMATE charges a small commission on each consultation to maintain the platform and provide support services. The exact rate is disclosed during registration.'
      }
    ]
  },
  {
    id: 'technical',
    title: 'Technical Support',
    questions: [
      {
        q: 'What browsers are supported?',
        a: 'LEGALMATE works best on the latest versions of Chrome, Firefox, Safari, and Edge. For video consultations, we recommend using Chrome or Firefox for the best experience.'
      },
      {
        q: 'I am having issues with video/audio. What should I do?',
        a: 'First, ensure your browser has permission to access your camera and microphone. Check your internet connection and try refreshing the page. If issues persist, try using a different browser or contact our support team.'
      },
      {
        q: 'Is my data secure on LEGALMATE?',
        a: 'Absolutely. We use industry-standard encryption for all communications and data storage. Your conversations are protected by end-to-end encryption, and we comply with all applicable data protection regulations.'
      },
      {
        q: 'How do I reset my password?',
        a: 'Click on "Forgot Password" on the login page and enter your registered email address. You will receive a password reset link that is valid for 24 hours.'
      }
    ]
  }
];

const FAQ = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            Frequently Asked Questions
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto animate-fade-in">
            Find answers to common questions about LEGALMATE, our services, 
            and how to get the most out of our platform.
          </p>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {faqCategories.map((category, categoryIndex) => (
            <div 
              key={category.id} 
              id={category.id}
              className="mb-12 animate-slide-up"
              style={{ animationDelay: `${categoryIndex * 0.1}s` }}
            >
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="h-6 w-6 text-primary" />
                <h2 className="font-serif text-2xl font-bold">{category.title}</h2>
              </div>
              
              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`${category.id}-${index}`}
                    className="border rounded-lg px-6 bg-card"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-medium">{faq.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold mb-4">
            Still Have Questions?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Can't find what you're looking for? Our support team is here to help 
            you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/contact')}>
              Contact Support
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/help')}>
              Visit Help Center
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default FAQ;

import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  RefreshCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
const Refund = () => {
  const navigate = useNavigate();
  const lastUpdated = 'February 7, 2026';
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <RefreshCcw className="h-16 w-16 text-white mx-auto mb-6 animate-fade-in" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            Refund Policy
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto animate-fade-in">
            We strive for complete satisfaction. Learn about our fair and 
            transparent refund policy.
          </p>
          <p className="text-white/60 text-sm mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>
      {/* Quick Overview */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="font-serif text-2xl font-bold text-center mb-8">Quick Overview</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="card-premium">
              <CardContent className="pt-8 pb-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Full Refund</h3>
                <p className="text-muted-foreground text-sm">
                  Technical issues preventing consultation
                </p>
              </CardContent>
            </Card>
            <Card className="card-premium">
              <CardContent className="pt-8 pb-6 text-center">
                <Clock className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Partial Refund</h3>
                <p className="text-muted-foreground text-sm">
                  Early termination due to valid reasons
                </p>
              </CardContent>
            </Card>
            <Card className="card-premium">
              <CardContent className="pt-8 pb-6 text-center">
                <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Refund</h3>
                <p className="text-muted-foreground text-sm">
                  Completed consultations or no-shows
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Refund Policy Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <h2 className="font-serif text-2xl font-bold m-0">Eligible for Full Refund</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  You are entitled to a full refund in the following situations:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Lawyer No-Show:</strong> If the lawyer fails to join the consultation within 
                      10 minutes of the scheduled time without prior notice.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Technical Failure:</strong> If our platform experiences technical issues that 
                      prevent the consultation from taking place (verified by our support team).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Advance Cancellation:</strong> If you cancel at least 24 hours before the 
                      scheduled consultation time.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Double Booking:</strong> If a technical error caused you to be charged 
                      multiple times for the same consultation.
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="h-6 w-6 text-amber-600" />
                  <h2 className="font-serif text-2xl font-bold m-0">Eligible for Partial Refund</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  A partial refund may be issued in these circumstances:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Cancellation 2-24 Hours Before:</strong> 50% refund if you cancel between 
                      2 and 24 hours before the scheduled time.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Interrupted Session:</strong> Prorated refund for time lost due to technical 
                      issues during the consultation (subject to verification).
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Quality Concerns:</strong> If you raise a valid complaint about the quality 
                      of service within 24 hours, we may offer a partial refund after investigation.
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="h-6 w-6 text-red-600" />
                  <h2 className="font-serif text-2xl font-bold m-0">Not Eligible for Refund</h2>
                </div>
                <p className="text-muted-foreground mb-4">
                  Refunds will not be issued in the following cases:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Completed Consultations:</strong> Once a consultation has been successfully 
                      completed, no refund will be issued.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Client No-Show:</strong> If you fail to attend the consultation without 
                      prior cancellation.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Late Cancellation:</strong> Cancellations made less than 2 hours before 
                      the scheduled time.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Unfavorable Outcome:</strong> Dissatisfaction with legal advice or case 
                      outcome is not grounds for a refund.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>User-Side Technical Issues:</strong> Problems with your internet, device, 
                      or browser that prevent you from joining.
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">How to Request a Refund</h2>
                </div>
                <p className="text-muted-foreground mb-4">To request a refund, follow these steps:</p>
                <ol className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">1</span>
                    <span className="text-muted-foreground">
                      Log into your LEGALMATE account and go to your consultation history.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">2</span>
                    <span className="text-muted-foreground">
                      Select the consultation for which you want to request a refund.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">3</span>
                    <span className="text-muted-foreground">
                      Click "Request Refund" and provide a detailed explanation of your reason.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">4</span>
                    <span className="text-muted-foreground">
                      Our support team will review your request within 2-3 business days.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">5</span>
                    <span className="text-muted-foreground">
                      Approved refunds will be processed to your original payment method within 5-7 business days.
                    </span>
                  </li>
                </ol>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <HelpCircle className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">Need Help?</h2>
                </div>
                <p className="text-muted-foreground">
                  If you have questions about our refund policy or need assistance with a refund request, 
                  our support team is here to help.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Contact CTA */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-2xl font-bold mb-4">Questions About Refunds?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Our support team is available to assist you with any refund-related inquiries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/contact')}>
              Contact Support
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/faq#payments')}>
              View FAQ
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};
export default Refund;
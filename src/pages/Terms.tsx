import { MainLayout } from '@/components/layout/MainLayout';
import { FileText, Scale, AlertTriangle, CheckCircle, XCircle, Gavel } from 'lucide-react';
const Terms = () => {
  const lastUpdated = 'February 7, 2026';
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <FileText className="h-16 w-16 text-white mx-auto mb-6 animate-fade-in" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            Terms of Service
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto animate-fade-in">
            Please read these terms carefully before using LEGALMATE. By using our 
            services, you agree to be bound by these terms.
          </p>
          <p className="text-white/60 text-sm mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>
      {/* Terms Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">1. Acceptance of Terms</h2>
                </div>
                <p className="text-muted-foreground">
                  By accessing or using LEGALMATE ("the Platform"), you agree to be bound by these Terms of Service 
                  and all applicable laws and regulations. If you do not agree with any of these terms, you are 
                  prohibited from using or accessing this site. The materials contained in this website are 
                  protected by applicable copyright and trademark law.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">2. Description of Services</h2>
                </div>
                <p className="text-muted-foreground">
                  LEGALMATE is an online platform that connects clients seeking legal advice with verified, 
                  licensed lawyers. Our services include:
                </p>
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>Online legal consultations via chat, audio, and video</li>
                  <li>Lawyer directory and search functionality</li>
                  <li>Secure messaging and document sharing</li>
                  <li>Payment processing for consultation fees</li>
                  <li>Consultation scheduling and management</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  <strong>Important:</strong> LEGALMATE is a platform that facilitates connections between 
                  clients and lawyers. We do not provide legal advice directly, and the lawyers on our 
                  platform operate as independent professionals.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">3. User Accounts</h2>
                </div>
                <p className="text-muted-foreground">To use our services, you must:</p>
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Gavel className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">4. Lawyer Verification</h2>
                </div>
                <p className="text-muted-foreground">
                  All lawyers on our platform are required to undergo a verification process that includes:
                </p>
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>Verification of Bar Council registration and license</li>
                  <li>Educational qualification verification</li>
                  <li>Identity verification</li>
                  <li>Agreement to our Lawyer Code of Conduct</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  While we take reasonable steps to verify lawyer credentials, we do not guarantee the quality 
                  of legal advice provided. Clients should exercise their own judgment when selecting a lawyer.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">5. Consultation Terms</h2>
                </div>
                <p className="text-muted-foreground">When booking and participating in consultations:</p>
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>Consultations create an attorney-client relationship between you and the lawyer</li>
                  <li>All communications during consultations are confidential and privileged</li>
                  <li>Recording of sessions requires consent from all parties</li>
                  <li>Cancellations must be made at least 2 hours before the scheduled time</li>
                  <li>No-shows may result in charges as per the cancellation policy</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">6. Payment Terms</h2>
                </div>
                <p className="text-muted-foreground">Regarding payments on our platform:</p>
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>All fees are displayed in the applicable currency before booking</li>
                  <li>Payment is required at the time of booking</li>
                  <li>We process payments through secure third-party payment providers</li>
                  <li>Refunds are subject to our Refund Policy</li>
                  <li>Lawyers receive their earnings after platform commission deduction</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <XCircle className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">7. Prohibited Conduct</h2>
                </div>
                <p className="text-muted-foreground">Users are prohibited from:</p>
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>Providing false or misleading information</li>
                  <li>Impersonating any person or entity</li>
                  <li>Harassing, threatening, or abusing other users</li>
                  <li>Using the platform for illegal purposes</li>
                  <li>Attempting to circumvent platform fees</li>
                  <li>Sharing account credentials with others</li>
                  <li>Interfering with the platform's operation</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">8. Limitation of Liability</h2>
                </div>
                <p className="text-muted-foreground">
                  To the maximum extent permitted by law, LEGALMATE shall not be liable for:
                </p>
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>The quality or outcome of legal advice provided by lawyers on the platform</li>
                  <li>Any indirect, incidental, special, or consequential damages</li>
                  <li>Loss of data, profits, or business opportunities</li>
                  <li>Service interruptions or technical issues</li>
                  <li>Actions or omissions of third parties</li>
                </ul>
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold">9. Dispute Resolution</h2>
                <p className="text-muted-foreground">
                  Any disputes arising from the use of LEGALMATE shall be resolved through:
                </p>
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>First, informal negotiation between the parties</li>
                  <li>If unresolved, binding arbitration under applicable arbitration rules</li>
                  <li>The laws of the State of New York shall govern these terms</li>
                </ul>
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold">10. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. We will notify users of significant 
                  changes via email or platform notification. Continued use of the platform after changes 
                  constitutes acceptance of the modified terms.
                </p>
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold">11. Contact Information</h2>
                <p className="text-muted-foreground">
                  For questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-secondary rounded-lg p-6 mt-4">
                  <p className="text-foreground font-medium">LEGALMATE Legal Department</p>
                  <p className="text-muted-foreground">Email: legal@legalmate.com</p>
                  <p className="text-muted-foreground">Address: 123 Legal Avenue, Suite 500, New York, NY 10001</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};
export default Terms;
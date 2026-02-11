import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Eye, UserCheck, Database, Bell } from 'lucide-react';
const Privacy = () => {
  const lastUpdated = 'February 7, 2026';
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="hero-gradient py-20">
        <div className="container mx-auto px-4 text-center">
          <Shield className="h-16 w-16 text-white mx-auto mb-6 animate-fade-in" />
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6 animate-fade-in">
            Privacy Policy
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto animate-fade-in">
            Your privacy is important to us. This policy explains how we collect, 
            use, and protect your personal information.
          </p>
          <p className="text-white/60 text-sm mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>
      {/* Privacy Highlights */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="card-premium text-center">
              <CardContent className="pt-8 pb-6">
                <Lock className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">End-to-End Encryption</h3>
                <p className="text-muted-foreground text-sm">
                  All communications are encrypted
                </p>
              </CardContent>
            </Card>
            <Card className="card-premium text-center">
              <CardContent className="pt-8 pb-6">
                <Eye className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Data Selling</h3>
                <p className="text-muted-foreground text-sm">
                  We never sell your personal data
                </p>
              </CardContent>
            </Card>
            <Card className="card-premium text-center">
              <CardContent className="pt-8 pb-6">
                <UserCheck className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Your Control</h3>
                <p className="text-muted-foreground text-sm">
                  Manage your data preferences anytime
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Privacy Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-12">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Database className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">1. Information We Collect</h2>
                </div>
                <p className="text-muted-foreground">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li><strong>Account Information:</strong> Name, email address, phone number, and password when you create an account.</li>
                  <li><strong>Profile Information:</strong> Professional details, qualifications, and practice areas for lawyers.</li>
                  <li><strong>Payment Information:</strong> Billing details processed through our secure payment partners.</li>
                  <li><strong>Communication Data:</strong> Messages, consultation recordings (with consent), and support inquiries.</li>
                  <li><strong>Usage Data:</strong> Information about how you interact with our platform.</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">2. How We Use Your Information</h2>
                </div>
                <p className="text-muted-foreground">We use the collected information to:</p>
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Connect clients with appropriate legal professionals</li>
                  <li>Send technical notices, updates, and support messages</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Detect, investigate, and prevent fraudulent transactions</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">3. Attorney-Client Privilege</h2>
                </div>
                <p className="text-muted-foreground">
                  We understand the sensitive nature of legal consultations. All communications between 
                  clients and lawyers on our platform are protected by attorney-client privilege. We employ 
                  end-to-end encryption for all consultation sessions and do not access or monitor the 
                  content of your legal discussions. Consultation recordings are stored securely and are 
                  only accessible to the participating parties.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">4. Data Security</h2>
                </div>
                <p className="text-muted-foreground">
                  We implement robust security measures to protect your personal information:
                </p>
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li>256-bit SSL encryption for all data transmission</li>
                  <li>End-to-end encryption for consultations</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Strict access controls and authentication protocols</li>
                  <li>Secure data centers with physical security measures</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">5. Your Rights</h2>
                </div>
                <p className="text-muted-foreground">You have the right to:</p>
                <ul className="text-muted-foreground space-y-2 mt-4">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Receive your data in a structured format</li>
                  <li><strong>Objection:</strong> Object to certain processing activities</li>
                  <li><strong>Withdrawal:</strong> Withdraw consent at any time</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="h-6 w-6 text-primary" />
                  <h2 className="font-serif text-2xl font-bold m-0">6. Updates to This Policy</h2>
                </div>
                <p className="text-muted-foreground">
                  We may update this privacy policy from time to time. We will notify you of any changes 
                  by posting the new privacy policy on this page and updating the "Last updated" date. 
                  We encourage you to review this privacy policy periodically for any changes.
                </p>
              </div>
              <div>
                <h2 className="font-serif text-2xl font-bold">7. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <div className="bg-secondary rounded-lg p-6 mt-4">
                  <p className="text-foreground font-medium">LEGALMATE Privacy Team</p>
                  <p className="text-muted-foreground">Email: privacy@legalmate.com</p>
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
export default Privacy;
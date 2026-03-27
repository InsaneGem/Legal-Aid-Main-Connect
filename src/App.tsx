import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CallNotificationProvider } from "@/components/consultation/CallNotificationProvider";
import { BookingNotificationProvider } from "@/components/lawyers/BookingNotification";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Lawyers from "./pages/Lawyers";
import LawyerProfile from "./pages/LawyerProfile";
import LawyerEarnings from "./pages/dashboard/LawyerEarnings";
import LawyerConsultations from "./pages/dashboard/LawyerConsultations";
import LawyerRating from "./pages/dashboard/LawyerRating";
import LawyerPendingRequests from "./pages/dashboard/LawyerPendingRequests";
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import ClientManageAccount from "./pages/ClientManageAccount";
import KnowYourRights from "./pages/KnowYourRights";
import LegalGuides from "./pages/LegalGuides";
import LegalAid from "./pages/LegalAid";
import ConsumerProtection from "./pages/ConsumerProtection";
import LawyerDashboard from "./pages/dashboard/LawyerDashboard";
import LawyerOnboarding from "./pages/dashboard/LawyerOnboarding";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import LawyerManageAccount from "./pages/dashboard/LawyerManageAccount";
import Consultation from "./pages/Consultation";
import ProfileSettings from "./pages/ProfileSettings";
import NotFound from "./pages/NotFound";
import HowItWorks from "./pages/HowItWorks";
import Categories from "./pages/LawyerCategories";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import ClientLawyerDetail from "./pages/ClientLawyerDetail";
import ConsultationHistory from "./pages/dashboard/ClientConsultationhistory";
import ClientConsultation from "./pages/consultation/ClientConsultation";
// import LawyerConsultation from "./pages/consultation/LawyerConsultation";
import SavedLawyers from "./pages/SavedLawyers";
import ClientActiveSessions from "./pages/dashboard/ClientActiveSessions";
import ClientProcessing from "./pages/dashboard/ClientProcessing";
import ClientPayments from "./pages/dashboard/ClientPayments";
import ClientTransactionHistory from "./pages/dashboard/ClientTransactionHistory";
import ClientRecordings from "./pages/dashboard/ClientRecordings";
import LawyerActiveSessions from "./pages/dashboard/LawyerActiveSessions";




// import { ScrollToTop } from "./components/context/ScrollToTop";
import { ScrollToTop } from './contexts/ScrollToTop';


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-amber-950 text-center text-xs sm:text-sm font-medium py-1.5 px-4">
        ⚠️ This website is under process — you may experience some issues. This is basically a trial and error mode. Thank you for your patience!
      </div>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <CallNotificationProvider>
            <BookingNotificationProvider>
              <Routes>
                <Route path="/saved-lawyers" element={<SavedLawyers />} />
                <Route path="/lawyer/manage-account" element={<LawyerManageAccount />} />
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/lawyers" element={<Lawyers />} />
                <Route path="/lawyer/:id" element={<LawyerProfile />} />
                <Route path="/lawyer/earnings" element={<LawyerEarnings />} />
                {/* <Route path="#" element={<LawyerConsultations />} /> */}
                <Route path="/lawyer/consultations" element={<LawyerConsultations />} />
                <Route path="/lawyer/rating" element={<LawyerRating />} />
                <Route path="/lawyer/pending-requests" element={<LawyerPendingRequests />} />
                <Route path="/dashboard" element={<ClientDashboard />} />
                <Route path="/manage-account" element={<ClientManageAccount />} />
                <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
                <Route path="/lawyer/profile-setup" element={<LawyerOnboarding />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />

                <Route path="/settings" element={<ProfileSettings />} />
                <Route path="/know-your-rights" element={<KnowYourRights />} />
                <Route path="/consumer-protection" element={<ConsumerProtection />} />
                <Route path="/legal-guides" element={<LegalGuides />} />
                <Route path="/legal-aid" element={<LegalAid />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/help" element={<Help />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/refund" element={<Refund />} />
                <Route path="/lawyersCard/:id" element={<ClientLawyerDetail />} />
                <Route path="/consultation-history" element={<ConsultationHistory />} />
                {/* <Route path="/client/consultation/:id" element={<ClientConsultation />} /> */}
                {/* <Route path="#/:id" element={<LawyerConsultation />} /> */}
                <Route path="/consultation/:id" element={<Consultation />} />
                <Route path="/dashboard/active-sessions" element={<ClientActiveSessions />} />
                <Route path="/dashboard/lawyer-active-sessions" element={<LawyerActiveSessions />} />
                <Route path="/dashboard/processing" element={<ClientProcessing />} />
                <Route path="/dashboard/payments" element={<ClientPayments />} />
                <Route path="/dashboard/transactions" element={<ClientTransactionHistory />} />
                <Route path="/dashboard/recordings" element={<ClientRecordings />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BookingNotificationProvider>
          </CallNotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

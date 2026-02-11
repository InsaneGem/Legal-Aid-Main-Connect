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
import LawyerDashboard from "./pages/dashboard/LawyerDashboard";
import LawyerOnboarding from "./pages/dashboard/LawyerOnboarding";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import LawyerManageAccount from "./pages/dashboard/LawyerManageAccount";
import Consultation from "./pages/Consultation";
import ProfileSettings from "./pages/ProfileSettings";
import NotFound from "./pages/NotFound";
import HowItWorks from "./pages/HowItWorks";
import Categories from "./pages/Categories";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CallNotificationProvider>
            <BookingNotificationProvider>
              <Routes>
                <Route path="/lawyer/manage-account" element={<LawyerManageAccount />} />
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/lawyers" element={<Lawyers />} />
                <Route path="/lawyer/:id" element={<LawyerProfile />} />
                <Route path="/lawyer/earnings" element={<LawyerEarnings />} />
                <Route path="/lawyer/consultations" element={<LawyerConsultations />} />
                <Route path="/lawyer/rating" element={<LawyerRating />} />
                <Route path="/lawyer/pending-requests" element={<LawyerPendingRequests />} />
                <Route path="/dashboard" element={<ClientDashboard />} />
                <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
                <Route path="/lawyer/profile-setup" element={<LawyerOnboarding />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
                <Route path="/consultation/:id" element={<Consultation />} />
                <Route path="/settings" element={<ProfileSettings />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/help" element={<Help />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/refund" element={<Refund />} />
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

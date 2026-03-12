import { Link } from 'react-router-dom';
import { Scale, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Briefcase, BarChart3, Settings, HelpCircle, BookOpen } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
export const LawyerFooter = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const { data: lawyerStats } = useQuery({
    queryKey: ['lawyer-footer-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const [walletRes, profileRes, consultationsRes, reviewsRes] = await Promise.all([
        supabase.from('wallets').select('balance').eq('user_id', user.id).single(),
        supabase.from('lawyer_profiles').select('rating, total_consultations, total_reviews, status').eq('user_id', user.id).single(),
        supabase.from('consultations').select('status').eq('lawyer_id', user.id),
        supabase.from('reviews').select('rating').eq('lawyer_id', user.id),
      ]);
      const consultations = consultationsRes.data || [];
      const reviews = reviewsRes.data || [];
      const avgRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : '0.0';
      return {
        balance: walletRes.data?.balance || 0,
        rating: avgRating,
        totalConsultations: consultations.length,
        completedConsultations: consultations.filter(c => c.status === 'completed').length,
        activeConsultations: consultations.filter(c => c.status === 'active').length,
        pendingConsultations: consultations.filter(c => c.status === 'pending').length,
        totalReviews: reviews.length,
        profileStatus: profileRes.data?.status || 'pending',
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/dashboard" className="flex items-center gap-2 mb-4">
              <Scale className="h-8 w-8" />
              <span className="font-serif text-xl font-semibold">LEGALMATE</span>
            </Link>
            <p className="text-sm text-primary-foreground/70 leading-relaxed mb-6 max-w-sm">
              Grow your legal practice with LegalMate. Connect with clients seeking expert legal advice via chat, audio, or video consultations.
            </p>
            <div className="space-y-3">
              <a href="mailto:lawyers@legalmate.com" className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Mail className="h-4 w-4" />
                lawyers@legalmate.com
              </a>
              <a href="tel:+18001234567" className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Phone className="h-4 w-4" />
                +1 (800) 123-4567
              </a>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4" />
                123 Legal Avenue, New York, NY 10001
              </div>
            </div>
          </div>
          {/* My Practice */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Personal links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              {/* <li>
                <Link to="/profile-settings" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Profile Settings
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Practice Areas
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Lawyer Directory
                </Link>
              </li> */}
            </ul>
          </div>
          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Legal Knowledge Base
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Legal Guides
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Legal Aid Info
                </Link>
              </li>
            </ul>
          </div>
          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" /> Support
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* Lawyer Stats Bar */}
      {/* {lawyerStats && (
        <div className="border-t border-primary-foreground/10">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
              <div>
                <div className="font-serif text-2xl md:text-3xl font-bold mb-1">₹{lawyerStats.balance.toFixed(0)}</div>
                <div className="text-xs md:text-sm text-primary-foreground/60">Earnings Balance</div>
              </div>
              <div>
                <div className="font-serif text-2xl md:text-3xl font-bold mb-1">{lawyerStats.totalConsultations}</div>
                <div className="text-xs md:text-sm text-primary-foreground/60">Total Cases</div>
              </div>
              <div>
                <div className="font-serif text-2xl md:text-3xl font-bold mb-1">{lawyerStats.completedConsultations}</div>
                <div className="text-xs md:text-sm text-primary-foreground/60">Completed</div>
              </div>
              <div>
                <div className="font-serif text-2xl md:text-3xl font-bold mb-1">⭐ {lawyerStats.rating}</div>
                <div className="text-xs md:text-sm text-primary-foreground/60">Avg Rating</div>
              </div>
              <div>
                <div className="font-serif text-2xl md:text-3xl font-bold mb-1">{lawyerStats.totalReviews}</div>
                <div className="text-xs md:text-sm text-primary-foreground/60">Reviews</div>
              </div>
            </div>
          </div>
        </div>
      )} */}
      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/60">
              © {currentYear} LEGALMATE. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
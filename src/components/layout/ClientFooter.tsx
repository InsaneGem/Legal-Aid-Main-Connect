import { Link } from 'react-router-dom';
import { Scale, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, Wallet, MessageSquare, Shield, BookOpen, HelpCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
export const ClientFooter = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const { data: clientStats } = useQuery({
    queryKey: ['client-footer-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const [walletRes, consultationsRes] = await Promise.all([
        supabase.from('wallets').select('balance').eq('user_id', user.id).single(),
        supabase.from('consultations').select('status').eq('client_id', user.id),
      ]);
      const consultations = consultationsRes.data || [];
      return {
        balance: walletRes.data?.balance || 0,
        total: consultations.length,
        completed: consultations.filter(c => c.status === 'completed').length,
        active: consultations.filter(c => c.status === 'active').length,
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
              Your trusted legal consultation platform. Connect with verified lawyers for expert advice via chat, audio, or video.
            </p>
            <div className="space-y-3">
              <a href="mailto:support@legalmate.com" className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Mail className="h-4 w-4" />
                insanegem142012@gmail.com
              </a>
              <a href="tel:+18001234567" className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Phone className="h-4 w-4" />
                +91 9281472291
              </a>
              <div className="flex items-center gap-3 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4" />
                Basavanna Nagar - 560066, Banaglore
              </div>
            </div>
          </div>
          {/* My Account */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Wallet className="h-4 w-4" /> My Account
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/dashboard" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/manage-account" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Manage Account
                </Link>
              </li>
              <li>
                <Link to="/lawyers" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Find Lawyers
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Lawyer Categories
                </Link>
              </li>
            </ul>
          </div>
          {/* Legal Resources */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Legal Resources
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="/know-your-rights" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Know Your Rights
                </Link>
              </li>
              <li>
                <Link to="/legal-guides" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Legal Guides
                </Link>
              </li>
              <li>
                <Link to="/legal-aid" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Free Legal Aid
                </Link>
              </li>
              <li>
                <Link to="/consumer-protection" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Consumer Protection
                </Link>
              </li>
            </ul>
          </div>
          {/* Support & Legal */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <HelpCircle className="h-4 w-4" /> Support
            </h4>
            <ul className="space-y-3">
              <li>
                <Link to="" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      {/* Client Stats Bar */}
      {/* {clientStats && (
        <div className="border-t border-primary-foreground/10">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="font-serif text-2xl md:text-3xl font-bold mb-1">₹{clientStats.balance.toFixed(0)}</div>
                <div className="text-xs md:text-sm text-primary-foreground/60">Wallet Balance</div>
              </div>
              <div>
                <div className="font-serif text-2xl md:text-3xl font-bold mb-1">{clientStats.total}</div>
                <div className="text-xs md:text-sm text-primary-foreground/60">Total Sessions</div>
              </div>
              <div>
                <div className="font-serif text-2xl md:text-3xl font-bold mb-1">{clientStats.completed}</div>
                <div className="text-xs md:text-sm text-primary-foreground/60">Completed</div>
              </div>
              <div>
                <div className="font-serif text-2xl md:text-3xl font-bold mb-1">{clientStats.active}</div>
                <div className="text-xs md:text-sm text-primary-foreground/60">Active Now</div>
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
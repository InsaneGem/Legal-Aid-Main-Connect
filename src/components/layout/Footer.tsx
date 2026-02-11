// import { Link } from 'react-router-dom';
// // import { Scale } from 'lucide-react';

// export const Footer = () => {
//   return (
//     <footer className="bg-primary text-primary-foreground">
//       <div className="container mx-auto px-4 py-16">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
//           {/* Brand */}
//           <div className="col-span-1 md:col-span-1">
//             <Link to="/" className="flex items-center gap-2 mb-4">
//               <Scale className="h-8 w-8" />
//               <span className="font-serif text-xl font-semibold">LEGALMATE</span>
//             </Link>
//             <p className="text-sm text-primary-foreground/70 leading-relaxed">
//               Connect with verified lawyers for expert legal advice via chat, audio, or video consultations.
//             </p>
//           </div>

//           {/* Quick Links */}
//           <div>
//             <h4 className="font-semibold mb-4">Quick Links</h4>
//             <ul className="space-y-3">
//               <li>
//                 <Link to="/lawyers" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
//                   Find Lawyers
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/categories" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
//                   Practice Areas
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/how-it-works" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
//                   How It Works
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/signup?role=lawyer" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
//                   Join as Lawyer
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Support */}
//           <div>
//             <h4 className="font-semibold mb-4">Support</h4>
//             <ul className="space-y-3">
//               <li>
//                 <Link to="/help" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
//                   Help Center
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/contact" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
//                   Contact Us
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/faq" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
//                   FAQs
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           {/* Legal */}
//           <div>
//             <h4 className="font-semibold mb-4">Legal</h4>
//             <ul className="space-y-3">
//               <li>
//                 <Link to="/privacy" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
//                   Privacy Policy
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/terms" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
//                   Terms of Service
//                 </Link>
//               </li>
//               <li>
//                 <Link to="/refund" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
//                   Refund Policy
//                 </Link>
//               </li>
//             </ul>
//           </div>
//         </div>

//         <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
//           <p className="text-sm text-primary-foreground/60">
//             © {new Date().getFullYear()} LEGALMATE. All rights reserved.
//           </p>
//           <p className="text-sm text-primary-foreground/60">
//             Trusted by thousands of clients worldwide
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };

import { Link } from 'react-router-dom';
import { Scale, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const Footer = () => {
  // Fetch real-time stats from database
  const { data: stats } = useQuery({
    queryKey: ['footer-stats'],
    queryFn: async () => {
      const [lawyersResult, consultationsResult, reviewsResult] = await Promise.all([
        supabase.from('lawyer_profiles').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('consultations').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('reviews').select('rating'),
      ]);

      const lawyerCount = lawyersResult.count || 0;
      const consultationCount = consultationsResult.count || 0;
      const reviews = reviewsResult.data || [];
      const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : '4.9';

      return {
        lawyers: lawyerCount > 0 ? `${lawyerCount}+` : '500+',
        consultations: consultationCount > 0 ? `${(consultationCount / 1000).toFixed(0)}K+` : '50K+',
        rating: avgRating,
        clients: consultationCount > 0 ? `${Math.floor(consultationCount * 0.8)}+` : '10K+'
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Scale className="h-8 w-8" />
              <span className="font-serif text-xl font-semibold">LEGALMATE</span>
            </Link>
            <p className="text-sm text-primary-foreground/70 leading-relaxed mb-6 max-w-sm">
              Connect with verified lawyers for expert legal advice via chat, audio, or video consultations. 
              Your trusted partner for all legal matters.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:support@legalmate.com" className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <Mail className="h-4 w-4" />
                support@legalmate.com
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

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/lawyers" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Find Lawyers
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Practice Areas
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/signup?role=lawyer" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Join as Lawyer
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/help" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <a href="mailto:feedback@legalmate.com" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Feedback
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-serif text-2xl md:text-3xl font-bold mb-1">{stats?.clients || '10K+'}</div>
              <div className="text-xs md:text-sm text-primary-foreground/60">Happy Clients</div>
            </div>
            <div>
              <div className="font-serif text-2xl md:text-3xl font-bold mb-1">{stats?.lawyers || '500+'}</div>
              <div className="text-xs md:text-sm text-primary-foreground/60">Verified Lawyers</div>
            </div>
            <div>
              <div className="font-serif text-2xl md:text-3xl font-bold mb-1">{stats?.consultations || '50K+'}</div>
              <div className="text-xs md:text-sm text-primary-foreground/60">Consultations</div>
            </div>
            <div>
              <div className="font-serif text-2xl md:text-3xl font-bold mb-1">⭐ {stats?.rating || '4.9'}</div>
              <div className="text-xs md:text-sm text-primary-foreground/60">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-foreground/60 text-center md:text-left">
              © {currentYear} Law_and_Order. All rights reserved.
            </p>
            
            {/* Social Links */}
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
            
            <p className="text-sm text-primary-foreground/60 text-center md:text-right">
              Trusted by thousands worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

import { Shield, Lock, CheckCircle, Eye } from 'lucide-react';
const badges = [
  { icon: CheckCircle, label: 'Trusted by Clients Worldwide' },
  { icon: Shield, label: 'Verified Lawyers Only' },
  { icon: Lock, label: 'Secure Consultations' },
  { icon: Eye, label: 'Private & Confidential' },
];
export const TrustBar = () => {
  return (
    <section className="py-6 border-b border-border bg-secondary">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {badges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-muted-foreground">
              <badge.icon className="h-5 w-5 text-foreground" />
              <span className="text-sm font-medium">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="new text-center text-sm text-muted-foreground"> TrustBar.tsx (later delete this section)</p>
    </section>
  );
};
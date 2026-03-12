import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
export const FinalCTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="bg-primary rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
              Ready to Get Expert Legal Advice?
            </h2>
            <p className="text-primary-foreground/60 text-sm">
              Join thousands of satisfied clients. Your first consultation is just a click away.
            </p>
          </div>
          <Button
            size="lg"
            variant="secondary"
            className="text-base px-8 shrink-0 group"
            onClick={() => navigate('/signup')}
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
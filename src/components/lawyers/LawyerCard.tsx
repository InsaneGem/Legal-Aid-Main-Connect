import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Video, Phone, Clock, Award, Verified, Zap, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BookingPaymentModal } from './BookingPaymentModal';

interface LawyerWithProfile {
  id: string;
  user_id: string;
  bio: string | null;
  experience_years: number | null;
  specializations: string[] | null;
  languages: string[] | null;
  price_per_minute: number | null;
  rating: number | null;
  total_reviews: number | null;
  is_available: boolean | null;
  status: string | null;
  full_name?: string;
  avatar_url?: string | null;
}

interface LawyerCardProps {
  lawyer: LawyerWithProfile;
  showActions?: boolean;
  onBooking?: () => void;
}

export const LawyerCard = ({ lawyer, showActions = true, onBooking }: LawyerCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isOnline = lawyer.is_available;
  const isApproved = lawyer.status === 'approved';

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'chat' | 'audio' | 'video'>('chat');

  const handleBookClick = (type: 'chat' | 'audio' | 'video', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to book a consultation.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setSelectedType(type);
    setShowPaymentModal(true);
  };

  const handleCardClick = () => {
    navigate(`/lawyer/${lawyer.id}`);
  };

  return (
    <div className="group block">
      <div className="relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/30">
        {/* Online Status Indicator */}
        {isOnline && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-2.5 py-1 rounded-full text-xs font-medium shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Online
            </div>
          </div>
        )}
        
        {!isOnline && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center gap-1.5 bg-muted text-muted-foreground px-2.5 py-1 rounded-full text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
              Offline
            </div>
          </div>
        )}

        {/* Clickable Header Section with Avatar */}
        <div className="p-6 pb-4 cursor-pointer" onClick={handleCardClick}>
          <div className="flex gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl font-bold overflow-hidden border-2 border-background shadow-lg">
                {lawyer.avatar_url ? (
                  <img 
                    src={lawyer.avatar_url} 
                    alt={lawyer.full_name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-primary">
                    {lawyer.full_name?.charAt(0).toUpperCase() || 'L'}
                  </span>
                )}
              </div>
              {isApproved && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border-2 border-card">
                  <Verified className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </div>

            {/* Name & Rating */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {lawyer.full_name || 'Legal Professional'}
              </h3>
              
              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-600">
                    {lawyer.rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({lawyer.total_reviews || 0} reviews)
                </span>
              </div>

              {/* Experience */}
              {lawyer.experience_years && lawyer.experience_years > 0 && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{lawyer.experience_years} years experience</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Specializations - Clickable */}
        {lawyer.specializations && lawyer.specializations.length > 0 && (
          <div className="px-6 pb-3 cursor-pointer" onClick={handleCardClick}>
            <div className="flex flex-wrap gap-1.5">
              {lawyer.specializations.slice(0, 3).map((spec) => (
                <Badge 
                  key={spec} 
                  variant="secondary" 
                  className="text-xs font-normal bg-secondary/80"
                >
                  {spec}
                </Badge>
              ))}
              {lawyer.specializations.length > 3 && (
                <Badge variant="outline" className="text-xs font-normal">
                  +{lawyer.specializations.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Bio - Clickable */}
        <div className="px-6 pb-4 cursor-pointer" onClick={handleCardClick}>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
            {lawyer.bio || 'Experienced legal professional ready to help with your case.'}
          </p>
        </div>

        {/* Price Display */}
        <div className="px-6 py-3 border-t border-border bg-secondary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold">${lawyer.price_per_minute || 5}</span>
              <span className="text-sm text-muted-foreground">/min</span>
            </div>
            {isOnline && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                <Zap className="h-3 w-3 mr-1" />
                Available Now
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="px-6 py-4 bg-secondary/30 border-t border-border">
            {/* Quick Book Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <Button 
                size="sm"
                variant="outline"
                className="gap-1.5 h-10 hover:bg-emerald-500/10 hover:text-emerald-600 hover:border-emerald-500/30"
                onClick={(e) => handleBookClick('chat', e)}
              >
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
              </Button>
              <Button 
                size="sm"
                variant="outline"
                className="gap-1.5 h-10 hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30"
                onClick={(e) => handleBookClick('audio', e)}
              >
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Call</span>
              </Button>
              <Button 
                size="sm"
                variant="outline"
                className="gap-1.5 h-10 hover:bg-purple-500/10 hover:text-purple-600 hover:border-purple-500/30"
                onClick={(e) => handleBookClick('video', e)}
              >
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Video</span>
              </Button>
            </div>

            {/* Primary Pay & Book Button */}
            <Button 
              className="w-full gap-2"
              onClick={(e) => handleBookClick('video', e)}
            >
              <CreditCard className="h-4 w-4" />
              Pay & Book Now
            </Button>
          </div>
        )}

        {/* Pending Badge */}
        {lawyer.status === 'pending' && (
          <div className="absolute top-0 left-0 right-0 bg-amber-500/90 text-white text-center py-1 text-xs font-medium">
            <Award className="h-3 w-3 inline mr-1" />
            Pending Verification
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <BookingPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        lawyer={{
          id: lawyer.id,
          user_id: lawyer.user_id,
          full_name: lawyer.full_name || 'Legal Professional',
          avatar_url: lawyer.avatar_url,
          price_per_minute: lawyer.price_per_minute,
          rating: lawyer.rating,
          specializations: lawyer.specializations,
        }}
        consultationType={selectedType}
        onSuccess={onBooking}
      />
    </div>
  );
};

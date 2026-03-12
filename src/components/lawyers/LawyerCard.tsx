
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Video, Phone, Clock, Verified, Zap, CreditCard, Award, ChevronRight, Cake, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BookingPaymentModal } from './BookingPaymentModal';
// import { formatLawyerName } from '@/lib/Lawyer-utils';
import { formatLawyerName } from '@/lib/lawyer-utils'
import { calculateAge } from '@/lib/ageUtils';
import { useSavedLawyers } from '@/hooks/useSavedLawyers';
import { BookingAgendaModal } from './BookingAgendaModal';

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
  date_of_birth?: string | null;
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

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedType, setSelectedType] = useState<'chat' | 'audio' | 'video'>('chat');
  const { isSaved, toggleSave } = useSavedLawyers();
  const [heartAnimating, setHeartAnimating] = useState(false);
  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Login Required', description: 'Please login to save lawyers.', variant: 'destructive' });
      navigate('/login');
      return;
    }
    setHeartAnimating(true);
    await toggleSave(lawyer.id);
    setTimeout(() => setHeartAnimating(false), 300);
  };

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
    setShowBookingModal(true);
  };

  const handleCardClick = () => {
    // navigate(`/lawyer/${lawyer.id}`);
    navigate(`/lawyersCard/${lawyer.id}`);

  };

  const ratingValue = lawyer.rating?.toFixed(1) || '0.0';
  const reviewCount = lawyer.total_reviews || 0;

  return (
    <div className="group block">
      <div
        className={`relative bg-card rounded-lg border overflow-hidden 
      transition-all duration-300 ease-out
      hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01]
      cursor-pointer
      ${isOnline
            ? 'border-emerald-500/30 hover:border-emerald-500/60'
            : 'border-border hover:border-primary/30'
          }`}
        onClick={handleCardClick}
      >

        {/* Pending Banner */}
        {lawyer.status === 'pending' && (
          <div className="bg-amber-500 text-white text-center py-1 text-[10px] font-medium tracking-wide">
            <Award className="h-3 w-3 inline mr-1" />
            PENDING VERIFICATION
          </div>
        )}

        {/* TOP SECTION */}
        <div className="px-3 py-3 sm:px-4 sm:py-3">
          <div className="flex items-start gap-3">

            {/* AVATAR */}
            <div className="relative shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full 
            bg-gradient-to-br from-primary/20 to-accent/20
            flex items-center justify-center
            text-sm font-bold
            overflow-hidden
            ring-2 ring-background shadow-sm">
                {lawyer.avatar_url ? (
                  <img src={lawyer.avatar_url} alt={lawyer.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary">{lawyer.full_name?.charAt(0).toUpperCase() || 'L'}</span>
                )
                }
              </div>

              {/* ONLINE DOT */}
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card
              ${isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}
              />

              {isApproved && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center border border-card">
                  <Verified className="h-2.5 w-2.5 text-white" />
                </span>
              )}
            </div>

            {/* INFO */}
            <div className="flex-1 min-w-0">

              {/* NAME */}
              <h3 className="font-semibold text-sm sm:text-[15px] truncate group-hover:text-primary transition-colors">
                {formatLawyerName(lawyer.full_name)}
              </h3>

              {/* RATING + EXP */}
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">

                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <span className="text-xs font-semibold text-amber-600">
                    {ratingValue}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ({reviewCount})
                  </span>
                </div>

                {lawyer.experience_years && (
                  <>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lawyer.experience_years}y
                    </span>
                  </>
                )}

                {calculateAge(lawyer.date_of_birth) !== null && (
                  <>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Cake className="h-3 w-3" />
                      {calculateAge(lawyer.date_of_birth)} yrs
                    </span>
                  </>
                )}
                <div>
                  <button
                    onClick={handleToggleSave}
                    className="flex  bg-card/80 backdrop-blur-sm  flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200"
                  >
                    <Heart
                      className={`h-4 w-4 transition-all duration-300 ${isSaved(lawyer.id)
                        ? 'fill-rose-500 text-rose-500'
                        : 'text-muted-foreground hover:text-rose-400'
                        } ${heartAnimating ? 'scale-125' : ''}`}
                    />
                  </button>
                </div>
              </div>

              {/* STATUS */}
              <div className="mt-1">
                {isOnline ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    Available
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    Offline
                  </span>
                )}

              </div>
              {/* Save/Favorite Button */}


            </div>

            {/* PRICE */}
            <div className="text-right shrink-0">
              <span className="text-base sm:text-lg font-bold text-foreground">
                ₹{lawyer.price_per_minute || 5}
              </span>
              <span className="text-[10px] text-muted-foreground block -mt-0.5">
                /min
              </span>
            </div>


          </div>
        </div>


        {/* SPECIALIZATIONS */}
        {lawyer.specializations && lawyer.specializations.length > 0 && (
          <div className="px-3 sm:px-4 pb-2 flex flex-wrap gap-1">

            {lawyer.specializations.slice(0, 3).map((spec) => (
              <Badge key={spec} variant="secondary" className="text-xs font-normal bg-secondary/80">{spec}</Badge>
            ))}

            {lawyer.specializations.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">+{lawyer.specializations.length - 3}</Badge>
            )}
          </div>
        )}

        {/* BIO */}
        <div className="px-3 sm:px-4 pb-3">
          <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1">
            {lawyer.bio || 'Experienced legal professional ready to help.'}
          </p>
        </div>

        {/* ACTIONS */}
        {showActions && (
          <div
            className="px-2 sm:px-3 py-2 border-t border-border bg-muted/30 flex items-center gap-1"
          // onClick={(e) => e.stopPropagation()}
          >

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-emerald-500/10 hover:text-emerald-600"
            // onClick={(e) => handleBookClick('chat', e)}
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-blue-500/10 hover:text-blue-600"
            // onClick={(e) => handleBookClick('audio', e)}
            >
              <Phone className="h-3.5 w-3.5" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 hover:bg-purple-500/10 hover:text-purple-600"
            // onClick={(e) => handleBookClick('video', e)}
            >
              <Video className="h-3.5 w-3.5" />
            </Button>

            <Button
              size="sm"
              className="ml-auto h-8 text-xs gap-1 px-3"
              onClick={(e) => handleBookClick('chat', e)}
            >
              {/* <CreditCard className="h-3 w-3" />
              Book
              <ChevronRight className="h-3 w-3" /> */}
              Book
            </Button>

          </div>
        )}

      </div>

      {/* PAYMENT MODAL */}
      <BookingAgendaModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
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

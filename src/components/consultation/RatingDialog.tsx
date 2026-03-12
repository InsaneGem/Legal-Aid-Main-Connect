import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface RatingDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    consultationId: string;
    lawyerId: string;
    clientId: string;
    lawyerName: string;
    lawyerAvatar?: string | null;
    onRated?: () => void;
}
export const RatingDialog = ({
    open,
    onOpenChange,
    consultationId,
    lawyerId,
    clientId,
    lawyerName,
    lawyerAvatar,
    onRated,
}: RatingDialogProps) => {
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const handleSubmit = async () => {
        if (rating === 0) {
            toast({ variant: 'destructive', title: 'Please select a rating' });
            return;
        }
        setSubmitting(true);
        const { error } = await supabase.from('reviews').insert({
            consultation_id: consultationId,
            lawyer_id: lawyerId,
            client_id: clientId,
            rating,
            comment: comment.trim() || null,
        });
        if (error) {
            if (error.code === '23505') {
                toast({ title: 'Already rated', description: 'You have already rated this consultation.' });
            } else {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit rating.' });
            }
        } else {
            toast({ title: '⭐ Thank you!', description: 'Your rating has been submitted.' });
            onRated?.();
        }
        setSubmitting(false);
        onOpenChange(false);
        setRating(0);
        setComment('');
    };
    const handleSkip = () => {
        onOpenChange(false);
        setRating(0);
        setComment('');
    };
    const displayRating = hoveredRating || rating;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="text-center">
                    <DialogTitle className="text-xl">Rate Your Experience</DialogTitle>
                    <DialogDescription>
                        How was your consultation with {lawyerName}?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center gap-5 py-4">
                    {/* Lawyer Avatar */}
                    <Avatar className="h-20 w-20 border-2 border-primary/20">
                        <AvatarImage src={lawyerAvatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-2xl font-semibold">
                            {lawyerName?.charAt(0) || 'L'}
                        </AvatarFallback>
                    </Avatar>
                    {/* Star Rating */}
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="p-1 transition-transform hover:scale-110 focus:outline-none"
                            >
                                <Star
                                    className={`h-8 w-8 transition-colors ${star <= displayRating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-muted-foreground/30'
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                    {displayRating > 0 && (
                        <p className="text-sm font-medium text-muted-foreground">
                            {displayRating === 1 && 'Poor'}
                            {displayRating === 2 && 'Fair'}
                            {displayRating === 3 && 'Good'}
                            {displayRating === 4 && 'Very Good'}
                            {displayRating === 5 && 'Excellent'}
                        </p>
                    )}
                    {/* Comment */}
                    <Textarea
                        placeholder="Share your experience (optional)..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="resize-none"
                        rows={3}
                    />
                    {/* Actions */}
                    <div className="flex w-full gap-3">
                        <Button variant="outline" className="flex-1" onClick={handleSkip}>
                            Skip
                        </Button>
                        <Button
                            className="flex-1 gap-2"
                            onClick={handleSubmit}
                            disabled={rating === 0 || submitting}
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Submit Rating
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
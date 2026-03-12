import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    MessageSquare, Phone, Video, Clock, Shield,
    Loader2, User, FileText, Send, Timer
} from 'lucide-react';

const AGENDA_CATEGORIES = [
    { value: 'property_dispute', label: 'Property Dispute' },
    { value: 'family_law', label: 'Family Law / Divorce' },
    { value: 'criminal_defense', label: 'Criminal Defense' },
    { value: 'business_contract', label: 'Business / Contract' },
    { value: 'employment_issue', label: 'Employment Issue' },
    { value: 'consumer_complaint', label: 'Consumer Complaint' },
    { value: 'tax_finance', label: 'Tax & Finance' },
    { value: 'immigration', label: 'Immigration' },
    { value: 'cyber_crime', label: 'Cyber Crime' },
    { value: 'other', label: 'Other' },
];

const URGENCY_OPTIONS = [
    { value: 'low', label: 'Not urgent — within a week' },
    { value: 'medium', label: 'Moderately urgent — within 2-3 days' },
    { value: 'high', label: 'Very urgent — need help today' },
];

interface LawyerInfo {
    id: string;
    user_id: string;
    full_name: string;
    avatar_url?: string | null;
    price_per_minute: number | null;
    rating: number | null;
    specializations: string[] | null;
}

interface BookingAgendaModalProps {
    isOpen: boolean;
    onClose: () => void;
    lawyer: LawyerInfo;
    consultationType: 'chat' | 'audio' | 'video';
    onSuccess?: () => void;
}

export const BookingAgendaModal = ({
    isOpen,
    onClose,
    lawyer,
    consultationType: initialType,
    onSuccess
}: BookingAgendaModalProps) => {

    const { user } = useAuth();
    const { toast } = useToast();

    const [consultationType, setConsultationType] = useState<'chat' | 'audio' | 'video'>(initialType);
    const [agendaCategory, setAgendaCategory] = useState('');
    const [urgency, setUrgency] = useState('');
    const [agendaDetails, setAgendaDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState<'form' | 'waiting'>('form');
    const [countdown, setCountdown] = useState(60);
    const [pendingConsultationId, setPendingConsultationId] = useState<string | null>(null);

    useEffect(() => {
        setConsultationType(initialType);
    }, [initialType]);

    const minimumMinutes = 10;
    const pricePerMinute = lawyer.price_per_minute || 5;
    const sessionCost = minimumMinutes * pricePerMinute;

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'video': return <Video className="h-4 w-4" />;
            case 'audio': return <Phone className="h-4 w-4" />;
            default: return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'video': return 'Video Call';
            case 'audio': return 'Audio Call';
            default: return 'Chat';
        }
    };

    useEffect(() => {
        if (step !== 'waiting') return;

        if (countdown <= 0) {
            handleTimeout();
            return;
        }

        const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
        return () => clearTimeout(timer);

    }, [step, countdown]);

    useEffect(() => {

        if (step !== 'waiting' || !pendingConsultationId) return;

        const channel = supabase
            .channel(`booking-wait-${pendingConsultationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'consultations',
                    filter: `id=eq.${pendingConsultationId}`,
                },
                (payload) => {

                    const updated = payload.new as any;

                    if (updated.status === 'active') {

                        toast({
                            title: '✅ Lawyer Accepted!',
                            description: 'Please complete the payment to start your consultation.',
                        });

                        resetAndClose();
                        onSuccess?.();
                    }

                    else if (updated.status === 'cancelled') {

                        toast({
                            variant: 'destructive',
                            title: 'Request Declined',
                            description: 'The lawyer declined your consultation request.',
                        });

                        resetAndClose();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [step, pendingConsultationId]);

    const handleTimeout = useCallback(async () => {

        if (pendingConsultationId) {
            await supabase
                .from('consultations')
                .update({ status: 'cancelled' })
                .eq('id', pendingConsultationId);
        }

        toast({
            variant: 'destructive',
            title: 'Request Timed Out',
            description: 'The lawyer did not respond within 60 seconds. Please try again.',
        });

        resetAndClose();

    }, [pendingConsultationId]);

    const resetAndClose = () => {

        setStep('form');
        setAgendaCategory('');
        setUrgency('');
        setAgendaDetails('');
        setCountdown(60);
        setPendingConsultationId(null);

        onClose();
    };

    const handleSubmit = async () => {

        if (!user || !agendaCategory || !agendaDetails.trim()) {

            toast({
                variant: 'destructive',
                title: 'Missing Details',
                description: 'Please fill in all required fields.',
            });

            return;
        }

        setSubmitting(true);

        try {

            const categoryLabel =
                AGENDA_CATEGORIES.find(c => c.value === agendaCategory)?.label || agendaCategory;

            const urgencyLabel =
                URGENCY_OPTIONS.find(u => u.value === urgency)?.label || urgency;

            const fullAgenda =
                `[${categoryLabel}] [${urgencyLabel}]\n${agendaDetails.trim()}`;

            const { data, error } = await supabase
                .from('consultations')
                .insert({
                    client_id: user.id,
                    lawyer_id: lawyer.user_id,
                    type: consultationType,
                    status: 'pending',
                    total_amount: sessionCost,
                    agenda: fullAgenda,
                    payment_status: 'unpaid',
                })
                .select('id')
                .single();

            if (error) throw error;

            setPendingConsultationId(data.id);
            setCountdown(60);
            setStep('waiting');

        }

        catch (error) {

            console.error('Booking error:', error);

            toast({
                variant: 'destructive',
                title: 'Booking Failed',
                description: 'Unable to send consultation request. Please try again.',
            });

        }

        finally {
            setSubmitting(false);
        }
    };

    return (

        <Dialog
            open={isOpen}
            onOpenChange={(open) => { if (!open) resetAndClose(); }}
        >

            <DialogContent
                className="
                w-[95vw]
                sm:max-w-md
                md:max-w-lg
                max-h-[90vh]
                overflow-hidden
                p-0
                "
            >

                <div className="max-h-[90vh] overflow-y-auto p-6">

                    <DialogHeader>

                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Book Consultation
                        </DialogTitle>

                        <DialogDescription>
                            {step === 'waiting'
                                ? 'Waiting for the lawyer to accept your request...'
                                : 'Fill in your consultation details to send a request'}
                        </DialogDescription>

                    </DialogHeader>

                    {step === 'waiting' ? (

                        <div className="py-8 text-center space-y-6">

                            <div className="relative w-24 h-24 mx-auto">

                                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">

                                    <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />

                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth="6"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 45}`}
                                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - countdown / 60)}`}
                                        className="transition-all duration-1000 ease-linear"
                                    />

                                </svg>

                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-3xl font-bold">{countdown}</span>
                                </div>

                            </div>

                            <div>

                                <h3 className="text-lg font-semibold mb-1">
                                    Waiting for Lawyer
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    {lawyer.full_name} has 60 seconds to accept your request
                                </p>

                            </div>

                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <Timer className="h-4 w-4" />
                                <span>Request will auto-cancel if not accepted in time</span>
                            </div>

                            <Button variant="outline" onClick={resetAndClose}>
                                Cancel Request
                            </Button>

                        </div>

                    ) : (

                        <div className="space-y-5">

                            {/* Lawyer Info */}

                            <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl border">

                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">

                                    {lawyer.avatar_url ? (

                                        <img
                                            src={lawyer.avatar_url}
                                            alt={lawyer.full_name}
                                            className="w-full h-full object-cover"
                                        />

                                    ) : (

                                        <User className="h-7 w-7 text-primary" />

                                    )}

                                </div>

                                <div className="flex-1">

                                    <h4 className="font-semibold">
                                        {lawyer.full_name}
                                    </h4>

                                    {lawyer.specializations && lawyer.specializations.length > 0 && (

                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {lawyer.specializations.slice(0, 2).join(', ')}
                                        </p>

                                    )}

                                </div>

                            </div>

                            {/* Consultation Type */}

                            <div className="space-y-2">

                                <Label className="text-sm font-medium">
                                    Consultation Format
                                </Label>

                                <div className="grid grid-cols-3 gap-2">

                                    {(['chat', 'audio', 'video'] as const).map((type) => (

                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setConsultationType(type)}
                                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${consultationType === type
                                                ? 'border-primary bg-primary/5 text-primary'
                                                : 'border-border hover:border-primary/30'
                                                }`}
                                        >

                                            {getTypeIcon(type)}

                                            <span className="text-xs font-medium">
                                                {getTypeLabel(type)}
                                            </span>

                                        </button>

                                    ))}

                                </div>

                            </div>

                            {/* Cost */}

                            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border">

                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>{minimumMinutes} min session</span>
                                </div>

                                <span className="text-lg font-bold text-primary">
                                    ₹{sessionCost.toFixed(2)}
                                </span>

                            </div>

                            {/* Category */}

                            <div className="space-y-2">

                                <Label className="text-sm font-medium">
                                    Agenda Category <span className="text-red-500">*</span>
                                </Label>

                                <Select value={agendaCategory} onValueChange={setAgendaCategory}>

                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your legal issue type" />
                                    </SelectTrigger>

                                    <SelectContent>

                                        {AGENDA_CATEGORIES.map((cat) => (

                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>

                                        ))}

                                    </SelectContent>

                                </Select>

                            </div>

                            {/* Urgency */}

                            <div className="space-y-2">

                                <Label className="text-sm font-medium">
                                    Urgency Level
                                </Label>

                                <Select value={urgency} onValueChange={setUrgency}>

                                    <SelectTrigger>
                                        <SelectValue placeholder="How urgent is your matter?" />
                                    </SelectTrigger>

                                    <SelectContent>

                                        {URGENCY_OPTIONS.map((opt) => (

                                            <SelectItem key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </SelectItem>

                                        ))}

                                    </SelectContent>

                                </Select>

                            </div>

                            {/* Details */}

                            <div className="space-y-2">

                                <Label className="text-sm font-medium">
                                    Describe Your Issue <span className="text-red-500">*</span>
                                </Label>

                                <Textarea
                                    placeholder="Provide details about your legal issue..."
                                    value={agendaDetails}
                                    onChange={(e) => setAgendaDetails(e.target.value)}
                                    className="min-h-[100px] resize-none"
                                    maxLength={1000}
                                />

                                <p className="text-xs text-muted-foreground text-right">
                                    {agendaDetails.length}/1000
                                </p>

                            </div>

                            {/* Info */}

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">

                                <Shield className="h-4 w-4 flex-shrink-0" />

                                <span>
                                    Your request will be sent to the lawyer. Payment happens after they accept.
                                </span>

                            </div>

                            {/* Buttons */}

                            <div className="flex gap-3">

                                <Button
                                    variant="outline"
                                    onClick={resetAndClose}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={!agendaCategory || !agendaDetails.trim() || submitting}
                                    className="flex-1 gap-2"
                                >

                                    {submitting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}

                                    Book Consultation

                                </Button>

                            </div>

                        </div>

                    )}

                </div>

            </DialogContent>

        </Dialog>

    );
};
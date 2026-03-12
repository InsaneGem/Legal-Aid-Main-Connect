import { supabase } from '@/integrations/supabase/client';
declare global {
    interface Window {
        Razorpay: any;
    }
}
export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};
interface RazorpayPaymentOptions {
    consultationId: string;
    onSuccess: (consultationId: string) => void;
    onError: (error: string) => void;
}
export const initiateRazorpayPayment = async ({
    consultationId,
    onSuccess,
    onError,
}: RazorpayPaymentOptions) => {
    try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            onError('Failed to load Razorpay SDK');
            return;
        }
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            onError('Not authenticated');
            return;
        }
        // Create Razorpay order via edge function
        const { data, error } = await supabase.functions.invoke('razorpay', {
            body: {
                action: 'create_order',
                consultation_id: consultationId,
            },
        });
        if (error || !data) {
            onError(error?.message || 'Failed to create payment order');
            return;
        }
        const { order_id, amount, currency, key_id } = data;
        // Get user details for prefill
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('id', session.user.id)
            .single();
        const options = {
            key: key_id,
            amount,
            currency,
            name: 'LEGALMATE',
            description: 'Consultation Payment',
            order_id,
            handler: async (response: any) => {
                // Verify payment
                const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay', {
                    body: {
                        action: 'verify_payment',
                        consultation_id: consultationId,
                        payment_id: response.razorpay_payment_id,
                        order_id: response.razorpay_order_id,
                        signature: response.razorpay_signature,
                    },
                });
                if (verifyError || !verifyData?.success) {
                    onError('Payment verification failed');
                    return;
                }
                onSuccess(consultationId);
            },
            prefill: {
                name: profile?.full_name || '',
                email: profile?.email || '',
                contact: profile?.phone || '',
            },
            theme: {
                color: '#6366f1',
            },
            modal: {
                ondismiss: () => {
                    console.log('Payment modal dismissed');
                },
            },
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
    } catch (error: any) {
        console.error('Razorpay error:', error);
        onError(error.message || 'Payment failed');
    }
};

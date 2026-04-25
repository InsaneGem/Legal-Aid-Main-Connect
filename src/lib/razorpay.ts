

// import { supabase } from '@/integrations/supabase/client';

// declare global {
//     interface Window {
//         Razorpay: any;
//     }
// }

// export const loadRazorpayScript = (): Promise<boolean> => {
//     return new Promise((resolve) => {
//         if (window.Razorpay) {
//             resolve(true);
//             return;
//         }
//         const script = document.createElement('script');
//         script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//         script.onload = () => resolve(true);
//         script.onerror = () => resolve(false);
//         document.body.appendChild(script);
//     });
// };

// interface RazorpayPaymentOptions {
//     consultationId: string;
//     onSuccess: (consultationId: string) => void;
//     onError: (error: string) => void;
// }

// export const initiateRazorpayPayment = async ({
//     consultationId,
//     onSuccess,
//     onError,
// }: RazorpayPaymentOptions) => {
//     try {
//         const scriptLoaded = await loadRazorpayScript();
//         if (!scriptLoaded) {
//             onError('Failed to load Razorpay SDK');
//             return;
//         }

//         const { data: { session } } = await supabase.auth.getSession();

//         if (!session) {
//             onError('Not authenticated');
//             return;
//         }

//         // ✅ CREATE ORDER (FIXED)
//         const { data, error } = await supabase.functions.invoke('razorpay', {
//             body: {
//                 action: 'create_order',
//                 consultation_id: consultationId,
//             },
//             headers: {
//                 Authorization: `Bearer ${session.access_token}`,
//             },
//         });

//         if (error || !data) {
//             console.error('Create order error:', error);
//             onError(error?.message || 'Failed to create payment order');
//             return;
//         }

//         const { order_id, amount, currency, key_id } = data;

//         const { data: profile } = await supabase
//             .from('profiles')
//             .select('full_name, email, phone')
//             .eq('id', session.user.id)
//             .single();

//         const options = {
//             key: key_id,
//             amount,
//             currency,
//             name: 'LEGALMATE',
//             description: 'Consultation Payment',
//             order_id,

//             handler: async (response: any) => {
//                 // ✅ VERIFY PAYMENT (FIXED)
//                 const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay', {
//                     body: {
//                         action: 'verify_payment',
//                         consultation_id: consultationId,
//                         payment_id: response.razorpay_payment_id,
//                         order_id: response.razorpay_order_id,
//                         signature: response.razorpay_signature,
//                     },
//                     headers: {
//                         Authorization: `Bearer ${session.access_token}`,
//                     },
//                 });

//                 if (verifyError || !verifyData?.success) {
//                     console.error('Verify error:', verifyError);
//                     onError('Payment verification failed');
//                     return;
//                 }

//                 onSuccess(consultationId);
//             },

//             prefill: {
//                 name: profile?.full_name || '',
//                 email: profile?.email || '',
//                 contact: profile?.phone || '',
//             },

//             theme: {
//                 color: '#6366f1',
//             },

//             modal: {
//                 ondismiss: () => {
//                     console.log('Payment modal dismissed');
//                 },
//             },
//         };

//         const razorpay = new window.Razorpay(options);
//         razorpay.open();

//     } catch (error: any) {
//         console.error('Razorpay error:', error);
//         onError(error.message || 'Payment failed');
//     }
// };

import { supabase } from '@/integrations/supabase/client';

declare global {
    interface Window {
        Razorpay: any;
    }
}

// Load Razorpay SDK safely
export const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;

        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);

        document.body.appendChild(script);
    });
};

interface RazorpayPaymentOptions {
    consultationId: string;
    onSuccess: (consultationId: string) => void;
    onError: (error: string) => void;
    closeModal?: () => void; // 🔥 IMPORTANT FIX
}

export const initiateRazorpayPayment = async ({
    consultationId,
    onSuccess,
    onError,
    closeModal,
}: RazorpayPaymentOptions) => {
    try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            onError('Razorpay SDK failed to load');
            return;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData?.session;

        if (!session) {
            onError('Not authenticated');
            return;
        }

        // 1️⃣ Create Order
        const { data, error } = await supabase.functions.invoke('razorpay', {
            body: {
                action: 'create_order',
                consultation_id: consultationId,
            },
            headers: {
                Authorization: `Bearer ${session.access_token}`,
            },
        });

        if (error || !data) {
            console.error(error);
            onError(error?.message || 'Order creation failed');
            return;
        }

        const { order_id, amount, currency, key_id } = data;

        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('id', session.user.id)
            .single();

        // 2️⃣ Razorpay Options
        const options = {
            key: key_id,
            amount,
            currency,
            name: 'LEGALMATE',
            description: 'Consultation Payment',
            order_id,

            handler: async (response: any) => {
                console.log('PAYMENT SUCCESS:', response);

                const { data: verifyData, error: verifyError } =
                    await supabase.functions.invoke('razorpay', {
                        body: {
                            action: 'verify_payment',
                            consultation_id: consultationId,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        },
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                        },
                    });

                console.log('VERIFY RESPONSE:', verifyData, verifyError);

                if (verifyError || !verifyData?.ok) {
                    onError('Payment verification failed');
                    return;
                }

                onSuccess(consultationId);
            },

            prefill: {
                name: profile?.full_name || '',
                email: profile?.email || '',
                contact: profile?.phone?.toString() || '9999999999',
            },

            theme: {
                color: '#6366f1',
            },

            modal: {
                ondismiss: () => {
                    console.log('Payment cancelled');
                },
            },
        };

        // 3️⃣ 🔥 CRITICAL FIX (THIS IS WHY YOUR OLD CODE FAILED)

        // Close React modal FIRST (prevents overlay blocking Razorpay)
        if (closeModal) closeModal();

        // Restore body interaction
        document.body.style.overflow = 'auto';
        document.body.style.pointerEvents = 'auto';

        // Delay open so modal cleanup completes
        setTimeout(() => {
            const rzp = new window.Razorpay(options);
            rzp.open();
        }, 500);

    } catch (err: any) {
        console.error('Razorpay error:', err);
        onError(err.message || 'Payment failed');
    }
};
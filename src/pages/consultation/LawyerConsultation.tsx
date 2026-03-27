// import { useState, useEffect, useRef } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { supabase } from '@/integrations/supabase/client'
// import { useAuth } from '@/contexts/AuthContext'
// import {
//   Send,
//   Loader2,
//   Clock,
//   Lock
// } from 'lucide-react'
// import { useToast } from '@/hooks/use-toast'
// import { LawyerLayout } from '@/components/layout/LawyerLayout'

// const PAYMENT_TIMEOUT = 120

// const LawyerConsultation = () => {

//   const { id } = useParams()
//   const navigate = useNavigate()
//   const { user } = useAuth()
//   const { toast } = useToast()

//   const messagesEndRef = useRef<HTMLDivElement>(null)

//   const [consultation, setConsultation] = useState<any>(null)
//   const [messages, setMessages] = useState<any[]>([])
//   const [newMessage, setNewMessage] = useState('')
//   const [loading, setLoading] = useState(true)
//   const [sending, setSending] = useState(false)

//   const [paymentCountdown, setPaymentCountdown] = useState(PAYMENT_TIMEOUT)

//   const isPaid = consultation?.payment_status === 'paid'
//   const isActive = consultation?.status === 'active'
//   const isUnlocked = isActive && isPaid

//   useEffect(() => {
//     if (id && user) {
//       fetchConsultation()
//       subscribeRealtime()
//     }
//   }, [id, user])

//   useEffect(() => {

//     let timer: NodeJS.Timeout

//     if (isActive && !isPaid && paymentCountdown > 0) {

//       timer = setInterval(() => {
//         setPaymentCountdown(prev => prev - 1)
//       }, 1000)

//     }

//     if (paymentCountdown === 0 && !isPaid && isActive) {
//       handleTimeout()
//     }

//     return () => clearInterval(timer)

//   }, [paymentCountdown, isActive, isPaid])

//   const handleTimeout = async () => {

//     await supabase
//       .from('consultations')
//       .update({ status: 'expired' })
//       .eq('id', id)

//     toast({
//       title: 'Payment time expired',
//       description: 'Client did not complete payment'
//     })

//     navigate('/lawyer/dashboard')

//   }

//   const fetchConsultation = async () => {

//     const { data } = await supabase
//       .from('consultations')
//       .select('*')
//       .eq('id', id)
//       .single()

//     setConsultation(data)
//     setLoading(false)

//   }

//   const subscribeRealtime = () => {

//     const consultationChannel = supabase.channel(`consultation-${id}`)
//       .on(
//         'postgres_changes',
//         {
//           event: 'UPDATE',
//           schema: 'public',
//           table: 'consultations',
//           filter: `id=eq.${id}`
//         },
//         payload => {
//           setConsultation(payload.new)
//         }
//       )
//       .subscribe()

//     return () => {
//       supabase.removeChannel(consultationChannel)
//     }

//   }

//   const sendMessage = async (e: React.FormEvent) => {

//     e.preventDefault()

//     if (!newMessage.trim() || !isUnlocked) return

//     setSending(true)

//     await supabase.from('messages').insert({
//       consultation_id: id,
//       sender_id: user?.id,
//       content: newMessage
//     })

//     setMessages(prev => [...prev, {
//       id: Math.random(),
//       content: newMessage,
//       sender_id: user?.id
//     }])

//     setNewMessage('')
//     setSending(false)

//   }

//   const formatTime = (seconds: number) => {

//     const mins = Math.floor(seconds / 60)
//     const secs = seconds % 60

//     return `${mins}:${secs.toString().padStart(2, '0')}`

//   }

//   if (loading) {

//     return (
//       <LawyerLayout>
//         <div className="flex items-center justify-center min-h-screen">
//           <Loader2 className="h-10 w-10 animate-spin" />
//         </div>
//       </LawyerLayout>
//     )

//   }

//   return (

//     <LawyerLayout>

//       <div className="h-[calc(100vh-64px)] flex flex-col">

//         {/* CHAT HEADER TIMER */}

//         {isActive && !isPaid && (

//           <div className="border-b p-3 flex items-center justify-center gap-2 text-sm bg-amber-50">

//             <Clock className="h-4 w-4" />

//             Client payment window:
//             <span className="font-mono font-semibold">
//               {formatTime(paymentCountdown)}
//             </span>

//           </div>

//         )}

//         {/* CHAT AREA */}

//         <div className="flex-1 overflow-y-auto p-6 relative">

//           {isActive && !isPaid && (

//             <div className="absolute inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center text-center z-20">

//               <Lock className="h-8 w-8 mb-4 text-primary" />

//               <h2 className="text-lg font-semibold mb-2">
//                 Waiting for client payment
//               </h2>

//               <p className="text-muted-foreground mb-4">
//                 Consultation will unlock after payment
//               </p>

//               <div className="text-lg font-mono flex items-center gap-2">

//                 <Clock className="h-4 w-4" />

//                 {formatTime(paymentCountdown)}

//               </div>

//             </div>

//           )}

//           <div className="max-w-3xl mx-auto space-y-4">

//             {messages.map((m, i) => {

//               const isOwn = m.sender_id === user?.id

//               return (

//                 <div key={i} className={`flex ${isOwn ? 'justify-end' : ''}`}>

//                   <div className={`px-4 py-2 rounded-lg ${isOwn ? 'bg-primary text-white' : 'bg-secondary'}`}>
//                     {m.content}
//                   </div>

//                 </div>

//               )

//             })}

//             <div ref={messagesEndRef} />

//           </div>

//         </div>

//         {/* CHAT INPUT */}

//         {isUnlocked && (

//           <div className="border-t p-4">

//             <form onSubmit={sendMessage} className="flex gap-2">

//               <Input
//                 value={newMessage}
//                 onChange={(e) => setNewMessage(e.target.value)}
//                 placeholder="Type message..."
//               />

//               <Button type="submit" disabled={sending}>

//                 {sending ? <Loader2 className="animate-spin" /> : <Send />}

//               </Button>

//             </form>

//           </div>

//         )}

//       </div>

//     </LawyerLayout>

//   )

// }

// export default LawyerConsultation
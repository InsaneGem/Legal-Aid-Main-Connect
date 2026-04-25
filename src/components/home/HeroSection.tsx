// import { Button } from '@/components/ui/button';
// import { useNavigate } from 'react-router-dom';
// import { ArrowRight, Shield, Clock, Star, Lock, CheckCircle, Eye, Currency, IndianRupee } from 'lucide-react';
// import mainPageTheme from "../../assets/main_page_theme.jpg";



// export const HeroSection = () => {
//   const navigate = useNavigate();

//   return (

//     <section className="relative min-h-[75vh] sm:min-h-[85vh] lg:min-h-[95vh] flex items-center overflow-hidden">

//       <div className="absolute inset-0">
//         <img
//           src={mainPageTheme}
//           alt="Supreme Court with lawyers"
//           className="absolute inset-0 w-full h-full object-cover object-center"
//         />
//         <div className="absolute inset-0 bg-black/35" />
//         <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
//       </div>



//       <div className="container mx-auto px-4 relative z-10">
//         <div className="max-w-3xl">



//           {/* Headline */}

//           <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up drop-shadow-lg">
//             Expert Legal Adviceeee
//             <br />

//             <span className="text-amber-100/90">At Your Fingertips</span>
//           </h1>

//           {/* Subheadline */}

//           <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl animate-slide-up drop-shadow-md" style={{ animationDelay: '0.1s' }}>
//             Connect with verified lawyers instantly via chat, audio, or video.
//             Get professional legal consultation from the comfort of your home.
//           </p>

//           {/* CTA Buttons */}
//           <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
//             <Button
//               size="lg"
//               variant="secondary"
//               className="text-base px-8 py-6 font-semibold group bg-white text-black hover:bg-amber-50"
//               onClick={() => navigate('/signup?role=client')}
//             >
//               Consult a Lawyer Now
//               <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
//             </Button>
//             <Button
//               size="lg"
//               variant="outline"
//               className="text-base px-8 py-6 font-semibold group"
//               onClick={() => navigate('/signup?role=lawyer')}
//             >
//               Join as a Lawyer
//             </Button>
//           </div>

//           {/* Trust Indicators */}
//           <div className="flex flex-wrap gap-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
//             <div className="flex items-center gap-2 text-white/90 drop-shadow-md">
//               <Shield className="h-5 w-5" />
//               <span className="text-sm">Verified Lawyers only</span>
//             </div>
//             <div className="flex items-center gap-2 text-white/90 drop-shadow-md">
//               <Clock className="h-5 w-5" />
//               <span className="text-sm">24/7 Available</span>
//             </div>
//             <div className="flex items-center gap-2 text-white/90 drop-shadow-md">
//               <Star className="h-5 w-5" />
//               <span className="text-sm">0.0/5 Rating</span>
//             </div>
//             <div className="flex items-center gap-2 text-white/90 drop-shadow-md">
//               <Lock className="h-5 w-5" />
//               <span className="text-sm">Secure Consultation</span>
//             </div>
//             <div className="flex items-center gap-2 text-white/90 drop-shadow-md">
//               <Eye className="h-5 w-5" />
//               <span className="text-sm">Private & Confidential</span>
//             </div>
//             <div className="flex items-center gap-2 text-white/90 drop-shadow-md">
//               <CheckCircle className="h-5 w-5" />
//               <span className="text-sm">Trusted by Clients Worldwide</span>
//             </div>
//             <div className="flex items-center gap-2 text-white/90 drop-shadow-md">
//               <IndianRupee className="h-5 w-5" />
//               <span className="text-sm">Affordable Pricing</span>
//             </div>


//           </div>
//         </div>
//       </div>

//       {/* Decorative Element */}
//       <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t " />
//     </section>
//   );
// };
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Star, Lock, CheckCircle, Eye, IndianRupee } from 'lucide-react';
import mainPageTheme from "../../assets/HeroLandscape.jpg";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="
      relative 
      h-[65vh] sm:h-[75vh] md:h-[90vh] lg:h-[95vh]
      flex items-center 
      overflow-hidden
    ">
      {/* // <section className="relative min-h-[75vh] flex items-center"> */}

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <img
          src={mainPageTheme}
          alt="Supreme Court with lawyers"
          className="
            absolute inset-0 w-full h-full 
            object-cover 
            object-[center_35%]
            md:object-[center_25%]
          "
        />
        <div className="absolute inset-0 bg-black/45 sm:bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      </div>

      {/* CONTENT */}
      <div className="
        max-w-7xl mx-auto 
        px-4 sm:px-6 lg:px-8 
        relative z-10
      ">
        <div className="max-w-2xl lg:max-w-3xl">

          {/* HEADLINE */}
          <h1 className="
            font-serif 
            text-3xl sm:text-4xl md:text-6xl lg:text-7xl 
            font-bold text-white 
            leading-tight tracking-tight
            mb-4 sm:mb-6
          ">
            Expert Legal Advice
            <br />
            <span className="text-amber-200/90">
              At Your Fingertips
            </span>
          </h1>

          {/* SUBTEXT */}
          <p className="
            text-sm sm:text-base md:text-lg 
            text-white/80 
            leading-relaxed 
            max-w-xl 
            mb-6 sm:mb-8
          ">
            Connect with verified lawyers instantly via chat, audio, or video.
            Get professional legal consultation from the comfort of your home.
          </p>

          {/* BUTTONS */}
          <div className="
            flex flex-col sm:flex-row 
            gap-3 sm:gap-4 
            mb-6 sm:mb-8
          ">

            {/* PRIMARY CTA */}
            <Button
              size="lg"
              variant="outline"
              className="
               w-full sm:w-auto
                border-white/40 text-white
                px-6 py-5
                text-base font-semibold
                rounded-full              
                bg-white/5
                hover:bg-white/20
                transition-all duration-300
              "
              onClick={() => navigate('/signup?role=client')}
            >
              Consult a Lawyer Now
              {/* <ArrowRight className="ml-2 h-5 w-5" /> */}
            </Button>

            {/* SECONDARY CTA */}
            <Button
              size="lg"
              variant="outline"
              className="
                w-full sm:w-auto
                border-white/40 text-white
                px-6 py-5
                text-base font-semibold
                rounded-full                
                bg-white/5
                hover:bg-white/20
                transition-all duration-300
              "
              onClick={() => navigate('/signup?role=lawyer')}
            >
              Join as a Lawyer
            </Button>

          </div>

          {/* TRUST INDICATORS */}
          <div className="
            grid grid-cols-2 sm:grid-cols-3 
            gap-2 sm:gap-3
            max-w-lg
          ">
            {[
              { icon: Shield, text: "Verified Lawyers" },
              { icon: Clock, text: "24/7 Available" },
              { icon: Star, text: "Top Rated Experts" },
              { icon: Lock, text: "Secure Consultations" },
              { icon: CheckCircle, text: "Trusted Worldwide" },
              { icon: IndianRupee, text: "Affordable Pricing" },
            ].map((item, index) => (
              <div
                key={index}
                className="
                  flex items-center gap-2
                  px-3 py-2                                  
                  text-white text-[11px] sm:text-xs                 
                  transition-all duration-200
                "
              >
                <item.icon className="h-3.5 w-3.5 opacity-90" />
                {item.text}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};
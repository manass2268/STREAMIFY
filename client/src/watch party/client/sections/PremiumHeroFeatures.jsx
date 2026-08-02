import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { Video, Shield, MessageSquare, Monitor, Radio, Calendar, Zap, ArrowRight, Users } from 'lucide-react';
import HologramScene from '../components/3D/HologramScene';
import TiltCard from '../components/Cards/TiltCard';

// Animation Variants for Page Load
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.2, delayChildren: 0.3 } 
  }
};

const textBlurVariants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(12px)', scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)', 
    scale: 1,
    transition: { duration: 1, ease: [0.2, 0.65, 0.3, 0.9] } 
  }
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut", delay: 0.8 } }
};

// 🔥 NEW: Animation Variants for Scroll Reveals
const scrollRevealVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (customDelay) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: customDelay * 0.15 }
  })
};

export default function PremiumHeroFeatures({ onCreateMeeting, onJoinMeeting, joinCode, setJoinCode }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 15; 
      const y = (clientY / window.innerHeight - 0.5) * 15;
      containerRef.current.style.setProperty('--mouse-x', `${x}px`);
      containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { icon: <Video className="w-5 h-5 text-purple-400" />, title: "HD Video Calls", desc: "Crystal clear quality" },
    { icon: <Users className="w-5 h-5 text-blue-400" />, title: "Smart Meeting", desc: "AI noise cancellation" },
    { icon: <Shield className="w-5 h-5 text-emerald-400" />, title: "Secure & Private", desc: "End-to-end encryption" },
    { icon: <MessageSquare className="w-5 h-5 text-orange-400" />, title: "Live Chat", desc: "Real-time messaging" },
    { icon: <Monitor className="w-5 h-5 text-indigo-400" />, title: "Screen Sharing", desc: "Share without limits" },
    { icon: <Radio className="w-5 h-5 text-cyan-400" />, title: "Up to 100 People", desc: "Large meetings" }
  ];

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-[#05060A] flex flex-col pt-32 pb-20 overflow-hidden font-sans items-center">
      
      {/* BACKGROUND GLOWS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 mix-blend-screen flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[120px] top-0 left-0 -translate-x-1/4 -translate-y-1/4"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[150px] top-1/4 right-0 translate-x-1/4"
        />
      </div>

      <div className="w-[92%] max-w-7xl mx-auto flex flex-col z-10 relative">
        
        {/* ================= HERO SECTION ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="flex flex-col space-y-7 z-20">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }} className="relative flex items-center gap-2 px-4 py-1.5 w-fit rounded-full bg-white/5 border border-white/10 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <span className="text-yellow-500 text-xs animate-pulse">⭐</span>
              <span className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider relative z-10">Premium Meeting Experience</span>
            </motion.div>
            
            <motion.h1 variants={containerVariants} initial="hidden" animate="visible" className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white flex flex-wrap gap-x-4">
              <motion.span variants={textBlurVariants}>Meet.</motion.span>
              <motion.span variants={textBlurVariants}>Connect.</motion.span>
              <motion.span variants={textBlurVariants} className="bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] bg-clip-text text-transparent w-full mt-2">Collaborate.</motion.span>
            </motion.h1>

            <motion.p variants={fadeUpVariants} initial="hidden" animate="visible" className="text-gray-400 text-lg max-w-lg leading-relaxed">
              Streamify Meet brings teams, friends, and ideas together with crystal clear video, smart tools, and secure meetings.
            </motion.p>

            <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" className="flex flex-wrap items-center gap-4">
              <button onClick={onCreateMeeting} className="h-12 px-6 rounded-xl font-medium text-white transition-all duration-300 flex items-center gap-2 relative overflow-hidden group" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', boxShadow: '0 10px 30px -10px rgba(139,92,246,0.5)' }}>
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out skew-x-12"></div>
                <span className="text-lg relative z-10">＋</span> 
                <span className="relative z-10">Create New Meeting</span>
              </button>

              <form onSubmit={onJoinMeeting} className="flex items-center h-12 bg-white/[0.03] border border-white/10 rounded-xl px-2 focus-within:border-purple-500/50 transition-colors duration-300">
                <span className="text-gray-500 ml-2">🔗</span>
                <input type="text" placeholder="Join with Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} className="bg-transparent border-none outline-none text-white w-32 px-3 text-sm" />
                <button type="submit" disabled={!joinCode.trim()} className="text-gray-400 hover:text-white text-sm font-medium px-2 disabled:opacity-50 transition-colors">Join</button>
              </form>
            </motion.div>
            
            <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              <Shield className="w-4 h-4 text-emerald-500/80" /> End-to-end encrypted meetings
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, type: "spring", delay: 0.5 }} className="relative h-[450px] lg:h-[550px] w-full flex justify-center items-center">
            <motion.div animate={{ y: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute top-[10%] left-[10%] p-1 bg-white/5 border border-white/10 rounded-full z-10 pointer-events-none">
              <img src="https://i.pravatar.cc/100?img=9" className="w-10 h-10 rounded-full" alt="user"/>
            </motion.div>
            <motion.div animate={{ y: [5, -5, 5] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute bottom-[20%] left-[5%] p-1 bg-white/5 border border-white/10 rounded-full z-10 pointer-events-none">
              <img src="https://i.pravatar.cc/100?img=11" className="w-12 h-12 rounded-full" alt="user"/>
            </motion.div>
            <motion.div animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute top-[20%] right-[5%] p-1 bg-white/5 border border-white/10 rounded-full z-10 pointer-events-none">
              <img src="https://i.pravatar.cc/100?img=5" className="w-12 h-12 rounded-full" alt="user"/>
            </motion.div>
            <HologramScene />
          </motion.div>
        </div>

        {/* ================= FEATURE CARDS ROW (Scroll Reveal Added) ================= */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10 border-b border-white/10 pb-10">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              custom={idx}
              variants={scrollRevealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <TiltCard icon={feat.icon} title={feat.title} desc={feat.desc} />
            </motion.div>
          ))}
        </div>

        {/* ================= BOTTOM SECTION (Scroll Reveal Added) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div custom={0} variants={scrollRevealVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex flex-col justify-center space-y-4 p-4">
            <h3 className="text-2xl font-bold text-blue-400">Your Meetings, Your Way</h3>
            <p className="text-sm text-gray-400">Start an instant meeting or schedule for later. You're in control.</p>
            <div className="flex items-center pt-2">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?img=1" className="w-8 h-8 rounded-full border-2 border-[#05060A]" alt="avatar" />
                <img src="https://i.pravatar.cc/100?img=2" className="w-8 h-8 rounded-full border-2 border-[#05060A]" alt="avatar" />
                <img src="https://i.pravatar.cc/100?img=3" className="w-8 h-8 rounded-full border-2 border-[#05060A]" alt="avatar" />
                <div className="w-8 h-8 rounded-full border-2 border-[#05060A] bg-blue-500 flex items-center justify-center text-xs font-bold text-white">+</div>
              </div>
            </div>
            <span className="text-xs text-gray-500">Trusted by 10,000+ teams worldwide</span>
          </motion.div>

          <motion.div custom={1} variants={scrollRevealVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white/[0.03] border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden group hover:bg-white/[0.05] transition-colors cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-2xl rounded-full"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-400" fill="currentColor" />
              </div>
              <h4 className="text-lg font-bold text-white">Start Instant Meeting</h4>
            </div>
            <p className="text-sm text-gray-400 max-w-[80%] mb-8">Start a meeting right now and invite people.</p>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
               <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </motion.div>

          <motion.div custom={2} variants={scrollRevealVariants} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white/[0.03] border border-blue-500/20 rounded-3xl p-6 relative overflow-hidden group hover:bg-white/[0.05] transition-colors cursor-pointer">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-2xl rounded-full"></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-cyan-400" />
              </div>
              <h4 className="text-lg font-bold text-white">Schedule for Later</h4>
            </div>
            <p className="text-sm text-gray-400 max-w-[80%] mb-8">Plan your meeting and send invites.</p>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-cyan-500 transition-colors">
               <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Target, LineChart, FileText } from 'lucide-react';
import Scanner3D from '../components/Scanner3D';

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-card p-6 flex flex-col items-center text-center group hover:border-primary/50 transition-colors"
  >
    <div className="p-4 bg-white/5 rounded-full mb-4 group-hover:scale-110 group-hover:shadow-[0_0_15px_#00f0ff] transition-all">
      <Icon className="w-8 h-8 text-primary" />
    </div>
    <h3 className="text-xl font-display font-semibold mb-2">{title}</h3>
    <p className="text-gray-400 text-sm">{desc}</p>
  </motion.div>
);

const Landing = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[80vh]">
        
        {/* Left Content */}
        <div className="lg:w-1/2 space-y-8 z-10">
          <motion.h1 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl lg:text-7xl font-display font-bold leading-tight"
          >
            Transform Your Resume Into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-glow">Career-Ready AI Profile</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-300 max-w-xl"
          >
            Analyze your resume, discover missing skills, and get a personalized AI-powered career roadmap. Built for the future of hiring.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex gap-4"
          >
            <Link to="/upload" className="relative inline-flex h-14 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background group">
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl group-hover:bg-slate-900 transition-colors gap-2">
                Analyze Resume <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            
            <Link to="/about" className="inline-flex h-14 items-center justify-center rounded-full px-8 py-1 text-sm font-medium text-white border border-white/20 hover:bg-white/5 transition-colors">
              Learn More
            </Link>
          </motion.div>
        </div>

        {/* Right 3D Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="lg:w-1/2 w-full relative"
        >
          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 rounded-full blur-[100px] -z-10"></div>
          <Scanner3D />
        </motion.div>

      </div>

      {/* Features Section */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard 
          icon={Target} 
          title="ATS Optimization" 
          desc="Get a precise ATS compatibility score to ensure your resume passes the automated screening."
          delay={0.2}
        />
        <FeatureCard 
          icon={Zap} 
          title="Skill Gap Analysis" 
          desc="Identify missing skills based on your target role and current industry demands."
          delay={0.4}
        />
        <FeatureCard 
          icon={FileText} 
          title="Smart Suggestions" 
          desc="Receive actionable improvement suggestions for your resume structure and content."
          delay={0.6}
        />
        <FeatureCard 
          icon={LineChart} 
          title="Career Roadmap" 
          desc="Generate a personalized week-by-week plan to acquire missing skills and land your dream job."
          delay={0.8}
        />
      </div>
    </div>
  );
};

export default Landing;

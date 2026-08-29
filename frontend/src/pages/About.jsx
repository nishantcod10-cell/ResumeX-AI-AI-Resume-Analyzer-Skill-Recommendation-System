import { motion } from 'framer-motion';
import { Brain, Sparkles, Hexagon } from 'lucide-react';

const About = () => {
  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-display font-bold mb-4">The Engine Behind <span className="text-primary text-glow">ResumeX</span></h1>
        <p className="text-lg text-gray-400">Discover how our AI transforms standard resumes into dynamic career profiles.</p>
      </motion.div>

      <div className="space-y-12">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 flex flex-col md:flex-row gap-8 items-center"
        >
          <div className="p-6 bg-primary/10 rounded-2xl flex-shrink-0">
            <Brain className="w-16 h-16 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-3">Powered by Advanced LLMs</h3>
            <p className="text-gray-300 leading-relaxed">
              ResumeX utilizes state-of-the-art Generative AI models to deeply understand the semantic meaning of your experience, rather than just matching keywords. It cross-references your skills with real-time industry demands to provide accurate ATS scoring and actionable insights.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 flex flex-col md:flex-row-reverse gap-8 items-center border-r-4 border-r-secondary"
        >
          <div className="p-6 bg-secondary/10 rounded-2xl flex-shrink-0">
            <Sparkles className="w-16 h-16 text-secondary" />
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-bold mb-3">Career DNA Skill Galaxy</h3>
            <p className="text-gray-300 leading-relaxed">
              Our unique 3D visualization engine maps your extracted skills, missing skills, and recommended technologies into a constellation. This interactive galaxy provides a visual representation of your professional identity, helping you easily identify areas for growth.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 flex flex-col md:flex-row gap-8 items-center"
        >
          <div className="p-6 bg-green-500/10 rounded-2xl flex-shrink-0">
            <Hexagon className="w-16 h-16 text-green-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-3">Personalized Roadmap Generation</h3>
            <p className="text-gray-300 leading-relaxed">
              Beyond just identifying gaps, ResumeX acts as your personal career coach. It generates a step-by-step, week-by-week timeline detailing exactly what courses to take, projects to build, and concepts to learn to bridge the gap between your current skills and your target role.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;

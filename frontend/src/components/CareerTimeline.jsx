import { motion } from 'framer-motion';

const CareerTimeline = ({ roadmap = [] }) => {
  if (!roadmap || roadmap.length === 0) return <p className="text-gray-400">No roadmap available.</p>;

  return (
    <div className="relative pl-8 md:pl-0">
      {/* Vertical Line */}
      <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-0.5 bg-white/10 transform md:-translate-x-1/2"></div>
      
      <div className="space-y-12 relative">
        {roadmap.map((item, index) => {
          const isEven = index % 2 === 0;
          
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative flex md:justify-between items-center w-full ${isEven ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Timeline Node */}
              <div className="absolute left-[-36px] md:left-1/2 w-8 h-8 rounded-full bg-darkSurface border-2 border-primary transform md:-translate-x-1/2 flex items-center justify-center z-10 shadow-[0_0_10px_#00f0ff]">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping"></div>
              </div>

              {/* Empty Space for md grid */}
              <div className="hidden md:block w-5/12"></div>

              {/* Content Card */}
              <div className="w-full md:w-5/12 ml-4 md:ml-0">
                <div className="glass-card p-5 hover:-translate-y-1 transition-transform group border-l-4 border-l-primary md:border-l-0 md:border-t-4 md:border-t-primary">
                  <span className="inline-block px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full mb-2 uppercase tracking-wider">
                    {item.week || `Step ${index + 1}`}
                  </span>
                  <h4 className="text-white text-base leading-relaxed group-hover:text-primary transition-colors">
                    {item.task}
                  </h4>
                </div>
              </div>

            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CareerTimeline;

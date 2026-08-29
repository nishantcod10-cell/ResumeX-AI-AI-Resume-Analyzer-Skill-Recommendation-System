import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Analyze', path: '/upload' },
    { name: 'History', path: '/history' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 px-6 py-4 flex justify-between items-center rounded-full">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
          <BrainCircuit className="w-6 h-6 text-primary" />
        </div>
        <span className="text-xl font-display font-bold tracking-wider text-glow">ResumeX AI</span>
      </Link>

      <ul className="flex gap-8">
        {links.map((link) => (
          <li key={link.name} className="relative">
            <Link
              to={link.path}
              className={`text-sm uppercase tracking-widest font-medium transition-colors hover:text-primary ${
                location.pathname === link.path ? 'text-primary' : 'text-gray-400'
              }`}
            >
              {link.name}
              {location.pathname === link.path && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_#00f0ff]"
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;

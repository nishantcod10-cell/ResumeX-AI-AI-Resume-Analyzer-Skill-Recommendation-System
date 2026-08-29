import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import About from './pages/About';

function App() {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Global Background Effect */}
      <div className="fixed inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-darkSurface via-background to-background"></div>
      <div className="fixed inset-0 z-[-1] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen pointer-events-none"></div>
      
      <Navbar />
      
      <main className="flex-grow pt-20">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

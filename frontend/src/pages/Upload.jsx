import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { toast } from 'react-toastify';

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "AI/ML Engineer",
  "UI/UX Designer",
  "Cybersecurity Analyst",
  "Product Manager",
  "DevOps Engineer"
];

const Upload = () => {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadType, setUploadType] = useState('pdf'); // 'pdf' or 'text'
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    targetRole: ''
  });

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelection = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf') {
      toast.error("Please upload a PDF file.");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB.");
      return;
    }
    setFile(selectedFile);
  };

  const simulateProgress = () => {
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 500);
    return interval;
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.targetRole) {
      toast.error("Please fill all user details.");
      return;
    }
    if (uploadType === 'pdf' && !file) {
      toast.error("Please upload a PDF resume.");
      return;
    }
    if (uploadType === 'text' && !text.trim()) {
      toast.error("Please paste your resume text.");
      return;
    }

    setLoading(true);
    const progressInterval = simulateProgress();

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('targetRole', formData.targetRole);
      
      if (uploadType === 'pdf') {
        data.append('resume', file);
      } else {
        data.append('textResume', text);
      }

      // Send resume data to API
      const response = await axios.post(`${API_BASE_URL}/api/resume/analyze`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      clearInterval(progressInterval);
      setScanProgress(100);
      toast.success("Analysis Complete!");
      
      setTimeout(() => {
        navigate(`/dashboard/${response.data.reportId}`);
      }, 1000);

    } catch (error) {
      clearInterval(progressInterval);
      setScanProgress(0);
      toast.error(error.response?.data?.error || "Failed to analyze resume. Make sure backend is running.");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-12 max-w-4xl relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-display font-bold mb-4">Initialize Analysis</h1>
        <p className="text-gray-400">Upload your resume and select your target role to begin the AI scan.</p>
      </motion.div>

      <form onSubmit={handleAnalyze} className="glass-card p-8 space-y-8 relative overflow-hidden">
        
        {/* Loading Overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center"
            >
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div className="absolute inset-0 blur-xl bg-primary/30 rounded-full animate-pulse"></div>
              </div>
              <h3 className="mt-6 text-xl font-display font-bold text-glow">Scanning Neural Pathways</h3>
              <p className="text-gray-300 mt-2">Extracting skills and evaluating fit...</p>
              
              <div className="w-64 h-2 bg-white/10 rounded-full mt-6 overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="mt-2 text-sm font-mono text-primary">{scanProgress}%</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
              <input 
                type="text" 
                required
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white placeholder-gray-500"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white placeholder-gray-500"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Target Role</label>
            <select 
              required
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white appearance-none"
              value={formData.targetRole}
              onChange={(e) => setFormData({...formData, targetRole: e.target.value})}
            >
              <option value="" disabled className="bg-darkSurface text-gray-500">Select a target role</option>
              {ROLES.map(role => (
                <option key={role} value={role} className="bg-darkSurface text-white">{role}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center gap-4 border-b border-white/10 pb-4">
            <button 
              type="button"
              onClick={() => setUploadType('pdf')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${uploadType === 'pdf' ? 'bg-primary/20 text-primary border border-primary/50' : 'text-gray-400 hover:text-white'}`}
            >
              Upload PDF
            </button>
            <button 
              type="button"
              onClick={() => setUploadType('text')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${uploadType === 'text' ? 'bg-primary/20 text-primary border border-primary/50' : 'text-gray-400 hover:text-white'}`}
            >
              Paste Text
            </button>
          </div>

          <AnimatePresence mode="wait">
            {uploadType === 'pdf' ? (
              <motion.div
                key="pdf-upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors cursor-pointer ${
                  isDragActive ? 'border-primary bg-primary/5' : 'border-white/20 hover:border-primary/50 hover:bg-white/5'
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="application/pdf"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelection(e.target.files[0]);
                    }
                  }}
                />
                
                {file ? (
                  <div className="flex flex-col items-center text-primary space-y-3">
                    <div className="p-3 bg-primary/20 rounded-full">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <span className="font-medium text-lg">{file.name}</span>
                    <span className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-400 space-y-4 pointer-events-none">
                    <div className="p-4 bg-white/5 rounded-full">
                      <UploadCloud className="w-10 h-10 text-gray-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-white mb-1">Click to upload or drag and drop</p>
                      <p className="text-sm">PDF (MAX. 5MB)</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="text-upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <textarea
                  className="w-full h-64 bg-black/20 border border-white/10 rounded-xl p-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white placeholder-gray-500 font-mono text-sm resize-none"
                  placeholder="Paste your resume text here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit"
            disabled={loading}
            className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-8 py-1 font-medium text-white backdrop-blur-3xl group-hover:bg-slate-900 transition-colors gap-2">
              <FileText className="w-4 h-4" /> Start AI Analysis
            </span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default Upload;

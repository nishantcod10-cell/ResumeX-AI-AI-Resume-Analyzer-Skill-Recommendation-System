import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Target, Zap, AlertTriangle, CheckCircle, TrendingUp, BookOpen, Briefcase, Award, Lightbulb } from 'lucide-react';
import ResumeChatbot from '../components/ResumeChatbot';
import API_BASE_URL from '../config/api';
import SkillGalaxy from '../components/SkillGalaxy';
import CareerTimeline from '../components/CareerTimeline';
import { toast } from 'react-toastify';

const CircularProgress = ({ value, label, color }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle cx="48" cy="48" r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
          <motion.circle
            cx="48" cy="48" r={radius}
            stroke={color} strokeWidth="8" fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="drop-shadow-[0_0_8px_currentColor]"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold font-display text-glow">{value}%</span>
        </div>
      </div>
      <span className="mt-3 text-sm text-gray-400 font-medium">{label}</span>
    </div>
  );
};

const Dashboard = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const dashboardRef = useRef(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/reports/${id}`);
        setReport(response.data);
      } catch (error) {
        toast.error("Failed to load report data.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (!report) return <div className="text-center py-20">Report not found.</div>;

  return (
    <div className="container mx-auto px-6 py-8 relative">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-8 no-print">
        <div>
          <h1 className="text-3xl font-display font-bold">Analysis Profile</h1>
          <p className="text-gray-400">Target Role: <span className="text-primary font-medium">{report.targetRole}</span></p>
        </div>
      </div>

      <div ref={dashboardRef} className="space-y-8 pb-20 p-2">
        
        {/* Top Scores & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} className="glass-card p-6 col-span-2 flex flex-col justify-center">
            <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
              <Award className="text-secondary" /> AI Summary
            </h2>
            <p className="text-gray-300 leading-relaxed text-sm md:text-base">{report.summary}</p>
          </motion.div>
          
          <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.1}} className="glass-card p-6 flex justify-around items-center">
            <CircularProgress value={report.resumeScore} label="Resume Score" color="#00f0ff" />
            <CircularProgress value={report.atsScore} label="ATS Score" color="#8a2be2" />
          </motion.div>
        </div>

        {/* 3D Skill Galaxy (Unique USP) */}
        <motion.div initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}} transition={{delay: 0.2}} className="glass-card p-0 overflow-hidden relative h-[400px] no-print">
          <div className="absolute top-6 left-6 z-10 pointer-events-none">
            <h2 className="text-2xl font-display font-bold flex items-center gap-2 text-glow">
              <Target className="text-primary" /> Career DNA Skill Galaxy
            </h2>
            <p className="text-sm text-gray-400 mt-1">Interactive 3D visualization of your skill nodes</p>
          </div>
          <SkillGalaxy extracted={report.extractedSkills} missing={report.missingSkills} recommended={report.recommendedTechnologies} />
        </motion.div>

        {/* Skills Breakdown Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 border-l-4 border-l-primary">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><CheckCircle className="text-primary w-5 h-5"/> Present Skills</h3>
            <div className="flex flex-wrap gap-2">
              {report.extractedSkills.map((skill, i) => (
                <span key={i} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-sm">{skill}</span>
              ))}
            </div>
          </div>
          
          <div className="glass-card p-6 border-l-4 border-l-red-500">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><AlertTriangle className="text-red-400 w-5 h-5"/> Missing Skills</h3>
            <div className="flex flex-wrap gap-2">
              {report.missingSkills.map((skill, i) => (
                <span key={i} className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-sm">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 text-green-400">Strengths</h3>
            <ul className="space-y-3">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-green-400"></div> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 text-orange-400">Areas for Improvement</h3>
            <ul className="space-y-3">
              {report.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-orange-400"></div> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="text-secondary" /> AI Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-3">Actionable Steps</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {report.improvementSuggestions.map((s, i) => <li key={i}>• {s}</li>)}
              </ul>
            </div>
            <div>
              <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1"><Zap className="w-4 h-4"/> Tech to Learn</h4>
              <div className="flex flex-wrap gap-2">
                {report.recommendedTechnologies.map((t, i) => (
                  <span key={i} className="bg-white/5 border border-white/10 px-2 py-1 rounded text-xs">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1"><BookOpen className="w-4 h-4"/> Suggested Courses</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                {report.recommendedCourses.map((c, i) => <li key={i}>• {c}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* AI Career Roadmap Timeline (Extra Unique USP) */}
        <div className="glass-card p-6 no-print">
          <h2 className="text-xl font-display font-bold mb-8 flex items-center gap-2">
            <Briefcase className="text-primary" /> AI Career Roadmap Timeline
          </h2>
          <CareerTimeline roadmap={report.careerRoadmap} />
        </div>

        {/* Project Recommendations */}
        {report.projectRecommendations && report.projectRecommendations.length > 0 && (
          <div className="glass-card p-6">
            <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
              <Lightbulb className="text-yellow-400" /> Recommended Projects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.projectRecommendations.map((project, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-primary/30 transition-colors group"
                >
                  <h4 className="text-base font-bold text-white mb-2 group-hover:text-primary transition-colors">{project.name}</h4>
                  <p className="text-sm text-gray-400 leading-relaxed">{project.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* AI Resume Chatbot */}
      <ResumeChatbot reportId={id} />
    </div>
  );
};

export default Dashboard;

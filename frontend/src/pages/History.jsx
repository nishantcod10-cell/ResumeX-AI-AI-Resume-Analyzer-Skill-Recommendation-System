import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

const History = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/reports`);
      setReports(res.data);
    } catch (error) {
      toast.error("Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/reports/${id}`);
      setReports(reports.filter(r => r._id !== id));
      toast.success("Report deleted");
    } catch (error) {
      toast.error("Failed to delete report.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex justify-between items-end border-b border-white/10 pb-6"
      >
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Analysis History</h1>
          <p className="text-gray-400">View and manage your past AI resume evaluations.</p>
        </div>
      </motion.div>

      {reports.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No reports found. <Link to="/upload" className="text-primary hover:underline">Analyze a resume now.</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <motion.div
              key={report._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6 flex flex-col hover:border-primary/50 transition-colors group relative overflow-hidden"
            >
              {/* Decorative background glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{report.name}</h3>
                  <span className="text-primary text-sm font-medium">{report.targetRole}</span>
                </div>
                <button 
                  onClick={() => handleDelete(report._id)}
                  className="text-gray-500 hover:text-red-500 transition-colors z-10"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-black/20 rounded-lg p-3 text-center border border-white/5">
                  <div className="text-2xl font-bold font-display text-glow">{report.resumeScore}%</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">Resume</div>
                </div>
                <div className="flex-1 bg-black/20 rounded-lg p-3 text-center border border-white/5">
                  <div className="text-2xl font-bold font-display text-[#8a2be2]">{report.atsScore}%</div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider mt-1">ATS</div>
                </div>
              </div>

              <div className="mt-auto flex justify-between items-center border-t border-white/10 pt-4">
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(report.createdAt).toLocaleDateString()}
                </div>
                <Link 
                  to={`/dashboard/${report._id}`}
                  className="text-sm font-medium hover:text-primary flex items-center gap-1 transition-colors z-10"
                >
                  View Details <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;

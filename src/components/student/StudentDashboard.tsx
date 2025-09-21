import React, { useState, useEffect } from 'react';
import { Upload, FileText, Target, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { User, Resume, Evaluation, UploadProgress } from '../../types';
import { dataService } from '../../services/dataService';
import { ResumeUpload } from './ResumeUpload';
import { EvaluationResults } from './EvaluationResults';

interface StudentDashboardProps {
  user: User;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resumesData, evaluationsData] = await Promise.all([
        dataService.getResumesByStudent(user.id),
        dataService.getEvaluationsByStudent(user.id)
      ]);
      setResumes(resumesData);
      setEvaluations(evaluationsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (resume: Resume) => {
    setResumes(prev => [...prev, resume]);
    setShowUpload(false);
    loadData(); // Reload to get updated data
  };

  const calculateAverageScore = () => {
    if (evaluations.length === 0) return 0;
    const total = evaluations.reduce((sum, evaluation) => sum + evaluation.relevance_score, 0);
    return Math.round(total / evaluations.length);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const averageScore = calculateAverageScore();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
          <p className="text-gray-600 mt-2">Track your resume performance and get insights to improve your job applications</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <Upload size={20} />
          <span>Upload Resume</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Resumes</p>
              <p className="text-3xl font-bold text-gray-900">{resumes.length}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Evaluations</p>
              <p className="text-3xl font-bold text-gray-900">{evaluations.length}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(averageScore)}`}>
                {averageScore}%
              </p>
            </div>
            <div className={`p-3 ${getScoreBgColor(averageScore)} rounded-lg`}>
              <TrendingUp className={`w-6 h-6 ${getScoreColor(averageScore)}`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Matches</p>
              <p className="text-3xl font-bold text-emerald-600">
                {evaluations.filter(e => e.fit_verdict === 'High').length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Award className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Evaluations */}
      {evaluations.length > 0 ? (
        <EvaluationResults evaluations={evaluations} />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Evaluations Yet</h3>
          <p className="text-gray-600 mb-6">
            Upload your resume to start getting AI-powered relevance scores and feedback
          </p>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Upload size={20} />
            <span>Upload Your First Resume</span>
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <ResumeUpload
          user={user}
          onComplete={handleUploadComplete}
          onClose={() => setShowUpload(false)}
        />
      )}
    </div>
  );
};
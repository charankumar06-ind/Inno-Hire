import React, { useState, useEffect } from 'react';
import { Plus, Users, Target, TrendingUp, Briefcase, FileText, Search, Filter, Download } from 'lucide-react';
import { User, JobDescription, Evaluation, Resume } from '../../types';
import { dataService } from '../../services/dataService';
import { JobDescriptionForm } from './JobDescriptionForm';
import { EvaluationDashboard } from './EvaluationDashboard';

interface RecruiterDashboardProps {
  user: User;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ user }) => {
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);

  useEffect(() => {
    loadData();
    dataService.seedData(); // Ensure demo data is available
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, evaluationsData, resumesData] = await Promise.all([
        dataService.getJobDescriptionsByRecruiter(user.id),
        dataService.getEvaluationsByRecruiter(user.id),
        dataService.getAllResumes()
      ]);
      setJobDescriptions(jobsData);
      setEvaluations(evaluationsData);
      setResumes(resumesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobDescriptionCreated = (jobDescription: JobDescription) => {
    setJobDescriptions(prev => [...prev, jobDescription]);
    setShowJobForm(false);
    loadData(); // Reload to get updated data
  };

  const calculateStats = () => {
    const totalApplications = evaluations.length;
    const highMatches = evaluations.filter(e => e.fit_verdict === 'High').length;
    const averageScore = totalApplications > 0 
      ? Math.round(evaluations.reduce((sum, e) => sum + e.relevance_score, 0) / totalApplications)
      : 0;

    return {
      totalApplications,
      highMatches,
      averageScore,
      activeJobs: jobDescriptions.length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage job postings and evaluate candidate resumes with AI-powered insights</p>
        </div>
        <button
          onClick={() => setShowJobForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <Plus size={20} />
          <span>Add Job Description</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeJobs}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Briefcase className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Matches</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.highMatches}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <Target className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Score</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.averageScore}%</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Job Descriptions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Active Job Postings</h2>
            <button
              onClick={() => setShowJobForm(true)}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
            >
              + Add New
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {jobDescriptions.length > 0 ? (
            <div className="grid gap-4">
              {jobDescriptions.map((job) => {
                const jobEvaluations = evaluations.filter(e => e.job_description_id === job.id);
                const avgScore = jobEvaluations.length > 0
                  ? Math.round(jobEvaluations.reduce((sum, e) => sum + e.relevance_score, 0) / jobEvaluations.length)
                  : 0;
                
                return (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.company}</p>
                        <p className="text-sm text-gray-500">Experience: {job.experience_level}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">{avgScore}%</div>
                        <div className="text-sm text-gray-500">Avg Score</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.required_skills.slice(0, 5).map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {job.required_skills.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{job.required_skills.length - 5} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{jobEvaluations.length} applications evaluated</span>
                      <span>Created {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Job Postings Yet</h3>
              <p className="text-gray-600 mb-6">Create your first job description to start evaluating resumes</p>
              <button
                onClick={() => setShowJobForm(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus size={20} />
                <span>Create Job Description</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Evaluation Dashboard */}
      {evaluations.length > 0 && (
        <EvaluationDashboard 
          evaluations={evaluations} 
          resumes={resumes}
          jobDescriptions={jobDescriptions}
        />
      )}

      {/* Job Description Form Modal */}
      {showJobForm && (
        <JobDescriptionForm
          user={user}
          onComplete={handleJobDescriptionCreated}
          onClose={() => setShowJobForm(false)}
        />
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { Search, Filter, Download, Eye, SortAsc, SortDesc, Users, Target, CheckCircle } from 'lucide-react';
import { Evaluation, Resume, JobDescription } from '../../types';
import { saveAs } from 'file-saver';

interface EvaluationDashboardProps {
  evaluations: Evaluation[];
  resumes: Resume[];
  jobDescriptions: JobDescription[];
}

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({ 
  evaluations, 
  resumes, 
  jobDescriptions 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<string>('all');
  const [selectedFit, setSelectedFit] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'name'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);

  // Get unique job titles for filter
  const jobOptions = jobDescriptions.map(job => ({
    id: job.id,
    title: job.title,
    company: job.company
  }));

  // Filter and sort evaluations
  const filteredEvaluations = evaluations
    .filter(evaluation => {
      const resume = resumes.find(r => r.id === evaluation.resume_id);
      const matchesSearch = !searchTerm || 
        (resume?.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         resume?.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
         evaluation.job_title.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesJob = selectedJob === 'all' || evaluation.job_description_id === selectedJob;
      const matchesFit = selectedFit === 'all' || evaluation.fit_verdict === selectedFit;
      
      return matchesSearch && matchesJob && matchesFit;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'score':
          aValue = a.relevance_score;
          bValue = b.relevance_score;
          break;
        case 'date':
          aValue = new Date(a.evaluated_at).getTime();
          bValue = new Date(b.evaluated_at).getTime();
          break;
        case 'name':
          const resumeA = resumes.find(r => r.id === a.resume_id);
          const resumeB = resumes.find(r => r.id === b.resume_id);
          aValue = resumeA?.student_name || '';
          bValue = resumeB?.student_name || '';
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getFitVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'High': return 'text-emerald-700 bg-emerald-100';
      case 'Medium': return 'text-yellow-700 bg-yellow-100';
      case 'Low': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Student Name',
      'Email',
      'Job Title',
      'Company',
      'Relevance Score',
      'Hard Match Score',
      'Soft Match Score',
      'Fit Verdict',
      'Missing Skills',
      'Evaluation Date'
    ];

    const csvData = filteredEvaluations.map(evaluation => {
      const resume = resumes.find(r => r.id === evaluation.resume_id);
      return [
        resume?.student_name || '',
        resume?.student_email || '',
        evaluation.job_title,
        evaluation.company,
        evaluation.relevance_score,
        evaluation.hard_match_score,
        evaluation.soft_match_score,
        evaluation.fit_verdict,
        evaluation.missing_skills.join('; '),
        new Date(evaluation.evaluated_at).toLocaleDateString()
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `resume_evaluations_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Resume Evaluations</h2>
            <p className="text-sm text-gray-600 mt-1">{filteredEvaluations.length} evaluations found</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, email, or job..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 w-64"
              />
            </div>

            {/* Job Filter */}
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Jobs</option>
              {jobOptions.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.company}
                </option>
              ))}
            </select>

            {/* Fit Filter */}
            <select
              value={selectedFit}
              onChange={(e) => setSelectedFit(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Fits</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'date' | 'name')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="score">Score</option>
                <option value="date">Date</option>
                <option value="name">Name</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
              >
                {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
              </button>
            </div>

            {/* Export */}
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvaluations.map((evaluation) => {
              const resume = resumes.find(r => r.id === evaluation.resume_id);
              return (
                <tr key={evaluation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{resume?.student_name}</div>
                      <div className="text-sm text-gray-500">{resume?.student_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{evaluation.job_title}</div>
                      <div className="text-sm text-gray-500">{evaluation.company}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(evaluation.relevance_score)}`}>
                        {evaluation.relevance_score}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFitVerdictColor(evaluation.fit_verdict)}`}>
                      {evaluation.fit_verdict}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(evaluation.evaluated_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedEvaluation(evaluation)}
                      className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                      <Eye size={16} />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredEvaluations.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Evaluations Found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* Evaluation Detail Modal */}
      {selectedEvaluation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Evaluation Details</h3>
              <button
                onClick={() => setSelectedEvaluation(null)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              {(() => {
                const resume = resumes.find(r => r.id === selectedEvaluation.resume_id);
                return (
                  <div className="space-y-6">
                    {/* Student Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Student Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <span className="ml-2 font-medium">{resume?.student_name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>
                          <span className="ml-2">{resume?.student_email}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Resume File:</span>
                          <span className="ml-2">{resume?.filename}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Uploaded:</span>
                          <span className="ml-2">{resume && formatDate(resume.uploaded_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Job Information */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Job Position</h4>
                      <div className="text-sm">
                        <div className="font-medium text-lg">{selectedEvaluation.job_title}</div>
                        <div className="text-gray-600">{selectedEvaluation.company}</div>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(selectedEvaluation.relevance_score).split(' ')[0]}`}>
                          {selectedEvaluation.relevance_score}%
                        </div>
                        <div className="text-sm text-gray-600">Overall Score</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600">{selectedEvaluation.hard_match_score}%</div>
                        <div className="text-sm text-gray-600">Hard Match</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-purple-600">{selectedEvaluation.soft_match_score}%</div>
                        <div className="text-sm text-gray-600">Soft Match</div>
                      </div>
                    </div>

                    {/* Fit Verdict */}
                    <div className="flex items-center justify-center">
                      <span className={`px-6 py-2 rounded-full font-medium ${getFitVerdictColor(selectedEvaluation.fit_verdict)}`}>
                        {selectedEvaluation.fit_verdict} Match
                      </span>
                    </div>

                    {/* Feedback */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">AI Feedback</h4>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-gray-700">{selectedEvaluation.feedback}</p>
                      </div>
                    </div>

                    {/* Missing Elements */}
                    {(selectedEvaluation.missing_skills.length > 0 || 
                      selectedEvaluation.missing_certifications.length > 0 || 
                      selectedEvaluation.missing_projects.length > 0) && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Areas for Improvement</h4>
                        
                        {selectedEvaluation.missing_skills.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Missing Skills</h5>
                            <div className="flex flex-wrap gap-2">
                              {selectedEvaluation.missing_skills.map((skill, index) => (
                                <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedEvaluation.missing_certifications.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Recommended Certifications</h5>
                            <div className="flex flex-wrap gap-2">
                              {selectedEvaluation.missing_certifications.map((cert, index) => (
                                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                                  {cert}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedEvaluation.missing_projects.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Suggested Projects</h5>
                            <div className="flex flex-wrap gap-2">
                              {selectedEvaluation.missing_projects.map((project, index) => (
                                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                  {project}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
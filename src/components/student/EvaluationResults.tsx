import React from 'react';
import { Target, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Award, BookOpen } from 'lucide-react';
import { Evaluation } from '../../types';

interface EvaluationResultsProps {
  evaluations: Evaluation[];
}

export const EvaluationResults: React.FC<EvaluationResultsProps> = ({ evaluations }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getFitVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'High': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'Medium': return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Low': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Evaluation Results</h2>
        <div className="text-sm text-gray-500">
          {evaluations.length} evaluation{evaluations.length !== 1 ? 's' : ''} total
        </div>
      </div>

      <div className="grid gap-6">
        {evaluations.map((evaluation) => (
          <div key={evaluation.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{evaluation.job_title}</h3>
                <p className="text-gray-600">{evaluation.company}</p>
                <p className="text-sm text-gray-500 mt-1">Evaluated on {formatDate(evaluation.evaluated_at)}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getFitVerdictIcon(evaluation.fit_verdict)}
                  <span className={`font-medium ${
                    evaluation.fit_verdict === 'High' ? 'text-emerald-600' :
                    evaluation.fit_verdict === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {evaluation.fit_verdict} Match
                  </span>
                </div>
                
                <div className={`px-4 py-2 rounded-lg border ${getScoreBgColor(evaluation.relevance_score)}`}>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getScoreColor(evaluation.relevance_score)}`}>
                      {evaluation.relevance_score}%
                    </div>
                    <div className="text-xs text-gray-600">Relevance</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Hard Match</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{evaluation.hard_match_score}%</div>
                <div className="text-sm text-gray-600">Skills & Keywords</div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Award className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Soft Match</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{evaluation.soft_match_score}%</div>
                <div className="text-sm text-gray-600">Context & Experience</div>
              </div>
            </div>

            {/* Feedback */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">AI Feedback</h4>
              <p className="text-gray-700 text-sm leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-200">
                {evaluation.feedback}
              </p>
            </div>

            {/* Missing Skills */}
            {(evaluation.missing_skills.length > 0 || evaluation.missing_certifications.length > 0 || evaluation.missing_projects.length > 0) && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Areas for Improvement</h4>
                
                {evaluation.missing_skills.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <BookOpen className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">Missing Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {evaluation.missing_skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {evaluation.missing_certifications.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Recommended Certifications</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {evaluation.missing_certifications.map((cert, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {evaluation.missing_projects.length > 0 && (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Suggested Projects</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {evaluation.missing_projects.map((project, index) => (
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
        ))}
      </div>
    </div>
  );
};
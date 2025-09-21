import React, { useState } from 'react';
import { X, Plus, Trash2, Briefcase, Building, Users, BookOpen } from 'lucide-react';
import { User, JobDescription } from '../../types';
import { dataService } from '../../services/dataService';
import { aiService } from '../../services/aiService';

interface JobDescriptionFormProps {
  user: User;
  onComplete: (jobDescription: JobDescription) => void;
  onClose: () => void;
}

export const JobDescriptionForm: React.FC<JobDescriptionFormProps> = ({ user, onComplete, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    experienceLevel: 'Mid-level'
  });
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['']);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillChange = (index: number, value: string, type: 'required' | 'preferred') => {
    if (type === 'required') {
      const updated = [...requiredSkills];
      updated[index] = value;
      setRequiredSkills(updated);
    } else {
      const updated = [...preferredSkills];
      updated[index] = value;
      setPreferredSkills(updated);
    }
  };

  const addSkill = (type: 'required' | 'preferred') => {
    if (type === 'required') {
      setRequiredSkills(prev => [...prev, '']);
    } else {
      setPreferredSkills(prev => [...prev, '']);
    }
  };

  const removeSkill = (index: number, type: 'required' | 'preferred') => {
    if (type === 'required') {
      setRequiredSkills(prev => prev.filter((_, i) => i !== index));
    } else {
      setPreferredSkills(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty skills
      const filteredRequiredSkills = requiredSkills.filter(skill => skill.trim() !== '');
      const filteredPreferredSkills = preferredSkills.filter(skill => skill.trim() !== '');

      const jobDescription = await dataService.createJobDescription(
        user.id,
        formData.title,
        formData.company,
        formData.description,
        filteredRequiredSkills,
        filteredPreferredSkills,
        formData.experienceLevel
      );

      // Start evaluation process for existing resumes
      setEvaluating(true);
      const allResumes = await dataService.getAllResumes();
      
      if (allResumes.length > 0) {
        const evaluations = await aiService.batchEvaluate(allResumes, jobDescription);
        
        // Save all evaluations
        for (const evaluation of evaluations) {
          await dataService.saveEvaluation(evaluation);
        }
      }

      onComplete(jobDescription);
    } catch (error) {
      console.error('Failed to create job description:', error);
    } finally {
      setLoading(false);
      setEvaluating(false);
    }
  };

  if (evaluating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Job Description</h3>
          <p className="text-gray-600">Evaluating existing resumes against your job requirements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-900">Create Job Description</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Briefcase size={16} />
                    <span>Job Title</span>
                  </div>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Full Stack Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Building size={16} />
                    <span>Company</span>
                  </div>
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., TechCorp Inc."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Users size={16} />
                  <span>Experience Level</span>
                </div>
              </label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Detailed job description including responsibilities, requirements, and benefits..."
              />
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <BookOpen size={16} />
                  <span>Required Skills</span>
                </div>
              </label>
              <div className="space-y-2">
                {requiredSkills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value, 'required')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., React, Node.js, Python"
                    />
                    {requiredSkills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSkill(index, 'required')}
                        className="p-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSkill('required')}
                  className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
                >
                  <Plus size={16} />
                  <span>Add Required Skill</span>
                </button>
              </div>
            </div>

            {/* Preferred Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Skills (Optional)
              </label>
              <div className="space-y-2">
                {preferredSkills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value, 'preferred')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="e.g., AWS, Docker, TypeScript"
                    />
                    <button
                      type="button"
                      onClick={() => removeSkill(index, 'preferred')}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSkill('preferred')}
                  className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700"
                >
                  <Plus size={16} />
                  <span>Add Preferred Skill</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{loading ? 'Creating...' : 'Create Job Description'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
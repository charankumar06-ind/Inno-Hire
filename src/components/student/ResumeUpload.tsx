import React, { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { User, Resume, UploadProgress } from '../../types';
import { dataService } from '../../services/dataService';

interface ResumeUploadProps {
  user: User;
  onComplete: (resume: Resume) => void;
  onClose: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ user, onComplete, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setUploadProgress({
        filename: file.name,
        progress: 0,
        status: 'error',
        error: 'Please upload a PDF, DOCX, or TXT file'
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadProgress({
        filename: file.name,
        progress: 0,
        status: 'error',
        error: 'File size must be less than 10MB'
      });
      return;
    }

    try {
      setUploadProgress({
        filename: file.name,
        progress: 0,
        status: 'uploading'
      });

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(prev => prev ? { ...prev, progress: i } : null);
      }

      setUploadProgress(prev => prev ? { ...prev, status: 'processing' } : null);

      // Create resume
      const resume = await dataService.uploadResume(file, user.id, user.name, user.email);

      setUploadProgress(prev => prev ? { ...prev, status: 'completed' } : null);

      // Show success for a moment
      setTimeout(() => {
        onComplete(resume);
      }, 1500);

    } catch (error) {
      setUploadProgress({
        filename: file.name,
        progress: 0,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      });
    }
  };

  const resetUpload = () => {
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Upload Resume</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {!uploadProgress ? (
          <div className="space-y-6">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInput}
                accept=".pdf,.docx,.txt"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="flex flex-col items-center space-y-4">
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Upload className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drop your resume here, or{' '}
                    <span className="text-indigo-600 underline">browse</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports PDF, DOCX, and TXT files up to 10MB
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Tips for best results:</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Include clear sections for skills, experience, and education</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Use standard fonts and clear formatting</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></span>
                  <span>Include relevant keywords and technologies</span>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{uploadProgress.filename}</p>
                <p className="text-sm text-gray-500">
                  {uploadProgress.status === 'uploading' && 'Uploading...'}
                  {uploadProgress.status === 'processing' && 'Processing...'}
                  {uploadProgress.status === 'completed' && 'Upload completed!'}
                  {uploadProgress.status === 'error' && 'Upload failed'}
                </p>
              </div>
              <div>
                {uploadProgress.status === 'uploading' && <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />}
                {uploadProgress.status === 'processing' && <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />}
                {uploadProgress.status === 'completed' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                {uploadProgress.status === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              </div>
            </div>

            {uploadProgress.status === 'uploading' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{uploadProgress.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {uploadProgress.status === 'processing' && (
              <div className="text-center py-4">
                <div className="inline-flex items-center space-x-2 text-indigo-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing your resume...</span>
                </div>
              </div>
            )}

            {uploadProgress.status === 'completed' && (
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Successful!</h4>
                <p className="text-gray-600">Your resume has been uploaded and is ready for evaluation.</p>
              </div>
            )}

            {uploadProgress.status === 'error' && (
              <div className="space-y-4">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Upload Failed</h4>
                  <p className="text-red-600">{uploadProgress.error}</p>
                </div>
                <button
                  onClick={resetUpload}
                  className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
export interface User {
  id: string;
  email: string;
  role: 'student' | 'recruiter';
  name: string;
  created_at: string;
}

export interface Resume {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  filename: string;
  content: string;
  uploaded_at: string;
  evaluations: Evaluation[];
}

export interface JobDescription {
  id: string;
  recruiter_id: string;
  title: string;
  company: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_level: string;
  created_at: string;
}

export interface Evaluation {
  id: string;
  resume_id: string;
  job_description_id: string;
  relevance_score: number;
  fit_verdict: 'High' | 'Medium' | 'Low';
  missing_skills: string[];
  missing_certifications: string[];
  missing_projects: string[];
  feedback: string;
  hard_match_score: number;
  soft_match_score: number;
  evaluated_at: string;
  job_title: string;
  company: string;
}

export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}
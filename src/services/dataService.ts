import { Resume, JobDescription, Evaluation } from '../types';

class DataService {
  private resumes: Resume[] = [];
  private jobDescriptions: JobDescription[] = [];
  private evaluations: Evaluation[] = [];

  // Resume methods
  async uploadResume(file: File, studentId: string, studentName: string, studentEmail: string): Promise<Resume> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resume: Resume = {
          id: Date.now().toString(),
          student_id: studentId,
          student_name: studentName,
          student_email: studentEmail,
          filename: file.name,
          content: reader.result as string,
          uploaded_at: new Date().toISOString(),
          evaluations: []
        };
        this.resumes.push(resume);
        resolve(resume);
      };
      reader.readAsText(file);
    });
  }

  async getResumesByStudent(studentId: string): Promise<Resume[]> {
    return this.resumes.filter(r => r.student_id === studentId);
  }

  async getAllResumes(): Promise<Resume[]> {
    return [...this.resumes];
  }

  // Job Description methods
  async createJobDescription(
    recruiterId: string,
    title: string,
    company: string,
    description: string,
    requiredSkills: string[],
    preferredSkills: string[],
    experienceLevel: string
  ): Promise<JobDescription> {
    const jobDescription: JobDescription = {
      id: Date.now().toString(),
      recruiter_id: recruiterId,
      title,
      company,
      description,
      required_skills: requiredSkills,
      preferred_skills: preferredSkills,
      experience_level: experienceLevel,
      created_at: new Date().toISOString()
    };
    this.jobDescriptions.push(jobDescription);
    return jobDescription;
  }

  async getJobDescriptionsByRecruiter(recruiterId: string): Promise<JobDescription[]> {
    return this.jobDescriptions.filter(jd => jd.recruiter_id === recruiterId);
  }

  async getAllJobDescriptions(): Promise<JobDescription[]> {
    return [...this.jobDescriptions];
  }

  // Evaluation methods
  async saveEvaluation(evaluation: Evaluation): Promise<void> {
    this.evaluations.push(evaluation);
    
    // Update resume with evaluation
    const resume = this.resumes.find(r => r.id === evaluation.resume_id);
    if (resume) {
      resume.evaluations.push(evaluation);
    }
  }

  async getEvaluationsByRecruiter(recruiterId: string): Promise<Evaluation[]> {
    const recruiterJobs = this.jobDescriptions
      .filter(jd => jd.recruiter_id === recruiterId)
      .map(jd => jd.id);
    
    return this.evaluations.filter(e => recruiterJobs.includes(e.job_description_id));
  }

  async getEvaluationsByStudent(studentId: string): Promise<Evaluation[]> {
    const studentResumes = this.resumes
      .filter(r => r.student_id === studentId)
      .map(r => r.id);
    
    return this.evaluations.filter(e => studentResumes.includes(e.resume_id));
  }

  async getAllEvaluations(): Promise<Evaluation[]> {
    return [...this.evaluations];
  }

  // Seed data for demo
  async seedData(): Promise<void> {
    if (this.resumes.length > 0) return; // Already seeded

    // Create sample job descriptions
    const sampleJobs = [
      {
        id: 'job1',
        recruiter_id: '2',
        title: 'Full Stack Developer',
        company: 'TechCorp Inc.',
        description: 'We are looking for a skilled Full Stack Developer to join our team. Must have experience with React, Node.js, and database management.',
        required_skills: ['React', 'Node.js', 'JavaScript', 'SQL', 'REST APIs'],
        preferred_skills: ['TypeScript', 'AWS', 'Docker'],
        experience_level: 'Mid-level',
        created_at: new Date().toISOString()
      },
      {
        id: 'job2',
        recruiter_id: '2',
        title: 'Data Scientist',
        company: 'DataViz Solutions',
        description: 'Looking for a Data Scientist with strong Python and machine learning background.',
        required_skills: ['Python', 'Machine Learning', 'Data Analysis', 'SQL'],
        preferred_skills: ['TensorFlow', 'PyTorch', 'AWS'],
        experience_level: 'Senior',
        created_at: new Date().toISOString()
      }
    ];

    this.jobDescriptions.push(...sampleJobs);

    // Create sample resumes
    const sampleResumes = [
      {
        id: 'resume1',
        student_id: '1',
        student_name: 'Alex Johnson',
        student_email: 'student@innohire.com',
        filename: 'alex_johnson_resume.pdf',
        content: 'Experienced Full Stack Developer with 3 years of experience in React, Node.js, JavaScript, HTML, CSS, and SQL. Built multiple web applications using modern technologies.',
        uploaded_at: new Date().toISOString(),
        evaluations: []
      },
      {
        id: 'resume2',
        student_id: '3',
        student_name: 'Emily Chen',
        student_email: 'emily.chen@email.com',
        filename: 'emily_chen_resume.pdf',
        content: 'Data Science graduate with experience in Python, Machine Learning, Data Analysis, and SQL. Completed projects in predictive analytics and data visualization.',
        uploaded_at: new Date().toISOString(),
        evaluations: []
      }
    ];

    this.resumes.push(...sampleResumes);
  }
}

export const dataService = new DataService();
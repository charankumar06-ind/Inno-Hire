import { Resume, JobDescription, Evaluation } from '../types';

class AIService {
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private extractSkills(content: string): string[] {
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'MongoDB',
      'AWS', 'Docker', 'Git', 'HTML', 'CSS', 'TypeScript', 'Angular', 'Vue.js',
      'Express.js', 'Django', 'Flask', 'Spring Boot', 'MySQL', 'PostgreSQL',
      'Redis', 'Kubernetes', 'Jenkins', 'Azure', 'GCP', 'Machine Learning',
      'Data Analysis', 'REST APIs', 'GraphQL', 'Microservices', 'Agile',
      'Scrum', 'TDD', 'CI/CD', 'DevOps', 'Linux', 'Bash', 'PowerShell'
    ];

    return commonSkills.filter(skill => 
      content.toLowerCase().includes(skill.toLowerCase())
    );
  }

  private calculateHardMatchScore(resumeSkills: string[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 100;
    
    const matchedSkills = requiredSkills.filter(required =>
      resumeSkills.some(resume => 
        resume.toLowerCase().includes(required.toLowerCase()) ||
        required.toLowerCase().includes(resume.toLowerCase())
      )
    );

    return Math.round((matchedSkills.length / requiredSkills.length) * 100);
  }

  private calculateSoftMatchScore(resumeContent: string, jobDescription: string): number {
    // Simulate semantic analysis
    const resumeWords = resumeContent.toLowerCase().split(/\s+/);
    const jobWords = jobDescription.toLowerCase().split(/\s+/);
    
    const commonWords = resumeWords.filter(word => 
      jobWords.includes(word) && word.length > 3
    );

    const baseScore = Math.min((commonWords.length / Math.max(jobWords.length, 50)) * 100, 100);
    const randomVariation = Math.random() * 20 - 10; // -10 to +10
    
    return Math.max(0, Math.min(100, Math.round(baseScore + randomVariation)));
  }

  private generateFeedback(score: number, missingSkills: string[]): string {
    if (score >= 80) {
      return "Excellent match! Your resume strongly aligns with the job requirements. Consider highlighting specific projects that demonstrate your expertise.";
    } else if (score >= 60) {
      return `Good match with room for improvement. Focus on developing: ${missingSkills.slice(0, 3).join(', ')}. Consider adding relevant projects or certifications.`;
    } else if (score >= 40) {
      return `Moderate match. Significant skills gap identified. Recommend focusing on: ${missingSkills.slice(0, 5).join(', ')}. Consider taking courses or working on projects in these areas.`;
    } else {
      return `Low match. Major upskilling needed. Priority areas: ${missingSkills.slice(0, 3).join(', ')}. Consider comprehensive training or different role alignment.`;
    }
  }

  async evaluateResume(resume: Resume, jobDescription: JobDescription): Promise<Evaluation> {
    // Simulate AI processing time
    await this.delay(2000 + Math.random() * 3000);

    const resumeSkills = this.extractSkills(resume.content);
    const hardMatchScore = this.calculateHardMatchScore(resumeSkills, jobDescription.required_skills);
    const softMatchScore = this.calculateSoftMatchScore(resume.content, jobDescription.description);
    
    // Weighted combination: 60% hard match, 40% soft match
    const relevanceScore = Math.round(hardMatchScore * 0.6 + softMatchScore * 0.4);
    
    const missingSkills = jobDescription.required_skills.filter(required =>
      !resumeSkills.some(resume => 
        resume.toLowerCase().includes(required.toLowerCase())
      )
    );

    const missingCertifications = ['AWS Certified', 'Google Cloud', 'Microsoft Azure'].filter(cert =>
      !resume.content.toLowerCase().includes(cert.toLowerCase())
    );

    const missingProjects = relevanceScore < 70 ? ['Portfolio Website', 'Open Source Contribution'] : [];

    let fitVerdict: 'High' | 'Medium' | 'Low';
    if (relevanceScore >= 75) fitVerdict = 'High';
    else if (relevanceScore >= 50) fitVerdict = 'Medium';
    else fitVerdict = 'Low';

    const feedback = this.generateFeedback(relevanceScore, missingSkills);

    return {
      id: Date.now().toString(),
      resume_id: resume.id,
      job_description_id: jobDescription.id,
      relevance_score: relevanceScore,
      fit_verdict: fitVerdict,
      missing_skills: missingSkills,
      missing_certifications: missingCertifications,
      missing_projects: missingProjects,
      feedback,
      hard_match_score: hardMatchScore,
      soft_match_score: softMatchScore,
      evaluated_at: new Date().toISOString(),
      job_title: jobDescription.title,
      company: jobDescription.company
    };
  }

  async batchEvaluate(
    resumes: Resume[], 
    jobDescription: JobDescription,
    onProgress?: (completed: number, total: number) => void
  ): Promise<Evaluation[]> {
    const evaluations: Evaluation[] = [];
    
    for (let i = 0; i < resumes.length; i++) {
      const evaluation = await this.evaluateResume(resumes[i], jobDescription);
      evaluations.push(evaluation);
      onProgress?.(i + 1, resumes.length);
    }
    
    return evaluations;
  }
}

export const aiService = new AIService();
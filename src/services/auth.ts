import { User } from '../types';

class AuthService {
  private users: User[] = [
    {
      id: '1',
      email: 'student@innohire.com',
      role: 'student',
      name: 'Alex Johnson',
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      email: 'recruiter@innohire.com',
      role: 'recruiter',
      name: 'Sarah Wilson',
      created_at: new Date().toISOString()
    }
  ];

  private currentUser: User | null = null;

  login(email: string, password: string): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = this.users.find(u => u.email === email);
        if (user && password === 'demo123') {
          this.currentUser = user;
          localStorage.setItem('innohire_user', JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('innohire_user');
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;
    
    const stored = localStorage.getItem('innohire_user');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }
    
    return null;
  }

  register(email: string, password: string, name: string, role: 'student' | 'recruiter'): Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (this.users.find(u => u.email === email)) {
          reject(new Error('Email already exists'));
          return;
        }

        const newUser: User = {
          id: Date.now().toString(),
          email,
          role,
          name,
          created_at: new Date().toISOString()
        };

        this.users.push(newUser);
        this.currentUser = newUser;
        localStorage.setItem('innohire_user', JSON.stringify(newUser));
        resolve(newUser);
      }, 1000);
    });
  }
}

export const authService = new AuthService();
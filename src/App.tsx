import React, { useState, useEffect } from 'react';
import { authService } from './services/auth';
import { User } from './types';
import { Layout } from './components/Layout';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { StudentDashboard } from './components/student/StudentDashboard';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const existingUser = authService.getCurrentUser();
    if (existingUser) {
      setUser(existingUser);
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentPath('/');
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    setCurrentPath('/');
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Authentication flow
  if (!user) {
    if (authMode === 'login') {
      return (
        <LoginForm 
          onLogin={handleLogin} 
          onShowRegister={() => setAuthMode('register')}
        />
      );
    } else {
      return (
        <RegisterForm 
          onRegister={handleRegister} 
          onShowLogin={() => setAuthMode('login')}
        />
      );
    }
  }

  // Main application
  return (
    <Layout user={user} onNavigate={handleNavigate} currentPath={currentPath}>
      {user.role === 'student' ? (
        <StudentDashboard user={user} />
      ) : (
        <RecruiterDashboard user={user} />
      )}
    </Layout>
  );
}

export default App;
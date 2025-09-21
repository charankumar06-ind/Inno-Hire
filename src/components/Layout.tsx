import React from 'react';
import { User, LogOut, Home } from 'lucide-react';
import { authService } from '../services/auth';
import { User as UserType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: UserType;
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onNavigate, currentPath }) => {
  const handleLogout = () => {
    authService.logout();
    onNavigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('/')}
                className="flex items-center space-x-3 text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">IH</span>
                </div>
                <span className="text-xl font-bold">Inno-Hire</span>
              </button>
              
              <nav className="hidden md:flex items-center space-x-6 ml-8">
                <button
                  onClick={() => onNavigate('/')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPath === '/' 
                      ? 'bg-indigo-100 text-indigo-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Home size={16} />
                  <span>Dashboard</span>
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-2">
                  <User size={16} className="text-gray-400" />
                  <span className="text-gray-700 font-medium">{user.name}</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.role === 'recruiter' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
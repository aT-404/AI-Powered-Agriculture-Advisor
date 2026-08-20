import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="p-4 bg-agri-100 rounded-full text-agri-600 mb-4">
        <Sprout className="w-12 h-12" />
      </div>
      <h1 className="text-6xl font-black text-gray-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-gray-800 mt-2">Page Not Found</h2>
      <p className="text-xs text-gray-500 max-w-sm mt-1 mb-6">
        The page or route you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;

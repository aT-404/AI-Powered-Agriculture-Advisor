import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  return (
    <div className="text-center py-4">
      <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2">Password Recovery Notice</h3>

      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed mb-6">
        <p className="font-semibold text-amber-900 mb-1">
          Password recovery endpoint is not currently available.
        </p>
        <p>
          The Django REST Framework backend system does not currently expose a password reset API endpoint. Please contact your system administrator or support team to reset your access credentials.
        </p>
      </div>

      <Link
        to="/login"
        className="inline-flex items-center text-xs font-bold text-agri-600 hover:text-agri-700 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Return to Login Page
      </Link>
    </div>
  );
};

export default ForgotPassword;

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err: unknown) {
      console.error('Login error:', err);
      const resData = (err as { response?: { data?: { error?: string; detail?: string; non_field_errors?: string[] } } })?.response?.data;
      if (resData?.error) {
        setError(resData.error);
      } else if (resData?.detail) {
        setError(resData.detail);
      } else if (resData?.non_field_errors?.[0]) {
        setError(resData.non_field_errors[0]);
      } else {
        setError('Invalid email or password. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-gray-900">Sign in to your account</h3>
        <p className="text-xs text-gray-500 mt-1">Access AI predictions, crop data, and market prices</p>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage title="Authentication Failed" message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="farmer@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-agri-600 rounded border-gray-300 focus:ring-agri-500"
            />
            <label htmlFor="remember-me" className="ml-2 text-gray-600">
              Remember me
            </label>
          </div>

          <Link
            to="/forgot-password"
            className="font-semibold text-agri-600 hover:text-agri-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={loading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-bold text-agri-600 hover:text-agri-700 transition-colors">
          Register now
        </Link>
      </div>
    </div>
  );
};

export default Login;

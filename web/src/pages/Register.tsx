import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name || !formData.phone) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('Registration error:', err);
      const resData = (err as { response?: { data?: Record<string, string | string[]> } })?.response?.data;
      if (resData) {
        const firstKey = Object.keys(resData)[0];
        const val = resData[firstKey];
        const msg = Array.isArray(val) ? val[0] : val;
        setError(`${firstKey}: ${msg}`);
      } else {
        setError('Failed to create account. Password must be at least 8 characters long, contain a letter and a number.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <h3 className="text-xl font-bold text-gray-900">Create your account</h3>
        <p className="text-xs text-gray-500 mt-1">Join the AI Agriculture Advisor platform</p>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorMessage title="Registration Failed" message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            name="first_name"
            placeholder="John"
            value={formData.first_name}
            onChange={handleChange}
            leftIcon={<User className="w-4 h-4" />}
            required
          />
          <Input
            label="Last Name"
            name="last_name"
            placeholder="Doe"
            value={formData.last_name}
            onChange={handleChange}
            leftIcon={<User className="w-4 h-4" />}
            required
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="farmer@example.com"
          value={formData.email}
          onChange={handleChange}
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          placeholder="+91 98765 43210"
          value={formData.phone}
          onChange={handleChange}
          leftIcon={<Phone className="w-4 h-4" />}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Min 8 chars (letters & numbers)"
          value={formData.password}
          onChange={handleChange}
          leftIcon={<Lock className="w-4 h-4" />}
          helperText="At least 8 characters with 1 letter and 1 digit"
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={loading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-agri-600 hover:text-agri-700 transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default Register;

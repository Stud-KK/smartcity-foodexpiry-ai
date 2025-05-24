import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth(); // using auth context to update state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:3002/api/users/login', credentials);
     
      // Save token and user details in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        userType: response.data.userType // role from backend
      }));
      // Update AuthContext state
      login();
      if (response.data.message) {
        alert(response.data.message);
      }
     
      // Redirect based on user role
      if (response.data.userType === 'restaurant') {
        navigate('/dashboard/restaurant');
      } else {
        navigate('/dashboard/home');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center px-4"
      style={{ backgroundImage: 'url(/restaurent.jpg)' }}
    >
      <div className="max-w-md w-full p-8 rounded-2xl shadow-lg border border-gray-100"
           style={{
             backgroundColor: 'rgba(170, 162, 162, 0.1)',
             backdropFilter: 'blur(10px)',
             WebkitBackdropFilter: 'blur(10px)',
             borderRadius: '16px',
             boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
             border: '1px solid rgba(255, 255, 255, 0.3)',
             
             backgroundSize: 'cover',
             backgroundPosition: 'center',
           }}
      >
        <h2 className="text-3xl font-bold text-center text-primary mb-6">Login to FoodWise</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-primary text-white py-2 rounded-xl font-semibold transition-colors hover:bg-primary-dark ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-white-900">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

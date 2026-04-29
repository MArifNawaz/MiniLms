import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState, useAuthDispatch } from '../context/AuthContext';

export default function LoginForm() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const { status, error } = useAuthState();
  const { authenticate } = useAuthDispatch();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = 'Username required';
    if (!formData.password) errors.password = 'Password required';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setValidationErrors(prev => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await authenticate({ email: formData.username, password: formData.password }, true);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign In</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="form-field">
          <label>Email</label>
          <input name="username" type="email" value={formData.username}
            onChange={handleChange} className={validationErrors.username ? 'input-error' : ''} />
          {validationErrors.username && <span className="error-text">{validationErrors.username}</span>}
        </div>
        <div className="form-field">
          <label>Password</label>
          <input name="password" type="password" value={formData.password}
            onChange={handleChange} className={validationErrors.password ? 'input-error' : ''} />
          {validationErrors.password && <span className="error-text">{validationErrors.password}</span>}
        </div>
        <button type="submit" disabled={status === 'loading'} className="btn-submit">
          {status === 'loading' ? 'Signing in...' : 'Sign In'}
        </button>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}

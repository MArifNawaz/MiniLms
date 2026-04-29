import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthDispatch } from '../context/AuthContext';

export default function SignupForm() {
  const [formValues, setFormValues] = useState({ fullName: '', emailAddress: '', pwd: '', confirmPwd: '' });
  const { authenticate } = useAuthDispatch();
  const [submitError, setSubmitError] = useState('');

  const updateField = (field) => (e) => {
    setFormValues(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (formValues.pwd !== formValues.confirmPwd) {
      setSubmitError('Passwords do not match');
      return;
    }

    try {
      await authenticate({
        name: formValues.fullName,
        email: formValues.emailAddress,
        password: formValues.pwd
      }, false);
    } catch (err) {
      setSubmitError('Registration failed. Try again.');
    }
  };

  return (
    <div className="signup-wrapper">
      <form onSubmit={handleSignup} className="signup-form">
        <h2>Create Account</h2>
        {submitError && <div className="error-banner">{submitError}</div>}
        <input placeholder="Full Name" value={formValues.fullName} onChange={updateField('fullName')} required />
        <input placeholder="Email" type="email" value={formValues.emailAddress} onChange={updateField('emailAddress')} required />
        <input placeholder="Password" type="password" value={formValues.pwd} onChange={updateField('pwd')} required />
        <input placeholder="Confirm Password" type="password" value={formValues.confirmPwd} onChange={updateField('confirmPwd')} required />
        <button type="submit" className="btn-create">Create Account</button>
        <p>Already have an account? <Link to="/login">Sign In</Link></p>
      </form>
    </div>
  );
}

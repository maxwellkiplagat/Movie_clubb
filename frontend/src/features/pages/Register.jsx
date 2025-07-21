import React, { useState, useEffect } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../auth/authSlice'; 

const Register = () => {
  const [formData, setFormData] = useState({ 
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [confirmError, setConfirmError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth); 

  // Handle successful registration: redirect to feed or dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/feed'); 
    }
  }, [isAuthenticated, navigate]);

  // Clear error message when component mounts or form data changes
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, formData]); 

  const handleChange = (e) => { 
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError()); // Clear previous errors before new submission

    if (formData.password !== formData.confirmPassword) {
      setConfirmError("Passwords do not match");
      return;
    } else {
      setConfirmError('');
    }

    // Dispatch the registerUser async thunk
    dispatch(registerUser({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    }));
  };

  return (
    <div className="form-page">
      <form className="form-container" onSubmit={handleSubmit}>
        <h2>Join the Community</h2>
        {error && <p className="error">{error}</p>}
        {confirmError && <p className="error">{confirmError}</p>}

        <label>Username:</label>
        <input
          type="text"
          name="username" 
          value={formData.username} 
          onChange={handleChange} 
          required
        />

        <label>Email:</label>
        <input
          type="email"
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password" 
          value={formData.password} 
          onChange={handleChange} 
          required
        />

        <label>Confirm Password:</label>
        <input
          type="password"
          name="confirmPassword" 
          value={formData.confirmPassword} 
          onChange={handleChange} 
          required
        />

        <button type="submit" disabled={isLoading}> 
          {isLoading ? 'Joining...' : 'Join Now'} 
        </button>

        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;

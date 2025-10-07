import { useState } from 'react';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate
import { AuthContext } from '../AuthContext/AuthContext.jsx';
import { login } from '../Api/api.js';
import '../Css/Login.css';

function LoginPage() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const { updateUser } = useContext(AuthContext);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate(); // ✅ Create navigate function

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await login(formData);
            if (response && response.token) {
                // Update AuthContext and localStorage
                updateUser({
                    token: response.token,
                    role: response.role || 'user',
                    userid: response.userid
                });

                console.log('Login successful:', response);

                // ✅ Use navigate to redirect (better for React Router)
                navigate('/');

            } else {
                setError('Invalid response from server - no token received');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-logo">ParcelShare</div>
                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtitle">Sign in to your account to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="form-input"
                            placeholder="Enter your username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <div className="password-input-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                className="form-input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={togglePasswordVisibility}
                                disabled={isLoading}
                            >
                                {showPassword ? "🙈" : "👁️"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing In..." : "Sign In"}
                    </button>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                </form>

                <div className="login-footer">
                    <p className="login-footer-text">
                        Don't have an account?{' '}
                        <a href="/signup" className="login-link">
                            Sign up
                        </a>
                    </p>
                    <p className="login-footer-text" style={{ marginTop: '0.5rem' }}>
                        <a href="/forgot-password" className="login-link">
                            Forgot your password?
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
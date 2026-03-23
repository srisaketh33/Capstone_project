import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (token: string, username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation states
  const validation = {
    length: password.length >= 8,
    capital: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    alpha: /[a-zA-Z]/.test(password),
  };

  const isPasswordValid = validation.length && validation.capital && validation.number && validation.alpha;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    if (!isLogin && !isPasswordValid) {
      setMessage("Please ensure your password meets all requirements.");
      setIsSuccess(false);
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login Request
        const formData = new FormData();
        formData.append('username', email); // OAuth2 expects 'username' field, we pass email
        formData.append('password', password);

        const response = await fetch('http://127.0.0.1:8000/auth/login', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Login failed');
        }

        const data = await response.json();
        onLoginSuccess(data.access_token, data.name || email);
        navigate('/forge');
      } else {
        // Register Request
        const response = await fetch('http://127.0.0.1:8000/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Registration failed');
        }

        // Success
        setIsLogin(true);
        setMessage('Account created! Please log in.');
        setIsSuccess(true);
      }
    } catch (err: any) {
      setMessage(err.message);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Sparkles className="logo-icon" />
            <span>StoryForge</span>
          </div>
          <h1>{isLogin ? 'Welcome Back' : 'Join StoryForge'}</h1>
          <p>{isLogin ? 'Enter your credentials to continue your journey.' : 'Start your creative adventure with us today.'}</p>
        </div>

        {message && (
          <div className={`${isSuccess ? 'auth-success' : 'auth-error'} animate-fade-in`}>
            {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <User className="input-icon" x-icon="mail" />
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <div className="password-requirements">
              <div className={`requirement ${validation.length ? 'met' : ''}`}>
                {validation.length ? <CheckCircle2 className="w-3 h-3" /> : <div className="dot" />}
                8+ Characters
              </div>
              <div className={`requirement ${validation.capital ? 'met' : ''}`}>
                {validation.capital ? <CheckCircle2 className="w-3 h-3" /> : <div className="dot" />}
                1 Capital Letter
              </div>
              <div className={`requirement ${validation.number ? 'met' : ''}`}>
                {validation.number ? <CheckCircle2 className="w-3 h-3" /> : <div className="dot" />}
                1 Number
              </div>
              <div className={`requirement ${validation.alpha ? 'met' : ''}`}>
                {validation.alpha ? <CheckCircle2 className="w-3 h-3" /> : <div className="dot" />}
                1 Alpha Letter
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`auth-submit ${loading ? 'loading' : ''}`}
            disabled={loading || (!isLogin && !isPasswordValid)}
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setMessage(''); setIsSuccess(false); }}>
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
          background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
          background-size: 20px 20px;
          padding: 1.5rem;
          font-family: 'Inter', sans-serif;
          overflow: hidden; /* Prevent container scroll if not needed */
        }

        .auth-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 1.25rem;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .auth-header {
          text-align: center;
          margin-bottom: 1.25rem;
        }

        .auth-logo {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #2563eb;
          padding: 0.375rem 0.875rem;
          border-radius: 0.625rem;
          margin-bottom: 0.75rem;
          color: white;
          font-weight: 800;
          font-size: 1rem;
        }

        .logo-icon {
          width: 1.125rem;
          height: 1.125rem;
        }

        .auth-header h1 {
          color: #0f172a;
          font-size: 1.625rem;
          font-weight: 800;
          margin-bottom: 0.375rem;
          letter-spacing: -0.025em;
        }

        .auth-header p {
          color: #64748b;
          font-size: 0.8125rem;
        }

        .auth-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          padding: 0.625rem 0.875rem;
          border-radius: 0.625rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .auth-success {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #15803d;
          padding: 0.625rem 0.875rem;
          border-radius: 0.625rem;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .form-group label {
          color: #475569;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 0.875rem;
          color: #94a3b8;
          width: 1rem;
          height: 1rem;
          transition: color 0.15s;
        }

        .input-wrapper input {
          width: 100%;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.625rem;
          padding: 0.625rem 0.875rem 0.625rem 2.5rem;
          color: #0f172a;
          font-size: 0.875rem;
          transition: all 0.15s;
        }

        .input-wrapper input:focus {
          outline: none;
          background: white;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .input-wrapper input:focus + .input-icon {
          color: #2563eb;
        }

        .password-requirements {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.375rem;
          padding: 0.625rem;
          background: #f8fafc;
          border-radius: 0.625rem;
          border: 1px solid #e2e8f0;
        }

        .requirement {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.6875rem;
          color: #64748b;
          font-weight: 500;
        }

        .requirement.met {
          color: #10b981;
        }

        .dot {
          width: 3px;
          height: 3px;
          background: #cbd5e1;
          border-radius: 50%;
        }

        .auth-submit {
          margin-top: 0.25rem;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 0.625rem;
          padding: 0.625rem;
          font-size: 0.875rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.15s;
        }

        .auth-submit:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .auth-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-footer {
          margin-top: 1.25rem;
          text-align: center;
          color: #64748b;
          font-size: 0.75rem;
        }

        .auth-footer button {
          background: none;
          border: none;
          color: #2563eb;
          font-weight: 700;
          cursor: pointer;
          margin-left: 0.25rem;
        }

        .auth-footer button:hover {
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 1.25rem;
          }
          .password-requirements {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;

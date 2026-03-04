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
          background: radial-gradient(circle at top left, #1a1a2e, #16213e, #0f3460);
          padding: 2rem;
          font-family: 'Inter', sans-serif;
        }

        .auth-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 2rem;
          padding: 3rem;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .auth-logo {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          padding: 0.5rem 1.25rem;
          border-radius: 1rem;
          margin-bottom: 1.5rem;
          color: white;
          font-weight: 800;
          font-size: 1.25rem;
          letter-spacing: -0.025em;
        }

        .logo-icon {
          width: 1.5rem;
          height: 1.5rem;
        }

        .auth-header h1 {
          color: white;
          font-size: 2.25rem;
          font-weight: 800;
          margin-bottom: 0.75rem;
          letter-spacing: -0.05em;
        }

        .auth-header p {
          color: #94a3b8;
          font-size: 1rem;
          line-height: 1.5;
        }

        .auth-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 1rem;
          border-radius: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .auth-success {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
          padding: 1rem;
          border-radius: 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: #e2e8f0;
          font-size: 0.875rem;
          font-weight: 600;
          margin-left: 0.25rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1.25rem;
          color: #64748b;
          width: 1.25rem;
          height: 1.25rem;
          transition: color 0.3s ease;
        }

        .input-wrapper input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 1rem 1.25rem 1rem 3.25rem;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .input-wrapper input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.07);
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .input-wrapper input:focus + .input-icon {
          color: #6366f1;
        }

        .password-requirements {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .requirement {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .requirement.met {
          color: #10b981;
        }

        .dot {
          width: 4px;
          height: 4px;
          background: #334155;
          border-radius: 50%;
        }

        .auth-submit {
          margin-top: 1rem;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: white;
          border: none;
          border-radius: 1rem;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .auth-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
          filter: brightness(1.1);
        }

        .auth-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .auth-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .auth-footer {
          margin-top: 2rem;
          text-align: center;
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .auth-footer button {
          background: none;
          border: none;
          color: #6366f1;
          font-weight: 700;
          cursor: pointer;
          margin-left: 0.25rem;
          transition: color 0.3s ease;
        }

        .auth-footer button:hover {
          color: #818cf8;
          text-decoration: underline;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: 2rem;
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

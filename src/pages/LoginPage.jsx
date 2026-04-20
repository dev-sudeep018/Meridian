import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './LoginPage.css'

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/app', { replace: true })
    }
  }, [user, loading, navigate])

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
      navigate('/app')
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg">
        <div className="login-bg-orb login-bg-orb-1"></div>
        <div className="login-bg-orb login-bg-orb-2"></div>
        <div className="login-bg-orb login-bg-orb-3"></div>
        <div className="login-bg-grid"></div>
      </div>

      <div className="login-container">
        {/* Logo */}
        <a href="/" className="login-logo-link">
          <div className="login-logo">
            <span className="material-icons login-logo-icon">hub</span>
            <span className="login-logo-text">MERIDIAN</span>
          </div>
        </a>

        {/* Card */}
        <div className="login-card">
          <div className="login-card-glow"></div>
          
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Sign in to access the autonomous innovation discovery pipeline
          </p>

          <button
            className="login-google-btn"
            onClick={handleGoogleSignIn}
            disabled={loading}
            id="google-signin-button"
          >
            <svg className="login-google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          <div className="login-divider">
            <span className="login-divider-line"></span>
            <span className="login-divider-text">or</span>
            <span className="login-divider-line"></span>
          </div>

          <p className="login-alt-text">
            More sign-in options coming soon
          </p>

          <div className="login-features">
            <div className="login-feature">
              <span className="material-icons login-feature-icon">psychology</span>
              <span>10 specialized AI agents</span>
            </div>
            <div className="login-feature">
              <span className="material-icons login-feature-icon">auto_awesome</span>
              <span>Cross-domain innovation</span>
            </div>
            <div className="login-feature">
              <span className="material-icons login-feature-icon">speed</span>
              <span>Results in under 5 minutes</span>
            </div>
          </div>
        </div>

        <p className="login-footer">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}

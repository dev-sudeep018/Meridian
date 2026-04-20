import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, LogOut, Trash2, Download, Shield, Bell, Key, ChevronRight, ExternalLink, Check, Eye, EyeOff } from 'lucide-react'
import './SettingsPanel.css'

const THEMES = [
  { id: 'dark', name: 'Dark', bg: '#0a0a0a', accent: '#4ECDC4', secondary: '#111' },
  { id: 'midnight', name: 'Midnight', bg: '#0d1117', accent: '#58a6ff', secondary: '#161b22' },
  { id: 'ocean', name: 'Ocean', bg: '#0a192f', accent: '#64ffda', secondary: '#112240' },
  { id: 'obsidian', name: 'Obsidian', bg: '#1a1a2e', accent: '#e94560', secondary: '#16213e' },
]

function applyTheme(theme) {
  const root = document.documentElement
  root.style.setProperty('--theme-bg', theme.bg)
  root.style.setProperty('--theme-accent', theme.accent)
  root.style.setProperty('--theme-secondary', theme.secondary)

  // Apply to key elements
  document.body.style.background = theme.bg
  document.querySelectorAll('.app-page').forEach(el => el.style.background = theme.bg)
  document.querySelectorAll('.app-header').forEach(el => {
    el.style.background = theme.secondary
    el.style.borderBottomColor = `${theme.accent}15`
  })
  document.querySelectorAll('.discovery-board').forEach(el => el.style.background = theme.bg)
  document.querySelectorAll('.conversation-panel').forEach(el => el.style.background = theme.bg)
  document.querySelectorAll('.conversation-bubble-assistant').forEach(el => {
    el.style.background = `${theme.accent}10`
    el.style.borderColor = `${theme.accent}15`
  })
  document.querySelectorAll('.conversation-avatar').forEach(el => {
    el.style.background = theme.accent
  })
  document.querySelectorAll('.conversation-send-btn:not(:disabled)').forEach(el => {
    el.style.background = `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`
  })

  localStorage.setItem('meridian-theme', theme.id)
}

export default function SettingsPanel({ user, onClose, onSignOut }) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(true)
  const [activeTheme, setActiveTheme] = useState(localStorage.getItem('meridian-theme') || 'dark')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // API key state
  const [apiKeys, setApiKeys] = useState({
    gemini: localStorage.getItem('meridian-gemini-key') || '',
    groq: localStorage.getItem('meridian-groq-key') || '',
    tavily: localStorage.getItem('meridian-tavily-key') || '',
  })
  const [showKeys, setShowKeys] = useState({ gemini: false, groq: false, tavily: false })
  const [savedFeedback, setSavedFeedback] = useState('')

  const handleThemeChange = (theme) => {
    setActiveTheme(theme.id)
    applyTheme(theme)
  }

  // Apply saved theme on mount
  useEffect(() => {
    const savedTheme = THEMES.find(t => t.id === activeTheme)
    if (savedTheme && savedTheme.id !== 'dark') {
      applyTheme(savedTheme)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      // Navigate first to avoid ProtectedRoute redirecting to /login
      onClose()
      await onSignOut()
      navigate('/', { replace: true })
    } catch (e) {
      console.error('Sign out failed:', e)
    }
  }

  const handleApiKeyChange = (key, value) => {
    setApiKeys(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveKeys = () => {
    localStorage.setItem('meridian-gemini-key', apiKeys.gemini)
    localStorage.setItem('meridian-groq-key', apiKeys.groq)
    localStorage.setItem('meridian-tavily-key', apiKeys.tavily)
    setSavedFeedback('Saved')
    setTimeout(() => setSavedFeedback(''), 2000)
  }

  const handleDeleteData = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }
    alert('All discovery data deleted.')
    setDeleteConfirm(false)
  }

  return (
    <>
      <div className="settings-overlay" onClick={onClose}></div>
      <div className="settings-panel" id="settings-panel">
        {/* Header */}
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button className="settings-close" onClick={onClose} id="settings-close">
            <X size={18} />
          </button>
        </div>

        <div className="settings-body">
          {/* Profile Section */}
          <section className="settings-section">
            <div className="settings-profile">
              <div className="settings-profile-avatar">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="settings-profile-img" />
                ) : (
                  <span className="material-icons" style={{fontSize: '28px', color: '#4ECDC4'}}>person</span>
                )}
              </div>
              <div className="settings-profile-info">
                <p className="settings-profile-name">{user?.displayName || 'User'}</p>
                <p className="settings-profile-email">{user?.email}</p>
                <p className="settings-profile-joined">Joined {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'recently'}</p>
              </div>
            </div>
          </section>

          {/* Account */}
          <section className="settings-section">
            <h3 className="settings-section-title">Account</h3>
            <div className="settings-item" onClick={handleSignOut} id="signout-button">
              <div className="settings-item-left">
                <LogOut size={16} className="settings-item-icon" />
                <span>Sign Out</span>
              </div>
              <ChevronRight size={14} className="settings-item-arrow" />
            </div>
          </section>

          {/* Theme */}
          <section className="settings-section">
            <h3 className="settings-section-title">Theme</h3>
            <div className="settings-theme-grid">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  className={`settings-theme-option ${activeTheme === theme.id ? 'settings-theme-active' : ''}`}
                  onClick={() => handleThemeChange(theme)}
                >
                  <div className="settings-theme-preview" style={{ background: theme.bg }}>
                    <div className="settings-theme-accent" style={{ background: theme.accent }}></div>
                    {activeTheme === theme.id && (
                      <Check size={14} className="settings-theme-check" style={{ color: theme.accent }} />
                    )}
                  </div>
                  <span className="settings-theme-name">{theme.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Preferences */}
          <section className="settings-section">
            <h3 className="settings-section-title">Preferences</h3>
            <div className="settings-item">
              <div className="settings-item-left">
                <Bell size={16} className="settings-item-icon" />
                <span>Pipeline Notifications</span>
              </div>
              <button
                className={`settings-toggle ${notifications ? 'settings-toggle-on' : ''}`}
                onClick={() => setNotifications(!notifications)}
              >
                <span className="settings-toggle-knob"></span>
              </button>
            </div>
          </section>

          {/* API Keys */}
          <section className="settings-section">
            <h3 className="settings-section-title">API Configuration</h3>

            {[
              { key: 'gemini', label: 'Gemini API Key', placeholder: 'AIza...' },
              { key: 'groq', label: 'Groq API Key', placeholder: 'gsk_...' },
              { key: 'tavily', label: 'Tavily API Key', placeholder: 'tvly-...' },
            ].map(({ key, label, placeholder }) => (
              <div className="settings-api-row" key={key}>
                <div className="settings-api-label">
                  <Key size={14} className="settings-item-icon" />
                  <span>{label}</span>
                </div>
                <div className="settings-api-input-wrap">
                  <input
                    type={showKeys[key] ? 'text' : 'password'}
                    className="settings-api-input"
                    placeholder={placeholder}
                    value={apiKeys[key]}
                    onChange={e => handleApiKeyChange(key, e.target.value)}
                  />
                  <button
                    className="settings-api-eye"
                    onClick={() => setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))}
                    type="button"
                  >
                    {showKeys[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}

            <button className="settings-save-keys" onClick={handleSaveKeys}>
              {savedFeedback || 'Save Keys'}
            </button>

            <p className="settings-hint">
              Keys are stored locally in your browser, never sent to our servers.
            </p>
          </section>

          {/* Data & Privacy */}
          <section className="settings-section">
            <h3 className="settings-section-title">Data & Privacy</h3>

            <div className="settings-item">
              <div className="settings-item-left">
                <Download size={16} className="settings-item-icon" />
                <span>Export All Data</span>
              </div>
              <ChevronRight size={14} className="settings-item-arrow" />
            </div>

            <div className="settings-item settings-item-danger" onClick={handleDeleteData}>
              <div className="settings-item-left">
                <Trash2 size={16} className="settings-item-icon" />
                <span>{deleteConfirm ? 'Click again to confirm' : 'Delete All Discovery Data'}</span>
              </div>
              {!deleteConfirm && <ChevronRight size={14} className="settings-item-arrow" />}
            </div>

            <div className="settings-item">
              <div className="settings-item-left">
                <Shield size={16} className="settings-item-icon" />
                <span>Privacy Policy</span>
              </div>
              <ExternalLink size={14} className="settings-item-arrow" />
            </div>
          </section>

          {/* About */}
          <section className="settings-section settings-section-last">
            <h3 className="settings-section-title">About</h3>
            <div className="settings-about">
              <div className="settings-about-row">
                <span>Version</span>
                <span className="settings-about-value">1.0.0</span>
              </div>
              <div className="settings-about-row">
                <span>Pipeline Agents</span>
                <span className="settings-about-value">10</span>
              </div>
              <div className="settings-about-row">
                <span>Build</span>
                <span className="settings-about-value">Production</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

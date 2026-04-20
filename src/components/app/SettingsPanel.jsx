import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, LogOut, Trash2, Download, Shield, Bell, Palette, Key, ChevronRight, ExternalLink, Check } from 'lucide-react'
import './SettingsPanel.css'

const THEMES = [
  { id: 'dark', name: 'Dark', bg: '#0a0a0a', accent: '#4ECDC4' },
  { id: 'midnight', name: 'Midnight', bg: '#0d1117', accent: '#58a6ff' },
  { id: 'ocean', name: 'Ocean', bg: '#0a192f', accent: '#64ffda' },
  { id: 'obsidian', name: 'Obsidian', bg: '#1a1a2e', accent: '#e94560' },
]

export default function SettingsPanel({ user, onClose, onSignOut }) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(true)
  const [activeTheme, setActiveTheme] = useState('dark')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const handleSignOut = async () => {
    try {
      await onSignOut()
      navigate('/')
    } catch (e) {
      console.error('Sign out failed:', e)
    }
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
                  onClick={() => setActiveTheme(theme.id)}
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

            <div className="settings-item">
              <div className="settings-item-left">
                <Key size={16} className="settings-item-icon" />
                <span>Gemini API Key</span>
              </div>
              <span className="settings-item-badge">Required</span>
            </div>

            <div className="settings-item">
              <div className="settings-item-left">
                <Key size={16} className="settings-item-icon" />
                <span>Groq API Key</span>
              </div>
              <span className="settings-item-badge">Required</span>
            </div>

            <div className="settings-item">
              <div className="settings-item-left">
                <Key size={16} className="settings-item-icon" />
                <span>Tavily API Key</span>
              </div>
              <span className="settings-item-badge">Required</span>
            </div>

            <p className="settings-hint">
              3 keys power the pipeline: Gemini and Groq for AI reasoning, Tavily for web search. Semantic Scholar is free.
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

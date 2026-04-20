import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, LogOut, Trash2, Download, Shield, Bell, Palette, Key, ChevronRight, ExternalLink } from 'lucide-react'
import './SettingsPanel.css'

export default function SettingsPanel({ user, onClose, onSignOut }) {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(true)
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
    // In production: delete user data from Firestore
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

            <div className="settings-item">
              <div className="settings-item-left">
                <Palette size={16} className="settings-item-icon" />
                <span>Theme</span>
              </div>
              <span className="settings-item-value">Dark</span>
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
              <span className="settings-item-value settings-item-badge">Not Set</span>
            </div>

            <div className="settings-item">
              <div className="settings-item-left">
                <Key size={16} className="settings-item-icon" />
                <span>Tavily API Key</span>
              </div>
              <span className="settings-item-value settings-item-badge">Not Set</span>
            </div>

            <p className="settings-hint">
              API keys are stored securely and used only for your discoveries.
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

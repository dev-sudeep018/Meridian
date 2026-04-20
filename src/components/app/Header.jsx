import Logo from '../shared/Logo'
import OverseerBar from './OverseerBar'
import { History, User } from 'lucide-react'
import Button from '../shared/Button'
import './Header.css'

export default function Header({ discovery, onToggleHistory, user }) {
  return (
    <header className="app-header" id="app-header">
      <div className="app-header-left">
        <Logo size="sm" linkTo="/" />
      </div>

      <div className="app-header-center">
        {discovery && (
          <OverseerBar scores={discovery.currentScores} />
        )}
      </div>

      <div className="app-header-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleHistory}
          icon={<History size={16} />}
          id="history-button"
        >
          History
        </Button>
        {user && (
          <div className="app-header-avatar" title={user.displayName || user.email}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" className="app-header-avatar-img" />
            ) : (
              <User size={18} />
            )}
          </div>
        )}
      </div>
    </header>
  )
}

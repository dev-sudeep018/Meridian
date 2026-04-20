import { useParams, Link } from 'react-router-dom'
import { useDiscovery } from '../hooks/useDiscovery'
import Logo from '../components/shared/Logo'
import OverseerBar from '../components/app/OverseerBar'
import ProblemCard from '../components/cards/ProblemCard'
import FrontierCard from '../components/cards/FrontierCard'
import BridgeCard from '../components/cards/BridgeCard'
import ValidationCard from '../components/cards/ValidationCard'
import CodeCard from '../components/cards/CodeCard'
import MarketGapCard from '../components/cards/MarketGapCard'
import LaunchPack from '../components/launchpack/LaunchPack'
import ShareableLink from '../components/shared/ShareableLink'
import Button from '../components/shared/Button'
import { Download, ArrowLeft } from 'lucide-react'
import './DiscoveryPage.css'

export default function DiscoveryPage() {
  const { id } = useParams()
  const { discovery, loading, error } = useDiscovery(id)

  if (loading) {
    return (
      <div className="discovery-page-loading">
        <div className="animate-pulse" style={{ color: 'var(--color-accent-teal)', fontSize: 'var(--font-size-lg)' }}>
          Loading discovery...
        </div>
      </div>
    )
  }

  if (error || !discovery) {
    return (
      <div className="discovery-page-loading">
        <h2 style={{ marginBottom: 'var(--space-md)' }}>Discovery not found</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-xl)' }}>
          This discovery may not exist or may have been removed.
        </p>
        <Link to="/">
          <Button variant="secondary" icon={<ArrowLeft size={16} />}>
            Back to MERIDIAN
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="discovery-page">
      {/* Header */}
      <header className="discovery-page-header">
        <Logo size="sm" linkTo="/" />
        {discovery.currentScores && (
          <OverseerBar scores={discovery.currentScores} />
        )}
        <div className="discovery-page-header-actions">
          {discovery.pdfUrl && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={14} />}
              onClick={() => window.open(discovery.pdfUrl, '_blank')}
            >
              PDF
            </Button>
          )}
        </div>
      </header>

      {/* Innovation Name */}
      <div className="discovery-page-title-section">
        {discovery.innovationName && (
          <h1 className="discovery-page-title">{discovery.innovationName}</h1>
        )}
        {discovery.adjacentDomain && (
          <p className="discovery-page-domain">
            Discovered via {discovery.adjacentDomain}
          </p>
        )}
      </div>

      {/* Cards */}
      <div className="discovery-page-cards">
        {discovery.agent1 && <div className="animate-fade-in-up stagger-1"><ProblemCard data={discovery.agent1} /></div>}
        {discovery.agent2 && <div className="animate-fade-in-up stagger-2"><FrontierCard data={discovery.agent2} /></div>}
        {discovery.agent4 && <div className="animate-fade-in-up stagger-3"><BridgeCard data={discovery.agent4} rejected={discovery.rejectedBridges} /></div>}
        {discovery.agent45 && <div className="animate-fade-in-up stagger-4"><ValidationCard data={discovery.agent45} /></div>}
        {discovery.agent6 && <div className="animate-fade-in-up stagger-5"><CodeCard data={discovery.agent6} spec={discovery.agent5?.specification} /></div>}
        {discovery.agent7 && <div className="animate-fade-in-up stagger-6"><MarketGapCard data={discovery.agent7} /></div>}

        {discovery.launchPack && (
          <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <LaunchPack data={discovery.launchPack} />
          </div>
        )}

        <div className="animate-fade-in-up" style={{ animationDelay: '700ms', paddingBottom: 'var(--space-3xl)' }}>
          <ShareableLink discoveryId={id} />
        </div>
      </div>
    </div>
  )
}

import { CheckCircle } from 'lucide-react'
import ProblemCard from '../cards/ProblemCard'
import FrontierCard from '../cards/FrontierCard'
import BridgeCard from '../cards/BridgeCard'
import ValidationCard from '../cards/ValidationCard'
import CodeCard from '../cards/CodeCard'
import MarketGapCard from '../cards/MarketGapCard'
import LaunchPack from '../launchpack/LaunchPack'
import ShareableLink from '../shared/ShareableLink'
import './DiscoveryBoard.css'

export default function DiscoveryBoard({ discovery, phase }) {
  const hasAllCards = discovery?.agent1 && discovery?.agent2 && discovery?.agent4 &&
    discovery?.agent45 && discovery?.agent6 && discovery?.agent7

  return (
    <div className="discovery-board" id="discovery-board">
      {phase === 'q1' || phase === 'q2' || phase === 'q3' ? (
        <div className="discovery-board-empty">
          <div className="discovery-board-empty-icon">
            <span className="material-icons" style={{fontSize: '64px', color: 'rgba(78,205,196,0.15)'}}>hub</span>
          </div>
          <p className="discovery-board-empty-text">
            Answer the questions on the left to begin your discovery.
          </p>
          <p className="discovery-board-empty-sub">
            Results will appear here as each agent completes.
          </p>
        </div>
      ) : (
        <div className="discovery-board-cards">
          {/* Summary Bar — when all cards are done */}
          {hasAllCards && (
            <div className="discovery-summary-bar animate-fade-in-up">
              <div className="discovery-summary-item">
                <CheckCircle size={18} style={{ color: 'var(--color-status-complete)' }} />
                <span>Innovation Found</span>
              </div>
              <div className="discovery-summary-item">
                <CheckCircle size={18} style={{ color: 'var(--color-status-complete)' }} />
                <span>Code Verified</span>
              </div>
              <div className="discovery-summary-item">
                <CheckCircle size={18} style={{ color: 'var(--color-status-complete)' }} />
                <span>Market Gap Identified</span>
              </div>
            </div>
          )}

          {/* 6 Discovery Cards */}
          {discovery?.agent1 && (
            <div className="animate-fade-in-up stagger-1"><ProblemCard data={discovery.agent1} /></div>
          )}
          {discovery?.agent2 && (
            <div className="animate-fade-in-up stagger-2"><FrontierCard data={discovery.agent2} /></div>
          )}
          {discovery?.agent4 && (
            <div className="animate-fade-in-up stagger-3">
              <BridgeCard data={discovery.agent4} rejected={discovery.rejectedBridges} />
            </div>
          )}
          {discovery?.agent45 && (
            <div className="animate-fade-in-up stagger-4"><ValidationCard data={discovery.agent45} /></div>
          )}
          {discovery?.agent6 && (
            <div className="animate-fade-in-up stagger-5">
              <CodeCard data={discovery.agent6} spec={discovery.agent5?.specification} />
            </div>
          )}
          {discovery?.agent7 && (
            <div className="animate-fade-in-up stagger-6"><MarketGapCard data={discovery.agent7} /></div>
          )}

          {/* Launch Pack */}
          {discovery?.launchPack && (
            <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <LaunchPack data={discovery.launchPack} />
            </div>
          )}

          {/* Shareable Link */}
          {discovery?.id && phase === 'complete' && (
            <div className="animate-fade-in-up" style={{ animationDelay: '700ms', paddingBottom: 'var(--space-3xl)' }}>
              <ShareableLink discoveryId={discovery.id} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

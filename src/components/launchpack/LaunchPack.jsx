import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import HNPostTab from './HNPostTab'
import DevOutreachTab from './DevOutreachTab'
import ProductHuntTab from './ProductHuntTab'
import './LaunchPack.css'

const tabs = [
  { id: 'hn', label: 'HN Post' },
  { id: 'outreach', label: 'Developer Outreach' },
  { id: 'ph', label: 'Product Hunt' },
]

export default function LaunchPack({ data }) {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('hn')

  return (
    <div className="launch-pack">
      <button
        className="launch-pack-toggle"
        onClick={() => setExpanded(!expanded)}
        id="launch-pack-toggle"
      >
        <span className="launch-pack-toggle-text">Launch Pack</span>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {expanded && (
        <div className="launch-pack-content animate-fade-in">
          <div className="launch-pack-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`launch-pack-tab ${activeTab === tab.id ? 'launch-pack-tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="launch-pack-tab-content">
            {activeTab === 'hn' && <HNPostTab text={data.hnPost} />}
            {activeTab === 'outreach' && <DevOutreachTab messages={data.outreachMessages} />}
            {activeTab === 'ph' && <ProductHuntTab text={data.productHuntPost} />}
          </div>
        </div>
      )}
    </div>
  )
}

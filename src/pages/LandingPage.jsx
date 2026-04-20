import { Link } from 'react-router-dom'
import './LandingPage.css'

export default function LandingPage() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-gray-900 dark:text-white font-body transition-colors duration-300">

      {/* ========== NAV ========== */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="material-icons text-primary text-3xl">hub</span>
          <span className="font-display text-2xl tracking-wide uppercase">MERIDIAN</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          <a className="hover:text-primary transition-colors" href="#agents">Agents</a>
          <a className="hover:text-primary transition-colors" href="#overseer">Overseer</a>
          <a className="hover:text-primary transition-colors" href="#footer">Launch</a>
        </div>
        <Link to="/app" className="bg-primary hover:bg-teal-400 text-black px-6 py-2 rounded-full font-bold uppercase text-xs tracking-wider transition-all shadow-lg shadow-teal-500/30">
          Launch App
        </Link>
      </nav>

      {/* ========== HERO ========== */}
      <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-20">
        <div className="scanline-bg bg-scanlines-light dark:bg-scanlines opacity-40 dark:opacity-60"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-[150px] opacity-10 dark:opacity-20 pointer-events-none"></div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-60 dark:opacity-80 mix-blend-multiply dark:mix-blend-screen">
          <img alt="Abstract 3D Liquid Metal Shape" className="w-[80%] md:w-[60%] h-auto object-cover opacity-80 floating-shape grayscale contrast-125 brightness-125 dark:brightness-75 dark:contrast-150" src="/hero-shape.png" />
        </div>
        <div className="relative z-20 text-center px-4 max-w-7xl mx-auto flex flex-col items-center">
          <p className="text-primary font-bold tracking-[0.3em] uppercase mb-4 text-sm md:text-base animate-pulse">
            Pipeline Active // 10 Autonomous Agents
          </p>
          <h1 className="font-display text-8xl md:text-[12rem] leading-none tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-gray-500 dark:from-white dark:to-gray-500 mb-2 drop-shadow-2xl">
            Discover
          </h1>
          <div className="flex flex-col md:flex-row gap-4 md:gap-12 items-center justify-center w-full">
            <h2 className="font-display text-7xl md:text-[10rem] leading-none tracking-tighter uppercase text-gray-900 dark:text-white relative group">
              Your
              <span className="absolute -bottom-4 left-0 w-0 h-2 bg-primary transition-all duration-500 group-hover:w-full"></span>
            </h2>
            <div className="bg-gray-100/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200/50 dark:border-white/10 p-6 rounded-xl max-w-sm text-left transform md:translate-y-4 shadow-xl">
              <div className="flex items-center gap-3 mb-3 text-primary">
                <span className="material-icons">psychology</span>
                <span className="font-bold text-xs uppercase tracking-widest">Agent Intelligence</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Autonomous agents scan real developer pain, bridge unrelated academic domains, and emit verified Python libraries — in under 5 minutes.
              </p>
            </div>
          </div>
          <h1 className="font-display text-8xl md:text-[12rem] leading-none tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-t from-gray-900 via-gray-700 to-gray-500 dark:from-gray-600 dark:via-white dark:to-white mt-2 mb-12 drop-shadow-2xl">
            Innovation
          </h1>
          <div className="animate-bounce mt-12">
            <span className="material-icons text-4xl text-gray-400 dark:text-gray-500">keyboard_arrow_down</span>
          </div>
        </div>
      </section>

      {/* ========== AGENT 0: PROMPT SHARPENER ========== */}
      <section id="agents" className="relative py-32 bg-gray-50 dark:bg-black overflow-hidden border-t border-gray-200 dark:border-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>
        {/* Prism refraction background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-screen">
          <img src="/bg-agent0.png" alt="" className="absolute top-1/2 right-0 -translate-y-1/2 w-[60%] h-auto object-cover floating-shape" />
        </div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <span className="absolute -top-20 -left-20 text-[10rem] font-display text-gray-200 dark:text-gray-900 opacity-50 select-none pointer-events-none">00</span>
                <h3 className="font-display text-6xl md:text-8xl uppercase mb-6 relative z-10 dark:text-white">
                  Prompt <br /><span className="text-primary">Sharpener</span>
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md leading-relaxed border-l-4 border-primary pl-6">
                  Your raw frustration goes in. A precision research brief comes out. Agent 0 converts ambiguous human language into a structured document that every downstream agent can reason about without hallucination.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    Removes ambiguity from problem statements
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    Structures target persona and constraints
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    Powered by Gemini 2.5 Flash
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative h-[500px] flex items-center justify-center">
              <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 group p-8">
                <div className="space-y-6">
                  <div className="bg-gray-800/60 rounded-xl p-5 border border-gray-700">
                    <div className="text-xs text-primary font-mono uppercase tracking-wider mb-3">Raw Input</div>
                    <p className="text-gray-400 text-sm italic">"My AI agents keep losing track of what they're supposed to do after a few steps"</p>
                  </div>
                  <div className="flex justify-center"><span className="material-icons text-primary text-3xl animate-bounce">arrow_downward</span></div>
                  <div className="bg-primary/10 rounded-xl p-5 border border-primary/30">
                    <div className="text-xs text-primary font-mono uppercase tracking-wider mb-3">Structured Brief</div>
                    <div className="space-y-2 text-sm">
                      <p className="text-white"><span className="text-primary font-semibold">Problem:</span> Goal drift in multi-step agent pipelines</p>
                      <p className="text-gray-300"><span className="text-primary font-semibold">Persona:</span> Backend ML engineers building agent systems</p>
                      <p className="text-gray-300"><span className="text-primary font-semibold">Prior:</span> Context window stuffing, prompt chaining</p>
                      <p className="text-gray-300"><span className="text-primary font-semibold">Outcome:</span> Measurable state fidelity across 10+ steps</p>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center"><h4 className="font-display text-9xl text-white/5 group-hover:text-white/10 transition-colors select-none">SHARP</h4></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== AGENT 1: FRUSTRATION SCANNER ========== */}
      <section className="relative py-32 bg-background-light dark:bg-background-dark overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(78,205,196,0.05)_50%)] bg-[length:4px_100%] pointer-events-none"></div>
        {/* Radar scanning background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-screen">
          <img src="/bg-agent1.png" alt="" className="absolute top-1/2 left-0 -translate-y-1/2 w-[55%] h-auto object-cover floating-shape" style={{animationDelay:'-2s'}} />
        </div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/5 rounded-full blur-[120px] section-glow pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-16">
            <div className="w-full md:w-1/2 text-right md:text-left">
              <div className="relative md:pl-12">
                <span className="absolute -top-20 -right-20 md:right-auto md:-left-20 text-[10rem] font-display text-gray-200 dark:text-gray-900 opacity-50 select-none pointer-events-none">01</span>
                <h3 className="font-display text-6xl md:text-8xl uppercase mb-6 dark:text-white">
                  Real <br /><span className="text-primary">Pain</span>
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md ml-auto md:ml-0 leading-relaxed border-r-4 md:border-r-0 md:border-l-4 border-gray-300 dark:border-gray-700 pr-6 md:pr-0 md:pl-6">
                  The Frustration Scanner mines Stack Overflow, GitHub Issues, and Hacker News to find verified developer pain. Real upvotes. Real complaints. Real people stuck on real problems.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    Stack Overflow API deep search
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    GitHub Issue reaction mining
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    Algolia HN comment analysis
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative h-[500px] flex items-center justify-center">
              <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 group">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 font-mono text-sm">
                  <div className="flex gap-2 mb-6"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div>
                  <div className="space-y-2 text-gray-400">
                    <p><span className="text-primary">$</span> meridian scan --source stackoverflow</p>
                    <p className="text-green-400">Found 847 frustrations matching query...</p>
                    <p><span className="text-primary">$</span> meridian scan --source github-issues</p>
                    <p className="text-green-400">Found 312 open issues with 50+ reactions...</p>
                    <p><span className="text-primary">$</span> meridian scan --source hackernews</p>
                    <p className="text-green-400">Found 156 complaint threads...</p>
                    <p className="mt-4 text-white">Top: "AI agent state drift after 3+ steps"</p>
                    <p className="text-primary">Upvotes: 2,847 | Unresolved: 14 months</p>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center"><h4 className="font-display text-9xl text-white/5 group-hover:text-white/10 transition-colors select-none">SCAN</h4></div>
                <div className="absolute top-1/4 right-8 bg-black/80 backdrop-blur-md border border-primary/30 p-4 rounded-lg shadow-lg transform rotate-3">
                  <div className="flex items-center gap-3 mb-2"><div className="w-3 h-3 rounded-full bg-primary"></div><div className="w-20 h-2 bg-gray-700 rounded"></div></div>
                  <div className="w-32 h-2 bg-gray-800 rounded mb-2"></div><div className="w-24 h-2 bg-gray-800 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== AGENT 2: FRONTIER DETECTOR ========== */}
      <section className="relative py-32 bg-gray-50 dark:bg-black overflow-hidden border-t border-gray-200 dark:border-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>
        {/* Cosmic nebula background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-screen">
          <img src="/bg-agent2.png" alt="" className="absolute top-1/2 right-10 -translate-y-1/2 w-[50%] h-auto object-cover floating-shape" style={{animationDelay:'-4s'}} />
        </div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] section-glow pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <span className="absolute -top-20 -left-20 text-[10rem] font-display text-gray-200 dark:text-gray-900 opacity-50 select-none pointer-events-none">02</span>
                <h3 className="font-display text-6xl md:text-8xl uppercase mb-6 relative z-10 dark:text-white">
                  Frontier <br /><span className="text-primary">Detector</span>
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md leading-relaxed border-l-4 border-primary pl-6">
                  What breakthrough just happened that nobody noticed? Agent 2 scans arXiv papers, HuggingFace models, and Tavily web search to find capabilities that became possible in the last 90 days.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    arXiv paper search (last 90 days)
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    HuggingFace model discovery
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    Tavily AI web search
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative h-[500px] flex items-center justify-center">
              <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 group p-8">
                <div className="space-y-4">
                  <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700 flex items-start gap-4">
                    <span className="material-icons text-primary mt-1">article</span>
                    <div>
                      <p className="text-white text-sm font-semibold mb-1">arXiv: State Anchoring via Structural Hashing</p>
                      <p className="text-gray-500 text-xs">Published 3 weeks ago | cs.AI</p>
                    </div>
                  </div>
                  <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700 flex items-start gap-4">
                    <span className="material-icons text-primary mt-1">smart_toy</span>
                    <div>
                      <p className="text-white text-sm font-semibold mb-1">HF: state-verifier-v2 (12K downloads)</p>
                      <p className="text-gray-500 text-xs">Released 6 weeks ago | MIT License</p>
                    </div>
                  </div>
                  <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700 flex items-start gap-4">
                    <span className="material-icons text-primary mt-1">travel_explore</span>
                    <div>
                      <p className="text-white text-sm font-semibold mb-1">Web: New readback protocol for LLM agents</p>
                      <p className="text-gray-500 text-xs">Blog post from 2 weeks ago</p>
                    </div>
                  </div>
                  <div className="mt-6 bg-primary/10 rounded-lg p-4 border border-primary/30">
                    <p className="text-primary text-xs font-mono uppercase tracking-wider mb-2">Selected Capability</p>
                    <p className="text-white text-sm">Structural hashing for agent state verification — appeared 3 weeks ago</p>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center"><h4 className="font-display text-9xl text-white/5 group-hover:text-white/10 transition-colors select-none">NEW</h4></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== AGENT 3: ADJACENT DOMAIN FINDER ========== */}
      <section className="relative py-32 bg-background-light dark:bg-background-dark overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(78,205,196,0.05)_50%)] bg-[length:4px_100%] pointer-events-none"></div>
        {/* Neural bridge background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-screen">
          <img src="/bg-agent3.png" alt="" className="absolute bottom-0 left-0 w-[55%] h-auto object-cover floating-shape" style={{animationDelay:'-1s'}} />
        </div>
        <div className="absolute top-10 left-1/3 w-64 h-64 bg-primary/5 rounded-full blur-[100px] section-glow pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-16">
            <div className="w-full md:w-1/2 text-right md:text-left">
              <div className="relative md:pl-12">
                <span className="absolute -top-20 -right-20 md:right-auto md:-left-20 text-[10rem] font-display text-gray-200 dark:text-gray-900 opacity-50 select-none pointer-events-none">03</span>
                <h3 className="font-display text-6xl md:text-8xl uppercase mb-6 dark:text-white">
                  Cross <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Domain</span>
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md ml-auto md:ml-0 leading-relaxed border-r-4 md:border-r-0 md:border-l-4 border-gray-300 dark:border-gray-700 pr-6 md:pr-0 md:pl-6">
                  The core innovation engine. Agent 3 abstracts the software problem, then searches 10 unrelated academic fields via OpenAlex and Semantic Scholar — finding structural analogies hiding in Aviation, Biology, Origami, and more.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    OpenAlex academic search
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    Semantic Scholar paper search
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    10 unrelated fields scanned in parallel
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative">
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 shadow-2xl flex items-center justify-center overflow-hidden border border-gray-800">
                  <div className="absolute w-[80%] h-[80%] border border-dashed border-gray-600 rounded-full animate-[spin_20s_linear_infinite]"></div>
                  <div className="absolute w-[60%] h-[60%] border border-dotted border-primary rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                  <div className="absolute w-[40%] h-[40%] border border-primary/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                  <h2 className="relative z-10 font-display text-5xl text-white mix-blend-difference">BRIDGE</h2>
                </div>
                <div className="absolute top-0 right-0 p-3 bg-white dark:bg-gray-800 rounded shadow-lg animate-bounce"><span className="material-icons text-primary">science</span></div>
                <div className="absolute bottom-10 -left-4 p-3 bg-white dark:bg-gray-800 rounded shadow-lg animate-bounce" style={{animationDelay:'700ms'}}><span className="material-icons text-primary">auto_graph</span></div>
                <div className="absolute top-1/2 -right-4 p-3 bg-white dark:bg-gray-800 rounded shadow-lg animate-bounce" style={{animationDelay:'400ms'}}><span className="material-icons text-primary">link</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== AGENT 4: ADVERSARIAL CRITIC ========== */}
      <section className="relative py-32 bg-gray-50 dark:bg-black overflow-hidden border-t border-gray-200 dark:border-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent pointer-events-none"></div>
        {/* Shattered glass background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-screen">
          <img src="/bg-agent4.png" alt="" className="absolute top-1/2 right-0 -translate-y-1/2 w-[50%] h-auto object-cover floating-shape" style={{animationDelay:'-3s'}} />
        </div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-red-500/5 rounded-full blur-[100px] section-glow pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <span className="absolute -top-20 -left-20 text-[10rem] font-display text-gray-200 dark:text-gray-900 opacity-50 select-none pointer-events-none">04</span>
                <h3 className="font-display text-6xl md:text-8xl uppercase mb-6 relative z-10 dark:text-white">
                  Adversarial <br /><span className="text-red-500">Critic</span>
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md leading-relaxed border-l-4 border-red-500 pl-6">
                  Every bridge gets attacked. Agent 4 runs on Groq Llama 3.3 70B (a completely different model) and applies 3 brutal rejection tests. If the analogy is just metaphor, or already exists in software, it dies here.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-red-500/20 p-2 rounded-full text-red-500"><span className="material-icons text-sm">close</span></span>
                    Test 1: Domain Name Removal
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-red-500/20 p-2 rounded-full text-red-500"><span className="material-icons text-sm">close</span></span>
                    Test 2: Physical Property Check
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-red-500/20 p-2 rounded-full text-red-500"><span className="material-icons text-sm">close</span></span>
                    Test 3: Existing Solution Check
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative h-[500px] flex items-center justify-center">
              <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 group p-8">
                <div className="space-y-4">
                  <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-2"><span className="material-icons text-red-500 text-sm">cancel</span><span className="text-red-400 text-xs font-mono uppercase">Rejected</span></div>
                    <p className="text-white text-sm font-semibold">Jazz Improvisation Bridge</p>
                    <p className="text-gray-500 text-xs mt-1">Failed Test 1: Analogy only works with musical terminology</p>
                  </div>
                  <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                    <div className="flex items-center gap-2 mb-2"><span className="material-icons text-red-500 text-sm">cancel</span><span className="text-red-400 text-xs font-mono uppercase">Rejected</span></div>
                    <p className="text-white text-sm font-semibold">Fermentation Feedback Bridge</p>
                    <p className="text-gray-500 text-xs mt-1">Failed Test 2: Requires biological enzyme properties</p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                    <div className="flex items-center gap-2 mb-2"><span className="material-icons text-primary text-sm">check_circle</span><span className="text-primary text-xs font-mono uppercase">Approved</span></div>
                    <p className="text-white text-sm font-semibold">Aviation Readback Protocol Bridge</p>
                    <p className="text-gray-400 text-xs mt-1">Passes all 3 tests. Structural parallel holds without domain terminology.</p>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center"><h4 className="font-display text-9xl text-white/5 group-hover:text-white/10 transition-colors select-none">KILL</h4></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== AGENT 4.5: REALITY CHECKER ========== */}
      <section className="relative py-32 bg-background-light dark:bg-background-dark overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(78,205,196,0.05)_50%)] bg-[length:4px_100%] pointer-events-none"></div>
        {/* Neural nodes rotated background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-screen" style={{transform:'rotate(180deg)'}}>
          <img src="/bg-agent3.png" alt="" className="absolute top-0 right-0 w-[50%] h-auto object-cover floating-shape" style={{animationDelay:'-5s'}} />
        </div>
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-purple-500/5 rounded-full blur-[120px] section-glow pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-16">
            <div className="w-full md:w-1/2 text-right md:text-left">
              <div className="relative md:pl-12">
                <span className="absolute -top-20 -right-20 md:right-auto md:-left-20 text-[10rem] font-display text-gray-200 dark:text-gray-900 opacity-50 select-none pointer-events-none">4.5</span>
                <h3 className="font-display text-6xl md:text-8xl uppercase mb-6 dark:text-white">
                  Reality <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Check</span>
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md ml-auto md:ml-0 leading-relaxed border-r-4 md:border-r-0 md:border-l-4 border-gray-300 dark:border-gray-700 pr-6 md:pr-0 md:pl-6">
                  Before writing code, Agent 4.5 goes back to Stack Overflow, GitHub, and HN to find 3 real developers who would actually use this innovation. Real people. Real complaints. Real demand.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    Finds 3 real developers with exact quotes
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    Links to their actual public posts
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    Explains how the innovation helps each one
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative h-[500px] flex items-center justify-center">
              <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 group p-8">
                <div className="space-y-5">
                  {[
                    { user: '@agent_builder_42', platform: 'Stack Overflow', quote: 'My agent loses its goal after 4 steps every single time...', match: 'Strong' },
                    { user: '@mlops_sarah', platform: 'GitHub', quote: 'Opened issue #847: Agent state corruption in multi-step pipelines', match: 'Strong' },
                    { user: '@dev_frustrated', platform: 'Hacker News', quote: 'Spent 3 months on this. Nothing works for state consistency.', match: 'Moderate' },
                  ].map((v, i) => (
                    <div key={i} className="bg-gray-800/60 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{v.user[1].toUpperCase()}</div>
                          <div><p className="text-white text-sm font-semibold">{v.user}</p><p className="text-gray-500 text-xs">{v.platform}</p></div>
                        </div>
                        <span className={`text-xs font-mono px-2 py-1 rounded ${v.match === 'Strong' ? 'bg-primary/20 text-primary' : 'bg-yellow-500/20 text-yellow-400'}`}>{v.match}</span>
                      </div>
                      <p className="text-gray-400 text-sm italic">"{v.quote}"</p>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 flex items-center justify-center"><h4 className="font-display text-9xl text-white/5 group-hover:text-white/10 transition-colors select-none">REAL</h4></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== AGENT 5: CODE TRANSLATOR ========== */}
      <section className="relative py-32 bg-gray-50 dark:bg-black overflow-hidden border-t border-gray-200 dark:border-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>
        {/* Prism refraction flipped background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-screen" style={{transform:'scaleX(-1)'}}>
          <img src="/bg-agent0.png" alt="" className="absolute top-1/2 left-10 -translate-y-1/2 w-[45%] h-auto object-cover floating-shape" style={{animationDelay:'-2s'}} />
        </div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] section-glow pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <span className="absolute -top-20 -left-20 text-[10rem] font-display text-gray-200 dark:text-gray-900 opacity-50 select-none pointer-events-none">05</span>
                <h3 className="font-display text-6xl md:text-8xl uppercase mb-6 relative z-10 dark:text-white">
                  Code <br /><span className="text-primary">Translator</span>
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md leading-relaxed border-l-4 border-primary pl-6">
                  Concepts without code are useless. Agent 5 generates a complete Python library — with type hints, docstrings, 3 test functions, and a demo — translating the approved bridge into a real, working tool.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    Full Python 3.10+ with type hints
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    3 test functions included
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    Only stdlib + pydantic deps
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative h-[500px] flex items-center justify-center">
              <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 group">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 font-mono text-sm">
                  <div className="flex gap-2 mb-6"><div className="w-3 h-3 rounded-full bg-red-500"></div><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div className="w-3 h-3 rounded-full bg-green-500"></div></div>
                  <div className="space-y-1 text-gray-400 text-xs md:text-sm">
                    <p className="text-green-400">class ReadbackVerifier:</p>
                    <p className="pl-4 text-gray-300">{`    """Aviation readback for agent state"""`}</p>
                    <p>&nbsp;</p>
                    <p className="pl-4 text-blue-400">{`    def __init__(self, threshold=0.85):`}</p>
                    <p className="pl-8 text-gray-300">{`        self.threshold = threshold`}</p>
                    <p className="pl-8 text-gray-300">{`        self.state_history = []`}</p>
                    <p>&nbsp;</p>
                    <p className="pl-4 text-blue-400">{`    def verify(self, current, expected):`}</p>
                    <p className="pl-8 text-gray-300">{`        sim = self._compare(current, expected)`}</p>
                    <p className="pl-8 text-yellow-400">{`        if sim < self.threshold:`}</p>
                    <p className="pl-12 text-red-400">{`            raise StateDriftError(sim)`}</p>
                    <p className="pl-8 text-green-400">{`        return True`}</p>
                    <p>&nbsp;</p>
                    <p className="text-gray-600">{`# --- Tests ---`}</p>
                    <p className="text-blue-400">{`def test_pass(): ...`}</p>
                    <p className="text-blue-400">{`def test_drift(): ...`}</p>
                    <p className="text-blue-400">{`def test_history(): ...`}</p>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center"><h4 className="font-display text-9xl text-white/5 group-hover:text-white/10 transition-colors select-none">CODE</h4></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== AGENT 6: CODE VERIFIER ========== */}
      <section className="relative py-32 bg-background-light dark:bg-background-dark overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(78,205,196,0.05)_50%)] bg-[length:4px_100%] pointer-events-none"></div>
        {/* Radar scanning flipped background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-screen" style={{transform:'scaleX(-1) scaleY(-1)'}}>
          <img src="/bg-agent1.png" alt="" className="absolute top-0 right-0 w-[50%] h-auto object-cover floating-shape" style={{animationDelay:'-4s'}} />
        </div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-500/5 rounded-full blur-[100px] section-glow pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-16">
            <div className="w-full md:w-1/2 text-right md:text-left">
              <div className="relative md:pl-12">
                <span className="absolute -top-20 -right-20 md:right-auto md:-left-20 text-[10rem] font-display text-gray-200 dark:text-gray-900 opacity-50 select-none pointer-events-none">06</span>
                <h3 className="font-display text-6xl md:text-8xl uppercase mb-6 dark:text-white">
                  Code <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-primary">Verifier</span>
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md ml-auto md:ml-0 leading-relaxed border-r-4 md:border-r-0 md:border-l-4 border-gray-300 dark:border-gray-700 pr-6 md:pr-0 md:pl-6">
                  Agent 6 runs on Groq Llama 3.3 (a different LLM than the one that wrote the code) and performs 4 independent checks: syntax, logic, tests, and dependencies. Up to 3 fix-and-retry cycles.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-green-500/20 p-2 rounded-full text-green-400"><span className="material-icons text-sm">check</span></span>
                    Syntax verification
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-green-500/20 p-2 rounded-full text-green-400"><span className="material-icons text-sm">check</span></span>
                    Logic correctness
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-green-500/20 p-2 rounded-full text-green-400"><span className="material-icons text-sm">check</span></span>
                    Test coverage + dependency audit
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative h-[500px] flex items-center justify-center">
              <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 group p-8">
                <div className="space-y-4">
                  {['Syntax', 'Logic', 'Tests', 'Dependencies'].map((check, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-800/60 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center gap-3">
                        <span className="material-icons text-green-400">check_circle</span>
                        <span className="text-white font-semibold">{check}</span>
                      </div>
                      <span className="text-green-400 text-xs font-mono uppercase">Passed</span>
                    </div>
                  ))}
                  <div className="mt-4 bg-green-500/10 rounded-lg p-4 border border-green-500/30 text-center">
                    <p className="text-green-400 font-bold text-sm uppercase tracking-wider">Verdict: PASS</p>
                    <p className="text-gray-500 text-xs mt-1">Completed in 1 iteration | GitHub Ready</p>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center"><h4 className="font-display text-9xl text-white/5 group-hover:text-white/10 transition-colors select-none">PASS</h4></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== AGENT 7: MARKET GAP ========== */}
      <section className="relative py-32 bg-gray-50 dark:bg-black overflow-hidden border-t border-gray-200 dark:border-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>
        {/* Nebula rotated background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-screen" style={{transform:'rotate(90deg)'}}>
          <img src="/bg-agent2.png" alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-auto object-cover floating-shape" style={{animationDelay:'-3s'}} />
        </div>
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] section-glow pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <span className="absolute -top-20 -left-20 text-[10rem] font-display text-gray-200 dark:text-gray-900 opacity-50 select-none pointer-events-none">07</span>
                <h3 className="font-display text-6xl md:text-8xl uppercase mb-6 relative z-10 dark:text-white">
                  Market <br /><span className="text-primary">Gap</span>
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md leading-relaxed border-l-4 border-primary pl-6">
                  Agent 7 uses Tavily to find 3 real competitors and explains exactly what each one is missing. The gap is not imaginary — it's the space between what exists and what your innovation provides.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    3 real competitors analyzed
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    Specific gaps identified per competitor
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    Explains why the gap exists
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative h-[500px] flex items-center justify-center">
              <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 group p-8">
                <div className="space-y-4">
                  {[
                    { name: 'LangChain', gap: 'No structural state verification mechanism' },
                    { name: 'AutoGPT', gap: 'No cross-domain analogy discovery' },
                    { name: 'CrewAI', gap: 'No readback-style drift detection' },
                  ].map((comp, i) => (
                    <div key={i} className="bg-gray-800/60 rounded-lg p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-semibold">{comp.name}</span>
                        <span className="material-icons text-red-500 text-sm">block</span>
                      </div>
                      <p className="text-red-400 text-sm">Does NOT: {comp.gap}</p>
                    </div>
                  ))}
                  <div className="mt-4 bg-primary/10 rounded-lg p-4 border border-primary/30">
                    <p className="text-primary text-xs font-mono uppercase tracking-wider mb-2">The Gap</p>
                    <p className="text-white text-sm">No existing tool applies cross-domain structural mechanisms to agent state management with verified code output.</p>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center"><h4 className="font-display text-9xl text-white/5 group-hover:text-white/10 transition-colors select-none">GAP</h4></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== AGENT 8: PUBLISHER ========== */}
      <section className="relative py-32 bg-background-light dark:bg-background-dark overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(78,205,196,0.05)_50%)] bg-[length:4px_100%] pointer-events-none"></div>
        {/* Shattered glass rotated background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-screen" style={{transform:'scaleX(-1)'}}>
          <img src="/bg-agent4.png" alt="" className="absolute bottom-0 left-0 w-[50%] h-auto object-cover floating-shape" style={{animationDelay:'-1s'}} />
        </div>
        <div className="absolute bottom-10 right-1/3 w-72 h-72 bg-blue-500/5 rounded-full blur-[100px] section-glow pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-16">
            <div className="w-full md:w-1/2 text-right md:text-left">
              <div className="relative md:pl-12">
                <span className="absolute -top-20 -right-20 md:right-auto md:-left-20 text-[10rem] font-display text-gray-200 dark:text-gray-900 opacity-50 select-none pointer-events-none">08</span>
                <h3 className="font-display text-6xl md:text-8xl uppercase mb-6 dark:text-white">
                  Launch <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Publisher</span>
                </h3>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-md ml-auto md:ml-0 leading-relaxed border-r-4 md:border-r-0 md:border-l-4 border-gray-300 dark:border-gray-700 pr-6 md:pr-0 md:pl-6">
                  The final agent creates a public GitHub repository with your code, generates a PDF report, and writes launch content — a Hacker News "Show HN" post, Product Hunt description, and personalized outreach messages.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    GitHub repo auto-created
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    PDF discovery report generated
                  </li>
                  <li className="flex items-center gap-4 text-gray-700 dark:text-gray-300 font-semibold">
                    <span className="bg-primary/20 p-2 rounded-full text-primary"><span className="material-icons text-sm">check</span></span>
                    HN + PH + outreach content
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-full md:w-1/2 relative h-[500px] flex items-center justify-center">
              <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-800 group p-8">
                <div className="space-y-4">
                  <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700 flex items-center gap-4">
                    <span className="material-icons text-white text-2xl">folder</span>
                    <div>
                      <p className="text-white font-semibold text-sm">GitHub: readback-verifier</p>
                      <p className="text-gray-500 text-xs">Public repo with README, code, tests</p>
                    </div>
                    <span className="ml-auto material-icons text-primary">open_in_new</span>
                  </div>
                  <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700 flex items-center gap-4">
                    <span className="material-icons text-red-400 text-2xl">picture_as_pdf</span>
                    <div>
                      <p className="text-white font-semibold text-sm">Discovery Report PDF</p>
                      <p className="text-gray-500 text-xs">6-page dark-themed report</p>
                    </div>
                    <span className="ml-auto material-icons text-primary">download</span>
                  </div>
                  <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700 flex items-center gap-4">
                    <span className="material-icons text-orange-400 text-2xl">campaign</span>
                    <div>
                      <p className="text-white font-semibold text-sm">Launch Pack</p>
                      <p className="text-gray-500 text-xs">HN Post + PH Description + 3 Outreach Messages</p>
                    </div>
                    <span className="ml-auto material-icons text-primary">content_copy</span>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center"><h4 className="font-display text-9xl text-white/5 group-hover:text-white/10 transition-colors select-none">SHIP</h4></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== OVERSEER ========== */}
      <section id="overseer" className="relative py-32 bg-gray-50 dark:bg-black overflow-hidden border-t border-gray-200 dark:border-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent pointer-events-none"></div>
        {/* Liquid metal shape for Overseer */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.25] mix-blend-screen">
          <img src="/hero-shape.png" alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-auto object-cover floating-shape" style={{animationDelay:'-2s'}} />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[150px] section-glow pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <span className="text-[8rem] md:text-[12rem] font-display text-gray-200 dark:text-gray-900 opacity-30 select-none pointer-events-none block leading-none">EYE</span>
          <h3 className="font-display text-6xl md:text-8xl uppercase mb-6 dark:text-white -mt-16 relative z-10">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-primary">Overseer</span>
          </h3>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            A continuous intelligence that watches every agent write. It scores each output on Trajectory, Credibility, and Novelty (1-10). If quality drops, it can STOP the entire pipeline. No bad outputs reach you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Trajectory', score: '9.2', desc: 'Is the pipeline heading toward useful innovation?' },
              { label: 'Credibility', score: '8.7', desc: 'Is output backed by real data, not fabricated?' },
              { label: 'Novelty', score: '8.4', desc: 'Is the innovation genuinely new, not obvious?' },
            ].map((s, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center">
                <p className="text-primary font-display text-5xl mb-2">{s.score}</p>
                <p className="text-white font-bold uppercase tracking-widest text-sm mb-2">{s.label}</p>
                <p className="text-gray-500 text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FOOTER CTA ========== */}
      <footer id="footer" className="relative bg-gray-900 text-white py-24 overflow-hidden">
        <div className="scanline-bg bg-scanlines bg-[length:4px_100%] opacity-30 pointer-events-none"></div>
        {/* Metallic strip ribbon */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full pointer-events-none z-0 opacity-40">
          <img src="/metallic-strip.png" alt="" className="w-full h-auto object-cover metallic-strip-anim" style={{maxHeight: '80px'}} />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="font-display text-5xl md:text-7xl uppercase mb-8">Ready to <span className="text-primary">Discover?</span></h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-12 text-lg">
            10 autonomous agents. 8 real-time APIs. Cross-domain structural bridges. Verified working code. All in under 5 minutes, completely free.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            <Link to="/app" className="bg-primary hover:bg-teal-400 text-black px-10 py-4 rounded-full font-bold uppercase text-sm tracking-widest transition-all shadow-lg shadow-teal-900/50 w-full md:w-auto text-center">
              Start Pipeline Now
            </Link>
            <a href="#agents" className="bg-transparent border border-gray-600 hover:border-white text-white px-10 py-4 rounded-full font-bold uppercase text-sm tracking-widest transition-all w-full md:w-auto text-center">
              View All Agents
            </a>
          </div>
          <div className="mt-24 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 uppercase tracking-wider">
            <p>Built for Agentathon 2026</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span>MERIDIAN v1.0</span>
              <span>10 Agents</span>
              <span>8 APIs</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

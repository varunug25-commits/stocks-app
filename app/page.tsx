"use client";

import { useMemo, useState } from "react";

const stocks = [
  { symbol: "NVDA", name: "NVIDIA", price: "141.42", change: "+3.8%", score: 88, note: "Momentum strengthened after a clean breakout.", color: "#6ee7b7" },
  { symbol: "MSFT", name: "Microsoft", price: "428.07", change: "+1.1%", score: 81, note: "Quality trend remains intact above its 50-day average.", color: "#93c5fd" },
  { symbol: "AAPL", name: "Apple", price: "212.33", change: "−0.6%", score: 62, note: "Neutral: wait for a decisive move above resistance.", color: "#c4b5fd" },
  { symbol: "TSLA", name: "Tesla", price: "248.98", change: "+4.4%", score: 74, note: "High-volatility setup; size risk carefully.", color: "#fda4af" },
];

function Sparkline({ color, up = true }: { color: string; up?: boolean }) {
  return (
    <svg className="sparkline" viewBox="0 0 150 44" aria-hidden="true">
      <path d={up ? "M1 36 C13 36 17 25 27 27 S41 32 50 20 S62 28 74 16 S91 25 101 12 S114 20 124 8 S140 13 149 3" : "M1 10 C14 7 20 17 31 14 S44 6 55 17 S70 14 81 26 S97 18 105 31 S119 27 128 36 S141 31 149 42"} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M1 43 H149" stroke="rgba(255,255,255,.08)" />
    </svg>
  );
}

export default function Home() {
  const [activeSymbol, setActiveSymbol] = useState("NVDA");
  const [range, setRange] = useState("1M");
  const [watching, setWatching] = useState(true);
  const [query, setQuery] = useState("");
  const active = useMemo(() => stocks.find((stock) => stock.symbol === activeSymbol) ?? stocks[0], [activeSymbol]);
  const filtered = stocks.filter((stock) => `${stock.symbol} ${stock.name}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Signal home"><span className="brand-mark">S</span><span>signal</span></a>
        <nav aria-label="Main navigation">
          <a className="nav-item active" href="#overview"><span>◉</span> Overview</a>
          <a className="nav-item" href="#watchlist"><span>◇</span> Watchlist</a>
          <a className="nav-item" href="#insights"><span>✦</span> AI Insights</a>
          <a className="nav-item" href="#portfolio"><span>▱</span> Portfolio</a>
        </nav>
        <div className="sidebar-foot">
          <div className="market-status"><i /> US market opens in 2h 14m</div>
          <button className="account"><span className="avatar">V</span><span><b>Varun</b><small>Free plan</small></span><span>⌄</span></button>
        </div>
      </aside>

      <section className="content" id="top">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">S</span> signal</div>
          <label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search stocks, ETFs, or news" aria-label="Search stocks" /><kbd>⌘ K</kbd></label>
          <button className="icon-button" aria-label="Notifications">♧<i /></button>
        </header>

        <div className="page-intro" id="overview">
          <div><p className="eyebrow">WEDNESDAY, JULY 30</p><h1>Good morning, Varun <span>✦</span></h1><p className="subtle">Here&apos;s what matters in your market today.</p></div>
          <button className="outline-button" onClick={() => setWatching(!watching)}>{watching ? "✓ Watching market" : "+ Watch market"}</button>
        </div>

        <section className="hero-grid">
          <article className="portfolio-card" id="portfolio">
            <div className="card-kicker"><span>PORTFOLIO VALUE</span><span className="live-dot">LIVE</span></div>
            <div className="value-row"><strong>$24,820.64</strong><span className="positive">↗ 2.48% <small>today</small></span></div>
            <div className="chart-wrap"><div className="chart-label left">$25,000</div><div className="chart-label right">+ $1,128 today</div><svg viewBox="0 0 720 190" role="img" aria-label="Portfolio value rising over one month"><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#3af0b1" stopOpacity=".30"/><stop offset="1" stopColor="#3af0b1" stopOpacity="0"/></linearGradient></defs><path d="M0 155 C35 149 49 152 82 133 S116 143 147 123 S184 133 213 106 S253 119 285 102 S315 112 345 82 S382 106 411 70 S451 88 481 62 S512 80 544 54 S575 65 606 28 S648 50 680 27 S705 34 720 12 L720 190 L0 190Z" fill="url(#area)"/><path d="M0 155 C35 149 49 152 82 133 S116 143 147 123 S184 133 213 106 S253 119 285 102 S315 112 345 82 S382 106 411 70 S451 88 481 62 S512 80 544 54 S575 65 606 28 S648 50 680 27 S705 34 720 12" fill="none" stroke="#52f0b5" strokeWidth="3" /></svg><div className="chart-label bottom">Jun 30 <span>Jul 7</span><span>Jul 14</span><span>Jul 21</span><span>Today</span></div></div>
            <div className="range-switcher">{["1D", "1W", "1M", "3M", "1Y"].map((item) => <button onClick={() => setRange(item)} className={range === item ? "selected" : ""} key={item}>{item}</button>)}</div>
          </article>

          <article className="daily-brief" id="insights"><div className="brief-top"><span className="ai-orb">✦</span><span><b>AI DAILY BRIEF</b><small>Updated 8 min ago</small></span><button aria-label="More brief options">•••</button></div><h2>Three signals worth your attention</h2><p>Market breadth is improving while volatility continues to cool—favorable conditions for selective risk-taking.</p><button className="read-button" onClick={() => document.getElementById("watchlist")?.scrollIntoView({ behavior: "smooth" })}>Read market brief <span>→</span></button></article>
        </section>

        <section className="section-heading"><div><p className="eyebrow">AI-CURATED</p><h2>Top opportunities</h2></div><button className="text-button">View all <span>→</span></button></section>
        <section className="opportunity-grid" aria-label="Top opportunities">
          {stocks.slice(0, 3).map((stock) => <button key={stock.symbol} className={`opportunity ${activeSymbol === stock.symbol ? "focused" : ""}`} onClick={() => setActiveSymbol(stock.symbol)}><div className="stock-head"><span className="ticker-icon" style={{ background: stock.color }}>{stock.symbol[0]}</span><span><b>{stock.symbol}</b><small>{stock.name}</small></span><span className="score">{stock.score}<small>/100</small></span></div><div className="stock-price">${stock.price} <span className={stock.change.includes("−") ? "negative" : "positive"}>{stock.change}</span></div><Sparkline color={stock.color} up={!stock.change.includes("−")} /><p><span>✦</span> {stock.note}</p></button>)}
        </section>

        <section className="watchlist-area" id="watchlist"><div className="section-heading"><div><p className="eyebrow">YOUR RADAR</p><h2>Watchlist</h2></div><button className="add-button" onClick={() => setWatching(!watching)}>+ Add symbol</button></div><div className="watch-table"><div className="table-head"><span>ASSET</span><span>PRICE</span><span>DAY</span><span>AI VIEW</span></div>{filtered.map((stock) => <button className={`table-row ${active.symbol === stock.symbol ? "row-active" : ""}`} onClick={() => setActiveSymbol(stock.symbol)} key={stock.symbol}><span className="asset"><i style={{ background: stock.color }}>{stock.symbol[0]}</i><b>{stock.symbol}<small>{stock.name}</small></b></span><span>${stock.price}</span><span className={stock.change.includes("−") ? "negative" : "positive"}>{stock.change}</span><span><em className={`signal ${stock.score > 80 ? "bullish" : stock.score > 70 ? "watch" : "neutral"}`}>{stock.score > 80 ? "Bullish" : stock.score > 70 ? "Watch" : "Neutral"}</em></span></button>)}</div></section>
        <p className="disclaimer">Signal provides educational market analysis, not investment advice. Always do your own research before investing.</p>
      </section>
    </main>
  );
}

import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg: "#F7F5F0",
  bg2: "#FFFFFF",
  bg3: "#F0EDE6",
  surface: "#FAFAF8",
  border: "#E5E0D8",
  border2: "#D0C9BE",
  text: "#1A1714",
  text2: "#6B6460",
  text3: "#A09890",
  accent: "#1B6B4A",     // deep savanna green
  accent2: "#D48B2E",    // warm amber/gold
  accent3: "#C14B2A",    // terracotta
  blue: "#2563A8",
  teal: "#0F7B6C",
  purple: "#5B3FA6",
  red: "#C0392B",
  green: "#1B6B4A",
  amber: "#D48B2E",
};

// ─── CURRENCIES ──────────────────────────────────────────────────────────────
const CURRENCIES = {
  KES: { symbol: "KES", rate: 130, name: "Kenyan Shilling" },
  UGX: { symbol: "UGX", rate: 3750, name: "Ugandan Shilling" },
  TZS: { symbol: "TZS", rate: 2600, name: "Tanzanian Shilling" },
  ETB: { symbol: "ETB", rate: 57, name: "Ethiopian Birr" },
  USD: { symbol: "USD", rate: 1, name: "US Dollar" },
};

function fmtCurrency(usdAmount, curr) {
  const c = CURRENCIES[curr];
  const val = usdAmount * c.rate;
  if (curr === "USD") return `$${usdAmount >= 1000 ? (usdAmount / 1000).toFixed(0) + "K" : usdAmount.toLocaleString()}`;
  if (val >= 1_000_000) return `${c.symbol} ${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${c.symbol} ${(val / 1_000).toFixed(0)}K`;
  return `${c.symbol} ${val.toLocaleString()}`;
}

// ─── SAMPLE DATA ─────────────────────────────────────────────────────────────
const PROSPECTS = [
  { id: 1, company: "Equity Bank Kenya", sector: "BFSI", country: "KE", contact: "James Mwangi", title: "CTO", source: "LinkedIn", status: "Engaged", score: 82, lastTouch: "2d ago", notes: "Interested in network refresh" },
  { id: 2, company: "Safaricom PLC", sector: "Telco", country: "KE", contact: "Sylvia Mulinge", title: "Director IT", source: "Referral", status: "Cold", score: 61, lastTouch: "12d ago", notes: "Annual review Q3" },
  { id: 3, company: "Bank of Uganda", sector: "Public Sector", country: "UG", contact: "Patrick Ocama", title: "Head of ICT", source: "Event", status: "Qualified", score: 90, lastTouch: "1d ago", notes: "RFP expected June" },
  { id: 4, company: "Ethiopian Airlines", sector: "Aviation", country: "ET", contact: "Tigist Haile", title: "IT Manager", source: "Cold Call", status: "Nurturing", score: 45, lastTouch: "7d ago", notes: "Budget cycle starts Aug" },
  { id: 5, company: "CRDB Bank", sector: "BFSI", country: "TZ", contact: "Agnes Msamba", title: "CIO", source: "LinkedIn", status: "Engaged", score: 75, lastTouch: "3d ago", notes: "Security audit findings" },
  { id: 6, company: "Kenya Power", sector: "Energy/Utility", country: "KE", contact: "Daniel Kinuthia", title: "GM IT", source: "Referral", status: "Qualified", score: 88, lastTouch: "1d ago", notes: "Digitisation mandate from board" },
];

const DEALS = [
  { id: 1, name: "Network Refresh", company: "Equity Bank Kenya", country: "KE", value: 185000, stage: "Proposal", stageIdx: 3, prob: 65, category: "Commit", owner: "BM", ownerName: "Brian Mutua", daysOpen: 34, product: "Cisco Networking", closeDate: "2025-06-30", vendor: "Cisco", notes: "Awaiting final sign-off from board", activities: ["Proposal submitted", "Demo done", "Champions identified"], risk: "Budget freeze risk" },
  { id: 2, name: "Cloud Migration Phase 1", company: "Safaricom PLC", country: "KE", value: 320000, stage: "Negotiation", stageIdx: 4, prob: 80, category: "Commit", owner: "AO", ownerName: "Akinyi Odhiambo", daysOpen: 51, product: "AWS / Azure", closeDate: "2025-06-15", vendor: "AWS", notes: "Legal reviewing MSA", activities: ["MSA in review", "POC complete", "Exec sponsor confirmed"], risk: "Procurement delay" },
  { id: 3, name: "Core Banking Security Suite", company: "Bank of Uganda", country: "UG", value: 95000, stage: "RFP Response", stageIdx: 2, prob: 40, category: "Pipeline", owner: "RO", ownerName: "Ronald Okello", daysOpen: 18, product: "Palo Alto / CyberArk", closeDate: "2025-07-31", vendor: "Palo Alto", notes: "Competing against 3 vendors", activities: ["RFP submitted", "Technical questions answered"], risk: "Price competitiveness" },
  { id: 4, name: "Data Centre Consolidation", company: "Ethiopian Airlines", country: "ET", value: 420000, stage: "Discovery", stageIdx: 1, prob: 20, category: "Pipeline", owner: "TG", ownerName: "Tigist Girma", daysOpen: 9, product: "HPE / VMware", closeDate: "2025-09-30", vendor: "HPE", notes: "Early stage scoping", activities: ["Kickoff call done", "Site visit scheduled"], risk: "Long cycle expected" },
  { id: 5, name: "SD-WAN Rollout", company: "CRDB Bank", country: "TZ", value: 140000, stage: "Proposal", stageIdx: 3, prob: 55, category: "Best Case", owner: "NM", ownerName: "Nancy Mwenda", daysOpen: 27, product: "Fortinet SD-WAN", closeDate: "2025-07-15", vendor: "Fortinet", notes: "CFO approval pending", activities: ["Proposal delivered", "ROI model shared"], risk: "CFO buyoff" },
  { id: 6, name: "Power Utility SCADA Upgrade", company: "Kenya Power", country: "KE", value: 275000, stage: "Negotiation", stageIdx: 4, prob: 75, category: "Commit", owner: "BM", ownerName: "Brian Mutua", daysOpen: 44, product: "Schneider Electric", closeDate: "2025-06-30", vendor: "Schneider", notes: "Final pricing round", activities: ["Exec alignment done", "Contract draft shared"], risk: "Cabinet approval" },
  { id: 7, name: "Endpoint Security 500 seats", company: "Equity Bank Kenya", country: "KE", value: 48000, stage: "Closed Won", stageIdx: 5, prob: 100, category: "Closed", owner: "AO", ownerName: "Akinyi Odhiambo", daysOpen: 0, product: "CrowdStrike", closeDate: "2025-05-10", vendor: "CrowdStrike", notes: "Signed & PO raised", activities: ["PO received", "Deployment scheduled"], risk: "" },
  { id: 8, name: "Video Conferencing Rollout", company: "Bank of Uganda", country: "UG", value: 32000, stage: "Closed Lost", stageIdx: 6, prob: 0, category: "Closed", owner: "RO", ownerName: "Ronald Okello", daysOpen: 0, product: "Cisco Webex", closeDate: "2025-04-30", vendor: "Cisco", notes: "Lost on price to local competitor", activities: ["Lost — competitor won on price"], risk: "" },
];

const REPS = [
  { id: 1, name: "Brian Mutua", initials: "BM", role: "BDM", region: "Kenya", quota: 600000, won: 275000, pipeline: 460000, commit: 310000, color: T.accent },
  { id: 2, name: "Akinyi Odhiambo", initials: "AO", role: "Senior BDM", region: "Kenya", quota: 800000, won: 368000, pipeline: 320000, commit: 320000, color: T.blue },
  { id: 3, name: "Ronald Okello", initials: "RO", role: "BDM", region: "Uganda", quota: 450000, won: 0, pipeline: 95000, commit: 0, color: T.accent3 },
  { id: 4, name: "Nancy Mwenda", initials: "NM", role: "BDM", region: "Tanzania", quota: 380000, won: 0, pipeline: 140000, commit: 0, color: T.teal },
  { id: 5, name: "Tigist Girma", initials: "TG", role: "BDM", region: "Ethiopia", quota: 500000, won: 0, pipeline: 420000, commit: 0, color: T.purple },
];

const ACTIVITIES = [
  { type: "win", text: "Closed Won — Endpoint Security 500 seats · Equity Bank", sub: "KES 6.24M · Brian Mutua", time: "2h ago", color: T.green },
  { type: "stage", text: "Cloud Migration advanced to Negotiation · Safaricom", sub: "80% probability · Akinyi Odhiambo", time: "Yesterday", color: T.blue },
  { type: "prospect", text: "New qualified prospect — Kenya Power · Daniel Kinuthia", sub: "Score: 88 · via Referral", time: "Yesterday", color: T.accent },
  { type: "risk", text: "Stalled 21d — SD-WAN CRDB Bank — CFO approval pending", sub: "Nancy Mwenda · action needed", time: "2d ago", color: T.accent3 },
  { type: "rfp", text: "RFP response submitted — Bank of Uganda Security Suite", sub: "Ronald Okello · UGX 356M", time: "3d ago", color: T.teal },
  { type: "meeting", text: "Discovery call — Ethiopian Airlines Data Centre", sub: "Tigist Girma · 420K potential", time: "4d ago", color: T.purple },
];

const FORECAST_CATEGORIES = [
  { name: "Closed Won", key: "won", color: T.green, description: "Signed & PO raised" },
  { name: "Commit", key: "commit", color: T.blue, description: "High confidence, >70% prob" },
  { name: "Best Case", key: "bestcase", color: T.accent, description: "Upside if deals accelerate" },
  { name: "Pipeline", key: "pipeline", color: T.accent2, description: "Early-stage, unqualified" },
];

const STAGES = ["Prospecting", "Discovery", "RFP Response", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const countryFlag = (c) => ({ KE: "🇰🇪", UG: "🇺🇬", TZ: "🇹🇿", ET: "🇪🇹" }[c] || "🌍");
const scoreColor = (s) => s >= 80 ? T.green : s >= 60 ? T.accent2 : T.text3;
const statusColor = (s) => ({ Qualified: T.green, Engaged: T.blue, Nurturing: T.accent2, Cold: T.text3 }[s] || T.text3);

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "22", border: `1.5px solid ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color, fontFamily: "'Outfit', sans-serif",
      flexShrink: 0,
    }}>{initials}</div>
  );
}

function Badge({ label, color, bg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 4,
      fontSize: 10.5, fontWeight: 600,
      background: bg || color + "18", color: color || T.text2,
      fontFamily: "'Outfit', sans-serif", letterSpacing: "0.02em",
    }}>{label}</span>
  );
}

function StatCard({ label, value, sub, subColor, accent, icon }) {
  return (
    <div style={{
      background: T.bg2, border: `1px solid ${T.border}`,
      borderRadius: 12, padding: "16px 18px",
      borderTop: `3px solid ${accent || T.accent}`,
      transition: "box-shadow 0.15s",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>{label}</div>
        {icon && <span style={{ fontSize: 16, opacity: 0.5 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: T.text, fontFamily: "'Outfit', sans-serif", letterSpacing: "-1px", marginBottom: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: subColor || T.text3 }}>{sub}</div>}
    </div>
  );
}

function ProbabilityBar({ value, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: T.bg3, borderRadius: 3, overflow: "hidden", maxWidth: 80 }}>
        <div style={{ height: "100%", width: `${value}%`, background: color || (value >= 70 ? T.green : value >= 40 ? T.accent2 : T.text3), borderRadius: 3, transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: 11, color: T.text2, fontFamily: "'Outfit', sans-serif", fontWeight: 600, minWidth: 28 }}>{value}%</span>
    </div>
  );
}

// ─── VIEWS ────────────────────────────────────────────────────────────────────

function DashboardView({ currency, setView }) {
  const openDeals = DEALS.filter(d => d.stageIdx < 5);
  const wonDeals = DEALS.filter(d => d.stage === "Closed Won");
  const pipeline = openDeals.reduce((s, d) => s + d.value, 0);
  const won = wonDeals.reduce((s, d) => s + d.value, 0);
  const commit = DEALS.filter(d => d.category === "Commit").reduce((s, d) => s + d.value, 0);
  const quota = REPS.reduce((s, r) => s + r.quota, 0);
  const attain = Math.round((won / quota) * 100);

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.text, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.5px" }}>Sales Command Centre</div>
          <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>Q2 2025 · East Africa Region · All Countries</div>
        </div>
        <button onClick={() => setView("deals")} style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
          + Add Deal
        </button>
      </div>

      {/* KPI ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Pipeline" value={fmtCurrency(pipeline, currency)} sub={`${openDeals.length} active deals`} accent={T.accent} icon="📊" />
        <StatCard label="Revenue Won" value={fmtCurrency(won, currency)} sub={`${attain}% of team quota`} subColor={attain >= 60 ? T.green : T.accent3} accent={T.green} icon="✅" />
        <StatCard label="Commit Forecast" value={fmtCurrency(commit, currency)} sub="High-confidence deals" accent={T.blue} icon="🎯" />
        <StatCard label="Team Quota" value={fmtCurrency(quota, currency)} sub="5 reps · FY2025" accent={T.accent2} icon="👥" />
      </div>

      {/* MAIN 2-COL */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 16 }}>
        {/* PIPELINE HEALTH */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, fontSize: 13, fontFamily: "'Outfit', sans-serif", color: T.text }}>Pipeline by Stage</div>
            <span style={{ fontSize: 11, color: T.accent, cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }} onClick={() => setView("pipeline")}>View pipeline →</span>
          </div>
          {STAGES.slice(0, 5).map((stage, i) => {
            const stageDeals = DEALS.filter(d => d.stage === stage);
            const val = stageDeals.reduce((s, d) => s + d.value, 0);
            const maxVal = 500000;
            const w = Math.min((val / maxVal) * 100, 100);
            const colors = [T.text3, T.purple, T.blue, T.accent2, T.accent];
            return (
              <div key={stage} style={{ padding: "12px 18px", borderBottom: i < 4 ? `1px solid ${T.border}` : "none", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 90, fontSize: 11, color: T.text2, fontFamily: "'Outfit', sans-serif", flexShrink: 0 }}>{stage}</div>
                <div style={{ flex: 1, height: 8, background: T.bg3, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${w}%`, background: colors[i], borderRadius: 4, transition: "width 0.5s" }} />
                </div>
                <div style={{ width: 80, textAlign: "right", fontSize: 12, fontWeight: 700, color: T.text, fontFamily: "'Outfit', sans-serif" }}>{fmtCurrency(val, currency)}</div>
                <div style={{ width: 24, textAlign: "right", fontSize: 11, color: T.text3 }}>{stageDeals.length}</div>
              </div>
            );
          })}
        </div>

        {/* ACTIVITY */}
        <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 13, fontFamily: "'Outfit', sans-serif", color: T.text }}>Recent Activity</div>
          {ACTIVITIES.map((a, i) => (
            <div key={i} style={{ padding: "10px 14px", borderBottom: i < ACTIVITIES.length - 1 ? `1px solid ${T.border}` : "none", display: "flex", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, marginTop: 5, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, color: T.text, lineHeight: 1.4, marginBottom: 2 }}>{a.text}</div>
                <div style={{ fontSize: 10.5, color: T.text3 }}>{a.sub}</div>
              </div>
              <div style={{ fontSize: 10, color: T.text3, flexShrink: 0, marginTop: 2 }}>{a.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* REP PERFORMANCE */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 700, fontSize: 13, fontFamily: "'Outfit', sans-serif", color: T.text }}>Rep Performance vs Quota</div>
          <span style={{ fontSize: 11, color: T.accent, cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }} onClick={() => setView("team")}>Full team view →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0 }}>
          {REPS.map((r, i) => {
            const pct = Math.round(((r.won + r.commit * 0.8) / r.quota) * 100);
            return (
              <div key={r.id} style={{ padding: "14px 16px", borderRight: i < 4 ? `1px solid ${T.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Avatar initials={r.initials} color={r.color} size={28} />
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: T.text, fontFamily: "'Outfit', sans-serif" }}>{r.name.split(" ")[0]}</div>
                    <div style={{ fontSize: 10, color: T.text3 }}>{r.region}</div>
                  </div>
                </div>
                <div style={{ height: 4, background: T.bg3, borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                  <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: pct >= 70 ? T.green : pct >= 40 ? T.accent2 : T.accent3, borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: pct >= 70 ? T.green : pct >= 40 ? T.accent2 : T.accent3, fontFamily: "'Outfit', sans-serif" }}>{pct}% attained</div>
                <div style={{ fontSize: 10, color: T.text3, marginTop: 1 }}>{fmtCurrency(r.pipeline, currency)} pipeline</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProspectingView({ currency }) {
  const [filter, setFilter] = useState("All");
  const statuses = ["All", "Qualified", "Engaged", "Nurturing", "Cold"];
  const filtered = filter === "All" ? PROSPECTS : PROSPECTS.filter(p => p.status === filter);

  return (
    <div>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.text, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.3px" }}>Demand Generation & Prospects</div>
          <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>Track market engagement across East Africa</div>
        </div>
        <button style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
          + Add Prospect
        </button>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Prospects" value={PROSPECTS.length} sub="In active nurture" accent={T.accent} />
        <StatCard label="Qualified" value={PROSPECTS.filter(p => p.status === "Qualified").length} sub="Ready to progress" accent={T.green} />
        <StatCard label="Avg Score" value={Math.round(PROSPECTS.reduce((s,p)=>s+p.score,0)/PROSPECTS.length)} sub="Engagement score /100" accent={T.blue} />
        <StatCard label="Potential Value" value={fmtCurrency(820000, currency)} sub="Qualified pipeline est." accent={T.accent2} />
      </div>

      {/* FILTER */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: "5px 14px", borderRadius: 6, border: `1px solid ${filter === s ? T.accent : T.border}`,
            background: filter === s ? T.accent : T.bg2, color: filter === s ? "#fff" : T.text2,
            fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 500, cursor: "pointer"
          }}>{s}</button>
        ))}
      </div>

      {/* TABLE */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["Company", "Country", "Contact", "Sector", "Source", "Score", "Status", "Last Touch", "Notes"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.08em", color: T.text3, fontFamily: "'Outfit', sans-serif", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none", cursor: "pointer" }}>
                <td style={{ padding: "11px 14px", color: T.text, fontWeight: 700, fontFamily: "'Outfit', sans-serif", fontSize: 12.5 }}>{p.company}</td>
                <td style={{ padding: "11px 14px" }}><span style={{ fontSize: 16 }}>{countryFlag(p.country)}</span></td>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ color: T.text, fontWeight: 500 }}>{p.contact}</div>
                  <div style={{ color: T.text3, fontSize: 10.5 }}>{p.title}</div>
                </td>
                <td style={{ padding: "11px 14px" }}><Badge label={p.sector} color={T.blue} /></td>
                <td style={{ padding: "11px 14px", color: T.text2 }}>{p.source}</td>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: scoreColor(p.score) + "18", border: `2px solid ${scoreColor(p.score)}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: scoreColor(p.score), fontFamily: "'Outfit', sans-serif" }}>{p.score}</div>
                  </div>
                </td>
                <td style={{ padding: "11px 14px" }}><Badge label={p.status} color={statusColor(p.status)} /></td>
                <td style={{ padding: "11px 14px", color: T.text3, fontSize: 11 }}>{p.lastTouch}</td>
                <td style={{ padding: "11px 14px", color: T.text2, fontSize: 11, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PipelineView({ currency }) {
  const stages = STAGES.slice(0, 5);
  const stageColors = [T.text3, T.purple, T.blue, T.accent2, T.accent];

  return (
    <div>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.text, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.3px" }}>Deal Pipeline</div>
          <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>Build and progress deals across all stages</div>
        </div>
        <button style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>+ New Deal</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, overflowX: "auto" }}>
        {stages.map((stage, si) => {
          const stageDeals = DEALS.filter(d => d.stage === stage);
          const total = stageDeals.reduce((s, d) => s + d.value, 0);
          return (
            <div key={stage}>
              <div style={{ marginBottom: 10, padding: "0 2px" }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: stageColors[si], fontFamily: "'Outfit', sans-serif", fontWeight: 700, marginBottom: 2 }}>{stage}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.text, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.5px" }}>{fmtCurrency(total, currency)}</div>
                <div style={{ fontSize: 10.5, color: T.text3 }}>{stageDeals.length} deal{stageDeals.length !== 1 ? "s" : ""}</div>
              </div>
              {stageDeals.map(d => (
                <div key={d.id} style={{
                  background: T.bg2, border: `1px solid ${T.border}`,
                  borderRadius: 10, padding: "12px", marginBottom: 8,
                  borderLeft: `3px solid ${stageColors[si]}`,
                  cursor: "pointer", transition: "box-shadow 0.15s",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: "'Outfit', sans-serif", marginBottom: 3, lineHeight: 1.3 }}>{d.name}</div>
                  <div style={{ fontSize: 10.5, color: T.text2, marginBottom: 8 }}>{countryFlag(d.country)} {d.company}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: "'Outfit', sans-serif" }}>{fmtCurrency(d.value, currency)}</div>
                  </div>
                  <ProbabilityBar value={d.prob} />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                    <Badge label={d.vendor} color={T.text3} />
                    <Avatar initials={d.owner} color={stageColors[si]} size={22} />
                  </div>
                  {d.risk && <div style={{ marginTop: 8, fontSize: 10, color: T.accent3, background: T.accent3 + "10", padding: "3px 6px", borderRadius: 4, lineHeight: 1.3 }}>⚠ {d.risk}</div>}
                </div>
              ))}
              {stageDeals.length === 0 && (
                <div style={{ border: `1.5px dashed ${T.border2}`, borderRadius: 10, padding: "24px 12px", textAlign: "center", color: T.text3, fontSize: 11 }}>
                  No deals
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ForecastView({ currency }) {
  const [quarter, setQuarter] = useState("Q2 2025");
  const quota = 2350000;
  const won = DEALS.filter(d => d.stage === "Closed Won").reduce((s, d) => s + d.value, 0);
  const commitDeals = DEALS.filter(d => d.category === "Commit" && d.stage !== "Closed Won");
  const commit = commitDeals.reduce((s, d) => s + d.value, 0);
  const bestCaseDeals = DEALS.filter(d => d.category === "Best Case");
  const bestCase = won + commit * 0.9 + bestCaseDeals.reduce((s, d) => s + d.value, 0) * 0.6;
  const commitTotal = won + commit * 0.85;
  const pipelineDeals = DEALS.filter(d => d.category === "Pipeline");
  const pipeline = pipelineDeals.reduce((s, d) => s + d.value, 0);

  const bands = [
    { label: "Closed Won", val: won, color: T.green, pct: Math.round((won / quota) * 100), desc: "Signed & PO received" },
    { label: "Commit", val: commitTotal, color: T.blue, pct: Math.round((commitTotal / quota) * 100), desc: ">70% probability, forecast-committed" },
    { label: "Best Case", val: bestCase, color: T.accent, pct: Math.round((bestCase / quota) * 100), desc: "If all upside deals close" },
    { label: "Total Pipeline", val: won + commit + bestCaseDeals.reduce((s,d)=>s+d.value,0) + pipeline, color: T.accent2, pct: 0, desc: "All active opportunities" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.text, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.3px" }}>Revenue Forecast</div>
          <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>Degrees of accuracy — from closed to pipeline</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["Q1 2025", "Q2 2025", "Q3 2025"].map(q => (
            <button key={q} onClick={() => setQuarter(q)} style={{
              padding: "6px 12px", borderRadius: 7, border: `1px solid ${quarter === q ? T.accent : T.border}`,
              background: quarter === q ? T.accent + "12" : T.bg2, color: quarter === q ? T.accent : T.text2,
              fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: 500, cursor: "pointer"
            }}>{q}</button>
          ))}
        </div>
      </div>

      {/* FORECAST WATERFALL */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: T.text, fontFamily: "'Outfit', sans-serif", marginBottom: 20 }}>
          Forecast Confidence Bands — {quarter}
        </div>
        <div style={{ marginBottom: 20 }}>
          {bands.map((b, i) => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <div style={{ width: 100, fontSize: 11.5, fontWeight: 600, color: T.text, fontFamily: "'Outfit', sans-serif", flexShrink: 0 }}>{b.label}</div>
              <div style={{ flex: 1, position: "relative" }}>
                <div style={{ height: 10, background: T.bg3, borderRadius: 5 }}>
                  <div style={{ height: "100%", width: `${Math.min(b.pct || Math.round((b.val / (quota * 1.2)) * 100), 100)}%`, background: b.color, borderRadius: 5, transition: "width 0.6s ease" }} />
                </div>
              </div>
              <div style={{ width: 110, textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: b.color, fontFamily: "'Outfit', sans-serif" }}>{fmtCurrency(Math.round(b.val), currency)}</div>
              </div>
              <div style={{ width: 42, textAlign: "right", fontSize: 11, fontWeight: 700, color: b.pct >= 80 ? T.green : b.pct >= 50 ? T.accent2 : T.text3, fontFamily: "'Outfit', sans-serif" }}>
                {b.pct ? b.pct + "%" : "—"}
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 1, background: T.border, marginBottom: 14 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 12, color: T.text2 }}>Quota Target:</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text, fontFamily: "'Outfit', sans-serif" }}>{fmtCurrency(quota, currency)}</div>
          <div style={{ marginLeft: "auto", fontSize: 11.5, color: T.text3 }}>
            Gap to commit: <span style={{ fontWeight: 700, color: T.accent3 }}>{fmtCurrency(quota - commitTotal, currency)}</span>
          </div>
        </div>
      </div>

      {/* DEAL-LEVEL FORECAST */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {["Commit", "Best Case"].map(cat => {
          const catDeals = DEALS.filter(d => d.category === cat && d.stageIdx < 5);
          return (
            <div key={cat} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "13px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: cat === "Commit" ? T.blue : T.accent }} />
                <div style={{ fontWeight: 700, fontSize: 12.5, color: T.text, fontFamily: "'Outfit', sans-serif" }}>{cat} Deals</div>
                <div style={{ marginLeft: "auto", fontWeight: 800, fontSize: 13, color: cat === "Commit" ? T.blue : T.accent, fontFamily: "'Outfit', sans-serif" }}>
                  {fmtCurrency(catDeals.reduce((s,d)=>s+d.value,0), currency)}
                </div>
              </div>
              {catDeals.map((d, i) => (
                <div key={d.id} style={{ padding: "11px 16px", borderBottom: i < catDeals.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: "'Outfit', sans-serif" }}>{d.name}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: T.text, fontFamily: "'Outfit', sans-serif" }}>{fmtCurrency(d.value, currency)}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14 }}>{countryFlag(d.country)}</span>
                    <span style={{ fontSize: 10.5, color: T.text2 }}>{d.company}</span>
                    <span style={{ fontSize: 10.5, color: T.text3, marginLeft: "auto" }}>Close: {d.closeDate}</span>
                  </div>
                  <div style={{ marginTop: 6 }}><ProbabilityBar value={d.prob} /></div>
                  {d.risk && <div style={{ marginTop: 6, fontSize: 10, color: T.accent3 }}>⚠ {d.risk}</div>}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* REP FORECAST TABLE */}
      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "13px 18px", borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 12.5, color: T.text, fontFamily: "'Outfit', sans-serif" }}>Rep-level Forecast Submission</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["Rep", "Region", "Quota", "Won", "Commit", "Best Case", "Pipeline", "Gap"].map(h => (
                <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.07em", color: T.text3, fontFamily: "'Outfit', sans-serif", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REPS.map((r, i) => {
              const gap = r.quota - r.won - r.commit * 0.85;
              return (
                <tr key={r.id} style={{ borderBottom: i < REPS.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar initials={r.initials} color={r.color} size={26} />
                      <div style={{ fontWeight: 700, color: T.text, fontFamily: "'Outfit', sans-serif", fontSize: 12 }}>{r.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: "11px 14px", color: T.text2 }}>{r.region}</td>
                  <td style={{ padding: "11px 14px", fontWeight: 700, color: T.text, fontFamily: "'Outfit', sans-serif" }}>{fmtCurrency(r.quota, currency)}</td>
                  <td style={{ padding: "11px 14px", fontWeight: 700, color: T.green, fontFamily: "'Outfit', sans-serif" }}>{fmtCurrency(r.won, currency)}</td>
                  <td style={{ padding: "11px 14px", fontWeight: 700, color: T.blue, fontFamily: "'Outfit', sans-serif" }}>{fmtCurrency(r.commit, currency)}</td>
                  <td style={{ padding: "11px 14px", color: T.accent, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>{fmtCurrency(r.pipeline * 0.5, currency)}</td>
                  <td style={{ padding: "11px 14px", color: T.accent2, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>{fmtCurrency(r.pipeline, currency)}</td>
                  <td style={{ padding: "11px 14px", fontWeight: 700, color: gap > 0 ? T.accent3 : T.green, fontFamily: "'Outfit', sans-serif" }}>{fmtCurrency(Math.abs(Math.round(gap)), currency)} {gap > 0 ? "↓" : "✓"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DealsView({ currency }) {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Open", "Closed Won", "Closed Lost"];
  const filtered = filter === "All" ? DEALS : filter === "Open" ? DEALS.filter(d => d.stageIdx < 5) : DEALS.filter(d => d.stage === filter);

  return (
    <div>
      <div style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.text, fontFamily: "'Outfit', sans-serif" }}>All Deals</div>
          <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>Full deal register with closing playbook</div>
        </div>
        <button style={{ background: T.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>+ New Deal</button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "5px 14px", borderRadius: 6, border: `1px solid ${filter === f ? T.accent : T.border}`,
            background: filter === f ? T.accent : T.bg2, color: filter === f ? "#fff" : T.text2,
            fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 500, cursor: "pointer"
          }}>{f}</button>
        ))}
      </div>

      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["Deal", "Company", "Value", "Stage", "Prob", "Category", "Owner", "Close Date", "Vendor", "Risk"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.07em", color: T.text3, fontFamily: "'Outfit', sans-serif", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => {
              const catColors = { Commit: T.blue, "Best Case": T.accent, Pipeline: T.accent2, Closed: T.text3 };
              return (
                <tr key={d.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none", cursor: "pointer" }}>
                  <td style={{ padding: "11px 14px" }}>
                    <div style={{ fontWeight: 700, color: T.text, fontFamily: "'Outfit', sans-serif" }}>{d.name}</div>
                    {d.daysOpen > 0 && <div style={{ fontSize: 10, color: d.daysOpen > 45 ? T.accent3 : T.text3, marginTop: 1 }}>{d.daysOpen}d open</div>}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ fontSize: 14 }}>{countryFlag(d.country)}</span> <span style={{ color: T.text2 }}>{d.company}</span>
                  </td>
                  <td style={{ padding: "11px 14px", fontWeight: 800, color: T.text, fontFamily: "'Outfit', sans-serif" }}>{fmtCurrency(d.value, currency)}</td>
                  <td style={{ padding: "11px 14px" }}><Badge label={d.stage} color={d.stage === "Closed Won" ? T.green : d.stage === "Closed Lost" ? T.accent3 : T.blue} /></td>
                  <td style={{ padding: "11px 14px" }}><ProbabilityBar value={d.prob} /></td>
                  <td style={{ padding: "11px 14px" }}><Badge label={d.category} color={catColors[d.category]} /></td>
                  <td style={{ padding: "11px 14px" }}><Avatar initials={d.owner} color={T.accent} size={26} /></td>
                  <td style={{ padding: "11px 14px", color: T.text2, fontSize: 11 }}>{d.closeDate}</td>
                  <td style={{ padding: "11px 14px" }}><Badge label={d.vendor} color={T.purple} /></td>
                  <td style={{ padding: "11px 14px", color: T.accent3, fontSize: 11, maxWidth: 120 }}>{d.risk || <span style={{ color: T.text3 }}>—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TeamView({ currency }) {
  const quota = REPS.reduce((s, r) => s + r.quota, 0);
  const pipeline = REPS.reduce((s, r) => s + r.pipeline, 0);
  const won = REPS.reduce((s, r) => s + r.won, 0);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: T.text, fontFamily: "'Outfit', sans-serif" }}>Team Performance</div>
        <div style={{ fontSize: 12, color: T.text3, marginTop: 2 }}>BDM quota attainment, pipeline health & activity</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Team Quota" value={fmtCurrency(quota, currency)} sub="5 BDMs · FY2025" accent={T.accent} />
        <StatCard label="Won This Quarter" value={fmtCurrency(won, currency)} sub={`${Math.round((won/quota)*100)}% attainment`} accent={T.green} />
        <StatCard label="Active Pipeline" value={fmtCurrency(pipeline, currency)} sub="Across all reps" accent={T.blue} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: 10 }}>
        {REPS.map(r => {
          const pct = Math.round(((r.won + r.commit * 0.8) / r.quota) * 100);
          const repDeals = DEALS.filter(d => d.owner === r.initials && d.stageIdx < 5);
          return (
            <div key={r.id} style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 20px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 20, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar initials={r.initials} color={r.color} size={40} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: T.text, fontFamily: "'Outfit', sans-serif" }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: T.text3 }}>{r.role} · {r.region}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {[
                  { l: "Quota", v: fmtCurrency(r.quota, currency), c: T.text },
                  { l: "Won", v: fmtCurrency(r.won, currency), c: T.green },
                  { l: "Commit", v: fmtCurrency(r.commit, currency), c: T.blue },
                  { l: "Pipeline", v: fmtCurrency(r.pipeline, currency), c: T.accent2 },
                ].map(({ l, v, c }) => (
                  <div key={l}>
                    <div style={{ fontSize: 10, color: T.text3, textTransform: "uppercase", letterSpacing: "0.07em", fontFamily: "'Outfit', sans-serif", fontWeight: 600, marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: c, fontFamily: "'Outfit', sans-serif" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: pct >= 70 ? T.green : pct >= 40 ? T.accent2 : T.accent3, fontFamily: "'Outfit', sans-serif", letterSpacing: "-1px" }}>{pct}%</div>
                <div style={{ fontSize: 10, color: T.text3, marginBottom: 6 }}>attainment</div>
                <div style={{ width: 100, height: 5, background: T.bg3, borderRadius: 3, overflow: "hidden", marginLeft: "auto" }}>
                  <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: pct >= 70 ? T.green : pct >= 40 ? T.accent2 : T.accent3, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 10.5, color: T.text3, marginTop: 4 }}>{repDeals.length} open deal{repDeals.length !== 1 ? "s" : ""}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("dashboard");
  const [currency, setCurrency] = useState("KES");

  const NAV = [
    { id: "dashboard", label: "Command Centre", icon: "◈", group: "Overview" },
    { id: "prospects", label: "Demand Gen", icon: "⬡", group: "Overview", badge: "6" },
    { id: "pipeline", label: "Pipeline", icon: "◎", group: "Sales", badge: "8" },
    { id: "deals", label: "Deals", icon: "△", group: "Sales" },
    { id: "forecast", label: "Forecast", icon: "◷", group: "Revenue" },
    { id: "team", label: "Team & Quota", icon: "◉", group: "Revenue" },
  ];

  const groups = [...new Set(NAV.map(n => n.group))];

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", background: T.bg, minHeight: "100vh", display: "grid", gridTemplateColumns: "220px 1fr", gridTemplateRows: "52px 1fr" }}>
      {/* TOPBAR */}
      <div style={{ gridColumn: "1 / -1", background: T.bg2, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 16, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: T.accent, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff" }}>SI</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: T.text, letterSpacing: "-0.3px" }}>SalesForce EA</div>
            <div style={{ fontSize: 9.5, color: T.text3, letterSpacing: "0.05em", textTransform: "uppercase" }}>East Africa · Systems Integrator</div>
          </div>
        </div>

        {/* CURRENCY SWITCHER */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {Object.keys(CURRENCIES).map(c => (
            <button key={c} onClick={() => setCurrency(c)} style={{
              padding: "4px 10px", borderRadius: 5, border: `1px solid ${currency === c ? T.accent : T.border}`,
              background: currency === c ? T.accent : "transparent", color: currency === c ? "#fff" : T.text3,
              fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600, cursor: "pointer"
            }}>{c}</button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 8 }}>
          <div style={{ fontSize: 12, color: T.text2 }}>Q2 2025</div>
          <Avatar initials="JM" color={T.accent} size={30} />
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: T.text }}>James Mwangi</div>
            <div style={{ fontSize: 10, color: T.text3 }}>Sales Director</div>
          </div>
        </div>
      </div>

      {/* SIDEBAR */}
      <div style={{ background: T.bg2, borderRight: `1px solid ${T.border}`, padding: "16px 0", overflowY: "auto" }}>
        {groups.map(group => (
          <div key={group} style={{ marginBottom: 8 }}>
            <div style={{ padding: "0 16px", marginBottom: 4, fontSize: 9.5, letterSpacing: "0.1em", color: T.text3, textTransform: "uppercase", fontWeight: 700 }}>{group}</div>
            {NAV.filter(n => n.group === group).map(item => (
              <div key={item.id} onClick={() => setView(item.id)} style={{
                display: "flex", alignItems: "center", gap: 9, padding: "8px 14px", margin: "0 8px",
                borderRadius: 8, cursor: "pointer",
                background: view === item.id ? T.accent + "12" : "transparent",
                color: view === item.id ? T.accent : T.text2,
                fontWeight: view === item.id ? 700 : 400,
                fontSize: 12.5, position: "relative",
                borderLeft: view === item.id ? `3px solid ${T.accent}` : "3px solid transparent",
                transition: "all 0.1s",
              }}>
                <span style={{ fontSize: 13, width: 16, textAlign: "center" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && <span style={{ background: T.accent, color: "#fff", fontSize: 9.5, fontWeight: 700, padding: "1px 6px", borderRadius: 8 }}>{item.badge}</span>}
              </div>
            ))}
            <div style={{ height: 1, background: T.border, margin: "10px 12px" }} />
          </div>
        ))}

        {/* QUICK HEALTH WIDGET */}
        <div style={{ margin: "8px 10px", background: T.bg3, borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: T.text3, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Q2 Health</div>
          {[
            { l: "Win Rate", v: "38%", c: T.accent2 },
            { l: "Avg Deal", v: "KES 18.6M", c: T.blue },
            { l: "Cycle Days", v: "47d avg", c: T.teal },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 10.5, color: T.text3 }}>{l}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: c }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div style={{ padding: 24, overflowY: "auto", background: T.bg }}>
        {view === "dashboard" && <DashboardView currency={currency} setView={setView} />}
        {view === "prospects" && <ProspectingView currency={currency} />}
        {view === "pipeline" && <PipelineView currency={currency} />}
        {view === "forecast" && <ForecastView currency={currency} />}
        {view === "deals" && <DealsView currency={currency} />}
        {view === "team" && <TeamView currency={currency} />}
      </div>
    </div>
  );
}

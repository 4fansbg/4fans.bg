import { useState, useEffect } from "react";

// ── FOOTBALL API CONFIG ───────────────────────────────────────────────────────

const FOOTBALL_API_KEY = import.meta.env.VITE_FOOTBALL_API_KEY || "";

// League IDs on football-data.org
const LEAGUES = [
  { id: 2021, name: "Premier League",    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: 2001, name: "Champions League",  flag: "⭐" },
  { id: 2014, name: "La Liga",           flag: "🇪🇸" },
  { id: 2002, name: "Bundesliga",        flag: "🇩🇪" },
  { id: 2019, name: "Serie A",           flag: "🇮🇹" },
  { id: 2015, name: "Ligue 1",           flag: "🇫🇷" },
  { id: 2003, name: "Eredivisie",        flag: "🇳🇱" },
];

function generateProb() {
  const h = Math.floor(Math.random() * 50) + 20;
  const d = Math.floor(Math.random() * 30) + 10;
  const a = 100 - h - d;
  return { home: h, draw: d, away: Math.max(a, 5) };
}

async function fetchMatches() {
  const res = await fetch("/api/matches");
  const data = await res.json();
  return data.matches || [];
}

// Fallback matches if API fails
const FALLBACK_MATCHES = [
  { id:1, league:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", home:"Bournemouth", away:"Man United", date:"Mar 20", time:"22:00", prob:{home:30.5,draw:25.3,away:44.2} },
  { id:2, league:"Premier League", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", home:"Brighton", away:"Liverpool", date:"Mar 21", time:"14:30", prob:{home:31.1,draw:26.2,away:42.7} },
  { id:3, league:"Champions League", flag:"⭐", home:"Man City", away:"Real Madrid", date:"Mar 17", time:"22:00", prob:{home:67.1,draw:17.3,away:15.6} },
  { id:4, league:"Champions League", flag:"⭐", home:"Arsenal", away:"Leverkusen", date:"Mar 17", time:"22:00", prob:{home:75.7,draw:15.7,away:8.6} },
  { id:5, league:"La Liga", flag:"🇪🇸", home:"Barcelona", away:"Rayo Vallecano", date:"Mar 22", time:"15:00", prob:{home:78.1,draw:13.0,away:8.9} },
  { id:6, league:"La Liga", flag:"🇪🇸", home:"Real Madrid", away:"Atletico Madrid", date:"Mar 22", time:"22:00", prob:{home:49.7,draw:24.3,away:26.0} },
];

const VIP_PLANS = [
  { id:"starter", name:"Starter", price:9.99, period:"/ month", badge:null, features:["5 AI predictions/day","Basic match analysis","Email tips newsletter","Community access"] },
  { id:"pro", name:"PRO", price:24.99, period:"/ month", badge:"MOST POPULAR", features:["Unlimited AI predictions","Advanced bot analysis","Live odds tracking","VIP Telegram group","Priority support"] },
  { id:"elite", name:"Elite", price:59.99, period:"/ month", badge:null, features:["Everything in PRO","1-on-1 analyst sessions","Custom bet strategies","Early access to features","Exclusive PDF reports"] },
];

const SHOP_ITEMS = [
  { id:1, category:"Reports", name:"Weekly Prediction PDF", desc:"7-day forecast for all major leagues with AI confidence scores.", price:4.99, emoji:"📄", badge:null },
  { id:2, category:"Reports", name:"Monthly Stats Bundle", desc:"Full historical analysis + upcoming high-value bets for the month.", price:12.99, emoji:"📊", badge:"BESTSELLER" },
  { id:3, category:"Gear", name:"4Fans Cap", desc:"Premium embroidered cap. Bold logo. One size fits all.", price:24.99, emoji:"🧢", badge:null },
  { id:4, category:"Gear", name:"4Fans Jersey", desc:"Breathable sports jersey with 4Fans branding. Sizes S–XXL.", price:44.99, emoji:"👕", badge:"NEW" },
  { id:5, category:"Gear", name:"Scarf", desc:"Soft knitted scarf in team colours. Perfect for matchday.", price:19.99, emoji:"🧣", badge:null },
  { id:6, category:"Gear", name:"Water Bottle", desc:"1L insulated bottle with 4Fans logo. Keep hydrated on matchday.", price:14.99, emoji:"🍶", badge:null },
];

const NAV_ITEMS = ["Home","Bot","VIP","Shop","News"];

// ── HELPERS ───────────────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

function getBotPick(prob) {
  const max = Math.max(prob.home, prob.draw, prob.away);
  if (max === prob.home) return { pick:"home", pct:prob.home };
  if (max === prob.away) return { pick:"away", pct:prob.away };
  return { pick:"draw", pct:prob.draw };
}

function confidence(pct) {
  if (pct > 65) return { label:"HIGH", cls:"text-green-400 bg-green-400/10 border-green-400/30" };
  if (pct > 45) return { label:"MED",  cls:"text-orange-400 bg-orange-400/10 border-orange-400/30" };
  return           { label:"LOW",  cls:"text-red-400 bg-red-400/10 border-red-400/30" };
}

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function AdBanner({ slot }) {
  const ads = [
    { bg:"from-blue-900 to-blue-800", text:"🎰 Bet365 — Get 50% Welcome Bonus up to $200", cta:"Claim Now →" },
    { bg:"from-green-900 to-emerald-800", text:"🏆 William Hill — Bet £10 Get £30 Free Bets", cta:"Join Now →" },
    { bg:"from-purple-900 to-violet-800", text:"⚡ Unibet — Enhanced Odds on Today's Matches", cta:"See Odds →" },
  ];
  const ad = ads[slot % ads.length];
  return (
    <div className={`w-full rounded-xl bg-gradient-to-r ${ad.bg} border border-white/10 px-5 py-3 flex items-center justify-between gap-4 flex-wrap`}>
      <div className="flex items-center gap-3">
        <span style={{fontSize:"9px",color:"rgba(255,255,255,0.3)",border:"1px solid rgba(255,255,255,0.2)",padding:"1px 4px",borderRadius:"3px"}}>AD</span>
        <span style={{color:"white",fontSize:"12px",fontWeight:"bold"}}>{ad.text}</span>
      </div>
      <button style={{fontSize:"10px",fontWeight:"900",color:"white",background:"rgba(255,255,255,0.2)",padding:"6px 12px",borderRadius:"8px",border:"none",cursor:"pointer"}}>
        {ad.cta}
      </button>
    </div>
  );
}

function MatchCard({ match }) {
  const [analysed, setAnalysed] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [aiNote, setAiNote]     = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { pick, pct } = getBotPick(match.prob);
  const conf = confidence(pct);
  const pickLabel = pick === "home" ? match.home : pick === "away" ? match.away : "Draw";
  const odds = (100 / pct).toFixed(2);

  const analyse = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setAnalysed(true); }, 800);
  };

  const getAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Sharp 2-sentence football betting insight for: ${match.home} vs ${match.away} (${match.league}). Win probs: Home ${match.prob.home}%, Draw ${match.prob.draw}%, Away ${match.prob.away}%. Bot pick: ${pickLabel} @ ${odds}. Be direct and punchy.`
          }]
        })
      });
      const d = await res.json();
      setAiNote(d.content?.[0]?.text || "Insight unavailable.");
    } catch {
      setAiNote("AI insight unavailable. Check your API key in Vercel settings.");
    }
    setAiLoading(false);
  };

  return (
    <div style={{borderRadius:"16px",background:"#111827",border:"1px solid rgba(255,255,255,0.08)",overflow:"hidden",transition:"border-color 0.3s"}}>
      <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:"12px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:"10px",fontWeight:"900",letterSpacing:"0.15em",color:"#22c55e",textTransform:"uppercase"}}>{match.flag} {match.league}</span>
          <span style={{fontSize:"10px",color:"#64748b",fontFamily:"monospace"}}>{match.date} · {match.time}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <span style={{color:"white",fontWeight:"900",fontSize:"14px"}}>{match.home}</span>
          <span style={{fontSize:"10px",color:"#475569",background:"#1e293b",padding:"2px 8px",borderRadius:"4px",fontFamily:"monospace"}}>VS</span>
          <span style={{color:"white",fontWeight:"900",fontSize:"14px",textAlign:"right"}}>{match.away}</span>
        </div>
        <div>
          <div style={{display:"flex",borderRadius:"99px",overflow:"hidden",height:"6px",marginBottom:"4px"}}>
            <div style={{background:"#22c55e",width:`${match.prob.home}%`,transition:"width 0.5s"}}/>
            <div style={{background:"#475569",width:`${match.prob.draw}%`,transition:"width 0.5s"}}/>
            <div style={{background:"#3b82f6",width:`${match.prob.away}%`,transition:"width 0.5s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:"9px",fontWeight:"bold"}}>
            <span style={{color:"#22c55e"}}>{match.prob.home}%</span>
            <span style={{color:"#64748b"}}>{match.prob.draw}%</span>
            <span style={{color:"#3b82f6"}}>{match.prob.away}%</span>
          </div>
        </div>
        {!analysed ? (
          <button onClick={analyse} disabled={loading} style={{width:"100%",padding:"8px",borderRadius:"12px",fontSize:"11px",fontWeight:"900",letterSpacing:"0.15em",background:"rgba(34,197,94,0.1)",color:"#22c55e",border:"1px solid rgba(34,197,94,0.3)",cursor:"pointer",transition:"background 0.2s"}}>
            {loading ? "⚙ ANALYSING..." : "⚡ RUN BOT ANALYSIS"}
          </button>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            <div style={{borderRadius:"12px",background:"rgba(30,41,59,0.8)",border:"1px solid #334155",padding:"12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"6px"}}>
                <span style={{fontSize:"9px",color:"#94a3b8",letterSpacing:"0.15em",textTransform:"uppercase"}}>Bot Pick</span>
                <span style={{fontSize:"9px",fontWeight:"900",padding:"2px 8px",borderRadius:"4px",border:"1px solid",...Object.fromEntries(conf.cls.split(" ").map(c=>[c,c]))}}
                  className={conf.cls}>{conf.label}</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{color:"white",fontWeight:"900"}}>{pickLabel}</span>
                <span style={{color:"#22c55e",fontFamily:"monospace",fontSize:"14px",fontWeight:"bold"}}>@ {odds}</span>
              </div>
            </div>
            {!aiNote ? (
              <button onClick={getAI} disabled={aiLoading} style={{width:"100%",padding:"8px",borderRadius:"12px",fontSize:"11px",fontWeight:"900",letterSpacing:"0.15em",background:"rgba(139,92,246,0.1)",color:"#a78bfa",border:"1px solid rgba(139,92,246,0.3)",cursor:"pointer"}}>
                {aiLoading ? "● AI THINKING..." : "🤖 GET AI INSIGHT"}
              </button>
            ) : (
              <div style={{borderRadius:"12px",background:"rgba(76,29,149,0.2)",border:"1px solid rgba(109,40,217,0.3)",padding:"12px"}}>
                <span style={{fontSize:"9px",color:"#a78bfa",fontWeight:"bold",letterSpacing:"0.15em",textTransform:"uppercase",display:"block",marginBottom:"6px"}}>🤖 AI Analyst</span>
                <p style={{color:"#cbd5e1",fontSize:"11px",lineHeight:"1.6",margin:0}}>{aiNote}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── PAGES ─────────────────────────────────────────────────────────────────────

function HomePage({ setPage }) {
  return (
    <div>
      {/* HERO */}
      <section style={{minHeight:"90vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"40px 24px",position:"relative",overflow:"hidden",background:"linear-gradient(135deg,#0a0f1a,#0d1525,#0a0f1a)"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
        <div style={{position:"absolute",top:"40%",left:"50%",transform:"translate(-50%,-50%)",width:"600px",height:"600px",background:"rgba(34,197,94,0.08)",borderRadius:"50%",filter:"blur(100px)"}}/>
        <div style={{position:"relative",zIndex:1,maxWidth:"800px",display:"flex",flexDirection:"column",alignItems:"center",gap:"24px"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:"8px",background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:"99px",padding:"6px 16px",color:"#22c55e",fontSize:"11px",fontWeight:"900",letterSpacing:"0.2em"}}>
            <span style={{width:"6px",height:"6px",background:"#22c55e",borderRadius:"50%",animation:"pulse 2s infinite"}}/>
            LIVE AI PREDICTIONS ENGINE
          </div>
          <img src="/logo.png" alt="4Fans" style={{height:"clamp(120px,20vw,200px)",objectFit:"contain",filter:"drop-shadow(0 0 40px rgba(34,197,94,0.3))"}} />
          <p style={{color:"#94a3b8",fontSize:"clamp(14px,2vw,20px)",maxWidth:"560px",lineHeight:1.7,margin:0,fontWeight:300}}>
            AI-powered football predictions, VIP picks & sports gear — everything a true fan needs to win.
          </p>
          <div style={{display:"flex",gap:"12px",flexWrap:"wrap",justifyContent:"center"}}>
            <button onClick={()=>setPage("Bot")} style={{padding:"14px 32px",borderRadius:"16px",background:"linear-gradient(135deg,#22c55e,#dc2626)",color:"white",fontWeight:"900",fontSize:"13px",letterSpacing:"0.1em",border:"none",cursor:"pointer",boxShadow:"0 20px 60px rgba(34,197,94,0.3)"}}>
              ⚡ TRY THE BOT FREE
            </button>
            <button onClick={()=>setPage("VIP")} style={{padding:"14px 32px",borderRadius:"16px",background:"transparent",color:"white",fontWeight:"900",fontSize:"13px",letterSpacing:"0.1em",border:"1px solid rgba(255,255,255,0.2)",cursor:"pointer"}}>
              🏆 GET VIP ACCESS
            </button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"32px",marginTop:"24px"}}>
            {[["94%","Prediction Rate"],["50K+","Active Members"],["£2.4M","Won by Users"]].map(([v,l])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontSize:"28px",fontWeight:"900",color:"#22c55e"}}>{v}</div>
                <div style={{fontSize:"10px",color:"#475569",letterSpacing:"0.2em",textTransform:"uppercase"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{padding:"0 24px 16px"}}><AdBanner slot={0}/></div>

      {/* Features */}
      <section style={{padding:"64px 24px",background:"#0a0f1a"}}>
        <div style={{maxWidth:"960px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"48px"}}>
            <div style={{color:"#22c55e",fontSize:"10px",fontWeight:"900",letterSpacing:"0.3em",textTransform:"uppercase",marginBottom:"8px"}}>Why 4Fans</div>
            <h2 style={{color:"white",fontSize:"clamp(24px,4vw,36px)",fontWeight:"900",margin:0}}>Everything You Need to Win</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"16px"}}>
            {[
              {icon:"⚡",title:"AI Bot Predictions",desc:"Real-time match analysis across EPL, La Liga, Champions League and more.",btn:"Try Bot",page:"Bot"},
              {icon:"🏆",title:"VIP Daily Picks",desc:"Hand-picked high-confidence bets delivered daily to your inbox and Telegram.",btn:"Go VIP",page:"VIP"},
              {icon:"🛒",title:"Fan Shop",desc:"Official 4Fans gear — jerseys, caps, scarves and more. Show your colours.",btn:"Shop Now",page:"Shop"},
            ].map(f=>(
              <div key={f.title} style={{borderRadius:"16px",background:"#111827",border:"1px solid rgba(255,255,255,0.08)",padding:"24px",display:"flex",flexDirection:"column",gap:"12px"}}>
                <div style={{fontSize:"32px"}}>{f.icon}</div>
                <h3 style={{color:"white",fontWeight:"900",fontSize:"18px",margin:0}}>{f.title}</h3>
                <p style={{color:"#94a3b8",fontSize:"13px",lineHeight:1.6,margin:0,flex:1}}>{f.desc}</p>
                <button onClick={()=>setPage(f.page)} style={{color:"#22c55e",fontSize:"11px",fontWeight:"900",letterSpacing:"0.15em",background:"none",border:"none",cursor:"pointer",textAlign:"left",padding:0}}>
                  {f.btn} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div style={{padding:"0 24px 48px"}}><AdBanner slot={1}/></div>
    </div>
  );
}

function BotPage() {
  const [matches, setMatches]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter,  setFilter]    = useState("All");

  useEffect(() => {
    fetchMatches()
      .then(data => {
        setMatches(data.length > 0 ? data : FALLBACK_MATCHES);
        setLoading(false);
      })
      .catch(() => {
        setMatches(FALLBACK_MATCHES);
        setLoading(false);
      });
  }, []);

  const leagues = ["All", ...new Set(matches.map(m => m.league))];
  const filtered = filter === "All" ? matches : matches.filter(m => m.league === filter);

  return (
    <div style={{maxWidth:"960px",margin:"0 auto",padding:"40px 24px",display:"flex",flexDirection:"column",gap:"24px"}}>
      <div>
        <div style={{color:"#22c55e",fontSize:"10px",fontWeight:"900",letterSpacing:"0.3em",textTransform:"uppercase",marginBottom:"4px"}}>AI Engine</div>
        <h2 style={{color:"white",fontSize:"clamp(24px,4vw,36px)",fontWeight:"900",margin:"0 0 4px"}}>Match Predictions</h2>
        <p style={{color:"#64748b",fontSize:"13px",margin:0}}>Live data · Updates automatically every week · AI analyst</p>
      </div>
      <AdBanner slot={2}/>

      {/* League filter */}
      {!loading && (
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          {leagues.map(l => (
            <button key={l} onClick={() => setFilter(l)}
              style={{padding:"6px 14px",borderRadius:"10px",fontSize:"11px",fontWeight:"900",letterSpacing:"0.1em",textTransform:"uppercase",border:"none",cursor:"pointer",
                background: filter===l ? "#22c55e" : "#111827",
                color: filter===l ? "white" : "#94a3b8",
                transition:"all 0.2s"}}>
              {l}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"80px 0",gap:"16px"}}>
          <div style={{fontSize:"48px",animation:"spin 1s linear infinite"}}>⚽</div>
          <div style={{color:"#22c55e",fontWeight:"900",letterSpacing:"0.2em",fontSize:"12px"}}>LOADING LIVE MATCHES...</div>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"16px"}}>
          {filtered.map(m => <MatchCard key={m.id} match={m}/>)}
        </div>
      )}
      <AdBanner slot={0}/>
    </div>
  );
}

function VIPPage() {
  const [selected, setSelected] = useState(null);
  return (
    <div style={{maxWidth:"960px",margin:"0 auto",padding:"40px 24px",display:"flex",flexDirection:"column",gap:"40px"}}>
      <div style={{textAlign:"center"}}>
        <div style={{color:"#22c55e",fontSize:"10px",fontWeight:"900",letterSpacing:"0.3em",textTransform:"uppercase",marginBottom:"8px"}}>Join the Inner Circle</div>
        <h2 style={{color:"white",fontSize:"clamp(28px,5vw,48px)",fontWeight:"900",margin:"0 0 12px"}}>VIP Membership</h2>
        <p style={{color:"#94a3b8",maxWidth:"480px",margin:"0 auto",lineHeight:1.7,fontSize:"14px"}}>Unlock unlimited AI predictions, expert picks daily, and an exclusive community of winning bettors.</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:"20px",alignItems:"center"}}>
        {VIP_PLANS.map((plan,i)=>(
          <div key={plan.id} style={{position:"relative",borderRadius:"16px",background:"#111827",border:plan.badge?"1px solid rgba(34,197,94,0.6)":"1px solid rgba(255,255,255,0.08)",padding:"24px",display:"flex",flexDirection:"column",gap:"20px",transform:plan.badge?"scale(1.04)":"scale(1)",boxShadow:plan.badge?"0 20px 60px rgba(34,197,94,0.2)":"none"}}>
            {plan.badge&&<div style={{position:"absolute",top:"-12px",left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#22c55e,#dc2626)",color:"white",fontSize:"10px",fontWeight:"900",padding:"4px 12px",borderRadius:"99px",letterSpacing:"0.15em",whiteSpace:"nowrap"}}>{plan.badge}</div>}
            <div>
              <div style={{fontSize:"11px",color:"#94a3b8",fontWeight:"bold",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:"4px"}}>{plan.name}</div>
              <div style={{display:"flex",alignItems:"flex-end",gap:"4px"}}>
                <span style={{fontSize:"40px",fontWeight:"900",color:"white"}}>${plan.price}</span>
                <span style={{color:"#64748b",fontSize:"13px",marginBottom:"6px"}}>{plan.period}</span>
              </div>
            </div>
            <ul style={{listStyle:"none",margin:0,padding:0,display:"flex",flexDirection:"column",gap:"8px",flex:1}}>
              {plan.features.map(f=>(
                <li key={f} style={{display:"flex",alignItems:"center",gap:"8px",fontSize:"13px",color:"#cbd5e1"}}>
                  <span style={{color:"#22c55e",fontWeight:"900"}}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={()=>setSelected(plan)} style={{width:"100%",padding:"12px",borderRadius:"12px",fontWeight:"900",fontSize:"13px",letterSpacing:"0.1em",border:"none",cursor:"pointer",background:plan.badge?"linear-gradient(135deg,#22c55e,#dc2626)":"transparent",color:"white",borderWidth:plan.badge?0:1,borderStyle:"solid",borderColor:"rgba(255,255,255,0.2)"}}>
              GET {plan.name}
            </button>
          </div>
        ))}
      </div>
      {selected&&(
        <div onClick={()=>setSelected(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:"24px"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"#111827",border:"1px solid rgba(34,197,94,0.4)",borderRadius:"20px",padding:"32px",maxWidth:"380px",width:"100%",textAlign:"center",display:"flex",flexDirection:"column",gap:"16px"}}>
            <div style={{fontSize:"28px",fontWeight:"900",color:"white"}}>🏆 {selected.name} Plan</div>
            <p style={{color:"#94a3b8",fontSize:"13px",lineHeight:1.7,margin:0}}>To accept payments, connect <strong style={{color:"#22c55e"}}>Stripe</strong> or <strong style={{color:"#22c55e"}}>PayPal</strong> to your site. This is a one-time setup — ask a developer or contact 4Fans support.</p>
            <div style={{background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.3)",borderRadius:"12px",padding:"12px",color:"#22c55e",fontSize:"12px",fontWeight:"bold"}}>
              ${selected.price}/month · Cancel anytime
            </div>
            <button onClick={()=>setSelected(null)} style={{padding:"10px",borderRadius:"12px",border:"1px solid rgba(255,255,255,0.2)",color:"white",background:"transparent",cursor:"pointer",fontSize:"13px",fontWeight:"bold"}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShopPage() {
  const [cart, setCart]    = useState([]);
  const [category, setCat] = useState("All");
  const [toast, setToast]  = useState(null);
  const cats = ["All","Reports","Gear"];
  const filtered = category==="All" ? SHOP_ITEMS : SHOP_ITEMS.filter(i=>i.category===category);
  const addToCart = (item) => {
    setCart(c=>[...c,item]);
    setToast(item.name);
    setTimeout(()=>setToast(null),2000);
  };
  const total = cart.reduce((s,i)=>s+i.price,0).toFixed(2);

  return (
    <div style={{maxWidth:"960px",margin:"0 auto",padding:"40px 24px",display:"flex",flexDirection:"column",gap:"24px"}}>
      {toast&&(
        <div style={{position:"fixed",top:"72px",right:"24px",zIndex:50,background:"#16a34a",color:"white",fontSize:"12px",fontWeight:"900",padding:"10px 16px",borderRadius:"12px",boxShadow:"0 10px 40px rgba(0,0,0,0.4)"}}>
          ✓ {toast} added!
        </div>
      )}
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",flexWrap:"wrap",gap:"16px"}}>
        <div>
          <div style={{color:"#22c55e",fontSize:"10px",fontWeight:"900",letterSpacing:"0.3em",textTransform:"uppercase",marginBottom:"4px"}}>Official Store</div>
          <h2 style={{color:"white",fontSize:"clamp(24px,4vw,36px)",fontWeight:"900",margin:0}}>4Fans Shop</h2>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:"12px",background:"#111827",border:"1px solid rgba(255,255,255,0.1)",borderRadius:"12px",padding:"10px 16px"}}>
          <span style={{fontSize:"20px"}}>🛒</span>
          <span style={{color:"white",fontWeight:"900",fontSize:"14px"}}>{cart.length} items</span>
          <span style={{color:"#22c55e",fontWeight:"900",fontSize:"14px"}}>${total}</span>
          {cart.length>0&&<button style={{background:"#22c55e",color:"white",fontSize:"10px",fontWeight:"900",padding:"4px 12px",borderRadius:"8px",border:"none",cursor:"pointer",letterSpacing:"0.1em"}}>CHECKOUT</button>}
        </div>
      </div>
      <AdBanner slot={1}/>
      <div style={{display:"flex",gap:"8px"}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setCat(c)} style={{padding:"8px 16px",borderRadius:"12px",fontSize:"11px",fontWeight:"900",letterSpacing:"0.15em",textTransform:"uppercase",border:"none",cursor:"pointer",background:category===c?"#22c55e":"#111827",color:category===c?"white":"#94a3b8",transition:"all 0.2s"}}>
            {c}
          </button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"16px"}}>
        {filtered.map(item=>(
          <div key={item.id} style={{borderRadius:"16px",background:"#111827",border:"1px solid rgba(255,255,255,0.08)",overflow:"hidden"}}>
            <div style={{height:"120px",background:"linear-gradient(135deg,#1e293b,#0f172a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"56px",position:"relative"}}>
              {item.emoji}
              {item.badge&&<span style={{position:"absolute",top:"10px",right:"10px",fontSize:"9px",fontWeight:"900",background:"#22c55e",color:"white",padding:"2px 8px",borderRadius:"99px"}}>{item.badge}</span>}
            </div>
            <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:"12px"}}>
              <div>
                <div style={{fontSize:"9px",color:"#475569",textTransform:"uppercase",letterSpacing:"0.2em",fontWeight:"bold",marginBottom:"4px"}}>{item.category}</div>
                <div style={{color:"white",fontWeight:"900",fontSize:"15px"}}>{item.name}</div>
                <div style={{color:"#94a3b8",fontSize:"12px",lineHeight:1.6,marginTop:"4px"}}>{item.desc}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{color:"#22c55e",fontWeight:"900",fontSize:"20px"}}>${item.price}</span>
                <button onClick={()=>addToCart(item)} style={{padding:"8px 16px",borderRadius:"10px",background:"rgba(34,197,94,0.1)",color:"#22c55e",border:"1px solid rgba(34,197,94,0.3)",fontSize:"11px",fontWeight:"900",letterSpacing:"0.1em",cursor:"pointer"}}>
                  ADD TO CART
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsPage() {
  const [email, setEmail]       = useState("");
  const [subscribed, setSub]    = useState(false);
  const posts = [
    { emoji:"⚽", tag:"PREVIEW", title:"Man City vs Real Madrid: Can City Avenge Last Season?", desc:"A deep dive into tonight's Champions League blockbuster. Our AI gives City a 67% chance — here's why.", date:"Mar 17, 2026", read:"3 min" },
    { emoji:"📊", tag:"ANALYSIS", title:"Barcelona's Perfect Form: 5 Wins in a Row", desc:"Barca have been unstoppable in La Liga. We break down the stats behind their 78% win probability.", date:"Mar 16, 2026", read:"4 min" },
    { emoji:"🔥", tag:"HOT PICK", title:"This Week's Top 3 Value Bets Revealed", desc:"Our AI bot flagged three high-edge bets this week. Historical hit rate on similar picks: 71%.", date:"Mar 15, 2026", read:"2 min" },
    { emoji:"🏆", tag:"GUIDE", title:"How to Use the Kelly Criterion for Smart Betting", desc:"Stop betting flat stakes. The Kelly strategy protects your bankroll and maximises long-term growth.", date:"Mar 14, 2026", read:"5 min" },
  ];
  return (
    <div style={{maxWidth:"960px",margin:"0 auto",padding:"40px 24px",display:"flex",flexDirection:"column",gap:"24px"}}>
      <div>
        <div style={{color:"#22c55e",fontSize:"10px",fontWeight:"900",letterSpacing:"0.3em",textTransform:"uppercase",marginBottom:"4px"}}>Latest</div>
        <h2 style={{color:"white",fontSize:"clamp(24px,4vw,36px)",fontWeight:"900",margin:0}}>News & Tips</h2>
      </div>
      <AdBanner slot={0}/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"16px"}}>
        {posts.map(p=>(
          <div key={p.title} style={{borderRadius:"16px",background:"#111827",border:"1px solid rgba(255,255,255,0.08)",overflow:"hidden",cursor:"pointer"}}>
            <div style={{height:"100px",background:"linear-gradient(135deg,#1e293b,#0f172a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"48px"}}>
              {p.emoji}
            </div>
            <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:"8px"}}>
              <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                <span style={{fontSize:"9px",fontWeight:"900",color:"#22c55e",background:"rgba(34,197,94,0.1)",border:"1px solid rgba(34,197,94,0.2)",padding:"2px 8px",borderRadius:"99px"}}>{p.tag}</span>
                <span style={{fontSize:"10px",color:"#475569"}}>{p.date} · {p.read} read</span>
              </div>
              <h3 style={{color:"white",fontWeight:"900",lineHeight:1.3,margin:0,fontSize:"15px"}}>{p.title}</h3>
              <p style={{color:"#94a3b8",fontSize:"12px",lineHeight:1.6,margin:0}}>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Newsletter */}
      <div style={{borderRadius:"20px",background:"linear-gradient(135deg,rgba(20,83,45,0.3),rgba(127,29,29,0.3))",border:"1px solid rgba(34,197,94,0.3)",padding:"40px",textAlign:"center",display:"flex",flexDirection:"column",gap:"16px",alignItems:"center"}}>
        <div style={{fontSize:"28px",fontWeight:"900",color:"white"}}>📧 Get Daily Tips Free</div>
        <p style={{color:"#94a3b8",fontSize:"14px",margin:0}}>Join 50,000+ fans getting AI predictions delivered every morning.</p>
        {!subscribed ? (
          <div style={{display:"flex",gap:"8px",maxWidth:"400px",width:"100%"}}>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"
              style={{flex:1,background:"#1e293b",border:"1px solid #334155",borderRadius:"12px",padding:"10px 16px",color:"white",fontSize:"14px",outline:"none"}}/>
            <button onClick={()=>{if(email)setSub(true)}} style={{padding:"10px 20px",borderRadius:"12px",background:"linear-gradient(135deg,#22c55e,#dc2626)",color:"white",fontWeight:"900",fontSize:"13px",border:"none",cursor:"pointer"}}>
              JOIN
            </button>
          </div>
        ) : (
          <div style={{color:"#4ade80",fontWeight:"900",fontSize:"18px"}}>✓ You're in! Check your inbox.</div>
        )}
      </div>
    </div>
  );
}

// ── APP SHELL ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage]     = useState("Home");
  const [menuOpen, setMenu] = useState(false);

  const renderPage = () => {
    if (page==="Home") return <HomePage setPage={setPage}/>;
    if (page==="Bot")  return <BotPage/>;
    if (page==="VIP")  return <VIPPage/>;
    if (page==="Shop") return <ShopPage/>;
    if (page==="News") return <NewsPage/>;
  };

  return (
    <div style={{minHeight:"100vh",background:"#0a0f1a",color:"white",fontFamily:"Georgia,serif"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{background:#0a0f1a}@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

      {/* NAV */}
      <nav style={{position:"sticky",top:0,zIndex:40,background:"rgba(8,12,20,0.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
        <div style={{maxWidth:"960px",margin:"0 auto",padding:"0 24px",height:"56px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <button onClick={()=>setPage("Home")} style={{background:"none",border:"none",cursor:"pointer",fontSize:"24px",fontWeight:"900"}}>
            <img src="/logo.png" alt="4Fans" style={{height:"36px",objectFit:"contain"}}/>
          </button>
          {/* Desktop */}
          <div style={{display:"flex",alignItems:"center",gap:"4px"}} className="desktop-nav">
            {NAV_ITEMS.map(n=>(
              <button key={n} onClick={()=>setPage(n)} style={{padding:"8px 16px",borderRadius:"12px",fontSize:"11px",fontWeight:"900",letterSpacing:"0.15em",textTransform:"uppercase",border:"none",cursor:"pointer",background:page===n?"rgba(34,197,94,0.1)":"transparent",color:page===n?"#22c55e":"#94a3b8",transition:"all 0.2s"}}>
                {n}
              </button>
            ))}
            <button onClick={()=>setPage("VIP")} style={{marginLeft:"12px",padding:"8px 16px",borderRadius:"12px",background:"linear-gradient(135deg,#22c55e,#dc2626)",color:"white",fontSize:"11px",fontWeight:"900",letterSpacing:"0.15em",border:"none",cursor:"pointer"}}>
              🏆 JOIN VIP
            </button>
          </div>
          {/* Mobile hamburger */}
          <button onClick={()=>setMenu(!menuOpen)} style={{display:"none",background:"none",border:"none",color:"white",fontSize:"20px",cursor:"pointer"}} className="mobile-menu-btn">
            {menuOpen?"✕":"☰"}
          </button>
        </div>
        {menuOpen&&(
          <div style={{borderTop:"1px solid rgba(255,255,255,0.08)",background:"rgba(8,12,20,0.98)",padding:"16px 24px",display:"flex",flexDirection:"column",gap:"8px"}}>
            {NAV_ITEMS.map(n=>(
              <button key={n} onClick={()=>{setPage(n);setMenu(false)}} style={{padding:"10px 16px",borderRadius:"12px",fontSize:"13px",fontWeight:"900",letterSpacing:"0.15em",textTransform:"uppercase",border:"none",cursor:"pointer",background:page===n?"rgba(34,197,94,0.1)":"transparent",color:page===n?"#22c55e":"#94a3b8",textAlign:"left"}}>
                {n}
              </button>
            ))}
            <button onClick={()=>{setPage("VIP");setMenu(false)}} style={{padding:"10px 16px",borderRadius:"12px",background:"linear-gradient(135deg,#22c55e,#dc2626)",color:"white",fontSize:"13px",fontWeight:"900",letterSpacing:"0.15em",border:"none",cursor:"pointer"}}>
              🏆 JOIN VIP
            </button>
          </div>
        )}
      </nav>

      <main>{renderPage()}</main>

      {/* FOOTER */}
      <footer style={{borderTop:"1px solid rgba(255,255,255,0.08)",background:"#080c14",padding:"40px 24px",marginTop:"40px"}}>
        <div style={{maxWidth:"960px",margin:"0 auto",display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:"24px"}}>
          <div>
            <div style={{fontSize:"24px",fontWeight:"900",marginBottom:"4px"}}><img src="/logo.png" alt="4Fans" style={{height:"36px",objectFit:"contain"}}/></div>
            <div style={{color:"#475569",fontSize:"12px"}}>AI-powered football predictions for true fans.</div>
          </div>
          <div style={{display:"flex",gap:"24px",flexWrap:"wrap"}}>
            {["Privacy Policy","Terms of Use","Contact","Responsible Gambling"].map(l=>(
              <span key={l} style={{color:"#475569",fontSize:"12px",cursor:"pointer"}}>{l}</span>
            ))}
          </div>
          <div style={{color:"#374151",fontSize:"11px",textAlign:"right"}}>
            © 2026 4Fans. For 18+ only.<br/>Gambling involves risk. Bet responsibly.
          </div>
        </div>
      </footer>
    </div>
  );
}

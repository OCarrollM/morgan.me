const { useState, useEffect } = React;

const STORAGE_KEY = "astro-roadmap-checks";

const initialChecks = {
  // Phase 1
  "msc-distinction": false,
  "aviation-medical": false,
  "ppl-start": false,
  "russian-start": false,
  "scuba-open-water": false,
  "fitness-routine": false,
  "esa-grad-apply": false,
  "space-sector-apply": false,
  "phd-research": false,
  "iac-attend": false,
  "raes-join": false,
  "bis-join": false,
  "stem-ambassador": false,
  // Phase 2
  "phd-or-work-decide": false,
  "space-job-secured": false,
  "ppl-completed": false,
  "night-rating": false,
  "russian-a2": false,
  "publish-paper": false,
  "iac-present": false,
  // Phase 3
  "3yr-experience": false,
  "scuba-advanced": false,
  "analog-mission": false,
  "public-talks": false,
  "russian-b1": false,
  "first-aid-cert": false,
  "nols-course": false,
  "200-flight-hours": false,
  "skydive-cert": false,
  // Phase 4
  "8yr-experience": false,
  "leadership-role": false,
  "russian-b2": false,
  "esa-apply": false,
  "commercial-apply": false,
};

function Checkbox({ id, label, checks, toggle }) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        cursor: "pointer",
        padding: "6px 0",
        fontSize: 13,
        lineHeight: 1.7,
        color: checks[id] ? "#5a6a7e" : "#c8d6e5",
        textDecoration: checks[id] ? "line-through" : "none",
        transition: "all 0.2s",
      }}
    >
      <input
        type="checkbox"
        checked={checks[id]}
        onChange={() => toggle(id)}
        style={{
          marginTop: 4,
          accentColor: "#00ff88",
          width: 16,
          height: 16,
          flexShrink: 0,
          cursor: "pointer",
        }}
      />
      <span>{label}</span>
    </label>
  );
}

function ProgressBar({ checks, keys, color }) {
  const done = keys.filter((k) => checks[k]).length;
  const pct = Math.round((done / keys.length) * 100);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#5a6a7e", marginBottom: 4, fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
        <span>{done}/{keys.length} COMPLETE</span>
        <span>{pct}%</span>
      </div>
      <div style={{ height: 4, background: "#1a2744", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: "#0d1220",
      border: "1px solid #1a2744",
      borderRadius: 8,
      padding: "20px 24px",
      marginBottom: 12,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Tag({ text, color }) {
  return (
    <span style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600, color, fontFamily: "'Space Mono', monospace" }}>
      {text}
    </span>
  );
}

function SectionHeader({ icon, title, years, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #1a2744" }}>
      <div style={{
        fontSize: 20, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: 10, background: `${color}22`, border: `1px solid ${color}44`, flexShrink: 0,
      }}>{icon}</div>
      <div>
        <h2 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color, margin: 0 }}>{title}</h2>
      </div>
      {years && <span style={{ fontSize: 11, color: "#5a6a7e", marginLeft: "auto", fontFamily: "'Space Mono', monospace", letterSpacing: 1, whiteSpace: "nowrap" }}>{years}</span>}
    </div>
  );
}

function H3({ children }) {
  return <h3 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 13, fontWeight: 600, color: "#e8f0f8", margin: "0 0 8px", letterSpacing: 0.5 }}>{children}</h3>;
}

function AstronautRoadmap() {
  const [checks, setChecks] = useState(initialChecks);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("roadmap");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setChecks((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      console.log("No saved data yet");
    }
    setLoaded(true);
  }, []);

  const toggle = (id) => {
    const next = { ...checks, [id]: !checks[id] };
    setChecks(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const totalDone = Object.values(checks).filter(Boolean).length;
  const totalItems = Object.keys(checks).length;
  const overallPct = Math.round((totalDone / totalItems) * 100);

  const phase1Keys = ["msc-distinction","aviation-medical","ppl-start","russian-start","scuba-open-water","fitness-routine","esa-grad-apply","space-sector-apply","phd-research","iac-attend","raes-join","bis-join","stem-ambassador"];
  const phase2Keys = ["phd-or-work-decide","space-job-secured","ppl-completed","night-rating","russian-a2","publish-paper","iac-present"];
  const phase3Keys = ["3yr-experience","scuba-advanced","analog-mission","public-talks","russian-b1","first-aid-cert","nols-course","200-flight-hours","skydive-cert"];
  const phase4Keys = ["8yr-experience","leadership-role","russian-b2","esa-apply","commercial-apply"];

  if (!loaded) return <div style={{ padding: 40, textAlign: "center", color: "#5a6a7e" }}>Loading roadmap...</div>;

  return (
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, lineHeight: 1.7, color: "#c8d6e5", background: "#0a0e17", minHeight: "100vh", padding: "24px 16px 60px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: 6, textTransform: "uppercase", color: "#00d4ff", marginBottom: 12, opacity: 0.8 }}>Mission Briefing // April 2026</div>
        <h1 style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "clamp(24px, 5vw, 44px)", fontWeight: 900, letterSpacing: 3, background: "linear-gradient(135deg, #00d4ff, #00ff88)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 12px" }}>ASTRONAUT ROADMAP</h1>
        <p style={{ fontSize: 13, color: "#5a6a7e", maxWidth: 500, margin: "0 auto 16px" }}>MSc Cyber Security → Spaceflight // Targeting ESA, NASA & Commercial</p>
        
        {/* Overall progress */}
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#00ff88", marginBottom: 4, fontFamily: "'Space Mono', monospace" }}>
            <span>OVERALL PROGRESS</span>
            <span>{totalDone}/{totalItems} — {overallPct}%</span>
          </div>
          <div style={{ height: 6, background: "#1a2744", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${overallPct}%`, background: "linear-gradient(90deg, #00d4ff, #00ff88)", borderRadius: 3, transition: "width 0.4s" }} />
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { id: "roadmap", label: "Roadmap" },
          { id: "local", label: "Near Lancaster" },
          { id: "fitness", label: "Fitness" },
          { id: "networking", label: "Networking" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 11,
              letterSpacing: 1,
              textTransform: "uppercase",
              padding: "8px 16px",
              border: activeTab === t.id ? "1px solid #00d4ff" : "1px solid #1a2744",
              background: activeTab === t.id ? "#00d4ff18" : "#0d1220",
              color: activeTab === t.id ? "#00d4ff" : "#5a6a7e",
              borderRadius: 6,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* ROADMAP TAB */}
      {activeTab === "roadmap" && (
        <>
          {/* Phase 1 */}
          <div style={{ marginBottom: 40 }}>
            <SectionHeader icon="🎯" title="Phase 1 — Complete & Position" years="2026 (NOW)" color="#00d4ff" />
            <ProgressBar checks={checks} keys={phase1Keys} color="#00d4ff" />
            <Card>
              <Tag text="IMMEDIATE ACTIONS" color="#ff4455" />
              <div style={{ marginTop: 12 }}>
                <Checkbox id="msc-distinction" label="Complete MSc with distinction-level dissertation (CubeSat thermal management)" checks={checks} toggle={toggle} />
                <Checkbox id="aviation-medical" label="Book a Class 2 aviation medical examination (required for ESA application)" checks={checks} toggle={toggle} />
                <Checkbox id="ppl-start" label="Begin Private Pilot Licence (PPL) training" checks={checks} toggle={toggle} />
                <Checkbox id="russian-start" label="Start daily Russian language study (app + weekly tutor)" checks={checks} toggle={toggle} />
                <Checkbox id="scuba-open-water" label="Get PADI Open Water SCUBA certification" checks={checks} toggle={toggle} />
                <Checkbox id="fitness-routine" label="Establish consistent fitness routine (cardio + strength + swimming)" checks={checks} toggle={toggle} />
              </div>
            </Card>
            <Card>
              <Tag text="CAREER & COMMUNITY" color="#ffaa00" />
              <div style={{ marginTop: 12 }}>
                <Checkbox id="esa-grad-apply" label="Apply to ESA Graduate Trainee / Young Professional positions" checks={checks} toggle={toggle} />
                <Checkbox id="space-sector-apply" label="Apply to space-sector roles (SSTL, Airbus D&S, RAL Space, UK Space Agency)" checks={checks} toggle={toggle} />
                <Checkbox id="phd-research" label="Research PhD programmes in space systems / space cybersecurity" checks={checks} toggle={toggle} />
                <Checkbox id="iac-attend" label="Attend the International Astronautical Congress (IAC)" checks={checks} toggle={toggle} />
                <Checkbox id="raes-join" label="Join the Royal Aeronautical Society (RAeS)" checks={checks} toggle={toggle} />
                <Checkbox id="bis-join" label="Join the British Interplanetary Society (BIS)" checks={checks} toggle={toggle} />
                <Checkbox id="stem-ambassador" label="Register as a STEM Ambassador" checks={checks} toggle={toggle} />
              </div>
            </Card>
          </div>

          {/* Phase 2 */}
          <div style={{ marginBottom: 40 }}>
            <SectionHeader icon="🔧" title="Phase 2 — Build the Foundation" years="2026–2029" color="#00ff88" />
            <ProgressBar checks={checks} keys={phase2Keys} color="#00ff88" />
            <Card>
              <div>
                <Checkbox id="phd-or-work-decide" label="Make the PhD vs. workforce decision and commit" checks={checks} toggle={toggle} />
                <Checkbox id="space-job-secured" label="Secure employment in the space sector" checks={checks} toggle={toggle} />
                <Checkbox id="ppl-completed" label="Complete PPL — licensed private pilot" checks={checks} toggle={toggle} />
                <Checkbox id="night-rating" label="Obtain Night Rating or Instrument Rating" checks={checks} toggle={toggle} />
                <Checkbox id="russian-a2" label="Reach Russian A2 level (basic conversational)" checks={checks} toggle={toggle} />
                <Checkbox id="publish-paper" label="Publish a paper in a space-relevant field" checks={checks} toggle={toggle} />
                <Checkbox id="iac-present" label="Present at IAC or equivalent conference" checks={checks} toggle={toggle} />
              </div>
            </Card>
          </div>

          {/* Phase 3 */}
          <div style={{ marginBottom: 40 }}>
            <SectionHeader icon="🚀" title="Phase 3 — Accumulate & Differentiate" years="2029–2033" color="#ffaa00" />
            <ProgressBar checks={checks} keys={phase3Keys} color="#ffaa00" />
            <Card>
              <div>
                <Checkbox id="3yr-experience" label="Reach 3+ years professional experience (ESA minimum)" checks={checks} toggle={toggle} />
                <Checkbox id="scuba-advanced" label="PADI Advanced Open Water + Rescue Diver certification" checks={checks} toggle={toggle} />
                <Checkbox id="analog-mission" label="Complete an analogue mission (MDRS, CHAPEA, HI-SEAS, or similar)" checks={checks} toggle={toggle} />
                <Checkbox id="public-talks" label="Build public outreach profile — regular talks at schools & events" checks={checks} toggle={toggle} />
                <Checkbox id="russian-b1" label="Reach Russian B1 level (intermediate)" checks={checks} toggle={toggle} />
                <Checkbox id="first-aid-cert" label="Advanced first aid / wilderness medicine certification" checks={checks} toggle={toggle} />
                <Checkbox id="nols-course" label="Complete NOLS or equivalent outdoor leadership course" checks={checks} toggle={toggle} />
                <Checkbox id="200-flight-hours" label="Accumulate 200+ flight hours" checks={checks} toggle={toggle} />
                <Checkbox id="skydive-cert" label="Parachute/skydiving qualification" checks={checks} toggle={toggle} />
              </div>
            </Card>
          </div>

          {/* Phase 4 */}
          <div style={{ marginBottom: 40 }}>
            <SectionHeader icon="⚡" title="Phase 4 — Peak Competitiveness" years="2033–2037" color="#aa66ff" />
            <ProgressBar checks={checks} keys={phase4Keys} color="#aa66ff" />
            <Card>
              <div>
                <Checkbox id="8yr-experience" label="Reach 8+ years progressively responsible technical work" checks={checks} toggle={toggle} />
                <Checkbox id="leadership-role" label="Hold a leadership role (team lead, project manager, or equivalent)" checks={checks} toggle={toggle} />
                <Checkbox id="russian-b2" label="Reach Russian B2 level (upper intermediate — ESA/NASA competitiveness)" checks={checks} toggle={toggle} />
                <Checkbox id="esa-apply" label="Apply to ESA astronaut selection (expected early-to-mid 2030s)" checks={checks} toggle={toggle} />
                <Checkbox id="commercial-apply" label="Apply to commercial / UK national astronaut opportunities" checks={checks} toggle={toggle} />
              </div>
            </Card>
          </div>

          {/* Selection Windows */}
          <div style={{ marginBottom: 40 }}>
            <SectionHeader icon="🛰️" title="Key Selection Windows" color="#ff3388" />
            <Card style={{ border: "1px dashed #00d4ff44", background: "linear-gradient(135deg, #00d4ff08, #00ff8808)" }}>
              <H3>NASA — ~2028/2029</H3>
              <p style={{ fontSize: 13 }}>Every ~4 years. Requires US citizenship. Next expected ~2028.</p>
            </Card>
            <Card style={{ border: "1px dashed #00d4ff44", background: "linear-gradient(135deg, #00d4ff08, #00ff8808)" }}>
              <H3>ESA — Early-to-Mid 2030s</H3>
              <p style={{ fontSize: 13 }}>~13 year average gap. Last: 2022. Your strongest window as a UK citizen. You'd have PhD + 5-8yr experience by then.</p>
            </Card>
            <Card style={{ border: "1px dashed #00d4ff44", background: "linear-gradient(135deg, #00d4ff08, #00ff8808)" }}>
              <H3>Commercial / National — Ongoing</H3>
              <p style={{ fontSize: 13 }}>Axiom missions ~2x/year. UK has agreed Axiom flight slot. Axiom "Project Astronaut" training programme launched 2025.</p>
            </Card>
          </div>
        </>
      )}

      {/* LOCAL INFO TAB */}
      {activeTab === "local" && (
        <>
          <SectionHeader icon="📍" title="Near Lancaster — Practical Info" color="#00d4ff" />
          
          <Card>
            <Tag text="FLIGHT TRAINING — PPL" color="#00ff88" />
            <H3>Private Pilot Licence Options</H3>
            <p style={{ fontSize: 13, marginBottom: 12 }}>Your nearest options are at <strong style={{color:"#e8f0f8"}}>Blackpool Airport</strong> (~30 min from Lancaster), which has multiple CAA-approved flight schools. Expect £10,000–£15,000 total for a PPL, with training at ~£237–265/hr. Minimum 45 hours flying required (realistically 55-65hrs for most people). You can spread this over 6-18 months doing weekends.</p>
            <div style={{ background: "#0a0e17", borderRadius: 6, padding: 16, marginBottom: 8 }}>
              <p style={{ fontSize: 13, margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Flightpath Blackpool</strong> — PPL(A), Night Rating, IR(R). Friendly club atmosphere. <span style={{color:"#5a6a7e"}}>flightpathblackpool.co.uk</span></p>
              <p style={{ fontSize: 13, margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>North West Flight Training</strong> — PPL courses, intensive 4-8 week option available. <span style={{color:"#5a6a7e"}}>northwestflighttraining.co.uk</span></p>
              <p style={{ fontSize: 13, margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Westair Flying School</strong> — 75+ years established. Full PPL to CPL pathway. <span style={{color:"#5a6a7e"}}>westair.uk.com</span></p>
              <p style={{ fontSize: 13, margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>High-G Flight Training</strong> — CAA ATO, PPL, LAPL, Night Ratings. <span style={{color:"#5a6a7e"}}>high-g.co.uk</span></p>
              <p style={{ fontSize: 13, margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>LAC Flying School</strong> — City Airport Manchester (Barton), ~1hr from Lancaster. £237-265/hr. <span style={{color:"#5a6a7e"}}>lacflyingschool.co.uk</span></p>
            </div>
            <p style={{ fontSize: 12, color: "#5a6a7e" }}>Tip: Book a trial lesson (£119-165) at 2-3 schools before committing. The instructor relationship matters more than the school brand. You need a Class 2 medical before going solo — book this via a CAA Aeromedical Examiner (AME).</p>
          </Card>

          <Card>
            <Tag text="RUSSIAN LANGUAGE" color="#aa66ff" />
            <H3>Learning Russian Near Lancaster</H3>
            <p style={{ fontSize: 13, marginBottom: 12 }}>There's actually a dedicated Russian studies centre right in Lancaster. For the long-term goal of astronaut selection, you want to reach B1-B2 level over several years. Consistency beats intensity — 20-30 min/day with a weekly tutor session is ideal.</p>
            <div style={{ background: "#0a0e17", borderRadius: 6, padding: 16, marginBottom: 8 }}>
              <p style={{ fontSize: 13, margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Lancaster Centre for Russian Studies</strong> — Run by Maria, a qualified linguist from Moscow. One-to-one at £25/hr, group classes available. Near Lancaster train station. Also runs Russian culture classes.</p>
              <p style={{ fontSize: 13, margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Superprof / UKTutors</strong> — Multiple Russian tutors listed in the Lancaster area, from ~£25-35/hr. Options include native speakers with teaching qualifications.</p>
              <p style={{ fontSize: 13, margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Online (portable when you move)</strong> — italki (~£10-15/hr for native tutors), Duolingo (daily habit), Pimsleur (audio-focused, great for commutes), and the RT Russian course (free).</p>
            </div>
            <p style={{ fontSize: 12, color: "#5a6a7e" }}>Tip: Even NASA candidates who are selected are required to learn Russian during training. Those who can't reach intermediate-low fluency get disqualified. Starting now at a relaxed pace gives you years of runway. The Lancaster Centre for Russian Studies is a gem — an in-person group is far more motivating than solo app study.</p>
          </Card>

          <Card>
            <Tag text="SCUBA DIVING" color="#00d4ff" />
            <H3>PADI Certification Near Lancaster</H3>
            <p style={{ fontSize: 13, marginBottom: 12 }}>PADI Open Water certification takes ~4-5 days total (theory + confined water + 4 open water dives). Expect £300-500. You can do confined water (pool sessions) locally and open water dives in the Lake District lakes or Morecambe Bay area.</p>
            <div style={{ background: "#0a0e17", borderRadius: 6, padding: 16, marginBottom: 8 }}>
              <p style={{ fontSize: 13, margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Morecambe Area Divers</strong> — Based in Morecambe (~15 min from Lancaster). Equipment, training, and local dive coordination. <span style={{color:"#5a6a7e"}}>Specialise in NW England diving</span></p>
              <p style={{ fontSize: 13, margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Liverpool City Divers</strong> — Highly rated PADI centre, ~1.5hr from Lancaster. Pool facilities for confined water training.</p>
              <p style={{ fontSize: 13, margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Lake District open water sites</strong> — Coniston Water (max depth 56m, freshwater diving) is a popular PADI open water dive location. Also Windermere for training dives.</p>
              <p style={{ fontSize: 13, margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Alternatively</strong> — Complete theory + pool locally, then do your 4 open water dives somewhere warm (Egypt, Malta, Spain) on a trip. Many UK students do this.</p>
            </div>
            <p style={{ fontSize: 12, color: "#5a6a7e" }}>Tip: Get Open Water first, then work towards Advanced Open Water and eventually Rescue Diver. The deeper you go in SCUBA certifications, the more comfortable you'll be in NASA's Neutral Buoyancy Laboratory. Dry suits are essential for UK diving year-round.</p>
          </Card>
        </>
      )}

      {/* FITNESS TAB */}
      {activeTab === "fitness" && (
        <>
          <SectionHeader icon="💪" title="Physical Fitness Standards" color="#00ff88" />
          
          <Card>
            <Tag text="BODY MEASUREMENTS" color="#ffaa00" />
            <H3>Height, Weight & Medical</H3>
            <div style={{ fontSize: 13 }}>
              <p style={{ marginBottom: 12 }}><strong style={{color:"#e8f0f8"}}>Height:</strong> NASA requires 157-190cm (5'2"–6'3"). ESA requires 150-190cm. This is driven by spacecraft and spacesuit design — you need to fit in a Crew Dragon, Orion, or Soyuz seat.</p>
              <p style={{ marginBottom: 12 }}><strong style={{color:"#e8f0f8"}}>Weight/BMI:</strong> There is no specific weight limit published by NASA. ESA requires a BMI in the "normal" WHO range (18.5–24.9). In practice, you need to be fit and healthy — not underweight or significantly overweight. Astronauts exercise 2+ hours daily on the ISS. Think "functional athlete" not "bodybuilder".</p>
              <p style={{ marginBottom: 12 }}><strong style={{color:"#e8f0f8"}}>Blood pressure:</strong> Must not exceed 140/90 sitting. Aim to be well below this.</p>
              <p style={{ marginBottom: 12 }}><strong style={{color:"#e8f0f8"}}>Vision:</strong> Must be correctable to 20/20 in each eye. Glasses, contacts, and LASIK/PRK are all accepted (1 year wait after surgery).</p>
              <p><strong style={{color:"#e8f0f8"}}>Hearing:</strong> 25 dB or better per ear.</p>
            </div>
          </Card>

          <Card>
            <Tag text="SWIMMING" color="#00d4ff" />
            <H3>The Swim Test</H3>
            <div style={{ fontSize: 13 }}>
              <p style={{ marginBottom: 12 }}>During the first month of astronaut candidate training, you must pass this test:</p>
              <p style={{ marginBottom: 8, paddingLeft: 16, borderLeft: "2px solid #00d4ff44" }}>
                <strong style={{color:"#00d4ff"}}>Test 1:</strong> Swim 3 lengths of a 25m pool (75m) without stopping — in swimwear<br/>
                <strong style={{color:"#00d4ff"}}>Test 2:</strong> Swim 3 lengths (75m) in a flight suit and tennis shoes — no time limit<br/>
                <strong style={{color:"#00d4ff"}}>Test 3:</strong> Tread water continuously for 10 minutes in a flight suit
              </p>
              <p style={{ marginBottom: 8 }}>Permitted strokes: freestyle, breaststroke, or sidestroke.</p>
              <p><strong style={{color:"#e8f0f8"}}>Your target now:</strong> Be able to comfortably swim 400m+ without stopping. Work up to swimming in clothes. If you're not a confident swimmer, start with lessons — NASA astronaut Mike Massimino barely knew how to swim when selected. Lancaster University has a pool you can use.</p>
            </div>
          </Card>

          <Card>
            <Tag text="RECOMMENDED BENCHMARKS" color="#00ff88" />
            <H3>Fitness Targets (Not Official — But Competitive)</H3>
            <div style={{ fontSize: 13 }}>
              <p style={{ marginBottom: 12, color: "#5a6a7e" }}>NASA doesn't publish specific strength/endurance numbers for selection. But astronauts train like functional athletes. These are good long-term benchmarks based on astronaut training regimes:</p>
              
              <p style={{ marginBottom: 8 }}><strong style={{color:"#e8f0f8"}}>Running:</strong> 5K in under 25 min / 10K comfortably / Half-marathon capable. Astronauts on ISS run on treadmills daily. Tim Peake ran the London Marathon from the ISS.</p>
              <p style={{ marginBottom: 8 }}><strong style={{color:"#e8f0f8"}}>Swimming:</strong> 400m continuous without stopping. Comfortable in open water. Eventually, swimming with weight/clothing for extended periods.</p>
              <p style={{ marginBottom: 8 }}><strong style={{color:"#e8f0f8"}}>Strength:</strong> Functional compound lifts — deadlift, squat, bench press, overhead press. No specific weight targets, but aim for "intermediate" on strength standards for your bodyweight. EVA training in a pressurised suit for 6+ hours is extremely physically demanding — upper body endurance is crucial.</p>
              <p style={{ marginBottom: 8 }}><strong style={{color:"#e8f0f8"}}>Grip strength:</strong> Overlooked but critical. Spacewalk gloves are stiff and pressurised. Train grip endurance (dead hangs, farmer's carries).</p>
              <p style={{ marginBottom: 8 }}><strong style={{color:"#e8f0f8"}}>Flexibility:</strong> Spacesuits are restrictive. Yoga or mobility work helps.</p>
              <p><strong style={{color:"#e8f0f8"}}>VO2 Max:</strong> Aim for "good" to "excellent" range (45+ ml/kg/min for your age). Astronauts are tested on this regularly.</p>
            </div>
          </Card>

          <Card>
            <Tag text="WEEKLY ROUTINE TEMPLATE" color="#aa66ff" />
            <H3>Sample Training Week</H3>
            <div style={{ fontSize: 13 }}>
              <p style={{ margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Mon:</strong> Strength (upper body focus — pressing, pulling, grip work)</p>
              <p style={{ margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Tue:</strong> Run (5-10K steady or intervals)</p>
              <p style={{ margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Wed:</strong> Strength (lower body — squats, deadlifts, core)</p>
              <p style={{ margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Thu:</strong> Swim (400m+, practice endurance and different strokes)</p>
              <p style={{ margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Fri:</strong> Strength (full body, endurance focus — lighter weights, higher reps)</p>
              <p style={{ margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Sat:</strong> Active recovery — hike, cycle, yoga, rock climbing</p>
              <p style={{ margin: "4px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Sun:</strong> Rest</p>
              <p style={{ marginTop: 12, color: "#5a6a7e" }}>This is about building a sustainable lifelong habit. You have 7-10 years before prime selection windows. Consistency matters infinitely more than intensity.</p>
            </div>
          </Card>
        </>
      )}

      {/* NETWORKING TAB */}
      {activeTab === "networking" && (
        <>
          <SectionHeader icon="🌐" title="Networking with ESA & NASA" color="#aa66ff" />
          
          <Card>
            <Tag text="ESA" color="#00d4ff" />
            <H3>Getting on ESA's Radar</H3>
            <div style={{ fontSize: 13 }}>
              <p style={{ marginBottom: 12 }}>You've already applied for ESA Graduate Trainee positions — that's exactly right. Even if you don't get those roles, every application gets your name into ESA's system. Here's how to build deeper connections:</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>ESA Young Graduate Trainee (YGT) Programme</strong> — 1-year paid positions at ESA centres across Europe. Apply annually. Your cyber security + space combination is increasingly relevant to their needs. Positions open at ESTEC, ESOC, ESRIN, and EAC.</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>ESA Academy</strong> — Offers training sessions, workshops, and networking events for students and young professionals. Some are at the European Astronaut Centre in Cologne.</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Visit the European Astronaut Centre (EAC)</strong> — Public tours available in Cologne. If you're ever in Germany, go. Getting familiar with the campus and culture matters.</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>ESA Open Days</strong> — Held periodically at various ESA sites. Attend any you can.</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Dr. Rosemary Coogan</strong> — ESA career astronaut, UK national, astrophysicist. The most recent British ESA astronaut. Follow her work and public appearances. She may do events you can attend.</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>UK Space Agency events</strong> — They regularly host conferences, workshops, and networking. They're the bridge between UK professionals and ESA.</p>
            </div>
          </Card>

          <Card>
            <Tag text="NASA" color="#ffaa00" />
            <H3>NASA Connections (as a non-US citizen)</H3>
            <div style={{ fontSize: 13 }}>
              <p style={{ marginBottom: 12 }}>NASA requires US citizenship for its astronaut corps, but there are still valuable ways to connect:</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>NASA CHAPEA</strong> — Their Mars habitat simulation accepts non-NASA applicants. Requires US citizenship OR permanent residency, but watch for rule changes or international editions.</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Mars Society — MDRS</strong> — The Mars Desert Research Station in Utah is open to international researchers. Apply for a crew rotation. This is the most accessible analogue mission programme.</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>NASA Space Apps Challenge</strong> — Annual global hackathon. Participate and win local/global recognition. Lancaster may have a local hub.</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Publications</strong> — Publish in journals/conferences where NASA researchers are active. Co-authoring with NASA-adjacent researchers builds direct connections.</p>
            </div>
          </Card>

          <Card>
            <Tag text="INDUSTRY & COMMUNITY" color="#00ff88" />
            <H3>Professional Organisations & Events</H3>
            <div style={{ fontSize: 13 }}>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>International Astronautical Congress (IAC)</strong> — The single most important networking event in the space industry. Astronauts, agency directors, and industry leaders attend. 2026 location TBC. Student/YP registration is usually discounted. Present a paper if possible.</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Royal Aeronautical Society (RAeS)</strong> — UK's professional body for aerospace. Student membership available. Regular lectures, some featuring astronauts.</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>British Interplanetary Society (BIS)</strong> — The world's oldest space advocacy organisation. Based in London. Regular talks, journal publications, and strong community.</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>Space Generation Advisory Council (SGAC)</strong> — UN-affiliated space youth network. Runs events at IAC and globally. Excellent for meeting future colleagues in the space sector.</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>UK Space Conference</strong> — Biennial event by the UK Space Agency. The main UK gathering for space professionals.</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>SpaceOps Conference</strong> — Biennial conference on space operations. Perfect for your engineering/operations background.</p>
              <p style={{ margin: "6px 0" }}>▸ <strong style={{color:"#e8f0f8"}}>LinkedIn</strong> — Follow and engage with ESA astronauts, UK Space Agency staff, and space industry professionals. Thoughtful comments on their posts can open doors. Don't underestimate this.</p>
            </div>
          </Card>

          <Card>
            <Tag text="AT YOUR CURRENT STAGE" color="#ff3388" />
            <H3>What You Can Do Right Now</H3>
            <div style={{ fontSize: 13 }}>
              <p style={{ marginBottom: 12 }}>You're an MSc student with an active astronomy society presidency and space-relevant work. That's a stronger starting position than most people realise. Here's what's actionable today:</p>
              <p style={{ margin: "6px 0" }}>▸ Use your <strong style={{color:"#e8f0f8"}}>Astronomy Society</strong> to invite space industry speakers — this creates direct networking opportunities with minimal effort</p>
              <p style={{ margin: "6px 0" }}>▸ Reach out to <strong style={{color:"#e8f0f8"}}>Dr. Rosemary Coogan</strong> or ESA reserve astronauts <strong style={{color:"#e8f0f8"}}>Meganne Christian</strong> / <strong style={{color:"#e8f0f8"}}>John McFall</strong> for a talk at Lancaster — the worst they can say is no</p>
              <p style={{ margin: "6px 0" }}>▸ Apply to <strong style={{color:"#e8f0f8"}}>SGAC</strong> as a national point of contact for the UK — these are volunteer leadership roles that put you in direct contact with space agency representatives</p>
              <p style={{ margin: "6px 0" }}>▸ Publish your <strong style={{color:"#e8f0f8"}}>CubeSat dissertation work</strong> — even a short conference paper at a UK space event gets you into the community</p>
              <p style={{ margin: "6px 0" }}>▸ Attend the <strong style={{color:"#e8f0f8"}}>UK Students for the Exploration and Development of Space (UKSEDS)</strong> national conference — this is your peer group of future space professionals</p>
            </div>
          </Card>
        </>
      )}

      <div style={{ textAlign: "center", marginTop: 40, paddingTop: 24, borderTop: "1px solid #1a2744", fontSize: 11, color: "#5a6a7e", letterSpacing: 1 }}>
        <p>Generated <span style={{color:"#00d4ff"}}>04 April 2026</span> // Checkboxes persist across sessions</p>
        <p style={{ marginTop: 6 }}>Ad astra per aspera ✦</p>
      </div>
      </div>
    </div>
  );
}
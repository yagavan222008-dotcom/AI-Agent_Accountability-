import { DecisionRecord, Option, SystemStats } from '../types/decision';

// Helper to generate fake SHA-256 hashes
export const generateHash = (): string => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

// Helper to generate UUIDs
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const SCENARIOS = [
  {
    scenario: "Automated Credit Risk Assessment",
    model: "Claude 3.5 Sonnet",
    options: [
      { id: "OPT_01", desc: "Approve application with standard interest rate", score: 0.92 },
      { id: "OPT_02", desc: "Approve application with higher interest rate", score: 0.81 },
      { id: "OPT_03", desc: "Reject application due to high debt-to-income ratio", score: 0.25 }
    ],
    reasoning: "Applicant credit score is 740, representing low risk. However, debt-to-income is at 38%. Approved under standard rate as credit score offsets marginal income ratio. Option OPT_01 yields optimal risk-adjusted return."
  },
  {
    scenario: "Autonomous Database Failover",
    model: "Gemini 1.5 Pro",
    options: [
      { id: "OPT_01", desc: "Keep Primary DB active and await manual resolution", score: 0.15 },
      { id: "OPT_02", desc: "Perform immediate failover to Replica in us-east-2", score: 0.95 },
      { id: "OPT_03", desc: "Restart Primary database server container", score: 0.50 }
    ],
    reasoning: "Primary DB database connection pool has exhausted, and health check has failed for 3 consecutive intervals. Replica latency is <10ms and replication lag is 0. Immediate failover is required to prevent app outage."
  },
  {
    scenario: "Supply Chain Procurement Route",
    model: "GPT-4o",
    options: [
      { id: "OPT_01", desc: "Procure electronic components from Vendor A (Shenzhen)", score: 0.72 },
      { id: "OPT_02", desc: "Procure components from Vendor B (Vietnam)", score: 0.88 },
      { id: "OPT_03", desc: "Procure components from local distributor (USA)", score: 0.65 }
    ],
    reasoning: "Vendor A has lower cost but shipping delays are currently estimated at 14 days due to port congestion. Vendor B is 4% more expensive but guarantees 3-day lead time. Vendor B selected to maintain production schedule."
  },
  {
    scenario: "Intrusion Detection System Response",
    model: "GPT-4o-mini",
    options: [
      { id: "OPT_01", desc: "Log activity and continue monitoring network traffic", score: 0.35 },
      { id: "OPT_02", desc: "Add IP address 198.51.100.42 to firewall blocklist", score: 0.98 },
      { id: "OPT_03", desc: "Trigger alert notification to security operations team", score: 0.70 }
    ],
    reasoning: "IP address 198.51.100.42 was detected executing port scanning followed by 45 failed SSH login attempts in under 60 seconds. This is clear malicious behavior. Instant firewall ban is necessary."
  },
  {
    scenario: "High-Volume Email Dispatch Filter",
    model: "Claude 3 Haiku",
    options: [
      { id: "OPT_01", desc: "Deliver email directly to primary inbox", score: 0.18 },
      { id: "OPT_02", desc: "Mark email as spam and move to trash folder", score: 0.91 },
      { id: "OPT_03", desc: "Hold email in moderation queue for manual inspection", score: 0.40 }
    ],
    reasoning: "Email contains phishing keywords matching recent tax refund scams. Sender IP does not match SPF records for the claimed domain. High spam rating confirms spam bucket assignment."
  },
  {
    scenario: "Kubernetes Pod Scaling Decision",
    model: "Gemini 1.5 Flash",
    options: [
      { id: "OPT_01", desc: "Do not scale; ignore temporary CPU spikes", score: 0.20 },
      { id: "OPT_02", desc: "Scale deployment 'web-api' up by 3 replicas", score: 0.94 },
      { id: "OPT_03", desc: "Scale deployment 'web-api' up by 1 replica", score: 0.60 }
    ],
    reasoning: "Average CPU utilization across the 'web-api' deployment has remained above 85% for 4 minutes. Concurrent request queue is growing. Scaling up by 3 replicas resolves pressure quickly."
  },
  {
    scenario: "Smart Grid Power Distribution Adjust",
    model: "Claude 3.5 Sonnet",
    options: [
      { id: "OPT_01", desc: "Route excess power to regional battery bank storage", score: 0.89 },
      { id: "OPT_02", desc: "Reduce generator output to match lower demand", score: 0.40 },
      { id: "OPT_03", desc: "Sell excess solar generation back to secondary grid", score: 0.76 }
    ],
    reasoning: "Solar generation has peaked at 120% of forecasts while residential demand is low. Battery storage is at 45% capacity. Routing to batteries is the most cost-effective and green solution."
  }
];

export const generateMockDecisions = (count: number = 15): DecisionRecord[] => {
  const records: DecisionRecord[] = [];
  let prevHash = generateHash();
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const scenarioTemplate = SCENARIOS[i % SCENARIOS.length];
    const timestamp = new Date(now.getTime() - i * 45 * 60 * 1000); // 45 minutes apart
    const currentHash = generateHash();
    
    // Determine verification status
    // Mix it up: index 2 and 9 are tampered, index 5 is pending, others verified
    let verification: 'verified' | 'tampered' | 'pending' = 'verified';
    if (i === 2 || i === 9) {
      verification = 'tampered';
    } else if (i === 5) {
      verification = 'pending';
    }

    const options_considered: Option[] = scenarioTemplate.options.map(opt => ({
      option_id: opt.id,
      description: opt.desc,
      score: opt.score
    }));

    // Chosen option is the one with the highest score
    const sortedOptions = [...options_considered].sort((a, b) => b.score - a.score);
    const chosen_option = sortedOptions[0].option_id;
    const confidence = sortedOptions[0].score;

    records.push({
      decision_id: generateUUID(),
      timestamp: timestamp.toISOString(),
      options_considered,
      chosen_option,
      reasoning: scenarioTemplate.reasoning,
      confidence,
      agent_version: `v1.${(i % 3) + 1}.4`,
      scenario: scenarioTemplate.scenario,
      model: scenarioTemplate.model,
      processing_time_ms: Math.floor(120 + Math.random() * 450),
      ledger_hash: currentHash,
      previous_hash: prevHash,
      verification_status: verification,
      ledger_status: verification === 'tampered' ? 'failed' : (verification === 'pending' ? 'pending' : 'committed'),
      is_simulated: false
    });

    prevHash = currentHash;
  }

  return records;
};

// Generates a single incoming decision (used in Demo Mode)
export const generateSingleSimulatedDecision = (lastRecord?: DecisionRecord): DecisionRecord => {
  const scenarioTemplate = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
  const currentHash = generateHash();
  const prevHash = lastRecord ? lastRecord.ledger_hash : generateHash();

  const options_considered: Option[] = scenarioTemplate.options.map(opt => ({
    option_id: opt.id,
    description: opt.desc,
    score: Math.min(1.0, Math.max(0.1, opt.score + (Math.random() * 0.2 - 0.1))) // slightly adjust scores
  }));

  const sortedOptions = [...options_considered].sort((a, b) => b.score - a.score);
  const chosen_option = sortedOptions[0].option_id;
  const confidence = sortedOptions[0].score;

  // 10% chance of pending, 5% chance of tampered, 85% verified
  const rand = Math.random();
  const verification: 'verified' | 'tampered' | 'pending' = 
    rand < 0.05 ? 'tampered' : (rand < 0.15 ? 'pending' : 'verified');

  return {
    decision_id: generateUUID(),
    timestamp: new Date().toISOString(),
    options_considered,
    chosen_option,
    reasoning: `[Simulation Alert] ${scenarioTemplate.reasoning}`,
    confidence,
    agent_version: `v1.${Math.floor(Math.random() * 3) + 1}.5-demo`,
    scenario: scenarioTemplate.scenario,
    model: scenarioTemplate.model,
    processing_time_ms: Math.floor(100 + Math.random() * 400),
    ledger_hash: currentHash,
    previous_hash: prevHash,
    verification_status: verification,
    ledger_status: verification === 'tampered' ? 'failed' : (verification === 'pending' ? 'pending' : 'committed'),
    is_simulated: true
  };
};

export const calculateStats = (records: DecisionRecord[]): SystemStats => {
  const total = records.length;
  const verified = records.filter(r => r.verification_status === 'verified').length;
  const failed = records.filter(r => r.verification_status === 'tampered').length;
  
  const sumConfidence = records.reduce((acc, r) => acc + r.confidence, 0);
  const avgConfidence = total > 0 ? sumConfidence / total : 0.85;

  const sumTime = records.reduce((acc, r) => acc + r.processing_time_ms, 0);
  const avgTime = total > 0 ? sumTime / total : 250;

  // Let's compute ledger availability based on status.
  // Uptime is ratio of non-failed blocks
  const failedBlocks = records.filter(r => r.ledger_status === 'failed').length;
  const availability = total > 0 ? (total - failedBlocks) / total : 0.999;

  return {
    total_decisions: total,
    verified_decisions: verified,
    failed_verification: failed,
    average_confidence: avgConfidence,
    average_processing_time: avgTime,
    ledger_availability: availability
  };
};

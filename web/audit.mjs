/**
 * Local, unsigned threshold preview of the enterprise workers.
 * These heuristics are illustrative; no hardware measurements are performed.
 */
const riskyIdentifier = /\b(?:MRN[:#\s-]*\d{4,10}|\d{3}-\d{2}-\d{4}|[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,})\b/i;
const flags = ["DISCORDANT", "ANOMALY", "MUTANT", "VIOLATION", "FAIL", "REJECT"];

function nonempty(value, name) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(name + " is required.");
  }
  if (value.length > 200) {
    throw new Error(name + " must contain at most 200 characters.");
  }
  if (riskyIdentifier.test(value)) {
    throw new Error(name + " appears to contain a personal identifier. Use a non-sensitive code.");
  }
  return value.trim();
}

function metric(value, name) {
  if (value === null || value === "" || typeof value === "boolean") {
    throw new Error(name + " is required.");
  }
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(name + " must be a finite number.");
  }
  return number;
}

export function evaluateAudit(input) {
  const task_id = nonempty(input.task_id, "Task ID");
  const target_identifier = nonempty(input.target_identifier, "Target ID");
  const primary_metric = metric(input.primary_metric, "Primary metric");
  const secondary_metric = metric(input.secondary_metric, "Secondary metric");
  const status_descriptor = nonempty(input.status_descriptor, "Status descriptor");
  const is_critical_flag = input.is_critical_flag === true;
  const alerts = [];

  if (primary_metric > 25) {
    alerts.push({
      origin_worker: "InvariantQCWorker",
      urgency: "ELEVATED_RISK",
      summary: "Primary Metric Threshold Exceeded",
      technical_details: "Primary metric exceeds the example threshold of 25."
    });
  }
  if (is_critical_flag || secondary_metric > 12) {
    alerts.push({
      origin_worker: "SafetyEscalationWorker",
      urgency: is_critical_flag ? "CRITICAL_STAT_PANIC" : "ELEVATED_RISK",
      summary: "Safety Interlock Threshold Triggered",
      technical_details: "Critical flag or secondary metric above the example threshold of 12."
    });
  }
  if (flags.some(flag => status_descriptor.toUpperCase().includes(flag))) {
    alerts.push({
      origin_worker: "ProtocolConformanceWorker",
      urgency: "ELEVATED_RISK",
      summary: "Descriptor Anomaly Detected",
      technical_details: "Status descriptor matches an anomaly keyword."
    });
  }

  const critical_alerts_count = alerts.filter(a => a.urgency === "CRITICAL_STAT_PANIC").length;
  const overall_urgency = critical_alerts_count ? "CRITICAL_STAT_PANIC" :
    alerts.length ? "ELEVATED_RISK" : "ROUTINE";
  const integrity_status = critical_alerts_count ? "RECALIBRATION_REQUIRED" :
    alerts.length ? "DISCORDANT_ANOMALY" : "VALIDATED_OPTIMAL";

  return {
    mode: "BROWSER_PREVIEW_UNSIGNED",
    task_id,
    target_identifier,
    primary_metric,
    secondary_metric,
    status_descriptor,
    is_critical_flag,
    overall_urgency,
    integrity_status,
    total_alerts: alerts.length,
    critical_alerts_count,
    alerts,
    consensus_summary: "Local heuristic evaluation of three threshold rules; not a hardware security assessment."
  };
}

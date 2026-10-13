import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluateAudit } from '../web/audit.mjs';

const example = {
  task_id: 'T-001', target_identifier: 'DEVICE-01',
  primary_metric: 10, secondary_metric: 5,
  status_descriptor: 'NOMINAL', is_critical_flag: false
};
test('nominal threshold result is reproducible', () => {
  const result = evaluateAudit(example);
  assert.equal(result.overall_urgency, 'ROUTINE');
  assert.equal(result.total_alerts, 0);
  assert.equal(result.mode, 'BROWSER_PREVIEW_UNSIGNED');
  assert.equal('audit_hash' in result, false);
});
test('boundary and keyword conditions match Python workers', () => {
  const atBoundary = evaluateAudit({...example, primary_metric:25, secondary_metric:12});
  assert.equal(atBoundary.total_alerts, 0);
  const elevated = evaluateAudit({...example, primary_metric:25.01, secondary_metric:12.01, status_descriptor:'FAIL'});
  assert.equal(elevated.total_alerts, 3);
  assert.equal(elevated.overall_urgency, 'ELEVATED_RISK');
  const critical = evaluateAudit({...example, is_critical_flag:true});
  assert.equal(critical.overall_urgency, 'CRITICAL_STAT_PANIC');
  assert.equal(critical.integrity_status, 'RECALIBRATION_REQUIRED');
});
test('invalid metrics and identifiers fail closed', () => {
  assert.throws(() => evaluateAudit({...example, primary_metric:''}), /required/);
  assert.throws(() => evaluateAudit({...example, secondary_metric:'Infinity'}), /finite/);
  assert.throws(() => evaluateAudit({...example, task_id:'MRN-123456'}), /identifier/);
  assert.throws(() => evaluateAudit({...example, target_identifier:' '}), /required/);
});
test('static page references the local module without a backend API', () => {
  const html = readFileSync(new URL('../web/index.html', import.meta.url), 'utf8');
  assert.match(html, /type="module"/);
  assert.match(html, /\.\/audit\.mjs/);
  assert.doesNotMatch(html, /fetch\(\s*['"]\/api/);
  assert.doesNotMatch(html, /HMAC_SHA256_/);
});

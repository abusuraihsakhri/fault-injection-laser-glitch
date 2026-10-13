# Fault Injection Laser Glitch

### [Open the Live Application →](https://abusuraihsakhri.github.io/fault-injection-laser-glitch/)

A research-oriented, rule-based screening project for illustrative fault-injection risk scenarios. The repository provides Python command-line and API workflows plus a standalone browser preview. **It does not drive laser hardware, implement AES key recovery, measure device resistance, or certify compliance with any standard.**

## Browser preview

The static page in `web/` implements a local preview of the three threshold rules used in `agents/workers.py`. It requires no API, credentials, or Python runtime. Start a local web server:

```bash
python -m http.server 8080 --directory web
```

Open `http://localhost:8080/`. Enter nonsensitive task and target codes, choose metrics and an optional critical flag, then select **Evaluate**. Results can be exported as an unsigned JSON file.

The page processes inputs in memory, does not send network requests or retain entered data, and does not generate HMAC audit records. Do not enter personal identifiers or confidential measurements. The metric cutoffs (primary >25; secondary >12) are **illustrative defaults**, not validated hardware-security limits.

## Python systems

This repository retains two distinct implementations:

- `agents/` + root `cli.py`: Pydantic v2 models; three rule-based workers; FastAPI endpoints; in-memory HMAC-SHA256 audit chain.
- `fault_injection/` + `fault_injection_app.py`: dataclass models and an independent three-worker threshold evaluator. The installed `fault-injection-laser-glitch` console command invokes this version.
- `enrichment.py`: generic numeric threshold demonstrations with domain-oriented labels. These are **not** implementations of physical laser or fault-injection campaigns.

The enterprise worker rules flag a primary metric above 25, a secondary metric above 12, a true critical flag, and status descriptors containing predefined anomaly keywords. They report urgency and alerts; no physical testing occurs.

## Installation and use

Requires Python 3.9 or newer.

```bash
git clone https://github.com/abusuraihsakhri/fault-injection-laser-glitch.git
cd fault-injection-laser-glitch
python -m pip install -e ".[server,test]"

# Enterprise CLI
python cli.py audit --task-id TASK-001 --target DEVICE-001 --primary 29.4 --secondary 14.8 --status ANOMALY
python cli.py batch -i sample.csv -o results.csv
python cli.py verify-audit
python simulator.py 100

# Independent frontier CLI
python fault_injection_app.py audit --task-id TASK-002 --target DEVICE-002 --primary 20 --secondary 5

# Local API (not intended for public internet exposure)
python -m uvicorn agents.api:app --host 127.0.0.1 --port 8000
```

API endpoints: `GET /health`, `GET /metrics` (JSON process counters), `POST /api/audit`, `POST /api/chat` (deterministic mock), and `GET /api/audit/logs`. Interactive OpenAPI documentation is available at `/docs` when the API is running. The repository's `openapi_spec.json` is illustrative; the running FastAPI schema is authoritative.

An optional in-memory key for the audit chain can be supplied through `AUDIT_SECRET_KEY`. Otherwise a random ephemeral key is generated. The ledger is process-local and **is not persisted** across restarts. Its verification checks both record links and HMACs; it is not an external notarization service. The API has no user authentication and must remain on a trusted local network.

A container can be started with `docker compose up --build`; Compose binds port 8000 to localhost only. Set `AUDIT_SECRET_KEY` to a secret outside version control when stable signing keys are required.

## Test and development

```bash
python -m pip install -e ".[server,test]"
python -m pytest -q
python -m compileall -q agents fault_injection tests cli.py simulator.py enrichment.py
node --test tests/web.test.mjs
```

Python tests cover the rule engines, CLI, batch input handling, identifier checks, and audit-integrity regressions. Node.js 20+ is used for browser-rule unit tests; the web preview itself works in current Chromium, Firefox, and Safari versions supporting ES modules. GitHub Actions runs the Python test matrix and Node suite.

## Privacy and security limitations

- The static preview works entirely client-side, with no upload or analytics service.
- The Python services keep dossiers and audit entries in process memory. The identifier guard uses patterns and **cannot guarantee complete personal-data detection or de-identification**.
- Both APIs are unauthenticated by default; do not expose them publicly or submit sensitive information.
- API responses and heuristic statuses are not security certifications or formal standards-conformance decisions.

## Technology and license

Python, Pydantic v2, FastAPI (optional server), pytest, standard HTML/CSS/JavaScript, Docker, and GitHub Actions. Licensed under the MIT License; see [LICENSE](LICENSE).

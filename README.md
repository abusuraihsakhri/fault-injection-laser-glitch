# Fault Injection Laser Glitch

> **Domain:** Post-Quantum Cryptography & Hardware Security
> **Standards:** NIST FIPS 203/204/205, NIST SP 800-90B, ISO/IEC 17825, ISO/IEC 20085

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-3776AB.svg?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg?logo=fastapi&logoColor=white)
![Audit Trail](https://img.shields.io/badge/Audit-HMAC--SHA256_Tamper--Evident-brightgreen.svg)
![Zero-PHI Guard](https://img.shields.io/badge/Guard-Zero--PHI_Outbound-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)

</div>

---

## Overview

Fault Injection Laser Glitch is a multi-agent analytical engine for evaluating fault injection attack resistance in cryptographic and hardware security systems. It processes task payloads through specialized workers that check invariant thresholds, safety boundaries, and protocol conformance, producing cryptographically signed audit trails.

The project provides two parallel agent systems:

- **`agents/`** — Enterprise-grade system with Pydantic models, FastAPI REST API, and HMAC-SHA256 audit trail
- **`fault_injection/`** — Frontier system with dataclass models and ISO/IEC 20085 fault injection testing

---

## Key Capabilities

- **Multi-Worker Evaluation**: Three specialized workers (InvariantQC, SafetyEscalation, ProtocolConformance) analyze each task
- **Risk Classification**: Multi-tier urgency classification (ROUTINE, ELEVATED_RISK, CRITICAL_STAT_PANIC)
- **Zero-PHI Outbound Guard**: Active pattern detection blocking SSNs, MRNs, phone numbers, and patient identifiers
- **Tamper-Evident Audit Trail**: Chained HMAC-SHA256 cryptographic signatures for every evaluation
- **FastAPI REST API**: OpenAPI 3.1 endpoints with Prometheus telemetry
- **Batch Processing**: CSV-based high-throughput evaluation mode

---

## Installation

```bash
# Clone the repository
git clone https://github.com/abusuraihsakhri/fault-injection-laser-glitch.git
cd fault-injection-laser-glitch

# Install dependencies
pip install fastapi uvicorn pydantic pytest
```

---

## Usage

### CLI Commands

The CLI provides several subcommands for different operations:

#### 1. Single Task Evaluation (Audit)
```bash
python cli.py audit --task-id TASK-001 --target KEY-01 --primary 28.5 --secondary 14.2 --critical --status DISCORDANT
```

#### 2. Supervisory Chat
```bash
python cli.py chat "What is the system status?"
```

#### 3. Batch CSV Processing
```bash
python cli.py batch -i sample.csv -o results.csv
```

#### 4. Verify Audit Trail Integrity
```bash
python cli.py verify-audit
```

#### 5. Launch REST API Server
```bash
python cli.py serve --host 127.0.0.1 --port 8000
```

### Parameters

| Parameter | Type | Default | Description |
|:----------|:-----|:--------|:------------|
| `--task-id` | str | TASK-2026-001 | Unique task identifier |
| `--target` | str | KEY-TARGET-01 | Target entity or cryptographic key identifier |
| `--primary` | float | 28.5 | Primary measurement or score value |
| `--secondary` | float | 14.2 | Secondary kinetic or confidence score |
| `--critical` | flag | False | Trigger emergency/critical escalation |
| `--status` | str | DISCORDANT | Status code or phenotype descriptor |

### Input Data Schema (CSV)

| Field | Type | Required | Description |
|:------|:-----|:---------|:------------|
| `task_id` | str | Yes | Unique task identifier |
| `target_identifier` | str | Yes | Target entity or key identifier |
| `primary_metric` | float | Yes | Primary measurement value |
| `secondary_metric` | float | No | Secondary metric (default: 0.0) |
| `is_critical_flag` | bool | No | Critical escalation flag (default: false) |
| `status_descriptor` | str | No | Status code (default: NOMINAL) |

---

## REST API Endpoints

When the server is running (`python cli.py serve`):

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| GET | `/health` | Health check and system metadata |
| GET | `/metrics` | Operational metrics (dossier count, audit blocks) |
| POST | `/api/audit` | Submit task payload for evaluation |
| POST | `/api/chat` | Supervisory chat query |
| GET | `/api/audit/logs` | Retrieve and verify HMAC audit trail |

---

## Simulation & Benchmarking

Run the high-throughput simulation:

```bash
python simulator.py 1000
```

This processes 1,000 randomized task payloads and reports distribution statistics, PHI interception rate, and audit trail integrity.

---

## Testing

Run the full test suite:

```bash
pytest -v
```

Tests cover:
- PHI guard enforcement (Zero-PHI outbound protection)
- Specialized worker evaluation logic
- Supervisor consensus and audit trail integrity
- CLI command execution
- Sub-agent coordination
- CSV batch processing error handling
- Input validation (NaN, Inf, empty strings)

---

## Security

### Audit Trail Secret Key

The HMAC-SHA256 audit trail requires a secret key. Set the `AUDIT_SECRET_KEY` environment variable for production:

```bash
export AUDIT_SECRET_KEY="your-secure-random-key"
```

If not set, an ephemeral key is generated at startup (signatures will not persist across restarts).

### Zero-PHI Guard

The system actively blocks outbound transmission of:
- Medical Record Numbers (MRN)
- Social Security Numbers (XXX-XX-XXXX)
- Phone numbers
- Email addresses
- Dates of birth
- Patient names

---

## Container Deployment

### Docker

```bash
docker build -t fault-injection-laser-glitch .
docker run -p 8000:8000 -e AUDIT_SECRET_KEY=your-secret-key fault-injection-laser-glitch
```

### Docker Compose

```bash
AUDIT_SECRET_KEY=your-secret-key docker compose up
```

---

## Project Structure

```
fault-injection-laser-glitch/
├── agents/                  # Enterprise agent system
│   ├── api.py              # FastAPI REST server
│   ├── base.py             # Security, PHI guard, audit trail
│   ├── models.py           # Pydantic data models
│   ├── supervisor.py       # Multi-agent orchestrator
│   ├── workers.py          # Specialized evaluation workers
│   └── llm_factory.py      # LLM provider abstraction
├── fault_injection/         # Frontier agent system
│   ├── agents.py           # Sub-agent coordination
│   ├── engine.py           # Core evaluation engine
│   ├── models.py           # Dataclass models
│   ├── cli.py              # CLI for frontier system
│   └── server.py           # FastAPI server factory
├── tests/                   # Pytest test suite
├── web/                     # Operations console (HTML)
├── cli.py                   # Main CLI entry point
├── fault_injection_app.py   # Frontier CLI entry point
├── simulator.py             # High-throughput simulation
├── enrichment.py            # Domain enrichment engines
├── sample.csv               # Sample batch input
├── sample_payload.json      # Sample API payload
├── benchmark_dataset.json   # Golden benchmark test cases
├── Dockerfile               # Container build
├── docker-compose.yml       # Container orchestration
└── pyproject.toml           # Project metadata
```

---

## License

MIT License — see [LICENSE](LICENSE) for details.

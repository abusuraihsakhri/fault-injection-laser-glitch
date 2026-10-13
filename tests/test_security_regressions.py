"""Regression tests for verifiable audit records and safe API validation."""
import pytest

from agents.base import AuditTrail, SecurityException
from agents.models import SystemTaskPayload
from agents.supervisor import SystemSupervisor


def make_trail():
    trail = AuditTrail(secret_key="testing-key-not-for-production")
    trail.log("test", "supervisor", "EVENT", {"task_id": "T-1"})
    trail.log("test", "supervisor", "EVENT", {"task_id": "T-2"})
    return trail


@pytest.mark.parametrize("field,value", [
    ("actor", "altered"),
    ("current_hash", "0" * 64),
    ("payload_hash", "0" * 64),
    ("prev_hash", "0" * 64),
])
def test_audit_integrity_rejects_modifications(field, value):
    trail = make_trail()
    assert trail.verify_integrity()
    trail.logs[-1][field] = value
    assert not trail.verify_integrity()


def test_audit_trail_is_not_mutable_through_accessor():
    trail = make_trail()
    snapshot = trail.get_trail()
    snapshot[-1]["current_hash"] = "modified"
    assert trail.verify_integrity()
    assert trail.get_trail()[-1]["current_hash"] != "modified"


def test_nested_metadata_guard():
    supervisor = SystemSupervisor()
    payload = SystemTaskPayload(
        task_id="TEST-01", target_identifier="DEVICE-01",
        primary_metric=1, attributes={"nested": {"email": "person@example.com"}}
    )
    with pytest.raises(SecurityException):
        supervisor.process_task(payload)


def test_api_turns_sensitive_identifier_into_422():
    from fastapi.testclient import TestClient
    from agents.api import app
    client = TestClient(app)
    response = client.post("/api/audit", json={
        "task_id": "MRN-123456", "target_identifier": "DEVICE-01", "primary_metric": 1
    })
    assert response.status_code == 422

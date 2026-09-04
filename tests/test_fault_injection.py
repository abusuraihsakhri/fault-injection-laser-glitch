import sys
import math
import tempfile
import os
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest
from fault_injection.models import FrontierPayload, ExecutionStatus
from fault_injection.engine import FrontierDomainEngine
from fault_injection.agents import FaultMatrixInjectorAgent, DFAKeyHypothesisAgent, HardwareCountermeasureAgent, FaultInjectionCoordinator
from fault_injection.cli import main


def test_sub_agents():
    a1 = FaultMatrixInjectorAgent()
    p1 = FrontierPayload("T1", "KEY-01", primary_metric=35.0, secondary_metric=4.0, status_descriptor="NOMINAL")
    alerts1 = a1.audit(p1)
    assert len(alerts1) == 1
    assert alerts1[0].status == ExecutionStatus.ELEVATED_RISK

    a2 = DFAKeyHypothesisAgent()
    p2 = FrontierPayload("T2", "KEY-02", primary_metric=10.0, secondary_metric=15.0, status_descriptor="NOMINAL", is_critical_flag=True)
    alerts2 = a2.audit(p2)
    assert len(alerts2) == 1
    assert alerts2[0].status == ExecutionStatus.CRITICAL_INTERVENTION

    a3 = HardwareCountermeasureAgent()
    p3 = FrontierPayload("T3", "KEY-03", primary_metric=10.0, secondary_metric=4.0, status_descriptor="DISCORDANT_ANOMALY")
    alerts3 = a3.audit(p3)
    assert len(alerts3) == 1


def test_coordinator():
    coord = FaultInjectionCoordinator()
    p_nominal = FrontierPayload("T4", "KEY-04", primary_metric=12.0, secondary_metric=4.0, status_descriptor="NOMINAL")
    dossier = coord.process(p_nominal)
    assert dossier["overall_status"] == ExecutionStatus.NOMINAL.value
    assert dossier["total_alerts"] == 0

    ans = coord.query_supervisory_chat("What standard is applied?")
    assert "ISO/IEC 20085 Fault Injection Testing" in ans or "specifications" in ans


def test_cli():
    assert main(["audit", "--task-id", "CLI-01"]) == 0
    assert main(["chat", "What", "is", "the", "system", "status?"]) == 0


def test_frontier_payload_rejects_nan():
    """NaN metric values must be rejected."""
    with pytest.raises(ValueError):
        FrontierPayload("T1", "KEY-01", primary_metric=float("nan"), secondary_metric=4.0, status_descriptor="NOMINAL")


def test_frontier_payload_rejects_inf():
    """Infinite metric values must be rejected."""
    with pytest.raises(ValueError):
        FrontierPayload("T1", "KEY-01", primary_metric=10.0, secondary_metric=float("inf"), status_descriptor="NOMINAL")


def test_frontier_payload_rejects_empty_strings():
    """Empty task_id must be rejected."""
    with pytest.raises(ValueError):
        FrontierPayload("", "KEY-01", primary_metric=10.0, secondary_metric=4.0, status_descriptor="NOMINAL")


def test_frontier_batch_csv_error_handling():
    """Batch processing should skip invalid rows gracefully."""
    with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False, newline="") as f:
        f.write("task_id,target_identifier,primary_metric,secondary_metric\n")
        f.write("T1,KEY-01,10.0,5.0\n")
        f.write("T2,KEY-02,BAD_DATA,5.0\n")  # Bad primary_metric
        f.write("T3,KEY-03,15.0,8.0\n")
        tmp_path = f.name

    try:
        output_path = tmp_path + "_out.csv"
        result = main(["batch", "-i", tmp_path, "-o", output_path])
        assert result == 0
        with open(output_path, "r") as f:
            lines = f.readlines()
        assert len(lines) == 3  # header + 2 valid rows
        os.unlink(output_path)
    finally:
        os.unlink(tmp_path)

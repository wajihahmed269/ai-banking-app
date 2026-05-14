#!/usr/bin/env python3
"""Alertmanager webhook for safe banking app remediation."""

from __future__ import annotations

import datetime as dt
import json
import os
import subprocess
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, request


ALLOWED_ALERTS = {"BankingAppDown", "BankingAppHighRestarts"}

REPO_ROOT = Path(__file__).resolve().parents[2]
REMEDIATION_SCRIPT = REPO_ROOT / "phoenix-ops" / "remediation" / "heal-banking-app.sh"
EVIDENCE_DIR = REPO_ROOT / "phoenix-ops" / "evidence"

app = Flask(__name__)


def _utc_timestamp() -> str:
    return dt.datetime.now(dt.UTC).strftime("%Y%m%dT%H%M%S%fZ")


def _alert_names(payload: dict[str, Any]) -> list[str]:
    names: list[str] = []

    common_alert_name = payload.get("commonLabels", {}).get("alertname")
    if isinstance(common_alert_name, str):
        names.append(common_alert_name)

    alerts = payload.get("alerts", [])
    if isinstance(alerts, list):
        for alert in alerts:
            if not isinstance(alert, dict):
                continue

            alert_name = alert.get("labels", {}).get("alertname")
            if isinstance(alert_name, str):
                names.append(alert_name)

    return names


def _first_allowed_alert(payload: dict[str, Any]) -> str | None:
    for alert_name in _alert_names(payload):
        if alert_name in ALLOWED_ALERTS:
            return alert_name

    return None


def _create_run_log(*, alert_name: str, payload: dict[str, Any]) -> Path:
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = _utc_timestamp()
    log_path = EVIDENCE_DIR / f"remediation-run-{timestamp}.log"

    log_path.write_text(
        "\n".join(
            [
                f"timestamp_utc={timestamp}",
                f"alert_name={alert_name}",
                f"command={REMEDIATION_SCRIPT} {alert_name}",
                "",
                "alertmanager_payload:",
                json.dumps(payload, indent=2, sort_keys=True),
                "",
                "remediation_output:",
                "",
            ]
        ),
        encoding="utf-8",
    )

    return log_path


@app.post("/alertmanager")
def alertmanager_webhook():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return (
            jsonify(
                {
                    "status": "invalid_payload",
                    "alert_name": None,
                    "log_path": None,
                }
            ),
            400,
        )

    alert_name = _first_allowed_alert(payload)
    if alert_name is None:
        return jsonify(
            {
                "status": "ignored",
                "alert_name": None,
                "log_path": None,
            }
        )

    if not REMEDIATION_SCRIPT.exists():
        return (
            jsonify(
                {
                    "status": "remediation_script_missing",
                    "alert_name": alert_name,
                    "log_path": None,
                }
            ),
            500,
        )

    log_path = _create_run_log(alert_name=alert_name, payload=payload)

    with log_path.open("a", encoding="utf-8") as log_file:
        process = subprocess.Popen(
            [str(REMEDIATION_SCRIPT), alert_name],
            cwd=str(REPO_ROOT),
            stdout=log_file,
            stderr=log_file,
            text=True,
            start_new_session=True,
        )

    return (
        jsonify(
            {
                "status": "accepted",
                "alert_name": alert_name,
                "log_path": str(log_path),
                "pid": process.pid,
            }
        ),
        202,
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8080")))

#!/usr/bin/env python3
"""
PulseLink Beacon — IoT Simulator
=================================
Simulates sensor readings and emergency events from Beacon devices.
Sends data to the Spring Boot backend via REST API.

Usage:
  python simulate.py                    # interactive menu
  python simulate.py --scenario fire    # run a specific scenario once
  python simulate.py --loop 10          # send normal readings every 10 seconds
  python simulate.py --scenario fire --device 2   # fire on device 2
"""

import argparse
import json
import os
import random
import time
from datetime import datetime, timezone

import requests

BASE_URL = "http://localhost:8080/api"
SCENARIOS_DIR = os.path.join(os.path.dirname(__file__), "scenarios")

# ─── Helpers ──────────────────────────────────────────────────────────────────

def ts() -> str:
    return datetime.now(timezone.utc).isoformat()

def post(endpoint: str, payload: dict) -> dict | None:
    url = f"{BASE_URL}{endpoint}"
    try:
        r = requests.post(url, json=payload, timeout=5)
        r.raise_for_status()
        return r.json()
    except requests.exceptions.ConnectionError:
        print(f"  [ERROR] Cannot connect to backend at {BASE_URL}")
        print("          Make sure the Spring Boot application is running.")
        return None
    except requests.exceptions.HTTPError as e:
        print(f"  [ERROR] HTTP {r.status_code}: {r.text}")
        return None

def get(endpoint: str) -> list | dict | None:
    url = f"{BASE_URL}{endpoint}"
    try:
        r = requests.get(url, timeout=5)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"  [ERROR] GET {endpoint}: {e}")
        return None

def print_result(label: str, result: dict | None):
    if result:
        print(f"  [OK] {label}")
        print(f"       ID={result.get('id')}  Status={result.get('status', result.get('deviceStatus', ''))}")
    else:
        print(f"  [FAIL] {label}")

# ─── Scenario Loaders ─────────────────────────────────────────────────────────

def load_scenario(name: str) -> dict:
    path = os.path.join(SCENARIOS_DIR, f"{name}.json")
    if not os.path.exists(path):
        raise FileNotFoundError(f"Scenario file not found: {path}")
    with open(path) as f:
        data = json.load(f)
    data.pop("_comment", None)
    return data

def run_sensor_reading(payload: dict, device_id: int | None = None) -> dict | None:
    if device_id:
        payload["deviceId"] = device_id
    payload["timestamp"] = ts()
    print(f"\n  Sending sensor reading → Device {payload['deviceId']}")
    print(f"  Smoke={payload.get('smokeDetected')}  "
          f"Impact={payload.get('impactDetected')}  "
          f"Temp={payload.get('temperatureCelsius')}°C  "
          f"Battery={payload.get('batteryLevel')}%  "
          f"Satellite={payload.get('satelliteConnected')}")
    return post("/sensors/readings", payload)

def run_sos_button(device_id: int, description: str = "SOS manual — botão físico acionado") -> dict | None:
    payload = {
        "deviceId": device_id,
        "type": "SOS_BUTTON",
        "riskLevel": "CRITICAL",
        "description": description,
    }
    print(f"\n  🆘 Sending SOS_BUTTON alert → Device {device_id}")
    return post("/alerts", payload)

# ─── Simulations ──────────────────────────────────────────────────────────────

def simulate_fire(device_id: int | None = None):
    print("\n🔥 === FIRE SCENARIO ===")
    data = load_scenario("fire_alert")
    result = run_sensor_reading(data, device_id)
    print_result("Fire reading processed", result)

def simulate_impact(device_id: int | None = None):
    print("\n💥 === IMPACT SCENARIO ===")
    data = load_scenario("impact_alert")
    result = run_sensor_reading(data, device_id)
    print_result("Impact reading processed", result)

def simulate_sos(device_id: int | None = None):
    print("\n🆘 === SOS BUTTON SCENARIO ===")
    did = device_id or 1
    result = run_sos_button(did)
    print_result("SOS alert created", result)

def simulate_normal(device_id: int | None = None):
    print("\n✅ === NORMAL STATUS ===")
    data = load_scenario("normal_status")
    # Add small random variance to simulate real sensor noise
    data["temperatureCelsius"] = round(data["temperatureCelsius"] + random.uniform(-2, 2), 1)
    data["batteryLevel"] = max(1, data["batteryLevel"] - random.randint(0, 2))
    data["signalStrength"] = random.randint(50, 95)
    result = run_sensor_reading(data, device_id)
    print_result("Normal heartbeat sent", result)

def simulate_loop(interval: int, device_id: int | None = None):
    print(f"\n🔄 Loop mode — sending heartbeat every {interval}s (Ctrl+C to stop)\n")
    cycle = 0
    try:
        while True:
            cycle += 1
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Cycle #{cycle}")
            # 80% normal, 10% fire, 10% impact — for demo purposes
            roll = random.random()
            if roll < 0.80:
                simulate_normal(device_id)
            elif roll < 0.90:
                simulate_fire(device_id)
            else:
                simulate_impact(device_id)
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\n\nSimulator stopped.")

def list_devices():
    print("\n📡 Registered Devices:")
    devices = get("/devices")
    if not devices:
        return
    for d in devices:
        print(f"  [{d['id']}] {d['name']}  |  {d['status']}  |  Battery: {d['batteryLevel']}%  |  Serial: {d['serialNumber']}")

def list_active_alerts():
    print("\n⚠️  Active Alerts:")
    alerts = get("/alerts?status=active")
    if not alerts:
        print("  No active alerts.")
        return
    for a in alerts:
        print(f"  [{a['id']}] {a['type']} | {a['riskLevel']} | Device: {a['deviceName']} | {a['createdAt']}")

# ─── Interactive Menu ──────────────────────────────────────────────────────────

def interactive_menu():
    print("\n" + "="*50)
    print("  🛰️  PulseLink Beacon — IoT Simulator")
    print("="*50)
    while True:
        print("\nWhat would you like to simulate?")
        print("  1) Normal status heartbeat")
        print("  2) 🔥 Fire alert")
        print("  3) 💥 Impact / accident alert")
        print("  4) 🆘 SOS button press")
        print("  5) 🔄 Continuous loop (auto)")
        print("  6) 📡 List registered devices")
        print("  7) ⚠️  List active alerts")
        print("  0) Exit")
        choice = input("\n> ").strip()

        if choice == "1":
            did = input("  Device ID (default=1): ").strip()
            simulate_normal(int(did) if did else None)
        elif choice == "2":
            did = input("  Device ID (default=1): ").strip()
            simulate_fire(int(did) if did else None)
        elif choice == "3":
            did = input("  Device ID (default=2): ").strip()
            simulate_impact(int(did) if did else None)
        elif choice == "4":
            did = input("  Device ID (default=1): ").strip()
            simulate_sos(int(did) if did else None)
        elif choice == "5":
            interval = input("  Interval in seconds (default=5): ").strip()
            did = input("  Device ID (default=1): ").strip()
            simulate_loop(int(interval) if interval else 5, int(did) if did else None)
        elif choice == "6":
            list_devices()
        elif choice == "7":
            list_active_alerts()
        elif choice == "0":
            print("Bye 👋")
            break
        else:
            print("  Invalid option.")

# ─── Entry Point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="PulseLink Beacon IoT Simulator")
    parser.add_argument("--scenario", choices=["fire", "impact", "sos", "normal"],
                        help="Run a specific scenario once and exit")
    parser.add_argument("--loop", type=int, metavar="SECONDS",
                        help="Send normal/random readings in a loop every N seconds")
    parser.add_argument("--device", type=int, default=None,
                        help="Target device ID (overrides scenario default)")
    args = parser.parse_args()

    if args.loop:
        simulate_loop(args.loop, args.device)
    elif args.scenario == "fire":
        simulate_fire(args.device)
    elif args.scenario == "impact":
        simulate_impact(args.device)
    elif args.scenario == "sos":
        simulate_sos(args.device)
    elif args.scenario == "normal":
        simulate_normal(args.device)
    else:
        interactive_menu()

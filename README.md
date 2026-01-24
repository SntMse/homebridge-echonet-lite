# homebridge-echonet-lite (Custom Fork)

Homebridge plugin for ECHONET Lite devices, optimized for personal home environments.

## Status

Implemented:
* **Light bulb**: Fully functional and stable.
* **Air conditioner**: Supported, but requires a stable network environment for discovery.

Tested on:
* **MoekadenRoom** (Software simulator).
* **Actual Devices**: 
    * Panasonic Eolia (Discovery pending stable network).
    * Fujitsu General nocria (Discovery pending stable network).
    * Multiple generic lighting accessories (Confirmed stable).

## Important Implementation Notes (2026-01-24 Update)

Through extensive network analysis (using Wireshark and Port Scanning), the following characteristics were identified:

### Network Topology & Jitter
In environments where Homebridge (running on a NAS) connects to devices through multiple hops (e.g., Main Router -> Sub Router/Extender -> Wireless Device), high latency (up to **400ms+**) and jitter have been observed. This may cause the ECHONET Lite discovery process to time out.

### Device Specific Findings
* **Discovery Protocol**: Relies on UDP/3610. Ensure that multicast/broadcast packets are not filtered by your network switches or Wi-Fi extenders.
* **Code Integrity**: The current `lib/accessory.js` has been reverted to its original class-based EOJ identification logic to ensure maximum stability for working accessories (e.g., Lights).

## Usage

```json
"platforms": [
  {
    "platform": "ELPlatform",
    "name": "ELPlatform",
    "enableRefreshSwitch": true,
    "hosts": [
      "192.168.1.52",
      "192.168.1.74"
    ]
  }
]

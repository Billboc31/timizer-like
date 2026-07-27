# T032 — Allow frontend access from Tailscale and local network

**Source**: GitHub Issue #63

## Description

## Context

The React frontend currently runs with Vite and may only be reachable from the host machine through `localhost`. This prevents access from another device connected through Tailscale or the local network.

## Goal

Make the development frontend reachable from other trusted devices using the host machine's Tailscale or LAN address.

## Description

Configure the Vite development server to listen on an external interface instead of only the loopback interface.

The configuration should use a stable development port and remain convenient for local development. Documentation must explain how to start the frontend and which URL to use from another device.

The implementation must not expose production secrets or introduce a public Internet deployment.

## Out of Scope

- Production deployment
- Public Internet exposure
- Tailscale installation or ACL configuration
- Automatic firewall configuration
- HTTPS certificates
- Backend remote-access configuration

## Acceptance Criteria

- The Vite development server listens on an interface accessible outside `localhost`
- The frontend remains accessible locally through `http://localhost:5173`
- The frontend is accessible from another trusted device through `http://<TAILSCALE_OR_LAN_IP>:5173`
- The development port is explicitly configured and documented
- The configuration works when running the existing frontend development command
- If port 5173 is unavailable, startup fails clearly rather than silently switching to an unknown port
- The README documents how to find and use the Tailscale or LAN URL
- Existing frontend build and tests still pass

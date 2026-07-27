# Frontend

React + Vite application shell for Timizer Like.

## Requirements

- Node.js 20+ and npm

## Local development

```bash
npm install
npm run dev
```

The dev server starts on http://localhost:5173.

## Remote access (Tailscale / LAN)

The dev server listens on all interfaces, so it is reachable from any trusted
device on the same network.

Find your machine's IP:

```bash
# Tailscale IP
tailscale ip -4

# LAN IP (macOS / Linux)
ifconfig | grep 'inet ' | grep -v 127
# or
ip addr show | grep 'inet ' | grep -v 127
```

Then open `http://<IP>:5173` on the remote device.

> **Note**: if port 5173 is already in use, startup fails immediately instead
> of silently binding to another port. Free the port and restart.
>
> Your OS firewall must allow inbound TCP on port 5173 from the remote device.

## Build

```bash
npm run build
```

The production bundle is written to `dist/`.

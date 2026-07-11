# Provider Signature Asset

## 1. Purpose

The generated CRA (Compte Rendu d'Activité) PDF must embed the provider's
signature in the MVP. This document defines the convention — location,
override mechanism, supported formats, and missing-asset behavior — that the
PDF generator will rely on.

This ticket (**T027**) delivers the convention and repository hygiene only.
The actual loader implementation (a `ProviderSignatureLoader`) and the
integration with PDF generation are owned by ticket **T016** and will consume
the convention described here.

## 2. Default location

The signature asset is expected at:

```
assets/provider-signature.png
```

The path is relative to the project root. The `assets/` directory is
tracked in the repository (via `assets/.gitkeep`) so that the default
location exists on a fresh checkout, but the signature binary itself is
never committed (see §6).

## 3. Override

The default location can be overridden through either of the following,
which T016 will wire into the loader:

- Spring property key: `timizer.provider-signature.path`
- Environment variable: `TIMIZER_PROVIDER_SIGNATURE_PATH`

When both are provided, the environment variable takes precedence, per the
standard Spring Boot externalized configuration order. The override value is
interpreted as a filesystem path (absolute or relative to the project root).

## 4. Supported formats

Only the following image formats are accepted:

- PNG (`.png`)
- JPEG (`.jpg`, `.jpeg`)

Any other extension is explicitly rejected. No other format (SVG, PDF,
WebP, BMP, TIFF, GIF, …) is supported by the MVP.

## 5. Missing-asset behavior

If the resolved asset is missing, unreadable, or of an unsupported format,
PDF generation **must fail** with a typed error. No silent fallback and no
placeholder is rendered in the MVP.

The typed error must carry:

- the resolved absolute path that was attempted, and
- a machine-readable `reason` code, chosen from exactly one of:
  - `missing` — the file does not exist at the resolved path
  - `unreadable` — the file exists but cannot be read (permissions, I/O)
  - `unsupported-format` — the file exists but its extension is not one
    of `.png`, `.jpg`, `.jpeg`

## 6. Non-commit rule and how to provide the file locally

The signature binary must **never** be committed to the repository. This
constraint is enforced by the root `.gitignore`, which excludes:

- `assets/provider-signature.png`
- `assets/provider-signature.jpg`
- `assets/provider-signature.jpeg`

To provide the signature locally, drop the file at
`assets/provider-signature.png` (or `.jpg` / `.jpeg`) in your working
checkout. If you prefer a different location, set either
`timizer.provider-signature.path` or the `TIMIZER_PROVIDER_SIGNATURE_PATH`
environment variable (see §3).

## 7. Consumers

- **T016** — will implement the `ProviderSignatureLoader` that reads the
  asset at runtime and embeds it into the CRA PDF. `ProviderSignatureLoader`
  is the **single access point** for reading the signature file: no other
  component may open the file directly. This keeps error handling, path
  resolution, and format validation in one place.

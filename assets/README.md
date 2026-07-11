# assets/

This directory holds local, non-committed runtime assets used by the
application. Currently, it hosts the provider signature image consumed by
the CRA PDF generator.

**No signature binary is committed here.** The root `.gitignore` excludes
`assets/provider-signature.png`, `assets/provider-signature.jpg`, and
`assets/provider-signature.jpeg`; only this `README.md` and `.gitkeep` are
tracked.

See [docs/provider-signature.md](../docs/provider-signature.md) for the
convention: default location, override keys, supported formats, and
missing-asset behavior.

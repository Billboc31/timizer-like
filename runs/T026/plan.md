## Objective

Introduce configurable default CRA metadata (provider identity, client identity, client contact) loaded from Spring Boot configuration, so that newly created CRA records prefill with the personal Lyra Network defaults without requiring code changes to override them.

## Included

- Add a `CraDefaultsProperties` `@ConfigurationProperties` class (prefix `cra.defaults`) in the backend, exposing:
  - `provider.name`, `provider.company`, `provider.address`
  - `client.name`, `client.address`
  - `client.contact.name`, `client.contact.email`
- Register the properties class (via `@EnableConfigurationProperties` on the main app config or `@ConfigurationPropertiesScan`).
- Populate the seven fields in `application.yml` (or `application.properties`) with the Lyra Network personal defaults hard-coded there — not in Java source.
- If the CRA entity / DTO / repository (from tickets T002 / T004 / T005) does not yet expose those seven fields, extend the persistence model, mappers, and repository accordingly. If they already exist, only wire the defaults through.
- Inject `CraDefaultsProperties` into the CRA creation service so that when a new CRA is created without explicit provider/client data, the configured defaults are applied.
- Add a unit test on the CRA creation service asserting that a newly created CRA carries the seven expected default values.
- Add a configuration section to `docs/` (either a new `docs/configuration.md` or an appended section in an existing docs file) documenting:
  - the `cra.defaults.*` config keys and their meaning,
  - the shipped Lyra Network default values,
  - the recommended override mechanism (environment variables and/or `application-local.yml`).

## Excluded

- Multi-client management or per-CRA client selection.
- Any settings UI or admin screen.
- Authentication, authorization, or user management.
- Client signature workflow.
- Invoicing.
- Retroactive migration of already-persisted CRA rows — defaults only apply to newly created records.
- Changes to the CRA creation HTTP API contract beyond exposing defaults; no new endpoints.
- Refactor of unrelated CRA services, PDF generation, or history.

## Acceptance criteria

- The backend defines a `cra.defaults` configuration namespace covering the seven fields listed above, bound to a strongly-typed properties class.
- `application.yml` (or equivalent) ships Lyra Network default values for all seven fields, with no defaults hard-coded in Java classes.
- Any of the seven values can be overridden without modifying source code, by editing the configuration file or setting the corresponding Spring environment variable (e.g. `CRA_DEFAULTS_PROVIDER_NAME`).
- Creating a new CRA record through the existing CRA creation code path, without supplying provider/client data, produces a record whose provider name, provider company, provider address, client name, client address, client contact name, and client contact email match the configured defaults.
- A unit test in the backend verifies the previous point on the CRA creation service, using a test configuration that pins the defaults to known values.
- A documentation file under `docs/` describes the seven configuration keys, the shipped defaults, and the override mechanism, and is referenced from an existing docs index if one exists.

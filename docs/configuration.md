# Configuration — CRA defaults

The backend prefills newly created CRA (compte rendu d'activité) reports with
default provider and client metadata so the personal MVP does not require
re-entering the same data every month. All defaults are loaded from Spring
Boot configuration and can be overridden without changing source code.

## Configuration keys

Namespace: `cra.defaults`

| Key                                | Meaning                              |
| ---------------------------------- | ------------------------------------ |
| `cra.defaults.provider.name`       | Provider display name (freelancer)   |
| `cra.defaults.provider.company`    | Provider company / legal entity name |
| `cra.defaults.provider.address`    | Provider postal address              |
| `cra.defaults.client.name`         | Client display name                  |
| `cra.defaults.client.address`      | Client postal address                |
| `cra.defaults.client.contact.name` | Client point of contact — full name  |
| `cra.defaults.client.contact.email`| Client point of contact — email      |

## Shipped defaults

Defaults ship in `backend/src/main/resources/application.yml`. The client is
prefilled for the Lyra Network personal use case; the provider fields ship
with generic placeholders that the operator is expected to replace with
their own identity.

```yaml
cra:
  defaults:
    provider:
      name: "Provider Name"
      company: "Provider Company"
      address: "Provider Address"
    client:
      name: "Lyra Network"
      address: "109 rue de l'Ancienne Poste, 69100 Villeurbanne, France"
      contact:
        name: "Client Contact"
        email: "contact@example.com"
```

## Overriding defaults

Any of the seven values can be overridden without touching source code, using
either of the standard Spring Boot mechanisms:

1. **Local YAML override** — create
   `backend/src/main/resources/application-local.yml` (or another profile) and
   redefine only the keys you want to change, then run the backend with
   `SPRING_PROFILES_ACTIVE=local`.
2. **Environment variables** — Spring binds `cra.defaults.provider.name` to
   the environment variable `CRA_DEFAULTS_PROVIDER_NAME`, and so on for each
   key. For example:

   ```sh
   export CRA_DEFAULTS_PROVIDER_NAME="Jane Doe"
   export CRA_DEFAULTS_PROVIDER_COMPANY="Jane Doe Consulting"
   export CRA_DEFAULTS_PROVIDER_ADDRESS="1 Example Street, 75000 Paris"
   export CRA_DEFAULTS_CLIENT_CONTACT_NAME="John Client"
   export CRA_DEFAULTS_CLIENT_CONTACT_EMAIL="john.client@example.com"
   ```

Environment variables take precedence over `application.yml` and are the
recommended mechanism for the personal MVP because they keep operator
identity out of the versioned repository.

## Behaviour

When a new CRA record is created without explicit provider or client data,
the seven fields are populated from the configured defaults. Existing CRA
records are not migrated.

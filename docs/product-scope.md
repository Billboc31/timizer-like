# Product Scope — Timizer-like MVP

## Context

This project is a personal Timizer-like tool used to produce monthly CRA
(compte rendu d'activité) reports for freelance work with Lyra Network.
It is operated by a single provider (the repository owner) as a local
personal tool, not a multi-tenant SaaS.

## MVP scope

The first usable version covers:

- single personal user (the provider — no auth complexity beyond local usage)
- single client context (Lyra Network)
- one CRA per month
- day-by-day work entry (per calendar day)
- CRA validation step by the provider
- PDF generation with the provider signature embedded
- CRA history browsing
- PDF download of any past CRA

## Out of scope (MVP)

The following are explicitly not part of the MVP:

- client signature workflow — **phase 2**
- multi-user support
- invoicing
- expenses management
- Timizer feature parity
- implementation code (this ticket defines scope only)

## Target stack

- Frontend: React
- Backend: Spring Boot
- Database: SQLite

## Notes

This document is the functional reference for downstream implementation
tickets. Any change to the MVP boundaries — adding a feature, moving
something out of "out of scope", or reshaping the target stack — must go
through a dedicated ticket rather than an ad-hoc edit here.

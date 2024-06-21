# ADR-001: AuthN Implementation Notes

>|              |                        |
>| ------------ |------------------------|
>| Date         | `24/06/2024`           |
>| Status       | `RFC`                  |
>| Deciders     | `Engineering`          |
>| Significance | `Implementation notes` |
>| Owners       | `Mike Houston`         |

---

- [ADR-001: AuthN Implementation Notes](#adr-001-authn-implementation-notes)
  - [Context](#context)
  - [Decision](#decision)
    - [Assumptions](#assumptions)
    - [Drivers](#drivers)
    - [Options](#options)
    - [Outcome](#outcome)
    - [Rationale](#rationale)
  - [Consequences](#consequences)
  - [Compliance](#compliance)
  - [Notes](#notes)
  - [Actions](#actions)
  - [Tags](#tags)

## Context



## Decision

### Assumptions

This decision is based on the following assumptions that are used to form a set of generic requirements for the implementation as a guide.

* A log-in form should be displayed within the web application layout
* The log-in form should allow configuration for OIDC federated
  identity providers
* The log-in credentials should be captured and made available to
  other micro-frontends under the same domain

### Drivers



### Options



### Outcome

* The login and signout pages will be hosted as a micro-frontend
  using Amplify
* The frontend will be implemented using Next.js
* The backend auth service will be Cognito
* Cognito will be configured independently of Amplify to allow
  later migration to an alternative hosting solution or login
  portal if necessary
* Amplify utility library for React will be used to provide the
  login form and manage the credentials cookie. This avoids
  maintaining our own implementation of a security feature

### Rationale


## Consequences


## Compliance


## Notes


## Actions

## Tags

`#implementation,#iam,#authn`

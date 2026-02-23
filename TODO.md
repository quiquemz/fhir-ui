# PDMS UI — TODOs

Source of truth for near-term work items. (Mirrors the Copilot TODO tracker used in-chat.)

## Backlog

- [ ] 1. Introduce chatbot agent with fhir-mcp capabilities
  - Notes: Define UX entry point (side panel vs page), request/response streaming, and security boundaries.
- [ ] 2. Fix and improve edit page
  - Notes: Validate current edit flow, error states, and save/undo behavior.
- [ ] 3. Improve indirect mapping for fhir-graph
  - Notes: Clarify mapping rules and ensure graph traversal handles indirect references.
- [ ] 4. Introduce per-resource specific pretty-view of data
  - Notes: Start with top 3 resources; define component contract + fallback to JSON viewer.
- [ ] 5. Auth
  - Notes: Decide provider (OIDC/MSAL?) and required routes/guards.
- [ ] 6. Add support for advanced search in resource list
  - Notes: Define query syntax and UI for building complex filters.
- [ ] 7. Add missing resources
- [ ] 8. Categorize resources according to FHIR spec (e.g., Clinical, Administrative)
  - Notes: Define categories and update resource list UI to reflect them.
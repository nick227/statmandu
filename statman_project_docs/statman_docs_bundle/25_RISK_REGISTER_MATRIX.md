# Risk Register Matrix

| Risk | Probability | Impact | Mitigation |
|---|---:|---:|---|
| App becomes too dashboard-like | Medium | High | Keep athlete profile/media-first design as north star |
| OpenAPI grows into one giant YAML | High | Medium | Split by domain, bundle generated root only |
| Sport-agnostic design becomes too generic | Medium | High | Use sport configs to generate custom sport-specific UI |
| Live game capture is too slow | Medium | High | Large tap targets, no typing, offline queue, undo visible |
| Multiple reporters create messy conflicts | High | Medium | Event logs, consensus grouping, finalization flow, dispute footnotes |
| Empty network at launch | High | High | Seed demo profiles, allow public imported profiles before claim |
| Verification complexity slows MVP | Medium | Medium | Use simple labels first; deeper workflows later |
| Video/media moderation burden | Medium | High | YouTube-first MVP; avoid direct uploads initially |
| Profiles expose too much youth info | Medium | High | Minimize required personal data; clear public/private controls |
| Homepage becomes noisy | Medium | Medium | Structured stat-social cards, avoid generic posts initially |
| Explore overwhelms casual users | Medium | Medium | Keep advanced research separate from Home |
| Offline sync bugs corrupt stats | Medium | High | Store raw events, keep pending/accepted states, reconcile server-side |
| Disputed stats damage trust | Medium | High | Preserve versions, show compact public footnotes, allow resolution |
| Monetization distracts from growth | Low | Medium | Keep MVP free and focus on community/adoption |
| SEO weak because app is PWA | Medium | Medium | Plan SSR/pre-rendering for public entity pages |

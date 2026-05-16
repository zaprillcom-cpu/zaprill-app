<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project Architecture Rules

Follow the guidelines in [.agents/ARCHITECTURE.md](.agents/ARCHITECTURE.md).

- Always separate frontend and backend.
- Prefer API routes over Server Actions for data mutations and heavy fetching.
- Treat this as an application, not a marketing site.

# Knowledge Graph

A pre-built knowledge graph of this codebase lives at `graphify-out/graph.json` — 1695 nodes (every function, component, API route, DB table, type) and 4575 edges mapping their relationships.

**Before writing or modifying code**, run `/graphify query "<your question>"` to get context from the graph. This gives ~8x fewer tokens than reading source files directly.

Other useful graph commands:
- `/graphify query "<question>" --dfs` — trace a specific dependency chain
- `/graphify . --update` — re-extract changed files after modifying code
- `/graphify path "ModuleA" "ModuleB"` — shortest dependency path between two concepts

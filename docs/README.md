# Documentation

This directory contains documentation and diagram resources for the FinFlow microfinance platform.

## Contents

- **`GENERATE_DIAGRAMS.md`** - Instructions for generating PNG versions of Mermaid diagrams
- **`images/`** - Directory for storing diagram images (PNG/SVG)

## Generating Diagram Images

All diagrams in the main README.md are rendered using Mermaid syntax, which GitHub displays automatically. However, if you need PNG/SVG versions for presentations, documentation, or other purposes:

1. See [GENERATE_DIAGRAMS.md](./GENERATE_DIAGRAMS.md) for detailed instructions
2. Use online tools like [Mermaid Live Editor](https://mermaid.live/) or [Kroki.io](https://kroki.io/)
3. Or use the mermaid-cli command line tool

## Directory Structure

```
docs/
├── README.md (this file)
├── GENERATE_DIAGRAMS.md (diagram generation guide)
└── images/ (diagram images)
    ├── 01-system-architecture.png
    ├── 02-loan-flow.png
    ├── 03-database-schema.png
    ├── 04-multi-role-dashboard.png
    ├── 05-blockchain-integration.png
    └── 06-component-architecture.png
```

## Contributing

When adding new diagrams:
1. Add Mermaid code to the main README.md
2. Generate PNG version and save to `images/`
3. Use descriptive filenames with numbering
4. Update this README if needed

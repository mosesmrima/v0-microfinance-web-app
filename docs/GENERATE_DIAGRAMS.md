# How to Generate PNG Diagrams

This guide explains how to generate PNG versions of all Mermaid diagrams in the README.

## Option 1: Online Tools (Easiest)

### Using Mermaid Live Editor

1. Visit **[Mermaid Live Editor](https://mermaid.live/)**
2. Copy a Mermaid diagram from README.md
3. Paste it into the editor
4. Click "Actions" → "PNG" or "SVG" to download
5. Save to `docs/images/` folder with appropriate name

### Using Kroki.io

1. Visit **[Kroki.io](https://kroki.io/)**
2. Select "Mermaid" as diagram type
3. Paste your diagram code
4. Click "Download" → "PNG"

## Option 2: Command Line (Automated)

### Prerequisites

```bash
npm install -g @mermaid-js/mermaid-cli
```

### Generate All Diagrams

1. Extract each diagram to a separate `.mmd` file:

```bash
# Create directory
mkdir -p mermaid_source

# Create files (example)
cat > mermaid_source/01-system-architecture.mmd << 'EOF'
[paste diagram code here]
EOF
```

2. Generate PNGs:

```bash
# Generate all at once
for file in mermaid_source/*.mmd; do
  filename=$(basename "$file" .mmd)
  mmdc -i "$file" -o "docs/images/${filename}.png" -b transparent
done
```

## Option 3: Use mermaid.ink API

```bash
# Example for one diagram
DIAGRAM="graph TD\n    A[Start] --> B[End]"
ENCODED=$(echo -n "$DIAGRAM" | base64 | tr -d '\n')
curl -o docs/images/diagram.png "https://mermaid.ink/img/$ENCODED"
```

## Diagram Names

Save generated images with these names:

1. `01-system-architecture.png` - System Architecture
2. `02-loan-flow.png` - Loan Application User Flow
3. `03-database-schema.png` - Database Schema
4. `04-multi-role-dashboard.png` - Multi-Role Dashboard Flow
5. `05-blockchain-integration.png` - Blockchain Integration Flow
6. `06-component-architecture.png` - Component Architecture

## Adding Images to README

Once generated, you can add images to README with:

```markdown
![System Architecture](docs/images/01-system-architecture.png)
```

Or use HTML for better control:

```html
<img src="docs/images/01-system-architecture.png" alt="System Architecture" width="800"/>
```

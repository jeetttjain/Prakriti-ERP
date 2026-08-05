# Search Engine & In-Browser Preview — Technical Specification

## Full-Text Search Engine
Located under `server/src/core/data/search/searchEngine.js`. Matches query strings across filenames, document numbers, tags, customer/supplier names, and metadata fields.

---

## Preview Engine Capabilities
Located under `server/src/core/data/preview/previewEngine.js`. Generates in-browser preview metadata and HTML renderers for:
- PDF Documents (`previewType = "PDF"`)
- Image Assets (`previewType = "IMAGE"`)
- Spreadsheets & CSV (`previewType = "SPREADSHEET"`)
- Plain Text & Markdown (`previewType = "TEXT"`)

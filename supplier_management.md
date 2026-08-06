# Supplier Management & Rating Engine — Specification

## Supplier SLA & Quality Rating (`supplierRatingEngine.js`)
Calculates automated supplier scores based on:
- **On-Time Delivery Rate %**: Proportion of purchase orders delivered within promised lead time.
- **Quality Inspection Pass Rate %**: Proportion of delivered items passing quality inspection.
- **Purchase Price Variance (PPV)**: Deviation from standard procurement cost.

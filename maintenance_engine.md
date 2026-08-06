# Maintenance Mode Engine — Specification

## Maintenance Window Lifecycle (`SystemMaintenance.js`)
- **Global Maintenance**: Sets system to Read-Only mode and displays maintenance banners across all user interfaces.
- **Module Maintenance**: Restricts access to specific degraded or upgrading modules.
- **Branch Maintenance**: Restricts operations for a specific regional branch.

# Supply Chain Platform — API Reference

## Endpoints Specifications (`/api/supplychain/*`)

### 1. `GET /api/supplychain/branches`
Returns regional branch hierarchy.

### 2. `GET /api/supplychain/warehouses`
Returns list of warehouses and cold storage facilities.

### 3. `GET /api/supplychain/inventory`
Returns multi-warehouse inventory stock balances and FEFO expiry data.

### 4. `GET /api/supplychain/transfers`
Returns inter-warehouse stock transfer orders.

### 5. `GET /api/supplychain/procurement`
Returns procurement orders and goods receipts.

### 6. `GET /api/supplychain/dispatch`
Returns sales dispatch notes and packing lists.

### 7. `GET /api/supplychain/routes`
Returns delivery routes and fleet vehicle register.

### 8. `GET /api/supplychain/suppliers`
Returns supplier quality and lead-time ratings.

### 9. `GET /api/supplychain/analytics`
Generates operational metrics (Inventory Turnover %, Fill Rate %).

### 10. `POST /api/supplychain/transfer`
Initiates an inter-warehouse stock transfer.

### 11. `POST /api/supplychain/receive`
Records a procurement goods receipt.

### 12. `POST /api/supplychain/dispatch`
Generates a sales dispatch note and packing list.

### 13. `POST /api/supplychain/route`
Creates a delivery route.

### 14. `POST /api/supplychain/audit`
Conducts physical cycle count audit and posts stock variance adjustments to Finance.

### 15. `PATCH /api/supplychain/inventory`
Updates stock levels.

### 16. `DELETE /api/supplychain/transfer/:id`
Cancels a stock transfer order.

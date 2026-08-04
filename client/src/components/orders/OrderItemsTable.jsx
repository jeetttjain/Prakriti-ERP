

/**
 * Editor table for dynamic order items inside the Order Form.
 * @component
 * @param {Object} props Props
 * @param {Array} props.items Active order items list
 * @param {Array} props.products Available active product selector options
 * @param {Function} props.onChangeItems Callback updating items array in parent
 */
export default function OrderItemsTable({ items, products, onChangeItems }) {

  const handleProductChange = (index, productId) => {
    const selectedProd = products.find((p) => p._id === productId);
    if (!selectedProd) return;

    const updated = [...items];
    updated[index] = {
      ...updated[index],
      productId,
      productCode: selectedProd.productCode,
      productName: selectedProd.productName,
      category: selectedProd.category,
      unit: selectedProd.unit,
      sellingPriceSnapshot: selectedProd.sellingPrice,
      purchasePriceSnapshot: selectedProd.purchasePrice,
      amount: Number(updated[index].quantity || 0) * selectedProd.sellingPrice,
      currentStock: selectedProd.currentStock
    };
    onChangeItems(updated);
  };

  const handleQuantityChange = (index, value) => {
    const qty = Math.max(0, Number(value) || 0);
    const updated = [...items];
    const price = updated[index].sellingPriceSnapshot || 0;
    updated[index] = {
      ...updated[index],
      quantity: qty,
      amount: qty * price
    };
    onChangeItems(updated);
  };

  const handleRemarksChange = (index, value) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      remarks: value
    };
    onChangeItems(updated);
  };

  const handleAddRow = () => {
    const defaultProduct = products[0];
    if (!defaultProduct) return;

    const newItem = {
      productId: defaultProduct._id,
      productCode: defaultProduct.productCode,
      productName: defaultProduct.productName,
      category: defaultProduct.category,
      unit: defaultProduct.unit,
      quantity: 1,
      purchasePriceSnapshot: defaultProduct.purchasePrice,
      sellingPriceSnapshot: defaultProduct.sellingPrice,
      taxSnapshot: 0,
      amount: defaultProduct.sellingPrice,
      remarks: "",
      currentStock: defaultProduct.currentStock
    };
    onChangeItems([...items, newItem]);
  };

  const handleRemoveRow = (index) => {
    const filtered = items.filter((_, idx) => idx !== index);
    onChangeItems(filtered);
  };

  return (
    <div style={{ marginTop: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <strong style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>Order Items *</strong>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={handleAddRow}
          disabled={products.length === 0}
          aria-label="Add product item row"
        >
          + Add Product
        </button>
      </div>

      <div className="table-container">
        <table className="custom-table" style={{ fontSize: "0.85rem" }}>
          <thead>
            <tr>
              <th>Product Selection</th>
              <th>Unit</th>
              <th>Available Stock</th>
              <th>Quantity</th>
              <th>Price (₹)</th>
              <th>Amount (₹)</th>
              <th>Remarks</th>
              <th style={{ textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ minWidth: "150px" }}>
                  <select
                    className="form-select"
                    value={item.productId || ""}
                    onChange={(e) => handleProductChange(idx, e.target.value)}
                    aria-label="Product selector"
                    style={{ padding: "4px 8px", fontSize: "0.85rem" }}
                  >
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.productName} ({p.productCode})
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <span className="badge badge-info">{item.unit || "Kg"}</span>
                </td>
                <td style={{ fontWeight: 600, color: "var(--text-light)" }}>
                  {item.currentStock !== undefined ? `${item.currentStock} ${item.unit || "Kg"}` : "-"}
                </td>
                <td style={{ width: "90px" }}>
                  <input
                    type="number"
                    min="0.001"
                    step="any"
                    className="form-input"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(idx, e.target.value)}
                    aria-label="Product quantity"
                    style={{ padding: "4px 8px", fontSize: "0.85rem", width: "100%" }}
                  />
                </td>
                <td>₹{(item.sellingPriceSnapshot || 0).toFixed(2)}</td>
                <td>₹{(item.amount || 0).toFixed(2)}</td>
                <td>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Remarks"
                    value={item.remarks || ""}
                    onChange={(e) => handleRemarksChange(idx, e.target.value)}
                    aria-label="Item remarks"
                    style={{ padding: "4px 8px", fontSize: "0.85rem", width: "100%" }}
                  />
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    type="button"
                    className="btn-inline-remove"
                    onClick={() => handleRemoveRow(idx)}
                    aria-label="Remove item row"
                    style={{ fontSize: "1.2rem", padding: "0 6px" }}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

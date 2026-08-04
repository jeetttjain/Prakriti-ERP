/**
 * Renders invoice items list in the Invoice Form.
 * @component
 * @param {Object} props Props
 * @param {Array} props.items Active invoice items list
 * @param {boolean} props.isReadOnly True if form is locked/Issued
 * @param {Function} props.onChangeItems Callback updating items array in parent
 */
export default function InvoiceItemsTable({ items, isReadOnly, onChangeItems }) {

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

  return (
    <div style={{ marginTop: "16px" }}>
      <strong style={{ display: "block", fontSize: "0.9rem", color: "var(--text-main)", marginBottom: "12px" }}>
        Invoice Items
      </strong>

      <div className="table-container">
        <table className="custom-table" style={{ fontSize: "0.85rem" }}>
          <thead>
            <tr>
              <th>Product Code</th>
              <th>Product Name</th>
              <th>Unit</th>
              <th>Quantity</th>
              <th>Price (₹)</th>
              <th>Amount (₹)</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 600 }}>{item.productCode}</td>
                <td>{item.productName}</td>
                <td>
                  <span className="badge badge-info">{item.unit || "Kg"}</span>
                </td>
                <td style={{ width: "90px" }}>
                  {isReadOnly ? (
                    <span>{item.quantity}</span>
                  ) : (
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
                  )}
                </td>
                <td>₹{(item.sellingPriceSnapshot || 0).toFixed(2)}</td>
                <td style={{ fontWeight: 600 }}>₹{(item.amount || 0).toFixed(2)}</td>
                <td>
                  {isReadOnly ? (
                    <span>{item.remarks || "-"}</span>
                  ) : (
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Remarks"
                      value={item.remarks || ""}
                      onChange={(e) => handleRemarksChange(idx, e.target.value)}
                      aria-label="Item remarks"
                      style={{ padding: "4px 8px", fontSize: "0.85rem", width: "100%" }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

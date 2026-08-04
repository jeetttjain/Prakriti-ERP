/**
 * Color-coded Status Badge indicator for B2B Invoices module.
 * @component
 * @param {Object} props Props
 * @param {"invoice"|"payment"} props.type Badge category type
 * @param {string} props.value Active status flag value
 */
export default function InvoiceStatusBadge({ type, value }) {
  const normalizedValue = (value || "").toLowerCase();

  let badgeClass = "badge-secondary";

  if (type === "invoice") {
    switch (normalizedValue) {
      case "draft":
        badgeClass = "badge-info";
        break;
      case "issued":
        badgeClass = "badge-primary";
        break;
      case "partially paid":
        badgeClass = "badge-warning";
        break;
      case "paid":
        badgeClass = "badge-success";
        break;
      case "cancelled":
        badgeClass = "badge-danger";
        break;
      default:
        badgeClass = "badge-secondary";
    }
  } else if (type === "payment") {
    switch (normalizedValue) {
      case "pending":
        badgeClass = "badge-danger";
        break;
      case "partial":
        badgeClass = "badge-warning";
        break;
      case "paid":
        badgeClass = "badge-success";
        break;
      default:
        badgeClass = "badge-secondary";
    }
  }

  return (
    <span className={`badge ${badgeClass}`} title={`${type} status: ${value}`}>
      {value}
    </span>
  );
}

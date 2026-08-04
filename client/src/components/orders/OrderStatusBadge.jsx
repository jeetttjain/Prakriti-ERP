/**
 * Reusable Status Badge indicators matching Prakriti design themes.
 * @component
 * @param {Object} props Props
 * @param {"order"|"payment"|"delivery"|"invoice"} props.type Badge category type
 * @param {string} props.value Active status flag value
 */
export default function OrderStatusBadge({ type, value }) {
  const normalizedValue = (value || "").toLowerCase();

  let badgeClass = "badge-secondary";

  if (type === "order") {
    switch (normalizedValue) {
      case "draft":
        badgeClass = "badge-info";
        break;
      case "confirmed":
        badgeClass = "badge-success";
        break;
      case "packed":
        badgeClass = "badge-warning";
        break;
      case "out for delivery":
        badgeClass = "badge-primary";
        break;
      case "delivered":
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
  } else if (type === "delivery") {
    switch (normalizedValue) {
      case "pending":
        badgeClass = "badge-danger";
        break;
      case "packed":
        badgeClass = "badge-warning";
        break;
      case "out for delivery":
        badgeClass = "badge-primary";
        break;
      case "delivered":
        badgeClass = "badge-success";
        break;
      case "cancelled":
        badgeClass = "badge-danger";
        break;
      default:
        badgeClass = "badge-secondary";
    }
  } else if (type === "invoice") {
    switch (normalizedValue) {
      case "not invoiced":
        badgeClass = "badge-danger";
        break;
      case "partially invoiced":
        badgeClass = "badge-warning";
        break;
      case "fully invoiced":
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

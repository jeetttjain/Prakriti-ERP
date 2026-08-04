/**
 * Color-coded Status Badge indicator for B2B Payments module.
 * @component
 * @param {Object} props Props
 * @param {string} props.value Active status flag value
 */
export default function PaymentStatusBadge({ value }) {
  const normalizedValue = (value || "").toLowerCase();

  let badgeClass;

  switch (normalizedValue) {
    case "completed":
      badgeClass = "badge-success";
      break;
    case "pending":
      badgeClass = "badge-info";
      break;
    case "failed":
    case "cancelled":
      badgeClass = "badge-danger";
      break;
    case "refunded":
      badgeClass = "badge-warning";
      break;
    default:
      badgeClass = "badge-secondary";
  }

  return (
    <span className={`badge ${badgeClass}`} title={`Payment status: ${value}`}>
      {value}
    </span>
  );
}

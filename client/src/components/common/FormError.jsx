/**
 * Standard inline validation label notice.
 * @component
 * @param {Object} props Props
 * @param {string} [props.error] Validation error message
 */
export default function FormError({ error }) {
  if (!error) return null;
  return <span className="form-error-msg" role="alert">{error}</span>;
}

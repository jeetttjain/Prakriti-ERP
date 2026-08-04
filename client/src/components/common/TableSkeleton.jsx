/**
 * Renders a pulsing table loading skeleton.
 * @component
 * @param {Object} props Props
 * @param {number} [props.rows=5] Number of placeholder rows
 * @param {number} [props.columns=7] Number of columns
 */
export default function TableSkeleton({ rows = 5, columns = 7 }) {
  const rowList = Array.from({ length: rows });
  const colList = Array.from({ length: columns });

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {colList.map((_, idx) => (
              <th key={idx}>
                <div className="skeleton-bar" style={{ width: idx === 0 ? "120px" : "80px" }}></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowList.map((_, rowIdx) => (
            <tr key={rowIdx}>
              {colList.map((_, colIdx) => (
                <td key={colIdx} style={{ textAlign: colIdx === columns - 1 ? "right" : "left" }}>
                  <div
                    className="skeleton-bar"
                    style={{
                      width: colIdx === 0 ? "130px" : colIdx === columns - 1 ? "100px" : "80px",
                      marginLeft: colIdx === columns - 1 ? "auto" : "0"
                    }}
                  ></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

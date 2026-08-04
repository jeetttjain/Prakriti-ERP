import React, { useMemo } from "react";

/**
 * Generic responsive custom SVG/CSS charting component.
 * Supports: Line, Area, Bar, and Donut visualizations with zero dependencies.
 * @component
 * @param {Object} props
 * @param {string} props.title Chart heading
 * @param {string} [props.type='bar'] Chart layout ('bar' | 'line' | 'area' | 'donut')
 * @param {Array} props.data List of objects containing label and value e.g. [{ label: 'Jan', value: 120 }]
 */
export default function ChartContainer({ title, type = "bar", data = [] }) {
  const chartData = useMemo(() => {
    return (data || []).map((item) => ({
      label: item.label || item._id || "Other",
      value: Number(item.value || item.total || item.totalSales || item.count || 0),
    }));
  }, [data]);

  const maxVal = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.value), 0);
    return max === 0 ? 1 : max;
  }, [chartData]);

  // Render Bar layout
  if (type === "bar") {
    return (
      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
        <h4 style={{ margin: "0 0 16px 0", fontWeight: "700", fontSize: "0.95rem" }}>{title}</h4>
        {chartData.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af" }}>No trend data to display</div>
        ) : (
          <div style={{ display: "flex", gap: "12px", alignItems: "end", height: "180px", paddingTop: "20px", paddingBottom: "10px" }}>
            {chartData.map((d, idx) => {
              const pct = (d.value / maxVal) * 100;
              return (
                <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "end" }}>
                  <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
                    <div
                      className="chart-bar-hover"
                      style={{
                        width: "80%",
                        maxWidth: "32px",
                        height: `${Math.max(4, pct)}%`,
                        background: "linear-gradient(to top, var(--primary-color) 0%, #4ade80 100%)",
                        borderRadius: "4px 4px 0 0",
                        transition: "height 0.4s ease-out",
                      }}
                      title={`${d.label}: ${d.value}`}
                    />
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "8px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", width: "100%", textAlign: "center" }}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Render Line or Area layout
  if (type === "line" || type === "area") {
    const width = 500;
    const height = 150;
    const padding = 20;

    const points = useMemo(() => {
      if (chartData.length <= 1) return "";
      return chartData
        .map((d, idx) => {
          const x = (idx / (chartData.length - 1)) * (width - 2 * padding) + padding;
          const y = height - padding - (d.value / maxVal) * (height - 2 * padding);
          return `${x},${y}`;
        })
        .join(" ");
    }, [chartData, maxVal]);

    const areaPoints = useMemo(() => {
      if (chartData.length <= 1) return "";
      const firstX = padding;
      const lastX = width - padding;
      const baseY = height - padding;
      return `${firstX},${baseY} ${points} ${lastX},${baseY}`;
    }, [points, chartData]);

    return (
      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
        <h4 style={{ margin: "0 0 16px 0", fontWeight: "700", fontSize: "0.95rem" }}>{title}</h4>
        {chartData.length <= 1 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af" }}>Insufficient data points to plot trend</div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "150px" }}>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid lines */}
              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f3f4f6" strokeWidth="1" />
              <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#f3f4f6" strokeWidth="1" />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1.5" />

              {/* Area path */}
              {type === "area" && <polygon points={areaPoints} fill="url(#chartGrad)" />}

              {/* Line path */}
              <polyline points={points} fill="none" stroke="var(--primary-color)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Dots */}
              {chartData.map((d, idx) => {
                const x = (idx / (chartData.length - 1)) * (width - 2 * padding) + padding;
                const y = height - padding - (d.value / maxVal) * (height - 2 * padding);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="var(--card-bg, #fff)"
                    stroke="var(--primary-color)"
                    strokeWidth="2"
                    style={{ cursor: "pointer" }}
                    title={`${d.label}: ${d.value}`}
                  />
                );
              })}
            </svg>
          </div>
        )}
      </div>
    );
  }

  // Render Donut chart
  if (type === "donut") {
    const totalSum = chartData.reduce((sum, d) => sum + d.value, 0) || 1;
    
    // Build gradient sectors
    let accumulated = 0;
    const colors = ["#22c55e", "#3b82f6", "#ef4444", "#eab308", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];
    const conicSectors = chartData.map((d, idx) => {
      const startPct = (accumulated / totalSum) * 100;
      const endPct = ((accumulated + d.value) / totalSum) * 100;
      accumulated += d.value;
      const color = colors[idx % colors.length];
      return `${color} ${startPct}% ${endPct}%`;
    }).join(", ");

    return (
      <div style={{ background: "var(--card-bg, #fff)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "20px" }}>
        <h4 style={{ margin: "0 0 16px 0", fontWeight: "700", fontSize: "0.95rem" }}>{title}</h4>
        {chartData.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#9ca3af" }}>No category shares to display</div>
        ) : (
          <div style={{ display: "flex", gap: "20px", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap" }}>
            <div
              style={{
                width: "140px",
                height: "140px",
                borderRadius: "50%",
                background: `conic-gradient(${conicSectors})`,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Donut inner hole */}
              <div
                style={{
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  background: "var(--card-bg, #fff)",
                }}
              />
            </div>

            {/* Legends list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.8rem", maxWidth: "200px" }}>
              {chartData.map((d, idx) => {
                const color = colors[idx % colors.length];
                const pct = ((d.value / totalSum) * 100).toFixed(1);
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color }} />
                    <span style={{ fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                      {d.label}: {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

import React from "react";

/**
 * Category filter tabs component.
 * @component
 */
export default function CategoryTabs({ categories = [], selectedCategory, onSelectCategory }) {
  const allCategories = ["All", ...categories];

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        overflowX: "auto",
        paddingBottom: "8px",
        marginBottom: "16px",
        scrollbarWidth: "none",
      }}
    >
      {allCategories.map((cat) => {
        const isSelected = selectedCategory === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: "600",
              whiteSpace: "nowrap",
              border: isSelected ? "1px solid #16a34a" : "1px solid #cbd5e1",
              background: isSelected ? "#16a34a" : "#ffffff",
              color: isSelected ? "#ffffff" : "#334155",
              cursor: "pointer",
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}

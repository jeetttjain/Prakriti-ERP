/**
 * Central constants configuration for Product properties.
 * Modify these lists to add or extend allowed items in the B2B ERP system.
 */

const ALLOWED_CATEGORIES = ["Vegetable", "Fruit"];

const ALLOWED_UNITS = [
  "Kg",
  "Gram",
  "Piece",
  "Bundle",
  "Packet",
  "Box",
  "Crate",
  "Litre",
  "Dozen"
];

module.exports = {
  ALLOWED_CATEGORIES,
  ALLOWED_UNITS
};

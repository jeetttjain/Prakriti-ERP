class UnitConversionEngine {
  /**
   * Converts produce units (Sacks, Boxes, Crates) to base Kilograms (Kg).
   */
  convertToKg(quantity, uom = "Kg") {
    const conversions = {
      Kg: 1,
      Gram: 0.001,
      Ton: 1000,
      Piece: 0.25, // average 250g per piece
      Sack: 50,    // 1 Sack = 50 Kg
      Box: 12,     // 1 Box = 12 Kg
      Crate: 25,   // 1 Crate = 25 Kg
    };

    const factor = conversions[uom] || 1;
    return quantity * factor;
  }
}

module.exports = new UnitConversionEngine();

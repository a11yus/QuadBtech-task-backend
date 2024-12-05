const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: {
    type: Number,
    min: [1, "wrong min price"],
    max: [10000, "wrong max price"],
  },
  availableColors: {
    type: [String],
    required: true,
    validate: {
      validator: function (value) {
        return value.length > 0; // Ensure at least one color is specified
      },
      message: "At least one color must be specified",
    },
  },
  originalPrice: {
    type: Number,
    min: [1, "wrong min price"],
    max: [10000, "wrong max price"],
  },
  rating: {
    type: Number,
    min: [0, "wrong min rating"],
    max: [5, "wrong max rating"],
    default: 0,
  },
  images: { type: [String], required: true },
  brand: { type: String, required: true },
  description: { type: String },
  discountPrice: { type: Number, default: 0 },
  discountPercentage: {
    type: Number,
    min: [1, "wrong min discount"],
    max: [99, "wrong max discount"],
  },
  stock: { type: Number, min: [0, "wrong min stock"], default: 0 },
});

module.exports = mongoose.model("productModel", productSchema);

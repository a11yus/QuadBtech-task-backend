const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartItems = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "productModel", required: true },
  quantity: {
    type: Number,
    min: [0, "wrong min quantity"],
    max: [100, "wrong max quantity"],
    default: 0,
    required: true,
  },
});

const cartSchema = new Schema(
  {
    orderPrice: { type: Number, required: true },
    customer: { type: Schema.Types.ObjectId, ref: "userModel", required: true },
    cartItems: { type: [cartItems] },
  },
  { timeStamps: true }
);

module.exports = mongoose.model("cartModel", cartSchema);

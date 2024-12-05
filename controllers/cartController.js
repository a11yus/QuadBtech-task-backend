const cartModel = require("../models/cart.model");

exports.fetchCartByUser = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("userId", userId);

    // Check if cart exists for the user
    let cart = await cartModel
      .findOne({ customer: userId.toString() })
      .populate({
        path: "cartItems.product",
        select: "title price availableColors images brand", // Include necessary fields
      })
      .exec();

    if (!cart) {
      // If no cart exists, create a new cart for the user
      cart = await cartModel.create({ customer: userId, orderPrice: 0, cartItems: [] });
      return res.status(404).json({ message: "No cart found for this user, a new cart has been created.", cart });
    }

    const transformedCartItems = cart.cartItems.map((item) => ({
      ...item.product.toObject(),
      quantity: item.quantity,
      _id: item._id, // Retain the cart item ID
    }));

    const transformedCart = {
      _id: cart._id,
      orderPrice: cart.orderPrice,
      customer: cart.customer,
      cartItems: transformedCartItems,
      __v: cart.__v,
    };

    res.status(200).json(transformedCart);
  } catch (err) {
    console.error("Error fetching cart:", err.message);
    res.status(500).json({ message: "Failed to fetch cart.", error: err });
  }
};


exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const customerId = req.user._id;

  try {
    // Check if the cart exists for the customer
    let cart = await cartModel.findOne({ customer: customerId });

    if (!cart) {
      // Create a new cart if none exists
      cart = new cartModel({
        customer: customerId,
        orderPrice: 0,
        cartItems: [],
      });
    }

    // Check if the product is already in the cart
    const existingItem = cart.cartItems.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      // Update the quantity of the existing item
      existingItem.quantity += quantity;

      if (existingItem.quantity > 100) {
        return res.status(400).json({ message: "Quantity exceeds the limit" });
      }
    } else {
      // Add the new product to the cart
      cart.cartItems.push({ product: productId, quantity });
    }

    // Recalculate the order price
    const populatedCart = await cart.populate("cartItems.product");
    cart.orderPrice = populatedCart.cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    // Save the updated cart
    const updatedCart = await cart.save();
    const result = await updatedCart.populate({
      path: "cartItems.product",
      select: "title price availableColors brand images",
    });

    // Transform the cartItems structure
    const transformedCart = {
      ...result.toObject(),
      cartItems: result.cartItems.map((item) => ({
        ...item.product.toObject(),
        quantity: item.quantity,
        _id: item._id, // Retain the cart item ID
      })),
    };

    res.status(200).json(transformedCart);
  } catch (err) {
    console.error("Error in addToCart:", err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

// exports.removeFromCart = async (req, res) => {
//   const { id } = req.params; // ID of the cart item to remove

//   try {
//     // Find the cart that contains the item and remove it using $pull
//     const updatedCart = await cartModel
//       .findOneAndUpdate(
//         { "cartItems._id": id }, // Find the cart containing the item
//         { $pull: { cartItems: { _id: id } } }, // Remove the item
//         { new: true } // Return the updated cart document
//       )
//       .populate("cartItems.product");

//     if (!updatedCart) {
//       return res.status(404).json({ message: "Cart item not found." });
//     }

//     // Recalculate the order price after the item is removed
//     updatedCart.orderPrice = updatedCart.cartItems.reduce((total, item) => {
//       return total + item.product.price * item.quantity;
//     }, 0);

//     // Save the updated cart
//     await updatedCart.save();

//     // Transform the updated cart response
//     const transformedCart = {
//       ...updatedCart.toObject(),
//       cartItems: updatedCart.cartItems.map((item) => ({
//         ...item.product.toObject(),
//         quantity: item.quantity,
//         _id: item._id, // Retain the cart item ID
//       })),
//     };

//     res.status(200).json(transformedCart);
//   } catch (err) {
//     console.error("Error in removeFromCart:", err);
//     res.status(500).json({ message: "Internal Server Error", error: err });
//   }
// };

exports.removeFromCart = async (req, res) => {
  const { id } = req.params; // The ID of the cart item to remove

  try {
    // Attempt to find the cart and remove the cart item
    const cart = await cartModel.findOneAndUpdate(
      { "cartItems._id": id }, // Find the cart containing the item to delete
      { $pull: { cartItems: { _id: id } } }, // Remove the item from the cart
      { new: true } // Return the updated cart after modification
    );

    // If no cart is found, return a 404 response
    if (!cart) {
      return res.status(404).json({ message: "Cart item not found." });
    }

    // Send a simple success message
    res.status(200).json({ message: "Cart item successfully removed." });
  } catch (err) {
    console.error("Error in removeFromCart:", err);
    res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

const productModel = require("../models/product.model");

exports.fetchAllProducts = async (req, res) => {
  try {
    const { sort, minPrice, maxPrice, moreThan500price } = req.query;

    // Build the filter object
    const filter = {};

    if (moreThan500price === "true") {
      filter.price = { $gt: 500 }; // Products with price greater than 500
    } else {
      if (minPrice) filter.price = { $gte: parseFloat(minPrice) };
      if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    }

    // Build the sorting option
    const sortOption = {};
    if (sort === "high-to-low") sortOption.price = -1;
    if (sort === "low-to-high") sortOption.price = 1;

    // Query the database with filters and sorting
    const products = await productModel.find(filter).sort(sortOption);

    if (products.length === 0) {
      return res.status(404).send({
        isError: false,
        msg: "No products found with the given criteria.",
        data: [],
      });
    }

    return res.status(200).send({
      isError: false,
      msg: "Successfully fetched products!",
      data: products,
    });
  } catch (err) {
    return res.status(500).send({
      isError: true,
      msg: err.message,
    });
  }
};


exports.fetchProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).send({
        isError: true,
        msg: "Product not found.",
      });
    }
    return res.status(200).send({
      isError: false,
      msg: "Successfully product details fetched !",
      data: product,
    });
  } catch (err) {
    return res.status(500).send({
      isError: true,
      msg: err.message,
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    // Handle both bulk and single product
    const products = Array.isArray(req.body) ? req.body : [req.body];

    // Loop through products if it's a bulk insert
    const result = await Promise.all(
      products.map(async (productData) => {
        const product = new productModel(productData);

        // Validate and calculate discount price if discountPercentage exists
        if (product.discountPercentage !== undefined) {
          product.discountPrice = Math.round(
            product.price * (1 - product.discountPercentage / 100)
          );
        }

        const doc = await product.save();
        return doc;
      })
    );

    res.status(201).json(result);
  } catch (err) {
    console.log("err", err);
    res.status(400).json(err);
  }
};
 
exports.updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).send({
        isError: true,
        msg: "Product not found",
      });
    }

    // Update product fields
    Object.assign(product, req.body);

    // Ensure price and discountPercentage are valid numbers
    const price = parseFloat(product.price);
    const discountPercentage = parseFloat(product.discountPercentage) || 0; // Default to 0 if missing

    if (isNaN(price)) {
      return res.status(400).send({
        isError: true,
        msg: "Invalid price value",
      });
    }

    // Calculate discountPrice
    product.discountPrice = Math.round(price * (1 - discountPercentage / 100));

    // Save updated product
    const updatedProduct = await product.save();

    return res.status(200).send({
      isError: false,
      msg: "Successfully updated product details!",
      data: updatedProduct,
    });
  } catch (err) {
    return res.status(500).send({
      isError: true,
      msg: err.message,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await productModel.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(204).send({
      isError: false,
      msg: "Successfully product deleted !",
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

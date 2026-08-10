import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const { title, link, explanation, images, order, isActive } = req.body;

    const product = new Product({
      title,
      link: link ?? "",
      explanation: explanation ?? "",
      images: Array.isArray(images) ? images : [],
      order: order ?? 0,
      isActive: isActive !== false,
    });

    await product.save();

    res.status(201).json({
      success: true,
      msg: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to create product",
      error: error.message,
    });
  }
};

export const getProductList = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      msg: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to fetch products",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link, explanation, images, order, isActive } = req.body;

    const updateData = {
      ...(title !== undefined && { title }),
      ...(link !== undefined && { link }),
      ...(explanation !== undefined && { explanation }),
      ...(images !== undefined && {
        images: Array.isArray(images) ? images : [],
      }),
      ...(order !== undefined && { order }),
      ...(isActive !== undefined && { isActive }),
    };

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Product updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to update product",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        msg: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to delete product",
      error: error.message,
    });
  }
};

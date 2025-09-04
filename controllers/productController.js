import Product from "../models/productSchema.js";

const createProduct = async (req, res) => {
    try {
        const { name, description, price, imageUrl, stockCount } = req.body;

        if (!name || !description || !price || !imageUrl || !stockCount) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const product = await Product.create({
            name, description, price, imageUrl, stockCount
        });

        return res.status(201).json({
            message: "Product created successfully",
            product
        })
    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const getProducts = async (req, res) => {
    try {
        const product = await Product.find();
        return res.status(200).json({
            message: "Products fetched successfully",
            products: product
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export { createProduct, getProducts };
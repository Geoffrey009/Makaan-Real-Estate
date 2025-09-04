import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    name: {
        type: String, required: true, trim: true,
    },
    description: {
        type: String, required: true, trim: true,
    },
    price: {
        type: Number, required: true, default: 0,
    },
    imageUrl: {
        type: String, required: true, trim: true,
    },
    category: {
        type: String, required: false, trim: true,
    },
    stockCount: {
        type: Number, required: true, default: 0,
    },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;
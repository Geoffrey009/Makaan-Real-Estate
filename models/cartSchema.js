import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1,
        }
    }],
    total: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
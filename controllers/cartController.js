import Cart from "../models/cartSchema.js";
import Product from "../models/productSchema.js";

// Add to cart
const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (!productId || quantity <= 0) {
            return res.status(400).json({ message: 'Invalid product or quantity' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            cart = await Cart.create({ userId: req.user.id, products: [] });
        }

        const existingItem = cart.products.find(item => item.productId.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.products.push({ productId, quantity });
        }

        cart.total = await calculateCartTotal(cart.products);
        await cart.save();

        res.json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add to cart' });
    }
};

// Calculate cart total
const calculateCartTotal = async (products) => {
    let total = 0;
    for (const item of products) {
        const product = await Product.findById(item.productId);
        if (product) {
            total += product.price * item.quantity;
        }
    }
    return total;
};

// Get cart
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }).populate('products.productId');
        res.json(cart || { products: [], total: 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch cart' });
    }
};

export { addToCart, getCart };

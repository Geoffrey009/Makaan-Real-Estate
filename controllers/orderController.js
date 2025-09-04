import Cart from "../models/cartSchema.js";
import Order from "../models/orderSchema.js";
import Product from "../models/productSchema.js";

const placeOrder = async (req, res) => {
    try {
        const user = req.user.id;

        const cart = await Cart.findOne({ userId: user }).populate('products.productId');

        console.log(`User ID: ${user}, Cart found: ${!!cart}`);
        if (!cart || cart.products.length === 0) {
            console.log(`"DEBUG": Cart is empty`);
            return res.status(400).json({ message: 'Cart is empty' });
        }

        console.log(`"DEBUG": mapping through products`);
        const orderItems = cart.products.map(product => ({
            product: product.productId,
            quantity: product.quantity,
        }));

        let totalPrice = cart.total || 0;
        if (totalPrice === 0) {
            totalPrice = await calculateOrderTotal(cart.products);
        }

        console.log(`"DEBUG": Creating order`);
        const newOrder = await Order.create({
            user,
            orderItems,
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
            totalPrice,
        });
        console.log(`"DEBUG": Order created`);

        cart.products = [];
        cart.total = 0;

        console.log(`"DEBUG": Saving order`);
        await cart.save();

        res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
        res.status(500).json({ message: 'Failed to place order' });
    }
}

// Calculate order total
const calculateOrderTotal = async (products) => {
    let total = 0;
    for (const item of products) {
        const product = await Product.findById(item.productId);
        if (product) {
            total += product.price * item.quantity;
        }
    }
    return total;
};

const getOrders = async (req, res) => {
    try {
        let orders;

        if (req.user.isAdmin) {
            orders = await Order.find().populate('user.email').populate('orderItems.product');
        } else {
            orders = await Order.find({ user: req.user.id }).populate('orderItems.product')
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get orders' });
    }
}

export { getOrders, placeOrder }
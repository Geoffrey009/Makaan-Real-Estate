import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: Number
        }
    ],
    shippingAddress: {
        address: String,
        city: String,
        postalCode: String,
        country: String
    },
    paymentMethod: String,
    totalPrice: Number,
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: Date,
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: Date
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;
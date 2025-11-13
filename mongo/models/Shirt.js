import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    name: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
}, { _id: false });

const ShirtSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    additionalInfo: { type: String, default: "" },
    products: { type: [ProductSchema], required: true },
    total: { type: Number, required: true },
    orderDate: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.models.Shirt || mongoose.model("Shirt", ShirtSchema);

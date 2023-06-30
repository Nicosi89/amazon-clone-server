const mongoose = require("mongoose");
const {productSchema} = require('./product');



//se define el schema
const orderSchema = new mongoose.Schema({
    products: [
        {
      product: productSchema,
      //required: true,
      quantity: {
        type: Number,
        required: true,
      }
      }
    ],
    
      totalPrice: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      userId: {
        required: true,
        type: String,
      },
      orderedAt: {
        type: Number,
        required: true,
      },
      // es un campo que por defecto se asigna a 0
      status: {
        type: Number,
        default: 0,
      },
    });
    
    const Order = mongoose.model("Order", orderSchema);
    module.exports = Order;

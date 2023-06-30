const mongoose = require("mongoose");
const ratingSchema = require("./ratings");


//se define el schema
const productSchema = new mongoose.Schema({
    name: {
      type: String,
      //required: true,
      trim: true,
    },
    description: {
      type: String,
      //required: true,
      trim: true,
    },
    //una lista de objetos
    images: [
      {
        type: String,
        //required: true,
      },
    ],
    quantity: {
      type: Number,
      //required: true,
    },
    price: {
      type: Number,
      //required: true,
    },
    category: {
      type: String,
      //required: true,
    },
    ratings: [ratingSchema],
    
  });

  //se crea una colección en la base de datos Mongo DB
  const Product = mongoose.model("Producto", productSchema);
  //se exportan para que otros módulos tengan acceso a él.
  module.exports = {Product, productSchema};


const express = require("express");
const userRouter = express.Router();
const auth = require("../middlewares/auth");
const {Product} = require("../models/product");
const User = require("../models/user");




userRouter.post('/api/add-to-cart', auth, async (req, res) => {
try{
    const { id } = req.body;
    //busca el producto en la base de datos
    const product = await Product.findById(id);
    let user = await User.findById(req.user);
    //console.log('el producto del usuario es ' + user.cart[0].product);
    //console.log('El id de producto es: ' + product._id)

    //si está vacio se agrega el producto con la cantidad 
    //ojo que en la estructura del objeto que se envía dede ser la misma
    // que el del modelo. ej: {product:xx quantity:xx}
    if(user.cart.length == 0){
        user.cart.push({
            product, 
            quantity: 1});
    }else{
    //sino se recorre uno a uno buscando si ya hay un prodcuto agregado
    // igual al que se quiere agregar al carrito
      let isProductEqual = false;
      for(let i = 0; i<user.cart.length; i++){
        //console.log(user.cart[i]);
        
        //no se utiliza el == ya que se trata de objetos (objectID)
        //y los objetos no se pueden comparar con == en js
        if(user.cart[i].product._id.equals(product._id)){
            isProductEqual = true;
        }
      }
      console.log(isProductEqual);
        //si se ha encontrado un  producto igual al que se quiere agregar
        if(isProductEqual){
            //se guarda el producto que ya está 
            let producttt = user.cart.find((x)=> x.product._id.equals(product._id));
            producttt.quantity += 1;
        }else{
            user.cart.push({product, quantity: 1});
        }


    }
    user = await user.save();
    res.json(user);
}catch(e){
    res.status(500).json({error: e.message});
}
    

    });

userRouter.delete('/api/remove-from-cart/:id', auth, async (req, res) => {
try{
    const { id } = req.params;
    //busca el producto en la base de datos
    const product = await Product.findById(id);
    //busca el usuario en la DB y lo guarda en una variable
    let user = await User.findById(req.user);
    
    //se busca en esa variable y se hacen los cambios necesarios
    for(let i = 0; i<user.cart.length; i++){
        if(user.cart[i].product._id.equals(product._id)){
            if(user.cart[i].quantity == 1){
                //la función splice elimina el número de elmeentos de segundo parámetro
                //desde la posición del primer parámetro 
                user.cart.splice(i,1);
            } else {
                user.cart[i].quantity -= 1;
            }

        }
    }
    //una vez se ha cambiado el objeto user se carga de nuevo en la DB
    user = await user.save();
    res.json(user);
}catch(e){
    res.status(500).json({error: e.message});
}
    
});

userRouter.post('/api/update-address', auth, async (req, res) => {
    try{
        const id = req.user;
        const {address} = req.body;
        //busca el usuario en la DB y lo guarda en una variable
        let user = await User.findById(id);
        
        //se busca en esa variable y se hacen los cambios necesarios
        user.address = address;
        //una vez se ha cambiado el objeto user se carga de nuevo en la DB
        user = await user.save();
        res.json(user);
    }catch(e){
        res.status(500).json({error: e.message});
    }
});












module.exports = userRouter;
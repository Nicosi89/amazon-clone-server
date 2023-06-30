const express = require('express');
const ordersRouter = express.Router();
const auth = require("../middlewares/auth");
const mercadopago = require('mercadopago');
const Order = require('../models/order');
const { Product } = require('../models/product');
const User = require('../models/user');

//mercadopago
/* ordersRouter.post('/orders/create-order', auth, async(req, res) => {

    try{

        mercadopago.configure({
            access_token: 'TEST-4452926565867874-062311-1c03194a8ca982589bbaaf1c95b74903-1406213252',
          });
     

         
    const result = await mercadopago.preferences.create({
        items: [
            {
                title: "Laptop",
                unit_price: 500,
                currency_id: "COP",
                quantity: 1, 
            }
        ],
        //las rutas que se activan según es estado de respuesta
        back_urls: {
            success: "http://localhost:3000/orders/sucess",
            failure: "http://localhost:3000/orders/failure",
            pending: "http://localhost:3000/orders/pending",
        }, 
        //notificación vía webhook del estado de la transacción
        notification_url: "https://2b50-186-84-90-175.ngrok.io/orders/webhook"
    })
    console.log(result);
    res.json(result.body);
}catch(e){
    res.status(500).json({error: e.message});

}
})
 */
/* ordersRouter.post('/orders/webhook', async (req, res) => {
    try {
        const payment = req.query;
        console.log(payment);
        if (payment.type === "payment") {
          const data = await mercadopago.payment.findById(payment["data.id"]);
          console.log(data);
        }
    
        res.sendStatus(204);
      } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Something goes wrong" });
      }
    
}) */
/* ordersRouter.get("/orders/success", (req, res) => res.send("Success"));
ordersRouter.get("/orders/failure", (req, res) => res.send("Failure"));
ordersRouter.get("/orders/pending", (req, res) => res.send("Pending")); */


ordersRouter.post('/api/create-order', auth, async(req, res) => {
    
    const { cart, address, totalPrice } = req.body;

    let products = [];
    try{
    
    

    for(let i=0; i<cart.length; i++){
        let product = await Product.findById(cart[i].product._id);
        //disminuye la cantidad del producto en la base de datos siempre y cuando sea mayor 
        //que la que está en el carrito
        if(product.quantity >= cart[i].quantity){
            product.quantity -= cart[i].quantity;
        //lo mete en el array de productos 
            products.push({product, quantity: cart[i].quantity});
            
            await product.save();
        } else {
            return res
            .status(400)
            .json({msg: `No hay existencias del producto ${product.name}!`})
        }
    }

    //console.log('Esta es la lista de productos: '+ products);
    //busca el usuario en la base de datos y borra lo que hay en el carrito  
    let user = await User.findById(req.user);
    user.cart = [];
    user = await user.save();

    //se crea un nuevo objeto de tipo orden
    let nuevaOrden = new Order({
        products,
        totalPrice,
        address,
        userId: req.user,
        orderedAt: new Date().getTime(),   
        
    })
    
    //se guarda ese objeto en la base de datos
    nuevaOrden = await nuevaOrden.save();
    res.json(nuevaOrden);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

ordersRouter.get('/api/get-orders', auth, async (req, res) => {
    try{
        console.log(req.user);
        let orders = await Order.find({
            userId: req.user
        })

        res.json(orders);


    }catch(e){
        res.status(500).json({ error: e.message });
    }
})


module.exports = ordersRouter;

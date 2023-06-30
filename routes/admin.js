const express = require('express');
//crea una instancia de Express Router
const adminRouter = express.Router();
const {Product} = require("../models/product");
const admin = require('../middlewares/admin');
const Order = require('../models/order');

// a función post de la API admin utilizando el Middleware
adminRouter.post('/api/admin/vender-producto', admin, async (req, res) => {
    try{
        const {name, description, images, quantity, price, category} = req.body;

        //se crea un nuevo documento en mongo DB utilizando el modelo que se creo en /models/admin.js 
        //y con la data que viene del request de la API. Es importante incluir la keyword "new" cuando se
        //va a crear un nuevo documento utilizando moogose
        let producto = new Product({
            name,
            description,
            images,
            quantity,
            price,
            category
    })
        // guarda el modelo en la base de datos
        producto = await producto.save();
        //se envía como respuesta el producto
        res.json(producto);
      
}
 catch(e){
    res.status(500).json({error: e.message});
}
});

//API get-products
adminRouter.get('/api/admin/get-products', admin, async (req, res) => {
try {
    //con el método find() se accede a todos los productos que se necesitan 
    const productos = await Product.find({});
    res.json(productos);
} catch (error) {
    res.status(500).json({error: error.message}); 
}
   
})

//API for deleting a product
adminRouter.post('/api/admin/delete-product', admin, async (req, res) => {
    try{
    const {id} = req.body;
    let productoAEliminar = await Product.findByIdAndDelete(id);
    //se guarda la actualización en la base de datos
    res.json(productoAEliminar);
    } catch(e){
        res.status(500).json({error: e.message}); 
    }
})

adminRouter.post("/admin/change-order-status", admin, async (req, res) => {
    try {
      const { id, status } = req.body;
      let order = await Order.findById(id);
      order.status = status;
      order = await order.save();
      res.json(order);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });


adminRouter.get("/admin/total-earnings", admin, async (req, res) => {
    
    let totalEarnings = 0;
    
    try {
        //buscar todos los productos
        const orders = await Order.find({});
        
      for(let i=0; i<orders.length;i++){
        for(let j=0; j<orders[i].products.length;j++){
            totalEarnings += orders[i].products[j].quantity * orders[i].products[j].product.price;
        }
      }

      const electronicsEarning =  await fetchTotalEarningByCategory('Electronics'); 
      const sportsEarning = await fetchTotalEarningByCategory('Sports');
      const fitnessEarning = await fetchTotalEarningByCategory('Fitness');
      const gamingEarning = await fetchTotalEarningByCategory('Gaming');
      const fashionEarning = await fetchTotalEarningByCategory('Fashion');    

      const sales = [
        totalEarnings,
        electronicsEarning,
        sportsEarning, 
        fitnessEarning,
        gamingEarning,
        fashionEarning

      ]
      console.log(totalEarnings);
      console.log(sales);
      
      res.json(sales);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }

   

  });

    async function fetchTotalEarningByCategory(category) {
    let totalByCategory = 0;
    //se busca productos de la categoría
   const categoryOrders = await Order.find({
    //busca dentro de pr
    'products.product.category': category,
   })

   for(let i=0; i<categoryOrders.length;i++){
    for(let j=0; j<categoryOrders[i].products.length;j++){
        totalByCategory += categoryOrders[i].products[j].quantity * categoryOrders[i].products[j].product.price;
    }
  }

  return totalByCategory;


}
  

module.exports = adminRouter;
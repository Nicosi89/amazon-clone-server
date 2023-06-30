const express = require('express');
//crea una instancia de Express Router
const productRouter = express.Router();
const {Product} = require("../models/product");
const auth = require("../middlewares/auth");

productRouter.get('/api/products/', auth, async (req, res) => {
    try{
        //como en el método get no se tiene un body se accede a la query usando el req.query. Esto es 
        //el valor del parámetro despues del "?": api/category?category=fashion
        const products = await Product.find({category: req.query.category});

        res.json(products);



    }catch(e){
        res.status(500).json({error: e.message});
    }
})

    //Api búsqueda de producto - cuando se usa el :name el request viene params
    productRouter.get("/api/products/search/:name", auth, async (req, res) => {
        try {
          const products = await Product.find({
            //se va a buscar en la base de datos en el campo de name
            //$regex y $options son funciones de mongoose para permitir buscar
            //por la(s) primeras letras en vez tener que digitar la palabra completa 
            name: { $regex: req.params.name, $options: "i" },
          });
      
          res.json(products);
        } catch (e) {
          res.status(500).json({ error: e.message });
        }
      });

      //Api calificaciones
      //TODO: arreglar API calificar producto
      productRouter.post("/api/rate-product", auth, async (req, res) => {
        try {

          const { id, rating } = req.body;
          
          //se busca el producto según su id
            let product = await Product.findById(id);

          //lógica para cambiar el rating según el usuario
          for (let i = 0; i < product.ratings.length; i++) {
            if (product.ratings[i].userId == req.user) {
              //.splice permite eliminar el valor en i
              product.ratings.splice(i, 1);
              break;
            }
          }
            console.log('El array de ratings ' + product.ratings.length);
            console.log('El id de usuario '+ req.user);

            const ratingSchema = {
              userId: req.user,
              rating,
            };
            
            //Se ingresa la nueva calificación  
            product.ratings.push(ratingSchema);
            //se guarda el producto
            product = await product.save();
            res.json(product);

          } catch (e) {
          res.status(500).json({ error: e.message });
        }
      });



      productRouter.get("/api/deal-of-day", auth, async (req, res) => {

      try {
        let products = await Product.find({});

      //.sort(function()) es una función de javascript para ordenar un array de objetos segúnn criterios especiales 
        products = products.sort((a, b) => {
        let aSum = 0;
        let bSum = 0;

        for (let i = 0; i < a.ratings.length; i++) {
          aSum += a.ratings[i].rating;
        }

        for (let i = 0; i < b.ratings.length; i++) {
          bSum += b.ratings[i].rating;
        }
        return aSum < bSum ? 1 : -1;
      });
      //se envía como respuesta el primer elemento del array prodcuts
      res.json(products[0]);
    } catch (e) {
      res.status(500).json({ error: e.message });
  }
});
            

             



module.exports = productRouter;
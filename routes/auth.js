const express = require("express");
const User = require("../models/user")
const authRouter = express.Router();
const bcript = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require("mongoose");
const auth = require("../middlewares/auth");

//API función para registrarse
authRouter.post("/api/signup", async function (req, res) {
    //se "recogen" las variables de name, email y password que vienen del req.body usando un destructor
    const { name, email, password } = req.body;

    try {
        //busca el el usuario de acuerdo con su correo en
        //la colección user usando el método findOne cuyo 
        //retorno es una promesa  
        const exixstingUser = await User.findOne({ email })

        //si se encuentra el correo quiere decir que el usuario ya existe y por tanto
        // el estatus será de tipo 400 y se enviará un mensaje
        if (exixstingUser) {
            return res
                .status(400)
                .json({ msg: 'La dirección de correo ingresa ya existe en nuestra base de datos' })
        }

        //función para encriptar la constraseña usando el paquete bcryptjs
        const passwordEncripted = await bcript.hash(password, 8);

        //si no existe ese correo se crea unu nuevo usuario
        let newUser = new User({
            email,
            password: passwordEncripted,
            name,
            
        })
        //se guarda el usuario en la base de datos
        newUser = await newUser.save();
        //se envía la respuesta al cliente  
        res.json(newUser);

    } catch (e) {
        res.status(500).json({ error: e.menssage })
    }
})

//API función para loguearse
authRouter.post("/api/login", async (req, res) => {

    try {
        const { email, password } = req.body;
        //busca un usuario con el mismo correo en la base de datos
        const alreadyExist = await User.findOne({ email });
        // si ese usuario no existe arroja un 400 
        if (!alreadyExist) {
            return res
                .status(400)
                .json({ msg: 'El usuario no existe nuestra base de datos. Porfavor registrate antes' })

        }
        /* console.log(alreadyExist);
        console.log(password); */
        //revisa si la contraseña que pasa en en el res.body es la misma que la que está en el documento del usuario en mongoDB
        const isMatch = await bcript.compare(password, alreadyExist.password);
        console.log(isMatch);
        if (!isMatch) {
            return res
                .status(400)
                .json({ msg: 'Constraseña Incorrecta' });
        }

        //si sí, se genera el token usando el paquete de jsonwebtoken que garantiza la identidad auténtica del usuario
        const token = jwt.sign({ id: alreadyExist._id }, "passwordKey");
        //se configura la respuesta con el token y la info del documento de newUser
        res.json({ token, ...alreadyExist._doc });




    } catch (e) {
        res.status(500).json(e.message);
    }

})

//API para verificar que el token sea válido y exista el usuario
authRouter.post("/tokenIsValid", async (req, res) => {

    try {
        //revisa si hay un token (usuario logueado) en el header del request y si no devuelve false
        const token = req.header('x-auth-token');
        if (!token) return res.json(false);
        //console.log(`El token es ${token}`)
        //si sí verifica si el token que llega por el resquest es el mismo 
        const isVerified = jwt.verify(token, "passwordKey");
        if (!isVerified) return res.json(false);
        //console.log(`El id identificado es ${isVerified}`)
        //busca en la base de datos si coincide el usuario verificado con uno de la base de datos
        const user = await User.findById(isVerified.id);
        if (!user) return res.json(false);
        res.json(true);
    } catch (e) {
        res.status(500).json(e.message);
    }



})

//API para traer data de usuario usando el usuario ya validado en el middleware
authRouter.get('/', auth, async (req, res) => {
        //busca el usuario ya validado que viene del request
        const user = await User.findById(req.user);
        

        // se pasa como respuesta ese usuario y el token
        res.json({...user._doc, token: req.token});

});

module.exports = authRouter;
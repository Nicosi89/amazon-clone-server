const jwt = require('jsonwebtoken');
const User = require('../models/user');

//función para verificar que siempre que haya una solicitud 
//al servidor el middleware interceda para verificar si el usuario está autentificado
//correctamente y puede acceder a los servicios 
const admin = async (req, res, next) => {
    try {
        //se guarda el token que está en el header 
        const token = req.header('x-auth-token');
        //si no existe token se arroja un 401 de no autentificado 
        if (!token){
            return res.status(401)
                      .json({ msg: "No auth token, access denied" })
        }
        // si sí se verifica el token usando la llave o key
        const verified = jwt.verify(token, "passwordKey");
        if(!verified){
            return res.status(401)
                      .json({msg: 'Token verification failed, authorization denied'});
        }
        
        //va y busca el usuario en la base de datos usando el método que nos ofrece MongoDB 
        const user = User.findById(verified.id);
        //revisa el tipo usuario y si no es admin niega el acceso 
        if(user.type == 'user' || user.type == 'seller'){
            return res.status(401).json({msg: 'No está autorizado para realizar esta operación'})
        }
        //se crea un nuevo objeto para res que se llama user y en el se guarda el id del 
        //usuario verificado que se usará para pasar el usuario identifixado en el body del request
        req.user = verified.id;
        req.token = token;

        //invocación de la función callback que llama a la siguiente API route 
        next();
    } catch(e){
        return res.status(500).json({error: e.message})
    }
}

//se exporta para que se pueda utilizar en la función de ls API
module.exports = admin;
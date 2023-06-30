//IMPORTS FROM PACKAGES
const express = require("express");
//lo mismo que en Dart es import 'pack.....'

//IMPORTS FROM OTHER FILES
const authRouter = require("./routes/auth");
const { default: mongoose } = require("mongoose");
const adminRouter = require("./routes/admin");
const productRouter = require("./routes/products");
const userRouter = require("./routes/user");
const ordersRouter = require("./routes/orders");
const morgan = require("morgan");


//INIT
const PORT = 3000;
const app = express();
const DB = "mongodb+srv://NicolasSicard89:XgAuhyyiKixnm8oj@cluster0.ifbkskp.mongodb.net/?retryWrites=true&w=majority"


//MIDDLEWARE
app.use(morgan('dev'));
//para postear data en json format
app.use(express.json());
app.use(authRouter); 
app.use(adminRouter);
app.use(productRouter);
app.use(userRouter);
app.use(ordersRouter);

//CONECTIONS
app.listen(PORT, () => {
    console.log(`conected at port ${PORT}`);
})
mongoose.connect(DB)
    .then(() => console.log("Conection Successful"))
    .catch((e) => console.log(e));
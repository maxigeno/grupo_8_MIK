const express = require("express");
const methodOverride = require("method-override"); // Pasar poder usar los métodos PUT y DELETE
const path = require("path");
const session = require("express-session");
const cookies = require("cookie-parser");
const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 3001;
const userLogguedMiddleWare = require("./src/middlewares/userLogguedMiddleWare");

//configuro lo static para express
app.use("/static", express.static("public"));
//configuro body-parser
app.use(express.urlencoded({ extended: false }));
//configuro json
app.use(express.json());
//configuro method-override
app.use(methodOverride("_method"));
//configuro cookies
app.use(cookies());
//configuro session
app.use(
  session({
    secret: "Son las session",
    resave: false,
    saveUninitialized: false,
  })
);
//middleware para saber si hay un usuario logueado
app.use(userLogguedMiddleWare);
//
app.use(cors());

//Configuro motor de plantilla
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/src/views"));

//Configuro rutas
const indexRouter = require("./src/routes/index");
const usersRouter = require("./src/routes/users");
const productsRouter = require("./src/routes/products");
// Rutas de APIs

const apiUserRoutes = require("./src/routes/api/userAPIRoutes");
const apiProductRoutes = require("./src/routes/api/productAPIRoutes");
/* const apiCategoryRoutes = require("./src/routes/api/categoryAPIRoutes"); */

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);

// Rutas de APIs
app.use("/api/users", apiUserRoutes);
app.use("/api/products", apiProductRoutes);
/* app.use("/api/category", apiCategoryRoutes); */

app.use((req, res, next) => {
  res.status(404).render("404");
});

app.listen(PORT, () => {
  console.log("Servidor funcionando ");
});

module.exports = app;

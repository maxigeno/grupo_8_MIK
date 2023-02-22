const fs = require("fs");
const path = require("path");
const { validationResult } = require("express-validator");

const productsFilePath = path.join(__dirname, "../data/productsDataBase.json");
const products = JSON.parse(fs.readFileSync(productsFilePath, "utf-8"));

const db = require("../database/models");

const calculateDiscount = (price, discountPer) => {
  let discount = price * (discountPer / 100);
  return price - discount;
};

const productsControllers = {
  // Root - Show all products
  //TODO: hacer que funcione con db
  products: async (req, res) => {
    //db
    let productsDB = await db.Product.findAll();
    //json
    let newCourse = products.filter((product) => product.isNew == true);

    let inSale = products.filter((product) => product.inSale == true);
    let others = products.filter(
      (product) => product.isNew == false && product.inSale == false
    );
    res.render("index", {
      newCourse,
      inSale,
      others,
      calculateDiscount,
    });
  },
  // Detail
  //TODO: hacer que funcione con db
  detail: async (req, res) => {
    let id = req.params.id;
    //db
    let productDB = await db.Product.findByPk(id);
    //json
    let product = products.find((product) => product.id == id);
    res.render("productDetail", { product });
  },
  // Create Form
  create: async (req, res) => {
    //db traigo las categorias
    let categories = await db.Category.findAll();
    res.render("productCreate", { categories });
  },
  // Create Method POST
  store: async (req, res) => {
    let errors = validationResult(req);
    //db traigo las categorias
    let categories = await db.Category.findAll();

    if (errors.isEmpty()) {
      let image;
      if (req.file != undefined) {
        image = req.file.filename;
      } else {
        image = "producto-sin-foto.webp";
      }

      //json
      /* let newProduct = {
          ...req.body,
          id: products[products.length - 1].id + 1,
          isNew: req.body.isNew === "true" ? true : false,
          inSale: req.body.inSale === "true" ? true : false,
          image,
        }; */

      //json
      /*     products.push(newProduct);
        fs.writeFileSync(productsFilePath, JSON.stringify(products, null, " ")); */

      //db
      db.Product.create({
        nombre: req.body.name,
        descripcion: req.body.description,
        precio: parseInt(req.body.price, 10),
        categoria_id: parseInt(req.body.category),
        nuevo: req.body.isNew === "true" ? 1 : 0,
        destacado: req.body.inSale === "true" ? 1 : 0,
        porcentaje_descuento: parseInt(req.body.discount),
        imagen: image,
      });

      res.redirect("/");
    } else {
      res.render("productCreate", {
        errors: errors.mapped(),
        old: req.body,
        categories,
      });
    }
  },
  // Update  Form to edit
  edit: async (req, res) => {
    let id = req.params.id;
    // JSON
    //let productToEdit = products.find((product) => product.id == id);
    // db
    let productToEdit = await db.Product.findByPk(id);
    let categories = await db.Category.findAll();
    res.render("productEdit", { productToEdit, categories });
  },
  // Update - Method to update
  update: async (req, res) => {
    let id = req.params.id;
    // JSON
    // let productToEdit = products.find((product) => product.id == id);
    let productToEdit = await db.Product.findByPk(id);
    let image;

    if (req.file != undefined) {
      image = req.file.filename;
    } else {
      image = "default-image.png";
    }
    // JSON
    // productToEdit = {
    //   id: productToEdit.id,
    //   ...req.body,
    //   isNew: req.body.isNew === "true" ? true : false,
    //   inSale: req.body.inSale === "true" ? true : false,
    //   image,
    // };

    // let newProducts = products.map((product) => {
    //   if (product.id == productToEdit.id) {
    //     return (product = { ...productToEdit });
    //   }
    //   return product;
    //});

    // fs.writeFileSync(productsFilePath, JSON.stringify(newProducts, null, " "));

    // DB
    let productEdit = {
      nombre: req.body.name,
      descripcion: req.body.description,
      precio: parseInt(req.body.price, 10),
      categoria_id: parseInt(req.body.category),
      nuevo: req.body.isNew === "true" ? 1 : 0,
      destacado: req.body.inSale === "true" ? 1 : 0,
      porcentaje_descuento: parseInt(req.body.discount),
      imagen: image,
    };
    await db.Product.update(
      { ...productEdit },
      {
        where: {
          id: id,
        },
      }
    );
    res.redirect("/");
  },

  destroy: (req, res) => {
    let id = parseInt(req.params.id);
    console.log(id, "");
    // JSON
    //let finalProducts = products.filter((product) => product.id != id);
    // fs.writeFileSync(
    // productsFilePath,
    // JSON.stringify(finalProducts, null, " ")
    //);
    db.Product.destroy({
      where: {
        id: id,
      },
    });
    res.redirect("/");
  },
};

module.exports = productsControllers;

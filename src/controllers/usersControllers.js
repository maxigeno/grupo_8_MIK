//const fs = require("fs");
//const path = require("path");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

//const usersFilePath = path.join(__dirname, "../data/usersDataBase.json");
//const users = JSON.parse(fs.readFileSync(usersFilePath, "utf-8"));
//const { ok } = require("assert");

const USer = require("../models/User");
//const db = require("../database/models");
const db = require("./../database/models");

const usersControllers = {
  login: (req, res) => {
    //console.log(req.session);
    res.render("users/login");
  },
  procesLogin: async (req, res) => {
    //valido los datos del form
    let errors = validationResult(req);
    //busco el usuario en la base de datos
    //let userToLogin = USer.findByField("email", req.body.email);
    let userToLogin = await db.User.findOne({
      where: {
        email: req.body.email,
      },
    });

    //si el usuario no existe, renderizo el form con el error y los datos que ya  ingreso el usuario
    if (!userToLogin) {
      return res.render("users/login", {
        errors: errors.mapped(),
        old: req.body,
        invalidCredentials: "Usuario o contraseña incorrectos",
      });
    }

    //si el usuario existe, comparo password ingresada con la del usuario en DB.
    if (bcrypt.compareSync(req.body.password, userToLogin.password)) {
      //si la contraseña es correcta

      //elimino la contraseña del usuario para no guardarla en session
      delete userToLogin.password;
      //guardar al usuario en session
      req.session.userLogged = userToLogin;
      //console.log(req.session);

      //si el usuario marco la opcion de recordarme, guardo el email en una cookie
      if (req.body.remember_user) {
        res.cookie("userEmail", req.body.email, { maxAge: 1000 * 60 * 60 });
      }

      //redirijo al home
      return res.redirect("/");
    } else {
      //contraseña es incorrecta, renderizo el form con el error y los datos que ya ingreso  el usuario
      return res.render("users/login", {
        errors: errors.mapped(),
        old: req.body,
        invalidCredentials: "Usuario o contraseña incorrectos",
      });
    }
  },
  register: (req, res) => {
    res.render("./users/register");
  },
  newUSer: async (req, res) => {
    let errors = validationResult(req);
    //si array errors esta vacio, no hay errores,
    if (errors.isEmpty()) {
      let image;
      if (req.file != undefined) {
        image = req.file.filename;
      } else {
        image = "default-image.png";
      }
      //busco si el usuario ya esta registrado
      // let userInDB = USer.findByField("email", req.body.email);
      let userInDB = await db.User.findOne({
        where: {
          email: req.body.email,
        },
      });

      //si el usuario ya esta registrado, renderizo el form con el error y los datos que ya habia ingresado el usuario
      if (userInDB) {
        return res.render("users/register", {
          errors: {
            email: {
              msg: "Este email ya esta registrado",
            },
          },
          old: req.body,
        });
      }

      //si el usuario no esta registrado, lo creo en la base de datos
      db.User.create({
        nombre: req.body.first_name,
        apellido: req.body.last_name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
        avatar: image,
      });
      res.redirect("/users/login");
      //si hay errores, renderizo el form con los errores y los datos que ya habia ingresado el usuario
    } else {
      // console.log(errors.mapped());
      res.render("users/register", {
        errors: errors.mapped(),
        old: req.body,
      });
    }
  },
  logout: (req, res) => {
    //elimino la cookie
    res.clearCookie("userEmail");
    //elimino el usuario de session
    req.session.destroy();
    //redirijo al home
    res.redirect("/");
  },
};

module.exports = usersControllers;

const { Setting,User,Role } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { UserInputError, AuthenticationError } = require("apollo-server");
const { where } = require("sequelize");
var Client = require("@paymentsds/mpesa").Client;

module.exports = {
  Query: {
    login: async (_, args) => {
      const { username, password } = args;
      let errors = {};
      try {
        if (username.trim() === "")
          errors.username = "username must not be empty";
        if (password === "") errors.password = "password must not be empty";

        if (Object.keys(errors).length > 0) {
          throw new UserInputError("bad input", { errors });
        }
        const user = await User.findOne({ where: { username } });

        if (!user) {
          errors.username = "user not found";
          throw new UserInputError("user not found", { errors });
        }

        const correctPassword = await bcrypt.compare(password, user.password);

        if (!correctPassword) {
          errors.password = "password incorect";
          throw new AuthenticationError("password incorect", { errors });
        }

        const token = jwt.sign({ username }, "secret", { expiresIn: 60 * 60 });
        return {
          ...user.toJSON(),
          createdAt: user.createdAt.toISOString(),
          token,
        };
      } catch (error) {
        throw error;
      }
    },
    seting: async () => {
      try {
        let settings = await  Setting.findAll();
        return settings;
      } catch (error) {
        console.log(error);
      }
    },
    role: async () => {
      try {
        let role = await  Role.findAll();
        return role;
      } catch (error) {
        console.log(error);
      }
    },
    getUsers: async () => {
      try {
        let users = await User.findAll({
          attributes: ["username", "imageUrl", "email", "createdAt"],
        });
        return users;
      } catch (error) {
        console.log(error);
      }
    },
  },
  Mutation: {
    regiter: async (_, args) => {
      let { username, email, password, confirmPassword } = args;
      let errors = {};
      try {
        // TODO: validade input data
        if (email.trim() === "") errors.email = "email must not be empty";
        if (username.trim() === "")
          errors.username = "username must not be empty";
        if (password.trim() === "")
          errors.password = "password must not be empty";
        if (confirmPassword.trim() === "")
          errors.confirmPassword = "repeat password must not be empty";
        if (password !== confirmPassword)
          errors.confirmPassword = "passwords must match";

        // TODO: chek exist username and password
        const userExist = User.findOne({ where: { username } });
        const userEmail = User.findOne({ where: { email } });

        if (Object.keys(errors).length > 0) {
          throw errors;
        }

        //TODO: hast  password
        password = await bcrypt.hash(password, 6);
        // TODO: validade create
        const user = await User.create({ username, email, password });
        // TODO: validade return
        return user;
      } catch (err) {
        console.log(err);
        if (err.name === "SequelizeUniqueConstraintError") {
          err.errors.forEach(
            (e) => (errors[e.path] = `${e.path} is already taken`)
          );
        } else if (err.name === "SequelizeValidationError") {
          err.errors.forEach((e) => (errors[e.path] = e.message));
        }
        throw new UserInputError("Bad input", { errors });
      }
    },
  },
};

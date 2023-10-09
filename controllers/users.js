const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const userSchema = require('../models/user');
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const Conflict = require('../errors/Conflict');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  if (!email || !password) {
    return next(new BadRequest('Email или пароль не могут быть пустыми'));
  }

  return bcrypt.hash(password, 10)
    .then((hash) => userSchema.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => res.status(201).send({
      name: user.name, email: user.email,
    }))
    .catch((err) => {
      if (err.code === 11000) {
        return next(new Conflict('Пользователь с таким email уже существует'));
      } if (err.name === 'ValidationError') {
        return next(new BadRequest('Некорректные данные при создании пользователя.'));
      }
      return next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return userSchema.findUserByCredentials(email, password).then((user) => {
    const payload = {
      _id: user._id,
    };

    const token = jwt.sign(payload, NODE_ENV === 'production' ? JWT_SECRET : 'secret', { expiresIn: '7d' });

    res.send({ token });
  }).catch((err) => next(err));
};

module.exports.getUser = (req, res, next) => {
  const userId = req.user._id;
  userSchema
    .findById(userId)
    .then((user) => {
      if (user) {
        return res.send(user);
      }
      return next(new NotFound('Пользователь не найден'));
    })
    .catch((err) => next(err));
};

// module.exports.updateUser = (req, res, next) => {
//   const { name, email } = req.body;
//   const userId = req.user._id;
//   console.log(req.body);
//   return userSchema
//     .findByIdAndUpdate(
//       userId,
//       { name, email },
//       { new: true, runValidators: true },
//     )
//     .then((user) => { res.send(user); console.log(user); })
//     .catch((err) => {
//       if (err instanceof mongoose.Error.ValidationError) {
//         return next(new BadRequest('Переданы некорректные данные'));
//       }
//       return next(err);
//     });
// };

module.exports.updateUser = (req, res, next) => {
  const { name, email } = req.body;
  const userId = req.user._id;

  userSchema.findOne({ email: req.body.email })
    .then((findUser) => {
      if (findUser && findUser._id.toString() !== userId) {
        return next(new Conflict('Указанный email занят'));
      }
      return userSchema
        .findByIdAndUpdate(
          userId,
          { name, email },
          { new: true, runValidators: true },
        )
        .then((user) => { res.send(user); })
        .catch((err) => {
          if (err instanceof mongoose.Error.ValidationError) {
            return next(new BadRequest('Переданы некорректные данные'));
          }
          return next(err);
        });
    })
    .catch((err) => next(err));
};

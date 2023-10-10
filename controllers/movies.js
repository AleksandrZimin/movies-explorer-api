const { default: mongoose } = require('mongoose');
const movieSchema = require('../models/movie');
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const Forbidden = require('../errors/Forbidden');

module.exports.getMovies = (req, res, next) => {
  movieSchema
    .find({ owner: req.user._id })
    .then((movies) => res.send(movies))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequest('Переданы некорректные данные'));
      } if (err.name === 'ERR_ABORTED') {
        return next(new NotFound('Фильмы не найдены'));
      }
      return next(err);
    });
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  const owner = req.user._id;

  return movieSchema
    .create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      thumbnail,
      movieId,
      nameRU,
      owner,
      nameEN,
    })
    .then((movie) => {
      movie.populate(['owner'])
        .then(() => res.status(201).send(movie));
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequest('Неверные данные'));
      }
      return next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  const { movieId } = req.params;

  movieSchema
    .findById(movieId)
    .then((movie) => {
      if (!movie) return next(new NotFound('Данные по указанному id не найдены'));
      if (`${movie.owner}` !== req.user._id) {
        return next(new Forbidden('Доступ запрещен'));
      }
      return movie
        .deleteOne()
        .then(() => res.send(movie))
        .catch((err) => next(err));
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return next(new BadRequest('Неверные параметры запроса'));
      }
      return next(err);
    });
};

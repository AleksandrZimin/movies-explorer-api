const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const { regExpUrl } = require('../utils/validators');

const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/', celebrate({ params: Joi.object() }), getMovies);
router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().required().pattern(regExpUrl),
    trailerLink: Joi.string().required().pattern(regExpUrl),
    thumbnail: Joi.string().required().pattern(regExpUrl),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);
router.delete('/:movieId', celebrate({
  params: Joi.object().keys({
    movieId: Joi.string().hex().required(),
  }),
}), deleteMovie);

module.exports = router;

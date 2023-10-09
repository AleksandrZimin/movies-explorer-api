const router = require('express').Router();
const movies = require('./movies');
const users = require('./users');
const auth = require('./auth');
const auth2 = require('../middlewares/auth');
const NotFound = require('../errors/NotFound');

router.use('/', auth);
router.use(auth2);
router.use('/users', users);
router.use('/movies', movies);
router.use('/*', (req, res, next) => next(new NotFound('Страницы не существует')));

module.exports = router;

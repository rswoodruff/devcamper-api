// require express app to be used
const express = require('express');

// importing multiple express routes to update the page
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload
} = require('../controllers/bootcamps');

// importing express routes
const Bootcamp = require('../models/Bootcamp');

// requires files from routes foldder
const courseRouter = require('./courses');
const reviewRouter = require('./reviews');

// used to handled object requests
const router = express.Router();

// importing express routes
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// adding routes to express app
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewRouter);


router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;

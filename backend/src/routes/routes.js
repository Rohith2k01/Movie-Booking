const express = require('express');
const router = express.Router();
const userRouter= require('./userroutes');
const adminRouter = require('./adminroutes');




//User Routes
router.get('/all-movies', userRouter.getAllMoviesRouter);
router.get('/movie-details/:movieId', userRouter.getMovieDetailsRouter);
router.get('/book-tickets/:movieId', userRouter.getMovieScheduleRouter);
router.get('/seats', userRouter.getSeatsForShowtimeRouter);
router.get('/search-movies', userRouter.searchMoviesByTitleRouter);
// router.post('/razorpay-order', userRouter.createOrderRouter);
router.post('/confirm-booking', userRouter.confirmBookingRouter);
router.get('/booking-details/:userId', userRouter.getUserBookingsRouter);



// Admin Routes
router.post('/admin/admin-login', adminRouter.adminLoginRouter);
router.get('/admin/movies-lookup', adminRouter.searchMoviesByTitleRouter);
router.post('/admin/add-movies', adminRouter.addMovieRouter);
router.post('/admin/add-theatre', adminRouter.addTheatreRouter);
router.get('/admin/movies-list', adminRouter.getMoviesListRouter);
router.delete('/admin/movie-delete/:id', adminRouter.deleteMovieRouter);
router.get('/admin/theatre-list', adminRouter.getTheatreListRouter);
router.post('/admin/add-movie-schedule', adminRouter.addMovieScheduleRouter);
router.get('/admin/schedule-details', adminRouter.getScheduleDetailsRouter);
router.delete('/admin/schedule/:scheduleId/showtime', adminRouter.deleteShowtimeRouter);


module.exports = router;   
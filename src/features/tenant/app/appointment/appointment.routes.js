const express = require("express");
const AppointmentController = require("../controllers/appointmentController");

const router = express.Router();

// Booking
router.post("/book", AppointmentController.book);

// Cancel
router.put("/cancel/:appointmentId", AppointmentController.cancel);

// Waitlist
router.post("/waitlist", AppointmentController.waitlist);

// Remove from waitlist / make ready
router.put("/waitlist/remove/:appointmentId", AppointmentController.removeFromWaitlist);

// Postpone
router.put("/postpone/:appointmentId", AppointmentController.postpone);

module.exports = router;

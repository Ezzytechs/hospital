const AppointmentService = require("../services/appointmentService");

class AppointmentController {
  static async book(req, res) {
    try {
      const { doctorId, date, reason } = req.body;
      const { Appointment } = req.db;
      const appointment = await AppointmentService.bookAppointment(
        req.user.userId,
        doctorId,
        date,
        reason,
        Appointment
      );
      res.status(201).json({ message: "Appointment booked successfully", appointment });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async cancel(req, res) {
    try {
      const { appointmentId } = req.params;
      const { Appointment } = req.db;
      const appointment = await AppointmentService.cancelAppointment(
        req.user.userId,
        appointmentId,
        Appointment
      );
      res.json({ message: "Appointment cancelled", appointment });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async waitlist(req, res) {
    try {
      const { doctorId } = req.body;
      const { Appointment } = req.db;
      const appointment = await AppointmentService.waitlistAppointment(
        req.user.userId,
        doctorId,
        Appointment
      );
      res.status(201).json({ message: "Added to waitlist", appointment });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async removeFromWaitlist(req, res) {
    try {
      const { appointmentId } = req.params;
      const { Appointment } = req.db;
      const appointment = await AppointmentService.removeFromWaitlist(
        req.user.userId,
        appointmentId,
        Appointment
      );
      res.json({ message: "Removed from waitlist and marked ready", appointment });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async postpone(req, res) {
    try {
      const { appointmentId } = req.params;
      const { newDate } = req.body;
      const { Appointment } = req.db;
      const appointment = await AppointmentService.postponeAppointment(
        req.user.userId,
        appointmentId,
        newDate,
        Appointment
      );
      res.json({ message: "Appointment postponed", appointment });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = AppointmentController;

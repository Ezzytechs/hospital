const { v4: uuidv4 } = require("uuid");

class AppointmentService {
  static async bookAppointment(userId, doctorId, date, reason, Appointment) {
    //inform doctor
    //inform patient
    return await Appointment.create({
      patient: userId,
      doctor: doctorId,
      date,
      reason,
      status: "booked", // booked | cancelled | waitlist | ready | postponed
    });
  }

  static async cancelAppointment(userId, appointmentId, Appointment) {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, patient: userId },
      { status: "cancelled" },
      { new: true }
    );
    if (!appointment) throw new Error("Appointment not found or unauthorized");
    return appointment;
  }

  static async waitlistAppointment(userId, doctorId, Appointment) {
    return await Appointment.create({
      patient: userId,
      doctor: doctorId,
      status: "waitlist",
    });
  }

  static async removeFromWaitlist(userId, appointmentId, Appointment) {
    const roomName = `room-${uuidv4()}`;
    const roomPassword = Math.random().toString(36).slice(-8);

    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, patient: userId, status: "waitlist" },
      { status: "ready" },
      { new: true }
    );

    if (!appointment)
      throw new Error("Waitlist appointment not found or unauthorized");
    return appointment;
  }

  static async postponeAppointment(
    userId,
    appointmentId,
    newDate,
    Appointment
  ) {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, patient: userId, status: "booked" },
      { status: "postponed", date: newDate },
      { new: true }
    );
    if (!appointment) throw new Error("Appointment not found or unauthorized");
    return appointment;
  }
}

module.exports = AppointmentService;

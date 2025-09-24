const mongoose = require('mongoose');

function appointmentSchema() {
  return new mongoose.Schema(
    {
      patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      scheduledAt: { type: Date, required: true },
      status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled', 'waitlist'], default: 'pending' }
    },
    { timestamps: true }
  );
}

module.exports = (conn) => conn.model("Appointment", appointmentSchema());
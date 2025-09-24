const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jameze49@gmail.com",
    pass: "vyhk pble rkmu olyr",
  },
});

/** * Send email (optionally with calendar event) */

const sendEmail = async ({ to, subject, html, eventDetails }) => {
  let attachments = [];
  let googleCalendarLink = "";

  if (eventDetails) {
    const { startTime, endTime, title, description, location } = eventDetails;

    // Format date to UTC string (YYYYMMDDTHHMMSSZ)
    const formatDate = (date) =>
      new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const start = formatDate(startTime);
    const end = formatDate(endTime);

    // Google Calendar Link
    googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      title
    )}&dates=${start}/${end}&details=${encodeURIComponent(
      description || ""
    )}&location=${encodeURIComponent(location || "")}`;

    // ICS file
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//YourApp//Event Scheduler//EN
BEGIN:VEVENT
UID:${Date.now()}@yourapp.com
DTSTAMP:${start}
DTSTART:${start}
DTEND:${end}
SUMMARY:${title}
DESCRIPTION:${description || ""}
LOCATION:${location || ""}
END:VEVENT
END:VCALENDAR
    `.trim();

    attachments.push({
      filename: "event.ics",
      content: icsContent,
      contentType: "text/calendar",
    });

    // Append link to email body
    html += `<p><a href="${googleCalendarLink}" target="_blank">📅 Add to Google Calendar</a></p>`;
  }

  const mailOptions = {
    from: "jameze49@gmail.com",
    to,
    subject,
    html,
    attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = { sendEmail };

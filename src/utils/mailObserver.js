const EventEmitter = require("events");
const { sendEmail } = require("../config/mail/nodemailer");

class EmailObserver extends EventEmitter {}

const emailObserver = new EmailObserver();

// 🔔 Listen for SEND_MAIL events
emailObserver.on(
  "SEND_MAIL",
  ({ to, subject, templateFunc, templateData, eventDetails }) => {
    (async () => {
      try {
        // Generate HTML using provided template
        let html = templateFunc(templateData);

        // Send email (with or without event)
        const info = await sendEmail({
          to,
          subject,
          html,
          eventDetails, // optional
        });

        console.log("✅ Email sent:", info.messageId || info.response);
      } catch (err) {
        console.error(`❌ Failed to send email to ${to}:`, err.message);
      }
    })();
  }
);

module.exports = emailObserver;

const nodemailer = require('nodemailer');

// Configure Nodemailer transporter with Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        // Google App Passwords are 16 chars; strip any spaces if present
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '',
    },
});

/**
 * Send notification email to the website owner and a thank you auto-reply to the visitor.
 * @param {Object} data
 * @param {string} data.name - Name of sender
 * @param {string} data.email - Email of sender
 * @param {string} data.message - Message body
 */
const sendContactEmails = async ({ name, email, message }) => {
    const ownerEmail = process.env.EMAIL_USER;

    // 1. Notification Email to Owner (Dipesh)
    const ownerMailOptions = {
        from: `"Portfolio Contact Form" <${ownerEmail}>`,
        to: ownerEmail,
        replyTo: email,
        subject: `📬 New Message from ${name} via Portfolio`,
        text: `You have received a new contact message!\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 22px;">New Contact Form Message</h2>
                    <p style="color: #bfdbfe; margin: 6px 0 0 0; font-size: 14px;">Received via your Portfolio Website</p>
                </div>
                <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                    <div style="margin-bottom: 20px;">
                        <p style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px;">Sender Details</p>
                        <p style="margin: 4px 0; font-size: 15px; color: #1e293b;"><strong>Name:</strong> ${name}</p>
                        <p style="margin: 4px 0; font-size: 15px; color: #1e293b;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></p>
                    </div>
                    <div style="margin-bottom: 24px;">
                        <p style="margin: 0 0 8px; font-size: 13px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px;">Message</p>
                        <div style="background-color: #f1f5f9; padding: 16px; border-radius: 6px; border-left: 4px solid #2563eb; color: #334155; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">${message}</div>
                    </div>
                    <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                        <a href="mailto:${email}?subject=Re: Your message via Dipesh's Portfolio" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 500; font-size: 14px;">Reply directly to ${name}</a>
                    </div>
                </div>
            </div>
        `,
    };

    // 2. Thank You Email to the Visitor
    const thankYouMailOptions = {
        from: `"Dipesh Chaudhary" <${ownerEmail}>`,
        to: email,
        subject: `Thank you for reaching out, ${name}!`,
        text: `Hi ${name},\n\nThank you for getting in touch through my portfolio website! I have received your message and will review it as soon as possible. I typically respond within 24-48 hours.\n\nHere is a copy of your message:\n"${message}"\n\nBest regards,\nDipesh Chaudhary`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; border-radius: 8px;">
                <div style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 22px;">Thank You for Reaching Out!</h2>
                    <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">I appreciate your interest and message</p>
                </div>
                <div style="background-color: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Hi <strong>${name}</strong>,</p>
                    <p style="font-size: 15px; color: #334155; line-height: 1.6;">
                        Thank you for visiting my portfolio and taking the time to send a message! I've received your inquiry and will review it promptly. I typically respond within <strong>24 to 48 hours</strong>.
                    </p>
                    <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px;">A copy of your message:</p>
                        <p style="margin: 0; color: #475569; font-style: italic; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">"${message}"</p>
                    </div>
                    <p style="font-size: 15px; color: #334155; line-height: 1.6; margin-bottom: 24px;">
                        If your matter is urgent, feel free to reply directly to this email.
                    </p>
                    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
                        <p style="margin: 0; color: #1e293b; font-weight: 600; font-size: 15px;">Dipesh Chaudhary</p>
                        <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Full Stack Developer</p>
                    </div>
                </div>
            </div>
        `,
    };

    return Promise.all([
        transporter.sendMail(ownerMailOptions),
        transporter.sendMail(thankYouMailOptions),
    ]);
};

module.exports = {
    transporter,
    sendContactEmails,
};

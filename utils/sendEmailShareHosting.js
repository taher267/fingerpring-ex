const nodemailer = require('nodemailer');
/**
 *
 * @param {String|email} to
 * @param {String} subject
 * @param {String} html
 * @returns Object
 */
module.exports = async (
  to = process.env.SERVER_ERROR_EMAIL,
  subject = '',
  html = ''
) => {
  // Read data from request body
  try {
    // console.log(id, sendTo, product.price);
    const transporter = nodemailer.createTransport({
      service: 'Dynadot',
      host: 'mail.panzabi.com',
      port: 587,
      secure: false,

      auth: {
        user: process.env.TAHER_MAIL,
        pass: process.env.TAHER_MAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    // console.log(process.env.EMAIL, process.env.EMAIL_PASS, '=============');
    const mailOptions = {
      from: process.env.TAHER_MAIL,
      to,
      subject,
      html,
      //temp(CODE, name),
    };
    return transporter.sendMail(mailOptions);
    //   });
  } catch (err) {
    console.log(err);
    return { isSuccess: false, message: err.message };
  }
};

// transporter.verify((e, d) => {
//   if (e) console.log(e, 'e');
//   if (d) console.log(d);
// });

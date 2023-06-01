const nodemailer = require('nodemailer');
const shareSendMal = require('./sendEmailShareHosting');
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
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });
    // console.log(process.env.EMAIL, process.env.EMAIL_PASS, '=============');
    const mailOptions = {
      from: process.env.EMAIL,
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

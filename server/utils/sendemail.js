import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async function (email, subject, message) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      // give your own mail id
      user:"",
      // ek site mei jake app password bnao then wo password yha use kro
      pass: ""
    },
  });

  // send mail with defined transport object
  await transporter.sendMail({
    from: "", // sender address
    to: email, // user email
    subject: subject, // Subject line
    html: message, // html body
  });
};

export default sendEmail;

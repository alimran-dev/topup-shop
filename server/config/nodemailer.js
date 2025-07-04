const nodemailer=require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail'
});

module.exports={transporter};
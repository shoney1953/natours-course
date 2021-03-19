const e = require('express');
const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

 module.exports = class Email {
   constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Sheila Honey<${process.env.EMAIL_FROM}>`
   }
   newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }
     

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
   }

  async send(template, subject) {
// render the html for an email based on a pug template
  const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, 
  {
    firstName: this.firstName,
    url: this.url,
    subject
  });


// define email options
  const mailOptions = {
    from: this.from,
    to: this.to,
    subject,
    html,
    text: htmlToText.fromString(html) 
   }

// create a transport and send it
 
  await this.newTransport().sendMail(mailOptions);
 }

  async sendWelcome() {
    console.log('inside send welcome');
    await this.send('welcome', 'Welcome to the Natours Family!');
  }
  async sendPasswordReset() {
    console.log('inside sendPasswordReset');

    await this.send('passwordReset', 'Your password reset token - valid for only 10 minutes');
  }
 }



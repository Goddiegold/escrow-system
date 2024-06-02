import { User } from '@prisma/client';
import * as nodemailer from 'nodemailer';
import * as pug from 'pug';
import * as htmlToText from 'html-to-text';
import nodemailerMailgun from 'nodemailer-mailgun-transport';

export default class EmailEngine {
  private to: string;
  private name: string;
  private url: string;
  private from: string;

  constructor(user: User, url: string) {
    this.to = user.email;
    this.name = user.name;
    this.url = url;
    this.from = `SportsPadi <${process.env.MAILGUN_MAIL_FROM}>`;
  }

  private newTransport() {
    const auth = {
      auth: {
        api_key: process.env.MAILGUN_API_KEY as string,
        domain: process.env.MAILGUN_DOMAIN as string,
      },
    };

    return nodemailer.createTransport(nodemailerMailgun(auth));
  }

  public async send(template: string, subject: string) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/templates/${template}.pug`, {
      firstName: this.name,
      url: this.url,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      // text: htmlToText.fromString(html),
      text: htmlToText.convert(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
}

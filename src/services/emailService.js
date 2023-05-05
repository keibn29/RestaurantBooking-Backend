require("dotenv").config();
import nodemailer from "nodemailer";
import { LANGUAGES } from "../constant";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_APP,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendEmailVerifyReservation = async (dataSend) => {
  await transporter.sendMail({
    from: '"Chope Table Booking" <keibn29@gmail.com>',
    to: dataSend.receiverEmail,
    subject: renderVerifySubject(dataSend),
    html: renderVerifyHTML(dataSend),
  });
};

const renderVerifySubject = (dataSend) => {
  if (dataSend.language === LANGUAGES.VI) {
    return "Thông tin đặt đặt bàn ăn trên Chope";
  }
  return "Table reservation information on Chope";
};

const renderVerifyHTML = (dataSend) => {
  if (dataSend.language === LANGUAGES.VI) {
    return `
          <h3>Xin chào ${dataSend.customerName}</h3>
          <p>Bạn nhận được email này vì đã đặt bàn ăn tại Chope</p>
          <p>Thông tin đặt bàn:</p>
          <div><b>Thời gian: ${dataSend.time}</b></div>
          <div><b>Nhà hàng: ${dataSend.restaurantName}</b></div>
          <div><b>Địa chỉ: ${dataSend.restaurantAddress}</b></div>

          <p>Nếu các thông tin trên không bị sai lệch, vui lòng click vào liên kết dưới đây để xác nhận đặt bàn ăn</p>
          <div>
              <a href=${dataSend.redirectLink} target='_blank' >Click here</a>
          </div>

          <div>Xin chân thành cảm ơn!</div>
        `;
  }
  return `
          <h3>Dear ${dataSend.customerName}</h3>
          <p>You received this email because you booked a table at Chope</p>
          <p>Table reservation information:</p>
          <div><b>Time: ${dataSend.time}</b></div>
          <div><b>Restaurant: ${dataSend.restaurantName}</b></div>
          <div><b>Address: ${dataSend.restaurantAddress}</b></div>

          <p>If the above information is correct, please click on the link below to confirm your reservation</p>
          <div>
              <a href=${dataSend.redirectLink} target='_blank' >Click here</a>
          </div>

          <div>Best regards!</div>
        `;
};

const sendEmaillBill = async (dataSend) => {
  await transporter.sendMail({
    from: '"Chope Table Booking" <keibn29@gmail.com>',
    to: dataSend.receiverEmail,
    subject: renderBillSubject(dataSend),
    html: renderBillHTML(dataSend),
    attachments: [
      {
        filename: `Bill-${dataSend.customerName}.png`,
        content: dataSend.image.split("base64,")[1],
        encoding: "base64",
      },
    ],
  });
};

const renderBillSubject = (dataSend) => {
  if (dataSend.language === LANGUAGES.VI) {
    return "Thông tin hóa đơn bữa ăn";
  }
  return "Meal bill information";
};

const renderBillHTML = (dataSend) => {
  if (dataSend.language === LANGUAGES.VI) {
    return `
        <h3>Xin chào ${dataSend.customerName}</h3>
        <p>Bạn nhận được email này vì đã hoàn thành bữa ăn tại ${dataSend.restaurantName}</p>
        <p>Thông tin hóa đơn được gửi trong tệp đính kèm</p>

        <div>Xin chân thành cảm ơn!</div>
        `;
  }
  return `
        <h3>Dear ${dataSend.customerName}</h3>
        <p>You received this email because you completed a meal at ${dataSend.restaurantName}</p>
        <p>Invoice information is sent in the attachment</p>

        <div>Best regards!</div>
        `;
};

const sendEmailForgotPassword = async (dataSend) => {
  await transporter.sendMail({
    from: '"Chope Table Booking" <keibn29@gmail.com>',
    to: dataSend.receiverEmail,
    subject: renderForgotPasswordSubject(dataSend),
    html: renderForgotPasswordHTML(dataSend),
  });
};

const renderForgotPasswordSubject = (dataSend) => {
  if (dataSend.language === LANGUAGES.VI) {
    return "Thông báo về yêu cầu thay đổi mật khẩu";
  }
  return "Notice of request to change password";
};

const renderForgotPasswordHTML = (dataSend) => {
  if (dataSend.language === LANGUAGES.VI) {
    return `
          <h3>Xin chào ${dataSend.customerName}</h3>
          <p>Bạn nhận được email này vì đã gửi yêu cầu thay đổi mật khẩu tài khoản Chope</p>

          <p>Nếu đúng là do bạn yêu cầu, xin hay click vào liên kết dưới đây để cập nhật mật khẩu mới</p>
          <p>Còn nếu yêu cầu trên không phải do bạn thực thi, hãy bỏ qua email này</p>
          <div>
              <a href=${dataSend.redirectLink} target='_blank' >Click here</a>
          </div>

          <div>Xin chân thành cảm ơn!</div>
        `;
  }
  return `
          <h3>Dear ${dataSend.customerName}</h3>
          <p>You received this email because you sent a request to change your Chope account password</p>

          <p>If it is exactly what you requested, please click on the link below to update the new password</p>
          <p>If the above request is not made by you, please ignore this email</p>
          <div>
              <a href=${dataSend.redirectLink} target='_blank' >Click here</a>
          </div>

          <div>Best regards!</div>
        `;
};

module.exports = {
  sendEmailVerifyReservation,
  sendEmaillBill,
  sendEmailForgotPassword,
};

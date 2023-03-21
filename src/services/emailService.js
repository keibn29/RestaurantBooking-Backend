require("dotenv").config();
import nodemailer from "nodemailer";
import { LANGUAGES } from "../constant";

const sendSimpleEmail = async (dataSend) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_APP,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });

  // let info =
  await transporter.sendMail({
    from: '"Chope Table Booking" <keibn29@gmail.com>',
    to: dataSend.receiverEmail,
    subject: renderSubjectByLanguage(dataSend),
    html: renderHTMLByLanguage(dataSend),
  });
};

const renderSubjectByLanguage = (dataSend) => {
  if (dataSend.language === LANGUAGES.VI) {
    return "Thông tin đặt đặt bàn ăn trên Chope";
  }
  return "Table reservation information on Chope";
};

const renderHTMLByLanguage = (dataSend) => {
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

// const sendAttachment = async (dataSend) => {
//     // create reusable transporter object using the default SMTP transport
//     const transporter = nodemailer.createTransport({
//         host: "smtp.gmail.com",
//         port: 587,
//         secure: false, // true for 465, false for other ports
//         auth: {
//             user: process.env.EMAIL_APP, // generated ethereal user
//             pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
//         },
//     });

//     // send mail with defined transport object
//     let info = await transporter.sendMail({
//         from: '"Kei Nguyen" <keibn29@gmail.com>', // sender address
//         to: dataSend.receiverEmail, // list of receivers
//         subject: renderSubjectAttachment(dataSend), // Subject line
//         html: renderHTMLAttachment(dataSend), // html body
//         attachments: [
//             {
//                 filename: `Remedy-${dataSend.patientName}.png`,
//                 content: dataSend.image.split("base64,")[1],
//                 encoding: 'base64'
//             }
//         ]
//     });
// }

// const renderSubjectAttachment = (dataSend) => {
//     if (dataSend.language === 'vi') {
//         return 'Thông tin đơn thuốc/hóa đơn khám bệnh'
//     }
//     if (dataSend.language === 'en') {
//         return 'Information on prescription/medical bill'
//     }
// }

// const renderHTMLAttachment = (dataSend) => {
//     if (dataSend.language === 'vi') {
//         return `
//         <h3>Xin chào ${dataSend.patientName}</h3>
//         <p>Bạn nhận được email này vì đã hoàn thành buổi khám bệnh với BookingCare</p>
//         <p>Thông tin đơn thuốc/hóa đơn được gửi trong tệp đính kèm</p>

//         <div>Xin chân thành cảm ơn!</div>
//         `
//     }
//     if (dataSend.language === 'en') {
//         return `
//         <h3>Dear ${dataSend.patientName}</h3>
//         <p>You received this email because you completed a medical appointment with BookingCare</p>
//         <p>Prescription/invoice information is sent in the attachment</p>

//         <div>Best regards!</div>
//         `
//     }
// }

module.exports = {
  sendSimpleEmail,
  // sendAttachment
};

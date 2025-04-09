const webpush = require("web-push");
const notificationSender = async (subscription, title, body, url) => {
  try {
    const payload = {
      title,
      icon: "https://mezbashop.com/assets/topup-logo-crop-Ct0QDjtj.png",
      body,
      data: {
        url,
      },
    };
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    console.error("notificationSender: ", err.message);
  }
};

module.exports = notificationSender;

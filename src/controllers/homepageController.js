require('dotenv').config();
import homepageService from '../services/homepageService';
import chatbotService from '../services/chatbotService';
import templateMessage from '../services/templateMessage';
import axios from 'axios';
import moment from 'moment';

const MY_VERIFY_TOKEN = process.env.MY_VERIFY_TOKEN;

let getHomePage = (req, res) => {
  let facebookAppId = process.env.FACEBOOK_APP_ID;
  return res.render('homepage.ejs', {
    facebookAppId: facebookAppId,
  });
};

let getWebhook = (req, res) => {
  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = MY_VERIFY_TOKEN;

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
};

let postWebhook = (req, res) => {
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      //check the incoming message from primary app or not; if secondary app, exit
      if (entry.standby) {
        //if user's message is "back" or "exit", return the conversation to the bot
        let webhook_standby = entry.standby[0];
        if (webhook_standby && webhook_standby.message) {
          if (
            webhook_standby.message.text === 'back' ||
            webhook_standby.message.text === 'exit'
          ) {
            // call function to return the conversation to the primary app
            // chatbotService.passThreadControl(webhook_standby.sender.id, "primary");
            chatbotService.takeControlConversation(webhook_standby.sender.id);
          }
        }

        return;
      }

      //     // Gets the body of the webhook event
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
};

// Handles messages events
let handleMessage = async (sender_psid, received_message) => {
  //check the incoming message is a quick reply?
  if (
    received_message &&
    received_message.quick_reply &&
    received_message.quick_reply.payload
  ) {
    let payload = received_message.quick_reply.payload;
    if (payload === 'CATEGORIES') {
      await chatbotService.sendCategories(sender_psid);
    } else if (payload === 'LOOKUP_ORDER') {
      await chatbotService.sendLookupOrder(sender_psid);
    } else if (payload === 'TALK_AGENT') {
      await chatbotService.requestTalkToAgent(sender_psid);
    }

    return;
  }

  let response;

  // Check if the message contains text
  if (received_message.text) {
    // Create the payload for a basic text message
    response = {
      text: `You sent the message: "${received_message.text}". Now send me an image!`,
    };
  } else if (received_message.attachments) {
    // Get the URL of the message attachment
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: 'Is this the right picture?',
              subtitle: 'Tap a button to answer.',
              image_url: attachment_url,
              buttons: [
                {
                  type: 'postback',
                  title: 'Yes!',
                  payload: 'yes',
                },
                {
                  type: 'postback',
                  title: 'No!',
                  payload: 'no',
                },
              ],
            },
          ],
        },
      },
    };
  }

  // Sends the response message
  await chatbotService.sendMessage(sender_psid, response);
};

// Handles messaging_postbacks events
let handlePostback = async (sender_psid, received_postback) => {
  // Get the payload for the postback
  let payload = received_postback.payload;

  // Set the response based on the postback payload
  switch (payload) {
    case 'GET_STARTED':
    case 'RESTART_CONVERSATION':
      await chatbotService.sendMessageWelcomeNewUser(sender_psid);
      break;
    case 'TALK_AGENT':
      await chatbotService.requestTalkToAgent(sender_psid);
      break;
    case 'SHOW_PETS':
      await chatbotService.showPets(sender_psid);
      break;
    case 'SHOW_PRODUCTS':
      await chatbotService.showProducts(sender_psid);
      break;
    case 'SHOW_SERVICES':
      await chatbotService.showServices(sender_psid);
      break;
    case 'BACK_TO_CATEGORIES':
      await chatbotService.backToCategories(sender_psid);
      break;
    case 'BACK_TO_MAIN_MENU':
      await chatbotService.backToMainMenu(sender_psid);
      break;
    case 'LOOKUP_ORDER':
      await chatbotService.sendLookupOrder(sender_psid);
      break;
    case 'RESERVE_SERVICE':
      await chatbotService.sendReserveService(sender_psid);
      break;
    default:
      console.log('run default switch case');
  }
};

let handleSetupProfile = async (req, res) => {
  try {
    await homepageService.handleSetupProfileAPI();
    return res.redirect('/');
  } catch (e) {
    console.log(e);
  }
};

let getSetupProfilePage = (req, res) => {
  return res.render('profile.ejs');
};

let getInfoOrderPage = (req, res) => {
  let facebookAppId = process.env.FACEBOOK_APP_ID;
  return res.render('infoOrder.ejs', {
    facebookAppId: facebookAppId,
    sender_psid: req.query.sender_psid,
  });
};

let setInfoOrder = async (req, res) => {
  try {
    let customerName = '';
    if (req.body.customerName === '') {
      customerName = 'Empty';
    } else customerName = req.body.customerName;

    // I demo response with sample text
    // you can check database for customer order's status

    let response1 = {
      text: `---Info about your lookup order---
            \nCustomer name: ${customerName}
            \nEmail address: ${req.body.email}
            \nOrder number: ${req.body.orderNumber}
            `,
    };

    let response2 = templateMessage.setInfoOrderTemplate();

    await chatbotService.sendMessage(req.body.psid, response1);
    await chatbotService.sendMessage(req.body.psid, response2);

    return res.status(200).json({
      message: 'ok',
    });
  } catch (e) {
    console.log(e);
  }
};

let findInfoOrder = async (req, res) => {
  console.log('findorder', req.body);
  try {
    const { data } = await axios(
      `http://localhost:5000/api/orders/${req.body.orderNumber}`
    );

    // I demo response with sample text
    // you can check database for customer order's status
    if (data.phone !== req.body.phoneNumber) {
      await chatbotService.sendMessage(req.body.psid, {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'button',
            text: 'Rất tiếc chúng tôi không tìm thấy đơn hàng này',
            buttons: [
              {
                type: 'postback',
                title: 'Tìm kiếm đơn hàng khác',
                payload: 'LOOKUP_ORDER',
              },
              {
                type: 'postback',
                title: 'Menu chính',
                payload: 'BACK_TO_MAIN_MENU',
              },
            ],
          },
        },
      });

      return;
    }
    let response1 = {
      text: `---Thông tin đơn hàng của bạn---
            \nMã đơn hàng: ${req.body.orderNumber}
            \nSố điện thoại: ${req.body.phoneNumber}
            \nTên khách hàng: ${data?.customerName}
            \nTình trạng đơn hàng: ${data?.status}
            \nLoại đơn hàng: ${data?.orderType}
            \nLoại thanh toán: ${data?.paymentType}
            \nTình trạng thanh toán: ${data?.paymentStatus}
            \nNgày đặt: ${data?.orderDate}
            \nTổng cộng: ${data?.total}
            `,
    };
    let response2 = {
      text: `---Địa chỉ---
      \nTỉnh/Thành: ${data?.province}
      \nQuận huyện: ${data?.district}
      \nPhường/xã: ${data?.commune}
      \nChi tiết: ${data?.detailAddress}
            `,
    };
    const pets = data?.petOrderItems.map(
      (x) => `\nTên: ${x.name}
      \nGiá: ${x.price}
      \n---------------`
    );
    const products = data?.productOrderItems.map(
      (x) => `\nTên: ${x.name}
      \nSố lượng: ${x.quantity}
      \nGiá: ${x.price}
      \n---------------`
    );
    const services = data?.serviceOrderItems.map(
      (x) => `\nTên: ${x.name}
      \nGiá: ${x.price}
      \n---------------`
    );
    let response3 = {
      text: `---Danh sách thú cưng---
            ${pets}
            `,
    };
    let response4 = {
      text: `---Danh sách sản phẩm---
            ${products}
            `,
    };
    let response5 = {
      text: `---Danh sách dịch vụ---
            ${services}
            `,
    };
    // let response3 = {
    //   text: `---Danh sách mặt hàng---
    //         \nTỉnh/Thành: ${data?.province}
    //         \nQuận huyện: ${data?.district}
    //         \nPhường/xã: ${data?.commune}
    //         \nChi tiết: ${data?.detailAddress}
    //         `,
    // };
    // if (data.)

    let response6 = templateMessage.setInfoOrderTemplate();

    await chatbotService.sendMessage(req.body.psid, response1);
    await chatbotService.sendMessage(req.body.psid, response2);
    if (data?.petOrderItems?.length > 0)
      await chatbotService.sendMessage(req.body.psid, response3);
    if (data?.productOrderItems?.length > 0)
      await chatbotService.sendMessage(req.body.psid, response4);
    if (data?.serviceOrderItems?.length > 0)
      await chatbotService.sendMessage(req.body.psid, response5);

    await chatbotService.sendMessage(req.body.psid, response6);

    return res.status(200).json({
      message: 'ok',
    });
  } catch (e) {
    // console.log(e);

    await chatbotService.sendMessage(req.body.psid, {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: 'Rất tiếc chúng tôi không tìm thấy đơn hàng này',
          buttons: [
            {
              type: 'postback',
              title: 'Tìm kiếm đơn hàng khác',
              payload: 'LOOKUP_ORDER',
            },
            {
              type: 'postback',
              title: 'Menu chính',
              payload: 'BACK_TO_MAIN_MENU',
            },
          ],
        },
      },
    });
  }
};

let getReservePage = (req, res) => {
  let facebookAppId = process.env.FACEBOOK_APP_ID;
  return res.render('reserve.ejs', {
    facebookAppId: facebookAppId,
    sender_psid: req.query.sender_psid,
    serviceName: req.query.serviceName,
    serviceId: req.query.serviceId,
  });
};

let setReserve = async (req, res) => {
  console.log('reserve info', req.body);
  req.body.serviceId = Number(req.body.serviceId);
  req.body.reserveDate = moment(req.body.reserveDate).format(
    'yyyy-MM-DD HH:mm'
  );
  try {
    await axios.post(`http://localhost:5000/api/reservations`, req.body);

    // I demo response with sample text
    // you can check database for customer order's status

    await chatbotService.sendMessage(req.body.psid, {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: `Bạn đã đặt dịch vụ thành công!
          \n----Thông tin đặt chỗ ------
          \nTên khách hàng: ${req.body.customerName}
          \nSĐT: ${req.body.phoneNumber}
          \nNgày đặt: ${moment(req.body.reserveDate).format('HH:mm DD-MM-yyyy')}
          \n-----------------------------
          \nVui lòng đến trước 15 phút để chúng tôi sắp xếp thực hiện dịch vụ cho quý khách`,
          buttons: [
            {
              type: 'postback',
              title: 'Menu chính',
              payload: 'BACK_TO_MAIN_MENU',
            },
          ],
        },
      },
    });
    console.log('thanh cong');

    return res.status(200).json({
      message: 'ok',
    });
  } catch (e) {
    console.log(e.response?.data?.message);

    await chatbotService.sendMessage(req.body.psid, {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: 'Đã có lỗi xảy ra khi đặt dịch vụ này',
          buttons: [
            {
              type: 'postback',
              title: 'Menu chính',
              payload: 'BACK_TO_MAIN_MENU',
            },
          ],
        },
      },
    });
  }
};

module.exports = {
  getHomePage: getHomePage,
  getWebhook: getWebhook,
  postWebhook: postWebhook,
  handleSetupProfile: handleSetupProfile,
  getSetupProfilePage: getSetupProfilePage,
  getInfoOrderPage: getInfoOrderPage,
  setInfoOrder: setInfoOrder,
  findInfoOrder,
  getReservePage,
  setReserve,
};

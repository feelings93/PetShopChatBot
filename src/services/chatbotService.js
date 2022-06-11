require('dotenv').config();
import axios from 'axios';
import request from 'request';
import homepageService from './homepageService';
import templateMessage from './templateMessage';

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const SECONDARY_RECEIVER_ID = process.env.SECONDARY_RECEIVER_ID;
const PRIMARY_RECEIVER_ID = process.env.FACEBOOK_APP_ID;

let sendMessageWelcomeNewUser = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    try {
      let username = await homepageService.getFacebookUsername(sender_psid);
      //send text message
      let response1 = {
        text: `Xin chào ${username}! Chào mừng bạn đến với cửa hàng thú cưng của chúng tôi, ở đây sẽ có thứ bạn cần.`,
      };

      //send an image
      let response2 = {
        attachment: {
          type: 'image',
          payload: {
            url: 'https://bit.ly/imageWelcome',
          },
        },
      };

      //send a quick reply
      let response4 = {
        text: 'Menu chính',
        quick_replies: [
          {
            content_type: 'text',
            title: 'Thể loại',
            payload: 'CATEGORIES',
          },
          {
            content_type: 'text',
            title: 'Tìm kiếm đơn hàng',
            payload: 'LOOKUP_ORDER',
          },
          {
            content_type: 'text',
            title: 'Nói chuyện với shop',
            payload: 'TALK_AGENT',
          },
        ],
      };

      await sendMessage(sender_psid, response1);
      await sendMessage(sender_psid, response2);
      await sendMessage(sender_psid, response4);
      resolve('done');
    } catch (e) {
      reject(e);
    }
  });
};

let sendMessage = (sender_psid, response) => {
  return new Promise(async (resolve, reject) => {
    try {
      await homepageService.markMessageRead(sender_psid);
      await homepageService.sendTypingOn(sender_psid);
      // Construct the message body
      let request_body = {
        recipient: {
          id: sender_psid,
        },
        message: response,
      };

      // Send the HTTP request to the Messenger Platform
      request(
        {
          uri: 'https://graph.facebook.com/v2.6/me/messages',
          qs: { access_token: PAGE_ACCESS_TOKEN },
          method: 'POST',
          json: request_body,
        },
        (err, res, body) => {
          if (!err) {
            resolve('message sent!');
          } else {
            reject('Unable to send message:' + err);
          }
        }
      );
    } catch (e) {
      reject(e);
    }
  });
};

let requestTalkToAgent = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    try {
      //send a text message
      let response1 = {
        text: 'Ok. Someone real will be with you in a few minutes ^^',
      };

      await sendMessage(sender_psid, response1);

      //change this conversation to page inbox
      let app = 'page_inbox';
      await passThreadControl(sender_psid, app);
      resolve('done');
    } catch (e) {
      reject(e);
    }
  });
};

let passThreadControl = (sender_psid, app) => {
  return new Promise((resolve, reject) => {
    try {
      let target_app_id = '';
      let metadata = '';

      if (app === 'page_inbox') {
        target_app_id = SECONDARY_RECEIVER_ID;
        metadata = 'Pass thread control to inbox chat';
      }
      if (app === 'primary') {
        target_app_id = PRIMARY_RECEIVER_ID;
        metadata = 'Pass thread control to the bot, primary app';
      }
      // Construct the message body
      let request_body = {
        recipient: {
          id: sender_psid,
        },
        target_app_id: target_app_id,
        metadata: metadata,
      };

      // Send the HTTP request to the Messenger Platform
      request(
        {
          uri: 'https://graph.facebook.com/v6.0/me/pass_thread_control',
          qs: { access_token: PAGE_ACCESS_TOKEN },
          method: 'POST',
          json: request_body,
        },
        (err, res, body) => {
          console.log(body);
          if (!err) {
            resolve('message sent!');
          } else {
            reject('Unable to send message:' + err);
          }
        }
      );
    } catch (e) {
      reject(e);
    }
  });
};

let sendCategories = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    try {
      //send a generic template message
      let response = templateMessage.sendCategoriesTemplate();
      await sendMessage(sender_psid, response);
      resolve('done');
    } catch (e) {
      reject(e);
    }
  });
};

let showPets = async (sender_psid) => {
  try {
    //send a generic template message
    const { data } = await axios.get('http://localhost:5000/api/pets');
    let response = templateMessage.sendPetsTemplate(data.filter(x => x.status === 'Còn hàng'));
    await sendMessage(sender_psid, response);
  } catch (e) {
    console.log(e);
  }
};

let showProducts = async (sender_psid) => {
  try {
    //send a generic template message
    const { data } = await axios.get('http://localhost:5000/api/products');
    let response = templateMessage.sendProductsTemplate(data.filter(x => x.quantity > 0));
    await sendMessage(sender_psid, response);
  } catch (e) {
    console.log(e);
  }
};

let showServices = async (sender_psid) => {
  try {
    //send a generic template message
    const { data } = await axios.get('http://localhost:5000/api/services');
    let response = templateMessage.sendServicesTemplate(sender_psid, data);
    await sendMessage(sender_psid, response);
  } catch (e) {
    console.log(e);
  }
};

let sendLookupOrder = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = templateMessage.sendLookupOrderTemplate(sender_psid);
      await sendMessage(sender_psid, response);
      console.log('done')
      resolve('done');
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

let sendReserveService = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = templateMessage.sendReserveServiceTemplate(sender_psid);
      await sendMessage(sender_psid, response);
      console.log('done')
      resolve('done');
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
};

let showHeadphones = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = templateMessage.sendHeadphonesTemplate();
      await sendMessage(sender_psid, response);
      resolve('done');
    } catch (e) {
      reject(e);
    }
  });
};

let showTVs = (sender_psid) => {
  return new Promise((resolve, reject) => {
    try {
      resolve('done');
    } catch (e) {
      reject(e);
    }
  });
};

let showPlaystation = (sender_psid) => {
  return new Promise((resolve, reject) => {
    try {
      resolve('done');
    } catch (e) {
      reject(e);
    }
  });
};

let backToCategories = (sender_psid) => {
  sendCategories(sender_psid);
};

let backToMainMenu = (sender_psid) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = templateMessage.backToMainMenuTemplate();
      await sendMessage(sender_psid, response);
      resolve('done');
    } catch (e) {
      reject(e);
    }
  });
};

let takeControlConversation = (sender_psid) => {
  return new Promise((resolve, reject) => {
    try {
      // Construct the message body
      let request_body = {
        recipient: {
          id: sender_psid,
        },
        metadata:
          'Pass this conversation from page inbox to the bot - primary app',
      };

      // Send the HTTP request to the Messenger Platform
      request(
        {
          uri: 'https://graph.facebook.com/v6.0/me/take_thread_control',
          qs: { access_token: PAGE_ACCESS_TOKEN },
          method: 'POST',
          json: request_body,
        },
        async (err, res, body) => {
          if (!err) {
            //send messages
            await sendMessage(sender_psid, {
              text: 'The super bot came back !!!',
            });
            await backToMainMenu(sender_psid);
            resolve('message sent!');
          } else {
            reject('Unable to send message:' + err);
          }
        }
      );
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  sendMessage: sendMessage,
  sendMessageWelcomeNewUser: sendMessageWelcomeNewUser,
  sendCategories: sendCategories,
  sendLookupOrder: sendLookupOrder,
  sendReserveService,
  requestTalkToAgent: requestTalkToAgent,
  showHeadphones: showHeadphones,
  showTVs: showTVs,
  showPets,
  showServices,
  showProducts,
  showPlaystation: showPlaystation,
  backToCategories: backToCategories,
  backToMainMenu: backToMainMenu,
  passThreadControl: passThreadControl,
  takeControlConversation: takeControlConversation,
};

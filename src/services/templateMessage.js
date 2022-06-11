let sendCategoriesTemplate = () => {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [
          {
            title: 'Thú cưng',
            image_url: 'https://vinmec-prod.s3.amazonaws.com/images/20200305_171730_105268_chu-cho-duong-tinh-.max-1800x1800.jpg',
            subtitle: 'Thú cưng ở PetShop rất xịn xò và được chăm sóc cẩn thận',
            default_action: {
              type: 'web_url',
              url: 'http://localhost:3000/thu-cung',
              webview_height_ratio: 'tall',
            },
            buttons: [
              {
                type: 'web_url',
                url: 'http://localhost:3000/thu-cung',
                title: 'Xem trên Website',
              },
              {
                type: 'postback',
                title: 'Xem thú cưng',
                payload: 'SHOW_PETS',
              },
            ],
          },
          {
            title: 'Dịch vụ',
            image_url: 'https://vnn-imgs-f.vgcloud.vn/2020/04/20/09/thu-cung-2.jpg',
            subtitle: 'Dịch vụ được làm bởi những người tận tâm, khéo léo nhất',
            default_action: {
              type: 'web_url',
              url: 'http://localhost:3000/dich-vu',
              webview_height_ratio: 'tall',
            },
            buttons: [
              {
                type: 'web_url',
                url: 'http://localhost:3000/dich-vu',
                title: 'Xem trên Website',
              },
              {
                type: 'postback',
                title: 'Xem dịch vụ',
                payload: 'SHOW_SERVICES',
              },
            ],
          },
          {
            title: 'Sản phẩm khác',
            image_url: 'https://images.foody.vn/res/g77/766271/prof/s576x330/foody-upload-api-foody-mobile-1-jpg-180803103848.jpg',
            subtitle: 'Cung cấp một số loại như thức ăn, phụ kiện cho thú cưng',
            default_action: {
              type: 'web_url',
              url: 'http://localhost:3000/thu-cung',
              webview_height_ratio: 'tall',
            },
            buttons: [
              {
                type: 'web_url',
                url: 'http://localhost:3000/thu-cung',
                title: 'Xem trên Website',
              },
              {
                type: 'postback',
                title: 'Xem sản phẩm',
                payload: 'SHOW_PRODUCTS',
              },
            ],
          },
        ],
      },
    },
  };
};

let sendPetsTemplate = (pets = []) => {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: pets.map((pet) => {
          return {
            title: pet.name,
            image_url: pet.photos[0]?.url,
            subtitle: pet.price,
            default_action: {
              type: 'web_url',
              url: `http://localhost:3000/thu-cung/${pet.id}`,
              webview_height_ratio: 'tall',
            },
            buttons: [
              {
                type: 'web_url',
                url: `http://localhost:3000/thu-cung/${pet.id}`,
                title: 'Đặt hàng',
              },
              {
                type: 'postback',
                title: 'Back to categories',
                payload: 'BACK_TO_CATEGORIES',
              },
              {
                type: 'postback',
                title: 'Main menu',
                payload: 'BACK_TO_MAIN_MENU',
              },
            ],
          };
        }),
      },
    },
  };
};

let sendProductsTemplate = (products = []) => {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: products.map((product) => {
          return {
            title: product.name,
            image_url: product.photos[0]?.url,
            subtitle: product.price,
            default_action: {
              type: 'web_url',
              url: `http://localhost:3000/san-pham/${product.id}`,
              webview_height_ratio: 'tall',
            },
            buttons: [
              {
                type: 'web_url',
                url: `http://localhost:3000/san-pham/${product.id}`,
                title: 'Đặt hàng',
              },
              {
                type: 'postback',
                title: 'Quay lại thể loại',
                payload: 'BACK_TO_CATEGORIES',
              },
              {
                type: 'postback',
                title: 'Menu chính',
                payload: 'BACK_TO_MAIN_MENU',
              },
            ],
          };
        }),
      },
    },
  };
};

let sendServicesTemplate = (services = []) => {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: services.map((service) => {
          return {
            title: service.name,
            image_url: service.photos[0]?.url,
            subtitle: service.price,
            default_action: {
              type: 'web_url',
              url: `http://localhost:3000/dich-vu/${service.id}`,
              webview_height_ratio: 'tall',
            },
            buttons: [
              {
                type: 'web_url',
                url: `http://localhost:3000/dich-vu/${service.id}`,
                title: 'Đặt chỗ',
              },
              {
                type: 'postback',
                title: 'Quay lại thể loại',
                payload: 'BACK_TO_CATEGORIES',
              },
              {
                type: 'postback',
                title: 'Menu chính',
                payload: 'BACK_TO_MAIN_MENU',
              },
            ],
          };
        }),
      },
    },
  };
};

let sendLookupOrderTemplate = (sender_psid) => {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: "Để đảm bảo an toàn cho đơn hàng bạn hãy cung cấp một vài thông tin để tìm kiếm đơn hàng nhé.",
        buttons: [
          {
            type: 'web_url',
            url: `${process.env.URL_WEB_VIEW_ORDER}?sender_psid=${sender_psid}`,
            title: 'Nhập thông tin',
            webview_height_ratio: 'tall',
            messenger_extensions: true, //false: open the webview in new tab
          },
          {
            type: 'postback',
            title: 'Menu chính',
            payload: 'BACK_TO_MAIN_MENU',
          },
        ],
      },
    },
  };
};

let backToMainMenuTemplate = () => {
  return {
    text: 'Chúng tôi có thể giúp bạn gì nhỉ?',
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
        title: 'Nói chuyện với nhân viên',
        payload: 'TALK_AGENT',
      },
    ],
  };
};

let setInfoOrderTemplate = () => {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text:
          "Trên đây là tình trạng thông tin đơn hàng của bạn, nếu có thắc mắc nào hãy liên hệ với chúng tôi",
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
  };
};

module.exports = {
  sendCategoriesTemplate: sendCategoriesTemplate,
  sendPetsTemplate: sendPetsTemplate,
  sendProductsTemplate: sendProductsTemplate,
  sendServicesTemplate: sendServicesTemplate,
  sendLookupOrderTemplate: sendLookupOrderTemplate,
  backToMainMenuTemplate: backToMainMenuTemplate,
  setInfoOrderTemplate: setInfoOrderTemplate,
};

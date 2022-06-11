const psid = document.getElementById('psid');
let orderNumber = document.getElementById('orderNumber');
let phoneNumber = document.getElementById('phoneNumber');

const btnFindOrder = document.getElementById('btnFindOrder');

//load FB SDK
(function (d, s, id) {
  var js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = '//connect.facebook.net/en_US/messenger.Extensions.js';
  fjs.parentNode.insertBefore(js, fjs);
})(document, 'script', 'Messenger');

window.extAsyncInit = function () {
  // the Messenger Extensions JS SDK is done loading
  MessengerExtensions.getContext(
    facebookAppId,
    function success(thread_context) {
      // success
      //set psid to input
      psid.value = thread_context.psid;
    },
    function error(err) {
      // error
      psid.value = sender_psid;
      console.log(err);
    }
  );
};

//validate inputs
function validateInputFields() {
  if (phoneNumber.value === '') {
    phoneNumber.classList.add('is-invalid');
    return true;
  } else {
    phoneNumber.classList.remove('is-invalid');
  }
  if (orderNumber.value === '') {
    orderNumber.classList.add('is-invalid');
    return true;
  } else {
    orderNumber.classList.remove('is-invalid');
  }

  return false;
}

btnFindOrder.onclick = async () => {
  let check = validateInputFields();
  let req = {
    psid: psid.value,
    phoneNumber: phoneNumber.value,
    orderNumber: orderNumber.value,
  };

  if (!check) {
    //close webview
    MessengerExtensions.requestCloseBrowser(
      function success() {

      },
      function error(err) {
        // an error occurred
        console.log(err);
      }
    );
    try {
      const response = await fetch(
        `${window.location.origin}/find-info-order`,
        {
          method: 'POST',
          body: JSON.stringify(req),
          headers: {
            'Content-type': 'application/json; charset=UTF-8',
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
};

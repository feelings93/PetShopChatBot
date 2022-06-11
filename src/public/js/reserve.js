const psid = document.getElementById('psid');
let customerName = document.getElementById('customerName');
let phoneNumber = document.getElementById('phoneNumber');
let reserveDate = document.getElementById('reserveDate');

let service = document.getElementById('service');
const btnReserve = document.getElementById('btnReserve');
service.value = serviceName;
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
  if (customerName.value === '') {
    customerName.classList.add('is-invalid');
    return true;
  } else {
    customerName.classList.remove('is-invalid');
  }
  if (phoneNumber.value === '') {
    phoneNumber.classList.add('is-invalid');
    return true;
  } else {
    phoneNumber.classList.remove('is-invalid');
  }

  if (reserveDate.value === '') {
    reserveDate.classList.add('is-invalid');
    return true;
  } else {
    reserveDate.classList.remove('is-invalid');
  }

  return false;
}

btnReserve.onclick = async () => {
  let check = validateInputFields();
  let req = {
    psid: psid.value,
    phoneNumber: phoneNumber.value,
    customerName: customerName.value,
    serviceId,
    serviceName,
    reserveDate: reserveDate.value,
  };

  if (!check) {
    //close webview
    MessengerExtensions.requestCloseBrowser(
      function success() {},
      function error(err) {
        // an error occurred
        console.log(err);
      }
    );
    try {
      const response = await fetch(`${window.location.origin}/reserve`, {
        method: 'POST',
        body: JSON.stringify(req),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
};

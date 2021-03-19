import '@babel/polyfill';
import axios from 'axios';
import {showAlert} from './alerts';

const stripe = Stripe('pk_test_51IVzNHEGsAIkbRE6lFa7bgwWU0RR5qvyvHFfVIoRe9AYAINKzpDvZ8hEyqwyH1cbDwHN2NRRsO0eBOSd0UnN6Szy00QQTvy4y0')

export const bookTour = async tourId => {
 try {
  const url = `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`;

   const session = await axios(url);
   console.log(session.data.session.id);

   await stripe.redirectToCheckout({
     sessionId: session.data.session.id 
   }).then (function (result) {
      showAlert('error', result.error.message);
   })
   ;
 } catch(err) {
   console.log(err);
   showAlert('error', err);
 }
}
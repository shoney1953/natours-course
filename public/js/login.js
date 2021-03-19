import '@babel/polyfill';
import axios from 'axios';
import {showAlert} from './alerts';


export const login = async (email, password) => {
  
  const url = 'http://127.0.0.1:3000/api/v1/users/login';

  try{
    const res = await axios({
      method: 'POST',
      url: url,
      data: {
        email: email,
        password: password
      }
    });
    if (res.data.status === 'success') {
      showAlert('success','Logged in Successfully1');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }

 
  } catch(err) {
   
    showAlert('error', err.response.data.message);
  }
}

export const logout = async () => {
  console.log('inside logout function');
  
  const url = 'http://127.0.0.1:3000/api/v1/users/logout';
  try {
    const res = await axios({
      method: 'GET',
      url: url
    });
    
    if (res.data.status === 'success') location.reload(true);

  } catch (error) 
  {
    showAlert('error', 'Error Logging Out. Try again');
  }
}



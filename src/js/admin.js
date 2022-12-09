// axios key
const axiosKey = {
    headers: {
        'Authorization': token,
    }
};

// DOM
const orderList = document.querySelector('.js-orderList');

const backboard = {
  data: [],
  
}

axios.get(`${apiPath}admin/${apiUser}/orders`, axiosKey)
    .then((res) =>{
      console.log(res);
    })
    .catch((err) => {
      // console.log(err);
      alert(err.response.data.message)
    })

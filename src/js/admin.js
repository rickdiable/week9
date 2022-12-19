// axios key
const axiosKey = {
  headers: {
    'Authorization': token,
  }
};

// DOM
const orderPageTable = document.querySelector('.orderPage-table');
const orderPageList = document.querySelector('.orderPage-list');

const backboard = {
  data: {
    orders: [],
    c3Data: [],
  },
  getOrders(){
    axios.get(`${apiPath}admin/${apiUser}/orders`, axiosKey)
    .then((res) =>{
      this.data.orders = res.data.orders;
      // console.log(this.data.orders);      
      this.renderOrder();
    })
    .catch((err) => {
      // console.log(err);
      alert(err.response.data.message)
    })
  },
  renderOrder(){
    let str = `
    <thead>
      <tr>
        <th>訂單編號</th>
        <th>聯絡人</th>
        <th>聯絡地址</th>
        <th>電子郵件</th>
        <th>訂單品項</th>
        <th>訂單日期</th>
        <th>訂單狀態</th>
        <th>操作</th>
      </tr>
    </thead>
    `;
    let status = true;
    this.data.orders.sort(function(a, b){
      return b.createdAt - a.createdAt;
    })
    this.data.orders.forEach((i) => {
      let products = "";
      // console.log((i.createdAt));
      let date = backboard.formatTimestamp(i.createdAt);
      i.products.forEach((i) => {
        products += `<p>${i.title}</p>`;
      })
      if(i.paid){
        status = "已處理";
      }else{
        status = "未處理";
      }
      str +=`
      <tr data-id="${i.id}">
        <td>${i.id}</td>
        <td>
          <p>${i.user.name}</p>
          <p>${i.user.tel}</p>
        </td>
        <td>${i.user.address}</td>
        <td>${i.user.email}</td>
        <td>
          ${products}
        </td>
        <td>${date}</td>
        <td class="orderStatus">
          <a href="#" data-status="${i.paid}">${status}</a>
        </td>
        <td>
          <input type="button" class="delSingleOrder-Btn" value="刪除">
        </td>
      </tr>
      `
    })
    orderPageTable.innerHTML = str;
    this.formatC3Chart();
  },
  // 將時間戳轉為日期格式
  formatTimestamp(unixTimestamp){
    let date = new Date(unixTimestamp*1000);
    // console.log(date);
    // console.log("Unix Timestamp:",unixTimestamp)
    // console.log("Date Timestamp:",date.getTime())
    // console.log(date)
    // console.log("Date: "+date.getDate()+
    //           "/"+(date.getMonth()+1)+
    //           "/"+date.getFullYear()+
    //           " "+date.getHours()+
    //           ":"+date.getMinutes()+
    //           ":"+date.getSeconds());
    // console.log(`${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`);
    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`;
  },
  // 改變訂單狀態
  changeOrderStatus(e){
    let id = e.target.parentNode.parentNode.dataset.id;
    let newStatus = "";
    if (e.target.getAttribute("data-status") == "true") {
        newStatus = false;
    } else {
        newStatus = true;
    }

    let obj = {
      "data": {
        "id": id,
        "paid": newStatus
      }
    }

    axios.put(`${apiPath}admin/${apiUser}/orders`, obj, axiosKey)
    .then((res) =>{
      backboard.data.orders = res.data.orders;
      this.renderOrder();
    })
    .catch((err) => {
      console.log(err);
    })
  },
  // 刪除單筆訂單
  deleteOrderItem(e){
    let id = e.target.parentNode.parentNode.dataset.id;
    axios.delete(`${apiPath}admin/${apiUser}/orders/${id}` , axiosKey)
    .then((res) =>{
      backboard.data.orders = res.data.orders;
      alert(`已成功刪除編號為 ${id} 之訂單 `);
      this.renderOrder();
    })
    .catch((err) => {
      console.log(err);
    })
  },
  // 刪除所有訂單
  deleteOrders(){
    axios.delete(`${apiPath}admin/${apiUser}/orders`, axiosKey)
    .then((res) =>{
      console.log(res);
      this.renderOrder();
    })
    .catch((err) => {
      console.log(err);
    })
  },
  // 整理 C3 chart 所需要的資料格式
  formatC3Chart(){
    // console.log(this.data.orders);
    this.data.c3Data = [];
    let obj = {
      // "Jordan 雙人床架／雙人加大": 0,
      // "Antony 雙人床架／雙人加大": 0,
      // "Antony 遮光窗簾": 0,
      // "其他": 0
    };
    this.data.orders.forEach((i) => {
      i.products.forEach((i) => {
        if(obj[i.title] == undefined){
          obj[i.title] = 1;
        }else{
          obj[i.title] ++;
        }
      })
    })    
    Object.keys(obj).forEach((i) => {
      let arr = [];
      arr.push(i, obj[i]);
      this.data.c3Data.push(arr);
    })
    console.log(this.data.c3Data);
    this.renderC3();
  },
  renderC3(){
    let chart = c3.generate({
      bindto: '#chart', // HTML 元素綁定
      data: {
          type: "pie",
          columns: this.data.c3Data,
          colors:{
              "Louvre 雙人床架":"#DACBFF",
              "Antony 雙人床架":"#9D7FEA",
              "Anty 雙人床架": "#5434A7",
              "其他": "#301E5F",
          }
      },
    });
  },
  init(){
    this.getOrders();
    orderPageList.addEventListener('click', function(e){
      if(e.target.value == "刪除"){
        backboard.deleteOrderItem(e);
      }
      e.preventDefault();
      if(e.target.getAttribute('data-status')){
        backboard.changeOrderStatus(e);
      }      
      // if(e.target.classList.contains('discardAllBtn')){
      //   backboard.deleteOrders();
      // }
    })
  }
}

backboard.init();
// backboard.formatTimestamp(1669718496)

// [['Louvre 雙人床架', 1],  ['Antony 雙人床架', 2],  ['Anty 雙人床架', 3],  ['其他', 4],  ]
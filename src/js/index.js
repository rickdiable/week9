// DOM
const productWrap = document.querySelector('.productWrap'); // 商品
const productSelect = document.querySelector('.productSelect'); // 商品篩選器
const shoppingCartTable = document.querySelector('.shoppingCart-table'); // 購物車

// DOM 訂單
const orderInfoForm = document.querySelector('.orderInfo-form'); // 訂單
const customerName = document.querySelector("#customerName");
const customerPhone = document.querySelector("#customerPhone");
const customerEmail = document.querySelector("#customerEmail");
const customerAddress = document.querySelector("#customerAddress");
const tradeWay = document.querySelector("#tradeWay");

// DOM (訂單 表單驗證)
const inputs = document.querySelectorAll("input[type=text],input[type=tel],input[type=email]");
// 取得所有帶有 data-msg 的 <p> 標籤
const messages = document.querySelectorAll('[data-message]');

const shop = {
  data: {
    products: [],
    carts: [],
    filterProducts: []
  },
  // 每三位數加上逗號
  addCommas(price){    
    return price.toString().replace(/(\d)(?=(?:\d{3})+$)/g,'$1,');
  },
  // 取得商品資料 (產品相關(客戶) GET)
  getProducts(){
    axios.get(`${apiUrl}/products`)
    .then((res) =>{
      this.data.products = res.data.products;
      this.renderProducts(this.data.products);
      this.renderProductSelectItem();
    })
    .catch((err) => {
      console.log(err);
    })
  },
  // 渲染商品資料
  renderProducts(data){
    let str = "";
    data.forEach((i) => {
      let originPrice = shop.addCommas(i.origin_price);
      let price = shop.addCommas(i.price);
      str+=`
        <li class="productCard">
          <h4 class="productType">新品</h4>
          <img
            src="${i.images}"
            alt="${i.title}">
          <a href="#" class="addCardBtn" data-id="${i.id}")">加入購物車</a>
          <h3>${i.title}</h3>
          <del class="originPrice">NT$${originPrice}</del>
          <p class="nowPrice">NT$${price}</p>
        </li>
      `
    })
    productWrap.innerHTML = str;
  },
  // 動態抓取並顯示商品分類
  renderProductSelectItem(){
    let str = `<option value="全部" selected>全部</option>`;
    let arr = [];
    this.data.products.forEach((i) => {
      if(!arr.includes(i.category)){
        arr.push(i.category);
      }
    })
    arr.forEach((i) => {
      str+=`
      <option value="${i}">${i}</option>
      `
    })
    productSelect.innerHTML = str;
  },
  // 監聽分類清單 change 時顯示該分類的商品
  renderFilterProducts(e){
    if(e.target.value == "全部"){
      shop.renderProducts(shop.data.products);
    }else{
      shop.data.filterProducts = shop.data.products.filter(i => i.category == e.target.value);
      shop.renderProducts(shop.data.filterProducts);
    }
  },
  // 取得購物車資料 (購物車相關(客戶) GET)
  getCarts(){
    axios.get(`${apiUrl}/carts`)
    .then((res) =>{
      this.data.carts = res.data.carts;
      this.renderCart();
    })
    .catch((err) => {
      console.log(err);
    })
  },
  // 渲染購物車資料
  renderCart(){
    const emptyCart = document.querySelector('.emptyCart');
    if(this.data.carts.length == 0){
      emptyCart.classList.remove('d-none');
      str="";
      shoppingCartTable.innerHTML = str;
    }else{
      emptyCart.classList.add('d-none');
      let totalPrice = 0;
      let str = `
      <tr>
        <th width="40%">品項</th>
        <th width="15%">單價</th>
        <th width="15%">數量</th>
        <th width="15%">金額</th>
        <th width="15%"></th>
      </tr>
      `;    
      this.data.carts.forEach((i) => { 
        let price = shop.addCommas(i.product.price);
        let singleProductPrice = i.product.price * i.quantity;
        totalPrice += singleProductPrice;
        str += `
        <tr>
          <td>
            <div class="cardItem-title">
              <img src="${i.product.images}" alt="">
              <p>${i.product.title}</p>
            </div>
          </td>
          <td>NT$${price}</td>
          <td>${i.quantity}</td>
          <td>NT$${singleProductPrice}</td>
          <td class="discardBtn">
            <a href="#" class="material-icons" data-id="${i.id}">
              clear
            </a>
          </td>
        </tr>
        `
      })
      let totalPriceFormat = shop.addCommas(totalPrice);
      str += `
      <tr>
        <td>
          <a href="#" class="discardAllBtn">刪除所有品項</a>
        </td>
        <td></td>
        <td></td>
        <td>
          <p>總金額</p>
        </td>
        <td>NT$${totalPriceFormat}</td>
      </tr>
      `
      shoppingCartTable.innerHTML = str;
    }
  },
  // 加入購物車 (購物車相關(客戶) POST)
  addToCart(e){
    e.preventDefault();
    if(e.target.classList.contains('addCardBtn')){
      let id = e.target.dataset.id;
    let numCheck = 1;
    shop.data.carts.forEach((i) => {
      if(i.product.id == id){
        numCheck = i.quantity += 1;
      }
    })
    const obj = {
      "data": {
      "productId": id,
      "quantity": numCheck
      }
    };    
    axios.post(`${apiUrl}/carts`, obj)
      .then((res) =>{
        shop.data.carts = res.data.carts;
        alert('成功新增至購物車');
        shop.renderCart();
      })
      .catch((err) => {
        console.log(err);
      })
    }
  },
  // 刪除現有購物車內所有品項 (購物車相關(客戶) DELETE)
  deleteAllCart(e){
    e.preventDefault();
    if(e.target.classList.contains('discardAllBtn')){
      axios.delete(`${apiUrl}/carts`)
      .then((res) =>{
        shop.data.carts = res.data.carts;
        alert('已清空購物車');
        shop.renderCart();
      })
      .catch((err) => {
        // console.log(err);
        alert(err.response.data.message);
      })
    }
  },
  // 刪除單一購物車品項 (購物車相關(客戶) DELETE)
  deleteCartItem(e){
    e.preventDefault();
    let id = e.target.dataset.id;
    let title = shop.data.carts.filter(i => i.id == id)[0].product.title;
    axios.delete(`${apiUrl}/carts/${id}`)
    .then((res) =>{
      shop.data.carts = res.data.carts;
      alert(`已成功刪除購物車內的 ${title}`);
      shop.renderCart();
    })
    .catch((err) => {
      console.log(err);
    })
  },
  // 加入訂單 (訂單相關 (客戶) POST)
  addOrder(e){
    e.preventDefault();   
    const orderContent ={
      "data": {
        "user": {
          "name": customerName.value,
          "tel": customerPhone.value,
          "email": customerEmail.value,
          "address": customerAddress.value,
          "payment": tradeWay.value
        }
      }
    };
    
    axios.post(`${apiUrl}/orders`, orderContent)
      .then((res) =>{
        console.log(res);
        if(res.status == 200){
          alert(`送出訂單成功，您的訂單編號為 ${res.data.id}`);
        }
        shop.getCarts();
        orderInfoForm.reset();        
      })
      .catch((err) => {
        // console.log(err.response.data.message);
        alert(err.response.data.message);
      });
  },
  // validate.js
  verification(e) {
    e.preventDefault();
    let errors = validate(orderInfoForm, constraints);
    // 如果有誤，呈現錯誤訊息;如果沒有錯誤，送出表單
    if (errors) {
      shop.showErrors(errors);
    } else {
      shop.addOrder(e);
    }
  },
  showErrors(errors){
    messages.forEach((i) => {
      i.textContent = "";
      i.textContent = errors[i.dataset.message];
    })
  },
  init(){
    this.getProducts();
    this.getCarts();
    productSelect.addEventListener('change', this.renderFilterProducts);
    productWrap.addEventListener('click', this.addToCart);
    shoppingCartTable.addEventListener('click', this.deleteAllCart);
    shoppingCartTable.addEventListener('click', this.deleteCartItem);
    orderInfoForm.addEventListener('submit', this.verification);

    inputs.forEach((item) => {
      item.addEventListener("change", function(e) {
        e.preventDefault();
        let targetName = item.name;
        let errors = validate(orderInfoForm, constraints);
        item.nextElementSibling.textContent = "";
        // 針對正在操作的欄位呈現警告訊息
        if(errors){
          document.querySelector(`[data-message='${targetName}']`).textContent = errors[targetName];
        }
      });
    });
  }
}

shop.init();
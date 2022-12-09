import {apiUrl} from './all.js';

// DOM
const productWrap = document.querySelector('.productWrap');
const productSelect = document.querySelector('.productSelect');
console.log(productWrap);

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
  // 取得商品資料
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
  // 顯示商品資料
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
          <a href="#" class="addCardBtn" data-id="${i.id}" onClick="shop.addToCart('${i.id}')">加入購物車</a>
          <h3>${i.title}</h3>
          <del class="originPrice">NT$${originPrice}</del>
          <p class="nowPrice">NT$${price}</p>
        </li>
      `
    })
    productWrap.innerHTML = str;
  },
  // 動態顯示商品分類
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
  init(){
    this.getProducts();
    productSelect.addEventListener('change', this.renderFilterProducts);
  }
}

shop.init();
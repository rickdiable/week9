// validate.js 驗證
const constraints = {
  "姓名": {
    presence: {
      message: "是必填欄位"
    }
  },
  "電話": {
    presence: {
      message: "是必填欄位"
    },
    length: {
      minimum: 8,
      message: "號碼需超過 8 碼"
    }
  },
  "Email": {
    presence: {
      message: "是必填欄位"
    },
    email: {
      message: "格式有誤"
    }
  },
  "寄送地址": {
    presence: {
      message: "是必填欄位"
    }
  }
};
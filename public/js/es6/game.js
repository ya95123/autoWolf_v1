// variables
const setting = document.getElementById("setting")
const models = document.querySelectorAll(".model")
const modelData = {
  "cate": [
    {
      "model": "自訂模式",
      "peopleNum": "9-12",
      "chracterAll": "",
      "wolf": [],
      "gods": [],
      "mans": []
    },
    {
      "model": "一般局",
      "peopleNum": 9,
      "chracterAll": "(3狼,預,女,獵,3民)",
      "wolf": ["狼人", "狼人", "狼人"],
      "gods": ["預言家", "女巫", "獵人"],
      "mans": ["平民", "平民", "平民"]
    },
    {
      "model": "狼王局",
      "peopleNum": 10,
      "chracterAll": "(狼王,2狼,預,女,獵,騎,3民)",
      "wolf": ["狼人", "狼人", "狼人"],
      "gods": ["預言家", "女巫", "獵人"],
      "mans": ["平民", "平民", "平民"]
    },
  ]
}

let cate = modelData.cate
let modelPlaying = {}

// functions
const selectModel = (idx) => {
  console.log(idx)
  // 自訂模式
  if (idx === 0) {
    return
  }

  // 預設模式
  modelPlaying = cate[idx] // 玩的模式
  setting.classList.add("no-show") //關閉 setting
  setTimeout(() => {
    setting.classList.add("none")
  }, 250)

  // 
}

// *模式選擇
models.forEach((item, idx) => {
  // 插入 html
  item.innerHTML =
    `
      <span>
        ${cate[idx].model}<span class="model-character">${cate[idx].chracterAll}</span>
      </span>
      <span class="model-num">${cate[idx].peopleNum}人</span>
    `

  // 設定 model 點擊事件
  item.addEventListener("click", () => {
    selectModel(idx)
  }, false)
})


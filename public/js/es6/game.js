// variables
const setting = document.getElementById("setting")
const giveCharacter = document.getElementById("giveCharacter")
const gamming = document.getElementById("gamming")
const giveRound = document.querySelector(".give-round")
const nightTop = document.getElementById("night-top")
const nightTips = document.getElementById("night-tips")
const gammingNumber = document.getElementById("gamming-number")
const gammingChoose = document.getElementById("gamming-choose")
const chooses = document.querySelectorAll(".choose")
const models = document.querySelectorAll(".model")
const modelData = {
  "cate": [
    {
      "model": "自訂模式",
      "peopleNum": "9-12",
      "wolfsNum": "",
      "godsNum": "",
      "mansNum": "",
      "chracterText": "",
      "characterAll": [],
      "processNight": ["天黑",]
    },
    {
      "model": "一般局",
      "peopleNum": 9,
      "wolfsNum": 3,
      "godsNum": 3,
      "mansNum": 3,
      "chracterText": "(3狼,預,女,獵,3民)",
      "characterAll": ["狼人", "狼人", "狼人", "預言家", "女巫", "獵人", "平民", "平民", "平民"],
      "processNight": ["天黑", "預", "狼", "巫", "天亮"]
    },
    {
      "model": "狼王局",
      "peopleNum": 10,
      "wolfsNum": 3,
      "godsNum": 4,
      "mansNum": 3,
      "chracterText": "(狼王,2狼,預,女,獵,騎,3民)",
      "characterAll": ["狼王", "狼人", "狼人", "預言家", "女巫", "獵人", "騎士", "平民", "平民", "平民"],
      "processNight": ["天黑", "預", "狼", "巫", "天亮"]
    },
  ]
}

let cate = modelData.cate
let modelPlaying = {} // 所選模式
let characterList = [] // 身分 & 順序
let wolfsNum, godsNum, mansNum // 狼，神，民 - 數量
let giveCharacterOrder = 0 // 發身分順序紀錄
let giveTipsText // 發身分提示變化換
let witchSkills = { "posion": true, "antidote": true } // 女巫的技能設定

// functions
// *區間亂數
const rand = (min, max) => {
  let randArr = (window.crypto || window.msCrypto).getRandomValues(new Uint32Array(1));
  let randNum = randArr[0] / (0xffffffff + 1)
  return Math.floor((randNum * (max - min + 1) + min))
}

// *選擇模式
const selectModel = (idx) => {
  console.log(idx)
  // 自訂模式
  if (idx === 0) {
    return
  }

  // 預設模式
  modelPlaying = cate[idx] // 玩的模式
  // 給身分
  give()
  // 發身分 畫面
  giveHtml()

  // 關閉 setting，打開 giveCharacter 發身分
  setting.classList.add("no-show")
  setTimeout(() => {
    setting.classList.add("none")
    giveCharacter.classList.remove("none")
  }, 250)
}

// *給身分 array
const give = () => {
  let id, character, randNum, team
  let allNum = modelPlaying.peopleNum - 1

  // 狼神民 - 數量
  wolfsNum = modelPlaying.wolfsNum
  godsNum = modelPlaying.godsNum
  mansNum = modelPlaying.mansNum

  // 設定初始直
  for (let i = 0; i < modelPlaying.peopleNum; i++) {
    id = i + 1
    randNum = rand(0, allNum)
    allNum--

    // 製造成員 number
    gammingNumber.insertAdjacentHTML("beforeend", `<div class="number">${id}</div>`)

    // 隨機順序 & 身分 (轉移至新陣列)
    character = modelPlaying.characterAll[randNum] // 身分
    modelPlaying.characterAll.splice(randNum, 1)
    // 團隊
    character.includes("狼") ? team = "wolfs" : character.includes("民") ? team = "mans" : team = "gods"

    // 設定玩家初始值 json
    characterList.push(
      {
        "id": id,
        "character": character,
        "team": team,
        "alive": true
      }
    )
  }

  console.log(modelPlaying.characterAll) // 發完身分會剩 []
  console.log(characterList) // 身分順序
}

// *發身分 畫面
const giveHtml = () => {
  const giveNum = document.querySelector(".give-num")
  const giveTips = document.querySelector(".give-tips")
  const give_character = document.querySelector(".give-character")
  let lastOrder = characterList.length - 1

  // 進入畫面初始
  giveRound.setAttribute("data-give", "toCharacter")
  giveNum.innerText = characterList[giveCharacterOrder].id
  giveTips.innerText = "點擊看身分"

  // click giveRound
  giveRound.addEventListener("click", () => {
    // *順序 - click 要給身分
    if (giveRound.getAttribute("data-give") === "toCharacter") {
      // 顯示身分
      give_character.innerText = characterList[giveCharacterOrder].character
      giveCharacterOrder === lastOrder ? giveTips.innerText = "點擊後開始遊戲" : giveTips.innerText = "點擊後傳給下一位"

      // round 旋轉，關閉 num，顯示 character
      giveRound.classList.add("round-rotate")
      give_character.classList.add("text-rotate")
      giveTips.classList.add("tips-rotate")
      setTimeout(() => {
        giveNum.classList.add("none")
        give_character.classList.remove("none")
      }, 120)

      // 狀態調為 "charecter"
      giveRound.setAttribute("data-give", "toNum")
      return
    }
    // *最後一號人物時開使遊戲
    if (giveCharacterOrder === lastOrder) {
      night()
      // 關閉 giveCharacter，打開 gamming
      giveCharacter.classList.add("none")
      gamming.classList.remove("none")
      return
    }
    // *身分 - click 給下一位順序
    giveCharacterOrder++
    // 顯示順序
    giveNum.innerText = characterList[giveCharacterOrder].id
    giveTips.innerText = "點擊看身分"

    // round 旋轉，關閉 num，顯示 character
    giveRound.classList.remove("round-rotate")
    give_character.classList.remove("text-rotate")
    giveTips.classList.remove("tips-rotate")
    setTimeout(() => {
      giveNum.classList.remove("none")
      give_character.classList.add("none")
    }, 120)

    // 狀態調為 "charecter"
    giveRound.setAttribute("data-give", "toCharacter")
  }, false)
}

// TODO 遊戲 - 天黑流程
const night = () => {
  const numbers = document.querySelectorAll(".number")
  let order = 0
  let killed

  // *天黑
  console.log("天黑")
  document.body.classList.add("night")
  nightTop.innerText = "天黑請閉眼"
  nightTips.innerText = "點擊畫面下一步"

  // *click螢幕
  window.addEventListener("click", (e) => {
    e.preventDefault()
    console.log("click")
    console.log(modelPlaying.processNight[order]);

    if (modelPlaying.processNight[order] === "天黑") {
      order++
      return
    }

    if (modelPlaying.processNight[order] === "預") {
      nightTop.innerText = "預言家請睜眼"
      nightTips.innerText = "請選擇你要查驗的對象"
      nightTop.classList.add("text-gold")
      gammingNumber.classList.remove("none")
      return
    }

    if (modelPlaying.processNight[order] === "狼") {
      nightTop.innerText = "狼人請睜眼"
      nightTips.innerText = "請確認彼此身分，並比出要殺的對象"
      return
    }

    if (modelPlaying.processNight[order] === "巫") {
      // 關閉成員
      gammingNumber.classList.add("none")
      nightTop.innerText = "女巫請睜眼"

      // *無解藥，無毒藥
      if (witchSkills.antidote === false && witchSkills.posion === false) {
        nightTips.innerText = "你已使用完兩瓶毒藥\n女巫請閉眼😌"
        return
      }

      // *有解藥、無解藥，有毒藥
      // 打開選擇
      gammingChoose.classList.remove("none")
      // 判斷是否有解藥
      witchSkills.antidote === true ? nightTips.innerText = `${killed + 1} 號被殺了，請問你要救他嗎？` : nightTips.innerText = "請問你要使用毒藥嗎？"
      chooses[0].innerText = "要"
      chooses[1].innerText = "不要"
      return
    }
  })

  // TODO click number
  numbers.forEach((item, idx) => {
    item.addEventListener("click", (e) => {
      e.preventDefault()

      // *預言家查驗
      if (modelPlaying.processNight[order] === "預") {
        characterList[idx].team !== "wolfs" ? alert(`${idx + 1} 號是好人👍\n預言家請閉眼😌`) : alert(`${idx + 1} 號是狼人👎\n預言家請閉眼😌`)
        order++
        return
      }

      // *狼殺
      if (modelPlaying.processNight[order] === "狼") {
        killed = idx
        alert(`狼人殺了 ${killed + 1} 號🩸\n狼人請閉眼😌`)
        order++
        return
      }
    }, false)
  })

  // TODO click choose
  chooses.forEach(item => {
    item.addEventListener("click", () => {
      // TODO 女巫選擇
      if (modelPlaying.processNight[order] === "巫") {
        // *有解藥
        if (witchSkills.antidote === true) {
          // *救
          if (item.innerText = "要") {
            // 有毒藥 -> 喊聲，無毒藥 -> 進下一個
            witchSkills.posion === true ? alert(`你要使用毒藥嗎？(今晚不能用了)\n女巫請閉眼😌`) : order++
            return
          }
          // TODO 不救
          // 有毒藥，無毒藥
        }

        // *無解藥
        return
      }
    }, false)
  })

  // TODO 天亮要關掉這些 window click 事件、dead 掉已死對象
}

const processNightList = () => {

}

// *模式畫面 & click 模式選擇
models.forEach((item, idx) => {
  // 插入 html
  item.innerHTML =
    `
      <span>
        ${cate[idx].model}<span class="model-character">${cate[idx].chracterText}</span>
      </span>
      <span class="model-num">${cate[idx].peopleNum}人</span>
    `

  // 設定 model 點擊事件 -> 確定模式
  item.addEventListener("click", () => {
    selectModel(idx)
  }, false)
})


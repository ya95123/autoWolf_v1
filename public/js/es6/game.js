// variables
const body = document.body
const app = document.getElementById("app")
const setting = document.getElementById("setting")
const giveCharacter = document.getElementById("giveCharacter")
const gamming = document.getElementById("gamming")
const giveRound = document.querySelector(".give-round")
const textTop = document.getElementById("text-top")
const gammingTips = document.getElementById("gamming-tips")
const gammingNumber = document.getElementById("gamming-number")
const gammingChoose = document.getElementById("gamming-choose")
const gammingFunction = document.getElementById("gamming-function")
const gammingNext = document.getElementById("gamming-next")
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
let characterList = [] // 給的 身分 & 順序
let wolfsNum, godsNum, mansNum // 狼，神，民 - 數量
let giveCharacterOrder = 0 // 發身分順序紀錄
let giveTipsText // 發身分提示變化換
let numbers // 成員號碼 div
let order = 0 // 流程順序
let killed = [] // 夜晚被殺 [0]狼殺 [1]毒殺
let witchSkills = { "antidote": true, "posion": true, "start": false } // 女巫的技能設定
let score = [] // 分數紀錄
let startNum // 開始發言號碼

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
  // 記分欄初始分數
  score = { "wolfs": modelPlaying.wolfsNum, "gods": modelPlaying.godsNum, "mans": modelPlaying.mansNum }
  console.log(score)

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

  // numbers DOM
  numbers = document.querySelectorAll(".number")

  // console.log(modelPlaying.characterAll) // 發完身分會剩 []
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

// *遊戲 - 天黑
const night = () => {
  // 天黑，關閉 giveCharacter，打開 gamming、格式歸零
  body.classList.add("night")
  giveCharacter.classList.add("none")
  gammingNumber.classList.add("none")
  gammingChoose.classList.add("none")
  gammingFunction.classList.add("none")
  gammingNext.classList.add("none")
  textTop.classList.remove("text-gold")
  gamming.classList.remove("none")
  textTop.innerText = "天黑請閉眼"
  gammingTips.innerText = "點擊畫面下一步"
  witchSkills.start = false
  morningCilck = false
  order = 0

  // click app - 判定夜晚流程階段
  app.addEventListener("click", nightFlow, false)

  // click 成員號碼、選擇
  numbersChoosesClick()
}

// *夜晚流程
const nightFlow = (e) => {
  e.preventDefault()
  console.log(modelPlaying.processNight[order])

  if (modelPlaying.processNight[order] === "天黑") {
    order++
    return
  }

  if (modelPlaying.processNight[order] === "預") {
    textTop.innerText = "預言家請睜眼"
    gammingTips.innerText = "請選擇你要查驗的對象"
    textTop.classList.add("text-gold")
    gammingNumber.classList.remove("none")
    return
  }

  if (modelPlaying.processNight[order] === "狼") {
    textTop.innerText = "狼人請睜眼"
    gammingTips.innerText = "請確認彼此身分，比出要殺的對象"
    return
  }

  if (modelPlaying.processNight[order] === "巫") {
    console.log(witchSkills)
    // 功能已展開時，就不再往下跑了，避免跟後續動作衝突(Dom)
    if (witchSkills.start) return
    witchSkills.start = true

    // 關閉成員
    gammingNumber.classList.add("none")
    textTop.innerText = "女巫請睜眼"

    // *無解藥，無毒藥
    if (witchSkills.antidote === false && witchSkills.posion === false) {
      gammingTips.innerText = "你已使用完兩瓶藥\n女巫請閉眼😌"
      return
    }

    // *有解藥、無解藥，有毒藥
    // 打開選擇
    gammingChoose.classList.remove("none")
    // 有解藥
    if (witchSkills.antidote === true) {
      // 是否刀到女巫 -> 是(不能自救)
      characterList[killed[0]].character === "女巫" ? gammingTips.innerText = `${characterList[killed[0]].id} 號被殺了，請問你要救他嗎？\n(女巫不能自救)` : gammingTips.innerText = `${characterList[killed[0]].id} 號被殺了，請問你要救他嗎？`
      chooses[0].innerText = "救"
      chooses[1].innerText = "不救"
      return
    }
    // 無解藥，有毒藥
    gammingTips.innerText = "請問你要使用毒藥嗎？"
    chooses[0].innerText = "毒"
    chooses[1].innerText = "不毒"
    return
  }

  if (modelPlaying.processNight[order] === "天亮") {
    console.log(killed)
    body.classList.remove("night")
    textTop.classList.remove("text-gold")
    gammingNumber.classList.add("none")
    gammingChoose.classList.add("none")
    // 預備進天亮發言階段
    order++

    // *死、平安夜 (0死、1死、2死、同刀同毒)
    // 同刀同毒
    if (killed[0] === killed[1]) {
      killed = [killed[0]]
    } else {
      // 排序號碼 (數字排法的寫法)
      killed.sort((a, b) => { return a - b })
    }
    // 刪除為 -1 的
    killed = killed.filter(num => { return num >= 0 })
    console.log(killed)

    // *有人死亡
    if (killed.length !== 0) {
      killed.length === 1 ? textTop.innerText = `天亮了，今晚 ${characterList[killed[0]].id} 號被殺了🩸` : textTop.innerText = `天亮了，今晚 ${characterList[killed[0]].id},${characterList[killed[1]].id} 號被殺了🩸`
      gammingTips.innerText = "點擊畫面下一步"

      // 死掉的人不能再被點擊、紀錄狼、神、人 存活人數
      killed.forEach((item, idx) => {
        console.log(item)
        // dead 掉已死對象
        numbers[item].classList.add("dead")
        // characterList 死亡狀態紀錄
        characterList[item].alive = false
        // 分數紀錄
        characterList[item].team === "wolfs" ? score.wolfs-- : characterList[item].team === "gods" ? score.gods-- : score.mans--
      })
      console.log(score)
      return
    }
    // *平安夜 -> 空陣列
    textTop.innerText = "天亮了，\n今晚是平安夜🌙"
    gammingTips.innerText = "點擊畫面下一步"
    return
  }

  // *天亮發言開始
  morning()
}

// TODO click 成員號碼、選擇
const numbersChoosesClick = () => {
  // TODO click number
  numbers.forEach((item, idx) => {
    item.addEventListener("click", (e) => {
      e.preventDefault()
      // !check 死亡方式
      // *預言家查驗
      if (modelPlaying.processNight[order] === "預") {
        characterList[idx].team !== "wolfs" ? alert(`${idx + 1} 號是好人👍\n預言家請閉眼😌`) : alert(`${idx + 1} 號是狼人👎\n預言家請閉眼😌`)
        order++
        return
      }

      // *狼殺
      if (modelPlaying.processNight[order] === "狼") {
        killed[0] = idx
        alert(`狼人請閉眼😌\n(狼人殺了 ${characterList[killed[0]].id} 號🩸)`)
        order++
        return
      }

      // *巫毒
      if (modelPlaying.processNight[order] === "巫") {
        killed[1] = idx
        alert(`女巫請閉眼😌\n(女巫毒了 ${characterList[killed[1]].id} 號💀)`)
        order++
        return
      }
    }, false)
  })

  // TODO click choose
  chooses.forEach(item => {
    item.addEventListener("click", (e) => {
      // ＊女巫選擇
      if (modelPlaying.processNight[order] === "巫") {
        console.log(item.innerText)
        // *救
        if (item.innerText === "救") {
          // 女巫自己被毒不能自救
          if (characterList[killed[0]].character === "女巫") {
            alert("女巫不能自救🚫\n請點選「不救」")
            return
          }
          // 有毒藥
          if (witchSkills.posion === true) {
            alert(`你要使用毒藥嗎？(今晚不能用了)\n女巫請閉眼😌\n(女巫救了 ${characterList[killed[0]].id} 號🔮)`)
            witchSkills.antidote = false
            killed[0] = -1
          } else {
            // 無毒藥
            alert(`女巫請閉眼😌\n(女巫救了 ${characterList[killed[0]].id} 號🔮)\n(女巫已無毒藥)`)
          }
          order++
          return
        }
        // *不救
        if (item.innerText === "不救") {
          // 有毒藥
          if (witchSkills.posion === true) {
            gammingTips.innerText = "請問你要使用毒藥嗎？"
            chooses[0].innerText = "毒"
            chooses[1].innerText = "不毒"
            return
          }
          // 無毒藥
          alert(`女巫請閉眼😌\n(女巫已無毒藥)`)
          order++
          return
        }
        // *毒
        if (item.innerText === "毒") {
          // 防止點擊穿透
          e.stopPropagation()
          // 關閉選項，讓成員出來
          gammingChoose.classList.add("none")
          gammingNumber.classList.remove("none")
          gammingTips.innerText = "請比出要毒的對象"
          witchSkills.posion = false
          return
        }
        // *不毒
        alert(`女巫請閉眼😌`)
        order++
        return
      }
    }, false)
  })
}

// TODO 遊戲 - 天亮流程
const morning = () => {
  console.log("天亮發言開始")
  // 關閉天黑流程的 app 監聽
  app.removeEventListener("click", nightFlow, false)
  // 打開 next btn
  gammingNext.classList.remove("none")
  gammingNext.innerText = "下一位"

  // *天亮後第一位發言
  // 沒有人死->隨機開始發言，有人死->第一個死後發言 TODO check 死兩人
  killed.length === 0 ? startNum = rand(0, characterList.length - 1) : startNum = killed[0] + 1
  // 超過最大的號碼，要回到初始號碼 1
  if (startNum >= characterList.length) startNum -= characterList.length
  textTop.innerText = `${characterList[startNum].id} 號開始發言`
  gammingTips.innerText = `(${characterList[startNum].character})`

  // 判斷是否有功能
  morningFunction(startNum)
  // click function / next
  functionNextClick()
}

// TODO morning - 如果是神或狼，要顯示功能
const morningFunction = (idx) => {
  if (characterList[idx].team === "wolfs") {
    gammingFunction.classList.remove("none")
    gammingFunction.innerText = "自爆"
    return
  }
  if (characterList[idx].character === "騎士") {
    gammingFunction.classList.remove("none")
    gammingFunction.innerText = "撞人"
    return
  }
  // *沒功能角色，關閉功能按鈕
  gammingFunction.classList.add("none")
}

// TODO moring - click Next
const functionNextClick = () => {
  // 發言循環
  let speakOrder = []
  let lastCharacterLisetLen = characterList.length - 2
  let nextFirst = startNum + 1

  // *處理 speakOrder Arr
  for (let i = 0; i < lastCharacterLisetLen; i++) {
    // 若超過最後一號，倒回去初始點 0，直至迴圈跑完
    if (nextFirst > lastCharacterLisetLen + 1) nextFirst = 0

    // 若女巫有毒要跳過這次迴圈 TODO check 已死的陣列
    if (characterList[nextFirst].alive === false) {
      nextFirst++
      continue
    }
    // push 進發言循環 Arr
    speakOrder.push(nextFirst)
    // 下一號
    nextFirst++
  }

  console.log(speakOrder)

  // *click next 下一步
  gammingNext.addEventListener("click", () => {
    // TODO 進入投票環節
    if (speakOrder.length === 0) return
    // 換誰發言
    textTop.innerText = `${characterList[speakOrder[0]].id} 號開始發言`
    gammingTips.innerText = `(${characterList[speakOrder[0]].character})`
    if (speakOrder.length === 1) gammingNext.innerText = "投票"
    // 判斷是否有功能
    morningFunction(speakOrder[0])

    speakOrder.splice(0, 1)
    console.log(speakOrder)
  }, false)

  // TODO click function 角色技能
  gammingFunction.addEventListener("click", () => {
    if (gammingFunction.innerText === "自爆") {
      console.log("自爆")
      night()
      return
    }
    if (gammingFunction.innerText === "撞人") {
      console.log("撞人")
      return
    }
  }, false)
}

// *起始 - 模式畫面 & click 模式選擇
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

// TODO 1.女巫不能自救OK 2.發言順序OK & 下一位OK & 功能處理 3.投票環節 & !是否有遺言 & 死前是否有技能 4.不斷計分，有隊伍歸零，遊戲結束 5.結束畫面


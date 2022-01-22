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
    // {
    //   "model": "自訂模式",
    //   "peopleNum": "9-12",
    //   "wolfsNum": "",
    //   "godsNum": "",
    //   "mansNum": "",
    //   "chracterText": "",
    //   "characterAll": [],
    //   "processNight": ["天黑",]
    // },
    {
      "model": "一般局",
      "peopleNum": 9,
      "wolfsNum": 3,
      "godsNum": 3,
      "mansNum": 3,
      "chracterText": "(3狼,預,女,獵,3民)",
      "characterAll": ["狼人", "狼人", "狼人", "預言家", "女巫", "獵人", "平民", "平民", "平民"],
      "processNight": ["天黑", "預", "狼", "巫", "天亮", "遺言"]
    },
    {
      "model": "狼王局",
      "peopleNum": 10,
      "wolfsNum": 3,
      "godsNum": 4,
      "mansNum": 3,
      "chracterText": "(狼王,2狼,預,女,獵,騎,3民)",
      "characterAll": ["狼王", "狼人", "狼人", "預言家", "女巫", "獵人", "騎士", "平民", "平民", "平民"],
      "processNight": ["天黑", "預", "狼", "巫", "天亮", "遺言"]
    },
  ]
}

let cate = modelData.cate
let modelPlaying = {} // 所選模式
let characterList = [] // 給的 身分 & 順序
let giveCharacterOrder = 0 // 發身分順序紀錄
let giveTipsText // 發身分提示變化換
let numbers // 成員號碼 div
let order = 0 // 流程順序
let killed = [] // 夜晚被殺 [0]狼殺 [1]毒殺
let score = [] // 分數紀錄
let isGameOver = false // 是否遊戲結束
let startNum // 開始發言號碼
let speakOrder = [] // 白天發言循環 arr
let lastCharacterLisetLen // 白天剩餘發言的長度
let nextFirst // 白天下一位發言的 idx
// 夜晚神的紀錄
let nightGodsState = {
  "prophet": { "alive": true },
  "witch": {
    "antidote": true,
    "poison": true,
    "poisonTarget": -1,
    "start": false,
    "alive": true
  }
}

// functions
// *區間亂數
const rand = (min, max) => {
  let randArr = (window.crypto || window.msCrypto).getRandomValues(new Uint32Array(1));
  let randNum = randArr[0] / (0xffffffff + 1)
  return Math.floor((randNum * (max - min + 1) + min))
}

// *選擇模式
const selectModel = (idx) => {
  console.log(cate[idx].model)
  // 自訂模式
  if (cate[idx].model === "自訂模式") return

  // 預設模式
  modelPlaying = cate[idx] // 玩的模式
  // 記分欄初始分數
  score = { "day": 0, "wolfs": modelPlaying.wolfsNum, "gods": modelPlaying.godsNum, "mans": modelPlaying.mansNum }
  console.log("初始計分", score)

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
  // 開始監聽 numbers、chooses 點擊事件
  numbersChoosesClick()

  // console.log(modelPlaying.characterAll) // 發完身分會剩 []
  console.log("身分：", characterList) // 身分順序
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
      // 進入夜晚
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
  nightGodsState.witch.start = false
  morningCilck = false
  order = 0
  killed = []
  score.day++

  // 關閉白天的 next、function 監聽
  gammingNext.removeEventListener("click", nextClick, false)
  gammingFunction.removeEventListener("click", functionClick, false)

  // click app - 判定夜晚流程階段
  app.addEventListener("click", nightFlow, false)
  // 每晚計分
  console.log("記分欄：", score)
}

// *夜晚流程
const nightFlow = (e) => {
  e.preventDefault()
  console.log("夜晚流程：", modelPlaying.processNight[order])

  if (modelPlaying.processNight[order] === "天黑") {
    order++
    return
  }

  if (modelPlaying.processNight[order] === "預") {
    textTop.classList.add("text-gold")
    textTop.innerText = "預言家請睜眼"

    // *預言家已死狀態
    if (nightGodsState.prophet.alive === false) {
      gammingTips.innerText = "(預言家已死👻)\n請選擇你要查驗的對象\n預言家請閉眼😌\n\n點擊畫面下一步"
      order++
      return
    }

    // 預言家活著
    gammingTips.innerText = "請選擇你要查驗的對象"
    gammingNumber.classList.remove("none")
    return
  }

  if (modelPlaying.processNight[order] === "狼") {
    gammingNumber.classList.remove("none")
    textTop.innerText = "狼人請睜眼"
    gammingTips.innerText = "請確認彼此身分，比出要殺的對象"
    return
  }

  if (modelPlaying.processNight[order] === "巫") {
    console.log("女巫技能狀態：", nightGodsState.witch)
    // 功能已展開時，就不再往下跑了，避免跟後續動作衝突(Dom)
    if (nightGodsState.witch.start) return
    nightGodsState.witch.start = true

    // 關閉成員
    gammingNumber.classList.add("none")
    textTop.innerText = "女巫請睜眼"

    // *女巫已死狀態
    if (nightGodsState.witch.alive === false) {
      // 無解、無毒
      if (nightGodsState.witch.antidote === false && nightGodsState.witch.poison === false) {
        gammingTips.innerText = "(女巫已死👻)\n你已使用完兩瓶藥\n女巫請閉眼😌\n\n點擊畫面下一步"
      }
      // 有解、無毒
      if (nightGodsState.witch.antidote === true && nightGodsState.witch.poison === false) {
        gammingTips.innerText = `(女巫已死👻)\n${characterList[killed[0]].id} 號被殺了，請問你要救他嗎？\n女巫請閉眼😌\n\n點擊畫面下一步`
      }
      // 有解、有毒
      if (nightGodsState.witch.antidote === true && nightGodsState.witch.poison === true) {
        gammingTips.innerText = `(女巫已死👻)\n${characterList[killed[0]].id} 號被殺了，請問你要救他嗎？\n你要使用毒藥嗎？\n女巫請閉眼😌\n\n點擊畫面下一步`
      }
      order++
      return
    }

    // *無解藥，無毒藥
    if (nightGodsState.witch.antidote === false && nightGodsState.witch.poison === false) {
      gammingTips.innerText = "你已使用完兩瓶藥\n女巫請閉眼😌\n點擊畫面下一步"
      order++
      return
    }

    // *有解藥、無解藥，有毒藥
    // 打開選擇
    gammingChoose.classList.remove("none")
    // 有解藥
    if (nightGodsState.witch.antidote === true) {
      // 是否刀到女巫 -> 是(不能自救)
      characterList[killed[0]].character === "女巫" ? gammingTips.innerText = `${characterList[killed[0]].id} 號被殺了，請問你要救他嗎？\n(女巫不能自救)` : gammingTips.innerText = `${characterList[killed[0]].id} 號被殺了，請問你要救他嗎？`
      chooses[0].innerText = "救"
      chooses[1].innerText = "不救"
      return
    }
    // *無解藥，有毒藥
    gammingTips.innerText = "請問你要使用毒藥嗎？"
    chooses[0].innerText = "毒"
    chooses[1].innerText = "不毒"
    return
  }

  if (modelPlaying.processNight[order] === "天亮") {
    console.log(`狼刀 idx：${killed[0]}，巫毒 idx：${killed[1]}`)
    body.classList.remove("night")
    textTop.classList.remove("text-gold")
    gammingNumber.classList.add("none")
    gammingChoose.classList.add("none")

    // *處理 killed Arr -> 死、平安夜 (0死、1死、2死、同刀同毒)
    // 同刀同毒
    if (killed[0] === killed[1]) {
      killed = [killed[0]]
    } else {
      // 排序號碼 (數字排法的寫法)
      killed.sort((a, b) => { return a - b })
    }
    // 刪除為 -1 的
    killed = killed.filter(num => { return num >= 0 })
    console.log("死亡名單 idx：", killed)

    // *只有第一晚有人死才有遺言，有遺言 ++ 無遺言 +=2
    if (score.day === 1 && killed.length !== 0) {
      order++
    } else {
      order += 2
    }

    // *有人死亡
    if (killed.length !== 0) {
      killed.length === 1 ? textTop.innerText = `天亮了，今晚 ${characterList[killed[0]].id} 號被殺了🩸` : textTop.innerText = `天亮了，今晚 ${characterList[killed[0]].id},${characterList[killed[1]].id} 號被殺了🩸`
      gammingTips.innerText = "點擊畫面下一步"

      // !巫有解藥時才紀錄 死亡狀態 / 無解藥時，在夜晚當下紀錄
      if (nightGodsState.witch.antidote === true) killed.forEach(item => deadOne(item))

      console.log("記分欄：", score)
      return
    }

    // *平安夜 -> 空陣列
    textTop.innerText = "天亮了，\n今晚是平安夜🌙"
    gammingTips.innerText = "點擊畫面下一步"
    console.log("記分欄：", score)
    return
  }

  // *遺言
  if (modelPlaying.processNight[order] === "遺言") {
    killed.length === 1 ? textTop.innerText = `請 ${characterList[killed[0]].id} 號發表遺言` : textTop.innerText = `請 ${characterList[killed[0]].id},${characterList[killed[1]].id} 號發表遺言`
    order++
    return
  }

  // *天亮發言開始
  morning()
}

// TODO click 成員號碼、選擇 - 在建立完 numbers 呼叫
const numbersChoosesClick = () => {
  // TODO click number
  numbers.forEach((item, idx) => {
    item.addEventListener("click", (e) => {
      e.preventDefault()
      // !夜晚
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

        // *巫沒有解藥直接計算死亡，天亮後就不要再重複計算
        if (nightGodsState.witch.antidote === false) {
          deadOne(killed[0])
          console.log("記分欄：", score)
        }
        // 是否遊戲提前結束
        if (isGameOver === true) {
          gameOver()
          alert(`天亮了，狼人殺了 ${characterList[killed[0]].id} 號🩸\n女巫已無解藥，狼人獲勝！`)
        }
        return
      }

      // *巫毒
      if (modelPlaying.processNight[order] === "巫") {
        killed[1] = idx
        nightGodsState.witch.poisonTarget = killed[1]
        alert(`女巫請閉眼😌\n(女巫毒了 ${characterList[killed[1]].id} 號💀)`)
        order++

        // *巫沒有解藥直接計算死亡，天亮後就不要再重複計算
        if (nightGodsState.witch.antidote === false) {
          deadOne(killed[1])
          console.log("記分欄：", score)
        }
        return
      }

      // !白天
      // *狼王帶人 || characterList[knightKill].character === "狼王"
      if (characterList[speakOrder[0]].character === "狼王") {
        console.log("狼王帶走對象 idx", idx, characterList[idx])
        alert(`${characterList[speakOrder[0]].id} 號帶走了 ${characterList[idx].id} 號🩸`)
        // 死亡紀錄
        deadOne(idx)
        // 如果遊戲未結束，進天黑
        isGameOver === false ? night() : gameOver()
        return
      }

      // *騎士撞人
      if (characterList[speakOrder[0]].character === "騎士") {
        console.log("騎士撞了對象 idx", idx, characterList[idx])
        // *狼王死
        if (characterList[idx].character === "狼王") {
          alert(`${characterList[idx].id} 號是狼人🐺\n狼人死了，騎士活著。`)
          textTop.innerText = `${characterList[idx].id} 號啟動角色技能`
          gammingTips.innerText = `(${characterList[idx].character}) 請選擇你要帶走的對象🩸`

          // 讓發言順序進到狼王，使下次點擊 numbers 進到狼王的功能裡
          speakOrder[0] = idx

          // 死亡紀錄
          deadOne(idx)
          return
        }

        // *狼死
        let knightKill// 騎士即將撞死的對象
        if (characterList[idx].team === "wolfs") {
          alert(`${characterList[idx].id} 號是狼人🐺\n狼人死了，騎士活著。`)
          knightKill = idx // 狼
        } else {
          // *騎士死
          alert(`${characterList[idx].id} 號是好人👍\n騎士以死謝罪。`)
          knightKill = speakOrder[0] // 騎士自己
        }

        // 死亡紀錄
        deadOne(knightKill)
        // 如果遊戲未結束，進天黑
        isGameOver === false ? night() : gameOver()
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
            order++
            return
          }

          // 有毒藥 / 無毒藥
          nightGodsState.witch.poison === true ? alert(`你要使用毒藥嗎？(今晚不能用了)\n女巫請閉眼😌\n(女巫救了 ${characterList[killed[0]].id} 號🔮)`) : alert(`女巫請閉眼😌\n(女巫救了 ${characterList[killed[0]].id} 號🔮)\n(女巫已無毒藥)`)

          // 用掉解藥
          nightGodsState.witch.antidote = false
          killed[0] = -1

          order++
          return
        }
        // *不救
        if (item.innerText === "不救") {
          // 有毒藥
          if (nightGodsState.witch.poison === true) {
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
          nightGodsState.witch.poison = false
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
  // 是否遊戲結束
  if (isGameOver === true) {
    gameOver()
    return
  }

  console.log("白天：開始發言")
  console.log("身分：", characterList)

  // 關閉天黑流程的 app 監聽
  app.removeEventListener("click", nightFlow, false)
  // 打開 next btn
  gammingNext.classList.remove("none")

  // *天亮後第一位發言
  // 沒有人死->隨機開始發言，有人死->第一個死後發言
  killed.length === 0 ? startNum = rand(0, characterList.length - 1) : startNum = killed[0] + 1
  // 確保 startNum 為存活對象
  while (startNum >= characterList.length || characterList[startNum].alive !== true) {
    // 超過最大的號碼，要回到初始號碼 1
    if (startNum >= characterList.length) {
      startNum -= characterList.length
      continue
    }
    // 直到找到活的
    startNum++
  }
  console.log("發言第一位：idx", startNum, characterList[startNum])

  // 提示
  textTop.innerText = `${characterList[startNum].id} 號開始發言`
  gammingTips.innerText = `(${characterList[startNum].character})`
  gammingNext.innerText = "下一位"

  // 判斷是否有功能
  morningFunction(startNum)
  // 處理發言循環、呼叫 next、function 事件
  handleSpeakOrder()
}

// *白天 - 判斷是神或狼，要顯示功能
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

// *白天 - 處理發言循環 Arr、呼叫 click next、function 事件
const handleSpeakOrder = () => {
  // 發言循環
  speakOrder = []
  lastCharacterLisetLen = characterList.length
  nextFirst = startNum

  // *處理 speakOrder Arr
  for (let i = 0; i < lastCharacterLisetLen; i++) {
    // 若超過最後一號，倒回去初始點 0，直至迴圈跑完
    if (nextFirst >= lastCharacterLisetLen) nextFirst = 0

    // 若有已死的跳過這次迴圈
    if (characterList[nextFirst].alive === false) {
      nextFirst++
      continue
    }
    // push 進發言循環 Arr
    speakOrder.push(nextFirst)
    // 下一號
    nextFirst++
  }

  console.log("發言順序 idx", speakOrder)

  // 呼叫 next、function 事件
  gammingNext.addEventListener("click", nextClick, false)
  gammingFunction.addEventListener("click", functionClick, false)
}

// TODO click next 下一步
const nextClick = () => {
  // 刪去已發言者
  speakOrder.splice(0, 1)
  console.log("發言順序 idx", speakOrder)

  // TODO 進入投票環節
  if (speakOrder.length === 0) {
    console.log("投票")
    return
  }
  // 換誰發言
  textTop.innerText = `${characterList[speakOrder[0]].id} 號開始發言`
  gammingTips.innerText = `(${characterList[speakOrder[0]].character})`
  if (speakOrder.length === 1) gammingNext.innerText = "投票"
  // 判斷是否有功能
  morningFunction(speakOrder[0])
}

// *click function 角色技能
const functionClick = () => {
  // *狼人
  if (gammingFunction.innerText === "自爆") {
    console.log("自爆 idx", speakOrder[0], characterList[speakOrder[0]])
    // 死亡紀錄
    deadOne(speakOrder[0])

    // 是否遊戲結束
    if (isGameOver === true) {
      gameOver()
      return
    }

    // 狼王帶人
    if (characterList[speakOrder[0]].character === "狼王") {
      // 關閉白天按鈕
      gammingFunction.classList.add("none")
      gammingNext.classList.add("none")
      // 打開成員號碼
      gammingNumber.classList.remove("none")
      // 更改文字
      textTop.innerText = `${characterList[speakOrder[0]].id} 號啟動角色技能`
      gammingTips.innerText = `(${characterList[speakOrder[0]].character}) 請選擇你要帶走的對象🩸`
      return
    }
    // 進天黑
    night()
    return
  }

  // *騎士
  if (gammingFunction.innerText === "撞人") {
    console.log("撞人")
    // 關閉白天按鈕
    gammingFunction.classList.add("none")
    gammingNext.classList.add("none")
    // 打開成員號碼
    gammingNumber.classList.remove("none")
    // 更改文字
    textTop.innerText = `${characterList[speakOrder[0]].id} 號騎士`
    gammingTips.innerText = `(${characterList[speakOrder[0]].character}) 請選擇你要撞的對象🦄`
    return
  }
}

// *有人死亡 -> 傳 idx 進來，正式遊戲結束要要在流程內判斷
const deadOne = (idx) => {
  // dead 掉已死對象
  numbers[idx].classList.add("dead")
  // characterList 死亡狀態紀錄
  characterList[idx].alive = false
  // 分數紀錄
  characterList[idx].team === "wolfs" ? score.wolfs-- : characterList[idx].team === "gods" ? score.gods-- : score.mans--

  // 女巫、預言家的死亡特別紀錄
  if (characterList[idx].character === "女巫") nightGodsState.witch.alive = false
  if (characterList[idx].character === "預言家") nightGodsState.prophet.alive = false

  // 判斷遊戲是否結束調整 isGameOver true/false
  if (score.wolfs === 0 || score.gods === 0 || score.mans === 0) isGameOver = true
}

// *遊戲結束
const gameOver = () => {
  console.log("身分：", characterList)
  console.log("遊戲結束", score)
  // 背景環境設定
  body.classList.remove("night")
  gammingNumber.classList.add("none")
  gammingFunction.classList.add("none")
  gammingNext.classList.add("none")
  textTop.classList.remove("text-gold")

  // 關閉夜晚 app 監聽
  app.removeEventListener("click", nightFlow, false)

  // 文字
  score.wolfs === 0 ? textTop.innerText = "好人獲勝\n🙌" : textTop.innerText = "狼人獲勝\n🐺"
  gammingTips.innerText = `剩下 ${score.wolfs} 狼 ${score.gods} 神 ${score.mans} 民\n重整頁面，再來一局！`
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

// TODO 1.天亮的遺言(只有第一晚) 2.死前是否有技能(狼王、獵人，被毒沒有) 3.投票環節 4.白天出去的遺言 5.外加新功能 - 顯示計分在畫面上
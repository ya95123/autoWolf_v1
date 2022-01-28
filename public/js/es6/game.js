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
const scoreRecord = document.getElementById("scoreRecord")
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
// 夜晚、白天有功能角色的紀錄
let functionState = {
  "prophet": { "alive": true },
  "witch": {
    "antidote": true,
    "poison": true,
    "poisonTarget": -1,
    "start": false,
    "alive": true
  },
  "knight": {
    "function": true
  },
  "hunter": {
    "function": true
  },
  "wolfKing": {
    "function": true
  },
  "night": true,
  "nightKillOrder": 0
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
  gammingNext.classList.add("none")
  gammingFunction.setAttribute("class", "none")
  textTop.classList.remove("text-gold")
  gamming.classList.remove("none")
  scoreRecord.classList.remove("none")
  textTop.innerText = "天黑請閉眼"
  gammingTips.innerText = "點擊畫面下一步"
  functionState.witch.start = false
  functionState.night = true
  functionState.nightKillOrder = 0
  order = 0
  killed = []
  scoreRecord.innerText = `${score.wolfs} 狼 ${score.gods} 神 ${score.mans} 民`
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
    if (functionState.prophet.alive === false) {
      gammingTips.innerText = "請選擇你要查驗的對象\n預言家請閉眼😌\n(預言家已死👻)\n\n點擊畫面下一步"
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
    console.log("女巫技能狀態：", functionState.witch)
    // 功能已展開時，就不再往下跑了，避免跟後續動作衝突(Dom)
    if (functionState.witch.start) return
    functionState.witch.start = true

    // 關閉成員
    gammingNumber.classList.add("none")
    textTop.innerText = "女巫請睜眼"

    // *女巫已死狀態
    if (functionState.witch.alive === false) {
      // 無解、無毒
      if (functionState.witch.antidote === false && functionState.witch.poison === false) {
        gammingTips.innerText = "你已使用完兩瓶藥\n女巫請閉眼😌\n(女巫已死👻)\n\n點擊畫面下一步"
      }
      // 無解、有毒
      if (functionState.witch.antidote === false && functionState.witch.poison === true) {
        gammingTips.innerText = "你要使用毒藥嗎？\n女巫請閉眼😌\n(女巫已死👻)\n\n點擊畫面下一步"
      }
      // 有解、無毒
      if (functionState.witch.antidote === true && functionState.witch.poison === false) {
        gammingTips.innerText = `${characterList[killed[0]].id} 號被殺了，請問你要救他嗎？\n女巫請閉眼😌\n(女巫已死👻)\n\n點擊畫面下一步`
      }
      // 有解、有毒
      if (functionState.witch.antidote === true && functionState.witch.poison === true) {
        gammingTips.innerText = `${characterList[killed[0]].id} 號被殺了，請問你要救他嗎？\n你要使用毒藥嗎？\n女巫請閉眼😌\n(女巫已死👻)\n\n點擊畫面下一步`
      }
      order++
      return
    }

    // *無解藥，無毒藥
    if (functionState.witch.antidote === false && functionState.witch.poison === false) {
      gammingTips.innerText = "你已使用完兩瓶藥\n女巫請閉眼😌\n點擊畫面下一步"
      order++
      return
    }

    // *有解藥、無解藥，有毒藥
    // 打開選擇
    gammingChoose.classList.remove("none")
    // 有解藥
    if (functionState.witch.antidote === true) {
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

      // 死亡紀錄
      killed.forEach(item => deadOne(item))

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

// *click 成員號碼、選擇 - 在建立完 numbers 呼叫
const numbersChoosesClick = () => {
  // *click number
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

        // !狼刀到最後一民 or 最後一神 && 女巫沒解藥時，直接進遊戲結束
        if (functionState.witch.antidote === false) {
          if ((characterList[killed[0]].team === "mans" && score.mans === 1) || (characterList[killed[0]].team === "gods" && score.gods === 1)) {
            // 死亡紀錄
            deadOne(killed[0])
            console.log("記分欄：", score)

            // 遊戲提前結束
            gameOver()
            alert(`天亮了，狼人殺了 ${characterList[killed[0]].id} 號🩸\n女巫已無解藥，狼人獲勝！`)
          }
        }
        return
      }

      // *巫毒
      if (modelPlaying.processNight[order] === "巫") {
        killed[1] = idx
        functionState.witch.poisonTarget = killed[1]
        alert(`女巫請閉眼😌\n(女巫毒了 ${characterList[killed[1]].id} 號💀)`)
        order++
        return
      }

      // *獵人 or 狼王 夜晚被刀帶人
      if (functionState.nightKillOrder >= 0) {
        if (characterList[killed[functionState.nightKillOrder]].character === "獵人" || characterList[killed[functionState.nightKillOrder]].character === "狼王") {
          console.log(`${characterList[killed[functionState.nightKillOrder]].character} 帶走對象 idx`, idx, characterList[idx])
          alert(`${characterList[killed[functionState.nightKillOrder]].id} 號帶走了 ${characterList[idx].id} 號🩸`)
          // 死亡紀錄
          deadOne(idx)
          console.log("記分欄：", score)

          // *functionState.nightKillOrder 的變化 -> 被殺為 2 人且 nightKillOrder === 0 (繼續判斷下一人) / 其他 (結束 nightKillOrder)
          if (killed.length === 2 && functionState.nightKillOrder === 0) {
            functionState.nightKillOrder++
          } else {
            functionState.nightKillOrder = -1
          }

          // *如果帶到獵人 or 狼王 -> 繼續帶人(遊戲未結束的話) test
          if (characterList[idx].character === "獵人" || characterList[idx].character === "狼王") {
            // 是否遊戲結束
            if (isGameOver === true) {
              gameOver()
              return
            }
            // 導到啟動技能
            speakOrder[0] = idx
            // 結束 nightKillOrder
            functionState.nightKillOrder = -1

            // 關閉 numbers、打開 chooses
            gammingNumber.classList.add("none")
            gammingChoose.classList.remove("none")

            // 文字
            textTop.innerText = `${characterList[idx].id} 號啟動角色技能`
            gammingTips.innerText = `(${characterList[idx].character}) 請選擇你要帶走的對象🩸`
            chooses[0].innerText = "帶人"
            chooses[1].innerText = "不帶"
            return
          }

          // *導回天亮
          morning()
          return
        }
      }

      // !白天
      // *投票
      if (textTop.innerText === "進行投票") {
        console.log(`${characterList[idx].id} 號被投出去了`, characterList[idx])
        // 死亡紀錄
        deadOne(idx)

        // 是否遊戲結束
        if (isGameOver === true) {
          alert(`${characterList[idx].id} 號被投出去了，遊戲結束。`)
          gameOver()
          return
        }

        // 發表遺言
        alert(`${characterList[idx].id} 號被投出去了，請發表遺言。`)

        // 如果投到 獵人 or 狼王
        if (characterList[idx].character === "獵人" || characterList[idx].character === "狼王") {
          speakOrder[0] = idx

          // 關閉 進天黑、numbers、打開 chooses
          gammingFunction.classList.add("none")
          gammingNumber.classList.add("none")
          gammingChoose.classList.remove("none")

          // 文字
          textTop.innerText = `${characterList[idx].id} 號啟動角色技能`
          gammingTips.innerText = `(${characterList[idx].character}) 請選擇你要帶走的對象🩸`
          chooses[0].innerText = "帶人"
          chooses[1].innerText = "不帶"
          return
        }

        night()
        return
      }

      // *獵人 or 狼王帶人
      if (characterList[speakOrder[0]].character === "獵人" || characterList[speakOrder[0]].character === "狼王") {
        console.log(`${characterList[speakOrder[0]].character} 帶走對象 idx`, idx, characterList[idx])
        alert(`${characterList[speakOrder[0]].id} 號帶走了 ${characterList[idx].id} 號🩸`)
        // 死亡紀錄
        deadOne(idx)

        // *如果帶到獵人 or 狼王 -> 繼續帶人(遊戲未結束的話) test
        if (characterList[idx].character === "獵人" || characterList[idx].character === "狼王") {
          // 是否遊戲結束
          if (isGameOver === true) {
            gameOver()
            return
          }

          // 導到啟動技能
          speakOrder[0] = idx

          // 關閉 numbers、打開 chooses
          gammingNumber.classList.add("none")
          gammingChoose.classList.remove("none")

          // 文字
          textTop.innerText = `${characterList[idx].id} 號啟動角色技能`
          gammingTips.innerText = `(${characterList[idx].character}) 請選擇你要帶走的對象🩸`
          chooses[0].innerText = "帶人"
          chooses[1].innerText = "不帶"
          return
        }

        // 如果是夜晚被刀的話，要進 正式天亮
        if (functionState.night === true) {
          morning()
          return
        }

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

          // 死亡紀錄
          deadOne(idx)
          // 是否遊戲結束
          if (isGameOver === true) {
            gameOver()
            return
          }

          // 狼王啟動技能
          textTop.innerText = `${characterList[idx].id} 號啟動角色技能`
          gammingTips.innerText = `(${characterList[idx].character}) 請選擇你要帶走的對象🩸`

          // 讓發言順序進到狼王，使下次點擊 numbers 進到狼王的功能裡
          speakOrder[0] = idx

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

  // *click choose
  chooses.forEach(item => {
    item.addEventListener("click", (e) => {
      console.log(item.innerText)
      // *女巫選擇
      if (modelPlaying.processNight[order] === "巫") {
        // *救
        if (item.innerText === "救") {
          // 女巫自己被毒不能自救
          if (characterList[killed[0]].character === "女巫") {
            alert("女巫不能自救🚫\n請點選「不救」")
            return
          }

          // 有毒藥 / 無毒藥
          functionState.witch.poison === true ? alert(`你要使用毒藥嗎？(今晚不能用了)\n女巫請閉眼😌\n(女巫救了 ${characterList[killed[0]].id} 號🔮)`) : alert(`女巫請閉眼😌\n(女巫救了 ${characterList[killed[0]].id} 號🔮)\n(女巫已無毒藥)`)

          // 用掉解藥
          functionState.witch.antidote = false
          killed[0] = -1

          order++
          return
        }
        // *不救
        if (item.innerText === "不救") {
          // 有毒藥
          if (functionState.witch.poison === true) {
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
          functionState.witch.poison = false
          return
        }
        // *不毒
        alert(`女巫請閉眼😌`)
        order++
        return
      }

      // *獵人 or 狼王 (夜晚被刀)
      if (functionState.nightKillOrder >= 0) {
        if (characterList[killed[functionState.nightKillOrder]].character === "獵人" || characterList[killed[functionState.nightKillOrder]].character === "狼王") {
          // 關閉 chooses
          gammingChoose.classList.add("none")
          // 已啟動技能
          characterList[killed[functionState.nightKillOrder]].character === "獵人" ? functionState.hunter.function = false : functionState.wolfKing.function = false

          // *帶人
          if (item.innerText === "帶人") {
            // 打開 numbers
            gammingNumber.classList.remove("none")
            return
          }

          // *不帶
          // functionState.nightKillOrder 的變化 & 導流
          if (killed.length === 2 && functionState.nightKillOrder === 0) {
            functionState.nightKillOrder++
          } else {
            functionState.nightKillOrder = -1
          }

          // *回到 morning
          morning()
          return
        }
      }

      // *獵人 or 狼王 (夜晚、白天 -> "被帶"、"被投")
      if (characterList[speakOrder[0]].character === "獵人" || characterList[speakOrder[0]].character === "狼王") {
        // 關閉 chooses
        gammingChoose.classList.add("none")

        // *帶人
        if (item.innerText === "帶人") {
          // 打開 numbers
          gammingNumber.classList.remove("none")
          return
        }

        // *不帶 - 夜晚被帶 -> 進白天 / 白天被帶 -> 進天黑
        functionState.night === true ? morning() : night()
      }
    }, false)
  })
}

// *遊戲 - 天亮流程
const morning = () => {
  // 狼神人文字紀錄
  scoreRecord.innerText = `${score.wolfs} 狼 ${score.gods} 神 ${score.mans} 民`

  // 是否遊戲結束
  if (isGameOver === true) {
    gameOver()
    return
  }

  // 關閉天黑流程的 app 監聽
  app.removeEventListener("click", nightFlow, false)
  // 關閉 numbers
  gammingNumber.classList.add("none")

  // *獵人 or 狼王死掉 啟動技能
  if (killed.length !== 0 && functionState.nightKillOrder >= 0) {
    // 獵人啟動技能 && 尚未啟動技能 && 不是被女巫毒的
    if (characterList[killed[functionState.nightKillOrder]].character === "獵人" && functionState.hunter.function === true && functionState.witch.poisonTarget !== killed[functionState.nightKillOrder]) {
      console.log(`${characterList[killed[functionState.nightKillOrder]].character} 啟動角色技能`)
      // 文字
      textTop.innerText = `${characterList[killed[functionState.nightKillOrder]].id} 號啟動角色技能`
      gammingTips.innerText = `(${characterList[killed[functionState.nightKillOrder]].character}) 請選擇你要帶走的對象🩸`
      chooses[0].innerText = "帶人"
      chooses[1].innerText = "不帶"
      // 打開選項
      gammingChoose.classList.remove("none")
      return
    }

    // 狼王啟動技能 && 尚未啟動技能 && 不是被女巫毒的
    if (characterList[killed[functionState.nightKillOrder]].character === "狼王" && functionState.wolfKing.function === true && functionState.witch.poisonTarget !== killed[functionState.nightKillOrder]) {
      console.log(`${characterList[killed[functionState.nightKillOrder]].character} 啟動角色技能`)
      // 文字
      textTop.innerText = `${characterList[killed[functionState.nightKillOrder]].id} 號啟動角色技能`
      gammingTips.innerText = `(${characterList[killed[functionState.nightKillOrder]].character}) 請選擇你要帶走的對象🩸`
      chooses[0].innerText = "帶人"
      chooses[1].innerText = "不帶"
      // 打開選項
      gammingChoose.classList.remove("none")
      return
    }

    // !如果有兩死，killed[0] 非獵人/狼王，讓 nightKillOrder ++ 再跑一次 mornig 確保若兩死都跑到
    if (killed.length === 2 && functionState.nightKillOrder === 0) {
      functionState.nightKillOrder++
      morning()
      return
    }
  }

  // 通過啟動技能後，關閉 functionState.nightKillOrder，避免造成 bug
  functionState.nightKillOrder = -1

  // *正式天亮
  functionState.night = false
  console.log("白天：開始發言")
  console.log("身分：", characterList)

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
  // 打開 next btn
  gammingNext.classList.remove("none")

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

  if (characterList[idx].character === "騎士" && functionState.knight.function === true) {
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

// *click next 下一步
const nextClick = () => {
  // *遊戲結束，再來一局
  if (isGameOver === true) {
    console.log("再來一局")
    // location.href.includes("github") ? location.href = "https://ya95123.github.io/autoWolf_v1/" : location.href = "/public"
    return
  }

  // *刪去已發言者
  speakOrder.splice(0, 1)
  console.log("發言順序 idx", speakOrder)

  // *進入投票環節
  if (speakOrder.length === 0) {
    console.log("投票")
    // 關閉 next、打開 numbers
    gammingNext.classList.add("none")
    gammingNumber.classList.remove("none")
    gammingFunction.setAttribute("class", "voteToNight")

    // 文字
    textTop.innerText = "進行投票"
    gammingTips.innerText = "數到 3，請比出要投出去的對象\n若無人出局、連續兩次平票\n請點選「進天黑」"
    gammingFunction.innerText = "進天黑"
    return
  }

  // *換誰發言
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
    // 已使用技能，若活著就不能再用 
    functionState.knight.function = false
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

  // *進天黑(投票環節：無人出局)
  if (gammingFunction.innerText === "進天黑") {
    console.log("進天黑")
    night()
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
  // 狼神人文字紀錄
  scoreRecord.innerText = `${score.wolfs} 狼 ${score.gods} 神 ${score.mans} 民`

  // 女巫、預言家的死亡特別紀錄
  if (characterList[idx].character === "女巫") functionState.witch.alive = false
  if (characterList[idx].character === "預言家") functionState.prophet.alive = false

  // 判斷遊戲是否結束調整 isGameOver true/false
  if (score.wolfs === 0 || score.gods === 0 || score.mans === 0) isGameOver = true
}

// *遊戲結束
const gameOver = () => {
  console.log("身分：", characterList)
  console.log("遊戲結束", score)
  // 背景環境設定
  body.classList.remove("night")
  textTop.classList.remove("text-gold")
  gammingNumber.classList.add("none")
  gammingFunction.classList.add("none")
  gammingNext.classList.remove("none")
  scoreRecord.classList.add("none")

  // 關閉夜晚 app 監聽
  app.removeEventListener("click", nightFlow, false)

  // 文字
  score.wolfs === 0 ? textTop.innerText = "好人獲勝\n🙌" : textTop.innerText = "狼人獲勝\n🐺"
  gammingTips.innerText = `剩下 ${score.wolfs} 狼 ${score.gods} 神 ${score.mans} 民`
  gammingNext.innerText = "再來一局"

  // next 導向連結
  location.href.includes("github") ? gammingNext.setAttribute("href", "https://ya95123.github.io/autoWolf_v1/") : gammingNext.setAttribute("href", "/public")
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
    alert("請先推派一位上帝(主持人)，跟著頁面引導流程，發身分、進行遊戲😊\n💡上帝在帶領時，括弧內的文字請不要唸出來唷！")
    selectModel(idx)
  }, false)
})

// !TESET 1.狼刀獵人/狼王(被女巫救/不救)是否天亮會有反應 OK2.被刀獵/狼王互帶OK 3.被投出去獵狼王互帶(還是要問要不要帶人！)OK 4.騎士技能OK 5.預言家/女巫用技能情形OK 6.流暢度 7.狼刀最後一民神，直接結束OK
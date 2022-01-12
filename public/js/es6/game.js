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
  numbers = document.querySelectorAll(".number")

  // *天黑，關閉 giveCharacter，打開 gamming、格式歸零
  body.classList.add("night")
  giveCharacter.classList.add("none")
  gammingNumber.classList.add("none")
  gammingChoose.classList.add("none")
  textTop.classList.remove("text-gold")
  gamming.classList.remove("none")
  textTop.innerText = "天黑請閉眼"
  gammingTips.innerText = "點擊畫面下一步"
  witchSkills.start = false
  morningCilck = false

  // TODO　click app - 判定流程階段
  app.addEventListener("click", nightFlow, false)
  // app.addEventListener("click", (e) => {
  //   e.preventDefault()
  //   console.log(modelPlaying.processNight[order])

  //   if (modelPlaying.processNight[order] === "天黑") {
  //     order++
  //     return
  //   }

  //   if (modelPlaying.processNight[order] === "預") {
  //     textTop.innerText = "預言家請睜眼"
  //     gammingTips.innerText = "請選擇你要查驗的對象"
  //     textTop.classList.add("text-gold")
  //     gammingNumber.classList.remove("none")
  //     return
  //   }

  //   if (modelPlaying.processNight[order] === "狼") {
  //     textTop.innerText = "狼人請睜眼"
  //     gammingTips.innerText = "請確認彼此身分，比出要殺的對象"
  //     return
  //   }

  //   if (modelPlaying.processNight[order] === "巫") {
  //     console.log(witchSkills)
  //     // *功能已展開時，就不再往下跑了，避免跟後續動作衝突(Dom)
  //     if (witchSkills.start) return
  //     witchSkills.start = true

  //     // 關閉成員
  //     gammingNumber.classList.add("none")
  //     textTop.innerText = "女巫請睜眼"

  //     // *無解藥，無毒藥
  //     if (witchSkills.antidote === false && witchSkills.posion === false) {
  //       gammingTips.innerText = "你已使用完兩瓶藥\n女巫請閉眼😌"
  //       return
  //     }

  //     // *有解藥、無解藥，有毒藥
  //     // 打開選擇
  //     gammingChoose.classList.remove("none")
  //     // 有解藥
  //     if (witchSkills.antidote === true) {
  //       gammingTips.innerText = `${killed[0]} 號被殺了，請問你要救他嗎？`
  //       chooses[0].innerText = "救"
  //       chooses[1].innerText = "不救"
  //       return
  //     }
  //     // 無解藥，有毒藥
  //     gammingTips.innerText = "請問你要使用毒藥嗎？"
  //     chooses[0].innerText = "毒"
  //     chooses[1].innerText = "不毒"
  //     return
  //   }

  //   // TODO 天亮要關掉這些 window click 事件、dead 掉已死對象
  //   if (modelPlaying.processNight[order] === "天亮") {
  //     console.log(killed)
  //     body.classList.remove("night")
  //     textTop.classList.remove("text-gold")
  //     gammingNumber.classList.add("none")
  //     gammingChoose.classList.add("none")
  //     // TODO 關閉所有天黑監聽
  //     // app.removeEventListener("click")
  //     // 預備進下一個階段
  //     order++

  //     // *死、平安夜 (0死、1死、2死、同刀同毒)
  //     // 同刀同毒
  //     if (killed[0] === killed[1]) {
  //       killed = [killed[0]]
  //     } else {
  //       // 排序號碼
  //       killed.sort()
  //     }
  //     // 刪除為 0 的
  //     killed = killed.filter(num => { return num > 0 })
  //     console.log(killed)

  //     // *有人死亡
  //     if (killed.length !== 0) {
  //       textTop.innerText = `天亮了，今晚 ${killed} 號被殺了🩸`
  //       gammingTips.innerText = "點擊畫面下一步"

  //       // 死掉的人不能再被點擊、紀錄狼、神、人 存活人數
  //       killed.forEach((item, idx) => {
  //         numbers[item - 1].classList.add("dead")
  //         console.log(item)
  //         characterList[item - 1].team === "wolfs" ? modelPlaying.wolfsNum-- : characterList[item - 1].team === "gods" ? modelPlaying.godsNum-- : modelPlaying.mansNum--
  //       })
  //       console.log(`狼：${modelPlaying.wolfsNum}, 神：${modelPlaying.godsNum}, 民：${modelPlaying.mansNum}`)
  //       return
  //     }
  //     // *平安夜 -> 空陣列
  //     textTop.innerText = "天亮了，\n今晚是平安夜🌙"
  //     gammingTips.innerText = "點擊畫面下一步"
  //     return
  //   }

  //   // *天亮發言開始
  //   morning()
  // }, false)

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
        killed[0] = idx + 1
        alert(`狼人請閉眼😌\n(狼人殺了 ${killed[0]} 號🩸)`)
        order++
        return
      }

      // *巫毒
      if (modelPlaying.processNight[order] === "巫") {
        killed[1] = idx + 1
        alert(`女巫請閉眼😌\n(女巫毒了 ${killed[1]} 號💀)`)
        order++
        return
      }
    }, false)
  })

  // TODO click choose
  chooses.forEach(item => {
    item.addEventListener("click", (e) => {
      // TODO 女巫選擇
      if (modelPlaying.processNight[order] === "巫") {
        console.log(item.innerText)
        // *救
        if (item.innerText === "救") {
          // 有毒藥
          if (witchSkills.posion === true) {
            alert(`你要使用毒藥嗎？(今晚不能用了)\n女巫請閉眼😌\n(女巫救了 ${killed[0]} 號🔮)`)
            witchSkills.antidote = false
            killed[0] = 0
          } else {
            // 無毒藥
            alert(`女巫請閉眼😌\n(女巫救了 ${killed[0]} 號🔮)\n(女巫已無毒藥)`)
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

// TODO 夜晚流程
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
    // *功能已展開時，就不再往下跑了，避免跟後續動作衝突(Dom)
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
      gammingTips.innerText = `${killed[0]} 號被殺了，請問你要救他嗎？`
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

  // TODO 天亮要關掉這些 window click 事件、dead 掉已死對象
  if (modelPlaying.processNight[order] === "天亮") {
    console.log(killed)
    body.classList.remove("night")
    textTop.classList.remove("text-gold")
    gammingNumber.classList.add("none")
    gammingChoose.classList.add("none")
    // TODO 關閉所有天黑監聽
    // app.removeEventListener("click")
    // 預備進下一個階段
    order++

    // *死、平安夜 (0死、1死、2死、同刀同毒)
    // 同刀同毒
    if (killed[0] === killed[1]) {
      killed = [killed[0]]
    } else {
      // 排序號碼
      killed.sort()
    }
    // 刪除為 0 的
    killed = killed.filter(num => { return num > 0 })
    console.log(killed)

    // *有人死亡
    if (killed.length !== 0) {
      textTop.innerText = `天亮了，今晚 ${killed} 號被殺了🩸`
      gammingTips.innerText = "點擊畫面下一步"

      // 死掉的人不能再被點擊、紀錄狼、神、人 存活人數
      killed.forEach((item, idx) => {
        numbers[item - 1].classList.add("dead")
        console.log(item)
        characterList[item - 1].team === "wolfs" ? modelPlaying.wolfsNum-- : characterList[item - 1].team === "gods" ? modelPlaying.godsNum-- : modelPlaying.mansNum--
      })
      console.log(`狼：${modelPlaying.wolfsNum}, 神：${modelPlaying.godsNum}, 民：${modelPlaying.mansNum}`)
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

// TODO 遊戲 - 天亮流程
const morning = () => {
  console.log("天亮測試")
  app.removeEventListener("click", nightFlow, false)
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

// TODO 1.天亮動作並檢查是否需要跟天黑合併，調整 js function 分類 play / night / morning 2.發言順序 & 發言計時 & 下一位 3.投票環節 & 是否有遺言 & 死前是否有技能 4.不斷計分，有隊伍歸零，遊戲結束 5.結束畫面


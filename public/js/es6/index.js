const illustrateBtn = document.getElementById("illustrate-btn")
const illustrate = document.getElementById("illustrate")
const dailogClose = document.querySelector(".dailog-close")

// *btn 遊戲說明 - click 後打開說明事項
illustrateBtn.addEventListener("click", () => {
  illustrate.classList.remove("none")
  illustrate.classList.remove("no-show")
}, false)

dailogClose.addEventListener("click", () => {
  illustrate.classList.add("no-show")
  setTimeout(() => {
    illustrate.classList.add("none")
  }, 150)
})
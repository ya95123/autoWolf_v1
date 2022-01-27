"use strict";

var illustrateBtn = document.getElementById("illustrate-btn");
var illustrate = document.getElementById("illustrate");
var dailogClose = document.querySelector(".dailog-close");

// *btn 遊戲說明 - click 後打開說明事項
illustrateBtn.addEventListener("click", function () {
  illustrate.classList.remove("none");
  illustrate.classList.remove("no-show");
}, false);

dailogClose.addEventListener("click", function () {
  illustrate.classList.add("no-show");
  setTimeout(function () {
    illustrate.classList.add("none");
  }, 150);
});
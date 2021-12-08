const { src, dest, series } = require("gulp")
const rename = require("gulp-rename")
const replace = require("gulp-replace")
const htmlmin = require("gulp-htmlmin")
const jsmin = require("gulp-jsmin")
const imagemin = require("gulp-imagemin")
const clean = require("gulp-clean")
const babel = require("gulp-babel")

// scss to css 交給 VS code 應用程式 watch OK
// *搬運 html 原檔至 dist 資料夾裡，並都連結 .min 檔
const hmove = () => {
  return src("./public/**/*.html")
    // .css -> .min.css
    .pipe(replace(".css", ".min.css"))
    .pipe(replace(".min.min.css", ".min.css"))
    .pipe(replace("fontello.min.css", "fontello.css"))
    // .js -> es6 拿掉、.min.js
    .pipe(replace("/es6", ""))
    .pipe(replace(".js", ".min.js"))
    .pipe(replace(".min.min.js", ".min.js"))
    // GA js -> 更動到的部份調整回來 
    .pipe(replace("analytics.min.js", "analytics.js"))
    .pipe(replace("fbevents.min.js", "fbevents.js"))
    .pipe(replace("sdk.min.js", "sdk.js"))
    .pipe(replace("gtm.min.js", "gtm.js"))
    .pipe(replace("beacon.min.js", "beacon.js"))
    // script src -> 更動到的部份調整回來 
    .pipe(replace("cdn.min.js", "cdn.js"))
    .pipe(replace("forEach.min.js", "forEach.js"))
    .pipe(replace("api.min.js", "api.js"))
    // href -> 更動到的部份調整回來 
    .pipe(replace("login.min.jsp", "login.jsp"))
    .pipe(dest("./dist"))
}

// *搬運 css 原檔至 dist 資料夾裡
const cssmove = () => {
  return src("./public/css/**/*")
    .pipe(dest("./dist/css"))
}

// *搬運 .min.js 至 dist 資料夾裡
const jsminmove = () => {
  return src("./public/js/**/*.min.js")
    .pipe(dest("./dist/js"))
}

// ---搬運 js/es6 至 dist 資料夾裡
const jsEs6move = () => {
  return src("./public/js/es6/**/*.js")
    .pipe(dest("./dist/js/es6"))
}

// *搬運 img 至 dist 資料夾裡
const imgmove = () => {
  return src("./public/img/**/*")
    .pipe(dest("./dist/img"))
}

// *搬運 img 原圖至 public/otherfiles 資料夾裡
const imgorgmove = () => {
  return src("./public/img/original/**/*")
    .pipe(dest("./public/otherfiles/original_img"))
}

// *搬運 video 至 dist 資料夾裡
const videomove = () => {
  return src("./public/video/**/*")
    .pipe(dest("./dist/video"))
}

// *轉譯 js ES6 to ES5 語法
const jsbabel = () => {
  return src(["./public/js/es6/**/*.js"])
    .pipe(babel())
    .pipe(dest('./public/js'))
}

// *壓縮 js 原檔並將原檔及壓縮檔搬至 dist 資料夾裡
const jsminify = () => {
  // skip es6 內的檔案
  return src(["./public/js/*.js", "!./public/js/*.min.js"])
    .pipe(dest("./dist/js"))
    .pipe(jsmin())
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest("./dist/js"))
}

// *壓縮 img 在原 public 裡
const imgminify = () => {
  return src("./public/img/original/**/*")
    .pipe(imagemin())
    .pipe(dest("./public/img"))
}

// *刪除 public/img/original 裡的所有 img
const imgorgdelet = () => {
  return src("./public/img/original/**/*", { read: false })
    .pipe(clean())
}

// ---搬運 html 原檔 & 壓縮檔至 dist 資料夾裡
const hminify = () => {
  return src("./public/**/*.html")
    .pipe(dest("./dist"))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(rename({ suffix: ".min" }))
    .pipe(dest("./dist"))
}

exports.hmove = hmove
exports.cssmove = cssmove
exports.jsminmove = jsminmove
exports.jsEs6move = jsEs6move
exports.imgmove = imgmove
exports.imgorgmove = imgorgmove
exports.videomove = videomove

exports.jsminify = jsminify
exports.hminify = hminify
exports.imgminify = imgminify

exports.jsbabel = jsbabel
exports.imgorgdelte = imgorgdelet

// *sereis 1：js ES6to5、js壓縮與搬運、css搬運、html搬運、img搬運 至 dist -> 使用時機，確檔&上傳時 做檔案壓縮與搬運
exports.default = series(jsbabel, jsminmove, jsminify, cssmove, hmove, imgmove, videomove)
// *sereis 2：img壓縮與搬運 至 public，並刪除在 original 裡的 img -> 有新增圖片時
exports.img = series(imgminify, imgorgmove, imgorgdelet)
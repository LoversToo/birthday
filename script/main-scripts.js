const layout = document.getElementById("layout");

function updateScale() {
    const baseWidth = 360;
    const baseHeight = 760;

    const scaleX = window.innerWidth / baseWidth;
    const scaleY = window.innerHeight / baseHeight;
    const scale = Math.min(scaleX, scaleY); // Keep aspect ratio

    layout.style.setProperty("--scale", scale);
    layout.classList.add("scaled");
}

let lastTime = performance.now();
let totalTime = 0;

function updateClock(currentTime) {
    const delta = currentTime - lastTime;
    lastTime = currentTime
  totalTime += delta;

  const date = new Date();
  const formatted = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  document.getElementById("time").innerHTML = formatted;
  requestAnimationFrame(updateClock);
}

function toggleFullScreen() {
  const layout = document.getElementById("layout");

  if (
    document.fullscreenElement || 
    document.webkitFullscreenElement || 
    document.msFullscreenElement
  ) {
    document.getElementById("fullScreenText").innerHTML = "Fullscreen"
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  } else {
    document.getElementById("fullScreenText").innerHTML = "Un-fullscreen"
    if (layout.requestFullscreen) {
      layout.requestFullscreen();
    } else if (layout.webkitRequestFullscreen) {
      layout.webkitRequestFullscreen();
    } else if (layout.msRequestFullscreen) {
      layout.msRequestFullscreen();
    }
  }
}

window.addEventListener("resize", updateScale);
window.addEventListener("DOMContentLoaded", updateScale);
requestAnimationFrame(updateClock);

function goHome() {
  const main = document.querySelector("main");
  const bgDiv = document.getElementById("background-image");
  const homeTemplate = document.getElementById("home");
  main.innerHTML = '';
  main.appendChild(homeTemplate.content.cloneNode(true));
  switchBackground("url(img/wallpaper.jpg)");
}

function loadPage(el) {
  const pageName = el.dataset.page;
  const bg = el.dataset.bg;
  const bgDiv = document.getElementById("background-image")
  const main = document.querySelector("main");
  const template = document.getElementById("page-" + pageName);
  main.classList.add('fade-out');
  setTimeout(() => {
    if (template) {
        switchBackground(bg);
      main.innerHTML = '';
      let clone = template.content.cloneNode(true);
      clone.id = "page-" + pageName + "-clone";
      main.appendChild(clone);
      if (pageName == "gallery") {
        checkGalleryFlag()
      }
    } else {
      main.innerHTML = `<p style="color: white; text-align: center;">🚧 Page not found</p>`;
    }
    main.classList.remove('fade-out');
  }, 300);
}


let currentBg = 'bg1';
function switchBackground(newUrl) {
  const bg1 = document.getElementById("bg1");
  const bg2 = document.getElementById("bg2");

  const current = currentBg === 'bg1' ? bg1 : bg2;
  const next = currentBg === 'bg1' ? bg2 : bg1;

  next.style.backgroundImage = newUrl;

  next.classList.add("visible");
  current.classList.remove("visible");

  currentBg = currentBg === 'bg1' ? 'bg2' : 'bg1';
}


goHome()

let lastThumbnailRect = null;
let lastThumbnailElement = null;

function openPreview(imgElement) {
  const layout = document.getElementById("layout");
  const layoutRect = layout.getBoundingClientRect();
  const galleryFull = document.getElementById("gallery-full")
  const imgRect    = imgElement.getBoundingClientRect();
  const galleryBack = document.getElementById("galleryBack")
  const galleryText = document.getElementById("galleryText")
  const icons = document.getElementsByClassName("gallery-icon");
  const hidden_icons = Array.from(document.querySelectorAll(".gallery-icon.hidden"));
    
  lastThumbnailRect = imgRect;
  lastThumbnailElement = imgElement;
    
  let subtract = 0;
    
  for (let i = 0; i < icons.length; i++) {
    if (hidden_icons.includes(icons[i])) {
      subtract += 1;
    }
    if (icons[i] === imgElement) {
      galleryText.innerHTML = `${i + 1 - subtract}/${icons.length - hidden_icons.length}`;
    break;
    }
  }

  galleryBack.onclick = closePreview
  const clone = imgElement.cloneNode();
  clone.classList.add("clone-preview");

  // Position relative to #layout
  Object.assign(clone.style, {
    position: "absolute",
    zIndex:   "1",
    top:    `${imgRect.top - layoutRect.top}px`,
    left:   `${imgRect.left - layoutRect.left}px`,
    width:  `${imgRect.width}px`,
    height: `${imgRect.height}px`
  });

  galleryFull.appendChild(clone);

  // Animate to fill the layout
  requestAnimationFrame(() => {
    Object.assign(clone.style, {
      top:    "0px",
      left:   "0px",
      width:  `100%`,
      height: `100%`,
      borderRadius: "0px"
    });
  });
}

function closePreview() {
  const layout = document.getElementById("layout");
  const layoutRect = layout.getBoundingClientRect();
  const galleryText = document.getElementById("galleryText")
  const galleryBack = document.getElementById("galleryBack")
  galleryText.innerHTML = "All Photos"
  galleryBack.onclick = goHome
  const clone = document.getElementsByClassName("clone-preview")[0]
  if (lastThumbnailElement == document.getElementById("birthday-candle")) {
    clone.src = "img/gallery/blown-candle.png";
    lastThumbnailElement.src = "img/gallery/blown-candle.png";
    updateCheckFlag()
  }
  Object.assign(clone.style, {
    top:    "40px",
      left:   "-24px",
      width:  `${layoutRect.width + 80}px`,
      height: `${layoutRect.height + 20}px`,
      borderRadius: "0px"
  });
  layout.appendChild(clone);
  requestAnimationFrame(() => {
    Object.assign(clone.style, {
      top:    `${lastThumbnailRect.top  - layoutRect.top}px`,
      left:   `${lastThumbnailRect.left - layoutRect.left}px`,
      width:  `${lastThumbnailRect.width}px`,
      height: `${lastThumbnailRect.height}px`,
      borderRadius: "0px"
    });
  });
  clone.addEventListener("transitionend", () => {
    clone.remove();
    lastThumbnailRect = null;
    lastThumbnailElement = null;
  }, { once: true });
}

function insertChar(char) {
  const search = document.getElementById("browser-search");
  search.textContent += char;
}

function backspace() {
  const search = document.getElementById("browser-search");
  search.textContent = search.textContent.slice(0, -1);
}

function submitSearch() {
  const errorDiv   = document.getElementById("browser-main-error");
  const youtubeDiv = document.getElementById("browser-main-youtube");
  const loadingDiv = document.getElementById("browser-loading");
  const searchBar  = document.getElementById("browser-search");

  errorDiv.style.display = "none";
  youtubeDiv.style.display = "none";

  loadingDiv.style.display = "block";

  const query = searchBar.innerText.trim();

  setTimeout(() => {
    loadingDiv.style.display = "none";
    if (query === "youtube.com" || query === "www.youtube.com") {
      youtubeDiv.style.display = "block";
      searchBar.innerHTML = "https://www.youtube.com/watch?v=SkJcmCaHqS0"
    } else {
      errorDiv.style.display = "block";
    }
  }, 1000);
}


function scrollSearch(amount) {
  const searchBar = document.getElementById("browser-search");
  searchBar.scrollLeft += amount;
}

let lastCellDiv = null
let lastCellIndex = null
let lastCellCode = null
function focusCell(cellDiv) {
  if (cellDiv.style.backgroundColor == "rgb(255, 255, 255)" || cellDiv.style.backgroundColor == "" || cellDiv.style.backgroundColor == "rgb(229, 229, 229)") {
    cellDiv.style.backgroundColor = "#E5E5E5";
  } else {
    cellDiv.style.backgroundColor = "#bd6363";
  }
  if (lastCellDiv != null && lastCellDiv != cellDiv) {
    if (lastCellDiv.style.backgroundColor == "rgb(229, 229, 229)" || lastCellDiv.style.backgroundColor == "rgb(255, 255, 255)") {
      lastCellDiv.style.backgroundColor = "#FFF";
    } else {
      lastCellDiv.style.backgroundColor = "#ff9595";
    }
  }
  lastCellDiv = cellDiv
  const cellList = document.getElementsByClassName("cryptogram-cells")
  const codeList = document.getElementsByClassName("cryptogram-codes")
  for (let i = 0; i < cellList.length; i++) {
    if (cellList[i] == cellDiv) {
      lastCellIndex = i
      lastCellCode = codeList[i].childNodes[1].innerHTML
    }
  }
}

function deleteLetter() {
  const cellList = document.getElementsByClassName("cryptogram-cells")
  const codeList = document.getElementsByClassName("cryptogram-codes")
  letter = lastCellDiv.childNodes[1].innerHTML;
  for (let i = 0; i < cellList.length; i++) {
    if (codeList[i].childNodes[1].innerHTML == lastCellCode) {
      cellList[i].style.backgroundColor = "#FFF"
      cellList[i].childNodes[1].innerHTML = "";
    }
  }
  removeReds(letter)
  lastCellDiv.style.backgroundColor = "#E5E5E5"
}

function nextCell() {
  const cellList = document.getElementsByClassName("cryptogram-cells")
  if (lastCellIndex == null) {
    focusCell(cellList[0])
    return
  }
  if (lastCellIndex + 1 >= cellList.length) {
    focusCell(cellList[0])
    return
  } else {
    focusCell(cellList[lastCellIndex + 1])
    return
  }
}

function previousCell() {
  const cellList = document.getElementsByClassName("cryptogram-cells")
  if (lastCellIndex == null) {
    focusCell(cellList[cellList.length - 1])
    return
  }
  if (lastCellIndex - 1 < 0) {
    focusCell(cellList[cellList.length - 1])
    return
  } else {
    focusCell(cellList[lastCellIndex - 1])
    return
  }
}

function removeReds(letter) {
  const cellList = document.getElementsByClassName("cryptogram-cells");
  const codeList = document.getElementsByClassName("cryptogram-codes");
  let hasOne = false;
  let hasMoreThanOne = false;
  let red = null;
  let code = null
  for (let i = 0; i < cellList.length; i++) {
    if (cellList[i].style.backgroundColor == "rgb(255, 149, 149)" && cellList[i].childNodes[1].innerHTML == letter) {
      if (!hasOne) {
        red = cellList[i];
        code = codeList[i].childNodes[1].innerHTML;
        hasOne = true
      }
      if (hasOne) {
        if (codeList[i].childNodes[1].innerHTML != code) {
          hasMoreThanOne = true
        }
      }
    }
  }
  if (!hasMoreThanOne) {
    for (let i = 0; i < cellList.length; i++) {
      if (cellList[i].style.backgroundColor == "rgb(255, 149, 149)" && cellList[i].childNodes[1].innerHTML == letter) {
        cellList[i].style.backgroundColor = "#FFF";
      }
    }
  }
}

function inputLetter(letter) {
  const cellList = document.getElementsByClassName("cryptogram-cells");
  const codeList = document.getElementsByClassName("cryptogram-codes");
  const pastLetter = lastCellDiv.childNodes[1].innerHTML
  if (lastCellDiv != null) {
    let isExisting = false
    for (let i = 0; i < cellList.length; i++) {
      if (codeList[i].childNodes[1].innerHTML != lastCellCode && cellList[i].childNodes[1].innerHTML == letter) {
        isExisting = true;
      }
    }
    for (let i = 0; i < cellList.length; i++) {
      if (codeList[i].childNodes[1].innerHTML == lastCellCode) {
        cellList[i].childNodes[1].innerHTML = letter;
        if (isExisting) {
          if (i == lastCellIndex) {
            cellList[i].style.backgroundColor = "#bd6363";
          } else {
            cellList[i].style.backgroundColor = "#ff9595";
          }
        } else {
          if (i == lastCellIndex) {
            cellList[i].style.backgroundColor = "#E5E5E5";
          } else {
            cellList[i].style.backgroundColor = "#fff";
          }
        }
      }
    }
    removeReds(pastLetter)
    for (let i = lastCellIndex; i < cellList.length; i++) {
      if (cellList[i].childNodes[1].innerHTML == "" || (cellList[i].style.backgroundColor == "rgb(255, 149, 149)" && codeList[i].childNodes[1].innerHTML != lastCellCode)) {
        focusCell(cellList[i]);
        return;
      }
    }
    for (let i = 0; i < lastCellIndex; i++) {
      if (cellList[i].childNodes[1].innerHTML == "" || (cellList[i].style.backgroundColor == "rgb(255, 149, 149)" && codeList[i].childNodes[1].innerHTML != lastCellCode)) {
        focusCell(cellList[i]);
        return;
      }
    }
    if (lastCellDiv.style.backgroundColor == "rgb(255, 255, 255)" || lastCellDiv.style.backgroundColor == "" || lastCellDiv.style.backgroundColor == "rgb(229, 229, 229)") {
      lastCellDiv.style.backgroundColor = "#FFF";
      let output = "";
      for (let i = 0; i < cellList.length; i++) {
        output += cellList[i].childNodes[1].innerHTML;
      }
      if (output.trim() == "FOLLOWTHEORDERSOFTHERAINBOWANDWHATYOUSEESHALLBEAGALLERYAGALLERYOFNUMBERSWILLLENDYOUATAPEOFLETTERSANDLETTERSWILLBEYOURKEYFINDTHECODEWITHINTHELOADSBELOWANDNOTEVIGENEREWILLCOMECIPHERSREADY") {
        document.getElementById("cryptogram-keyboard-class").style.display = "none";
        document.getElementById("more-levels").style.display = "block";
        document.getElementById("black-bar").style.display = "block";
        const template = document.getElementById("page-cryptogram");
        while (template.content.firstChild) {
          template.content.removeChild(template.content.firstChild);
        }
        template.content.appendChild(document.getElementById("cryptogram-full"))
        const main = document.querySelector("main");
        main.innerHTML = "";
        main.appendChild(template.content.cloneNode(true));
        return
      }
    } else {
      lastCellDiv.style.backgroundColor = "#ff9595";
    }
    lastCellDiv = null;
    lastCellIndex = null;
    return;
  }
}

function showHiddenFiles() {
  const birthday = document.getElementById("birthday-folder");
  const radio = document.getElementById("radio-indicator");
  radio.classList.toggle("checked");
  birthday.classList.toggle("view-hidden");
}


document.addEventListener("click", function (event) {
  if (!document.getElementById("radio-indicator").contains(event.target) && !document.getElementById("hidden-files-text").contains(event.target)) {
    const radio = document.getElementById("view-hidden-files");
    if (document.getElementById("files-dots").contains(event.target)) {
      radio.classList.toggle("view-hidden")
    } else {
      if (radio.classList.contains("view-hidden")) {
        if (!document.getElementById("files-video").classList.contains("hidden") && !document.getElementById("files-video-video").contains(event.target) && (document.getElementById("files-video").contains(event.target) || document.getElementById("files-heading").contains(event.target))) {
          document.getElementById("files-video").classList.add("hidden")
          document.getElementById("files-current").innerHTML = "Internal Storage/Videos/Hannah/Alphabets"
          document.getElementById("files-video-video").pause();
          document.getElementById("files-video-video").currentTime = 0;
        } else if (!document.getElementById("files-password").classList.contains("hidden") && !document.getElementById("files-password-main").contains(event.target) && (document.getElementById("files-password").contains(event.target) || document.getElementById("files-heading").contains(event.target))) {
          document.getElementById("files-password").classList.add("hidden")
          document.getElementById("files-keyboard").classList.add("hidden")
          document.getElementById("files-current").innerHTML = "Internal Storage"
          document.getElementById("files-back").style.pointerEvents = "auto";
        }
      }
      radio.classList.add("view-hidden")
    }
  }
});

function trimEndSubstring(str, substr) {
  if (str.endsWith(substr)) {
    return str.slice(0, -substr.length);
  }
  return str;
}

function trimFromLastChar(str, char) {
  const index = str.lastIndexOf(char);
  if (index !== -1) {
    return str.slice(0, index);
  }
  return str;
}

function trimLeftFromLastChar(str, char) {
  const index = str.lastIndexOf(char);
  if (index !== -1) {
    return str.slice(index + 1);
  }
  return str;
}
let isUnlocked = false;
function birthdayFunction(birthday) {
  if (!isUnlocked) {
    showPassword()
  } else {
    openFolder(birthday)
  }
}

function openFolder(thisDiv) {
  const folderName = trimEndSubstring(thisDiv.id, "-folder");
  const folderList = document.getElementsByClassName("file-entry");
  const currentName = document.getElementById("files-current");
  previousFolder = thisDiv.dataset.previous
  for (let i = 0; i < folderList.length; i++) {
    if (folderList[i].classList.contains(folderName)) {
      folderList[i].classList.remove("hidden");
    } else {
      folderList[i].classList.add("hidden");
    }
  }
  if (folderName != "birthday") {
    currentName.innerHTML = currentName.innerHTML + "/" + folderName.charAt(0).toUpperCase() + folderName.slice(1);
  } else {
    currentName.innerHTML = currentName.innerHTML + "/." + folderName;
  }
}

function closeFolder() {
  const currentName = document.getElementById("files-current");
  if (currentName.innerHTML == "Internal Storage") {
    goHome()
    return
  } else if (trimLeftFromLastChar(currentName.innerHTML, '/') == "code.txt") {
    document.getElementById("files-body").classList.remove("hidden")
    document.getElementById("files-txt").classList.add("hidden")
  } else if (trimLeftFromLastChar(currentName.innerHTML, '/') == "birthday_message.txt") {
    document.getElementById("files-body").classList.remove("hidden")
    document.getElementById("files-message").classList.add("hidden")
  }
  currentName.innerHTML = trimFromLastChar(currentName.innerHTML, '/');
  let folderName = "";
  if (currentName.innerHTML.endsWith(".birthday")) {
    folderName = "birthday";
  } else if (currentName.innerHTML.endsWith("Internal Storage")){
    folderName = "main";
  } else {
    folderName = trimLeftFromLastChar(currentName.innerHTML, '/').toLowerCase();
  }
  const folderList = document.getElementsByClassName("file-entry");
  for (let i = 0; i < folderList.length; i++) {
    if (folderList[i].classList.contains(folderName)) {
      folderList[i].classList.remove("hidden");
    } else {
      folderList[i].classList.add("hidden");
    }
  }
}

function openTxt() {
  const currentName = document.getElementById("files-current");
  currentName.innerHTML = currentName.innerHTML + "/code.txt"
  document.getElementById("files-body").classList.add("hidden")
  document.getElementById("files-txt").classList.remove("hidden")
}

function openMessage() {
  const currentName = document.getElementById("files-current");
  currentName.innerHTML = currentName.innerHTML + "/birthday_message.txt";
  document.getElementById("files-body").classList.add("hidden");
  document.getElementById("files-message").classList.remove("hidden");
  updateCheckFlag();
}

function showError() {
  const errorBox = document.getElementById("files-error");
  const dcimColumn = document.getElementById("dcim-folder");
  errorBox.style.opacity = "1";
  dcimColumn.classList.add("surge-effect");
  setTimeout(() => {
    dcimColumn.classList.remove("surge-effect");
  }, 500);
  setTimeout(() => {
    errorBox.style.opacity = "0";
  }, 1000);
}

function showVideo(thisDiv) {
  const videoFile = thisDiv.dataset.video;
  const videoSrc = document.getElementById("video-src");
  const videoDiv = document.getElementById("files-video");
  const video = document.getElementById("files-video-video");
  const currentName = document.getElementById("files-current");
  currentName.innerHTML = currentName.innerHTML + "/" + videoFile + ".mp4";
  videoSrc.src = "vid/folders/" + videoFile + ".mp4";
  video.load()
  videoDiv.classList.remove("hidden");
}

function showPassword() {
  const passwordDiv = document.getElementById("files-password")
  const keyboardDiv = document.getElementById("files-keyboard")
  const bdayDiv = document.getElementById("birthday-folder")
  document.getElementById("files-back").style.pointerEvents = "none";
  passwordDiv.classList.remove("hidden")
  keyboardDiv.classList.remove("hidden")
  bdayDiv.classList.add("surge-effect");
  setTimeout(() => {
    bdayDiv.classList.remove("surge-effect");
  }, 500);
}

function inputPassword(letter) {
  const password = document.getElementById("files-password-field-text");
  if (password.innerHTML == "Enter password:") {
    password.innerHTML = "";
  }
  password.style.color = "white";
  if (password.innerHTML.length < 25) {
    password.innerHTML = password.innerHTML + letter;
  }
}

function deletePassword() {
  const password = document.getElementById("files-password-field-text");
  password.style.color = "white";
  if (password.innerHTML == "Enter password:") {
    password.innerHTML = "";
  }
  password.innerHTML = password.innerHTML.slice(0, password.innerHTML.length - 1)
}

function checkPassword() {
  const password = document.getElementById("files-password-field-text");
  const passwordDiv = document.getElementById("files-password");
  const back = document.getElementById("files-back")
  const keyboardDiv = document.getElementById("files-keyboard");
  const birthdayIcon = document.getElementById("birthday-icon");
  const birthday = document.getElementById("birthday-folder");
  if (password.innerHTML == "threefourtwosixbaby") {
    birthdayIcon.src = "img/folder.png";
    passwordDiv.classList.add("hidden");
    keyboardDiv.classList.add("hidden");
    back.style.pointerEvents = "auto";
    const template = document.getElementById("page-files");
    while (template.content.firstChild) {
      template.content.removeChild(template.content.firstChild);
    }
    isUnlocked = true;
    template.content.appendChild(document.getElementById("files-full"))
    const main = document.querySelector("main");
    main.innerHTML = "";
    main.appendChild(template.content.cloneNode(true));
  } else {
    password.style.color = "red";
  }
}

let checkFlag = 0;

function checkGalleryFlag() {
  if (checkFlag >= 1) {
    document.getElementById("screenshot").classList.remove("hidden");
  }
  if (checkFlag == 2) {
    document.getElementById("birthday-candle").classList.remove("hidden");
  }
  if (checkFlag >= 3) {
    document.getElementById("blown-birthday-candle").classList.remove("hidden");
  }
}

function updateCheckFlag() {
  if (checkFlag == 0) {
    checkFlag = 1;
  } else if (checkFlag == 1) {
    checkFlag = 2;
  } else if (checkFlag == 2) {
    checkFlag = 3;
  }
}

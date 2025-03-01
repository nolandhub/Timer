const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const progressCircle = document.querySelector(".progress-ring__circle");
const startPauseBtn = document.getElementById("startPause");
const resetBtn = document.getElementById("reset");

const startSound = new Audio("sound/countDown5s_perRound.mp3");
const dingDongSound = new Audio("sound/big_Ding.mp3");

let totalTime = 20;
let remainingTime = totalTime;
let timerInterval = null;
let isRunning = false;

const quickSetContainer = document.querySelector(".quick-set");

// Hiển thị các nút Quick Set khi nhấn Reset hoặc chỉnh sửa thời gian
function showQuickSetButtons() {
    if (isRunning) return;
    quickSetContainer.style.display = "flex"; // Hiện các nút Quick Set
}

function hideQuickSetButtons() {
    quickSetContainer.style.display = "none";
}

// Ẩn Quick Set khi bắt đầu
window.onload = function () {
    quickSetContainer.style.display = "flex";
};



// các sự kiện để ẩn hoặc hiện quickSetBTN 
resetBtn.addEventListener("click", showQuickSetButtons);
minutesEl.addEventListener("click", showQuickSetButtons);
secondsEl.addEventListener("click", showQuickSetButtons);
startPauseBtn.addEventListener("click", hideQuickSetButtons);

// Cập nhật hiển thị thời gian
function updateDisplay() {
    let minutes = Math.floor(remainingTime / 60);
    let seconds = remainingTime % 60;

    minutesEl.textContent = minutes;
    secondsEl.textContent = seconds.toString().padStart(2, "0");

    if (remainingTime < 60) {
        minutesEl.style.display = "none";
        document.querySelector(".separator").style.display = "none";
        secondsEl.style.fontSize = "12rem";
    } else {
        minutesEl.style.display = "inline";
        document.querySelector(".separator").style.display = "inline";
        secondsEl.style.fontSize = "10rem";
    }

    // Cập nhật vòng tròn tiến trình
    let progress = (remainingTime / totalTime) * 1256;
    progressCircle.style.strokeDashoffset = progress;

    // Đổi màu vòng tròn khi gần hết thời gian
    if (remainingTime <= 5) {
        progressCircle.style.stroke = "#FF0000"; // Màu đỏ khi sắp hết
    } else if (remainingTime <= totalTime / 2) {
        progressCircle.style.stroke = "#FFA500"; // Màu cam khi còn một nửa
    } else {
        progressCircle.style.stroke = "#00FF00"; // Màu xanh khi còn nhiều thời gian
    }
}




// Bắt đầu hoặc tạm dừng đếm ngược
function startPauseTimer() {
    if (isRunning) {
        startSound.pause();
        clearInterval(timerInterval);
        startPauseBtn.textContent = "▶"; // Play icon
    } else {
        timerInterval = setInterval(() => {
            if (remainingTime > 0) {
                remainingTime--;
                updateDisplay();

                if (remainingTime === 12) {
                    dingDongSound.play();
                }

                if (remainingTime <= 5) {
                    startSound.play();
                }

                if (remainingTime <= 0) {
                    startSound.pause();
                }

            } else {
                clearInterval(timerInterval);
                isRunning = false;
                startPauseBtn.textContent = "▶";





            }
        }, 1000);
        startPauseBtn.textContent = "⏸";
    }
    isRunning = !isRunning;
}

// Reset timer
function resetTimer() {

    //stop Sound
    startSound.pause();
    //reset default 0s
    startSound.currentTime = 0;

    clearInterval(timerInterval);
    isRunning = false;
    remainingTime = totalTime;
    updateDisplay();
    startPauseBtn.textContent = "▶";

    document.querySelectorAll(".dot").forEach(dot => {
        dot.classList.remove("active"); // Xóa class active
    });

}

// Xử lý chỉnh sửa số phút/giây bằng chuột
function enableEditing(element, type) {
    element.addEventListener("click", () => {
        if (isRunning) return; // Không cho chỉnh sửa nếu đang chạy

        let input = document.createElement("input");
        input.type = "number";
        input.value = element.textContent;
        input.style.width = "200px";
        input.style.fontSize = "10rem";
        input.style.textAlign = "center";
        input.style.background = "transparent";
        input.style.color = "white";
        input.style.fontWeight = "bold";
        input.style.appearance = "textfield";


        element.replaceWith(input);
        input.focus();

        // Xử lý giới hạn khi nhập
        input.addEventListener("input", () => {
            let value = input.value.replace(/\D/g, ""); // Chỉ giữ lại số

            if (type === "seconds") {
                value = Math.min(59, Math.max(0, parseInt(value) || 0)); // Giới hạn 0-59
            } else {
                value = Math.min(99, Math.max(0, parseInt(value) || 0)); // Giới hạn 0-99
            }
        });

        input.addEventListener("blur", () => saveInput(input, element, type));
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") saveInput(input, element, type);
        });
    });
}




function saveInput(input, element, type) {
    let value = parseInt(input.value, 10);
    if (isNaN(value) || value < 0) value = 0;

    if (type === "seconds") {
        value = Math.min(59, value); // Giới hạn 0-59
        totalTime = Math.floor(totalTime / 60) * 60 + value; // Cập nhật lại giây trong tổng thời gian
    } else if (type === "minutes") {
        value = Math.min(99, value); // Giới hạn 0-99
        totalTime = value * 60 + (totalTime % 60); // Cập nhật lại phút trong tổng thời gian
    }

    remainingTime = totalTime; // Cập nhật lại thời gian còn lại
    element.textContent = value.toString().padStart(2, "0");
    input.replaceWith(element);
    updateDisplay();
}


document.querySelectorAll(".editable-team").forEach(team => {
    team.setAttribute("contenteditable", "true");
    team.style.cursor = "text";


    team.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            this.blur();
        }
    });
});



document.querySelectorAll('.dot').forEach(dot => {
    dot.addEventListener('click', function () {
        this.classList.toggle('active');
    });
});





document.querySelectorAll('.set-time').forEach(button => {
    button.addEventListener('click', function () {
        const time = parseInt(this.getAttribute('data-time')); // Lấy số giây từ data-time
        setTimeDirectly(time);
    });
});

function setTimeDirectly(seconds) {
    totalTime = seconds;  // Cập nhật tổng thời gian
    remainingTime = seconds;  // Cập nhật thời gian còn lại

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = remainingSeconds.toString().padStart(2, '0');

    updateDisplay();
}




document.addEventListener("keydown", function (event) {
    if (event.key.toLowerCase() === "p") { // Kiểm tra nếu bấm "B" hoặc "b"
        let music = document.getElementById("backgroundMusic");

        if (music.paused) {
            music.play();
        } else {
            music.pause();
        }
    }
});


document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        event.preventDefault();
        startPauseTimer();
        quickSetContainer.style.display = "none";
    }
});


document.addEventListener("keydown", function (event) {
    if (event.key.toLowerCase() === "r") { // Kiểm tra nếu bấm "B" hoặc "b"
        event.preventDefault();
        resetTimer();
        quickSetContainer.style.display = "flex";

    }
});


// Kích hoạt chỉnh sửa cho phút và giây

enableEditing(secondsEl, "seconds");
enableEditing(minutesEl, "minutes");



// Gán sự kiện cho nút
startPauseBtn.addEventListener("click", startPauseTimer);
resetBtn.addEventListener("click", resetTimer);




// Khởi tạo hiển thị ban đầu
updateDisplay();

let StickStatus = {
    xPosition: 0,
    yPosition: 0,
    x: 0,
    y: 0,
    cardinalDirection: "C"
};

function JoyStick(container, parameters, callback) {
    parameters = parameters || {};
    var title = parameters.title || "joystick",
        width = parameters.width || 0,
        height = parameters.height || 0,
        internalFillColor = parameters.internalFillColor || "#00AA00",
        internalLineWidth = parameters.internalLineWidth || 2,
        internalStrokeColor = parameters.internalStrokeColor || "#003300",
        externalLineWidth = parameters.externalLineWidth || 2,
        externalStrokeColor = parameters.externalStrokeColor || "#008000",
        autoReturnToCenter = parameters.autoReturnToCenter !== undefined ? parameters.autoReturnToCenter : true,
        boundsType = parameters.boundsType || "square";

    callback = callback || function(StickStatus) {};

    var objContainer = document.getElementById(container);
    objContainer.style.touchAction = "none";

    var canvas = document.createElement("canvas");
    canvas.id = title;
    if (width === 0) { width = objContainer.clientWidth; }
    if (height === 0) { height = objContainer.clientHeight; }
    canvas.width = width;
    canvas.height = height;
    objContainer.appendChild(canvas);
    var context = canvas.getContext("2d");

    var pressed = 0;
    var circumference = 2 * Math.PI;
    var internalRadius = (canvas.width - ((canvas.width / 2) + 10)) / 2;
    var maxMoveStick = internalRadius + 5;
    var externalRadius = internalRadius + 30;
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var movedX = centerX;
    var movedY = centerY;

    if ("ontouchstart" in document.documentElement) {
        canvas.addEventListener("touchstart", onTouchStart, false);
        document.addEventListener("touchmove", onTouchMove, false);
        document.addEventListener("touchend", onTouchEnd, false);
    } else {
        canvas.addEventListener("mousedown", onMouseDown, false);
        document.addEventListener("mousemove", onMouseMove, false);
        document.addEventListener("mouseup", onMouseUp, false);
    }

    document.addEventListener("keydown", onKeyDown, false);

    drawExternal();
    drawInternal();

    function drawExternal() {
        context.beginPath();
        context.arc(centerX, centerY, externalRadius, 0, circumference, false);
        context.lineWidth = externalLineWidth;
        context.strokeStyle = externalStrokeColor;
        context.stroke();
    }

    function drawInternal() {
        context.beginPath();
        context.arc(movedX, movedY, internalRadius, 0, circumference, false);
        context.fillStyle = internalFillColor;
        context.fill();
        context.lineWidth = internalLineWidth;
        context.strokeStyle = internalStrokeColor;
        context.stroke();
    }

    function onMouseDown(event) {
        pressed = 1;
    }

    function onMouseMove(event) {
        if (pressed === 1) {
            movedX = event.pageX - canvas.offsetLeft;
            movedY = event.pageY - canvas.offsetTop;
            applyBounds();
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawExternal();
            drawInternal();
            updateStickStatus();
        }
    }

    function onMouseUp(event) {
        pressed = 0;
        if (autoReturnToCenter) {
            movedX = centerX;
            movedY = centerY;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawExternal();
        drawInternal();
        updateStickStatus();
    }

    function onTouchStart(event) {
        pressed = 1;
    }

    function onTouchMove(event) {
        if (pressed === 1 && event.targetTouches[0].target === canvas) {
            movedX = event.targetTouches[0].pageX - canvas.offsetLeft;
            movedY = event.targetTouches[0].pageY - canvas.offsetTop;
            applyBounds();
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawExternal();
            drawInternal();
            updateStickStatus();
        }
    }

    function onTouchEnd(event) {
        pressed = 0;
        if (autoReturnToCenter) {
            movedX = centerX;
            movedY = centerY;
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawExternal();
        drawInternal();
        updateStickStatus();
    }

    function onKeyDown(event) {
        const stepSize = 25;
        switch (event.key) {
            case "ArrowUp":
                movedY -= stepSize;
                break;
            case "ArrowDown":
                movedY += stepSize;
                break;
            case "ArrowLeft":
                movedX -= stepSize;
                break;
            case "ArrowRight":
                movedX += stepSize;
                break;
            case " ": // acts like a brake :)
                movedX = centerX;
                movedY = centerY;
                break;
            default:
                return;
        }
        applyBounds();
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawExternal();
        drawInternal();
        updateStickStatus();
    }

    function applyBounds() {
        if (boundsType === "square") {
            if (movedX < internalRadius) { movedX = internalRadius; }
            if (movedX > canvas.width - internalRadius) { movedX = canvas.width - internalRadius; }
            if (movedY < internalRadius) { movedY = internalRadius; }
            if (movedY > canvas.height - internalRadius) { movedY = canvas.height - internalRadius; }
        } else if (boundsType === "circle") {
            let distX = movedX - centerX;
            let distY = movedY - centerY;
            let distance = Math.sqrt(distX * distX + distY * distY);
            if (distance > maxMoveStick) {
                movedX = centerX + (distX / distance) * maxMoveStick;
                movedY = centerY + (distY / distance) * maxMoveStick;
            }
        } else if (boundsType === "diamond") {
            let diffX = Math.abs(movedX - centerX);
            let diffY = Math.abs(movedY - centerY);
            if (diffX + diffY > maxMoveStick) {
                let scale = maxMoveStick / (diffX + diffY);
                movedX = centerX + (movedX - centerX) * scale;
                movedY = centerY + (movedY - centerY) * scale;
            }
        } else {
            console.log("bad parameter");
        }
    }

    function updateStickStatus() {
        StickStatus.xPosition = movedX;
        StickStatus.yPosition = movedY;
        StickStatus.x = (100 * ((movedX - centerX) / maxMoveStick)).toFixed();
        StickStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();
        StickStatus.cardinalDirection = getCardinalDirection();
        callback(StickStatus);
    }

    function getCardinalDirection() {
        var result = "";
        var horizontal = movedX - centerX;
        var vertical = movedY - centerY;
        if (vertical >= -10 && vertical <= 10) {
            result = "C";
        }
        if (vertical < -10) {
            result = "N";
        }
        if (vertical > 10) {
            result = "S";
        }
        if (horizontal < -10) {
            if (result === "C") {
                result = "W";
            } else {
                result += "W";
            }
        }
        if (horizontal > 10) {
            if (result === "C") {
                result = "E";
            } else {
                result += "E";
            }
        }
        return result;
    }

    return {
        GetWidth: function() {
            return canvas.width;
        },
        GetHeight: function() {
            return canvas.height;
        },
        GetPosX: function() {
            return movedX;
        },
        GetPosY: function() {
            return movedY;
        },
        GetX: function() {
            return (100 * ((movedX - centerX) / maxMoveStick)).toFixed();
        },
        GetY: function() {
            return ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();
        },
        GetDir: function() {
            return getCardinalDirection();
        }
    };
}

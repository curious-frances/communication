let StickStatus = {
    xPosition: 0,
    yPosition: 0,
    x: 0,
    y: 0,
    cardinalDirection: "C"
};

function JoyStick(container, parameters, callback) {
    parameters = parameters || {};
    var title = (typeof parameters.title === "undefined" ? "joystick" : parameters.title),
        width = (typeof parameters.width === "undefined" ? 0 : parameters.width),
        height = (typeof parameters.height === "undefined" ? 0 : parameters.height),
        internalFillColor = (typeof parameters.internalFillColor === "undefined" ? "#00AA00" : parameters.internalFillColor),
        internalLineWidth = (typeof parameters.internalLineWidth === "undefined" ? 2 : parameters.internalLineWidth),
        internalStrokeColor = (typeof parameters.internalStrokeColor === "undefined" ? "#003300" : parameters.internalStrokeColor),
        externalLineWidth = (typeof parameters.externalLineWidth === "undefined" ? 2 : parameters.externalLineWidth),
        externalStrokeColor = (typeof parameters.externalStrokeColor === "undefined" ? "#008000" : parameters.externalStrokeColor),
        autoReturnToCenter = (typeof parameters.autoReturnToCenter === "undefined" ? true : parameters.autoReturnToCenter),
        boundsType = (typeof parameters.boundsType === "undefined" ? "square" : parameters.boundsType);

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
    var directionHorizontalLimitPos = canvas.width / 10;
    var directionHorizontalLimitNeg = directionHorizontalLimitPos * -1;
    var directionVerticalLimitPos = canvas.height / 10;
    var directionVerticalLimitNeg = directionVerticalLimitPos * -1;
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
        if (boundsType === "square") {
            if (movedX < internalRadius) { movedX = maxMoveStick; }
            if ((movedX + internalRadius) > canvas.width) { movedX = canvas.width - maxMoveStick; }
            if (movedY < internalRadius) { movedY = maxMoveStick; }
            if ((movedY + internalRadius) > canvas.height) { movedY = canvas.height - maxMoveStick; }
        }
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
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawExternal();
            drawInternal();
            StickStatus.xPosition = movedX;
            StickStatus.yPosition = movedY;
            StickStatus.x = (100 * ((movedX - centerX) / maxMoveStick)).toFixed();
            StickStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();
            StickStatus.cardinalDirection = getCardinalDirection();
            callback(StickStatus);
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
        StickStatus.xPosition = movedX;
        StickStatus.yPosition = movedY;
        StickStatus.x = (100 * ((movedX - centerX) / maxMoveStick)).toFixed();
        StickStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();
        StickStatus.cardinalDirection = getCardinalDirection();
        callback(StickStatus);
    }

    function onTouchStart(event) {
        pressed = 1;
    }

    function onTouchMove(event) {
        if (pressed === 1 && event.targetTouches[0].target === canvas) {
            movedX = event.targetTouches[0].pageX - canvas.offsetLeft;
            movedY = event.targetTouches[0].pageY - canvas.offsetTop;
            context.clearRect(0, 0, canvas.width, canvas.height);
            drawExternal();
            drawInternal();
            StickStatus.xPosition = movedX;
            StickStatus.yPosition = movedY;
            StickStatus.x = (100 * ((movedX - centerX) / maxMoveStick)).toFixed();
            StickStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();
            StickStatus.cardinalDirection = getCardinalDirection();
            callback(StickStatus);
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
        StickStatus.xPosition = movedX;
        StickStatus.yPosition = movedY;
        StickStatus.x = (100 * ((movedX - centerX) / maxMoveStick)).toFixed();
        StickStatus.y = ((100 * ((movedY - centerY) / maxMoveStick)) * -1).toFixed();
        StickStatus.cardinalDirection = getCardinalDirection();
        callback(StickStatus);
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
            default:
                return;
        }
        if (boundsType == "square") {
            if (movedX < internalRadius) { movedX = maxMoveStick; }
            if ((movedX + internalRadius) > canvas.width) { movedX = canvas.width - maxMoveStick; }
            if (movedY < internalRadius) { movedY = maxMoveStick; }
            if ((movedY + internalRadius) > canvas.height) { movedY = canvas.height - maxMoveStick; }
        } else if (boundsType == "circle") {
            if ((movedX - centerX) ** 2 + (movedY - centerY) ** 2 > maxMoveStick ** 2) {
                var diffX = movedX - centerX;
                var diffY = movedY - centerY;
                var length = Math.sqrt(diffX ** 2 + diffY ** 2);
                movedX = centerX + maxMoveStick * diffX / length;
                movedY = centerY + maxMoveStick * diffY / length;
            }
        } else if (boundsType == "diamond") {
            var diffX = movedX - centerX;
            var diffY = movedY - centerY;
            var sum = diffX + diffY;
            var dif = diffX - diffY;

            sum = Math.min(Math.max(sum, -maxMoveStick), maxMoveStick);
            dif = Math.min(Math.max(dif, -maxMoveStick), maxMoveStick);

            movedX = centerX + (sum + dif) / 2;
            movedY = centerY + (sum - dif) / 2;
        } else {
            console.log("bad parameter");
        }
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawExternal();
        drawInternal();
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
        if (vertical >= directionVerticalLimitNeg && vertical <= directionVerticalLimitPos) {
            result = "C";
        }
        if (vertical < directionVerticalLimitNeg) {
            result = "N";
        }
        if (vertical > directionVerticalLimitPos) {
            result = "S";
        }
        if (horizontal < directionHorizontalLimitNeg) {
            if (result === "C") {
                result = "W";
            } else {
                result += "W";
            }
        }
        if (horizontal > directionHorizontalLimitPos) {
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

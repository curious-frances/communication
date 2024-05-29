let StickStatus =
{
    xPosition: 0,
    yPosition: 0,
    x: 0,
    y: 0,
    cardinalDirection: "C"
};

/**
 * @desc Principal object that draw a joystick, you only need to initialize the object and suggest the HTML container
 * @costructor
 * @param container {String} - HTML object that contains the Joystick
 * @param parameters (optional) - object with following keys:
 *  title {String} (optional) - The ID of canvas (Default value is 'joystick')
 *  width {Int} (optional) - The width of canvas, if not specified is setted at width of container object (Default value is the width of container object)
 *  height {Int} (optional) - The height of canvas, if not specified is setted at height of container object (Default value is the height of container object)
 *  internalFillColor {String} (optional) - Internal color of Stick (Default value is '#00AA00')
 *  internalLineWidth {Int} (optional) - Border width of Stick (Default value is 2)
 *  internalStrokeColor {String}(optional) - Border color of Stick (Default value is '#003300')
 *  externalLineWidth {Int} (optional) - External reference circonference width (Default value is 2)
 *  externalStrokeColor {String} (optional) - External reference circonference color (Default value is '#008000')
 *  autoReturnToCenter {Bool} (optional) - Sets the behavior of the stick, whether or not, it should return to zero position when released (Default value is True and return to zero)
 * @param callback {StickStatus} - 
 */
var JoyStick = (function(container, parameters, callback)
{
    parameters = parameters || {};
    var title = (typeof parameters.title === "undefined" ? "joystick" : parameters.title),
        width = (typeof parameters.width === "undefined" ? 0 : parameters.width),
        height = (typeof parameters.height === "undefined" ? 0 : parameters.height),
        internalFillColor = (typeof parameters.internalFillColor === "undefined" ? "#00AA00" : parameters.internalFillColor),
        internalLineWidth = (typeof parameters.internalLineWidth === "undefined" ? 2 : parameters.internalLineWidth),
        internalStrokeColor = (typeof parameters.internalStrokeColor === "undefined" ? "#003300" : parameters.internalStrokeColor),
        externalLineWidth = (typeof parameters.externalLineWidth === "undefined" ? 2 : parameters.externalLineWidth),
        externalStrokeColor = (typeof parameters.externalStrokeColor ===  "undefined" ? "#008000" : parameters.externalStrokeColor),
        autoReturnToCenter = (typeof parameters.autoReturnToCenter === "undefined" ? true : parameters.autoReturnToCenter),
        boundsType = (typeof parameters.boundsType === "undefined" ? "square" : parameters.boundsType);

    callback = callback || function(StickStatus) {};

    // Create Canvas element and add it in the Container object
    var objContainer = document.getElementById(container);
    
    // Fixing Unable to preventDefault inside passive event listener due to target being treated as passive in Chrome [Thanks to https://github.com/artisticfox8 for this suggestion]
    objContainer.style.touchAction = "none";

    var canvas = document.createElement("canvas");
    canvas.id = title;
    if(width === 0) { width = objContainer.clientWidth; }
    if(height === 0) { height = objContainer.clientHeight; }
    canvas.width = width;
    canvas.height = height;
    objContainer.appendChild(canvas);
    var context = canvas.getContext("2d");

    var pressed = 0; // Bool - 1=Yes - 0=No
    var circumference = 2 * Math.PI;
    var internalRadius = (canvas.width-((canvas.width/2)+10))/2;
    var maxMoveStick = internalRadius + 5;
    var externalRadius = internalRadius + 30;
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;
    var directionHorizontalLimitPos = canvas.width / 10;
    var directionHorizontalLimitNeg = directionHorizontalLimitPos * -1;
    var directionVerticalLimitPos = canvas.height / 10;
    var directionVerticalLimitNeg = directionVerticalLimitPos * -1;
    // Used to save current position of stick
    var movedX = centerX;
    var movedY = centerY;

    // Check if the device support the touch or not
    if("ontouchstart" in document.documentElement)
    {
        canvas.addEventListener("touchstart", onTouchStart, false);
        document.addEventListener("touchmove", onTouchMove, false);
        document.addEventListener("touchend", onTouchEnd, false);
    }
    else
    {
        canvas.addEventListener("mousedown", onMouseDown, false);
        document.addEventListener("mousemove", onMouseMove, false);
        document.addEventListener("mouseup", onMouseUp, false);
    }

    // Add event listener for arrow keys
    document.addEventListener("keydown", onKeyDown, false);

    // Draw the object
    drawExternal();
    drawInternal();

    /******************************************************
     * Private methods
     *****************************************************/

    /**
     * @desc Draw the external circle used as reference position
     */
    function drawExternal()
    {
        context.beginPath();
        context.arc(centerX, centerY, externalRadius, 0, circumference, false);
        context.lineWidth = externalLineWidth;
        context.strokeStyle = externalStrokeColor;
        context.stroke();
    }

    /**
     * @desc Draw the internal stick in the current position the user have moved it
     */
    function drawInternal()
    {
        context.beginPath();

        if (boundsType == "square"){
            if(movedX < internalRadius) { movedX = maxMoveStick; }
            if((movedX + internalRadius) > canvas.width) { movedX = canvas.width - maxMoveStick; }
            if(movedY < internalRadius) { movedY = maxMoveStick; }
            if((movedY + internalRadius) > canvas.height) { movedY = canvas.height - maxMoveStick; }
        } else if (boundsType == "circle"){
            if ( (movedX - centerX)**2 + (movedY - centerY)**2 > maxMoveStick**2){
                var diffX = movedX - centerX;
                var diffY = movedY - centerY;
                var length = Math.sqrt(diffX**2 + diffY**2);
                movedX = centerX + maxMoveStick * diffX / length;
                movedY = centerY + maxMoveStick * diffY / length;
            }
        } else if (boundsType == "diamond"){
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

        context.arc(movedX, movedY, internalRadius, 0, circumference, false);
        // create radial gradient
        var grd = context.createRadialGradient(centerX, centerY, 5, centerX, centerY, 200);
        // Light color
        grd.addColorStop(0, internalFillColor);
        // Dark color
        grd.addColorStop(1, internalStrokeColor);
        context.fillStyle = grd;
        context.fill();
        context.lineWidth = internalLineWidth;
        context.strokeStyle = internalStrokeColor;
        context.stroke();
    }

    /**
     * @desc Events for manage touch
     */
    function onTouchStart(event) 
    {
        pressed = 1;
    }

    function onTouchMove(event)
    {
        if(pressed === 1 && event.targetTouches[0].target === canvas)
        {
            movedX = event.targetTouches[0].pageX;
            movedY = event.targetTouches[0].pageY;
            // Manage offset
            if(canvas.offsetParent.tagName.toUpperCase() === "BODY")
            {
                movedX -= canvas.offsetLeft;
                movedY -= canvas.offsetTop;
            }
            else
            {
                movedX -= canvas.offsetParent.offsetLeft;
                movedY -= canvas.offsetParent.offsetTop;
            }
            // Delete canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Redraw object
            drawExternal();
            drawInternal();

            // Set attribute of callback
            StickStatus.xPosition = movedX;
            StickStatus.yPosition = movedY;
            StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
            StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
            StickStatus.cardinalDirection = getCardinalDirection();
            // Trigger the callback
            callback(StickStatus);
        }
    }

    function onTouchEnd(event) 
    {
        pressed = 0;
        // If required reset position store variable
        if(autoReturnToCenter)
        {
            movedX = centerX;
            movedY = centerY;
        }
        // Delete canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw object
        drawExternal();
        drawInternal();

        // Set attribute of callback
        StickStatus.xPosition = movedX;
        StickStatus.yPosition = movedY;
        StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
        StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
        StickStatus.cardinalDirection = getCardinalDirection();
        // Trigger the callback
        callback(StickStatus);
    }

    /**
     * @desc Events for manage mouse
     */
    function onMouseDown(event) 
    {
        pressed = 1;
    }

    function onMouseMove(event) 
    {
        if(pressed === 1 && event.target === canvas)
        {
            movedX = event.pageX;
            movedY = event.pageY;
            // Manage offset
            if(canvas.offsetParent.tagName.toUpperCase() === "BODY")
            {
                movedX -= canvas.offsetLeft;
                movedY -= canvas.offsetTop;
            }
            else
            {
                movedX -= canvas.offsetParent.offsetLeft;
                movedY -= canvas.offsetParent.offsetTop;
            }
            // Delete canvas
            context.clearRect(0, 0, canvas.width, canvas.height);
            // Redraw object
            drawExternal();
            drawInternal();

            // Set attribute of callback
            StickStatus.xPosition = movedX;
            StickStatus.yPosition = movedY;
            StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
            StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
            StickStatus.cardinalDirection = getCardinalDirection();
            // Trigger the callback
            callback(StickStatus);
        }
    }

    function onMouseUp(event) 
    {
        pressed = 0;
        // If required reset position store variable
        if(autoReturnToCenter)
        {
            movedX = centerX;
            movedY = centerY;
        }
        // Delete canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw object
        drawExternal();
        drawInternal();

        // Set attribute of callback
        StickStatus.xPosition = movedX;
        StickStatus.yPosition = movedY;
        StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
        StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
        StickStatus.cardinalDirection = getCardinalDirection();
        // Trigger the callback
        callback(StickStatus);
    }

    /**
     * @desc Events for manage keyboard
     */
    function onKeyDown(event) 
    {
        const stepSize = 5;
        switch(event.key) {
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

        // Keep joystick within bounds
        if (boundsType == "square"){
            if(movedX < internalRadius) { movedX = maxMoveStick; }
            if((movedX + internalRadius) > canvas.width) { movedX = canvas.width - maxMoveStick; }
            if(movedY < internalRadius) { movedY = maxMoveStick; }
            if((movedY + internalRadius) > canvas.height) { movedY = canvas.height - maxMoveStick; }
        } else if (boundsType == "circle"){
            if ( (movedX - centerX)**2 + (movedY - centerY)**2 > maxMoveStick**2){
                var diffX = movedX - centerX;
                var diffY = movedY - centerY;
                var length = Math.sqrt(diffX**2 + diffY**2);
                movedX = centerX + maxMoveStick * diffX / length;
                movedY = centerY + maxMoveStick * diffY / length;
            }
        } else if (boundsType == "diamond"){
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

        // Delete canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw object
        drawExternal();
        drawInternal();

        // Set attribute of callback
        StickStatus.xPosition = movedX;
        StickStatus.yPosition = movedY;
        StickStatus.x = (100*((movedX - centerX)/maxMoveStick)).toFixed();
        StickStatus.y = ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
        StickStatus.cardinalDirection = getCardinalDirection();
        // Trigger the callback
        callback(StickStatus);
    }

    /**
     * @desc Get the cardinal direction
     * @return {String}
     */
    function getCardinalDirection()
    {
        var result = "";
        var horizontal = movedX - centerX;
        var vertical = movedY - centerY;
        
        if(vertical >= directionVerticalLimitNeg && vertical <= directionVerticalLimitPos)
        {
            result = "C";
        }
        if(vertical < directionVerticalLimitNeg)
        {
            result = "N";
        }
        if(vertical > directionVerticalLimitPos)
        {
            result = "S";
        }
        
        if(horizontal < directionHorizontalLimitNeg)
        {
            if(result === "C")
            { 
                result = "W";
            }
            else
            {
                result += "W";
            }
        }
        if(horizontal > directionHorizontalLimitPos)
        {
            if(result === "C")
            { 
                result = "E";
            }
            else
            {
                result += "E";
            }
        }
        
        return result;
    }

    return {
        /**
         * @desc The width of canvas
         * @return {Int}
         */
        GetWidth: function () 
        {
            return canvas.width;
        },
        
        /**
         * @desc The height of canvas
         * @return {Int}
         */
        GetHeight: function () 
        {
            return canvas.height;
        },
        
        /**
         * @desc The X position of the cursor relative to the canvas that contains it
         * @return {Int}
         */
        GetPosX: function ()
        {
            return movedX;
        },
        
        /**
         * @desc The Y position of the cursor relative to the canvas that contains it
         * @return {Int}
         */
        GetPosY: function () 
        {
            return movedY;
        },
        
        /**
         * @desc Normalized value of X move of stick
         * @return {Int}
         */
        GetX: function () 
        {
            return (100*((movedX - centerX)/maxMoveStick)).toFixed();
        },

        /**
         * @desc Normalized value of Y move of stick
         * @return {Int}
         */
        GetY: function () 
        {
            return ((100*((movedY - centerY)/maxMoveStick))*-1).toFixed();
        },

        /**
         * @desc Get the direction of the cursor as a string that indicates the cardinal points where this is oriented
         * @return {String}
         */
        GetDir: function () 
        {
            return getCardinalDirection();
        }
    };
})(container, parameters, callback);

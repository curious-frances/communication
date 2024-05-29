var joy = new JoyStick("joyDiv", {
    internalFillColor: "#E97777",
    internalStrokeColor: "#E97777",
    externalStrokeColor: "#FF9F9F",
    boundsType: "diamond", // Change this to match your desired bounds type
  });
  
  // Function to handle keyboard events
  function handleKeyPress(event) {
    // Get the key code of the pressed key
    var key = event.key.toLowerCase();
    
    // Move the joystick based on the pressed key
    switch (key) {
      case 'w': // Move forwards
        joy.movedY -= 10;
        break;
      case 's': // Move backwards
        joy.movedY += 10;
        break;
      case 'a': // Move left
        joy.movedX -= 10;
        break;
      case 'd': // Move right
        joy.movedX += 10;
        break;
      // Add more cases for other keys if needed
    }
  
    // Delete canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw object
    joy.drawExternal();
    joy.drawInternal();
  }
  
  // Add event listener for key presses
  document.addEventListener('keydown', handleKeyPress);
  
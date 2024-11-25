/* global clearInterval, console, setInterval */

/**
 * Add two numbers
 * @customfunction
 * @param {number} first First number
 * @param {number} second Second number
 * @returns {number} The sum of the two numbers.
 */
export function add(first, second) {
  return first + second;
}

/**
 * Displays the current time once a second
 * @customfunction
 * @param {CustomFunctions.StreamingInvocation<string>} invocation Custom function invocation
 */
export function clock(invocation) {
  const timer = setInterval(() => {
    const time = currentTime();
    invocation.setResult(time);
  }, 1000);

  invocation.onCanceled = () => {
    clearInterval(timer);
  };
}

/**
 * Returns the current time
 * @returns {string} String with the current time formatted for the current locale.
 */
export function currentTime() {
  return new Date().toLocaleTimeString();
}

/**
 * Writes a message to console.log().
 * @customfunction LOG
 * @param {string} message String to write.
 * @returns String to write.
 */
export function logMessage(message) {
  console.log(message);
  return message;
}

/**
 * Connects to the WebSocket server and logs messages
 * @customfunction WEBSOCKET
 * @param {CustomFunctions.StreamingInvocation<string>} invocation Custom function invocation
 */
export function connectWebSocket(invocation) {
  const ws = new WebSocket("ws://localhost:3001");

  ws.onopen = () => {
    console.log("Connected to WebSocket server");
    ws.send("Hello Server!");
  };

  ws.onmessage = (event) => {
    console.log(`Received message: ${event.data}`);
    invocation.setResult(event.data);
  };

  ws.onclose = () => {
    console.log("Disconnected from WebSocket server");
  };

  ws.onerror = (error) => {
    console.error(`WebSocket error: ${error}`);
  };

  invocation.onCanceled = () => {
    ws.close();
  };
}

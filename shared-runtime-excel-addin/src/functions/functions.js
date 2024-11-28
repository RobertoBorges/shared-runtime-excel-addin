const sharedState = { value: "empty" };
/* global clearInterval, console, setInterval, CustomFunctions, WebSocket */
const webSocketConnections = new Map();

/**
 * Saves a string value to shared state with the task pane
 * @customfunction STOREVALUE
 * @param {string} value String to write to shared state with task pane.
 * @return {string} A success value
 */
export function storeValue(sharedValue) {
  sharedState.value = sharedValue;
  return "value stored";
}

/**
 * Gets a string value from shared state with the task pane
 * @customfunction GETVALUE
 * @returns {string} String value of the shared state with task pane.
 */
export function getValue() {
  return sharedState.value;
}

/**
 * Displays the current time once a second
 * @customfunction CLOCK
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
 * Generates a unique identifier
 * @returns {string} A unique identifier
 */
function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Increment the cells with a given amount every second. Creates a dynamic spilled array with multiple results
 * @customfunction websocket
 * @param {CustomFunctions.StreamingInvocation<string>} invocation Parameter to send results to Excel or respond to the user canceling the function. A dynamic array.
 */
export function WEBSOCKET(idClient, invocation) {
  const uniqueId = generateUniqueId();
  const ws = new WebSocket("ws://localhost:3001");

  webSocketConnections.set(uniqueId, ws);

  ws.onopen = () => {
    console.log(`Connected to WebSocket server with ID: ${uniqueId}`);
    ws.send("Hello Server!");
  };

  ws.onmessage = (event) => {
    console.log(`Received message: ${event.data}`);
    invocation.setResult(`ID: ${uniqueId} data: ${event.data}`);
  };

  ws.onclose = () => {
    console.log(`Disconnected from WebSocket server with ID: ${uniqueId}`);
    webSocketConnections.delete(uniqueId);
  };

  ws.onerror = (error) => {
    console.error(`WebSocket error: ${error}`);
  };

  invocation.onCanceled = () => {
    webSocketConnections.delete(uniqueId);
    ws.close();
  };
}

/**
 * Return the addresses of three parameters.
 * @customfunction GETPARAMETERADDRESSES
 * @param {string} firstParameter First parameter.
 * @param {string} secondParameter Second parameter.
 * @param {string} thirdParameter Third parameter.
 * @param {CustomFunctions.Invocation} invocation Invocation object.
 * @returns {string[][]} The addresses of the parameters, as a 2-dimensional array.
 * @requiresParameterAddresses
 */
export function getParameterAddresses(firstParameter, secondParameter, thirdParameter, invocation) {
  const addresses = [
    [invocation.parameterAddresses[0]],
    [invocation.parameterAddresses[1]],
    [invocation.parameterAddresses[2]],
  ];
  return addresses;
}

/**
 * Return the address of the cell that invoked the custom function.
 * @customfunction GETADDRESS
 * @param {number} first First parameter.
 * @param {number} second Second parameter.
 * @param {CustomFunctions.Invocation} invocation Invocation object.
 * @requiresAddress
 */
export function getAddress(first, second, invocation) {
  const address = invocation.address;
  return address;
}

/**
 * @customfunction ADDRANGE
 * @param {number[][]} singleRange
 */
export function addSingleRange(singleRange) {
  let total = 0;
  singleRange.forEach((setOfSingleValues) => {
    setOfSingleValues.forEach((value) => {
      total += value;
    });
  });
  return total;
}

/**
 * @customfunction ADDMULTIRANGE
 * @param {number[]} singleValue An array of numbers that are repeating parameters.
 */
export function addSingleValue(singleValue) {
  let total = 0;
  singleValue.forEach((value) => {
    total += value;
  });

  return total;
}

/**
 * Gets a weather report for a specified zipCode and dayOfWeek
 * @customfunction GETWEATHER
 * @param {number} [zipCode] Zip code. If omitted, zipCode = 98052.
 * @param {string} [dayOfWeek] Day of the week. If omitted, dayOfWeek = Wednesday.
 * @returns {string} Weather report for the day of the week in that zip code.
 */
export function getWeatherReport(zipCode, dayOfWeek) {
  if (zipCode === null) {
    zipCode = 98052;
  }

  if (dayOfWeek === null) {
    dayOfWeek = "Wednesday";
  }

  return `The weather report for ${dayOfWeek} in ${zipCode} is: Sunny`;
}

/**
 * Add two numbers
 * @customfunction ADD
 * @param {number} first First number
 * @param {number} second Second number
 * @returns {number} The sum of the two numbers.
 */
export function add(first, second) {
  return first + second;
}

/**
 * The sum of all of the numbers.
 * @customfunction
 * @param {number[][][]} operands A number (such as 1 or 3.1415), a cell address (such as A1 or $E$11), or a range of cell addresses (such as B3:F12)
 */

export function addsum(operands) {
  let total = 0;

  operands.forEach((range) => {
    range.forEach((row) => {
      row.forEach((num) => {
        total += num;
      });
    });
  });

  return total;
}

/**
 * Calculates the sum of the specified numbers
 * @customfunction ADD3
 * @param {number} first First number.
 * @param {number} second Second number.
 * @param {number} [third] Third number to add. If omitted, third = 0.
 * @returns {number} The sum of the numbers.
 */
export function add3(first, second, third) {
  if (third === null) {
    third = 0;
  }
  return first + second + third;
}

/**
 * Returns the second highest value in a matrixed range of values.
 * @customfunction SECONDHIGHEST
 * @param {number[][]} values Multiple ranges of values.
 */
export function secondHighest(values) {
  let highest = values[0][0],
    secondHighest = values[0][0];
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < values[i].length; j++) {
      if (values[i][j] >= highest) {
        secondHighest = highest;
        highest = values[i][j];
      } else if (values[i][j] >= secondHighest) {
        secondHighest = values[i][j];
      }
    }
  }
  return secondHighest;
}

/**
 * Gets a city name for the given U.S. zip code.
 * @customfunction GETCITY
 * @param {string} zipCode
 * @returns {string} The city of the zip code.
 */
export function getCity(zipCode) {
  let isValidZip = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipCode);
  if (isValidZip) return cityLookup(zipCode);

  function cityLookup(zipCode) {
    // Dummy implementation for city lookup
    const cityDatabase = {
      98052: "Redmond",
      10001: "New York",
      94105: "San Francisco",
    };
    return cityDatabase[zipCode] || "Unknown City";
  }
  let error = new CustomFunctions.Error(
    CustomFunctions.ErrorCode.invalidValue,
    "Please provide a valid U.S. zip code."
  );
  throw error;
}

/**
 * Returns the #NUM! error as part of a 2-dimensional array.
 * @customfunction RETURNINVALIDNUMBERERROR
 * @param {number} first First parameter.
 * @param {number} second Second parameter.
 * @param {number} third Third parameter.
 * @returns {number[][]} Three results, as a 2-dimensional array.
 */
export function returnInvalidNumberError(first, second, third) {
  // Use the `CustomFunctions.Error` object to retrieve an invalid number error.
  const error = new CustomFunctions.Error(CustomFunctions.ErrorCode.invalidNumber, "The second parameter is invalid.");

  // Enter logic that processes the first, second, and third input parameters.
  // Imagine that the second calculation results in an invalid number error.
  const firstResult = first;
  const secondResult = error;
  const thirdResult = third;

  // Return the results of the first and third parameter calculations and a #NUM! error in place of the second result.
  return [[firstResult], [secondResult], [thirdResult]];
}

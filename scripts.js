
class Event {
  constructor(startHour, startMinute, endHour, endMinute) {

    if (startHour > endHour ||
        (startHour == endHour &&
         startMinute > endMinute)) {

      throw new Error("Start time must be smaller than end time.");
    }

    this.startHour = startHour;
    this.startMinute = startMinute;
    this.endHour = endHour;
    this.endMinute = endMinute;
  }

  get durationInMinutes() {
    return ((this.endHour - this.startHour) * 60) + this.endMinute - this.startMinute;
  }
}

// Stores all events that will be displayed
let events = [];

// Standart input
events.push(new Event(9, 00, 15, 30));
events.push(new Event(9, 00, 14, 30));
events.push(new Event(9, 30, 11, 30));
events.push(new Event(11, 30, 12, 00));
events.push(new Event(14, 30, 15, 00));
events.push(new Event(15, 30, 16, 00));

// Accessory functions START ===================================================
function checkCollision(event1, event2) {
  // Event 1 starts earlier than event 2 starts
  if (event1.startHour < event2.startHour ||
    (event1.startHour == event2.startHour &&
      event1.startMinute < event2.startMinute)) {

        // Event 1 ends later than event 2 starts
        if (event1.endHour > event2.startHour ||
          (event1.endHour == event2.startHour &&
            event1.endMinute > event2.startMinute)) {
              return true;
            }
          }

          // Event 2 starts earlier than event 1 starts
          if (event2.startHour < event1.startHour ||
            (event2.startHour == event1.startHour &&
              event2.startMinute < event1.startMinute)) {

                // Event 2 ends later than event 1 starts
                if (event2.endHour > event1.startHour ||
                  (event2.endHour == event1.startHour &&
                    event2.endMinute > event1.startMinute)) {
                      return true;
                    }
                  }

                  // Event 1 and event 2 start at the same time
                  if (event1.startHour == event2.startHour &&
                    event1.startMinute == event2.startMinute) {
                      return true;
                    }

                    return false;
                  }

function createMatrix(events) {

  events.sort(function(a, b) {
    if (a.startHour == b.startHour && a.startMinute == b.startMinute) {
      // Guarantees rule "The longer the duration of the event, the further left the event is positioned"
      return b.durationInMinutes - a.durationInMinutes;
    } else {
      // Garantees rule "The “earlier” the start time, the further left the event is positioned"
      if (a.startHour != b.startHour) {
        return a.startHour - b.startHour;
      } else {
        return a.startMinute - b.startMinute;
      }
    }
  });

  let matrix = [];
  matrix.push([]);

  for (let i = 0; i < events.length; i++) { //Iterates over all events
    for (let column = 0; column < matrix.length; column++) { //Iterates over all matrix columns

      let collided = false;

      for (let j = 0; j < matrix[column].length; j++) { //Iterates over elements of a column
        if (checkCollision(events[i], matrix[column][j])) {
          collided = true;
          break;
        }
      }

      if (collided && column == matrix.length - 1) {
        matrix.push([events[i]]);
        break;
      } else if (collided) {
        continue;
      } else {
        matrix[column].push(events[i]);
        break;
      }
    }
  }

  return matrix;
}

function calculatePosition(hour, minute) {
  if (minute == 0) {
    return (2 * hour) + 1;
  } else {
    return (2 * hour) + 2;
  }
}

function removeAllChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function setGridColumnEnd(column, element, matrix, event) {

  let previousColumnEnd = column + 2;

  for (let j = column + 1; j < matrix.length; j++) { // Iterates over the columns to the right of current event

    let firstCollision = false;
    let newColumnEnd = previousColumnEnd;

    for (let k = 0; k < matrix[j].length; k++) { // Iterates over the elements of the columns to the right
      if(!checkCollision(matrix[column][element], matrix[j][k])) {
        newColumnEnd = j + 2;
      } else {
        firstCollision = true;
        break;
      }
    }

    if(firstCollision) {
      event.style.gridColumnEnd = previousColumnEnd;
      break;
    } else {
      event.style.gridColumnEnd = newColumnEnd;
      previousColumnEnd = newColumnEnd;
    }
  }
}

// Code taken from https://stackoverflow.com/questions/1484506/random-color-generator
function getRandomColor(brightness){

    // Six levels of brightness from 0 to 5, 0 being the darkest
    var rgb = [Math.random() * 256, Math.random() * 256, Math.random() * 256];
    var mix = [brightness*51, brightness*51, brightness*51]; //51 => 255/5
    var mixedrgb = [rgb[0] + mix[0], rgb[1] + mix[1], rgb[2] + mix[2]].map(function(x){ return Math.round(x/2.0)})
    return "rgb(" + mixedrgb.join(",") + ")";
}

// Code taken from https://stackoverflow.com/questions/8043026/how-to-format-numbers-by-prepending-0-to-single-digit-numbers
function format(n){
    return n > 9 ? "" + n: "0" + n;
}
// Accessory functions END ===================================================

// Rendering functions START ===================================================
function renderEvents(){
  let eventGrid = document.getElementById("events");

  // Needed when the element is rendered for the second time.
  removeAllChildren(eventGrid);

  let matrix = createMatrix(events);
  let columns = matrix.length;
  eventGrid.style.gridTemplateColumns = "repeat(" + columns + ", 1fr)";

  for (let column = 0; column < matrix.length; column++) {
    for (let i = 0; i < matrix[column].length; i++) {
      let event = document.createElement("div");
      event.classList.add("event");
      event.style.backgroundColor = getRandomColor(4);
      event.style.gridColumnStart = column + 1;
      setGridColumnEnd(column, i, matrix, event);

      event.style.gridRowStart = calculatePosition(matrix[column][i].startHour,
                                                   matrix[column][i].startMinute);
      event.style.gridRowEnd = calculatePosition(matrix[column][i].endHour,
                                                 matrix[column][i].endMinute);
      eventGrid.appendChild(event);
    }
  }

  renderEventList(matrix);
}

function renderEventList(matrix) {
  let eventList = document.getElementById("eventList");

  // Needed when the element is rendered for the second time.
  removeAllChildren(eventList);

  for (let column = 0; column < matrix.length; column++) {
    for (let i = 0; i < matrix[column].length; i++) {
      let event = document.createElement("li");

      event.innerHTML = format(matrix[column][i].startHour) + ":" + format(matrix[column][i].startMinute) +
                        " - " + format(matrix[column][i].endHour) + ":" + format(matrix[column][i].endMinute);

      eventList.appendChild(event);
    }
  }
}
// Rendering functions END ===================================================

function addEvent() {

  let startHour = parseInt(document.getElementById("startHour").value);
  let startMinute = parseInt(document.getElementById("startMinute").value);
  let endHour = parseInt(document.getElementById("endHour").value);
  let endMinute = parseInt(document.getElementById("endMinute").value);

  if (!isNaN(startHour) &&
      !isNaN(startMinute) &&
      !isNaN(endHour) &&
      !isNaN(endMinute)) {
    events.push(new Event(startHour,
                          startMinute,
                          endHour,
                          endMinute));

    renderEvents();
  }
}

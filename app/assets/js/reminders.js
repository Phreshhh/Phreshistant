module.exports = {
  getTodosToRemindersSelect,
  addTodoToReminder,
  saveReminder,
  deleteReminder,
  updateReminderTime
};

let newReminderYear = document.getElementById('newReminderYear');
let newReminderMonth = document.getElementById('newReminderMonth');
let newReminderDay = document.getElementById('newReminderDay');
let newReminderHour = document.getElementById('newReminderHour');
let newReminderMinute = document.getElementById('newReminderMinute');

let dateYear = new Date().getFullYear();
let dateYearMax = dateYear + 4;

for (dateYear; dateYear <= dateYearMax; dateYear++) {
  newReminderYear.innerHTML += '<option value="' + dateYear + '">' + dateYear + '</option>';
}

let dateMonth = new Date().getMonth() + 1;

for (let i = 1; i <= 12; i++) {
  if (i === dateMonth) {
    newReminderMonth.innerHTML += '<option value="' + i + '" selected>' + ('0' + i).slice(-2) + '</option>';
  } else {
    newReminderMonth.innerHTML += '<option value="' + i + '">' + ('0' + i).slice(-2) + '</option>';
  }
}

let dateDay = new Date().getDate();
let dateDayMax = daysInMonth(dateMonth,dateYear);

for (let i = 1; i <= dateDayMax; i++) {
  if (i === dateDay) {
    newReminderDay.innerHTML += '<option value="' + i + '" selected>' + ('0' + i).slice(-2) + '</option>';
  } else {
    newReminderDay.innerHTML += '<option value="' + i + '">' + ('0' + i).slice(-2) + '</option>';
  }
}

let dateHour = new Date().getHours();

for (let i = 0; i <= 23; i++) {
  if (i === dateHour) {
    newReminderHour.innerHTML += '<option value="' + i + '" selected>' + ('0' + i).slice(-2) + '</option>';
  } else {
    newReminderHour.innerHTML += '<option value="' + i + '">' + ('0' + i).slice(-2) + '</option>';
  }
}

for (let i = 0; i < 60; i=i+5) {
  newReminderMinute.innerHTML += '<option value="' + i + '">' + ('0' + i).slice(-2) + '</option>';
}

function daysInMonth (month, year) {
  return new Date(year, month, 0).getDate();
}

let reminderStateSelector = `
<i class="fa fa-caret-down w3-dropdown-hover" style="background-color:transparent;">
  <div class="w3-dropdown-content w3-bar-block w3-border w3-animate-right w3-right">
    <a href="#" onclick="remindersJS.deleteReminder(_REMINDERID_);" class="w3-bar-item w3-button w3-button-app w3-text-black stateselectorbutton">
      <i class="fa fa-times"></i>
      Delete
    </a>
  </div>
</i>`;

function getReminders() {

  document.getElementById('remindersList').innerHTML = '';

  remindersDB.find({}).sort({ _id: -1 }).exec(function (err, docs) {
    docs.forEach(function(d) {

      let currReminderStateSelector = reminderStateSelector.replace(new RegExp('_REMINDERID_', 'g'), d._id);
      
      getTodoTextToReminders(d._todos)
      .then( (todotexts) => {

        let reminderData = '<p>' + d._year + '-' + ('0' + d._month).slice(-2) + '-' + ('0' + d._day).slice(-2) + ' ' + ('0' + d._hour).slice(-2) + ':' + ('0' + d._minute).slice(-2) + '</p>';
        
        if (d._type === 'Periodic') {
          reminderData += '<p>Type: ' + d._type + ' (' + d._period + ' minutes)' + '</p>';
        } else {
          reminderData += '<p>Type: ' + d._type + '</p>';
        }

        if (d._alert || d._modal) {

          reminderData += '<p>Popups: ';
          reminderData += '<ul>';
          if (d._alert) {
            reminderData += '<li>Alert</li>';
          }
          if (d._modal) {
            reminderData += '<li>Modal</li>';
          }
          reminderData += '</ul>';
          reminderData += '</p>';

        }

        if (d._focus) {
          reminderData += '<p>Focus window</p>';
        }

        if (d._todos !== '') {
          reminderData += '<p>Todos to Idle: ' + '<ol>' + todotexts + '</ol></p>';
        }
  
        document.getElementById('remindersList').innerHTML += '<li id="reminderli-' + d._id + '" class="w3-animate-left w3-clear clickable w3-button-highlight"><button onclick="toggleShowReminderData(\'reminderdata-' + d._id + '\');" class="w3-button w3-button-highlight w3-block w3-left-align todoshowhidedescbutton">' + d._text + '</button><span class="w3-small w3-right projectstateselectorspan">' + currReminderStateSelector + '</span><div id="reminderdata-' + d._id + '" class="w3-container w3-hide">' + reminderData + '</div></li>';
        
        let settedReminderDateTime = new Date(d._year, d._month - 1, d._day, d._hour, d._minute);
        let settedReminderTime = settedReminderDateTime.getTime();
        let settedReminderObj = { id: d._id, time: settedReminderTime, text: d._text, type: d._type, period: d._period, alert: d._alert, modal: d._modal, focus: d._focus, todos: d._todos }
        settedReminders.push(settedReminderObj);

      });

    });
  });

}
getReminders();

function getTodoTextToReminders(todoIDs) {

  return new Promise( (resolve, reject) => {

    if (todoIDs === '') {
      resolve(todoIDs);
    } else {

      let todoIDsArr = [];

      if (todoIDs.search(',') !== -1) {
        todoIDsArr = todoIDs.split(',');
      } else {
        todoIDsArr.push(parseInt(todoIDs));
      }

      let findIDs;
  
      if (todoIDsArr.length > 0) {
    
        if (todoIDsArr.length === 1) {
          findIDs = { _id: parseInt(todoIDsArr[0]) };
        } else {
          
          let findIDsObjs = [];
  
          for (let i = 0; i < todoIDsArr.length; i++) {
            let findIDsObj = { _id: parseInt(todoIDsArr[i]) }
            findIDsObjs.push(findIDsObj);
          }
    
          findIDs = { $or: findIDsObjs }
    
        }
    
      }
  
      let todoTexts = '';
    
      todosDB.find( findIDs ).sort({ _stateId: 1, _priority: 1 }).exec(function (err, docs) {
        docs.forEach(function(d) {
          todoTexts += '<li>' + d._todo + '</li>';
        });
        resolve(todoTexts);
      });

    }

  });

}


function getProjectsToRemindersSelect() {

  let projectStateColor;
  let firstProjectTodosLoadedToSelect = false;

  projectsDB.find({ $or: [ { _stateId: 1 }, { _stateId: 2 }, { _stateId: 5 } ] }).sort({ _stateId: 1 }).exec(function (err, docs) {
    docs.forEach(function(d) {

        if (!firstProjectTodosLoadedToSelect) {
          getTodosToRemindersSelect(d._id);
          firstProjectTodosLoadedToSelect = true;
        }

        switch(d._stateId) {
          case 1:
            projectStateColor = 'w3-text-blue';
            break;
          case 2:
            projectStateColor = 'w3-text-orange';
            break;
          case 5:
            projectStateColor = 'w3-text-teal';
            break;
          default:
            // error
            projectStateColor = 'w3-text-red';
            break;
        }
        
        document.getElementById('newReminderProjectSelect').innerHTML += '<option class="' + projectStateColor + '" value="' + d._id + '"> ' + d._name + ' </option>';
      
    });
  });

}
getProjectsToRemindersSelect();

function getTodosToRemindersSelect(projectID) {

  document.getElementById('newReminderTodoSelect').innerHTML = '';

  let todoStateColor;
  
  todosDB.find({_projectId: parseInt(projectID)}).sort({ _stateId: 1, _priority: 1 }).exec(function (err, docs) {
    docs.forEach(function(d) {
      
      switch(d._stateId) {
        case 1:
          todoStateColor = 'w3-text-blue';
          break;
        case 2:
          todoStateColor = 'w3-text-orange';
          break;
        case 3:
          todoStateColor = 'w3-text-amber';
          break;
        case 4:
          todoStateColor = 'w3-text-green';
          break;
        default:
          // error
          todoStateColor = 'w3-text-red';
          break;
      }
      
      document.getElementById('newReminderTodoSelect').innerHTML += '<option class="' + todoStateColor + '" value="' + d._id + '">' + d._todo + '</option>';

    });
  });

}

let addedTodosToReminder = [];

function addTodoToReminder() {

  let newReminderTodoSelect = document.getElementById('newReminderTodoSelect');
  let todoId = newReminderTodoSelect.options[newReminderTodoSelect.selectedIndex].value;
  let todoID = parseInt(todoId);

  let newSearchedId = { _id: todoID }

  let todoIdInAdded = searchTodoToReminder(todoID);
  
  if (todoIdInAdded === undefined) {
    addedTodosToReminder.push(newSearchedId);
    getAddedTodosToReminders();
  }

}

function searchTodoToReminder(todoID) {

  for (let i = 0; i < addedTodosToReminder.length; i++) {
      if (addedTodosToReminder[i]._id === todoID) {
          return addedTodosToReminder[i];
      }
  }

}

function getAddedTodosToReminders() {

  document.getElementById('newReminderTodoAddedList').innerHTML = '';

  let findIDs;

  if (addedTodosToReminder.length > 0) {

    if (addedTodosToReminder.length === 1) {
      findIDs = addedTodosToReminder[0];
    } else {
      findIDs = { $or: addedTodosToReminder }
    }

  }
  
  let todoStateIcon, todoStateColor;

  todosDB.find( findIDs ).sort({ _stateId: 1, _priority: 1 }).exec(function (err, docs) {
    docs.forEach(function(d) {
      
      let todoPriority = '';

      let workedTime = formatWorkTime(0, d._time);
      
      switch (d._priority) {
        case 1:
          todoPriority = '<span class="w3-small w3-right w3-tag w3-round w3-pale-red todopriorityspan"><i class="fa fa-thermometer-full w3-left w3-text-red"></i> High </span>';
          break;
        case 2:
          todoPriority = '<span class="w3-small w3-right w3-tag w3-round w3-pale-yellow todopriorityspan"><i class="fa fa-thermometer-half w3-left w3-text-deep-orange"></i> Medium </span>';
          break;
        case 3:
          todoPriority = '<span class="w3-small w3-right w3-tag w3-round w3-pale-green todopriorityspan"><i class="fa fa-thermometer-empty w3-left w3-text-orange"></i> Low </span>';
          break;
      }

      switch(d._stateId) {
        case 1:
          todoStateIcon = '<i class="fa fa-play w3-text-blue"></i>';
          todoStateColor = 'w3-hover-text-blue';
          break;
        case 2:
          todoStateIcon = '<i class="fa fa-heartbeat w3-text-orange"></i>';
          todoStateColor = 'w3-hover-text-orange';
          break;
        case 3:
          todoStateIcon = '<i class="fa fa-stop w3-text-amber"></i>';
          todoStateColor = 'w3-hover-text-amber';
          break;
        case 4:
          todoStateIcon = '<i class="fa fa-check w3-text-green"></i>';
          todoStateColor = 'w3-hover-text-green';
          break;
        default:
          // error
          todoStateIcon = '<i class="fa fa-warning w3-text-red"></i>';
          todoStateColor = 'w3-hover-text-red';
          break;
      }
      
      document.getElementById('newReminderTodoAddedList').innerHTML += '<li class="w3-animate-bottom w3-clear w3-left-align w3-padding w3-button-highlight w3-round ' + todoStateColor + '">' + todoStateIcon + ' ' + d._todo + todoPriority + '<span class="w3-small w3-right todostateselectorspan" style="margin-right:10px;"><i class="fa fa-clock-o"></i>' + workedTime + ' ' + '</span></li>';

    });
  });

}

function saveReminder() {

  let newReminderYearSelect = document.getElementById('newReminderYear');
  let reminderYear = parseInt( newReminderYearSelect.options[newReminderYearSelect.selectedIndex].value );

  let newReminderMonthSelect = document.getElementById('newReminderMonth');
  let reminderMonth = parseInt( newReminderMonthSelect.options[newReminderMonthSelect.selectedIndex].value );

  let newReminderDaySelect = document.getElementById('newReminderDay');
  let reminderDay = parseInt( newReminderDaySelect.options[newReminderDaySelect.selectedIndex].value );

  let newReminderHourSelect = document.getElementById('newReminderHour');
  let reminderHour = parseInt( newReminderHourSelect.options[newReminderHourSelect.selectedIndex].value );

  let newReminderMinuteSelect = document.getElementById('newReminderMinute');
  let reminderMinute = parseInt( newReminderMinuteSelect.options[newReminderMinuteSelect.selectedIndex].value );

  let reminderText = document.getElementById('newReminderTextInput').value;

  if (reminderText === '') {
    reminderText = 'reminder';
  }

  let reminderType = 'Once';

  let reminderPeriod = 0;

  let reminderTypeChecks = document.getElementsByClassName("newremindertypecheck");
  
  for (let i = 0; i < reminderTypeChecks.length; i++) {

    if (reminderTypeChecks[i].checked) {

      reminderType = reminderTypeChecks[i].value;

      if (reminderType === 'Periodic' && document.getElementById("newReminderPeriod").value !== '') {

        reminderPeriod = parseInt( document.getElementById("newReminderPeriod").value );
        if (reminderPeriod < 5) {
          reminderPeriod = 5;
        }
        if (reminderPeriod > 600) {
          reminderPeriod = 600;
        }

      }

    }

  }

  let reminderAlert = document.getElementById('newReminderInAlert').checked;
  let reminderModal = document.getElementById('newReminderInModal').checked;
  let reminderFocus = document.getElementById('newReminderGetFocus').checked;

  let reminderTodoIDs = '';

  for (let i = 0; i < addedTodosToReminder.length; i++) {

    if (reminderTodoIDs === '') {
      reminderTodoIDs = addedTodosToReminder[i]._id.toString();
    } else {
      reminderTodoIDs += ',' + addedTodosToReminder[i]._id.toString();
    }

  }

  remindersDB.find({}).sort({ _id: -1 }).limit(1).exec(function (err, docs) {
  
    let newid = 0;

    docs.forEach(function(doc) {
      newid = doc._id + 1;
    });

    if (newid === 0) {
      newid = 1;
    }

    let newreminderArr = [];
      
    let newreminderObj = {
      _id: newid,
      _year: reminderYear,
      _month: reminderMonth,
      _day: reminderDay,
      _hour: reminderHour,
      _minute: reminderMinute,
      _text: reminderText,
      _type: reminderType,
      _period: reminderPeriod,
      _alert: reminderAlert,
      _modal: reminderModal,
      _focus: reminderFocus,
      _todos: reminderTodoIDs
    };
    
    newreminderArr.push(newreminderObj);
    
    remindersDB.insert(newreminderArr, function(err, docs) {
      document.location.href = 'index.html';
    });

  });

}

function deleteReminder(reminderID) {

  remindersDB.remove({ _id: reminderID }, function(err, numDeleted) {
    document.getElementById('reminderli-' + reminderID).outerHTML = '';
  });
  
}

function updateReminderTime(reminderID, reminderTime) {

  reminderTime = new Date(reminderTime);
  let newReminderYear = reminderTime.getFullYear();
  let newReminderMonth = reminderTime.getMonth() + 1;
  let newReminderDay = reminderTime.getDate();

  let newReminderHour = reminderTime.getHours();
  let newReminderMinute = reminderTime.getMinutes();

  remindersDB.update({ _id: reminderID }, { $set: { _year: newReminderYear, _month: newReminderMonth, _day: newReminderDay, _hour: newReminderHour, _minute: newReminderMinute } });

}

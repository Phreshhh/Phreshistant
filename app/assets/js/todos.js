module.exports = {
  getTodos,
  saveTodoListener,
  updateTodoState,
  updateTodoPriority,
  addWorkPriceToTodoListener,
  deleteTodo,
  editTodoNote,
  saveTodoNote,
  editorMakeText,
  updateTodoStateToIdle,
  getTodoText
};
/*
  Todo States:

  Processing (1) [play]
  Testing (2) [heartbeat]
  Idle (3) [stop]
  Finished (4) [flag]
  Edit (e) [edit]
  Deleted (x) [times]
*/

let todoStateSelector = `
<i class="fa fa-caret-down w3-dropdown-hover" style="background-color:transparent;" onmouseover="disableTooltips();" onmouseleave="allowTooltips();">
  <div class="w3-dropdown-content w3-bar-block w3-border w3-animate-right w3-right">
    <a href="#" onclick="todosJS.updateTodoState(_TODOID_, 1);" class="w3-bar-item w3-button w3-button-app w3-text-blue stateselectorbutton">
      <i class="fa fa-play"></i>
      Run
    </a>
    <a href="#" onclick="todosJS.updateTodoState(_TODOID_, 2);" class="w3-bar-item w3-button w3-button-app w3-text-orange stateselectorbutton">
      <i class="fa fa-heartbeat"></i>
      Test
    </a>
    <a href="#" onclick="todosJS.updateTodoState(_TODOID_, 3);" class="w3-bar-item w3-button w3-button-app w3-text-amber stateselectorbutton">
      <i class="fa fa-stop"></i>
      Stop
    </a>
    <a href="#" onclick="todosJS.updateTodoState(_TODOID_, 4);" class="w3-bar-item w3-button w3-button-app w3-text-green stateselectorbutton">
      <i class="fa fa-check"></i>
      Finish
    </a>
    <hr class="stateselectorseparator" />
    <a href="#" onclick="todosJS.editTodoNote(_TODOID_);" class="w3-bar-item w3-button w3-button-app w3-text-brown stateselectorbutton">
      <i class="fa fa-edit"></i>
      Edit note
    </a>
    <hr class="stateselectorseparator" />
    <a href="#" onclick="document.getElementById('todoWorkPriceTodoIDInput').value = '_TODOID_';showModal('updateTodoWorkPriceModal', 'todoWorkPriceInput');" class="w3-bar-item w3-button w3-button-app w3-text-black stateselectorbutton">
      <i class="fa fa-money"></i>
      Workprice
    </a>
    <hr class="stateselectorseparator" />
    <a href="#" onclick="todosJS.deleteTodo(_TODOID_);" class="w3-bar-item w3-button w3-button-app w3-text-black stateselectorbutton">
      <i class="fa fa-times"></i>
      Delete
    </a>
  </div>
</i>`;

let todoPrioritySelector = `
<i class="fa fa-caret-down w3-dropdown-hover w3-right" style="background-color:transparent;margin-top:3px;">
  <div class="w3-dropdown-content w3-bar-block w3-border w3-animate-right w3-right">
    <a href="#" onclick="todosJS.updateTodoPriority(_TODOID_, 1);" class="w3-bar-item w3-button w3-button-app w3-text-red stateselectorbutton">
      <i class="fa fa-thermometer-full"></i>
      High
    </a>
    <a href="#" onclick="todosJS.updateTodoPriority(_TODOID_, 2);" class="w3-bar-item w3-button w3-button-app w3-text-amber stateselectorbutton">
      <i class="fa fa-thermometer-half"></i>
      Medium
    </a>
    <a href="#" onclick="todosJS.updateTodoPriority(_TODOID_, 3);" class="w3-bar-item w3-button w3-button-app w3-text-green stateselectorbutton">
      <i class="fa fa-thermometer-empty"></i>
      Low
    </a>
  </div>
</i>`;

function getTodos(projectID) {

  document.getElementById('todoView').innerHTML += '<i id="todoLoader" class="fa fa-spinner fa-pulse"></i>';
  document.getElementById('todoAllList').innerHTML = '';
  document.getElementById('todoProcessingList').innerHTML = '';
  document.getElementById('todoTestingList').innerHTML = '';
  document.getElementById('todoIdleList').innerHTML = '';
  document.getElementById('todoFinishedList').innerHTML = '';

  let todoStateIcon, todoStateColor, todoCounterStateColor = '';

  countUpIntervals = [];

  projectsJS.getProjectPricePerHour(projectID)
  .then( (projectPricePerHour) => {

    todosDB.find({_projectId: projectID}).sort({ _stateId: 1, _priority: 1 }).exec(function (err, docs) {
      docs.forEach(function(d) {

        let currTodoStateSelector = todoStateSelector.replace(new RegExp('_TODOID_', 'g'), d._id);

        let currTodoPrioritySelector = todoPrioritySelector.replace(new RegExp('_TODOID_', 'g'), d._id);

        let todoPriority = '';

        let workedTime = formatWorkTime(0, d._time);
        let workedTime2 = formatWorkTime2(0, d._time);
        let todoPricePerHour = 0;
        let todoWorkPrice = 0;
        let todoWorkPriceSpan = '';
        let todoWorkPricePerHourTooltip = '';

        if (d._pricePerHour !== undefined && d._pricePerHour !== null && d._pricePerHour != '0') {

          todoPricePerHour = d._pricePerHour;
          todoWorkPrice = getWorkPrice(0, d._time, todoPricePerHour);

          if (todoWorkPrice !== 0) {
            todoWorkPriceSpan = '<span class="w3-small w3-left w3-margin-right"><i class="fa fa-money"></i> ' + todoWorkPrice.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.") + ' </span>';
          }

          todoWorkPricePerHourTooltip = '<i class="fa fa-money"></i>' + todoPricePerHour + '/h ';

        } else {

          if (projectPricePerHour !== 0) {

            todoWorkPrice = getWorkPrice(0, d._time, projectPricePerHour);

            if (todoWorkPrice > 0) {
              todoWorkPriceSpan = '<span class="w3-small w3-left w3-margin-right"><i class="fa fa-money"></i> ' + todoWorkPrice.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.") + ' </span>';
            }

            todoWorkPricePerHourTooltip = '<i class="fa fa-money"></i>' + projectPricePerHour + '/h ';

          }

        }

        switch (d._priority) {
          case 1:
            todoPriority = '<span class="w3-small w3-right w3-tag w3-round w3-pale-red todopriorityspan"><i class="fa fa-thermometer-full w3-left w3-text-red"></i> High ' + currTodoPrioritySelector + '</span>';
            break;
          case 2:
            todoPriority = '<span class="w3-small w3-right w3-tag w3-round w3-pale-yellow todopriorityspan"><i class="fa fa-thermometer-half w3-left w3-text-deep-orange"></i> Medium' + currTodoPrioritySelector + '</span>';
            break;
          case 3:
            todoPriority = '<span class="w3-small w3-right w3-tag w3-round w3-pale-green todopriorityspan"><i class="fa fa-thermometer-empty w3-left w3-text-orange"></i> Low ' + currTodoPrioritySelector + '</span>';
            break;
        }

        switch(d._stateId) {
          case 1:
            todoStateIcon = '<i class="fa fa-play w3-text-blue"></i>';
            todoStateColor = 'w3-hover-text-blue';
            todoCounterStateColor = 'w3-blue';
            document.getElementById('todoProcessingList').innerHTML += '<li id="todoli-' + d._id + '-processing" class="w3-animate-bottom w3-clear todoli ' + todoStateColor + '"><button onclick="toggleShowTodoNote(\'todo-' + projectID + '-' + d._id + '\');" class="w3-button w3-block w3-left-align todoshowhidedescbutton ' + todoStateColor + '">' + todoStateIcon + ' ' + d._todo + '<span id="todocounterspan-' + d._id + '-processing" class="w3-small w3-tag w3-center w3-round todocounterspan ' + todoCounterStateColor + '"></span></button>' + todoPriority + '<span class="w3-small w3-right todostateselectorspan w3-tooltip"><i class="fa fa-clock-o"></i>' + workedTime + ' ' + currTodoStateSelector + ' <span style="position:absolute;right:0;bottom:24px;" class="w3-text w3-tag w3-padding-small w3-round highlight tooltiptextspan">' + todoWorkPricePerHourTooltip + ' <i class="fa fa-clock-o"></i>' + workedTime2 + '</span> ' + todoWorkPriceSpan + ' </span><div id="todo-' + projectID + '-' + d._id + '" class="w3-container w3-hide">' + md.render(d._todoDesc) + '</div></li>';
            countUpIntervals.push(d._id + '_' + d._workstart);
            break;
          case 2:
            todoStateIcon = '<i class="fa fa-heartbeat w3-text-orange"></i>';
            todoStateColor = 'w3-hover-text-orange';
            todoCounterStateColor = 'w3-orange';
            document.getElementById('todoTestingList').innerHTML += '<li id="todoli-' + d._id + '-testing" class="w3-animate-bottom w3-clear todoli ' + todoStateColor + '"><button onclick="toggleShowTodoNote(\'todo-' + projectID + '-' + d._id + '\');" class="w3-button w3-block w3-left-align todoshowhidedescbutton ' + todoStateColor + '">' + todoStateIcon + ' ' + d._todo + '<span id="todocounterspan-' + d._id + '-testing" class="w3-small w3-tag w3-center w3-round todocounterspan ' + todoCounterStateColor + '"></span></button>' + todoPriority + '<span class="w3-small w3-right todostateselectorspan w3-tooltip"><i class="fa fa-clock-o"></i>' + workedTime + ' ' + currTodoStateSelector + ' <span style="position:absolute;right:0;bottom:24px;" class="w3-text w3-tag w3-padding-small w3-round highlight tooltiptextspan">' + todoWorkPricePerHourTooltip + ' <i class="fa fa-clock-o"></i>' + workedTime2 + '</span> ' + todoWorkPriceSpan + ' </span><div id="todo-' + projectID + '-' + d._id + '" class="w3-container w3-hide">' + md.render(d._todoDesc) + '</div></li>';
            countUpIntervals.push(d._id + '_' + d._workstart);
            break;
          case 3:
            todoStateIcon = '<i class="fa fa-stop w3-text-amber"></i>';
            todoStateColor = 'w3-hover-text-amber';
            document.getElementById('todoIdleList').innerHTML += '<li id="todoli-' + d._id + '-idle" class="w3-animate-bottom w3-clear todoli ' + todoStateColor + '"><button onclick="toggleShowTodoNote(\'todo-' + projectID + '-' + d._id + '\');" class="w3-button w3-block w3-left-align todoshowhidedescbutton ' + todoStateColor + '">' + todoStateIcon + ' ' + d._todo + '</button>' + todoPriority + '<span class="w3-small w3-right todostateselectorspan w3-tooltip"><i class="fa fa-clock-o"></i>' +
            workedTime + ' ' + currTodoStateSelector + ' <span style="position:absolute;right:0;bottom:24px;" class="w3-text w3-tag w3-padding-small w3-round highlight tooltiptextspan">' + todoWorkPricePerHourTooltip + ' <i class="fa fa-clock-o"></i>' + workedTime2 + '</span> ' + todoWorkPriceSpan + ' </span><div id="todo-' + projectID + '-' + d._id + '" class="w3-container w3-hide">' + md.render(d._todoDesc) + '</div></li>';
            countUpIntervals.push(d._id + '_' + 0);
            break;
          case 4:
            todoStateIcon = '<i class="fa fa-check w3-text-green"></i>';
            todoStateColor = 'w3-hover-text-green';
            document.getElementById('todoFinishedList').innerHTML += '<li id="todoli-' + d._id + '-finished" class="w3-animate-bottom w3-clear todoli ' + todoStateColor + '"><button onclick="toggleShowTodoNote(\'todo-' + projectID + '-' + d._id + '\');" class="w3-button w3-block w3-left-align todoshowhidedescbutton ' + todoStateColor + '">' + todoStateIcon + ' ' + d._todo + '</button>' + todoPriority + '<span class="w3-small w3-right todostateselectorspan w3-tooltip"><i class="fa fa-clock-o"></i>' + workedTime + ' ' + currTodoStateSelector + ' <span style="position:absolute;right:0;bottom:24px;" class="w3-text w3-tag w3-padding-small w3-round highlight tooltiptextspan">' + todoWorkPricePerHourTooltip + ' <i class="fa fa-clock-o"></i>' + workedTime2 + '</span> ' + todoWorkPriceSpan + ' </span><div id="todo-' + projectID + '-' + d._id + '" class="w3-container w3-hide">' + md.render(d._todoDesc) + '</div></li>';
            countUpIntervals.push(d._id + '_' + 0);
            break;
          default:
            // error
            todoStateIcon = '<i class="fa fa-warning w3-text-red"></i>';
            todoStateColor = 'w3-hover-text-red';
            countUpIntervals.push(d._id + '_' + 0);
            break;
        }

        document.getElementById('todoAllList').innerHTML += '<li id="todoli-' + d._id + '-inall" class="w3-animate-bottom w3-clear todoli ' + todoStateColor + '"><button onclick="toggleShowTodoNote(\'todo-' + projectID + '-' + d._id + '-inall\');" class="w3-button w3-block w3-left-align todoshowhidedescbutton ' + todoStateColor + '">' + todoStateIcon + ' ' + d._todo + '<span id="todocounterspan-' + d._id + '-inall" class="w3-small w3-tag w3-center w3-round todocounterspan ' + todoCounterStateColor + '"></span></button>' + todoPriority + '<span class="w3-small w3-right todostateselectorspan w3-tooltip"><i class="fa fa-clock-o"></i>' + workedTime + ' ' + currTodoStateSelector + ' <span style="position:absolute;right:0;bottom:24px;" class="w3-text w3-tag w3-padding-small w3-round highlight tooltiptextspan">' + todoWorkPricePerHourTooltip + ' <i class="fa fa-clock-o"></i>' + workedTime2 + '</span> ' + todoWorkPriceSpan + ' </span> <div id="todo-' + projectID + '-' + d._id + '-inall" class="w3-container w3-hide">' + md.render(d._todoDesc) + '</div></li>';

      });

      setTimeout( () => { todoLoader.outerHTML = ''; }, 200);

      if (projectID === 0) {

        todoInput.placeholder = 'New todo without project';
        currProjectId = 0;
        store.set('activity.currProjectId', 0);
        setActiveProject();

      } else {

        projectsDB.find({_id: projectID}).exec(function (err, docs) {
          docs.forEach(function(d) {

            todoInput.placeholder = 'New todo to project: ' + d._name;
            currProjectId = d._id;
            store.set('activity.currProjectId', d._id);
            setActiveProject();

          });
        });

      }

    });

  });

}

function saveTodoListener(event, todo)  {

  if (event.keyCode === 13) {
    saveTodo(todo, currProjectId);
    todoInput.value = '';
    w3.addStyle('#createTodoModal', 'display', 'none');
  }

}

function saveTodo(todo, projectId) {

  todosDB.find({}).sort({ _id: -1 }).limit(1).exec(function (err, docs) {

    let newid = 0;

    docs.forEach(function(doc) {
      newid = doc._id + 1;
    });

    if (newid === 0) {
      newid = 1;
    }

    let newtodoArr = [];

    let newtodoObj = {
      _id: newid,
      _projectId: projectId,
      _todo: todo,
      _stateId: 3,
      _priority: 2,
      _todoDesc: '',
      _time: 0,
      _workstart: 0
    };

    newtodoArr.push(newtodoObj);

    todosDB.insert(newtodoArr, function(err, docs) {
      getTodos(projectId);
    });

  });

}

function updateTodoState(todoID, todoState) {

  updateTodoWorkTime(todoID)
  .then( () => {
    if (todoState === 1 || todoState === 2) {
      todosDB.update({ _id: todoID }, { $set: { _stateId: todoState, _workstart: Date.now() } }, function (err, numReplaced) {
        getTodos(currProjectId);
      });
    } else {
      todosDB.update({ _id: todoID }, { $set: { _stateId: todoState } }, function (err, numReplaced) {
        getTodos(currProjectId);
        projectsJS.getProjects(currProjectId);
      });
    }

  })
  .catch( err => {
    alert(err);
  });

}

function updateTodoPriority(todoID, todoPriority) {

  todosDB.update({ _id: todoID }, { $set: { _priority: todoPriority } }, function (err, numReplaced) {
    getTodos(currProjectId);
  });

}

function updateTodoWorkTime(todoID) {

  return new Promise( (resolve, reject) => {

    let todoWorkTime = 0;
    let todoWorkStart = 0;
    let todoWorkTotal = 0;

    todosDB.find({_id: todoID}).exec(function (err, docs) {
      docs.forEach(function(d) {

        todoWorkTime += d._time;
        todoWorkStart += d._workstart;

        if (todoWorkStart !== 0) {

          let currentWorkTime = Date.now() - todoWorkStart;

          todoWorkTotal = todoWorkTime + currentWorkTime;

          todosDB.update({ _id: todoID }, { $set: { _time: todoWorkTotal, _workstart: 0 } }, function (err, numReplaced) {
            resolve();
          });

        } else {
          resolve();
        }

      });
    });

  });

}

function deleteTodo(todoID) {

  todosDB.remove({ _id: todoID }, function(err, numDeleted) {
    getTodos(currProjectId);
  });

}

/* Todo notes */

function editTodoNote(todoID) {

  todosDB.find({_id: todoID}).exec(function (err, docs) {
    docs.forEach(function(d) {

      currTodoId = todoID;
      store.set('activity.currTodoId', todoID);
      showModal('editTodoNoteModal', 'todoNoteInput');
      todoNoteInput.value = d._todoDesc;

      autosaveInterval = setInterval( () => { editorAutoSave(); }, 10000);

    });
  });

}

function saveTodoNote()  {

  let todoID = currTodoId;
  let todoNote = todoNoteInput.value;

  if (todoID !== 0) {

    todosDB.update({ _id: todoID }, { $set: { _todoDesc: todoNote } }, function (err, numReplaced) {

      clearInterval(autosaveInterval);
      autosaveInterval = null;

      w3.addStyle('#editTodoNoteModal', 'display', 'none');
      todoNoteInput.value = '';
      currTodoId = 0;
      store.set('activity.currTodoId', 0);
      getTodos(currProjectId);

    });

  }

}

/* Todo notes => editor */

function editorMakeText(textOperation)  {

  let selStart = todoNoteInput.selectionStart;
  let selEnd = todoNoteInput.selectionEnd;
  let sel = todoNoteInput.value.substring(selStart, selEnd);

  let todoNoteInputLines = todoNoteInput.value.split("\n");
  let todoNoteInputCurrentLineNumer = todoNoteInput.value.substr(0, selStart).split("\n").length;
  let todoNoteInputCurrentLineNumerIdx = todoNoteInputCurrentLineNumer - 1;
  let todoNoteInputLine = todoNoteInputLines[todoNoteInputCurrentLineNumerIdx];

  let newText = '';
  let jumpNum = 0;

  switch (textOperation) {
    case 'bold':
      newText = todoNoteInput.value.substring(0, selStart) + '**' + sel + '**' + todoNoteInput.value.substring(selEnd);
      (sel === '') ? jumpNum = 2 : jumpNum = 4;
      break;
    case 'italic':
      newText = todoNoteInput.value.substring(0, selStart) + '*' + sel + '*' + todoNoteInput.value.substring(selEnd);
      (sel === '') ? jumpNum = 1 : jumpNum = 2;
      break;
    case 'header':
      let hashmarksCount = (todoNoteInputLine.match(/#/g) || []).length;
      /* switch circle 1-6 */
      if (hashmarksCount === 0) {

        if (todoNoteInputLine === '') {
          newText = todoNoteInput.value.substring(0, selStart) + '# ' + sel + todoNoteInput.value.substring(selEnd);
        } else {
          newText = todoNoteInput.value.replace(todoNoteInputLine, '# ' + todoNoteInputLine);
        }
        jumpNum = 2;

      } else {

        if (hashmarksCount < 6) {

          if (todoNoteInputLine === '# ' || todoNoteInputLine === '## ' || todoNoteInputLine === '### ' || todoNoteInputLine === '#### ' || todoNoteInputLine === '##### ') {
            newText = todoNoteInput.value.substring(0, selStart - 1) + '# ' + sel + todoNoteInput.value.substring(selEnd);
          } else {
            newText = todoNoteInput.value.replace(todoNoteInputLine, '#' + todoNoteInputLine);
          }
          jumpNum = 1;

        } else {
          // 6
          let clearHeadsInTodoNoteInputLine = todoNoteInputLine.replace('###### ', '');
          newText = todoNoteInput.value.replace(todoNoteInputLine, clearHeadsInTodoNoteInputLine);
          jumpNum = -7;
        }

      }
      break;
    case 'blockquote':
      newText = todoNoteInput.value.substring(0, selStart) + '> ' + sel + todoNoteInput.value.substring(selEnd);
      jumpNum = 2;
      break;
    case 'link':
      newText = todoNoteInput.value.substring(0, selStart) + '<a href="#" onclick="openExternallink(\'' + sel + '\')">' + sel + '</a>' + todoNoteInput.value.substring(selEnd);
      (sel === '') ? jumpNum = 39 + sel.length : jumpNum = 43 + sel.length;
      break;
    case 'img':
      newText = todoNoteInput.value.substring(0, selStart) + '![Alt title](' + sel + ')' + todoNoteInput.value.substring(selEnd);
      (sel === '') ? jumpNum = 11 : jumpNum = 11 - sel.length;
      break;
    case 'code':
      newText = todoNoteInput.value.substring(0, selStart) + '```\n' + sel + '\n```' + todoNoteInput.value.substring(selEnd);
      jumpNum = 4;
      break;
    case 'ol':
      let orderedlist = '1. ' + sel + '\n2. \n3. \n4. \n5. ';
      newText = todoNoteInput.value.substring(0, selStart) + orderedlist + todoNoteInput.value.substring(selEnd);
      (sel === '') ? jumpNum = 3 : jumpNum = 7;
      break;
    case 'ul':
      let unorderedlist = '- ' + sel + '\n- \n- \n- \n- ';
      newText = todoNoteInput.value.substring(0, selStart) + unorderedlist + todoNoteInput.value.substring(selEnd);
      (sel === '') ? jumpNum = 2 : jumpNum = 5;
      break;
    case 'cblist':
      let cblist = '- [ ] ' + sel + '\n- [ ] \n- [ ] \n- [ ] \n- [ ] ';
      newText = todoNoteInput.value.substring(0, selStart) + cblist + todoNoteInput.value.substring(selEnd);
      (sel === '') ? jumpNum = 6 : jumpNum = 13;
      break;
    case 'hr':
      newText = todoNoteInput.value.substring(0, selStart) + sel + '-----' + todoNoteInput.value.substring(selEnd);
      jumpNum = 5;
      break;
    case 'table':
      let table = '|title1|title2|\n|---|---|\n|col1|col2|\n|col3|col4|';
      newText = todoNoteInput.value.substring(0, selStart) + table + todoNoteInput.value.substring(selEnd);
      jumpNum = 7;
      break;
  }

  todoNoteInput.value = newText;
  todoNoteInput.focus();
  todoNoteInput.selectionEnd= selEnd + jumpNum;

}

function editorAutoSave()  {

  let todoID = currTodoId;
  let todoNote = todoNoteInput.value;

  if (todoID !== 0) {

    todosDB.update({ _id: todoID }, { $set: { _todoDesc: todoNote } }, function (err, numReplaced) {
      console.log('Note (auto) saved.');
    });

  }

}

function updateTodoStateToIdle(todoID) {

  todosDB.update({ _id: todoID }, { $set: { _stateId: 3 } });

}

function getTodoText(todoID) {

  let todoTextsLis = '';

  todosDB.find({_id: todoID}).exec(function (err, docs) {
    docs.forEach(function(d) {

      todoTextsLis += '<li>' + d._todo + '</li>';

    });
  });

}

function addWorkPriceToTodoListener(event, todoPrice)  {

  if (event.keyCode === 13) {
    addWorkPriceToTodo(document.getElementById('todoWorkPriceTodoIDInput').value, todoPrice);
    document.getElementById('todoWorkPriceTodoIDInput').value = '0';
    document.getElementById('todoWorkPriceInput').value = '';
    w3.addStyle('#updateTodoWorkPriceModal', 'display', 'none');
  }

}

function addWorkPriceToTodo(todoID, todoPrice) {

  todosDB.find({_id: parseInt(todoID)}).sort({ _id: -1 }).limit(1).exec(function (err, docs) {

    docs.forEach(function(doc) {

      let projectID = doc._projectId;
      let todoName = doc._todo;
      let todoStateID = doc._stateId;
      let todoPriority = doc._priority;
      let todoDesc = doc._todoDesc;
      let todoTime = doc._time;
      let todoWorkStart = doc._workstart;
      let todoPriceOld = doc._pricePerHour;

      if (todoPriceOld === undefined || todoPriceOld === null) {

        todosDB.update({ _id: parseInt(todoID) }, {
          _id: parseInt(todoID),
          _projectId: parseInt(projectID),
          _todo: todoName,
          _stateId: parseInt(todoStateID),
          _priority: parseInt(todoPriority),
          _todoDesc: todoDesc,
          _time: parseInt(todoTime),
          _workstart: parseInt(todoWorkStart),
          _pricePerHour: parseInt(todoPrice)
        }, { upsert: true }, function (err, numReplaced) {
          setTimeout ( () => {document.location.href='index.html';},500);
        });

      } else {

        todosDB.update({ _id: parseInt(todoID) }, { $set: { _pricePerHour: parseInt(todoPrice) }, }, {}, function (err, numReplaced) {
          setTimeout ( () => {document.location.href='index.html';},500);
        });

      }

    });

  });

}

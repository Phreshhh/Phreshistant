module.exports = {
  getProjects,
  saveProjectListener,
  updateProjectState,
  getProjectPricePerHour,
  addWorkPriceToProjectListener,
  deleteProject
};
/*
  Project States:

  Processing (1) [play]
  Testing (2) [heartbeat]
  Freeze (3) [bolt]
  Idea (4) [lightbulb]
  Notes (5) [fa-pencil-square]
  Stoppped (6) [stop]
  Finished (7) [flag]
  Deleted (x) [times]
*/
let projectStateSelector = `
<i class="fa fa-caret-down w3-dropdown-hover" style="background-color:transparent;" onmouseover="disableTooltips();" onmouseleave="allowTooltips();">
  <div class="w3-dropdown-content w3-bar-block w3-border w3-animate-right w3-right">
    <a href="#" onclick="projectsJS.updateProjectState(_PROJECTID_, 1);" class="w3-bar-item w3-button w3-button-app w3-text-blue stateselectorbutton">
      <i class="fa fa-play"></i>
      Run
    </a>
    <a href="#" onclick="projectsJS.updateProjectState(_PROJECTID_, 2);" class="w3-bar-item w3-button w3-button-app w3-text-orange stateselectorbutton">
      <i class="fa fa-heartbeat"></i>
      Test
    </a>
    <a href="#" onclick="projectsJS.updateProjectState(_PROJECTID_, 3);" class="w3-bar-item w3-button w3-button-app w3-text-gray stateselectorbutton">
      <i class="fa fa-bolt"></i>
      Freeze
    </a>
    <a href="#" onclick="projectsJS.updateProjectState(_PROJECTID_, 7);" class="w3-bar-item w3-button w3-button-app w3-text-green stateselectorbutton">
      <i class="fa fa-flag-checkered"></i>
      Finish
    </a>
    <a href="#" onclick="projectsJS.updateProjectState(_PROJECTID_, 6);" class="w3-bar-item w3-button w3-button-app w3-text-red stateselectorbutton">
      <i class="fa fa-stop"></i>
      Stop (kill)
    </a>
    <a href="#" onclick="projectsJS.updateProjectState(_PROJECTID_, 5);" class="w3-bar-item w3-button w3-button-app w3-text-teal stateselectorbutton">
      <i class="fa fa-pencil-square-o"></i>
      Notes
    </a>
    <hr class="stateselectorseparator" />
    <a href="#" onclick="document.getElementById('projectWorkPriceProjectIDInput').value = '_PROJECTID_';showModal('updateProjectWorkPriceModal', 'projectWorkPriceInput');" class="w3-bar-item w3-button w3-button-app w3-text-black stateselectorbutton">
      <i class="fa fa-money"></i>
      Workprice
    </a>
    <hr class="stateselectorseparator" />
    <a href="#" onclick="projectsJS.deleteProject(_PROJECTID_);" class="w3-bar-item w3-button w3-button-app w3-text-black stateselectorbutton">
      <i class="fa fa-times"></i>
      Delete
    </a>
  </div>
</i>`;

function getProjects() {

  document.getElementById('projectView').innerHTML += '<i id="projectLoader" class="fa fa-spinner fa-pulse"></i>';
  document.getElementById('projectList').innerHTML = '';

  let projectStateIcon;
  let projectStateColor;

  projectsDB.find({}).sort({ _stateId: 1 }).exec(function (err, docs) {
    docs.forEach(function(d) {

      let projectWorkTime = 0;
      let projectWorkTime2 = 0;
      let projectPricePerHour = 0;
      let projectWorkPrice = 0;
      let projectWorkPriceSpan = '';
      let projectWorkPricePerHourTooltip = '';

      if (d._pricePerHour !== undefined && d._pricePerHour !== null && d._pricePerHour != '0') {
        projectPricePerHour = parseInt(d._pricePerHour);
      }

      getProjectWorkedTime(d._id, projectPricePerHour)
      .then( (todoworkdata) => {

        let todoworkdataParts = todoworkdata.split('|||');
        let todotimes = parseInt(todoworkdataParts[0]);
        let todoprices = parseInt(todoworkdataParts[1]);

        projectWorkTime = formatWorkTime(0, todotimes);
        projectWorkTime2 = formatWorkTime2(0, todotimes);

        if (projectPricePerHour !== 0) {

          projectWorkPrice = getWorkPrice(0, todotimes, projectPricePerHour);

          if (projectWorkPrice > 0) {
            projectWorkPriceSpan = '<span class="w3-small w3-left w3-margin-right"><i class="fa fa-money"></i> ' + projectWorkPrice.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.") + ' </span>';
          }

          projectWorkPricePerHourTooltip = '<i class="fa fa-money"></i>' + projectPricePerHour + '/h ';

        }

        if (todoprices !== 0) {

          if (todoprices !== projectWorkPrice) {
            projectWorkPriceSpan = '<span class="w3-small w3-left w3-margin-right"><i class="fa fa-money"></i> ' + todoprices.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.") + ' </span>';
          }

        }

        switch(d._stateId) {
          case 1:
            projectStateIcon = '<i class="fa fa-play w3-text-blue"></i>';
            projectStateColor = 'w3-hover-text-blue';
            break;
          case 2:
            projectStateIcon = '<i class="fa fa-heartbeat w3-text-orange"></i>';
            projectStateColor = 'w3-hover-text-orange';
            break;
          case 3:
            projectStateIcon = '<i class="fa fa-bolt w3-text-gray"></i>';
            projectStateColor = 'w3-hover-text-white';
            break;
          case 4:
            projectStateIcon = '<i class="fa fa-lightbulb-o w3-text-amber"></i>';
            projectStateColor = 'w3-hover-text-amber';
            break;
          case 5:
            projectStateIcon = '<i class="fa fa-pencil-square-o w3-text-teal"></i>';
            projectStateColor = 'w3-hover-text-teal';
            break;
          case 6:
            projectStateIcon = '<i class="fa fa-stop w3-text-red"></i>';
            projectStateColor = 'w3-hover-text-red';
            break;
          case 7:
            projectStateIcon = '<i class="fa fa-flag-checkered w3-text-green"></i>';
            projectStateColor = 'w3-hover-text-green';
            break;
          default:
            // error
            projectStateIcon = '<i class="fa fa-warning w3-text-red"></i>';
            projectStateColor = 'w3-hover-text-red';
            break;
        }

        let currProjectStateSelector = projectStateSelector.replace(new RegExp('_PROJECTID_', 'g'), d._id);

        document.getElementById('projectList').innerHTML += '<li id="projectli-' + d._id + '" class="w3-animate-left w3-clear clickable projectli ' + projectStateColor + '" onclick="todosJS.getTodos(' + d._id + ');">' + projectStateIcon + ' ' + d._name + '<span class="w3-small w3-right projectstateselectorspan w3-tooltip"><i class="fa fa-clock-o"></i>' + projectWorkTime + ' ' + currProjectStateSelector + ' <span style="position:absolute;right:0;bottom:20px;" class="w3-text w3-tag w3-padding-small w3-round highlight tooltiptextspan">' + projectWorkPricePerHourTooltip + '<i class="fa fa-clock-o"></i>' + projectWorkTime2 + '</span> ' + projectWorkPriceSpan + ' </span></li>';

      })
      .catch( err => {
        alert(err);
      });

    });
    setTimeout( () => { projectLoader.outerHTML = ''; }, 200);
  });

}
getProjects();

function saveProjectListener(event, projectName)  {

  if (event.keyCode === 13) {
    saveProject(projectName);
    document.getElementById('projectNameInput').value = '';
    w3.addStyle('#createProjectModal', 'display', 'none');
  }

}

function saveProject(projectName) {

  projectsDB.find({}).sort({ _id: -1 }).limit(1).exec(function (err, docs) {

    let newid = 0;

    docs.forEach(function(doc) {
      newid = doc._id + 1;
    });

    if (newid === 0) {
      newid = 1;
    }

    let newprojectArr = [];

    let newprojectObj = {
      _id: newid,
      _name: projectName,
      _stateId: 4
    };

    newprojectArr.push(newprojectObj);

    projectsDB.insert(newprojectArr, function(err, docs) {
      getProjects();
    });

  });

}

function updateProjectState(projectID, projectState) {

  projectsDB.update({ _id: projectID }, { $set: { _stateId: projectState } }, function (err, numReplaced) {
    getProjects();
  });

}

function getProjectPricePerHour(projectID) {

  return new Promise( (resolve, reject) => {

    let projectPricePerHour = 0;

    projectsDB.find({_id: parseInt(projectID)}).sort({ _id: -1 }).limit(1).exec(function (err, docs) {

      docs.forEach(function(doc) {

        if (doc._pricePerHour !== undefined && doc._pricePerHour !== null) {
          projectPricePerHour = parseInt(doc._pricePerHour);
        }

      });

      resolve(projectPricePerHour);

    });

  });

}

function addWorkPriceToProjectListener(event, projectPrice)  {

  if (event.keyCode === 13) {
    addWorkPriceToProject(document.getElementById('projectWorkPriceProjectIDInput').value, projectPrice);
    document.getElementById('projectWorkPriceProjectIDInput').value = '0';
    document.getElementById('projectWorkPriceInput').value = '';
    w3.addStyle('#updateProjectWorkPriceModal', 'display', 'none');
  }

}

function addWorkPriceToProject(projectID, projectPrice) {

  projectsDB.find({_id: parseInt(projectID)}).sort({ _id: -1 }).limit(1).exec(function (err, docs) {

    docs.forEach(function(doc) {

      let projectName = doc._name;
      let projectPriceOld = doc._pricePerHour;
      let projectStateID = doc._stateId;

      if (projectPriceOld === undefined || projectPriceOld === null) {

        projectsDB.update({ _id: parseInt(projectID) }, {
          _id: parseInt(projectID),
          _name: projectName,
          _stateId: parseInt(projectStateID),
          _pricePerHour: parseInt(projectPrice)
        }, { upsert: true }, function (err, numReplaced) {
          setTimeout ( () => {document.location.href='index.html';},500);
        });

      } else {

        projectsDB.update({ _id: parseInt(projectID) }, { $set: { _pricePerHour: parseInt(projectPrice) }, }, {}, function (err, numReplaced) {
          setTimeout ( () => {document.location.href='index.html';},500);
        });

      }

    });

  });

}

function deleteProject(projectID) {

  projectsDB.remove({ _id: projectID }, function(err, numDeleted) {
    todosDB.remove({ _projectId: projectID }, { multi: true }, function(err, numDeleted) {

      currProjectId = 0;
      currTodoId = 0;
      store.set('activity.currProjectId', 0);
      store.set('activity.currTodoId', 0);
      setTimeout ( () => {document.location.href='index.html';},500);

    });

  });

}

function getProjectWorkedTime(projectID, projectPrice) {

  return new Promise( (resolve, reject) => {

    let todoWorkTime = 0;
    let todoWorkPrice = 0;
    let todoWorkData = '';

    todosDB.find({_projectId: projectID}).exec(function (err, docs) {
      docs.forEach(function(d) {

        todoWorkTime += d._time;

        if (d._pricePerHour !== undefined && d._pricePerHour !== null && d._pricePerHour != '0') {
          todoWorkPrice += getWorkPrice(0, d._time, d._pricePerHour);
        } else {
          todoWorkPrice += getWorkPrice(0, d._time, projectPrice);
        }

      });
      todoWorkData = todoWorkTime + '|||' + todoWorkPrice;
      resolve(todoWorkData);
    });

  });

}

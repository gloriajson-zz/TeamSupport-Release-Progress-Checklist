// ==UserScript==
// @name         TeamSupport XML Release Progress
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  creates a checklist of stages in a release with Planned and Actual Dates and Status options
// @author       Gloria
// @grant        none
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Dashboard*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/TicketTabs*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Tasks*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/KnowledgeBase*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Wiki*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Search*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/WaterCooler*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Calendar*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/User*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Groups*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Customer*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Asset*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Products*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Inventory*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Report*
// @exclude      https://app.teamsupport.com/vcr/*/TicketPreview*
// @exclude      https://app.teamsupport.com/vcr/*/Images*
// @exclude      https://app.teamsupport.com/vcr/*/images*
// @exclude      https://app.teamsupport.com/vcr/*/Audio*
// @exclude      https://app.teamsupport.com/vcr/*/Css*
// @exclude      https://app.teamsupport.com/vcr/*/Js*
// @exclude      https://app.teamsupport.com/Services*
// @exclude      https://app.teamsupport.com/frontend*
// @exclude      https://app.teamsupport.com/Frames*
// @match        https://app.teamsupport.com/vcr/*/Pages/ProductVersionDetail*

// ==/UserScript==

// constants
var url = "https://app.teamsupport.com/api/xml/";
var orgID = "";
var token = "";
var xhr = new XMLHttpRequest();
var parser = new DOMParser();

document.addEventListener('DOMContentLoaded', main(), false);

function main(){
  if(document.getElementsByClassName('btn-group') != null){
    var group = document.getElementsByClassName('btn-group')[1];
    var groupbtn = document.createElement("button");
    groupbtn.className = "btn btn-default product-version-tooltip";
    groupbtn.setAttribute("type", "button");
    groupbtn.setAttribute("data-toggle", "tooltip");
    groupbtn.setAttribute("data-placement", "bottom");
    groupbtn.setAttribute("title", 'Create version release checklist');
    groupbtn.setAttribute("id", "productVersionChecklist");
    groupbtn.setAttribute("data-original-title", "Create version release checklist");
    var i = document.createElement("i");
    i.className = "fa fa-check-square-o";
    groupbtn.appendChild(i);
    group.appendChild(groupbtn);

    groupbtn.addEventListener('click', function(e){
      createAsset();
    });
  }

  if(document.getElementById('productVersionTabs')!=null){
    var toolbar = document.getElementById('productVersionTabs');
    var button = document.createElement("li");
    var a = document.createElement("a");
    a.setAttribute("href", "#product-version-checklist");
    a.setAttribute("data-toggle", "tab");
    a.appendChild(document.createTextNode("Release Checklist"));
    button.appendChild(a);
    toolbar.appendChild(button);

    button.addEventListener('click', function(e){
      if(document.getElementById("product-version-checklist") != null){
        var element = document.getElementById("product-version-checklist");
        element.parentNode.removeChild(element);
      }
      e.preventDefault();
      createTabContent();
    });
  }
}

function createAsset(){
  console.log("creating a checklist asset...");
  var name = document.getElementById("productVersionNumber").innerHTML;
  var last = name.lastIndexOf("-");
  var productName = name.substring(0, last);
  var versionName = name.substring(last+2);
  var productID = getProductId(productName, versionName);
  var asset = getAssetFields(productID, versionName);

  //if release checklist doesn't exist then create a new one
  if(asset.getElementsByTagName("Asset").length == 0){
    var queryURL = url + "Assets";
    var data = "<Asset><ProductID>" + productID + "</ProductID><ProductVersionNumber>" + versionName + "</ProductVersionNumber><Name>Release Checklist</Name></Asset>";
    var xmlData = parser.parseFromString(data,"text/xml");
    xhr.open("POST", queryURL, false, orgID, token);
    xhr.send(xmlData);
    alert("Release Checklist created!");
  }else{
    alert("Release Checklist already exists for this product version!");
  }
}

function createTabContent(){
  console.log("creating tab content and initializing fields...");
  if(document.getElementsByClassName("tab-content")){
    var tabContent = document.getElementsByClassName("tab-content")[0];
    var div = document.createElement("div");
    div.setAttribute("class", "tab-pane fade");
    div.id = "product-version-checklist";

    var divRow = document.createElement("div");
    divRow.setAttribute("class", "row");
    var divCol = document.createElement("div");
    divCol.setAttribute("class", "col-xs-12");

    var name = document.getElementById("productVersionNumber").innerHTML;
    var last = name.lastIndexOf("-");
    var productName = name.substring(0, last);
    var versionName = name.substring(last+2);
    var productID = getProductId(productName, versionName);
    var asset = getAssetFields(productID, versionName);

    try{
      var assetID = asset.getElementsByTagName("AssetID")[0].innerHTML;
    }catch(e){
      alert("Release Checklist doesn't exist or there's an error with the TeamSupport server.");
    }
  //create objects from xml response
    var statusFields = {
      AllocateTickets: asset.getElementsByTagName("AllocateTickets"),
      CodeFreeze: asset.getElementsByTagName("CodeFreeze"),
      CreateAndUpdateTrello: asset.getElementsByTagName("CreateAndUpdateTrello"),
      UpdateTickets: asset.getElementsByTagName("UpdateTickets"),
      IssueFollowup: asset.getElementsByTagName("IssueFollowup"),
      ReleaseAnnouncement: asset.getElementsByTagName("ReleaseAnnouncement"),
      ScheduleInternalWebcast: asset.getElementsByTagName("ScheduleInternalWebcast"),
      ScheduleExternalWebcast: asset.getElementsByTagName("ScheduleExternalWebcast"),
      InstallGuide: asset.getElementsByTagName("InstallGuide"),
      UserGuide: asset.getElementsByTagName("UserGuide"),
      TrainingGuide: asset.getElementsByTagName("TrainingGuide"),
      OnlineHelp: asset.getElementsByTagName("OnlineHelp"),
      NewFeaturesDocument: asset.getElementsByTagName("NewFeaturesDocument"),
      ReleaseNotes: asset.getElementsByTagName("ReleaseNotes"),
      InternalWebcast: asset.getElementsByTagName("InternalWebcast"),
      CustomerWebcast: asset.getElementsByTagName("CustomerWebcast"),
      CheckCustomizationsList: asset.getElementsByTagName("CheckCustomizationsList"),
      CloseAndUpdateTicketsPostRelease: asset.getElementsByTagName("CloseAndUpdateTicketsPostRelease"),
      SendEmailOnGA: asset.getElementsByTagName("SendEmailOnGA"),
      CreateVersionMetrics: asset.getElementsByTagName("CreateVersionMetrics"),
    }

    var plannedDates = {
      AllocateTickets: asset.getElementsByTagName("AllocateTicketsPlanned"),
      CodeFreeze: asset.getElementsByTagName("CodeFreezePlanned"),
      CreateAndUpdateTrello: asset.getElementsByTagName("CreateAndUpdateTrelloPlanned"),
      UpdateTickets: asset.getElementsByTagName("UpdateTicketsPlanned"),
      IssueFollowup: asset.getElementsByTagName("IssueFollowupPlanned"),
      ReleaseAnnouncement: asset.getElementsByTagName("ReleaseAnnouncementPlanned"),
      ScheduleInternalWebcast: asset.getElementsByTagName("ScheduleInternalWebcastPlanned"),
      ScheduleExternalWebcast: asset.getElementsByTagName("ScheduleExternalWebcastPlanned"),
      InstallGuide: asset.getElementsByTagName("InstallGuidePlanned"),
      UserGuide: asset.getElementsByTagName("UserGuidePlanned"),
      TrainingGuide: asset.getElementsByTagName("TrainingGuidePlanned"),
      OnlineHelp: asset.getElementsByTagName("OnlineHelpPlanned"),
      NewFeaturesDocument: asset.getElementsByTagName("NewFeaturesDocumentPlanned"),
      ReleaseNotes: asset.getElementsByTagName("ReleaseNotesPlanned"),
      InternalWebcast: asset.getElementsByTagName("InternalWebcastPlanned"),
      CustomerWebcast: asset.getElementsByTagName("CustomerWebcastPlanned"),
      CheckCustomizationsList: asset.getElementsByTagName("CheckCustomizationsListPlanned"),
      CloseAndUpdateTicketsPostRelease: asset.getElementsByTagName("CloseAndUpdateTicketsPostReleasePlanned"),
      SendEmailOnGA: asset.getElementsByTagName("SendEmailOnGAPlanned"),
      CreateVersionMetrics: asset.getElementsByTagName("CreateVersionMetricsPlanned"),
    }

    var actualDates = {
      AllocateTickets: asset.getElementsByTagName("AllocateTicketsActual"),
      CodeFreeze: asset.getElementsByTagName("CodeFreezeActual"),
      CreateAndUpdateTrello: asset.getElementsByTagName("CreateAndUpdateTrelloActual"),
      UpdateTickets: asset.getElementsByTagName("UpdateTicketsActual"),
      IssueFollowup: asset.getElementsByTagName("IssueFollowupActual"),
      ReleaseAnnouncement: asset.getElementsByTagName("ReleaseAnnouncementActual"),
      ScheduleInternalWebcast: asset.getElementsByTagName("ScheduleInternalWebcastActual"),
      ScheduleExternalWebcast: asset.getElementsByTagName("ScheduleExternalWebcastActual"),
      InstallGuide: asset.getElementsByTagName("InstallGuideActual"),
      UserGuide: asset.getElementsByTagName("UserGuideActual"),
      TrainingGuide: asset.getElementsByTagName("TrainingGuideActual"),
      OnlineHelp: asset.getElementsByTagName("OnlineHelpActual"),
      NewFeaturesDocument: asset.getElementsByTagName("NewFeaturesDocumentActual"),
      ReleaseNotes: asset.getElementsByTagName("ReleaseNotesActual"),
      InternalWebcast: asset.getElementsByTagName("InternalWebcastActual"),
      CustomerWebcast: asset.getElementsByTagName("CustomerWebcastActual"),
      CheckCustomizationsList: asset.getElementsByTagName("CheckCustomizationsListActual"),
      CloseAndUpdateTicketsPostRelease: asset.getElementsByTagName("CloseAndUpdateTicketsPostReleaseActual"),
      SendEmailOnGA: asset.getElementsByTagName("SendEmailOnGAActual"),
      CreateVersionMetrics: asset.getElementsByTagName("CreateVersionMetricsActual"),
    }

    var box = createCard(statusFields, plannedDates, actualDates, versionName, productID, assetID);
    divCol.appendChild(box);

    divRow.appendChild(divCol);
    div.appendChild(divRow);
    tabContent.appendChild(div);
  }
}

function createCard(statusFields, plannedDates, actualDates, versionName, productID, assetID){
  console.log("creating card for version...");
  //create white box card that contains information on 1 version
  var box = document.createElement("div");
  box.setAttribute("class", "box");
  var boxHeader = document.createElement("div");
  boxHeader.setAttribute("class", "box-header");
  var header = document.createElement("h4");
  header.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + versionName;
  header.setAttribute("style", "display:inline-block;");

  var tb = document.createElement("div");
  tb.className = "btn-toolbar pull-right";
  //create save button
  var save = document.createElement("button");
  save.innerHTML = "Save Changes";
  save.className = "btn btn-primary";
  save.setAttribute("style", "float:right");
  save.setAttribute("type", "button");

  save.addEventListener('click', function(e){
    e.preventDefault();
    updateList(statusFields, plannedDates, actualDates, assetID);
  });

  //create field removal button
  var remove = document.createElement("button");
  remove.innerHTML = "Remove Fields";
  remove.className = "btn btn-danger";
  remove.setAttribute("style", "float:right");
  remove.setAttribute("type", "button");

  remove.addEventListener('click', function(e){
    e.preventDefault();
    removeFields(assetID, statusFields);
  });

  //create field removal button and modal
  var edit = document.createElement("button");
  edit.innerHTML = "Retrieve Fields";
  edit.className = "btn btn-success";
  edit.setAttribute("style", "float:right");
  edit.setAttribute("type", "button");
  edit.setAttribute("data-toggle", "modal");
  edit.setAttribute("data-target", "#retrieveFields");
  createFieldModal();

  edit.addEventListener('click', function(e){
    e.preventDefault();
    var sel = document.getElementById('retrieve-fields-body');
    if(sel) sel.innerHTML = "";
    retrieveFields(statusFields, assetID);
  });

  var boxContent = document.createElement("div");
  boxContent.setAttribute("class", "box-content");
  var boxRow = document.createElement("div");
  boxRow.setAttribute("class", "row");
  var boxCol = document.createElement("div");
  boxCol.setAttribute("class", "col-md-12");

  var fields = createTable(statusFields, plannedDates, actualDates, versionName);

  boxHeader.appendChild(header);
  tb.appendChild(edit);
  tb.appendChild(remove);
  tb.appendChild(save);
  boxHeader.appendChild(tb);
  console.log(boxHeader);
  boxCol.appendChild(fields);
  boxRow.appendChild(boxCol);
  boxContent.appendChild(boxRow);
  box.appendChild(boxHeader);
  box.appendChild(boxContent);
  return box;
}

function createFieldModal(){
    // create Retrieve Fields modal pop up
    var modal = document.createElement("div");
    modal.className = "modal fade";
    modal.setAttribute("id", "retrieveFields");
    modal.role = "dialog";
    modal.setAttribute("tabindex", -1);
    modal.setAttribute("aria-labelledby", "retrieveFieldsModal");
    modal.setAttribute("aria-hidden", true);
    document.body.appendChild(modal);

    var modalDialog = document.createElement("div");
    modalDialog.className = "modal-dialog";
    modalDialog.setAttribute("role","document");
    modal.appendChild(modalDialog);

    var modalContent = document.createElement("div");
    modalContent.className = "modal-content";
    modalDialog.appendChild(modalContent);

    //create modal header
    var modalHeader = document.createElement("div");
    modalHeader.className = "modal-header";
    modalContent.appendChild(modalHeader);

    // create header title
    var header = document.createElement("h4");
    header.className = "modal-title";
    var hText = document.createTextNode("Retrieve Fields");
    header.appendChild(hText);
    modalHeader.appendChild(header);

    // create header close button
    var hbutton = document.createElement("button");
    hbutton.setAttribute("type", "button");
    hbutton.className = "close";
    hbutton.setAttribute("data-dismiss", "modal");
    hbutton.setAttribute("aria-label", "Close");
    var span = document.createElement("span");
    span.setAttribute("aria-hidden", true);
    span.innerHTML = "&times;";
    hbutton.appendChild(span);
    header.appendChild(hbutton);

    // create modal body
    var modalBody = document.createElement("div");
    modalBody.className="modal-body";
    modalBody.id = "retrieve-fields-body";
    var modalParagraph = document.createElement("p");
    modalParagraph.id = "retrieve-fields-paragraph";
    modalContent.appendChild(modalBody);

    //create modal footer
    var modalFooter = document.createElement("div");
    modalFooter.className = "modal-footer";
    modalContent.appendChild(modalFooter);

    // create save and close buttons in modal footer
    var sbtn = document.createElement("button");
    var save = document.createTextNode("Retrieve Fields");
    sbtn.appendChild(save);
    sbtn.id = "save-btn-retrieve-fields";
    sbtn.type = "button";
    sbtn.setAttribute("data-dismiss", "modal");
    sbtn.className = "btn btn-primary";
    var cbtn = document.createElement("button");
    var close = document.createTextNode("Close");
    cbtn.appendChild(close);
    cbtn.type = "button";
    cbtn.className = "btn btn-secondary";
    cbtn.setAttribute("data-dismiss", "modal");
    modalFooter.appendChild(sbtn);
    modalFooter.appendChild(cbtn);
}

function retrieveFields(statusFields, assetID){
    console.log("retrieveFields function...");
    var body = document.getElementById("retrieve-fields-body");
    var container = document.createElement("div");
    container.className = "container col-md-12";
    var row = document.createElement("div");
    row.className = "row";
    var form = document.createElement("form");
    var switchInd = 0;
    for(var key in statusFields){
        if(statusFields[key][0].innerHTML=="N/a"){
            var label = document.createElement("label");
            label.setAttribute("class", "checkbox-inline col-md-6");
            label.innerHTML = (key.replace(/([A-Z])/g, ' $1').trim()) + "&nbsp&nbsp&nbsp&nbsp";
            var input = document.createElement("input");
            input.setAttribute("type", "checkbox");
            input.setAttribute("class", "control-input col-md-6");
            input.setAttribute("id", key+"checkbox");
            input.setAttribute("value", key);
            label.appendChild(input);
            form.appendChild(label);
            /*var div = document.createElement("div");
            div.setAttribute("class", "custom-control custom-checkbox custom-control-inline");
            var input = document.createElement("input");
            input.setAttribute("type", "checkbox");
            input.setAttribute("class", "custom-control-input");
            input.setAttribute("id", key+"checkbox");
            var label = document.createElement("label");
            label.setAttribute("class", "custom-control-label");
            label.setAttribute("type", "checkbox");
            label.setAttribute("for", key+"checkbox");
            label.setAttribute("style", "font-weight:normal;");
            label.innerHTML = (key.replace(/([A-Z])/g, ' $1').trim());
            div.appendChild(input);
            div.appendChild(label);
            row.appendChild(div);*/

            if(switchInd == 1){
              console.log(form);
              /*console.log(row);
              container.appendChild(row);
              body.appendChild(container);
              row = document.createElement("div");
              row.className = "row";*/
              row.appendChild(form);
              container.appendChild(row);
              body.appendChild(container);
              form = document.createElement("form");
              switchInd = 0;
            }else{
              switchInd++;
            }
        }
    }

    // if Add Contact Save was clicked then send a post request
    document.getElementById('save-btn-retrieve-fields').onclick = function saveVersion() {
        updateFields(assetID);
    }
}

function createTable(statusFields, plannedDates, actualDates, versionName){
  console.log("creating table with grid like data...");
  //create dropdowns
  var div = document.createElement("div");
  div.setAttribute("class", "table-editable col-md-12");

  var table = document.createElement("div");
  table.setAttribute("id", "releaseChecklistTable");
  table.setAttribute("class", "container-fluid");

  //create table headers
  var trh = document.createElement("div");
  trh.setAttribute("class", "row");
  trh.setAttribute("style", "text-align: center; padding:10px");
  var th = document.createElement("div");
  th.className = "col-xs-1 col-sm-1 col-md-2";
  var thplanned = document.createElement("div");
  thplanned.className = "col-xs-3 col-sm-3 col-md-3";
  thplanned.innerHTML = "Planned Date";
  var thactual = document.createElement("div");
  thactual.className = "col-xs-3 col-sm-3 col-md-2";
  thactual.innerHTML = "Actual Date";
  var thstatus = document.createElement("div");
  thstatus.className = "col-xs-4 col-sm-4 col-md-4";
  thstatus.innerHTML = "Status";
  var thremove = document.createElement("div");

  trh.appendChild(th);
  trh.appendChild(thplanned);
  trh.appendChild(thactual);
  trh.appendChild(thstatus);
  table.appendChild(trh);

  //iterate through custom fields and get their values
  for (var key in statusFields) {
    if (statusFields[key][0].innerHTML!="N/a") {
      var trb = document.createElement("div");
      trb.setAttribute("class", "row");
      trb.setAttribute("style", "border-bottom:1px solid #DCDCDC;");
      var plannedDate;
      var actualDate;

      //create non editable labels with dates if status is Complete
      if(statusFields[key][0].innerHTML == "Complete"){
        plannedDate = document.createElement("p");
        plannedDate.setAttribute("class", "form-control-static editable");
        plannedDate.setAttribute("style", "display:block");

        actualDate = document.createElement("p");
        actualDate.setAttribute("class", "form-control-static editable");
        actualDate.setAttribute("style", "display:block");

        if(plannedDates[key][0].innerHTML){
          plannedDate.innerHTML = moment(plannedDates[key][0].innerHTML).utc().format("YYYY-MM-DD");
        }else{
          plannedDate.innterHTML = "Unassigned";
        }

        if(actualDates[key][0].innerHTML){
          actualDate.innerHTML = moment(actualDates[key][0].innerHTML).utc().format("YYYY-MM-DD");
        }else{
          actualDate.innerHTML = "Unassigned";
        }
      }else{
        //create Date fields with calendar dropdowns
        plannedDate = document.createElement("input");
        plannedDate.setAttribute("class", "PlannedDateValues");
        plannedDate.setAttribute("id", key+"Planned");
        plannedDate.setAttribute("type", "date");
        plannedDate.setAttribute("value", moment(plannedDates[key][0].innerHTML).utc().format("YYYY-MM-DD"));

        actualDate = document.createElement("input");
        actualDate.setAttribute("class", "ActualDateValues");
        actualDate.setAttribute("id", key+"Actual");
        actualDate.setAttribute("type", "date");
        actualDate.setAttribute("value", moment(actualDates[key][0].innerHTML).utc().format("YYYY-MM-DD"));
      }

      //format checklist layout
      var checktd = document.createElement("div");
      checktd.className = "col-xs-1 col-sm-1 col-md-1";
      checktd.style.padding = "5px";
      checktd.setAttribute("style", "text-align:right");
      var td = document.createElement("div");
      td.className = "col-xs-1 col-sm-1 col-md-2";
      td.style.padding = "5px";
      var tdplanned = document.createElement("div");
      tdplanned.className = "col-xs-3 col-sm-3 col-md-3";
      tdplanned.style.padding = "5px";
      tdplanned.setAttribute("style", "text-align:center");
      var tdactual = document.createElement("div");
      tdactual.className = "col-xs-3 col-sm-3 col-md-2";
      tdactual.style.padding = "5px";
      tdactual.setAttribute("style", "text-align:center");
      var tdstatus = document.createElement("div");
      tdstatus.className = "col-xs-4 col-sm-4 col-md-4";
      tdstatus.style.padding = "5px";
      tdstatus.setAttribute("style", "text-align:center");

      var check = document.createElement("input");
      check.classname = "form-check-input";
      check.setAttribute("type", "checkbox");
      check.setAttribute("value", "");
      check.setAttribute("id", key+"check");

      //create status dropdown (ensure options only appear once)
      var cfdropdown = document.createElement("div");
      cfdropdown.className = "form-group";
      var cflabel = document.createElement("label");
      cflabel.style.padding = "5px";
      cflabel.setAttribute("for","form-select-"+key);
      cflabel.innerHTML = (key.replace(/([A-Z])/g, ' $1').trim());

      var cfselect = document.createElement("select");
      cfselect.className = "form-control checklist";
      cfselect.setAttribute("id", "form-select-"+key);
      var cfoptions = document.createElement("option");
      cfoptions.innerHTML = statusFields[key][0].innerHTML;
      cfselect.appendChild(cfoptions);
      var statuses = {
        0: "Not Started",
        1: "In Progress",
        2: "Complete",
        3: "N/a",
      }
      var len = statuses.length;

      for(var n in statuses){
        if(statusFields[key][0].innerHTML != statuses[n]){
           var newoptions = document.createElement("option");
           newoptions.innerHTML = statuses[n];
           cfselect.appendChild(newoptions);
        }
      }

      checktd.appendChild(check);
      td.appendChild(cflabel);
      tdplanned.appendChild(plannedDate);
      tdactual.appendChild(actualDate);
      tdstatus.appendChild(cfselect);
      trb.appendChild(td);
      trb.appendChild(tdplanned);
      trb.appendChild(tdactual);
      trb.appendChild(tdstatus);
      trb.appendChild(checktd);
      table.appendChild(trb);
    }
  }
  return table;
}

function getProductId(productName, versionname){
  console.log("getting product id...");
  var queryURL = url + "Products?Name=" + productName;
  xhr.open("GET", queryURL, false, orgID, token);
  xhr.send();
  var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
  var id = xmlDoc.getElementsByTagName("ProductID")[0].innerHTML;
  return id;
}

function getVersion(productID, versionName){
  console.log("getting version data...");
  var queryURL = url + "Products/" + productID + "/Versions?VersionNumber=" + versionName;
  xhr.open("GET", queryURL, false, orgID, token);
  xhr.send();
  var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
  return xmlDoc;
}

function getAssetFields(productID, versionNum){
  console.log("getting asset fields...");
  var queryURL = url + "Assets?Name=Release Checklist&ProductID=" + productID + "&ProductVersionNumber=" + versionNum;
  xhr.open("GET", queryURL, false, orgID, token);
  xhr.send();
  var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
  return xmlDoc;
}

function removeFields(assetID, statusFields){
  console.log("'removing' fields...");
  var data = "<Asset>";
  //change status to N/a so program will skip past them next time
  for(var key in statusFields){
    var checkbox = document.getElementById(key+"check");
    if(checkbox && checkbox.checked){
      var field = key;
      data += ("<"+field+">N/a</"+field+">");
    }
  }

  data += "</Asset>"

  if(data != "<Asset></Asset>"){
    var queryURL = url + "Assets/"+assetID;
    var xmlData = parser.parseFromString(data,"text/xml");
    xhr.open("PUT", queryURL, false, orgID, token);
    xhr.send(xmlData);

    location.reload();
  }
}

function updateList(originalStatus, originalPlanned, originalActual, assetID){
    console.log("updating list...");
    var changedPlanned = document.getElementsByClassName("PlannedDateValues");
    var changedActual = document.getElementsByClassName("ActualDateValues");
    var changedStatus = document.getElementsByClassName("form-control checklist");
    var data = "<Asset>";
    var counter = 0;

    for(var key in originalStatus){
        if(changedStatus["form-select-"+key]){
            var newStatus = changedStatus["form-select-"+key].value;
            if(changedPlanned[counter]){
                var newPlanned = changedPlanned[counter].value;
                if(newPlanned!="" && newPlanned!=moment(originalPlanned[key][0].innerHTML).utc().format("YYYY-MM-DD") && changedPlanned[counter].id == key+"Planned"){
                    newPlanned = moment(newPlanned).format("MM/DD/YYYY");
                    data += "<"+key+"Planned>"+ newPlanned +"</"+key+"Planned>";
                }
            }

            // if there are values in Actual Date dropdowns
            if(changedActual[counter]){
                var newActual = changedActual[counter].value;
                // if the date is valid and not the same as what it originally was
                if(newActual!="" && newActual!=moment(originalActual[key][0].innerHTML).utc().format("YYYY-MM-DD") && changedActual[counter].id == key+"Actual"){
                    //add the Actual Date tag to the data that will be sent
                    newActual = moment(newActual).format("MM/DD/YYYY");
                    data += "<"+key+"Actual>"+ newActual +"</"+key+"Actual>";
                }
            }

            if(originalStatus[key][0].innerHTML != newStatus){
                data += "<"+key+">"+ newStatus+"</"+key+">";
            }
            counter++;
        }
    }

    data += "</Asset>";

    var queryURL = url + "Assets/"+assetID;
    var xmlData = parser.parseFromString(data,"text/xml");
    xhr.open("PUT", queryURL, false, orgID, token);
    xhr.send(xmlData);

    location.reload();
}

function updateFields(assetID){
    console.log("update fields from retrieval...");
    var fields = document.getElementsByClassName("custom-control-label");
    var len = fields.length;
    var data = '<Asset>';
    for(var i=0; i<len; ++i){
      if(fields[i].checked){
          var id = fields[i].id;
          var key = id.substring(0, id.indexOf("checkbox"));
          data += "<"+key+">Not Started</"+key+">";

      }
    }
    data += '</Asset>';
    console.log(data);
    var queryURL = url + "Assets/"+assetID;
    var xmlData = parser.parseFromString(data,"text/xml");
    xhr.open("PUT", queryURL, false, orgID, token);
    xhr.send(xmlData);

    location.reload();
}

// ==UserScript==
// @name         TeamSupport Release Progress
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  creates a checklist of unreleased product versions and their stages
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
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Users*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Groups*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Customer*
// @exclude      https://app.teamsupport.com/vcr/*/Pages/Asset*
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
// @match        https://app.teamsupport.com/vcr/*/Pages/Product*
// @require      //maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css

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
    groupbtn.setAttribute("title-id", "productVersionChecklist");
    groupbtn.setAttribute("data-original-title", "Open version release checklist");
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
      e.preventDefault();
      createTabContent();
    });
  }
}

function createAsset(){
  var name = document.getElementById("productVersionNumber").innerHTML;
  var last = name.lastIndexOf("-");
  var productName = name.substring(0, last);
  var versionName = name.substring(last+2);
  var productID = getProductId(productName, versionName);
  var asset = getAssetFields(productID, versionName);

  //if release checklist doesn't exist then create a new one
  if(asset.getElementsByTagName("Asset").length == 0){
    var queryURL = url + "Assets";
    var data = "<ProductID>" + productID + "</ProductID><ProductVersionNumber>" + versionName + "</ProductVersionNumber>";
    var xmlData = parser.parseFromString(data,"text/xml");
    xhr.open("PUT", queryURL, false, orgID, token);
    xhr.send(xmlData);
  }
}

function createTabContent(){
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

  //var versions = getVersion(productID, versionName);
  //var len = versions.getElementsByTagName("Version").length;
  //create objects from xml response
  var statusFields = {
    AllocateTickets: asset.getElementsByTagName("AllocateTickets"),
    CodeFreeze: asset.getElementsByTagName("CodeFreeze"),
    CreateAndUpdateTrello: asset.getElementsByTagName("Trello"),
    UpdateTickets: asset.getElementsByTagName("UpdateTickets"),
    IssueFollowup: asset.getElementsByTagName("IssueFollowup"),
    ReleaseAnnouncement: asset.getElementsByTagName("ReleaseAnnouncement"),
    InstallGuide: asset.getElementsByTagName("InstallGuide"),
    UserGuide: asset.getElementsByTagName("UserGuide"),
    TrainingGuide: asset.getElementsByTagName("TrainingGuide"),
    OnlineHelp: asset.getElementsByTagName("OnlineHelp"),
    NewFeaturesDocument: asset.getElementsByTagName("NewFeatures"),
    ReleaseNotes: asset.getElementsByTagName("ReleaseNotes"),
    InternalWebcast: asset.getElementsByTagName("InternalWebcast"),
    CustomerWebcast: asset.getElementsByTagName("CustomerWebcast"),
    CheckCustomizationsList: asset.getElementsByTagName("Customizations"),
    CloseAndUpdateTicketsPostRelease: asset.getElementsByTagName("PostRelease"),
    SendEmailOnGA: asset.getElementsByTagName("SendEmail"),
    CreateVersionMetrics: asset.getElementsByTagName("Metrics"),
  }

  var plannedDates = {
    AllocateTickets: asset.getElementsByTagName("AllocateTicketsPlanned"),
    CodeFreeze: asset.getElementsByTagName("CodeFreezePlanned"),
    CreateAndUpdateTrello: asset.getElementsByTagName("TrelloPlanned"),
    UpdateTickets: asset.getElementsByTagName("UpdateTicketsPlanned"),
    IssueFollowup: asset.getElementsByTagName("IssueFollowupPlanned"),
    ReleaseAnnouncement: asset.getElementsByTagName("ReleaseAnnouncementPlanned"),
    InstallGuide: asset.getElementsByTagName("InstallGuidePlanned"),
    UserGuide: asset.getElementsByTagName("UserGuidePlanned"),
    TrainingGuide: asset.getElementsByTagName("TrainingGuidePlanned"),
    OnlineHelp: asset.getElementsByTagName("OnlineHelpPlanned"),
    NewFeaturesDocument: asset.getElementsByTagName("NewFeaturesPlanned"),
    ReleaseNotes: asset.getElementsByTagName("ReleaseNotesPlanned"),
    InternalWebcast: asset.getElementsByTagName("InternalWebcastPlanned"),
    CustomerWebcast: asset.getElementsByTagName("CustomerWebcastPlanned"),
    CheckCustomizationsList: asset.getElementsByTagName("CustomizationsPlanned"),
    CloseAndUpdateTicketsPostRelease: asset.getElementsByTagName("PostReleasePlanned"),
    SendEmailOnGA: asset.getElementsByTagName("SendEmailPlanned"),
    CreateVersionMetrics: asset.getElementsByTagName("MetricsPlanned"),
  }

  var actualDates = {
    AllocateTickets: asset.getElementsByTagName("AllocateTicketsActual"),
    CodeFreeze: asset.getElementsByTagName("CodeFreezeActual"),
    CreateAndUpdateTrello: asset.getElementsByTagName("TrelloActual"),
    UpdateTickets: asset.getElementsByTagName("UpdateTicketsActual"),
    IssueFollowup: asset.getElementsByTagName("IssueFollowupActual"),
    ReleaseAnnouncement: asset.getElementsByTagName("ReleaseAnnouncementActual"),
    InstallGuide: asset.getElementsByTagName("InstallGuideActual"),
    UserGuide: asset.getElementsByTagName("UserGuideActual"),
    TrainingGuide: asset.getElementsByTagName("TrainingGuideActual"),
    OnlineHelp: asset.getElementsByTagName("OnlineHelpActual"),
    NewFeaturesDocument: asset.getElementsByTagName("NewFeaturesActual"),
    ReleaseNotes: asset.getElementsByTagName("ReleaseNotesActual"),
    InternalWebcast: asset.getElementsByTagName("InternalWebcastActual"),
    CustomerWebcast: asset.getElementsByTagName("CustomerWebcastActual"),
    CheckCustomizationsList: asset.getElementsByTagName("CustomizationsActual"),
    CloseAndUpdateTicketsPostRelease: asset.getElementsByTagName("PostReleaseActual"),
    SendEmailOnGA: asset.getElementsByTagName("SendEmailActual"),
    CreateVersionMetrics: asset.getElementsByTagName("MetricsActual"),
  }

  var box = createCard(statusFields, plannedDates, actualDates, versionName);
  divCol.appendChild(box);

  divRow.appendChild(divCol);
  div.appendChild(divRow);
  console.log(div);
  tabContent.appendChild(div);
  }
}

function createCard(statusFields, plannedDates, actualDates, versionName){
  //create white box card that contains information on 1 version
  var box = document.createElement("div");
  box.setAttribute("class", "box");
  var boxHeader = document.createElement("div");
  boxHeader.setAttribute("class", "box-header");
  var header = document.createElement("h4");
  header.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + versionName;

  var boxContent = document.createElement("div");
  boxContent.setAttribute("class", "box-content");
  var boxRow = document.createElement("div");
  boxRow.setAttribute("class", "row");
  var boxCol = document.createElement("div");
  boxCol.setAttribute("class", "col-md-12");

  var fields = createTable(statusFields, plannedDates, actualDates, versionName);

  boxHeader.appendChild(header);
  boxCol.appendChild(fields);
  boxRow.appendChild(boxCol);
  boxContent.appendChild(boxRow);
  box.appendChild(boxHeader);
  box.appendChild(boxContent);
  return box;
}

function createTable(statusFields, plannedDates, actualDates, versionName){
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
  th.className = "col-xs-2 col-md-2";
  var thplanned = document.createElement("div");
  thplanned.className = "col-xs-3 col-md-3";
  thplanned.innerHTML = "Planned Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
  var thactual = document.createElement("div");
  thactual.className = "col-xs-3 col-md-3";
  thactual.innerHTML = "Actual Date&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
  var thstatus = document.createElement("div");
  thstatus.className = "col-xs-4 col-md-4";
  thstatus.innerHTML = "Status";

  trh.appendChild(th);
  trh.appendChild(thplanned);
  trh.appendChild(thstatus);
  trh.appendChild(thactual);
  table.appendChild(trh);

  //iterate through custom fields and get their values
  for (var key in statusFields) {
    console.log(statusFields[key][0].innerHTML);
    if (statusFields.hasOwnProperty(key) && key!="VersionNumbers" && statusFields[key][0].innerHTML!="N/a") {
      var trb = document.createElement("div");
      trb.setAttribute("class", "row");
      trb.setAttribute("style", "border-bottom:1px solid #DCDCDC;");

      var plannedDate = document.createElement("input");
      plannedDate.id = "form-plan-date-"+key;
      plannedDate.setAttribute("type", "date");
      plannedDate.setAttribute("value", plannedDates[key][0]);
      var actualDate = document.createElement("input");
      actualDate.id = "form-actual-date-"+key;
      actualDate.setAttribute("type", "date");
      actualDate.setAttribute("value", actualDates[key][0]);

      var td = document.createElement("div");
      td.className = "col-xs-2 col-md-2";
      td.style.padding = "5px";
      var tdplanned = document.createElement("div");
      tdplanned.className = "col-xs-3 col-md-3";
      tdplanned.style.padding = "5px";
      tdplanned.setAttribute("style", "text-align:center");
      var tdactual = document.createElement("div");
      tdactual.className = "col-xs-3 col-md-3";
      tdactual.style.padding = "5px";
      tdactual.setAttribute("style", "text-align:center");
      var tdstatus = document.createElement("div");
      tdstatus.className = "col-xs-4 col-md-4";
      tdstatus.style.padding = "5px";
      tdstatus.setAttribute("style", "text-align:center");

      var cfdropdown = document.createElement("div");
      cfdropdown.className = "form-group";
      var cflabel = document.createElement("label");
      cflabel.style.padding = "5px";
      cflabel.setAttribute("for","form-select-"+key);
      cflabel.innerHTML = (key.replace(/([A-Z])/g, ' $1').trim())+":&nbsp;&nbsp;";

      //create status dropdown (ensure options only appear once)
      var cfselect = document.createElement("select");
      cfselect.className = "form-control";
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

      td.appendChild(cflabel);
      tdplanned.appendChild(plannedDate);
      tdactual.appendChild(actualDate);
      tdstatus.appendChild(cfselect);
      trb.appendChild(td);
      trb.appendChild(tdplanned);
      trb.appendChild(tdstatus);
      trb.appendChild(tdactual);
      console.log(trb);
      table.appendChild(trb);
    }
  }
  return table;
}

function getProductId(productName, versionname){
  var queryURL = url + "Products?Name=" + productName;
  console.log("queryurl: ");
  console.log(queryURL);
  xhr.open("GET", queryURL, false, orgID, token);
  xhr.send();
  var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
  var id = xmlDoc.getElementsByTagName("ProductID")[0].innerHTML;
  return id;
}

function getVersion(productID, versionName){
  console.log(productID);
  var queryURL = url + "Products/" + productID + "/Versions?VersionNumber=" + versionName;
  xhr.open("GET", queryURL, false, orgID, token);
  xhr.send();
  var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
  return xmlDoc;
}

function getAssetFields(productID, versionNum){
  var queryURL = url + "Assets?ProductID=" + productID + "&ProductVersionNumber=" + versionNum;
  xhr.open("GET", queryURL, false, orgID, token);
  xhr.send();
  var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
  return xmlDoc;
}

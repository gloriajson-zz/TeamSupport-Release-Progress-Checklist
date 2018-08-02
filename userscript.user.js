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
// @require      https://cdn.jsdelivr.net/bootstrap.native/2.0.1/bootstrap-native.js
// @require      https://cdn.jsdelivr.net/npm/js-datepicker@3.3.2/datepicker.min.js

// ==/UserScript==

// constants
var url = "https://app.teamsupport.com/api/xml/";
var orgID = "";
var token = "";
var xhr = new XMLHttpRequest();
var parser = new DOMParser();

document.addEventListener('DOMContentLoaded', main(), false);

function main(){
console.log(document.getElementById('productVersionTabs'));
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
  var versions = getVersion(productID, versionName);
  var len = versions.getElementsByTagName("Version").length;
  var version = {
    VersionNumbers: versions.getElementsByTagName("VersionNumber"),
    CodeFreeze: versions.getElementsByTagName("DevComplete"),
    ReleaseAnnouncement: versions.getElementsByTagName("ReleaseAnnouncement"),
    InstallGuide: versions.getElementsByTagName("InstallGuide"),
    UserGuide: versions.getElementsByTagName("UserGuide"),
    TrainingGuide: versions.getElementsByTagName("TrainingGuide"),
    OnlineHelp: versions.getElementsByTagName("OnlineHelp"),
    ReleaseNotes: versions.getElementsByTagName("ReleaseNotes"),
    InternalWebcast: versions.getElementsByTagName("InternalWebcast"),
    CustomerWebcast: versions.getElementsByTagName("CustomerWebcast"),
    CodeName: versions.getElementsByTagName("CodeName"),
  }

  for(var i=0; i<len; ++i){
    var box = createCard(version, i);
    divCol.appendChild(box);
  }

  divRow.appendChild(divCol);
  div.appendChild(divRow);
  console.log(div);
  tabContent.appendChild(div);
  }
}

function createCard(version, index){
  //create white box card that contains information on 1 version
  var box = document.createElement("div");
  box.setAttribute("class", "box");
  var boxHeader = document.createElement("div");
  boxHeader.setAttribute("class", "box-header");
  var header = document.createElement("h4");
  header.innerHTML = version.VersionNumbers[index].innerHTML;

  var boxContent = document.createElement("div");
  boxContent.setAttribute("class", "box-content");
  var boxRow = document.createElement("div");
  boxRow.setAttribute("class", "row");
  var boxCol = document.createElement("div");
  boxCol.setAttribute("class", "col-md-6");

  var fields = createTable(version, index);

  boxHeader.appendChild(header);
  boxCol.appendChild(fields);
  boxRow.appendChild(boxCol);
  boxContent.appendChild(boxRow);
  box.appendChild(boxHeader);
  box.appendChild(boxContent);
  return box;
}

function createTable(version, index){
  //create dropdowns
  var div = document.createElement("div");
  div.setAttribute("class", "table-editable");

  var table = document.createElement("table");
  table.setAttribute("id", "releaseChecklistTable");
  table.setAttribute("class", "table");
  table.setAttribute("style","table-layout:fixed");

  var cfform = document.createElement("form");
  cfform.className = "form-inline";
  for (var key in version) {
    var trb = document.createElement("tr");
    if (version.hasOwnProperty(key) && key!="VersionNumbers") {
      var date = document.createElement("input");
      date.id = "form-date-"+key;
      date.setAttribute("type", "date");
      var td = document.createElement("td");
      td.style.width = "150px";
      td.setAttribute("class", key);
      var tdplanned = document.createElement("td");
      tdplanned.style.padding = "5px";
      var tdstatus = document.createElement("td");
      tdstatus.style.padding = "5px";
      var tdactual = document.createElement("td");
      tdactual.style.padding = "5px";
      var tdempty = document.createElement("td");
      tdempty.innerHTML = "&nbsp;";
      tdempty.style.padding = "5px";

      var cfdropdown = document.createElement("div");
      cfdropdown.className = "form-group";
      var cflabel = document.createElement("label");
      cflabel.setAttribute("for","form-select-"+key);
      cflabel.innerHTML = (key.replace(/([A-Z])/g, ' $1').trim())+":&nbsp;&nbsp;";

      var cfselect = document.createElement("select");
      cfselect.style.width = "300px";
      cfselect.className = "form-control";
      cfselect.setAttribute("id", "form-select-"+key);
      var cfoptions = document.createElement("option");
      cfoptions.innerHTML = version[key][index].innerHTML;
      cfselect.appendChild(cfoptions);

      td.appendChild(cflabel);
      tdplanned.appendChild(date);
      tdactual.appendChild(date);
      tdstatus.appendChild(cfselect);
      trb.appendChild(td);
      trb.appendChild(tdempty);
      trb.appendChild(tdplanned);
      trb.appendChild(tdempty);
      trb.appendChild(tdstatus);
      trb.appendChild(tdempty);
      trb.appendChild(tdactual);
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

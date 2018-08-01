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

// ==/UserScript==

// constants
var url = "https://app.teamsupport.com/api/xml/";
var orgID = "";
var token = "";
var xhr = new XMLHttpRequest();
var parser = new DOMParser();

document.addEventListener('DOMContentLoaded', main(), false);

function main(){
  if(document.getElementById('productTabs')){
    var toolbar = document.getElementById('productTabs');
    var button = document.createElement("li");
    var a = document.createElement("a");
    a.setAttribute("href", "#product-checklist");
    a.setAttribute("data-toggle", "tab");
    a.appendChild(document.createTextNode("Release Checklist"));
    button.appendChild(a);
    toolbar.appendChild(button);
  }

  button.addEventListener('click', function(e){
    console.log("button clicked");
    e.preventDefault();
    createTabContent();
  });

  // if Save was clicked then send a post request
  /*document.getElementById('create-btn').onclick = function create() {
    var customer = document.getElementById('form-select-customer').value;
    var product = document.getElementById('form-select-product').value;
  }*/
}

function createTabContent(){
  if(document.getElementsByClassName("tab-content")){
  var tabContent = document.getElementsByClassName("tab-content")[0];
  var div = document.createElement("div");
  div.setAttribute("class", "tab-pane fade");
  div.id = "product-checklist";

  var divRow = document.createElement("div");
  divRow.setAttribute("class", "row");
  var divCol = document.createElement("div");
  divCol.setAttribute("class", "col-xs-8");

  var productName = document.getElementById("productName");
  var productID = getProductId(productName);
  var versions = getUnreleasedVersions(productID);
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
  boxCol.setAttribute("class", "col-md-12");

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
  var cfform = document.createElement("form");
  cfform.className = "form-inline";
  var cfdropdown = document.createElement("div");
  cfdropdown.className = "form-group";
  var cflabel = document.createElement("label");
  cflabel.setAttribute("for","form-select-codeFreeze");
  cflabel.innerHTML = "Install Guide:&nbsp;&nbsp;";
  var cfselect = document.createElement("select");
  cfselect.style.width = "300px";
  cfselect.className = "form-control";
  cfselect.setAttribute("id", "form-select-codeFreeze");
  var cfoptions = document.createElement("option");
  cfoptions.innerHTML = version.InstallGuide[index].innerHTML;

  cfselect.appendChild(cfoptions);
  cfdropdown.appendChild(cflabel);
  cfdropdown.appendChild(cfselect);
  cfform.appendChild(cfdropdown);

  /*var userguide = "<div class=\"form-group\">"+
      "<label for=\"form-select-user\">User Guide&nbsp;&nbsp;</label>"+
      "<select id=\"form-select-user\" class=\"form-control\" style=\"width:300px\"></select>"+
      "<option>"+version.UserGuide[index].innerHTML+"</option>"+
      "</div>";
  cfform.innerHTML = userguide;
  if(document.getElementById("form-select-user")){
     var add = document.getElementById("form-select-user");
     var ugoptions = document.createElement("option");
     ugoptions.innerHTML = version.UserGuide[index].innerHTML;
     add.appendChild(ugoptions);
   }*/

    return cfform;

  /*var trb = document.createElement("tr");
  trb.setAttribute("style", "border-bottom:1px solid #DCDCDC");
  var td1 = document.createElement("td");
  td1.setAttribute("class","codeFreeze");
  var td2 = document.createElement("td");
  td2.setAttribute("class","releaseAnnouncement");
  var td3 = document.createElement("td");
  td3.setAttribute("class","installGuide");
  var td4 = document.createElement("td");
  td4.setAttribute("class","userGuide");
  var td5 = document.createElement("td");
  td5.setAttribute("class","trainingGuide");
  var td6 = document.createElement("td");
  td6.setAttribute("class","onlineHelp");
  var td7 = document.createElement("td");
  td7.setAttribute("class","internalWebcast");
  var td8 = document.createElement("td");
  td8.setAttribute("class","customerWebcast");
  var td9 = document.createElement("td");
  td9.setAttribute("class","releaseNotes");
  var td10 = document.createElement("td");
  td10.setAttribute("class","codeName");*/
}

function getProducts(){
  //get all the products thorugh the API
  var queryURL = url + "Products";
  xhr.open("GET", queryURL, false, orgID, token);
  xhr.send();
  var json = JSON.parse(xhr.responseText);
  console.log(JSON.stringify(json));
  //var productID = ;
  //var productName = ;

  //return {
  //  id: productID,
  //  name: productName
  //};
}

function getProductId(productName){
  var queryURL = url + "Products?Name=" + productName.innerHTML;
  console.log("queryurl: ");
  console.log(queryURL);
  xhr.open("GET", queryURL, false, orgID, token);
  xhr.send();
  var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
  var id = xmlDoc.getElementsByTagName("ProductID")[0].innerHTML;
  return id;
}

function getUnreleasedVersions(productID){
  var queryURL = url + "Products/" + productID + "/Versions?IsReleased=False";
  xhr.open("GET", queryURL, false, orgID, token);
  xhr.send();
  var xmlDoc = parser.parseFromString(xhr.responseText,"text/xml");
  console.log("unreleased versions xmlDoc:");
  console.log(xmlDoc);
  return xmlDoc;
}

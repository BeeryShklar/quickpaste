const $ = require("jquery");
const Store = require("electron-store");
const store = new Store();
const { BrowserWindow } = require("electron").remote;

// defining the items to show or hide when clicking on the add button
const addIcon = $(".add-icon");
const inputElement = $(".add-icon").find(".add-icon--input");
const iconElement = $(".add-icon").find(".add-icon--icon");

// when clicking on add button show the input
setupAddOptionClickListener();
// when in input on enter get data and hide
getAddOptionContent();
// renders the copy options
renderItems();

BrowserWindow.getAllWindows().forEach(window => {
  window.on("blur", () => {
    window.hide();
  });
});

///////////////////
//// functions ////
//////////////////

// reads the items from the store and returns them
function readStoreValues() {
  const items = store.get("texts");
  if (items === undefined) {
    store.set("texts", []);
  }
  return items;
}

// push a text to the store and call function "render items"
function storeNewOption(text) {
  let values = readStoreValues();
  // if store doesn't include item (no duplicates) store the item (push function)
  if (!values.includes(text) && text != null && text != "") {
    values.push(text);
  }
  // store list with new item
  store.set("texts", values);
  // render items
  renderItems();
}

// delete an item from the store and call function "render items"
function deleteItem(item) {
  let values = readStoreValues();
  // gets the index of the item we wont to delete
  const index = values.indexOf(item);

  if (index != null) {
    // delete the item from the list
    values = values
      .slice(0, index)
      .concat(values.slice(index + 1, values.length));
    // stores the list without the item
    store.set("texts", values);
  }
  renderItems();
}

//////////////////////////
//// event listeners ////
////////////////////////

// checks if you click a copy option and copies its text
function setupOptionClickListener() {
  const options = $(".copy");
  options.click(function() {
    // copy the text inside the element and then hide the window
    navigator.clipboard
      .writeText(
        $(this)
          .find(".copy--text")
          .text()
      )
      .then(() => {
        BrowserWindow.getAllWindows().forEach(window => {
          window.hide();
        });
      });
  });
  options.contextmenu(function() {
    let text = $(this)
      .find(".copy--text")
      .text();
    $("body").append(`
      <div class="menu--container">
        <div class="menu--delete-item menu"
          <p class="menu--delete-item--text menu--text">delete item</p>
        </div>
        <div class="menu--cancel menu">
          <p class="menu--cancel--text">cancel</div>
        </div>
      </div>
    `);
    $(".menu--delete-item").click(() => {
      deleteItem(text);
      $(".menu--container").remove();
    });
    $(".menu--cancel").click(() => {
      $(".menu--container").remove();
    });
  });
}

// checks if you click the add icon
function setupAddOptionClickListener() {
  $(".add-icon").click(() => {
    // show the text box and focus on it
    iconElement.css("display", "none");
    inputElement.css("display", "inline");
    inputElement.focus();
  });
}

function getAddOptionContent() {
  // when you click the add icon
  // you get the text box, and this reads its value
  // when pressing enter (keycode = 13)
  let loopIdx = 0;
  inputElement.keypress(e => {
    var keycode = e.keyCode ? e.keyCode : e.which;
    if (keycode === 13) {
      storeNewOption(inputElement.val());
      inputElement.val("");
      inputElement.css("display", "none");
      iconElement.css("display", "inline");
      loopIdx++;
    }
  });
}

//////////////////////////////
//// render all the items ////
//////////////////////////////

// reads the values from the "store", deletes all
// the elements and creates elements with the content of the "store"
function renderItems() {
  // read the values of the "store"
  const items = readStoreValues();
  if (items !== undefined) {
    // the container off all the copy options
    $(".copy-container").html("");
    // loop on all the items in the "store"
    items.forEach(element => {
      if (element != null) {
        // create the element with the "store" text
        $(".copy-container").append(
          `
        <div class="option copy">
        <p class="copy--text">${element}</div>
        </div>
        `
        );
      }
    });
    setupOptionClickListener();
  }
}

const options = document.querySelectorAll(".copy");
console.log(options);
options.forEach(Element => {
  addListener(Element, Element.querySelector(".option--text").innerHTML);
});

function addListener(object, text) {
  object.addEventListener("click", () => {
    copy(text);
  });
}

function copy(text) {
  navigator.clipboard.writeText(text);
}

import SirTrevor from "./lib";

const editor = new SirTrevor.Editor({
    el: document.querySelector(".js-st-instance"),
    defaultType: "Text",
    iconUrl: "build/sir-trevor-icons.svg"
});
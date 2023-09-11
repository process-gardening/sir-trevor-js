import SirTrevor from "./lib";

window.initSirTrevor = function(data) {

    const textArea = document.querySelector(".sir-trevor");
    if(data) {
        textArea.value = data;
    }

    const editor = new SirTrevor.Editor({
        el: document.querySelector(".sir-trevor"),
        defaultType: "Text",
        iconUrl: "build/sir-trevor-icons.svg",
        blockTypes: ['Heading', 'Text', 'List', 'Quote', 'Image', 'Video', 'Tweet']
    });

    SirTrevor.config.language = "en";

    window.editor = editor;
}

if (! window.Cypress) {
    initSirTrevor()
}


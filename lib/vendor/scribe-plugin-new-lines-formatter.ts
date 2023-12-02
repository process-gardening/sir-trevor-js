import Scribe from "./scribe-editor";

export function ScribePluginPlainTextFormatter() {
  return function (scribe: Scribe) {
    scribe.registerPlainTextFormatter(function (html: string) {
      return html.replace(/\n([ \t]*\n)+/g, '</p><p>').replace(/\n/g, '<br>');
    });
  };
}

import HtmlJanitor from "html-janitor";
import {merge, cloneDeep} from "lodash";

export function ScribePluginSanitizer(config) {

  const configAllowMarkers = merge(cloneDeep(config), {
    tags: {
      em: {class: 'scribe-marker'},
      br: {}
    }
  });

  return function (scribe) {
    const janitor = new HtmlJanitor(configAllowMarkers);

    scribe.registerHTMLFormatter('sanitize', janitor.clean.bind(janitor));
  };
}

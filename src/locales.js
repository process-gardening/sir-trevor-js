"use strict";

var _ = require('./lodash');
var config = require('./config');
var utils = require('./utils');

var Locales = {
  en: {
    general: {
      'delete?': 'Delete?',
      'drop': 'Drag __block__ here',
      'paste': 'Or paste URL here',
      'upload': '...or choose a file',
      'close': 'close',
      'position': 'Position',
      'wait': 'Please wait...',
      'link': 'Enter a link',
      'yes': 'Yes',
      'no': 'No',
      'delete': 'Delete',
      'cancel': 'Cancel'
      'submit':           'Submit'
    },
    errors: {
      'title': "You have the following errors:",
      'validation_fail': "__type__ block is invalid",
      'block_empty': "__name__ must not be empty",
      'type_missing': "You must have a block of type __type__",
      'required_type_empty': "A required block type __type__ is empty",
      'load_fail': "There was a problem loading the contents of the document",
      'link_empty': "This link appears to be empty",
      'link_invalid': "The link is not valid"
    },
    formatters: {
      link: {
        'prompt': "Enter a link",
        'new_tab': "Opens in a new tab",
        'message': "The URL you entered appears to be __type__. Do you want to add the required “__prefix__” prefix?",
        types: {
          'email': 'an email address',
          'telephone': 'a telephone number',
          'url': 'a link'
        }
      },
      superscript: {
        'prompt': "Title attribute (optional)"
      }
    },
    blocks: {
      text: {
        'title': "Text"
      },
      list: {
        'title': "List"
      },
      quote: {
        'title': "Quote",
        'credit_field': "Credit"
      },
      image: {
        'title': "Image",
        'upload_error': "There was a problem with your upload"
      },
      video: {
        'title': "Video",
        'drop_title': "Video URL"
      },
      tweet: {
        'title': "Tweet",
        'drop_title': "Tweet URL",
        'fetch_error': "There was a problem fetching your tweet"
      },
      embedly: {
        'title': "Embedly",
        'fetch_error': "There was a problem fetching your embed",
        'key_missing': "An Embedly API key must be present"
      },
      heading: {
        'title': "Heading"
      },
      box: {
        'info': 'Info',
        'notice': 'Notice',
        'caution': 'Caution',
        'warning': 'Warning',
        'danger': 'Danger'
      }
    }
  },
  de: {
    general: {
      'delete?': 'Block löschen?',
      'drop': '__block__ hier ablegen',
      'paste': 'Oder Adresse hier einfügen',
      'upload': '...oder Datei auswählen',
      'close': 'Schließen',
      'position': 'Position',
      'wait': 'Bitte warten...',
      'link': 'Link eintragen',
      'yes': 'Ja ',
      'no': 'Nein',
      'delete': 'Löschen',
      'cancel': 'Abbrechen'
    },
    errors: {
      'title': "Die folgenden Fehler sind aufgetreten:",
      'validation_fail': "Block __type__ ist ungültig",
      'block_empty': "__name__ darf nicht leer sein",
      'type_missing': "Blöcke mit Typ __type__ sind hier nicht zulässig",
      'required_type_empty': "Angeforderter Block-Typ __type__ ist leer",
      'load_fail': "Es wurde ein Problem beim Laden des Dokumentinhalts festgestellt"
    },
    blocks: {
      text: {
        'title': "Text"
      },
      list: {
        'title': "Liste (unsortiert)"
      },
      list_extended: {
        'title': "Liste"
      },
      quote: {
        'title': "Zitat",
        'credit_field': "Quelle"
      },
      image: {
        'title': "Bild",
        'upload_error': "Es wurde ein Problem beim Upload festgestellt"
      },
      video: {
        'title': "Video"
      },
      tweet: {
        'title': "Tweet",
        'fetch_error': "Es wurde ein Problem beim Laden des Tweets festgestellt"
      },
      embedly: {
        'title': "Embedly",
        'fetch_error': "There was a problem fetching your embed",
        'key_missing': "An Embedly API key must be present"
      },
      heading: {
        'title': 'Überschrift'
      },
      box: {
        'title': 'Kasten',
        'info': 'Info',
        'notice': 'Hinweis',
        'caution': 'Vorsicht',
        'warning': 'Warnung',
        'danger': 'Gefahr'
      }
    }
  }
};

//if (global.I18n !== undefined) {
//  console.log('using I18n');
//} else
if (window.i18n === undefined) {
  // Minimal i18n stub that only reads the English strings
  utils.log("Using i18n stub.");
  window.i18n = {
    t: function (key, options) {
      var parts = key.split(':'), str, obj, part, i;

      obj = Locales[config.language || config.defaults.language];

      for (i = 0; i < parts.length; i++) {
        part = parts[i];

        if (!_.isUndefined(obj[part])) {
          obj = obj[part];
        }
      }

      str = obj;

      if (!_.isString(str)) {
        return "";
      }

      if (str.indexOf('__') >= 0) {
        Object.keys(options).forEach(function (opt) {
          str = str.replace('__' + opt + '__', options[opt]);
        });
      }

      return str;
    }
  };
} else {
  utils.log("Using i18next");
  // Only use i18next when the library has been loaded by the user, keeps
  // dependencies slim
  i18n.init({
    resStore: Locales, fallbackLng: config.defaults.language,
    ns: {namespaces: ['general', 'blocks'], defaultNs: 'general'}
  });
}

module.exports = Locales;

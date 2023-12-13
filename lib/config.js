"use strict";

import _ from "./lodash";

const drop_options = {
  title: (block) => {
    return i18n.t(`blocks:${block.type}:drop_title`) || _.result(block, "title");
  },
  html: `
    <div class="st-block__dropzone">
      <svg role="img" class="st-icon">
        <use xlink:href="<%= config.defaults.iconUrl %>#<%= _.result(block, 'icon_name') %>"/>
      </svg>
      <p>
        <%= i18n.t("general:drop", { block: "<span>" + _.result(block, 'title') + "</span>" }) %>
      </p>
    </div>
  `,
  re_render_on_reorder: false,
  hide_editor: false
};


const paste_options = {
  html: `
    <input type="text" placeholder="<%= i18n.t("general:paste") %>" class="st-block__paste-input st-paste-block">
  `
};

/*var upload_options = {
  html: [
    '<div class="st-block__upload-container">',
    '<input type="file" type="st-file-upload">',
    '<button class="st-upload-btn"><%= i18n.t("general:upload") %></button>',
    '</div>'
  ].join('\n')
};*/

const upload_options = {
  html: `
    <div class="st-block__upload-container">
      <input type="file" type="st-file-upload">
        <button class="st-upload-btn"><%= i18n.t("general:upload") %></button>
    </div>
  `
};

export default {
  debug: true,
  scribeDebug: false,
  skipValidation: false,
  version: "0.4.0",

  instances: [],

  defaults: {
    language: "en",
    defaultType: false,
    spinner: {
      className: 'st-spinner',
      lines: 9,
      length: 8,
      width: 3,
      radius: 6,
      color: '#000',
      speed: 1.4,
      trail: 57,
      shadow: false,
      left: '50%',
      top: '50%',
    },
    Block: {
      drop_options: drop_options,
      paste_options: paste_options,
      upload_options: upload_options,
    },
    editorMode: 'block', // or document
    //editorMode: 'document', // or document
    blockLimit: 0,
    blockTypeLimits: {},
    required: [],
    uploadUrl: '/attachments',
    attachmentName: 'attachment[name]',
    attachmentFile: 'attachment[file]',
    attachmentUid: 'attachment[uid]',
    baseImageUrl: '/sir-trevor-uploads/',
    iconUrl: '../lib/icons/sir-trevor-icons.svg',
    errorsContainer: undefined,
    convertFromMarkdown: true,
    joinListBlocksOnBlockRemove: false,
    headingLevels: [2],
    defaultHeadingLevel: 2,
    formatBar: {
      commands: [
        {
          name: "Bold",
          title: "bold",
          iconName: "fmt-bold",
          cmd: "bold",
          keyCode: 66,
          text: "B"
        },
        {
          name: "Italic",
          title: "italic",
          iconName: "fmt-italic",
          cmd: "italic",
          keyCode: 73,
          text: "i"
        },
        {
          name: "Link",
          title: "link",
          iconName: "fmt-link",
          cmd: "linkPrompt",
          keyCode: 75,
          text: "link",
        },
        {
          name: "Unlink",
          title: "unlink",
          iconName: "fmt-unlink",
          cmd: "unlink",
          text: "link",
        },
/*        {
          name: "Heading",
          title: "heading",
          iconName: "fmt-heading",
          cmd: "heading",
          text: "heading"
        },
        {
          name: "Quote",
          title: "quote",
          iconName: "fmt-quote",
          cmd: "quote",
          text: "quote"
        }*/
      ],
    },
    ajaxOptions: {
      headers: {}
    },
    focusOnInit: true,
    selectionMouse: true,
    selectionCopy: true,
    selectionCut: true,
    selectionPaste: true,
    selectionLimitToEditor: true,
    enableExternalLinks: false,
  }
};
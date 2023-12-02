import immutable from 'immutable';

const blockModePlugins = [
  'setRootPElement',
  'enforcePElements',
  'ensureSelectableContainers',
];

const inlineModePlugins = [
  'inlineElementsMode'
];
const defaultOptions = {
  allowBlockElements: true,
  debug: false,
  undo: {
    manager: false,
    enabled: true,
    limit: 100,
    interval: 250
  },
  defaultCommandPatches: [
    'bold',
    'indent',
    'insertHTML',
    'insertList',
    'outdent',
    'createLink'
  ],

  defaultPlugins: blockModePlugins.concat(inlineModePlugins),

  defaultFormatters: [
    'escapeHtmlCharactersFormatter',
    'replaceNbspCharsFormatter'
  ]
};

export type ScribeOptions = Partial<(typeof defaultOptions)>;

function defaults(options: ScribeOptions, defaultOptions: ScribeOptions) {
  const optionsCopy = immutable.fromJS(options);
  const defaultsCopy = immutable.fromJS(defaultOptions);
  const mergedOptions = defaultsCopy.merge(optionsCopy);
  return mergedOptions.toJS();
}

/**
 * Overrides defaults with user's options
 *
 * @param  {Object} userSuppliedOptions The user's options
 * @return {Object}                     The overridden options
 */
function checkOptions(userSuppliedOptions: ScribeOptions): Readonly<ScribeOptions> {
  const options = userSuppliedOptions || {};

  // Remove invalid plugins
  if (options.defaultPlugins) {
    options.defaultPlugins = options.defaultPlugins.filter(filterByPluginExists(defaultOptions.defaultPlugins));
  }

  if (options.defaultFormatters) {
    options.defaultFormatters = options.defaultFormatters.filter(filterByPluginExists(defaultOptions.defaultFormatters));
  }

  return Object.freeze(defaults(options, defaultOptions));
}

/**
 * Sorts a plugin list by a specified plugin name
 *
 * @param  {string} priorityPlugin The plugin name to be given priority
 * @return {Function}              Sorting function for the given plugin name
 */
function sortByPlugin(priorityPlugin: string): (pluginCurrent: string, pluginNext: string) => number {
  return function (pluginCurrent: string, pluginNext: string) {
    if (pluginCurrent === priorityPlugin) {
      // pluginCurrent comes before plugin next
      return -1;
    } else if (pluginNext === priorityPlugin) {
      // pluginNext comes before pluginCurrent
      return 1;
    }

    // Do no swap
    return 0;
  }
}

/**
 * Filters a list of plugins by block level / inline level mode.
 *
 * @param  {Boolean} isBlockLevelMode Whether block level mode is enabled
 * @return {Function}                 Filtering function based upon the given mode
 */
function filterByBlockLevelMode(isBlockLevelMode: boolean): Function {
  return function (plugin: string) {
    return (isBlockLevelMode ? blockModePlugins : inlineModePlugins).indexOf(plugin) !== -1;
  }
}

/**
 * Filters a list of plugins by their validity
 *
 * @param  {Array<string>} pluginList   List of plugins to check against
 * @return {Function}                   Filtering function based upon the given list
 */
function filterByPluginExists(pluginList: Array<string>): Function {
  return function (plugin: string) {
    return pluginList.indexOf(plugin) !== -1;
  }
}

export default {
  defaultOptions: defaultOptions,
  checkOptions: checkOptions,
  sortByPlugin: sortByPlugin,
  filterByBlockLevelMode: filterByBlockLevelMode,
  filterByPluginExists: filterByPluginExists
}


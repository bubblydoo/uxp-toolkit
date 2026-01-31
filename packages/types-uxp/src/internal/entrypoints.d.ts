/**
 * Represents a horizontal divider between two menu items.
 */
export type MenuSeparator = '-';

interface PluginConfig {
  /**
   * This is called after plugin is loaded.
   * 'this' can be used to access UxpPluginInfo object.
   * If 'plugin' object is defined, 'create' must be defined.
   * To signal failure, throw an exception.
   */
  create?: (this: UxpPluginInfo) => Promise<void>;

  /**
   * This is called before plugin is unloaded.
   * 'this' can be used to access UxpPluginInfo object.
   */
  destroy?: (this: UxpPluginInfo) => Promise<void>;
}

interface PanelConfig {
  /**
   * This is called when a panel is created.
   * 'this' can be used to access UxpPanelInfo object.
   * This function can return a promise.
   * To signal failure, throw an exception or return a rejected promise.
   * This has a default Timeout of 300 MSec from manifest v5 onwards.
   * Parameters : create(event) {}, till Manifest Version V4 create(rootNode) {}, from v5 onwards
   */
  create?: (this: UxpPanelInfo) => Promise<void>;

  /**
   * This is called when a panel is shown.
   * 'this' can be used to access UxpPanelInfo object.
   * This function can return a promise.
   * To signal failure, throw an exception or return a rejected promise.
   * This has a default Timeout of 300 MSec from manifest v5 onwards.
   * Parameters : show(event) {}, till Manifest Version V4 show(rootNode, data) {}, from v5 onwards
   */
  show?: (this: UxpPanelInfo) => Promise<void>;

  /**
   * This is called when a panel is hidden.
   * 'this' can be used to access UxpPanelInfo object.
   * This function can return a promise.
   * To signal failure, throw an exception or return a rejected promise.
   * This has a default Timeout of 300 MSec from manifest v5 onwards.
   * Parameters : hide(event) {}, till Manifest Version V4 hide(rootNode, data) {}, from v5 onwards
   */
  hide?: (this: UxpPanelInfo) => Promise<void>;

  /**
   * This is called when a panel is going to be destroyed.
   * 'this' can be used to access UxpPanelInfo object.
   * To signal failure, throw an exception.
   * Parameters : destroy(event) {}, till Manifest Version V4 destroy(rootNode) {}, from v5 onwards
   */
  destroy?: (this: UxpPanelInfo) => Promise<void>;

  /**
   * This is called when a panel menu item is invoked.
   * Menu id is passed as the first argument to this function.
   * 'this' can be used to access UxpPanelInfo object.
   * This function can return a promise.
   * To signal failure, throw an exception or return a rejected promise.
   * @param menuId
   */
  invokeMenu?: (this: UxpPanelInfo, menuId: string) => Promise<void>;

  /**
   * Array of menu items.
   * Each menu item can be a string or an object with properties defined below.
   * Menu items are displayed in the same order as specified in this array.
   * For specifying a separator, a value of "-" or menu item with label "-" can be used at required place in the
   * array.
   */
  menuItems?: (MenuItem | MenuSeparator)[];
}

interface CommandConfig {
  /**
   * This is called when the command is invoked via menu entry.
   * 'this' can be used to access UxpCommandInfo object.
   * This function can return a promise.
   * To signal failure, throw an exception or return a rejected promise.
   * Parameters : run(event) {}, till Manifest Version V4 run(executionContext, ...arguments) {}, from v5 onwards
   */
  run?: (this: UxpCommandInfo) => Promise<void>;

  /**
   * For future use.
   */
  cancel?: () => Promise<void>;
}

/**
 * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/uxp/Entry%20Points/EntryPoints/
 */
interface Entrypoints {
  /**
   * This can be an object or a function.
   * If this is a function, it is assumed as the 'create' handler
   */
  plugin?: PluginConfig | PluginConfig['create'];
  /**
   * This contains a list of key-value pairs where each key is a panel id (string) and value is the data for the
   * panel whose type can be object/function.
   * If a function, it is assumed to be the 'show' method.
   * If an object, it can contain following properties but it is must to define either of 'create' or 'show'.
   */
  panels?: {
    [key: string]: PanelConfig | PanelConfig['show'];
  };
  /**
   * This object contains a list of key-value pairs where each key is the command id and value is command's data
   * whose type can be an object or function.
   * If a function, it is assumed to be 'run' method.
   * If an objet, it can contain following properties but 'run' is must to specify.
   */
  commands?: {
    [key: string]: CommandConfig | CommandConfig['run'];
  };
}

interface MenuItem {
  /**
   * Identifier of the menu item.
   */
  id: string;
  /**
   * Display text for the menu item. Should be localized.
   * If label is not specified, id is used as label.
   * FIXME: does label localization even work?
   */
  label?: string;
  /**
   * Enabled/disabled state for the menu item. Default - true.
   */
  enabled?: boolean;
  /**
   * Checked state for the menu item. Default - false.
   */
  checked?: boolean;
  /**
   * Submenu for this menu item again as an array of 'menuItems'.
   * 'id' of submenus should still be unique across panel.
   */
  submenu?: MenuItem[];
}

/**
 * This is a public object which is passed as parameter in plugin.create() and plugin.destroy() entrypoint events.
 * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/uxp/Entry%20Points/UxpPluginInfo/#uxpplugininfo
 */
interface UxpPluginInfo {
  /**
   * Get plugin ID.
   */
  id: string;
  /**
   * Get plugin version.
   */
  version: string;
  /**
   * Get plugin name.
   */
  name: string;
  /**
   * Get plugin manifest.
   */
  manifest: never;

  /**
   * Check if the plugin is First Party Plugin.
   */
  isFirstParty: () => void;
}

/**
 * Class describing a single menu item of a panel.
 * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/uxp/Entry%20Points/UxpMenuItem/
 */
interface UxpMenuItem {
  /**
   * Get menu item id.
   */
  id: string;
  /**
   * Get menu item label, localized string.
   */
  label: string;
  /**
   * Get menu item enable state.
   */
  enabled: boolean;
  /**
   * Get menu item checked state.
   */
  checked: boolean;
  /**
   * Get menu submenu.
   */
  submenu: UxpMenuItems;
  /**
   * Get menu parent.
   */
  parent: UxpMenuItems;

  /**
   * Remove the menu item.
   */
  remove: () => void;
}

/**
 * Class describing the menu of a panel.
 * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/uxp/Entry%20Points/UxpMenuItems/
 */
interface UxpMenuItems {
  /**
   * Get number of menu items.
   */
  size: number;

  /**
   * Get menu item with specified ID.
   * @param id
   * @return Menu item with specified ID.
   */
  getItem: (id: string) => UxpMenuItem;

  /**
   * Get menu item at specified index.
   * @param index
   * @return Menu item at specified index.
   */
  getItemAt: (index: number) => UxpMenuItem;

  /**
   * Inserts/replaces the menu item at the specified index with the new menu item.
   * - index < size of menuItems array : Replaces the existing menu item.
   * - index = size of menuItems array : Inserts menu item at end.
   * - index > size of menuItems array : Throws invalid index exception.
   * @param index
   * @param newItem
   */
  insertAt: (index: number, newItem: MenuItem | MenuSeparator) => void;

  /**
   * Removes menu item from specified index.
   * @param index
   */
  removeAt: (index: number) => void;
}

/**
 * Class describing a panel of the plugin.
 * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/uxp/Entry%20Points/UxpPanelInfo/#uxppanelinfo
 */
interface UxpPanelInfo {
  /**
   * Get panel id.
   */
  id: string;
  /**
   * Get panel label, localized string.
   */
  label: string;
  /**
   * Get panel description, localized string.
   */
  description: string;
  /**
   * Get panel shortcut.
   */
  shortcut: {
    shortcutKey: string;
    commandKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    ctrlKey: boolean;
  };
  /**
   * Get panel title, localized string.
   */
  title: string;
  /**
   * Get panel icons.
   */
  icons: {
    path: string;
    scale: number[];
    theme: string[];
    species: string[];
  }[];
  /**
   * Get panel minimum size.
   */
  minimumSize: {
    width: number;
    height: number;
  };
  /**
   * Get panel maximum size.
   */
  maximumSize: {
    width: number;
    height: number;
  };
  /**
   * Get panel preferred docked size.
   */
  preferredDockedSize: {
    width: number;
    height: number;
  };
  /**
   * Get panel preferred floating size.
   */
  preferredFloatingSize: {
    width: number;
    height: number;
  };
  /**
   * Get panel menu items.
   */
  menuItems: UxpMenuItems;
}

/**
 * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/uxp/Entry%20Points/UxpCommandInfo/#uxpcommandinfo
 */
interface UxpCommandInfo {
  /**
   * Get command id.
   */
  id: string;
  /**
   * Get command label, localized string.
   */
  label: string;
  /**
   * Get command description, localized string.
   */
  description: string;
  /**
   * Get command shortcut.
   */
  shortcut: {
    shortcutKey: string;
    commandKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    ctrlKey: boolean;
  };
}

/**
 * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/uxp/Entry%20Points/
 */
interface Entrypoints {
  /**
   * Get command with specified ID.
   * @param id Command ID.
   * @return Command object for a valid ID null for an invalid ID.
   */
  getCommand: (id: string) => UxpCommandInfo;

  /**
   * Get panel with specified ID.
   * @param id Panel ID.
   * @return Panel object for a valid ID null for an invalid ID.
   */
  getPanel: (id: string) => UxpPanelInfo;

  /**
   * API for plugin to add handlers and menu items for entrypoints defined in manifest.
   * This API can only be called once and there after other apis can be used to modify menu items.
   * The function throws in case of any error in entrypoints data or if its called more than once.
   * @param entrypoints Describes your plugin's entrypoint functions and properties.
   */
  setup: (entrypoints: Entrypoints) => void;
}
export const entrypoints: Entrypoints;

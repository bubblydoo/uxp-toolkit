declare module 'uxp' {

  /**
   * Event interface received when handling a 'uxpcommand' event.
   * @see https://developer.adobe.com/photoshop/uxp/2022/guides/how-to/#how-to-get-notified-that-your-panel-is-opening-or-closing
   */
  export interface UxpCommandEvent extends Event {
    commandId: string;
  }

  /**
   * FIXME: Is this namespace documented anywhere?
   */
  namespace dialog {
    function showOpenDialog(options: {
      openFile?: boolean;
      openDirectory?: boolean;
      defaultPath?: string;
      multipleSelections?: boolean;
      title?: string;
      buttonLabel?: string;
      filters?: string[];
      showHiddenFiles?: boolean;
      initialLocation?: string;
    }): Promise<URL>;

    function showSaveDialog(options: {
      defaultPath?: string;
      title?: string;
      buttonLabel?: string;
      filters: string[];
      showHiddenFiles?: boolean;
      suggestedName?: string;
      initialLocation?: string;
    }): Promise<URL>;
  }

  /**
   * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/uxp/Entry%20Points/
   */
  namespace entrypoints {

    /**
     * Represents a horizontal divider between two menu items.
     */
    type MenuSeparator = '-';

    interface PluginConfig {
      /**
       * This is called after plugin is loaded.
       * 'this' can be used to access UxpPluginInfo object.
       * If 'plugin' object is defined, 'create' must be defined.
       * To signal failure, throw an exception.
       */
      create?(this: UxpPluginInfo): Promise<void>;

      /**
       * This is called before plugin is unloaded.
       * 'this' can be used to access UxpPluginInfo object.
       */
      destroy?(this: UxpPluginInfo): Promise<void>;
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
      create?(this: UxpPanelInfo): Promise<void>;

      /**
       * This is called when a panel is shown.
       * 'this' can be used to access UxpPanelInfo object.
       * This function can return a promise.
       * To signal failure, throw an exception or return a rejected promise.
       * This has a default Timeout of 300 MSec from manifest v5 onwards.
       * Parameters : show(event) {}, till Manifest Version V4 show(rootNode, data) {}, from v5 onwards
       */
      show?(this: UxpPanelInfo): Promise<void>;

      /**
       * This is called when a panel is hidden.
       * 'this' can be used to access UxpPanelInfo object.
       * This function can return a promise.
       * To signal failure, throw an exception or return a rejected promise.
       * This has a default Timeout of 300 MSec from manifest v5 onwards.
       * Parameters : hide(event) {}, till Manifest Version V4 hide(rootNode, data) {}, from v5 onwards
       */
      hide?(this: UxpPanelInfo): Promise<void>;

      /**
       * This is called when a panel is going to be destroyed.
       * 'this' can be used to access UxpPanelInfo object.
       * To signal failure, throw an exception.
       * Parameters : destroy(event) {}, till Manifest Version V4 destroy(rootNode) {}, from v5 onwards
       */
      destroy?(this: UxpPanelInfo): Promise<void>;

      /**
       * This is called when a panel menu item is invoked.
       * Menu id is passed as the first argument to this function.
       * 'this' can be used to access UxpPanelInfo object.
       * This function can return a promise.
       * To signal failure, throw an exception or return a rejected promise.
       * @param menuId
       */
      invokeMenu?(this: UxpPanelInfo, menuId: string): Promise<void>;

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
      run?(this: UxpCommandInfo): Promise<void>;

      /**
       * For future use.
       */
      cancel?(): Promise<void>;
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
      isFirstParty(): void;
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
      remove(): void;
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
      getItem(id: string): UxpMenuItem;

      /**
       * Get menu item at specified index.
       * @param index
       * @return Menu item at specified index.
       */
      getItemAt(index: number): UxpMenuItem;

      /**
       * Inserts/replaces the menu item at the specified index with the new menu item.
       * - index < size of menuItems array : Replaces the existing menu item.
       * - index = size of menuItems array : Inserts menu item at end.
       * - index > size of menuItems array : Throws invalid index exception.
       * @param index
       * @param newItem
       */
      insertAt(index: number, newItem: MenuItem | MenuSeparator): void;

      /**
       * Removes menu item from specified index.
       * @param index
       */
      removeAt(index: number): void;
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
     * Get command with specified ID.
     * @param id Command ID.
     * @return Command object for a valid ID null for an invalid ID.
     */
    function getCommand(id: string): UxpCommandInfo;

    /**
     * Get panel with specified ID.
     * @param id Panel ID.
     * @return Panel object for a valid ID null for an invalid ID.
     */
    function getPanel(id: string): UxpPanelInfo;

    /**
     * API for plugin to add handlers and menu items for entrypoints defined in manifest.
     * This API can only be called once and there after other apis can be used to modify menu items.
     * The function throws in case of any error in entrypoints data or if its called more than once.
     * @param entrypoints Describes your plugin's entrypoint functions and properties.
     */
    function setup(entrypoints: Entrypoints): void;
  }

  /**
   * Includes useful information about the operating environment the plugin finds itself executing in.
   * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/uxp/Host%20Information/Host/
   */
  namespace host {
    /**
     * Allows you to obtain the language and region used to render the user interface for the host application.
     * This property is useful in that it allows you to localize and internationalize your plugin's content to match
     * that of the host application.
     * @return The locale for the user interface. For example, en_US.
     */
    const uiLocale: string;
    /**
     * Indicates the name of the hosting application.
     * This is useful if your plugin needs to adapt its behavior based upon the hosting application.
     * @return The name of the hosting application. For example, Photoshop.
     */
    const name: string;
    /**
     * Indicates the version of the hosting application.
     * This is useful if your plugin needs to adapt its behavior depending upon the version of the host application.
     * This may be due to new APIs being introduced in a given version, or to work around a bug in a specific version.
     * @return The version of the hosting application. For example, 22.0.0.
     */
    const version: string;
  }

  /**
   * Version information. To get an instance: require("uxp").versions.
   * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/uxp/Versions/Versions/
   */
  namespace versions {
    /**
     * Returns the version of UXP.
     * For example, uxp-6.0.0.
     */
    const uxp: string;
    /**
     * Returns the version of the plugin.
     * This matches the version as specified in your plugin's manifest.
     */
    const plugin: string;
  }

  /**
   * To get an instance: require("uxp").shell.
   * These APIs require UXP Manifest v5 configurations.
   * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/shell/Shell/
   */
  namespace shell {
    /**
     * Opens the given file or folder path in the system default application.
     * NOTE: UWP can access only files in the UWP App sandbox.
     * @param path
     * @param developerText Information from the plugin developer to be displayed on the user consent dialog.
     * Message should be localised in current host UI locale.
     */
    function openPath(path: string, developerText?: string): Promise<string>;

    /**
     * Opens the url in the dedicated system applications for the scheme.
     * NOTE: File scheme is not allowed for openExternal. Use openPath for those cases.
     * @param url
     * @param developerText Information from the plugin developer to be displayed on the user consent dialog.
     * Message should be localised in current host UI locale.
     */
    function openExternal(url: string | URL, developerText?: string): void;
  }

  /**
   * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/uxp/Persistent%20File%20Storage/
   */
  namespace storage {

    type DomainSymbol = symbol & { _brand: { domainSymbol: undefined } };

    /**
     * Common locations that we can use when displaying a file picker.
     */
    namespace domains {
      /**
       * Local application cache directory (persistence not guaranteed).
       */
      const appLocalCache: DomainSymbol;
      /**
       * Local application data.
       */
      const appLocalData: DomainSymbol;
      /**
       * Local application library.
       */
      const appLocalLibrary: DomainSymbol;
      /**
       * Local application shared data folder.
       */
      const appLocalShared: DomainSymbol;
      /**
       * Local temporary directory.
       */
      const appLocalTemporary: DomainSymbol;
      /**
       * Roaming application data.
       */
      const appRoamingData: DomainSymbol;
      /**
       * Roaming application library data.
       */
      const appRoamingLibrary: DomainSymbol;
      /**
       * The user's desktop folder.
       */
      const userDesktop: DomainSymbol;
      /**
       * The user's documents folder.
       */
      const userDocuments: DomainSymbol;
      /**
       * The user's music folder or library.
       */
      const userMusic: DomainSymbol;
      /**
       * The user's pictures folder or library.
       */
      const userPictures: DomainSymbol;
      /**
       * The user's videos / movies folder or library.
       */
      const userVideos: DomainSymbol;
    }

    type FormatSymbol = symbol & { _brand: { formatSymbol: undefined } };

    /**
     * This namespace describes the file content formats supported in FS methods like read and write.
     */
    namespace formats {
      /**
       * Binary file encoding.
       */
      const binary: FormatSymbol;
      /**
       * UTF8 File encoding.
       */
      const utf8: FormatSymbol;
    }

    type ModeSymbol = symbol & { _brand: { modeSymbol: undefined } };

    /**
     * This namespace describes the file open modes.
     * For eg: open file in read-only or both read-write.
     */
    namespace modes {
      /**
       * The file is read-only; attempts to write will fail.
       */
      const readOnly: ModeSymbol;
      /**
       * The file is read-write.
       */
      const readWrite: ModeSymbol;
    }

    type TypeSymbol = symbol & { _brand: { typeSymbol: undefined } };

    /**
     * This namespace describes the type of the entry.
     * Whether file or folder etc.
     */
    namespace types {
      /**
       * A file; used when creating an entity.
       */
      const file: TypeSymbol;
      /**
       * A folder; used when creating an entity.
       */
      const folder: TypeSymbol;
    }

    namespace errors {
      /**
       * Attempted to invoke an abstract method.
       */
      class AbstractMethodInvocationError extends Error {
      }

      /**
       * Data and Format mismatch.
       */
      class DataFileFormatMismatchError extends Error {
      }

      /**
       * Domain is not supported by the current FileSystemProvider instance.
       */
      class DomainNotSupportedError extends Error {
      }

      /**
       * An attempt was made to overwrite an entry without indicating that it was safe to do so via overwrite: true.
       */
      class EntryExistsError extends Error {
      }

      /**
       * The entry is not a file, but was expected to be.
       */
      class EntryIsNotAFileError extends Error {
      }

      /**
       * The entry is not a folder, but was expected to be a folder.
       */
      class EntryIsNotAFolderError extends Error {
      }

      /**
       * The object passed as an entry is not actually an Entry.
       */
      class EntryIsNotAnEntryError extends Error {
      }

      /**
       * An attempt was made to write to a file that was opened as read-only.
       */
      class FileIsReadOnlyError extends Error {
      }

      /**
       * Unsupported format type.
       */
      class InvalidFileFormatError extends Error {
      }

      /**
       * The file name contains invalid characters.
       */
      class InvalidFileNameError extends Error {
      }

      /**
       * The instance was expected to be a file system, but wasn't.
       */
      class NotAFileSystemError extends Error {
      }

      /**
       * The file system is out of space (or quota has been exceeded).
       */
      class OutOfSpaceError extends Error {
      }

      /**
       * The file system revoked permission to complete the requested action.
       */
      class PermissionDeniedError extends Error {
      }

      /**
       * Attempted to execute a command that required the providers of all entries to match.
       */
      class ProviderMismatchError extends Error {
      }
    }

    /**
     * This namespace describes the various file type extensions that can used be used in some FS file open methods.
     */
    namespace fileTypes {
      /**
       * All file types.
       */
      const all: string[];
      /**
       * Image file extensions.
       */
      const images: string[];
      /**
       * Text file extensions.
       */
      const text: string[];
    }

    /**
     * Metadata for an entry.
     * It includes useful information such as:
     * - size of the file (if a file)
     * - date created
     * - date modified
     * - name
     * You'll not instantiate this directly; use Entry#getMetadata to do so.
     */
    interface EntryMetadata {
      /**
       * The name of the entry.
       */
      name: string;
      /**
       * The size of the entry, if a file.
       * Zero if a folder.
       */
      size: number;
      /**
       * The date this entry was created.
       */
      dateCreated: Date;
      /**
       * The date this entry was modified.
       */
      dateModified: Date;
      /**
       * Indicates if the entry is a file.
       */
      isFile: boolean;
      /**
       * Indicates if the entry is a folder.
       */
      isFolder: boolean;
    }

    /**
     * An Entry is the base class for File and Folder.
     * You'll typically never instantiate an Entry directly, but it provides the common fields and methods that both
     * File and Folder share.
     */
    class Entry {
      /**
       * Creates an instance of Entry.
       * @param name
       * @param provider
       * @param id
       */
      constructor(name: string, provider: FileSystemProvider, id: string);

      /**
       * Returns the details of the given entry like name, type and native path in a readable string format.
       */
      toString(): string;

      /**
       * Copies this entry to the specified folder.
       * @param folder The folder to which to copy this entry.
       * @param options
       * @throws EntryExists If the attempt would overwrite an entry and overwrite is false.
       * @throws PermissionDenied If the underlying file system rejects the attempt.
       * @throws OutOfSpace If the file system is out of storage space.
       * @return File or Folder.
       */
      copyTo(
        folder: Folder,
        options: {
          /**
           * If true, allows overwriting existing entries.
           */
          overwrite?: boolean;
          /**
           * If true, allows copying the folder.
           */
          allowFolderCopy?: boolean;
        },
      ): Promise<File | Folder>;

      /**
       * Moves this entry to the target folder, optionally specifying a new name.
       * @param folder The folder to which to move this entry.
       * @param options
       */
      moveTo(
        folder: Folder,
        options: {
          /**
           * If true allows the move to overwrite existing files.
           */
          overwrite?: boolean;
          /**
           * If specified, the entry is renamed to this name.
           */
          newName?: string;
        },
      ): Promise<void>;

      /**
       * Removes this entry from the file system.
       * If the entry is a folder, all the contents will also be removed.
       * @return The number is 0 if succeeded, otherwise throws an Error.
       */
      delete(): Promise<number>;

      /**
       * Returns this entry's metadata.
       * @return This entry's metadata.
       */
      getMetadata(): Promise<EntryMetadata>;

      /**
       * Indicates that this instance is an Entry.
       * Useful for type-checking.
       */
      readonly isEntry: boolean;

      /**
       * Indicates that this instance is not a File.
       * Useful for type-checking.
       */
      readonly isFile: boolean;

      /**
       * Indicates that this instance is not a folder.
       * Useful for type-checking.
       */
      readonly isFolder: boolean;

      /**
       * The name of this entry.
       * Read-only.
       */
      readonly name: string;

      /**
       * The associated provider that services this entry.
       * Read-only.
       */
      readonly provider: FileSystemProvider;

      /**
       * The url of this entry.
       * You can use this url as input to other entities of the extension system like for eg: set as src attribute of a
       * Image widget in UI.
       * Read-only.
       */
      readonly url: string;

      /**
       * The platform native file-system path of this entry.
       * Read-only
       */
      readonly nativePath: string;
    }

    /**
     * Represents a file on a file system.
     * Provides methods for reading from and writing to the file.
     * You'll never instantiate a File directly; instead you'll get access via a storage.FileSystemProvider.
     */
    class File extends Entry {
      /**
       * Determines if the entry is a file or not.
       * This is safe to use even if the entry is null or undefined.
       * @param entry The entry to check.
       * @return If true, the entry is a file.
       */
      static isFile(entry: Entry): boolean;

      /**
       * Indicates that this instance is a file.
       */
      isFile: boolean;

      /**
       * Indicates whether this file is read-only or read-write.
       * See readOnly and readWrite.
       */
      mode: ModeSymbol;

      /**
       * Reads data from the file and returns it.
       * The file format can be specified with the format option.
       * If a format is not supplied, the file is assumed to be a text file using UTF8 encoding.
       * @param options
       * @return The contents of the file.
       */
      read(options: {
        /**
         * The format of the file; see utf8 and binary.
         */
        format?: FormatSymbol;
      }): Promise<string | ArrayBuffer>;

      /**
       * Writes data to a file, appending if desired.
       * The format of the file is controlled via the format option, and defaults to UTF8.
       * @param data The data to write to the file.
       * @param options
       * @return The length of the contents written to the file.
       * @throws FileIsReadOnly If writing to a read-only file.
       * @throws OutOfSpace If writing to the file causes the file system to exceed the available space (or quota).
       */
      write(
        data: string | ArrayBuffer,
        options: {
          /**
           * The format of the file; see utf8 and binary.
           */
          format?: FormatSymbol;
          /**
           * If true, the data is written to the end of the file.
           */
          append?: boolean;
        },
      ): Promise<number>;
    }

    /**
     * Represents a folder on a file system.
     * You'll never instantiate this directly, but will get it by calling FileSystemProvider.getTemporaryFolder,
     * FileSystemProvider.getFolder, or via Folder.getEntries.
     */
    class Folder extends Entry {
      static isFolder(entry: Entry): boolean;

      /**
       * Indicates that this instance is a folder.
       * Useful for type checking.
       */
      isFolder: boolean;

      /**
       * Returns an array of entries contained within this folder.
       * @return The entries within the folder.
       */
      getEntries(): Entry[];

      /**
       * Creates an entry within this folder and returns the appropriate instance.
       * @param name The name of the entry to create.
       * @param options
       * @return The created entry.
       */
      createEntry(
        name: string,
        options: {
          /**
           * Indicates which kind of entry to create.
           * Pass folder to create a new folder.
           * Note that if the type is file then this method just create a file entry object and not the actual file on
           * the disk.
           * The file actually gets created when you call for eg: write method on the file entry object.
           */
          type?: TypeSymbol;
          /**
           * If true, the create attempt can overwrite an existing file.
           */
          overwrite?: boolean;
        },
      ): Promise<File | Folder>;

      /**
       * Creates a File Entry object within this folder and returns the appropriate instance.
       * Note that this method just create a file entry object and not the actual file on the disk.
       * The file actually gets created when you call for eg: write method on the file entry object.
       * @param name The name of the file to create.
       * @param options
       * @return The created file entry.
       */
      createFile(
        name: string,
        options: {
          /**
           * If true, the create attempt can overwrite an existing file.
           */
          overwrite?: boolean;
        },
      ): Promise<File>;

      /**
       * Creates a Folder within this folder and returns the appropriate instance.
       * @param name The name of the folder to create.
       * @return The created folder entry object.
       */
      createFolder(name: string): Promise<Folder>;

      /**
       * Gets an entry from within this folder and returns the appropriate instance.
       * @param filePath The name/path of the entry to fetch.
       * @return The fetched entry.
       */
      getEntry(filePath: string): Promise<File | Folder>;

      /**
       * Renames an entry to a new name.
       * @param entry The entry to rename.
       * @param newName The new name to assign.
       * @param options
       */
      renameEntry(
        entry: Entry,
        newName: string,
        options: {
          /**
           * If true, renaming can overwrite an existing entry.
           */
          overwrite?: boolean;
        },
      ): void;
    }

    /**
     * Provides access to files and folders on a file system.
     * You'll never instantiate this directly; instead you'll use an instance of
     * one that has already been created for you by UXP.
     */
    class FileSystemProvider {
      /**
       * Checks if the supplied object is a FileSystemProvider.
       * It's safe to use even if the object is null or undefined.
       * Useful for type checking.
       * @param fs The object to check.
       * @return  If true, the object is a file system provider;
       */
      static isFileSystemProvider(fs: FileSystemProvider): boolean;

      /**
       * Indicates that this is a FileSystemProvider.
       * Useful for type-checking.
       */
      isFileSystemProvider: boolean;

      /**
       * An array of the domains this file system supports.
       * If the file system can open a file picker to the user's documents folder, for example, then userDocuments will
       * be in this list.
       */
      supportedDomains: DomainSymbol[];

      /**
       * Gets a file (or files) from the file system provider for the purpose of opening them.
       * Files are read-only.
       * @param options
       * @return Based on allowMultiple is true or false, or empty if no file were selected.
       */
      getFileForOpening(options: {
        /**
         * The preferred initial location of the file picker.
         * If not defined, the most recently used domain from a file picker is used instead.
         */
        initialDomain?: DomainSymbol;
        /**
         * Array of file types that the file open picker displays.
         */
        types?: string[];
        /**
         * The initial location of the file picker.
         * You can pass an existing file or folder entry to suggest the picker to start at this location.
         * If this is a file entry then the method will pick its parent folder as initial location.
         * This will override initialDomain option.
         */
        initialLocation?: File | Folder;
        /**
         * If true, multiple files can be returned (as an array).
         */
        allowMultiple?: boolean;
      }): Promise<File | File[]>;

      /**
       * Gets a file reference suitable for saving.
       * The file is read-write.
       * Any file picker displayed will be of the "save" variety.
       *
       * If the user attempts to save a file that doesn't exist, the file is created automatically.
       *
       * If the act of writing to the file would overwrite it, the file picker should prompt the user if they are OK
       * with that action.
       * If not, the file should not be returned.
       * @param suggestedName Required when options.types is not defined.
       * @param options
       * @return Returns the selected file, or null if no file were selected.
       */
      getFileForSaving(suggestedName: string, options: {
        /**
         * The preferred initial location of the file picker.
         * If not defined, the most recently used domain from a file picker is used instead.
         */
        initialDomain?: DomainSymbol;
        /**
         * Allowed file extensions, with no "." prefix.
         */
        types?: string[];
      }): Promise<File>;

      /**
       * Gets a folder from the file system via a folder picker dialog.
       * The files and folders within can be accessed via Folder#getEntries.
       * Any files within are read-write.
       *
       * If the user dismisses the picker, null is returned instead.
       * @param options
       * @return The selected folder or null if no folder is selected.
       */
      getFolder(options: {
        /**
         * The preferred initial location of the file picker.
         * If not defined, the most recently used domain from a file picker is used instead.
         */
        initialDomain?: DomainSymbol;
      }): Promise<Folder>;

      /**
       * Returns a temporary folder.
       * The contents of the folder will be removed when the extension is disposed.
       * @return Folder.
       */
      getTemporaryFolder(): Promise<Folder>;

      /**
       * Returns a folder that can be used for extension's data storage without user interaction.
       * It is persistent across host-app version upgrades.
       * @return Folder
       */
      getDataFolder(): Promise<Folder>;

      /**
       * Returns an plugin's folder – this folder and everything within it are read only.
       * This contains all the Plugin related packaged assets.
       * @return Folder.
       */
      getPluginFolder(): Promise<Folder>;

      /**
       * Returns the fs url of given entry.
       * @param entry
       * @return The fs url of given entry.
       */
      getFsUrl(entry: Entry): string;

      /**
       * Returns the platform native file system path of given entry.
       * @param entry
       * @return The platform native file system path of given entry.
       */
      getNativePath(entry: Entry): string;

      /**
       * Returns a token suitable for use with certain host-specific APIs (such as Photoshop).
       * This token is valid only for the current plugin session.
       * As such, it is of no use if you serialize the token to persistent storage, as the token will be invalid in the
       * future.
       *
       * Note: When using the Photoshop DOM API, pass the instance of the file instead of a session token -- Photoshop
       * will convert the entry into a session token automatically on your behalf.
       * @param entry
       * @return The session token for the given entry.
       */
      createSessionToken(entry: Entry): string;

      /**
       * Returns the file system Entry that corresponds to the session token obtained from createSessionToken.
       * If an entry cannot be found that matches the token, then a Reference Error: token is not defined error is
       * thrown.
       * @param token
       * @return The corresponding entry for the session token.
       */
      getEntryForSessionToken(token: string): Entry;

      /**
       * Returns a token suitable for use with host-specific APIs (such as Photoshop), or for storing a persistent
       * reference to an entry (useful if you want to only ask for permission to access a file or folder once).
       * A persistent token is not guaranteed to last forever -- certain scenarios can cause the token to longer work
       * (including moving files, changing permissions, or OS-specific limitations).
       * If a persistent token cannot be reused, you'll get an error at the time of use.
       * @param entry
       * @return The persistent token for the given entry.
       */
      createPersistentToken(entry: Entry): Promise<string>;

      /**
       * Returns the file system Entry that corresponds to the persistent token obtained from createPersistentToken.
       * If an entry cannot be found that matches the token, then a Reference Error: token is not defined error is
       * thrown.
       *
       * Note: Retrieving an entry for a persistent token does not guarantee that the entry is valid for use.
       * You'll need to properly handle the case where the entry no longer exists on the disk, or the permissions have
       * changed by catching the appropriate errors.
       * If that occurs, the suggested practice is to prompt the user for the entry again and store the new token.
       * @param token
       * @return The corresponding entry for the persistent token.
       */
      getEntryForPersistentToken(token: string): Promise<Entry>;
    }

    class LocalFileSystemProvider extends FileSystemProvider {
    }

    const localFileSystem: LocalFileSystemProvider;

    /**
     * SecureStorage provides a protected storage which can be used to store sensitive data per plugin.
     * SecureStorage takes a key-value pair and encrypts the value before being stored.
     * After encryption, it stores the key and the encrypted value pair.
     * When the value is requested with an associated key, it's retrieved after being decrypted.
     * Please note that the key is not encrypted thus it's not protected by the cryptographic operation.
     */
    namespace secureStorage {
      /**
       * Returns number of items stored in the secure storage.
       * @return Returns the number of items.
       */
      const length: number;

      /**
       * Store a key and value pair after the value is encrypted in a secure storage.
       * @param key A key to set value.
       * @param value A value for a key.
       */
      function setItem(
        key: string,
        value: string | ArrayBuffer | Uint8Array,
      ): Promise<void>;

      /**
       * Retrieve a value associated with a provided key after the value is being decrypted from a secure storage.
       * @param key A key to get value.
       * @return A value as buffer.
       */
      function getItem(key: string): Promise<Uint8Array>;

      /**
       * Remove a value associated with a provided key.
       * @param key A key to remove value.
       */
      function removeItem(key: string): Promise<void>;

      /**
       * Returns a key which is stored at the given index.
       * @param index
       * @return Returns the key which is stored at the given index.
       */
      function key(index: number): string;

      /**
       * Clear all values in a secure storage.
       * @return Resolved when all the items are cleared.
       * Rejected when there is no item to clear or clear failed.
       */
      function clear(): Promise<void>;
    }
  }

  /**
   * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/os/OS/
   */
  namespace os {
    /**
     * Gets the platform we are running on (eg. "win32", "win10", "darwin").
     * @return The string representing the platform.
     */
    function platform(): string;

    /**
     * Gets the release number of the os (eg. "10.0.1.1032").
     * @return The string representing the release.
     */
    function release(): string;

    /**
     * Gets the platform architecture we are running on (eg. "x32, x64, x86_64 etc").
     * @return The string representing the architecture.
     */
    function arch(): string;

    /**
     * Gets the platform cpu information we are running on (eg. "{'Intel(R) Core(TM) i9-8950HK CPU @ 2.90GHz', 2900}").
     * @return The array of objects containing information about each logical CPU core.
     * Currently only model and speed properties are supported.
     * Times property is not supported.
     * Access to CPU information, such as model string and frequency, is limited on UWP.
     * "ARM based architecture" or "X86 based architecture" is returned as a 'model' value on UWP.
     * 0 is returned as a 'speed' value on UWP.
     */
    function cpus(): {
      model: string;
      speed: number;
    }[];

    /**
     * Gets the total amount of system memory in bytes.
     * @return The total amount of system memory in bytes as an integer.
     */
    function totalmem(): number;

    /**
     * Gets the total amount of free system memory in bytes.
     * @return The total amount of free system memory in bytes as an integer.
     */
    function freemem(): number;

    /**
     * Gets the home directory path of the user.
     * @return The home directory path of the user.
     */
    function homedir(): string;
  }
}

type DomainSymbol = symbol & { _brand: { domainSymbol: undefined } };

type FormatSymbol = symbol & { _brand: { formatSymbol: undefined } };

type ModeSymbol = symbol & { _brand: { modeSymbol: undefined } };

type TypeSymbol = symbol & { _brand: { typeSymbol: undefined } };

/**
 * Metadata for an entry.
 * It includes useful information such as:
 * - size of the file (if a file)
 * - date created
 * - date modified
 * - name
 *
 * Instantiate `EntryMetadata` by using Entry's getMetadata().
 * In order to instantiate `Entry`, you will need to first invoke the `localFileSystem` and then fetch an instance of a File or Folder.
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/EntryMetadata/}
 *
 * @example
 * ```js
 * const fs = require('uxp').storage.localFileSystem;
 * const folder = await fs.getPluginFolder(); // Gets an instance of Folder (or Entry)
 * const entryMetaData = await folder.getMetadata();
 * console.log(entryMetaData.name);
 * ```
 */
export interface EntryMetadata {
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
 *
 * You can get an instance of Entry via the `localFileSystem` by fetching an instance of a File or Folder.
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/Entry/}
 *
 * @example
 * ```js
 * // Since Entry cannot be called directly we can use a File or Folder object to invoke Entry as shown below
 * const fs = require('uxp').storage.localFileSystem;
 * const folder = await fs.getPluginFolder(); // returns a Folder instance
 * const folderEntry = await folder.getEntry("entryName.txt");
 * // Now we can use folderEntry to invoke the APIs provided by Entry
 * console.log(folderEntry.isEntry); // isEntry is an API of Entry, in this example it will return true
 * ```
 */
export class Entry {
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
   *
   * @param folder The folder to which to copy this entry.
   * @param options Options for the copy operation (all properties are optional)
   * @throws EntryExists If the attempt would overwrite an entry and overwrite is false.
   * @throws PermissionDenied If the underlying file system rejects the attempt.
   * @throws OutOfSpace If the file system is out of storage space.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/Entry/#copytofolder-options}
   *
   * @example
   * ```js
   * await someFile.copyTo(someFolder);
   * ```
   *
   * @example
   * ```js
   * await someFile.copyTo(someFolder, {overwrite: true});
   * ```
   *
   * @example
   * ```js
   * await someFolder.copyTo(anotherFolder, {overwrite: true, allowFolderCopy: true});
   * ```
   */
  copyTo(
    folder: Folder,
    options?: {
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
   *
   * @param folder The folder to which to move this entry.
   * @param options Options for the move operation (all properties are optional)
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/Entry/#movetofolder-options}
   *
   * @example
   * ```js
   * await someFile.moveTo(someFolder);
   * ```
   *
   * @example
   * ```js
   * await someFile.moveTo(someFolder, {overwrite: true});
   * ```
   *
   * @example
   * ```js
   * await someFolder.moveTo(anotherFolder, {overwrite: true});
   * ```
   *
   * @example
   * ```js
   * await someFile.moveTo(someFolder, {newName: 'masterpiece.txt'})
   * ```
   *
   * @example
   * ```js
   * await someFile.moveTo(someFolder, {newName: 'novel.txt', {overwrite: true})
   * ```
   */
  moveTo(
    folder: Folder,
    options?: {
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
   *
   * Note: Currently when using this method, a permission denied error will occur if attempting to delete
   * a folder that was selected from a storage picker or added via drag-and-drop.
   *
   * @returns The number is 0 if succeeded, otherwise throws an Error.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/Entry/#delete}
   *
   * @example
   * ```js
   * await aFile.delete();
   * ```
   */
  delete(): Promise<number>;

  /**
   * Returns this entry's metadata.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/Entry/#getmetadata}
   *
   * @example
   * ```js
   * const metadata = aFile.getMetadata();
   * ```
   */
  getMetadata(): Promise<EntryMetadata>;

  /**
   * Indicates that this instance is an Entry.
   * Useful for type-checking.
   *
   * @example
   * ```js
   * if (something.isEntry) {
   *   return something.getMetadata();
   * }
   * ```
   */
  readonly isEntry: boolean;

  /**
   * Indicates that this instance is not a File.
   * Useful for type-checking.
   *
   * @example
   * ```js
   * if (!anEntry.isFile) {
   *   return "This entry is not a file.";
   * }
   * ```
   */
  readonly isFile: boolean;

  /**
   * Indicates that this instance is not a folder.
   * Useful for type-checking.
   *
   * @example
   * ```js
   * if (!anEntry.isFolder) {
   *   return "This entry is not a folder.";
   * }
   * ```
   */
  readonly isFolder: boolean;

  /**
   * The name of this entry.
   * Read-only.
   *
   * @example
   * ```js
   * console.log(anEntry.name);
   * ```
   */
  readonly name: string;

  /**
   * The associated provider that services this entry.
   * Read-only.
   *
   * @example
   * ```js
   * if (entryOne.provider !== entryTwo.provider) {
   *   throw new Error("Providers are not the same");
   * }
   * ```
   */
  readonly provider: FileSystemProvider;

  /**
   * The url of this entry.
   * You can use this url as input to other entities of the extension system like for eg: set as src attribute of a
   * Image widget in UI.
   * Read-only.
   *
   * @example
   * ```js
   * console.log(anEntry.url);
   * ```
   */
  readonly url: string;

  /**
   * The platform native file-system path of this entry.
   * Read-only
   *
   * @example
   * ```js
   * console.log(anEntry.nativePath);
   * ```
   */
  readonly nativePath: string;
}

/**
 * Represents a file on a file system.
 * Provides methods for reading from and writing to the file.
 * You'll never instantiate a File directly; instead you'll get access via a storage.FileSystemProvider.
 *
 * Keep in mind that `File` as such doesn't need a `require()` statement, however a `localFileSystem` will need it.
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/File/}
 *
 * @example
 * ```js
 * // Get the object of a File instance
 * const fs = require('uxp').storage.localFileSystem;
 * const file = await fs.createEntryWithUrl("file:/Users/user/Documents/tmp"); // Gets a File instance
 * console.log(file.isFile); // returns true
 * ```
 */
export class File extends Entry {
  /**
   * Determines if the entry is a file or not.
   * This is safe to use even if the entry is null or undefined.
   *
   * @param entry The entry to check.
   * @returns If true, the entry is a file.
   */
  static isFile(entry: Entry): boolean;

  /**
   * Indicates that this instance is a file.
   *
   * @example
   * ```js
   * if (anEntry.isFile) {
   *   await anEntry.read();
   * }
   * ```
   */
  readonly isFile: true;

  /**
   * Indicates whether this file is read-only or read-write.
   * See readOnly and readWrite.
   *
   * @example
   * ```js
   * if (aFile.mode === modes.readOnly) {
   *   throw new Error("Can't write to a file opened as read-only.");
   * }
   * ```
   */
  mode: ModeSymbol;

  /**
   * Reads data from the file and returns it.
   * The file format can be specified with the format option.
   * If a format is not supplied, the file is assumed to be a text file using UTF8 encoding.
   *
   * @param options Options for the read operation (all properties are optional)
   * @returns The contents of the file.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/File/#readoptions}
   *
   * @example
   * ```js
   * const text = await myNovel.read();
   * ```
   *
   * @example
   * ```js
   * const data = await myNovel.read({format: formats.binary});
   * ```
   */
  read(options?: {
    /**
     * The format of the file; see utf8 and binary.
     */
    format?: FormatSymbol;
  }): Promise<string | ArrayBuffer>;

  /**
   * Writes data to a file, appending if desired.
   * The format of the file is controlled via the format option, and defaults to UTF8.
   *
   * @param data The data to write to the file.
   * @param options Options for the write operation (all properties are optional)
   * @returns The length of the contents written to the file.
   * @throws FileIsReadOnly If writing to a read-only file.
   * @throws OutOfSpace If writing to the file causes the file system to exceed the available space (or quota).
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/File/#writedata-options}
   *
   * @example
   * ```js
   * await myNovel.write("It was a dark and stormy night.\n");
   * await myNovel.write("Cliches and tropes aside, it really was.", {append: true});
   * ```
   *
   * @example
   * ```js
   * const data = new ArrayBuffer();
   * await aDataFile.write(data, {format: formats.binary});
   * ```
   */
  write(
    data: string | ArrayBuffer,
    options?: {
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
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/Folder/}
 *
 * @example
 * ```js
 * // Get the Folder instance via localFileSystem
 * const fs = require('uxp').storage.localFileSystem;
 * const folder = await fs.getTemporaryFolder(); // Gets the Folder instance
 * console.log(folder.isFolder); // returns true
 * ```
 */
export class Folder extends Entry {
  static isFolder(entry: Entry): boolean;

  /**
   * Indicates that this instance is a folder.
   * Useful for type checking.
   */
  readonly isFolder: true;

  /**
   * Returns an array of entries contained within this folder.
   *
   * @returns The entries within the folder.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/Folder/#getentries}
   *
   * @example
   * ```js
   * const entries = await aFolder.getEntries();
   * const allFiles = entries.filter(entry => entry.isFile);
   * ```
   */
  getEntries(): Promise<Entry[]>;

  /**
   * Creates an entry within this folder and returns the appropriate instance.
   *
   * @param name The name of the entry to create.
   * @param options Options for the create operation (all properties are optional)
   * @returns The created entry.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/Folder/#createentryname-options}
   *
   * @example
   * ```js
   * const myNovel = await aFolder.createEntry("mynovel.txt");
   * ```
   *
   * @example
   * ```js
   * const catImageCollection = await aFolder.createEntry("cats", {type: types.folder});
   * ```
   */
  createEntry(
    name: string,
    options?: {
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
   *
   * @param name The name of the file to create.
   * @param options Options for the create operation (all properties are optional)
   * @returns The created file entry.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/Folder/#createfilename-options}
   *
   * @example
   * ```js
   * const myNovelTxtFile = await aFolder.createFile("mynovel.txt");
   * ```
   */
  createFile(
    name: string,
    options?: {
      /**
       * If true, the create attempt can overwrite an existing file.
       */
      overwrite?: boolean;
    },
  ): Promise<File>;

  /**
   * Creates a Folder within this folder and returns the appropriate instance.
   *
   * @param name The name of the folder to create.
   * @returns The created folder entry object.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/Folder/#createfoldername}
   *
   * @example
   * ```js
   * const myCollectionsFolder = await aFolder.createFolder("collections");
   * ```
   */
  createFolder(name: string): Promise<Folder>;

  /**
   * Gets an entry from within this folder and returns the appropriate instance.
   *
   * @param filePath The name/path of the entry to fetch.
   * @returns The fetched entry.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/Folder/#getentryfilepath}
   *
   * @example
   * ```js
   * const myNovel = await aFolder.getEntry("mynovel.txt");
   * ```
   */
  getEntry(filePath: string): Promise<File | Folder>;

  /**
   * Renames an entry to a new name.
   *
   * @param entry The entry to rename.
   * @param newName The new name to assign.
   * @param options Options for the rename operation (all properties are optional)
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/Folder/#renameentryentry-newname-options}
   *
   * @example
   * ```js
   * await myNovels.renameEntry(myNovel, "myFantasticNovel.txt");
   * ```
   */
  renameEntry(
    entry: Entry,
    newName: string,
    options?: {
      /**
       * If true, renaming can overwrite an existing entry.
       */
      overwrite?: boolean;
    },
  ): Promise<void>;
}

/**
 * Provides access to files and folders on a file system.
 * You'll never instantiate this directly; instead you'll use an instance of
 * one that has already been created for you by UXP.
 *
 * These APIs work with UXP Manifest version v5 and above.
 *
 * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/}
 */
export class FileSystemProvider {
  /**
   * Checks if the supplied object is a FileSystemProvider.
   * It's safe to use even if the object is null or undefined.
   * Useful for type checking.
   *
   * @param fs The object to check.
   * @returns If true, the object is a file system provider.
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
   *
   * @example
   * ```js
   * if (fs.supportedDomains.contains(domains.userDocuments)) {
   *   console.log("We can open a picker to the user's documents.")
   * }
   * ```
   */
  supportedDomains: DomainSymbol[];

  /**
   * Gets a file (or files) from the file system provider for the purpose of opening them.
   * Files are read-only.
   *
   * Multiple files can be returned if the `allowMultiple` option is `true`.
   *
   * @param options Options for the file picker (all properties are optional)
   * @returns Based on allowMultiple is true or false, or empty if no file were selected.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/#getfileforopeningoptions}
   *
   * @example
   * ```js
   * const folder = await fs.getFolder({initialDomain: domains.userDocuments});
   * const file = await fs.getFileForOpening({initialLocation: folder});
   * if (!file) {
   *   // no file selected
   *   return;
   * }
   * const text = await file.read();
   * ```
   *
   * @example
   * ```js
   * const files = await fs.getFileForOpening({allowMultiple: true, types: fileTypes.images});
   * if (files.length === 0) {
   *   // no files selected
   * }
   * ```
   */
  getFileForOpening(options?: {
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
   *
   * @param suggestedName Required when options.types is not defined.
   * @param options Options for the file picker (all properties are optional)
   * @returns Returns the selected file, or null if no file were selected.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/#getfileforsavingsuggestedname-options}
   *
   * @example
   * ```js
   * const file = await fs.getFileForSaving("output.txt", {types: ["txt"]});
   * if (!file) {
   *   // file picker was cancelled
   *   return;
   * }
   * await file.write("It was a dark and stormy night");
   * ```
   */
  getFileForSaving(suggestedName: string, options?: {
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
   *
   * @param options Options for the folder picker (all properties are optional)
   * @returns The selected folder or null if no folder is selected.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/#getfolderoptions}
   *
   * @example
   * ```js
   * const folder = await fs.getFolder();
   * const myNovel = (await folder.getEntries()).filter(entry => entry.name.indexOf('novel') > 0);
   * const text = await myNovel.read();
   * ```
   */
  getFolder(options?: {
    /**
     * The preferred initial location of the file picker.
     * If not defined, the most recently used domain from a file picker is used instead.
     */
    initialDomain?: DomainSymbol;
  }): Promise<Folder>;

  /**
   * Returns a temporary folder.
   * The contents of the folder will be removed when the extension is disposed.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/#gettemporaryfolder}
   *
   * @example
   * ```js
   * const temp = await fs.getTemporaryFolder();
   * ```
   */
  getTemporaryFolder(): Promise<Folder>;

  /**
   * Returns a folder that can be used for extension's data storage without user interaction.
   * It is persistent across host-app version upgrades.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/#getdatafolder}
   */
  getDataFolder(): Promise<Folder>;

  /**
   * Returns an plugin's folder – this folder and everything within it are read only.
   * This contains all the Plugin related packaged assets.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/#getpluginfolder}
   */
  getPluginFolder(): Promise<Folder>;

  /**
   * Returns the fs url of given entry.
   *
   * @param entry
   * @returns The fs url of given entry.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/#getfsurlentry}
   */
  getFsUrl(entry: Entry): string;

  /**
   * Returns the platform native file system path of given entry.
   *
   * @param entry
   * @returns The platform native file system path of given entry.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/#getnativepathentry}
   */
  getNativePath(entry: Entry): string;

  /**
   * Creates an entry for the given url and returns the appropriate instance.
   *
   * @param url The url to create an Entry object. Note that file: scheme has limited support in UWP due to the strict File access permissions.
   * @param options Options for the create operation (all properties are optional)
   * @returns The File or Folder object which is created for the given url.
   * @throws Error if invalid file url format or value is passed.
   *         if the parent folder of the file/folder to be created does not exist.
   *         if a folder already exists at the url.
   *         if a file already exists at the url and it is requested to create a folder.
   *         if a file already exists at the url and the overwrite option is not set to true to create a file.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/#createentrywithurlurl-options}
   *
   * @example
   * ```js
   * const newImgFolder = await fs.createEntryWithUrl("plugin-temp:/img", {type: types.folder});
   * const newTmpFolder = await fs.createEntryWithUrl("file:/Users/user/Documents/tmp", {type: types.folder});
   * ```
   *
   * @example
   * ```js
   * const newDatFile = await fs.createEntryWithUrl("plugin-temp:/tmp/test.dat", {overwrite: true});
   * const newTxtFile = await fs.createEntryWithUrl("file:/Users/user/Documents/test.txt", {overwrite: true});
   * ```
   */
  createEntryWithUrl(
    url: string,
    options?: {
      /**
       * Indicates which kind of entry to create. Pass types.folder to create a new folder.
       * Note that if the type is file then this method just creates a file entry object and not the actual file on the disk.
       * File on the storage is created when data is written into the file. eg: call write method on the file entry object.
       */
      type?: TypeSymbol;
      /**
       * If true, the create attempt can overwrite an existing file.
       */
      overwrite?: boolean;
    },
  ): Promise<File | Folder>;

  /**
   * Returns a token suitable for use with certain host-specific APIs (such as Photoshop).
   * This token is valid only for the current plugin session.
   * As such, it is of no use if you serialize the token to persistent storage, as the token will be invalid in the
   * future.
   *
   * Note: When using the Photoshop DOM API, pass the instance of the file instead of a session token -- Photoshop
   * will convert the entry into a session token automatically on your behalf.
   *
   * @param entry
   * @returns The session token for the given entry.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/#createsessiontokenentry}
   *
   * @example
   * ```js
   * const fs = require('uxp').storage.localFileSystem;
   * let entry = await fs.getFileForOpening();
   * let token = fs.createSessionToken(entry);
   * let result = await require('photoshop').action.batchPlay([{
   *   _obj: "open",
   *   "target": {
   *     _path: token, // Rather than a system path, this expects a session token
   *     _kind: "local",
   *   }
   * }], {});
   * ```
   */
  createSessionToken(entry: Entry): string;

  /**
   * Returns the file system Entry that corresponds to the session token obtained from createSessionToken.
   * If an entry cannot be found that matches the token, then a Reference Error: token is not defined error is
   * thrown.
   *
   * @param token
   * @returns The corresponding entry for the session token.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/#getentryforsessiontokentoken}
   */
  getEntryForSessionToken(token: string): Entry;

  /**
   * Returns a token suitable for use with host-specific APIs (such as Photoshop), or for storing a persistent
   * reference to an entry (useful if you want to only ask for permission to access a file or folder once).
   * A persistent token is not guaranteed to last forever -- certain scenarios can cause the token to longer work
   * (including moving files, changing permissions, or OS-specific limitations).
   * If a persistent token cannot be reused, you'll get an error at the time of use.
   *
   * @param entry
   * @returns The persistent token for the given entry.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/#createpersistenttokenentry}
   *
   * @example
   * ```js
   * const fs = require('uxp').storage.localFileSystem;
   * let entry = await fs.getFileForOpening();
   * let token = await fs.createPersistentToken(entry);
   * localStorage.setItem("persistent-file", token);
   * ```
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
   *
   * @param token
   * @returns The corresponding entry for the persistent token.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/#getentryforpersistenttokentoken}
   *
   * @example
   * ```js
   * const fs = require('uxp').storage.localFileSystem;
   * let entry, contents, tries = 3, success = false;
   * while (tries > 0) {
   *   try {
   *     entry = await fs.getEntryForPersistentToken(localStorage.getItem("persistent-file"));
   *     contents = await entry.read();
   *     tries = 0;
   *     success = true;
   *   } catch(err) {
   *     entry = await fs.getFileForOpening();
   *     localStorage.setItem("persistent-token", await fs.createPersistentToken(entry));
   *     tries--;
   *   }
   * }
   * if (!success) {
   *   // fail gracefully somehow
   * }
   * ```
   */
  getEntryForPersistentToken(token: string): Promise<Entry>;

  /**
   * Gets an entry of the given url and returns the appropriate instance.
   *
   * @param url
   * @returns The corresponding entry for the given url.
   * @throws Error if invalid file url format or value is passed. if the file/folder does not exist at the url.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Persistent%20File%20Storage/FileSystemProvider/#getentrywithurlurl}
   *
   * @example
   * ```js
   * const tmpFolder = await fs.getEntryWithUrl("plugin-temp:/tmp");
   * const docFolder = await fs.getEntryWithUrl("file:/Users/user/Documents");
   * const tmpFile = await fs.getEntryWithUrl("plugin-temp:/tmp/test.dat");
   * const docFile = await fs.getEntryWithUrl("file:/Users/user/Documents/test.txt");
   * ```
   */
  getEntryWithUrl(url: string): Promise<Entry>;
}

export class LocalFileSystemProvider extends FileSystemProvider {}

/**
 * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/uxp/Persistent%20File%20Storage/
 */
interface Storage {

  /**
   * Common locations that we can use when displaying a file picker.
   */
  domains: {
    /**
     * Local application cache directory (persistence not guaranteed).
     */
    appLocalCache: DomainSymbol;
    /**
     * Local application data.
     */
    appLocalData: DomainSymbol;
    /**
     * Local application library.
     */
    appLocalLibrary: DomainSymbol;
    /**
     * Local application shared data folder.
     */
    appLocalShared: DomainSymbol;
    /**
     * Local temporary directory.
     */
    appLocalTemporary: DomainSymbol;
    /**
     * Roaming application data.
     */
    appRoamingData: DomainSymbol;
    /**
     * Roaming application library data.
     */
    appRoamingLibrary: DomainSymbol;
    /**
     * The user's desktop folder.
     */
    userDesktop: DomainSymbol;
    /**
     * The user's documents folder.
     */
    userDocuments: DomainSymbol;
    /**
     * The user's music folder or library.
     */
    userMusic: DomainSymbol;
    /**
     * The user's pictures folder or library.
     */
    userPictures: DomainSymbol;
    /**
     * The user's videos / movies folder or library.
     */
    userVideos: DomainSymbol;
  };

  /**
   * This namespace describes the file content formats supported in FS methods like read and write.
   */
  formats: {
    /**
     * Binary file encoding.
     */
    binary: FormatSymbol;
    /**
     * UTF8 File encoding.
     */
    utf8: FormatSymbol;
  };

  /**
   * This namespace describes the file open modes.
   * For eg: open file in read-only or both read-write.
   */
  modes: {
    /**
     * The file is read-only; attempts to write will fail.
     */
    readOnly: ModeSymbol;
    /**
     * The file is read-write.
     */
    readWrite: ModeSymbol;
  };

  /**
   * This namespace describes the type of the entry.
   * Whether file or folder etc.
   */
  types: {
    /**
     * A file; used when creating an entity.
     */
    file: TypeSymbol;
    /**
     * A folder; used when creating an entity.
     */
    folder: TypeSymbol;
  };

  errors: {
    /**
     * Attempted to invoke an abstract method.
     */
    AbstractMethodInvocationError: Error;

    /**
     * Data and Format mismatch.
     */
    DataFileFormatMismatchError: Error;

    /**
     * Domain is not supported by the current FileSystemProvider instance.
     */
    DomainNotSupportedError: Error;

    /**
     * An attempt was made to overwrite an entry without indicating that it was safe to do so via overwrite: true.
     */
    EntryExistsError: Error;

    /**
     * The entry is not a file, but was expected to be.
     */
    EntryIsNotAFileError: Error;

    /**
     * The entry is not a folder, but was expected to be a folder.
     */
    EntryIsNotAFolderError: Error;

    /**
     * The object passed as an entry is not actually an Entry.
     */
    EntryIsNotAnEntryError: Error;

    /**
     * An attempt was made to write to a file that was opened as read-only.
     */
    FileIsReadOnlyError: Error;

    /**
     * Unsupported format type.
     */
    InvalidFileFormatError: Error;

    /**
     * The file name contains invalid characters.
     */
    InvalidFileNameError: Error;

    /**
     * The instance was expected to be a file system, but wasn't.
     */
    NotAFileSystemError: Error;

    /**
     * The file system is out of space (or quota has been exceeded).
     */
    OutOfSpaceError: Error;

    /**
     * The file system revoked permission to complete the requested action.
     */
    PermissionDeniedError: Error;

    /**
     * Attempted to execute a command that required the providers of all entries to match.
     */
    ProviderMismatchError: Error;
  };

  /**
   * This namespace describes the various file type extensions that can used be used in some FS file open methods.
   */
  fileTypes: {
    /**
     * All file types.
     */
    all: string[];
    /**
     * Image file extensions.
     */
    images: string[];
    /**
     * Text file extensions.
     */
    text: string[];
  };

  localFileSystem: LocalFileSystemProvider;

  /**
   * SecureStorage provides a protected storage which can be used to store sensitive data per plugin.
   * SecureStorage takes a key-value pair and encrypts the value before being stored.
   * After encryption, it stores the key and the encrypted value pair.
   * When the value is requested with an associated key, it's retrieved after being decrypted.
   * Please note that the key is not encrypted thus it's not protected by the cryptographic operation.
   *
   * Caveats for SecureStorage are as follows:
   *
   * 1. Data in SecureStorage can be lost for various reasons. For an example, the user could uninstall the host application
   *    and delete the secure storage. Or, the cryptographic information used by the secure storage could be damaged by the
   *    user accidentally, and it will result in loss of data without the secure storage being removed. SecureStorage should
   *    be regarded as a cache rather than a persistent storage. Data in SecureStorage should be able to be regenerated from
   *    plugins after the time of loss.
   * 2. SecureStorage is not an appropriate storage for sensitive data which wants to keep secret from the current user.
   *    SecureStorage is protected under the current user's account credential. It means the encrypted data can be at risk
   *    of being decrypted with the current user's privilege.
   *
   * @see {@link https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/uxp/Key-Value%20Storage/SecureStorage/}
   */
  secureStorage: {
    /**
     * Returns number of items stored in the secure storage.
     */
    length: number;

    /**
     * Store a key and value pair after the value is encrypted in a secure storage.
     *
     * @param key A key to set value.
     * @param value A value for a key.
     * @returns Promise that resolves when the value is stored, rejected when the value is empty or not stored.
     * @throws If either key or value doesn't have one of acceptable types.
     */
    setItem: (
      key: string,
      value: string | ArrayBuffer | Uint8Array,
    ) => Promise<void>;

    /**
     * Retrieve a value associated with a provided key after the value is being decrypted from a secure storage.
     *
     * @param key A key to get value.
     * @returns A value as buffer.
     * @throws If a key doesn't have an acceptable type.
     */
    getItem: (key: string) => Promise<Uint8Array>;

    /**
     * Remove a value associated with a provided key.
     *
     * @param key A key to remove value.
     * @returns Promise that resolves when the value associated with the key is removed, rejected when the value is neither removed nor found.
     * @throws If a key doesn't have an acceptable type.
     */
    removeItem: (key: string) => Promise<void>;

    /**
     * Returns a key which is stored at the given index.
     *
     * @param index Integer representing the number of the key.
     * @returns Returns the key which is stored at the given index.
     */
    key: (index: number) => string;

    /**
     * Clear all values in a secure storage.
     *
     * @returns Resolved when all the items are cleared.
     * Rejected when there is no item to clear or clear failed.
     */
    clear: () => Promise<void>;
  };
}

export const storage: Storage;

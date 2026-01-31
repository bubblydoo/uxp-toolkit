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
 * You'll not instantiate this directly; use Entry#getMetadata to do so.
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
export class File extends Entry {
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
export class Folder extends Entry {
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
export class FileSystemProvider {
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
   */
  secureStorage: {
    /**
     * Returns number of items stored in the secure storage.
     * @return Returns the number of items.
     */
    length: number;

    /**
     * Store a key and value pair after the value is encrypted in a secure storage.
     * @param key A key to set value.
     * @param value A value for a key.
     */
    setItem: (
      key: string,
      value: string | ArrayBuffer | Uint8Array,
    ) => Promise<void>;

    /**
     * Retrieve a value associated with a provided key after the value is being decrypted from a secure storage.
     * @param key A key to get value.
     * @return A value as buffer.
     */
    getItem: (key: string) => Promise<Uint8Array>;

    /**
     * Remove a value associated with a provided key.
     * @param key A key to remove value.
     */
    removeItem: (key: string) => Promise<void>;

    /**
     * Returns a key which is stored at the given index.
     * @param index
     * @return Returns the key which is stored at the given index.
     */
    key: (index: number) => string;

    /**
     * Clear all values in a secure storage.
     * @return Resolved when all the items are cleared.
     * Rejected when there is no item to clear or clear failed.
     */
    clear: () => Promise<void>;
  };
}

export const storage: Storage;

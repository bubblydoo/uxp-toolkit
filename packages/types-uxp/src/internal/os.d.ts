/**
 * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/os/OS/
 */
export interface OS {
  /**
   * Gets the platform we are running on (eg. "win32", "win10", "darwin").
   * @return The string representing the platform.
   */
  platform: () => string;

  /**
   * Gets the release number of the os (eg. "10.0.1.1032").
   * @return The string representing the release.
   */
  release: () => string;

  /**
   * Gets the platform architecture we are running on (eg. "x32, x64, x86_64 etc").
   * @return The string representing the architecture.
   */
  arch: () => string;

  /**
   * Gets the platform cpu information we are running on (eg. "{'Intel(R) Core(TM) i9-8950HK CPU @ 2.90GHz', 2900}").
   * @return The array of objects containing information about each logical CPU core.
   * Currently only model and speed properties are supported.
   * Times property is not supported.
   * Access to CPU information, such as model string and frequency, is limited on UWP.
   * "ARM based architecture" or "X86 based architecture" is returned as a 'model' value on UWP.
   * 0 is returned as a 'speed' value on UWP.
   */
  cpus: () => {
    model: string;
    speed: number;
  }[];

  /**
   * Gets the total amount of system memory in bytes.
   * @return The total amount of system memory in bytes as an integer.
   */
  totalmem: () => number;

  /**
   * Gets the total amount of free system memory in bytes.
   * @return The total amount of free system memory in bytes as an integer.
   */
  freemem: () => number;

  /**
   * Gets the home directory path of the user.
   * @return The home directory path of the user.
   */
  homedir: () => string;
}

export const os: OS;

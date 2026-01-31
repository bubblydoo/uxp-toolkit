/**
 * Version information. To get an instance: require("uxp").versions.
 * @see https://developer.adobe.com/photoshop/uxp/2022/uxp/reference-js/Modules/uxp/Versions/Versions/
 */
interface Versions {
  /**
   * Returns the version of UXP.
   * For example, uxp-6.0.0.
   */
  uxp: string;
  /**
   * Returns the version of the plugin.
   * This matches the version as specified in your plugin's manifest.
   */
  plugin: string;
}

export const versions: Versions;

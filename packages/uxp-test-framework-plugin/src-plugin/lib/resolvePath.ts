import { resolve as nativeResolve } from 'node:path';

/**
 * for some reason native path.resolve in UXP returns a URL object
 * this function converts it to a string
 */
export function pathResolve(...pathSegments: string[]): string {
  const urlOrString = nativeResolve(...pathSegments) as URL | string;
  if (typeof urlOrString === 'string') {
    return urlOrString;
  }
  if (isUrl(urlOrString)) {
    return urlOrString.toString();
  }
  throw new Error('Unexpected URL object');
}

function isUrl(urlOrString: any): urlOrString is URL {
  return urlOrString instanceof URL;
}

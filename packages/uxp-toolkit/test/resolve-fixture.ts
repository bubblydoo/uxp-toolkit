/* eslint-disable vars-on-top */
declare global {
  var UXP_MAIN_DIRECTORY: string;
}

export function resolveFixturePath(fixture: string) {
  const result = `${UXP_MAIN_DIRECTORY}/test/fixtures/${fixture}`;
  console.log('result', result);
  return result;
}

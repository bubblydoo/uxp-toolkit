import('./index');

declare module 'adobe:photoshop' {
  export * from 'photoshop';
  const _default: typeof import('photoshop').default;
  export default _default;
}

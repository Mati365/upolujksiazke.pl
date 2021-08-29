/* eslint-disable import/no-default-export */
declare module '*.png';
declare module '*.jpg';
declare module '*.svg';
declare module '*.jade';

declare module '*.scss' {
  const classes: {[key: string]: string};
  export default classes;
}

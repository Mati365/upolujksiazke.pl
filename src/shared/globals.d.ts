/* eslint-disable import/no-default-export */
declare module '*.png';
declare module '*.svg';

declare module '*.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

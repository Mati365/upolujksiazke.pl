import {resolve} from 'path';
import {pathsToModuleNameMapper} from 'ts-jest/utils';
import type {Config} from '@jest/types';

const {compilerOptions} = require('../tsconfig.json');

const SHARED_CONFIG: Config.InitialOptions = {
  moduleNameMapper: pathsToModuleNameMapper(
    compilerOptions.paths,
    {
      prefix: resolve(__dirname, '../'),
    },
  ),
  setupFilesAfterEnv: [
    '@testing-library/jest-dom/extend-expect',
    '@alex_neo/jest-expect-message',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules',
    '<rootDir>/dist/*',
  ],
  testRegex: './test/.*.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};

module.exports = {
  projects: [
    {
      displayName: 'upolujksiazke.pl',
      rootDir: resolve(__dirname, '../'),
      ...SHARED_CONFIG,
    },
  ],
};

const { createDefaultPreset } = require('ts-jest');

const defaultPreset = createDefaultPreset();

/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  ...defaultPreset,
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+(\\.spec)?\\.(t|j)s$': 'ts-jest'
  },
  preset: 'ts-jest',
  collectCoverageFrom: ['**/*.(t|j)s'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/', 'src/shared/generated'],
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '@/apiweb/(.*)': ['<rootDir>/modules/api/webs/$1'],
    '@/apimobile/(.*)': ['<rootDir>/modules/api/mobile/$1'],
    '@/db/(.*)': ['<rootDir>/modules/databases/$1'],
    '@/config/(.*)': ['<rootDir>/config/$1'],
    '@/schemaPrisma/(.*)': ['<rootDir>/shared/generated/$1'],
    '@/casl/(.*)': ['<rootDir>/modules/casl/$1'],
    '@/src/(.*)': ['<rootDir>/$1'],
  },
  moduleDirectories: ['node_modules', 'src'],
};

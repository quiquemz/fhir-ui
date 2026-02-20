const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  collectCoverageFrom: ['src/app/**/*.ts', 'src/lib/**/*.ts'],
  coveragePathIgnorePatterns: [
    '^[^.]+.(not-)?compile-test.ts$',
    '.*.spec.ts$',
    '.stories.ts$',
    '.routes.ts$',
    '.mock.ts$',
    '.generated.ts$',
    'provider-factories.ts',
  ],
  transform: {
    '^.+\\.(js|mjs|jsx)$': ['babel-jest', { presets: ['@babel/preset-env'] }],
    '^.+\\.(ts|tsx|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*.mjs$|lodash-es|rxjs|crypto-es|lit-html|@auth|@angular|@ngrx|@ngneat|ngx-|d3-|@swimlane|internmap))',
  ],

  // TODO: Set coverage to 80 for all params
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

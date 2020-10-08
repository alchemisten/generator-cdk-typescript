module.exports = {
    roots: ['<rootDir>/test'],
    testMatch: ['**/*.test.ts'],
    preset: 'ts-jest',
    transform: {
        '^.+\\.tsx?$': 'babel-jest'
    }
};

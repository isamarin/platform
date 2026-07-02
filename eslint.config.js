import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const relaxedTsRules = {
	'no-console': 'off',
	'no-undef': 'off',
	'@typescript-eslint/no-explicit-any': 'off',
	'@typescript-eslint/no-empty-object-type': 'off',
	'@typescript-eslint/no-unused-vars': [
		'warn',
		{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
	],
	'@typescript-eslint/no-require-imports': 'off',
	'@typescript-eslint/no-unused-expressions': 'off'
};

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	{
		ignores: ['dist/**', 'node_modules/**', 'eslint.config.js']
	},
	{
		files: ['src/**/*.ts'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: relaxedTsRules
	},
	{
		files: ['tests/**/*.ts'],
		languageOptions: {
			globals: globals.mocha
		},
		rules: relaxedTsRules
	}
);

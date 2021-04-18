// eslint-disable-next-line functional/immutable-data
module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'functional', 'deprecation', 'import'],
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:import/typescript',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:prettier/recommended',
		'prettier/@typescript-eslint',
	],
	rules: {
		'array-bracket-spacing': [2, 'never'],
		'object-curly-spacing': [2, 'always'],
		'import/no-duplicates': 'error',
		'import/no-unresolved': 'error',
		'import/first': 'error',
		'import/no-mutable-exports': 'error',
		'functional/no-let': 'error',
		'functional/immutable-data': 'warn',
		'newline-before-return': 'error',
		'no-mixed-spaces-and-tabs': 'error',
		'no-multi-spaces': 'error',
		'no-multiple-empty-lines': ['error', { max: 1 }],
		'no-restricted-exports': ['error', { restrictedNamedExports: ['default'] }],
		'no-shadow': ['warn', { builtinGlobals: true, hoist: 'functions', allow: [] }],
		'no-useless-escape': 1,
		'padding-line-between-statements': [
			'warn',
			{
				blankLine: 'always',
				prev: 'multiline-block-like',
				next: 'multiline-block-like',
			},
			{ blankLine: 'always', prev: 'block-like', next: 'multiline-block-like' },
			{
				blankLine: 'always',
				prev: 'multiline-expression',
				next: 'multiline-expression',
			},
			{ blankLine: 'always', prev: 'expression', next: 'multiline-expression' },
			{ blankLine: 'always', prev: 'multiline-const', next: 'multiline-const' },
		],
		'prefer-const': 'error',
		'prefer-destructuring': ['warn', { object: true, array: false }],
		quotes: ['error', 'single', { avoidEscape: true }],
		'@typescript-eslint/no-explicit-any': 1,
		'@typescript-eslint/no-non-null-assertion': 2,
		'@typescript-eslint/no-unused-vars': 'error',
		'@typescript-eslint/no-extra-semi': 'error',
	},
	env: { node: true, jest: true },
	settings: {
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts'],
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
			},
		},
	},
	overrides: [
		{
			files: ['*.test.ts'],
			rules: {
				'@typescript-eslint/no-explicit-any': 0,
				'@typescript-eslint/no-non-null-assertion': 0,
			},
		},
	],
}

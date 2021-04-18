import { pathParser } from './pathParser'

describe('parseIngredientsPath', () => {
	test.each([['/api/v1/'], ['/v1/']])('should return an object containing an empty handler', (path: string) => {
		const expected = {
			handlerName: '',
			subsegments: [],
		}
		expect(pathParser(path)).toStrictEqual(expected)
	})

	test.each([['/api/v1/handler/subsegment1'], ['/v1/handler/subsegment1']])(
		'should return an object containing the version, handler and subsegments for %p',
		(path: string) => {
			const expected = {
				handlerName: 'handler',
				subsegments: ['subsegment1'],
			}
			expect(pathParser(path)).toStrictEqual(expected)
		},
	)

	test.each([['/api/v1/handler'], ['/v1/handler']])(
		'should return empty array when no subsegments for %p',
		(path: string) => {
			const expected = {
				handlerName: 'handler',
				subsegments: [],
			}
			expect(pathParser(path)).toStrictEqual(expected)
		},
	)

	test.each([
		['/api/v1/handler/subsegment1/subsegment2/subsegment3'],
		['/v1/handler/subsegment1/subsegment2/subsegment3'],
	])('should return multiples subsegments for %p', (path: string) => {
		const expected = {
			handlerName: 'handler',
			subsegments: ['subsegment1', 'subsegment2', 'subsegment3'],
		}
		expect(pathParser(path)).toStrictEqual(expected)
	})
})

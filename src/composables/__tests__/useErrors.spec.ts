import {describe, expect, it} from 'vitest'
import useErrors from '@/composables/useErrors'

describe('useErrors', () => {
    const {catchHTTPError} = useErrors()

    describe('catchHTTPError', () => {
        describe('if the error code is 4XX', () => {
            it('should return the corresponding notification according to HTTP error code', () => {
                expect(catchHTTPError(403)).toEqual('403-error')
            })
        })
        describe('if the error is 5XX', () => {
            it('should return the corresponding notification according to HTTP error code', () => {
                expect(catchHTTPError(502)).toEqual('500-error')
            })
        })
    })
})
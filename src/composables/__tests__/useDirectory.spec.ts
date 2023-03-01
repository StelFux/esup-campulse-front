import {createTestingPinia} from '@pinia/testing'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {config} from '@vue/test-utils'
import useDirectory from '@/composables/useDirectory'
import {useAssociationStore} from '@/stores/useAssociationStore'
import {_associations, _associationWrongSearchSettings} from '~/fixtures/association.mock'
import {_axiosFixtures} from '~/fixtures/axios.mock'
import {useAxios} from '@/composables/useAxios'
import type {AssociationSearch} from '#/association'


vi.mock('@/composables/useAxios', () => ({
    useAxios: () => ({
        axiosPublic: _axiosFixtures,
        axiosAuthenticated: _axiosFixtures
    })
}))

config.global.plugins = [
    createTestingPinia({createSpy: vi.fn()}),
]

describe('useDirectory', () => {
    let associationStore = useAssociationStore()

    beforeEach(() => {
        associationStore = useAssociationStore()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe('filterizeSearch', () => {
        it('should return a string with no spaces, lowercase, and without accents', () => {
            const {filterizeSearch} = useDirectory()
            const unfilterized = 'association des étudiants du site Alsace'
            const filterized = 'associationdesetudiantsdusitealsace'
            expect(filterizeSearch(unfilterized)).toEqual(filterized)
        })
    })

    describe('advancedSearch', () => {
        associationStore.associations = _associations
        const {advancedSearch} = useDirectory()

        it('should return matches from associationStore if there are no previous matches', () => {
            const searchSettings: AssociationSearch = {
                search: '',
                name: 'Chimie',
                acronym: 'AEC',
                institution: 2,
                institutionComponent: 2,
                activityField: 2
            }
            const matches = advancedSearch(searchSettings)
            expect(matches).toEqual([associationStore.associations[1]])
        })

        it('should return matches based on previous ones if any', () => {
            let searchSettings: AssociationSearch = {
                search: '',
                name: '',
                acronym: 'AEC',
                institution: null,
                institutionComponent: null,
                activityField: null
            }
            let matches = advancedSearch(searchSettings)
            expect(matches).toEqual([associationStore.associations[1]])

            searchSettings = {
                search: '',
                name: '',
                acronym: '',
                institution: 2,
                institutionComponent: null,
                activityField: null
            }
            matches = advancedSearch(searchSettings)
            expect(matches).toEqual([associationStore.associations[1]])

            searchSettings = {
                search: '',
                name: '',
                acronym: '',
                institution: null,
                institutionComponent: 2,
                activityField: null
            }
            matches = advancedSearch(searchSettings)
            expect(matches).toEqual([associationStore.associations[1]])

            searchSettings = {
                search: '',
                name: '',
                acronym: '',
                institution: null,
                institutionComponent: null,
                activityField: 2
            }
            matches = advancedSearch(searchSettings)
            expect(matches).toEqual([associationStore.associations[1]])
        })

        it('should not return the associations with no matching search parameters', () => {
            const matches = advancedSearch(_associationWrongSearchSettings)
            expect(matches).not.toEqual([_associations[1]])
        })
    })

    describe('simpleAssociationSearch', () => {
        it('should call API once on /associations/?is_public=true&search=query', () => {
            const {simpleAssociationSearch} = useDirectory()
            const {axiosPublic} = useAxios()
            const mockedAxios = vi.mocked(axiosPublic, true)
            mockedAxios.get.mockResolvedValueOnce({})
            simpleAssociationSearch('query')
            expect(axiosPublic.get).toHaveBeenCalledOnce()
            expect(axiosPublic.get).toHaveBeenCalledWith('/associations/?is_public=true&search=query')
        })
    })
})

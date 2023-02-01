import {createPinia, setActivePinia} from 'pinia'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import type {User} from '#/user'
import {mockedAxios} from '~/mocks/axios.mock'
import {tokens} from '~/mocks/tokens.mock'
import {mockedGroups, mockedUser} from '~/mocks/user.mock'
import {setTokens} from '@/services/userService'
import {useUserStore} from '@/stores/useUserStore'

setActivePinia(createPinia())
let userStore = useUserStore()

describe('User store', () => {
    beforeEach(() => {
        userStore = useUserStore()
    })
    afterEach(() => {
        vi.restoreAllMocks()
    })
    describe('isAuth', () => {
        it('should be true if user has data', () => {
            userStore.user = mockedUser
            expect(userStore.isAuth).toBeTruthy()
        })
        it('should be false if user has no data', () => {
            userStore.user = undefined
            expect(userStore.isAuth).toBeFalsy()
        })
    })
    describe('isCas', () => {
        beforeEach(() => {
            userStore.user = mockedUser
            userStore.user.isCas = false
            userStore.newUser = mockedUser
            userStore.newUser.isCas = false
        })
        it('should be true if user isCas', () => {
            (userStore.user as User).isCas = true
            expect(userStore.isCas).toBeTruthy()
        })
        it('should be false is user !isCas', () => {
            expect(userStore.isCas).toBeFalsy()
        })
        it('should be true if newUser isCas', () => {
            (userStore.newUser as User).isCas = true
            expect(userStore.isCas).toBeTruthy()
        })
        it('should be false is newUser !isCas', () => {
            expect(userStore.isCas).toBeFalsy()
        })
    })
    describe('userNameFirstLetter', () => {
        it('should display capitalized first letter of firstname', () => {
            userStore.user = mockedUser
            expect(userStore.userNameFirstLetter).toBe('J')
        })
        it('should not display first letter of firstname in lower case', () => {
            userStore.user = mockedUser
            userStore.user.firstName = 'john'
            expect(userStore.userNameFirstLetter).not.toBe('j')
        })
        it('should not be displayed if user !isAuth', () => {
            userStore.user = undefined
            expect(userStore.userNameFirstLetter).toBeUndefined()
        })
    })
    describe('managerGroup', () => {
        afterEach(() => {
            userStore.user = mockedUser
            userStore.user.groups = mockedGroups
        })
        it('should be true if user is manager', () => {
            userStore.user = mockedUser
            expect(userStore.managerGroup).toBeTruthy()
        })
        it('should be false if user is not manager', () => {
            userStore.user = mockedUser
            userStore.user.groups = [
                {
                    id: 2,
                    name: 'Étudiante ou Étudiant'
                }
            ]
            expect(userStore.managerGroup).toBeFalsy()
        })
    })
    describe('isUniManager', () => {
        it('should be true if user is uniManager', () => {
            userStore.user = mockedUser
            expect(userStore.isUniManager).toBeTruthy()
        })
        it('should be false if user is not uniManager', () => {
            userStore.user = mockedUser
            userStore.user.groups = [
                {
                    id: 2,
                    name: 'Étudiante ou Étudiant'
                }
            ]
            expect(userStore.isUniManager).toBeFalsy()
        })
    })
    describe('User logout', () => {
        it('should clear local storage', () => {
            localStorage.setItem('access', tokens.access)
            localStorage.setItem('refresh', tokens.refresh)
            userStore.logOut()
            expect(localStorage.getItem('JWT__access__token')).toBeNull()
            expect(localStorage.getItem('JWT__refresh__token')).toBeNull()
        })
        it('should clear user data', () => {
            userStore.logOut()
            expect(userStore.user).toBeUndefined()
        })
    })
    describe('Load CAS user', () => {
        beforeEach(() => {
            mockedAxios.post.mockResolvedValueOnce({
                data: {
                    user: mockedUser,
                    accessToken: tokens.access,
                    refreshToken: tokens.refresh
                }
            })
            userStore.loadCASUser('ticket')
        })
        it('should populate newUser data', () => {
            expect(userStore.newUser).toEqual(mockedUser)
        })
        /*it('should set user\'s access and refresh tokens', () => {
            expect(localStorage.getItem('JWT__access__token')).toEqual(tokens.access)
            expect(localStorage.getItem('JWT__refresh__token')).toEqual(tokens.refresh)
        })*/
        /*it('should be called once', () => {
            expect(mockedAxios.post).toHaveBeenCalledOnce()
        })*/
        /*it('should call API on /users/auth/cas/login/', () => {
            // const service = 'http://localhost:3000/cas-register'
            expect(mockedAxios.post).toHaveBeenCalledWith('/users/auth/cas/login/', {
                ticket: 'ticket',
                service: 'service'
            })
        })*/
    })
    describe('Unload user', () => {
        it('should clear all data from user', () => {
            userStore.user = mockedUser
            userStore.unLoadUser()
            expect(userStore.user).toBeUndefined()
        })
    })
    describe('Unload newUser', () => {
        beforeEach(() => {
            userStore.newUser = mockedUser
            setTokens(tokens.access, tokens.refresh)
            userStore.unLoadNewUser()
        })
        it('should remove tokens', () => {
            expect(localStorage.getItem('JWT__access__token')).toBeNull()
            expect(localStorage.getItem('JWT__refresh__token')).toBeNull()
        })
        it('should remove all data from newUser', () => {
            expect(userStore.newUser).toBeUndefined()
        })
    })
    describe('getUserAssociationsRoles', () => {
        afterEach(() => {
            userStore.user = undefined
            userStore.userAssociationsRoles = []
        })
        describe('If user has associations', () => {
            it('should call API once on /users/associations/ and populate userAssociationsRoles in store', async () => {
                userStore.user = mockedUser
                const data = [
                    {
                        user: 'john',
                        roleName: 'Trésorier',
                        hasOfficeStatus: true,
                        isPresident: false,
                        association: 1
                    }
                ]
                mockedAxios.get.mockResolvedValueOnce({data})
                await userStore.getUserAssociationsRoles()
                expect(mockedAxios.get).toHaveBeenCalledOnce()
                expect(mockedAxios.get).toHaveBeenCalledWith('/users/associations/')
                expect(userStore.userAssociationsRoles).toEqual(data)
            })
        })
        describe('If user has no association', () => {
            it('should not call API and do nothing to the store', async () => {
                await userStore.getUserAssociationsRoles()
                expect(mockedAxios.get).toHaveBeenCalledTimes(0)
                expect(userStore.userAssociationsRoles).toEqual([])
            })
        })
    })
    describe('hasOfficeStatus', () => {
        describe('If user has associations', () => {
            afterEach(() => {
                userStore.userAssociationsRoles = []
            })
            it('should find the right association by id and check is hasOfficeStatus is true', () => {
                const roles = [
                    {
                        user: 'john',
                        roleName: 'Trésorier',
                        hasOfficeStatus: true,
                        isPresident: false,
                        association: 1
                    }
                ]
                userStore.userAssociationsRoles = roles
                expect(userStore.hasOfficeStatus(roles[0].association)).toBeTruthy()
            })
            it('should return false if hasOfficeStatus is false', () => {
                const roles = [
                    {
                        user: 'jane',
                        roleName: 'Membre',
                        hasOfficeStatus: false,
                        isPresident: false,
                        association: 1
                    }
                ]
                userStore.userAssociationsRoles = roles
                expect(userStore.hasOfficeStatus(roles[0].association)).toBeFalsy()
            })
        })
        describe('If user has no associations', () => {
            it('should return false', () => {
                expect(userStore.hasOfficeStatus(undefined)).toBeFalsy()
            })
        })
    })
})

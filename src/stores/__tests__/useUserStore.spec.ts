import { beforeEach, describe, it, expect } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { User } from '#/user'
import { useUserStore } from '@/stores/useUserStore'

// mock User
const user: User | undefined = {
    id: 1,
    password: 'motdepasse',
    last_login: null,
    is_superuser: false,
    username: 'john.lennon@bbc.com',
    first_name: 'John',
    last_name: 'Lennon',
    phone: null,
    email: 'john.lennon@bbc.com',
    is_staff: false,
    is_active: false,
    date_joined: '',
    is_cas: null,
    status: 'user'
}

// mock access_token
const access_token = '0123456789'

describe('User store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })
    describe('User auth', () => {
        it('should be true if user has data', () => {
            const userStore = useUserStore()
            userStore.user = user

            expect(userStore.isAuth).toBeTruthy()
        })
        it('should be false if user has no data', () => {
            const userStore = useUserStore()
            userStore.user = undefined

            expect(userStore.isAuth).toBeFalsy()
        })
    })
    describe('User avatar', () => {
        it('should display capitalized first letter of firstname', () => {
            const userStore = useUserStore()
            userStore.user = user

            expect(userStore.userNameFirstLetter).toBe('J')
        })
        it('should not display first letter of firstname in lower case', () => {
            const userStore = useUserStore()
            userStore.user = user
            userStore.user.first_name = 'john'

            expect(userStore.userNameFirstLetter).not.toBe('j')
        })
    })
    describe('User logout', () => {
        it('should clear local storage', () => {
            localStorage.setItem('access', access_token)
            const userStore = useUserStore()
            userStore.user = user
            userStore.logOut()

            expect(localStorage.getItem('access')).toBeNull()
        })
        it('should clear user data', () => {
            const userStore = useUserStore()
            userStore.user = user
            userStore.logOut()

            expect(userStore.user).toBeUndefined()
        })
    })
})

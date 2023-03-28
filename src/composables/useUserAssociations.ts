import {ref} from 'vue'
import type {
    AssociationMember,
    AssociationRole,
    AssociationUser,
    AssociationUserDetail,
    User,
    UserManagerStore,
    UserStore
} from '#/user'
import {useAxios} from '@/composables/useAxios'
import {useUserStore} from '@/stores/useUserStore'
import {useUserManagerStore} from '@/stores/useUserManagerStore'
import i18n from '@/plugins/i18n'
import {useAssociationStore} from "@/stores/useAssociationStore";
import useSecurity from "@/composables/useSecurity";
import type {Association} from "#/association";


// Used to store a user's associations, while it is modified by a manager or during registration
const userAssociations = ref<AssociationRole[]>([])

// Used to register new associations
const newAssociations = ref<AssociationRole[]>([])

// Used to store a user's new association user links
const newAssociationsUser = ref<AssociationUser[]>([])

// Used for presidency delegation and association management
const associationMembers = ref<AssociationMember[]>([])


export default function () {

    const userStore = useUserStore()
    const userManagerStore = useUserManagerStore()
    const associationStore = useAssociationStore()

    /* Used to create the options for the select in the form to create an association. */
    const associationRoleOptions = [
        {
            label: i18n.global.t('forms.im-association-president'),
            value: 'isPresident',
        },
        {
            label: i18n.global.t('forms.im-association-secretary'),
            value: 'isSecretary'
        },
        {
            label: i18n.global.t('forms.im-association-treasurer'),
            value: 'isTreasurer'
        },
        {
            label: i18n.global.t('forms.im-association-vice-president'),
            value: 'isVicePresident'
        },
        {
            label: i18n.global.t('forms.im-association-member'),
            value: 'isMember'
        }
    ]

    /**
     * It updates the user associations when it is modified by a manager
     */
    // To test
    function updateUserAssociations(editedByStaff: boolean) {
        let userId = userStore.user?.id
        if (editedByStaff) userId = userManagerStore.user?.id

        userAssociations.value.forEach(async function (association) {
            // If we need to delete the association
            if (association.id && association.deleteAssociation) {
                await deleteUserAssociation(userId, association.id)
                // Reactively remove the deleted item from interface
                if (!editedByStaff) {
                    userAssociations.value.splice(userAssociations.value.findIndex(obj => obj.id === association.id))
                    userStore.user?.associations.splice(userAssociations.value.findIndex(obj => obj.id === association.id))
                }
            }
            // If we need to update the association
            else {
                // We search for the corresponding association in store
                let storeAssociation: AssociationUserDetail | undefined
                if (editedByStaff) {
                    storeAssociation = userManagerStore.userAssociations.find(obj => obj.association?.id === association.id)
                } else {
                    storeAssociation = userStore.userAssociations.find(obj => obj.association?.id === association.id)
                }
                // We set a boolean to track changes
                let hasChanges = false
                // We compare the 2 objects
                if (storeAssociation?.canBePresident !== association.canBePresident) hasChanges = true
                if (storeAssociation?.isPresident && association.role !== 'isPresident') hasChanges = true
                if (storeAssociation?.isSecretary && association.role !== 'isSecretary') hasChanges = true
                if (storeAssociation?.isTreasurer && association.role !== 'isTreasurer') hasChanges = true
                if (storeAssociation?.isVicePresident && association.role !== 'isVicePresident') hasChanges = true

                if (hasChanges && association.id) {
                    const infosToPatch = {
                        isPresident: association.role === 'isPresident',
                        canBePresident: association.canBePresident ? association.canBePresident : false,
                        isSecretary: association.role === 'isSecretary',
                        isTreasurer: association.role === 'isTreasurer',
                        isVicePresident: association.role === 'isVicePresident'
                    }
                    await patchUserAssociations(userId, association.id, infosToPatch)
                }
            }
        })
    }

    async function deleteUserAssociation(userId: number | undefined, associationId: number) {
        const {axiosAuthenticated} = useAxios()
        await axiosAuthenticated.delete(`/users/${userId}/associations/${associationId}`)
    }

    async function patchUserAssociations(userId: number | undefined, associationId: number, infosToPatch: AssociationUser) {
        const {axiosAuthenticated} = useAxios()
        await axiosAuthenticated.patch(`/users/${userId}/associations/${associationId}`, infosToPatch)
    }

    /**
     * When the user clicks the 'Add Association' button in registration for example,
     * add a new association to the list of associations.
     *
     * The function is called when the user clicks the 'Add Association' button
     *
     * It's the same for the 'Remove Association' function below.
     */
    function addAssociation() {
        newAssociations.value.push({
            id: null,
            role: 'isMember',
            options: associationRoleOptions
        })
    }

    function removeAssociation(index: number) {
        newAssociations.value.splice(index, 1)
    }

    /**
     * It takes an array of associations and returns an array of association users
     * @returns An array of AssociationUser
     */
    function updateRegisterRoleInAssociation(): AssociationUser[] {
        newAssociationsUser.value = []
        newAssociations.value.forEach(association => {
            newAssociationsUser.value.push({
                association: association.id,
                isPresident: association.role === 'isPresident',
                canBePresident: false,
                isValidatedByAdmin: false,
                isVicePresident: association.role === 'isVicePresident',
                isSecretary: association.role === 'isSecretary',
                isTreasurer: association.role === 'isTreasurer'
            })
        })
        return newAssociationsUser.value
    }

    // To test
    async function getUserAssociations(userId: number | null, managedUser: boolean) {
        const {axiosAuthenticated} = useAxios()

        let store: UserStore | UserManagerStore = userStore
        if (managedUser) store = userManagerStore

        store.userAssociations = []

        const url = (managedUser) ? `/users/${userId}/associations/` : '/users/associations/'

        const userAssociations = (await axiosAuthenticated.get<AssociationUser[]>(url)).data

        for (let i = 0; i < userAssociations.length; i++) {
            const associationDetails = (await axiosAuthenticated.get<Association>(`/associations/${userAssociations[i].association}`)).data
            store.userAssociations.push(
                {
                    association: {
                        id: userAssociations[i].association as number,
                        name: associationDetails.name,
                        isSite: associationDetails.isSite,
                        institution: associationDetails.institution as number,
                        isEnabled: associationDetails.isEnabled,
                        isPublic: associationDetails.isPublic,
                    },
                    isPresident: userAssociations[i].isPresident as boolean,
                    canBePresident: userAssociations[i].canBePresident as boolean,
                    canBePresidentFrom: userAssociations[i].canBePresidentFrom as string,
                    canBePresidentTo: userAssociations[i].canBePresidentTo as string,
                    isValidatedByAdmin: userAssociations[i].isValidatedByAdmin as boolean,
                    isVicePresident: userAssociations[i].isVicePresident as boolean,
                    isSecretary: userAssociations[i].isSecretary as boolean,
                    isTreasurer: userAssociations[i].isTreasurer as boolean,
                })
        }
    }

    // To test
    function getAssociationUserRole(user: AssociationUser | AssociationUserDetail) {
        return user.isPresident ? 'isPresident' : user.isSecretary ? 'isSecretary' : user.isTreasurer ? 'isTreasurer' :
            user.isVicePresident ? 'isVicePresident' : 'isMember'
    }

    // To test
    async function getAssociationUsersNames(associationId: number) {
        const {axiosAuthenticated} = useAxios()
        return (await axiosAuthenticated.get(`/users/?association_id=${associationId}`)).data
    }

    const initAssociationMembers = async (associationId: number) => {
        associationMembers.value = []
        const userNames: User[] = await getAssociationUsersNames(associationId)
        await associationStore.getAssociationUsers(associationId)
        associationStore.associationUsers.forEach(function (user) {
            const member = userNames.find(obj => obj.id === user.user)
            if (member) {
                associationMembers.value.push({
                    id: user.user as number,
                    firstName: member.firstName,
                    lastName: member.lastName,
                    role: associationRoleOptions.find(obj => obj.value === getAssociationUserRole(user))?.label as string,
                    canBePresident: user.canBePresident,
                    canBePresidentFrom: user.canBePresidentFrom,
                    canBePresidentTo: user.canBePresidentTo,
                    isValidatedByAdmin: user.isValidatedByAdmin as boolean
                })
            }
        })
    }

    // To test
    function initUserAssociations(editedByStaff: boolean) {
        userAssociations.value = []
        let associations: AssociationUserDetail[] = userStore.userAssociations
        if (editedByStaff) associations = userManagerStore.userAssociations
        associations.forEach(function (association) {
            const role = getAssociationUserRole(association)
            userAssociations.value.push({
                id: association.association.id,
                name: association.association.name,
                role,
                options: associationRoleOptions,
                isValidatedByAdmin: association.isValidatedByAdmin,
                canBePresident: association.canBePresident,
                deleteAssociation: false
            })
        })
    }

    // To test
    async function getUnvalidatedAssociationUsers() {
        associationMembers.value = []

        const {axiosAuthenticated} = useAxios()
        const {hasPerm} = useSecurity()

        let institutions = userStore.userInstitutions?.join(',')
        if (hasPerm('change_user_misc')) institutions += ','
        const url = `/users/associations/?institutions=${institutions}&is_validated_by_admin=false`

        const users = (await axiosAuthenticated.get<AssociationUser[]>(url)).data
        await associationStore.getAssociationNames(false, false)
        await userManagerStore.getUsers('validated')

        users.forEach((user) => {
            const extendedUser = userManagerStore.users.find(obj => obj.id === user.user)
            const associationName = associationStore.associationNames.find(obj => obj.id === user.association)?.name
            if (extendedUser && associationName) {
                associationMembers.value.push({
                    id: user.user as number,
                    associationId: user.association as number,
                    associationName,
                    firstName: extendedUser.firstName,
                    lastName: extendedUser.lastName,
                    role: associationRoleOptions.find(obj => obj.value === getAssociationUserRole(user))?.label as string,
                    canBePresident: user.canBePresident,
                    canBePresidentFrom: user.canBePresidentFrom,
                    canBePresidentTo: user.canBePresidentTo,
                    isValidatedByAdmin: user.isValidatedByAdmin as boolean
                })
            }
        })
    }

    return {
        userAssociations,
        updateUserAssociations,
        patchUserAssociations,
        addAssociation,
        removeAssociation,
        updateRegisterRoleInAssociation,
        newAssociationsUser,
        associationRoleOptions,
        getUserAssociations,
        newAssociations,
        deleteUserAssociation,
        getUnvalidatedAssociationUsers,
        associationMembers,
        getAssociationUserRole,
        initUserAssociations,
        initAssociationMembers
    }
}

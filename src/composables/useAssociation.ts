import _axios from '@/plugins/axios'
import {computed, ref} from 'vue'
import type {User, UserAssociations} from '#/user'
import type {AssociationList} from '#/association'
import {useUserStore} from '@/stores/useUserStore'
import {useAssociationStore} from '@/stores/useAssociationStore'


const newAssociations = ref<UserAssociations>([])

const managedAssociations = ref<AssociationList[]>([])
const managedAssociationsDirectory = computed(() => {
    return managedAssociations.value.map(
        association => ({
            id: association.id,
            name: association.name,
            acronym: association.acronym,
            institution: association.institution?.name,
            component: association.institutionComponent?.name,
            field: association.activityField?.name
        })
    )
})

export default function () {

    async function createAssociation(name: string) {
        await _axios.post('/associations/', {name: name})
    }

    // Add or remove new multiple associations
    function addAssociation() {
        newAssociations.value.push({
            id: null,
            hasOfficeStatus: false
        })
    }

    // to test for #14
    // Get the associations managed by the user depending on status or association role
    async function getManagedAssociations() {
        const userStore = useUserStore()
        if (userStore.isAuth && managedAssociations.value.length === 0) {
            const associationStore = useAssociationStore()
            if (userStore.isUniManager) {
                await associationStore.getAssociations()
                managedAssociations.value = associationStore.associations
            } else {
                for (let i = 0; i < (userStore.user as User).associations.length; i++) {
                    const associationId = userStore.user?.associations[i].id
                    const associationDetail = (await _axios.get<AssociationList>(`/associations/${associationId}`)).data
                    managedAssociations.value.push(associationDetail)
                }
                // Get roles only for associations members
                await userStore.getUserAssociationsRoles()
            }
        }
    }


    return {
        createAssociation,
        newAssociations,
        addAssociation,
        getManagedAssociations,
        managedAssociations,
        managedAssociationsDirectory
    }
}
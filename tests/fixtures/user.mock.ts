import type { ManagedUsers, User, UserAssociations, UserGroup, UserRegister } from '#/user'
import { _associationName } from '~/fixtures/association.mock'

export const _userGroups: UserGroup[] = [
    // Gestionnaire
    {
        userId: 1,
        groupId: 2,
        institutionId: 2,
    },
    // Étudiant
    {
        userId: 2,
        groupId: 6,
    },
    // Commission
    {
        userId: 3,
        groupId: 4,
    }
]

export const _newUserGroups: number[] = [1, 2]

export const _manager: User = {
    id: 1,
    password: 'motdepasse',
    username: 'manager@unistra.fr',
    firstName: 'Manager',
    lastName: 'Unistra',
    phone: '',
    email: 'manager@unistra.fr',
    isValidatedByAdmin: true,
    isCas: false,
    groups: [
        {
            userId: 1,
            groupId: 2,
            institutionId: 2,
        }
    ],
    associations: _associationName
}

export const _student: User = {
    id: 5,
    password: 'motdepasse',
    username: 'student@unistra.fr',
    firstName: 'Student',
    lastName: 'Unistra',
    phone: '',
    email: 'student@unistra.fr',
    isValidatedByAdmin: true,
    isCas: false,
    groups: [
        {
            userId: 2,
            groupId: 6,
        },
    ],
    associations: _associationName
}

export const _users: ManagedUsers = [_student, _manager]

export const _newUser: UserRegister = {
    isCas: false,
    username: 'john.lennon@bbc.com',
    firstName: 'John',
    lastName: 'Lennon',
    phone: '',
    email: 'john.lennon@bbc.com'
}

export const _userGroupList: (number | undefined)[] = _userGroups.map(group => group.id)

export const _groupLabels = _userGroups.map(
    group => ({
        value: group.id,
        label: group.name
    })
)

export const _userAssociations: UserAssociations = [
    {
        id: 1,
        isPresident: true,
        canBePresident: true,
        isValidatedByAdmin: true,
        isSecretary: false,
        isTreasurer: false,
    },
    {
        id: 2,
        isPresident: false,
        canBePresident: false,
        isValidatedByAdmin: true,
        isSecretary: true,
        isTreasurer: false,
    },
    {
        id: 3,
        isPresident: false,
        canBePresident: false,
        isValidatedByAdmin: true,
        isSecretary: false,
        isTreasurer: true,
    },
    {
        id: 4,
        isPresident: false,
        canBePresident: false,
        isValidatedByAdmin: false,
        isSecretary: false,
        isTreasurer: false,
    }
]

export const _userAssociationDetail = {
    user: 'Jane',
    isPresident: true,
    canBePresident: true,
    isValidatedByAdmin: true,
    isSecretary: false,
    isTreasurer: false,
    association: 1
}

export const _userAssociationsManagement = [
    {
        associationId: 1,
        associationName: 'PLANA',
        isPresident: true,
        canBePresident: true,
        isSecretary: false,
        isTreasurer: false,
        deleteAssociation: false
    },
    {
        associationId: 2,
        associationName: 'Octant',
        isPresident: false,
        canBePresident: true,
        isSecretary: false,
        isTreasurer: true,
        deleteAssociation: false
    },
    {
        associationId: 3,
        associationName: 'Apogée',
        isPresident: false,
        canBePresident: true,
        isSecretary: true,
        isTreasurer: false,
        deleteAssociation: true
    }
]

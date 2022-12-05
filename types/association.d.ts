// WIP : prototype based on current back

/**
 *  Association Model
 *  Interact front-back
 *  @params: id, name, username, acronym, path_logo,
 *  description, activities, address, phone, email,
 *  siret, website, student_amount, is_enabled, created_date,
 *  approval_date, last_goa, cga_date, id_status, id_institution
 *  id_component, id_field
 */
export interface Association {
    id: number,
    institution: {
        id: number,
        name: string,
        acronym: string
    },
    institutionComponent: {
        id: number,
        name: string
    },
    activityField: {
        id: number,
        name: string
    },
    name: string,
    acronym: string | null,
    pathLogo: string | null,
    altLogo: string | null,
    description: string | null,
    activities: string | null,
    address: string | null,
    phone: string | null,
    email: string | null,
    siret: number | null,
    website: string | null,
    studentCount: number | null,
    isEnabled: boolean | null,
    createdDate: string | null,
    approvalDate: string | null,
    lastGoaDate: string | null,
    cgaDate: string | null,
}

export interface AssociationList {
    id: number,
    institution: {
        id: number,
        name: string,
        acronym: string
    },
    institutionComponent: {
        id: number,
        name: string,
    },
    activityField: {
        id: number,
        name: string,
    },
    name: string,
    acronym: string,
    isEnabled: boolean,
    isSite: boolean
}

export interface AssociationStore {
    association: Association,
    associations: AssociationList[]
}

export type AssociationNames = { value: number, label: string }[]

export type AssociationDirectoryDetail = { id: number, name: string, acronym: string, institution: string, component: string, field: string }
export type AssociationDirectory = AssociationDirectoryDetail[]

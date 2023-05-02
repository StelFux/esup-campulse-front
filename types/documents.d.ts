export interface Document {
    id: number,
    name: string,
    acronym: string,
    description: string,
    contact: string,
    isMultiple: boolean,
    isRequiredInProcess: boolean,
    daysBeforeExpiration: string,
    pathTemplate: string | null,
    mimeTypes: MimeType[],
    processType: DocumentProcessType,
    institution: number | null,
    commission: number | null,
}

type MimeType =
    'application/pdf'
    | 'image/jpeg'
    | 'image/png'
    | 'application/vnd.oasis.opendocument.spreadsheet'
    | 'application/vnd.ms-excel'
    | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    | 'application/msword'
    | 'application/vnd.oasis.opendocument.text'
    | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    | 'application/x-7z-compressed'
    | 'application/x-bzip2'
    | 'application/x-rar-compressed'
    | 'application/x-tar'
    | 'application/zip'

type DocumentProcessType =
    'CHARTER_ASSOCIATION'
    | 'CHARTER_ASSOCIATION_INSTITUTION'
    | 'CHARTER_PROJECT_COMMISSION'
    | 'DOCUMENT_ASSOCIATION'
    | 'DOCUMENT_USER'
    | 'DOCUMENT_PROJECT'
    | 'DOCUMENT_PROJECT_REVIEW'
    | 'DOCUMENT_PROCESSING'

export interface DocumentUpload {
    id?: number,
    uploadDate?: string,
    pathFile: string,
    size: number,
    documentUploadStatus?: DocumentUploadStatus,
    document: number,
    user?: number | null,
    association?: number | null,
    project?: number,
    name?: string
}

export interface ProcessDocument {
    id?: number,
    uploadDate?: string,
    pathFile: Blob | Blob[] | undefined | [] | string,
    documentUploadStatus?: DocumentUploadStatus,
    document?: number,
    description?: string,
    isMultiple?: boolean,
    isRequiredInProcess?: boolean,
    mimeTypes?: MimeType[],
    name?: string,
    pathTemplate?: string | null
}

type DocumentUploadStatus = 'DOCUMENT_REJECTED' | 'DOCUMENT_PROCESSING' | 'DOCUMENT_VALIDATED'
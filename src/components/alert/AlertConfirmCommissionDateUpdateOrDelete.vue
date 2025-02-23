<script lang="ts" setup>
import {useI18n} from 'vue-i18n'
import {ref} from 'vue'
import axios from 'axios'
import {useQuasar} from 'quasar'
import useErrors from '@/composables/useErrors'
import {useProjectStore} from '@/stores/useProjectStore'
import type {UpdateCommission} from '#/commissions'
import useUtility from '@/composables/useUtility'

const props = defineProps<{
    commission: UpdateCommission
}>()

const {t} = useI18n()
const {notify, loading} = useQuasar()
const {catchHTTPError} = useErrors()
const projectStore = useProjectStore()
const {arraysAreEqual} = useUtility()

const confirmUpdate = ref<boolean>(false)
const confirmDelete = ref<boolean>(false)

async function onOpenDeleteAlert() {
    loading.show()
    try {
        await projectStore.getManagedProjects(props.commission.id)
        confirmDelete.value = true
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            notify({
                type: 'negative',
                message: await catchHTTPError(error.response)
            })
        }
    }
    loading.hide()
}
</script>

<template>
    <div class="flex-row padding-bottom">
        <QBtn
            :disable="!commission.datesAreLegal && commission.newName === commission.oldName
                && commission.newCommissionDate === commission.oldCommissionDate
                && commission.newSubmissionDate === commission.oldSubmissionDate
                && commission.newIsOpenToProjects === commission.oldIsOpenToProjects
                && arraysAreEqual(commission.oldFunds, commission.newFunds)"
            :label="t('update')"
            class="btn-lg"
            color="commission"
            icon="bi-arrow-repeat"
            @click="confirmUpdate = true"
        />
        <QDialog
            v-model="confirmUpdate"
            persistent
        >
            <QCard class="variant-space-3">
                <QCardSection class="row items-center">
                    <p>{{ t('commission.alerts.confirm-update') }}</p>
                    <div class="flex-row-center padding-top">
                        <QBtn
                            v-close-popup
                            :label="t('cancel')"
                            class="btn-lg"
                            color="dashboard"
                            icon="bi-x-lg"
                        />
                        <QBtn
                            v-close-popup
                            :label="t('update')"
                            class="btn-lg"
                            color="commission"
                            icon="bi-arrow-repeat"
                            @click="$emit('updateCommissionDate')"
                        />
                    </div>
                </QCardSection>
            </QCard>
        </QDialog>
        <QBtn
            :label="t('delete')"
            class="btn-lg"
            color="custom-red"
            icon="bi-trash"
            @click="onOpenDeleteAlert"
        />
        <QDialog
            v-model="confirmDelete"
            persistent
        >
            <QCard class="variant-space-3">
                <QCardSection class="row items-center">
                    <p v-if="!projectStore.managedProjects.length">
                        {{ t('commission.alerts.confirm-delete') }}
                    </p>
                    <div
                        v-else
                        class="info-panel info-panel-error"
                    >
                        <i
                            aria-hidden="true"
                            class="bi bi-exclamation-lg"
                        ></i>
                        <p>{{ t('commission.alerts.delete-warning-projects-submitted') }}</p>
                    </div>
                    <div class="flex-row-center padding-top">
                        <QBtn
                            v-close-popup
                            :label="t('cancel')"
                            class="btn-lg"
                            color="commission"
                            icon="bi-x-lg"
                        />
                        <QBtn
                            v-if="!projectStore.managedProjects.length"
                            v-close-popup
                            :label="t('delete')"
                            class="btn-lg"
                            color="custom-red"
                            icon="bi-trash"
                            @click="$emit('deleteCommissionDate')"
                        />
                    </div>
                </QCardSection>
            </QCard>
        </QDialog>
    </div>
</template>

<style lang="scss" scoped>
@import "@/assets/styles/forms.scss";

.q-card {
    padding: 1rem
}
</style>

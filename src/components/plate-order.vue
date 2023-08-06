<template>
    <q-card square>
        <q-card-section class="row">
            <q-checkbox
                v-for="column in OrderStore.columns"
                v-model="OrderStore.columnsVisiable"
                :val="column.name"
                :label="column.label"
                :disable="['_id'].includes(column.name)"
                color="primary"
                class="q-mr-sm"
                @update:model-value="OrderStore.setColumnsVisable()"
            />
        </q-card-section>
    </q-card>
</template>

<script lang="ts" setup>
import { cloneDeep } from "lodash";
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import { ENUM_LAYOUT_CABINET } from "qqlx-core";
import { useOrderStore } from "@/stores/wmss/order";
import { useNotifyStore } from "@/stores/quasar/notify";

const route = useRoute();
const NotifyStore = useNotifyStore();
const OrderStore = useOrderStore();
</script>

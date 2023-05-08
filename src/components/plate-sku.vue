<template>
    <q-card square>
        <q-card-section class="row">
            <q-checkbox
                v-for="column in SkuStore.columns"
                v-model="SkuStore.columnsVisiable"
                :val="column.name"
                :label="column.label"
                :disable="['poundsFinal', '_id'].includes(column.name)"
                color="primary"
                class="q-mr-sm"
            />
        </q-card-section>
    </q-card>
</template>

<script lang="ts" setup>
import { cloneDeep } from "lodash";
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import { ENUM_LAYOUT_CABINET } from "qqlx-core";
import { useSkuStore } from "@/stores/wmss/sku";
import { useNotifyStore } from "@/stores/quasar/notify";

const route = useRoute();
const NotifyStore = useNotifyStore();
const SkuStore = useSkuStore();
</script>

<template>
    <q-dialog v-model="SkuStore.dialog">
        <q-card class="w-1200" style="min-height: 400px">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>
                    {{ SkuStore.dialogTitle }}
                </q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>

            <list-sku :skus="SkuStore.dialogSkuList" />
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { cloneDeep } from "lodash";
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import listSku from "./list-sku.vue";
import { useSkuStore } from "@/stores/wmss/sku";
import { useNotifyStore } from "@/stores/quasar/notify";

const route = useRoute();
const NotifyStore = useNotifyStore();
const SkuStore = useSkuStore();
</script>

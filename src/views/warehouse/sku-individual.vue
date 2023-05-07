<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <span>在库原料</span>
            <dialog-intro></dialog-intro>
            <q-space></q-space>
            <q-btn class="q-ml-sm bg-white" square @click="$router.push('/wmss/warehouse/order-list')">去入库</q-btn>
            <q-btn class="q-ml-sm" color="negative" square @click="$router.push('/wmss/purchase/create')">去采购</q-btn>
        </div>
    </div>

    <list-sku-individual
        label="加工"
        @pick="
            (picked:Sku) => {
                OrderStore.setEditor(OrderStore.getSchema(ENUM_ORDER.PROCESS))
                $router.push('/wmss/warehouse/order-create')
            }"
    />
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { cloneDeep, debounce } from "lodash";
import { useRouter, useRoute } from "vue-router";

import { MongodbSort, getPage } from "qqlx-cdk";
import { ENUM_LAYOUT_CABINET, ENUM_ORDER, Sku } from "qqlx-core";

import listSkuIndividual from "@/components/list-sku-individual.vue";
import dialogIntro from "@/components/dialog-intro.vue";
import { useContactStore } from "@/stores/brand/contact";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useSkuStore } from "@/stores/wmss/sku";
import { useOrderStore } from "@/stores/wmss/order";

const NotifyStore = useNotifyStore();

const OrderStore = useOrderStore();
const orderDialog = ref(false);
const SkuStore = useSkuStore();
const skuDeduction = ref(SkuStore.getSchema());
const postOrder = async () => {
    orderDialog.value = false;

    const schema = cloneDeep(skuDeduction.value);
    schema.pounds = schema.poundsFinal - schema.pounds;
    schema.price = 0;

    OrderStore.setEditor();
    OrderStore.editor.type = ENUM_ORDER.MATERIAL;
    await OrderStore.post([schema]);

    SkuStore.get(1);
};

const route = useRoute();
onMounted(() => {});
</script>

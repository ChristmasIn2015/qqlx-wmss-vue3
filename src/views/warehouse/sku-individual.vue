<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <span>大件商品</span>
            <dialog-intro></dialog-intro>
            <q-space></q-space>
        </div>
    </div>

    <list-sku-individual
        label="领料"
        @pick="
            (picked:Sku) => {
                picked.deductionSkuId = picked._id;
                picked._id = '';
                picked.pounds = picked.poundsFinal;
                skuDeduction = picked
                orderDialog = true;
            }
        "
    />

    <q-dialog v-model="orderDialog">
        <q-card class="w-400">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>领料 </q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>

            <q-card-section>
                <q-input
                    filled
                    type="number"
                    label="请输入本次领料后的剩余重量"
                    :hint="`当前剩余 ${skuDeduction.poundsFinal}吨`"
                    v-model="skuDeduction.pounds"
                    color="primary"
                />
            </q-card-section>

            <q-card-actions>
                <q-space></q-space>
                <q-btn color="primary" v-close-popup @click="postOrder()"> 确定 </q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
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

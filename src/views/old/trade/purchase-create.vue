<template>
    <div class="q-pt-md q-pb-lg">
        <div class="text-h4 text-white text-weight-bold">采购开单</div>
        <div class="text-white q-pt-sm">
            <span>您正在以公司 @{{ CorpStore.picked?.name }} 作为主体开出采购单据</span>
        </div>
    </div>

    <container-sku />

    <div class="q-py-md row">
        <q-space></q-space>
        <q-btn class="q-ml-sm" push square color="green-7" @click="contactDialog = true">{{ contactPicked._id ? contactPicked.name : "选择供应商" }} </q-btn>
        <q-btn
            class="q-ml-sm"
            square
            push
            color="primary"
            :loading="OrderStore.loadding"
            v-if="contactPicked._id"
            @click="
                async () => {
                    OrderStore.setEditor();
                    OrderStore.editor.type = ENUM_ORDER.PURCHASE;
                    OrderStore.editor.contactId = contactPicked._id;
                    await OrderStore.post(SkuStore.listPicked, FeeStore.feeListPicked);
                    router.push('/wmss/trade/sale-list');
                }
            "
        >
            创建采购单
        </q-btn>
    </div>

    <picker-cabinet-unit />

    <q-dialog v-model="contactDialog" position="bottom">
        <q-card class="w-1000">
            <q-toolbar class="bg-green-6 text-white">
                <q-toolbar-title class="text-weight-bold">通讯录</q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>
            <q-separator class="q-mb-md" />

            <list-contact @pick="(value) => (contactPicked = value)"></list-contact>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";

import pickerCabinetUnit from "@/components/picker-cabinet-unit.vue";
import containerSku from "@/components/container-sku.vue";
import listContact from "@/components/list-contact.vue";
import { ENUM_ORDER } from "qqlx-core";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useCorpStore } from "@/stores/brand/corp";
import { useSkuStore } from "@/stores/wmss/sku";
import { useFeeStore } from "@/stores/fee";
import { useContactStore } from "@/stores/brand/contact";
import { useOrderStore } from "@/stores/wmss/order";

const route = useRoute();
const router = useRouter();
const routes = router.options.routes[0].children;

const NotifyStore = useNotifyStore();
const CorpStore = useCorpStore();
const SkuStore = useSkuStore();
const FeeStore = useFeeStore();
const ContactStore = useContactStore();
const OrderStore = useOrderStore();

const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());
onMounted(async () => {
    try {
        SkuStore.setEditor();
    } catch (error) {
        NotifyStore.fail((error as Error).message);
    }
});
</script>

<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <span>创建采购清单</span>
            <q-space></q-space>
            <dialog-intro />
        </div>
    </div>

    <container-sku />

    <div class="q-py-md row">
        <q-space></q-space>
        <q-btn class="q-ml-sm" square color="primary" @click="contactDialog = true">{{ contactPicked._id ? contactPicked.name : "选择供应商" }} </q-btn>
        <q-btn
            color="negative"
            class="q-ml-sm"
            square
            :loading="OrderStore.loadding"
            @click="
                async () => {
                    OrderStore.setEditor();
                    OrderStore.editor.type = ENUM_ORDER.PURCHASE;
                    OrderStore.editor.contactId = contactPicked._id;
                    await OrderStore.post(SkuStore.listPicked);
                    $router.push('/wmss/purchase/list');
                }
            "
        >
            创建采购清单
        </q-btn>
    </div>

    <picker-cabinet-unit />

    <q-dialog v-model="contactDialog" position="bottom">
        <q-card class="w-1000">
            <q-toolbar class="bg-primary text-white">
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
import { ENUM_ORDER } from "qqlx-core";

import dialogIntro from "@/components/dialog-intro.vue";
import pickerCabinetUnit from "@/components/picker-cabinet-unit.vue";
import containerSku from "@/components/container-sku.vue";
import listContact from "@/components/list-contact.vue";

import { useSkuStore } from "@/stores/wmss/sku";
import { useContactStore } from "@/stores/brand/contact";
import { useOrderStore } from "@/stores/wmss/order";

const SkuStore = useSkuStore();
const OrderStore = useOrderStore();

const ContactStore = useContactStore();
const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());

onMounted(async () => {
    SkuStore.listPicked = [];
    SkuStore.setEditor();
});
</script>

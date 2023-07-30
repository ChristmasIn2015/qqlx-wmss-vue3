<template>
    <div class="q-pl-xs q-mb-lg">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <q-btn icon="arrow_back" fab flat style="margin-left: -12px" @click="$router.back()"></q-btn>
            <span>修改销售单</span>
        </div>
        <div class="text-option text-primary">
            <span>您正在修改销售单据 {{ OrderStore.editor?.code }}</span>
        </div>
    </div>

    <container-sku />

    <div class="q-py-md row">
        <q-space></q-space>
        <span>
            <picker-date title="合同时间：" :time="OrderStore.editor.timeContract" @change="(value) => (OrderStore.editor.timeContract = value)"> </picker-date>
            <q-tooltip class="text-body1">
                <div>订单打印时，将会在左上角，显示合同时间</div>
                <div>创建时间：{{ OrderStore.editor.timeCreateString }}</div>
            </q-tooltip>
        </span>
        <q-btn class="q-ml-sm" color="primary" push square @click="contactDialog = true">
            {{ contactPicked._id ? contactPicked.name : "选择客户" }}
        </q-btn>
        <q-btn v-if="contactPicked._id" class="q-ml-sm" square push color="negative" :loading="OrderStore.loadding" @click="putOrder()">
            修改 {{ OrderStore.editor.code }}
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
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ENUM_ORDER, MAP_ENUM_ORDER } from "qqlx-core";

import pickerCabinetUnit from "@/components/picker-cabinet-unit.vue";
import containerSku from "@/components/container-sku.vue";
import listContact from "@/components/list-contact.vue";
import pickerDate from "@/components/picker-date.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useCorpStore } from "@/stores/brand/corp";
import { useSkuStore } from "@/stores/wmss/sku";
import { useContactStore } from "@/stores/brand/contact";
import { useOrderStore } from "@/stores/wmss/order";

const NotifyStore = useNotifyStore();
const CorpStore = useCorpStore();
const SkuStore = useSkuStore();
const ContactStore = useContactStore();
const OrderStore = useOrderStore();

const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());

const router = useRouter();
const putOrder = async () => {
    OrderStore.editor.contactId = contactPicked.value._id;
    const code = await OrderStore.put(OrderStore.editor, SkuStore.listPicked);
    router.push(`/wmss/trade/sale-list?code=${code}`);
};

onMounted(() => {
    // 进入页面之前会对 SkuStore OrderStore 预设置值
    if (OrderStore.editor._id) {
        contactPicked.value = OrderStore.editor.joinContact || ContactStore.getSchema();
    } else {
        router.push("/wmss/analysis/dashboard");
    }
});
</script>

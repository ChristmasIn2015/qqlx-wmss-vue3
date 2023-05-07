<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <q-btn icon="arrow_back" fab flat style="margin-left: -12px" @click="$router.back()"></q-btn>
            <span>修改{{ nowOrderEditorTrans?.text }}</span>
        </div>
    </div>

    <container-sku />

    <div class="q-py-md row">
        <q-space></q-space>
        <q-btn class="q-ml-sm" square label="批量导入">
            <q-menu>
                <q-list>
                    <q-item clickable @click="NotifyStore.download()">
                        <q-item-section>下载模板</q-item-section>
                    </q-item>
                    <q-item clickable>
                        <q-item-section>
                            <q-file dense borderless accept=".xlsx, .xls" v-model="filePicking" label="选择文件" @update:model-value="filePickNext" />
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-menu>
        </q-btn>
        <q-btn class="q-ml-sm" square push color="negative" :loading="OrderStore.loadding" @click="putOrder()"> 修改 {{ OrderStore.editor.code }} </q-btn>
    </div>

    <picker-cabinet-unit />
</template>

<script lang="ts" setup>
import * as XLSX from "xlsx";
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import { ENUM_ORDER, MAP_ENUM_ORDER, SkuJoined } from "qqlx-core";

import pickerCabinetUnit from "@/components/picker-cabinet-unit.vue";
import containerSku from "@/components/container-sku.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useSkuStore } from "@/stores/wmss/sku";
import { useOrderStore } from "@/stores/wmss/order";

const router = useRouter();

const NotifyStore = useNotifyStore();
const filePicking = ref(null);
const filePickNext = async (file: File) => {
    if (!file) return;
    const reader = new FileReader(); // WebAPI
    reader.onload = async () => {
        const workbook = XLSX.read(reader.result, { type: "binary" });
        const sheet = workbook.Sheets["商品导入"];
        if (!sheet) throw new Error(`找不到表格 [商品导入] !`);
        const rowJsonList: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

        // 1.批量上传
        const uploading = [];
        for (let i in rowJsonList) {
            const row = rowJsonList[i];
            const schema = SkuStore.getSchema() as SkuJoined;
            schema.keyOrigin = String(row["@产地"] || "");
            schema.keyFeat = String(row["@材质"] || "");
            schema.keyCode = String(row["@序号"] || "");
            schema.name = String(row["@品名"] || "");
            schema.norm = String(row["@规格"] || "");
            schema.count = Number(row["@数量"] || 0);
            schema.pounds = Number(row["@重量/吨"] || 0);
            schema.price = Number(row["@单价/元"] || 0);
            schema.unit = String(row["@单位"] || "项");
            schema.remark = String(row["@备注"] || "");

            const date = row["@日期"] || "";
            if (typeof date === "string") schema.timeCreate = new Date(date).getTime();
            else if (typeof date === "number") {
                const time = new Date(new Date("1900/1/1 00:00:00").getTime() + (date - 2) * 86400000 + 1000 * 60 * 60);
                schema.timeCreate = time.getTime();
            }
            if (schema.pounds > 0) schema.isPriceInPounds = true;
            uploading.push(schema);
        }
        SkuStore.listPicked = uploading;
    };
    reader.readAsBinaryString(file);
};

const SkuStore = useSkuStore();
const OrderStore = useOrderStore();
const putOrder = async () => {
    const code = await OrderStore.put(OrderStore.editor, SkuStore.listPicked);
    router.back();
};

const nowOrderEditorTrans = computed(() => MAP_ENUM_ORDER.get(OrderStore.editor.type));
onMounted(() => {
    if (OrderStore.editor._id) {
        //
    } else router.push("/wmss/warehouse/order-list");
});
</script>

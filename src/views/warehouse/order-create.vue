<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <q-btn icon="arrow_back" fab flat style="margin-left: -12px" @click="$router.back()"></q-btn>
            <span>创建{{ nowOrderEditorTrans?.text }}</span>
        </div>
    </div>

    <container-sku-pounds />

    <div class="q-py-md row items-start">
        <q-space></q-space>
        <q-btn class="q-ml-sm" square label="批量导入" color="white" text-color="primary">
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
        <span v-if="skuIndividualPicking.deductionSkuId" class="row">
            <div style="width: 288px">
                <q-input
                    class="q-ml-sm"
                    square
                    filled
                    dense
                    borderless
                    :hint="`${skuIndividualPicking.name} / ${skuIndividualPicking.norm} / 当前剩余${skuIndividualPicking.poundsFinal}吨`"
                    type="number"
                    color="negative"
                    input-class="text-body1"
                    v-model="skuIndividualPicking.pounds"
                >
                    <template v-slot:after>
                        <q-btn padding="sm" square icon="close" flat fab @click="skuIndividualPicking = SkuStore.getSchema()">
                            <q-tooltip class="text-body1">选择其他大件商品</q-tooltip>
                        </q-btn>
                    </template>
                    <template v-slot:prepend>
                        <span class="text-body1">加工后剩余</span>
                    </template>
                    <template v-slot:append>
                        <span class="text-body1">吨</span>
                    </template>
                </q-input>
            </div>
        </span>
        <q-btn v-else-if="OrderStore.editor.type === ENUM_ORDER.PROCESS" square class="q-ml-sm" color="primary" @click="dialogSkuIndividual = true">
            选择大件商品
            <q-tooltip class="text-body1">此大件商品将作为加工商品的原材料，并扣减库存</q-tooltip>
        </q-btn>
        <q-btn square v-if="nowOrderEditorTrans" push class="q-ml-sm" color="negative" :loading="OrderStore.loadding" @click="createOrder()">
            创建 {{ nowOrderEditorTrans?.text }}
        </q-btn>
    </div>

    <picker-cabinet-unit />

    <q-dialog v-model="dialogSkuIndividual" maximized>
        <q-card>
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title class="text-weight-bold">大件商品</q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>
            <q-separator class="q-mb-md" />
            <list-sku-individual
                label="选择"
                @pick="
                    (sku) => {
                        sku.deductionSkuId = sku._id;
                        sku._id = '';
                        sku.pounds = sku.poundsFinal;
                        skuIndividualPicking = sku;
                    }
                "
            />
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import * as XLSX from "xlsx";
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { MAP_ENUM_ORDER, ENUM_ORDER, SkuJoined, Order } from "qqlx-core";

import listSkuIndividual from "@/components/list-sku-individual.vue";
import pickerCabinetUnit from "@/components/picker-cabinet-unit.vue";
import containerSkuPounds from "@/components/container-sku-pounds.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useSkuStore } from "@/stores/wmss/sku";
import { useOrderStore } from "@/stores/wmss/order";
import { cloneDeep } from "lodash";

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
const dialogSkuIndividual = ref(false);
const skuIndividualPicking = ref(SkuStore.getSchema());
const OrderStore = useOrderStore();
const createOrder = async () => {
    const material = { _id: "", code: "" };
    const skus = cloneDeep(SkuStore.listPicked);

    // 创建领料单
    if (skuIndividualPicking.value?.deductionSkuId && OrderStore.editor.type === ENUM_ORDER.PROCESS) {
        const individual = cloneDeep(skuIndividualPicking.value);
        individual.pounds = individual.poundsFinal - individual.pounds;
        OrderStore.setEditor(OrderStore.getSchema(ENUM_ORDER.MATERIAL));
        const result = await OrderStore.post([individual]);
        material._id = result._id;
        material.code = result.code;

        OrderStore.setEditor(OrderStore.getSchema(ENUM_ORDER.PROCESS));
        if (material._id) {
            OrderStore.editor.parentOrderId = material._id;
            OrderStore.editor.parentOrderType = ENUM_ORDER.MATERIAL;
        }
    }

    // 创建
    await OrderStore.post(skus);
    router.push(`/wmss/warehouse/order-list?code=${material.code}`);
};

const nowOrderEditorTrans = computed(() => MAP_ENUM_ORDER.get(OrderStore.editor.type));
onMounted(() => {
    if (nowOrderEditorTrans.value?.value === ENUM_ORDER.NONE) router.push("/wmss/warehouse/order-list");
    else SkuStore.setEditor();
});
</script>

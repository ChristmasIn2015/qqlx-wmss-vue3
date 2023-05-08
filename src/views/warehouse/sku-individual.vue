<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <span>在库原料</span>
            <dialog-intro></dialog-intro>
            <q-space></q-space>
            <q-btn
                class="q-ml-sm bg-white"
                square
                @click="
                    () => {
                        OrderStore.setEditor(OrderStore.getSchema(ENUM_ORDER.GETIN));
                        $router.push('/wmss/warehouse/order-create');
                    }
                "
                >直接入库</q-btn
            >
            <q-btn class="q-ml-sm" color="negative" square @click="$router.push('/wmss/purchase/create')">去采购</q-btn>
        </div>
    </div>

    <list-sku-individual
        label="加工"
        @pick="
            (picked:Sku) => {
                material = cloneDeep(picked)
                material.pounds = material.poundsFinal
                material.deductionSkuId = material._id
                material._id = ''

                indexProcess = 0
                SkuStore.listPicked = []
                dialogMaterial = true
            }"
    />

    <q-dialog v-model="dialogMaterial" maximized position="bottom">
        <q-card style="min-height: 500px" class="w-1200">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title> 原材料加工 </q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>

            <q-stepper v-model="indexProcess" color="primary" animated>
                <q-step :name="0" title="选择一个原材料（领料）" icon="content_cut">
                    <div class="text-center text-body1">
                        <div>您正在领取原材料进行成品加工</div>
                        <div>
                            当前已选择 <span class="text-negative">{{ material.name }} {{ material.norm }}</span>
                            ，当前剩余
                            <span class="text-primary text-h6 text-bold">{{ material.poundsFinal.toFixed(3) }}</span>
                            吨
                        </div>
                    </div>

                    <q-stepper-navigation class="row">
                        <q-space></q-space>
                        <q-btn square push @click="() => (indexProcess = 1)" color="negative" label="下一步，选择加工成品" />
                        <q-space></q-space>
                    </q-stepper-navigation>
                </q-step>

                <q-step :name="1" title="输入成品" icon="edit">
                    <container-sku />

                    <div class="row q-my-md">
                        <q-space></q-space>
                        <q-btn square push @click="() => (indexProcess = 0)" label="上一步" class="q-mr-sm" />

                        <q-btn class="q-mr-sm" square push label="批量导入" color="white" text-color="primary">
                            <q-menu>
                                <q-list>
                                    <q-item clickable @click="NotifyStore.download()">
                                        <q-item-section>下载模板</q-item-section>
                                    </q-item>
                                    <q-item clickable>
                                        <q-item-section>
                                            <q-file
                                                dense
                                                borderless
                                                accept=".xlsx, .xls"
                                                v-model="filePicking"
                                                label="选择文件"
                                                @update:model-value="filePickNext"
                                            />
                                        </q-item-section>
                                    </q-item>
                                </q-list>
                            </q-menu>
                        </q-btn>
                        <q-btn square push color="negative" label="下一步" @click="() => (indexProcess = 2)" />
                    </div>

                    <picker-cabinet-unit />
                </q-step>

                <q-step :name="2" title="完成加工" icon="check">
                    <div class="text-center text-body1">
                        <div>
                            您正在领取原材料 <span class="text-negative">{{ material.name }} {{ material.norm }}</span>
                            ，当前剩余
                            <span class="text-h6"> {{ Number(material.poundsFinal || 0).toFixed(3) }} </span>

                            吨
                        </div>
                        <div class="row q-my-md">
                            <div class="col"></div>
                            <div class="col-4">
                                <q-input
                                    class="q-ml-sm"
                                    square
                                    filled
                                    dense
                                    borderless
                                    type="number"
                                    color="negative"
                                    input-class="text-body1 text-right"
                                    v-model="material.pounds"
                                >
                                    <template v-slot:prepend>
                                        <span class="text-body1">加工后剩余</span>
                                    </template>
                                    <template v-slot:append>
                                        <span class="text-body1">吨</span>
                                    </template>
                                </q-input>
                            </div>
                            <div class="col"></div>
                        </div>
                        <div>
                            您本次加工产品共计 <span class="text-negative text-bold">{{ SkuStore.listPicked.length }} 项</span>
                        </div>
                    </div>

                    <q-stepper-navigation class="row">
                        <q-space></q-space>
                        <q-btn square push @click="() => (indexProcess = 1)" label="上一步" class="q-mr-sm" />
                        <q-btn
                            class="q-mr-sm"
                            square
                            push
                            color="orange"
                            label="仅加工"
                            @click="
                                async () => {
                                    await postProcess();
                                    await SkuStore.get();
                                    indexProcess = 2;
                                    dialogMaterial = false;
                                }
                            "
                        >
                            <q-tooltip class="text-body1">仅仅为您加工入库商品 {{ SkuStore.listPicked.length }}项</q-tooltip>
                        </q-btn>
                        <q-btn
                            square
                            push
                            color="negative"
                            label="领料，并加工"
                            @click="
                                async () => {
                                    await postOrder();
                                    await SkuStore.get();
                                    indexProcess = 2;
                                    dialogMaterial = false;
                                }
                            "
                        >
                            <q-tooltip class="text-body1">将扣除原材料的库存重量，并为您加工入库商品 {{ SkuStore.listPicked.length }}项</q-tooltip>
                        </q-btn>
                        <q-space></q-space>
                    </q-stepper-navigation>
                </q-step>
            </q-stepper>

            <q-inner-loading :showing="OrderStore.loadding">
                <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import * as XLSX from "xlsx";
import { onMounted, ref, computed } from "vue";
import { cloneDeep, debounce } from "lodash";
import { useRouter, useRoute } from "vue-router";

import { MongodbSort, getPage } from "qqlx-cdk";
import { ENUM_LAYOUT_CABINET, ENUM_ORDER, Sku, SkuJoined } from "qqlx-core";

import listSkuIndividual from "@/components/list-sku-individual.vue";
import pickerCabinetUnit from "@/components/picker-cabinet-unit.vue";
import containerSku from "@/components/container-sku.vue";
import dialogIntro from "@/components/dialog-intro.vue";
import { useContactStore } from "@/stores/brand/contact";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useSkuStore } from "@/stores/wmss/sku";
import { useOrderStore } from "@/stores/wmss/order";

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

const OrderStore = useOrderStore();
const dialogMaterial = ref(false);
const indexProcess = ref(0);

const SkuStore = useSkuStore();
const material = ref(SkuStore.getSchema());
const postOrder = async () => {
    OrderStore.setEditor(OrderStore.getSchema(ENUM_ORDER.PROCESS));
    const skus = cloneDeep(SkuStore.listPicked);

    // 创建领料单
    if (material.value?.deductionSkuId) {
        const individual = cloneDeep(material.value);
        individual.pounds = individual.poundsFinal - individual.pounds;
        OrderStore.setEditor(OrderStore.getSchema(ENUM_ORDER.MATERIAL));
        const result = await OrderStore.post([individual]);

        OrderStore.setEditor(OrderStore.getSchema(ENUM_ORDER.PROCESS));
        skus.forEach((sku) => (sku.deductionSkuId = material.value?.deductionSkuId));
        // if (result._id) {
        //     OrderStore.editor.parentOrderId = result._id;
        //     OrderStore.editor.parentOrderType = ENUM_ORDER.MATERIAL;
        // }
    }

    // 创建加工单
    await OrderStore.post(skus);
};
const postProcess = async () => {
    OrderStore.setEditor(OrderStore.getSchema(ENUM_ORDER.PROCESS));
    const skus = cloneDeep(SkuStore.listPicked);
    // 创建加工单
    await OrderStore.post(skus);
};

const route = useRoute();
onMounted(() => {});
</script>

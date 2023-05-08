<template>
    <q-table
        v-if="!!vue_props.skus"
        dense
        row-key="_id"
        hide-pagination
        separator="vertical"
        :columns="SkuStore.columns"
        :visible-columns="SkuStore.columnsVisiable"
        :rows-per-page-options="[0]"
        :rows="vue_props.skus || []"
    >
        <template v-slot:header-cell-_id="props">
            <q-th key="_id" :props="props">
                <q-btn padding="xs" color="primary" flat icon="visibility">
                    <q-menu>
                        <q-card class="w-500">
                            <plate-sku />
                        </q-card>
                    </q-menu>
                </q-btn>
                <q-tooltip class="text-body1">列设置</q-tooltip>
            </q-th>
        </template>
        <template v-slot:body="props">
            <q-tr>
                <q-td key="timeCreateString" :props="props" style="text-align: left" class="text-grey"> {{ props.row.timeCreateString }} </q-td>
                <q-td key="layout" :props="props" :style="NotifyStore.fontStyle">
                    <q-badge v-if="props.row.deductionSkuId" color="negative">
                        现货
                        <q-tooltip class="text-body1">出库后将扣减此规格原材料库存</q-tooltip>
                    </q-badge>
                    <q-badge v-else-if="props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL" color="primary">
                        原材料
                        <q-tooltip class="text-body1">出库后，将不会扣减此规格的原材料库存</q-tooltip>
                    </q-badge>
                    <q-badge v-else color="grey">
                        普通
                        <q-tooltip class="text-body1">{{ MAP_ENUM_LAYOUT_CABINET.get(props.row.layout)?.tip }}</q-tooltip>
                    </q-badge>
                </q-td>
                <q-td key="name" :props="props" :style="NotifyStore.fontStyle">{{ props.row.name }} </q-td>
                <q-td key="norm" :props="props" :style="NotifyStore.fontStyle">{{ props.row.norm }}</q-td>
                <q-td key="formula" :props="props" :style="NotifyStore.fontStyle">
                    <q-badge
                        v-if="
                            props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL && props.row.type === ENUM_ORDER.GETOUT
                                ? props.row.deductionSkuId
                                    ? true
                                    : false
                                : true
                        "
                        :color="SkuStore.getLabelByType(props.row.type).color"
                    >
                        {{ SkuStore.getLabelByType(props.row.type).text }}
                    </q-badge>
                </q-td>
                <q-td key="count" :props="props" :style="NotifyStore.fontStyle" class="text-right">
                    <span v-if="[ENUM_ORDER.GETOUT, ENUM_ORDER.MATERIAL].includes(props.row.type)">-</span>
                    {{ props.row.count }} {{ props.row.unit }}
                </q-td>
                <q-td key="pounds" :props="props" :style="NotifyStore.fontStyle" class="text-right text-grey">
                    <span v-if="[ENUM_ORDER.GETOUT, ENUM_ORDER.MATERIAL].includes(props.row.type)">-</span>
                    <span v-if="props.row.isPriceInPounds">{{ props.row.pounds.toFixed(3) }} 吨</span>
                </q-td>
                <q-td key="poundsFinal" :props="props" :style="NotifyStore.fontStyle" class="text-negative text-bold text-right">
                    <span v-if="props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL && [ENUM_ORDER.GETIN].includes(props.row.type)">
                        {{ props.row.poundsFinal.toFixed(3) }} 吨
                    </span>
                </q-td>
                <q-td key="keyOrigin" :props="props" :style="NotifyStore.fontStyle">{{ props.row.keyOrigin || "-" }}</q-td>
                <q-td key="keyFeat" :props="props" :style="NotifyStore.fontStyle">{{ props.row.keyFeat || "-" }}</q-td>
                <q-td key="keyCode" :props="props" :style="NotifyStore.fontStyle">{{ props.row.keyCode || "-" }}</q-td>
                <q-td key="warehouseId" :props="props" :style="NotifyStore.fontStyle">{{ props.row.joinWarehouse?.name }} </q-td>
                <q-td key="keyHouse" :props="props" :style="NotifyStore.fontStyle">{{ props.row.keyHouse || "-" }}</q-td>
                <q-td key="price" :props="props" :style="NotifyStore.fontStyle" class="text-right">{{ props.row.price.toFixed(2) }}</q-td>
                <q-td key="remark" :props="props" :style="NotifyStore.fontStyle">{{ props.row.remark }}</q-td>
                <q-td key="orderContactId" :props="props" :style="NotifyStore.fontStyle">
                    <span v-if="props.row.joinOrderContact">{{ props.row.joinOrderContact?.name }} </span>
                    <span v-else class="text-grey">无</span>
                </q-td>
                <q-td key="orderId" :props="props" :style="NotifyStore.fontStyle">
                    {{ props.row.joinOrder?.code }}
                </q-td>
                <q-td key="_id" :props="props" :style="NotifyStore.fontStyle" style="padding: 0 4px">
                    <q-btn
                        color="negative"
                        padding="xs"
                        flat
                        v-if="[ENUM_ORDER.MATERIAL, ENUM_ORDER.PROCESS].includes(props.row.type)"
                        v-close-popup
                        @click="
                            async () => {
                                SkuStore.loadding = true;
                                await OrderStore.delete(props.row.joinOrder?._id);
                                SkuStore.get();
                            }
                        "
                    >
                        删除
                    </q-btn>
                </q-td>
            </q-tr>
        </template>
    </q-table>
</template>

<script lang="ts" setup>
import { cloneDeep } from "lodash";
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import { ENUM_LAYOUT_CABINET, MAP_ENUM_LAYOUT_CABINET, ENUM_ORDER } from "qqlx-core";
import type { Sku } from "qqlx-core";

import plateSku from "./plate-sku.vue";
import { useSkuStore } from "@/stores/wmss/sku";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useOrderStore } from "@/stores/wmss/order";

const route = useRoute();
const NotifyStore = useNotifyStore();
const SkuStore = useSkuStore();
const OrderStore = useOrderStore();

const vue_props = defineProps({
    skus: {
        type: Array<Sku>,
        default: [],
    },
});
</script>

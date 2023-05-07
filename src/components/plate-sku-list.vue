<template>
    <q-table
        v-if="!!vue_props.skus"
        dense
        row-key="_id"
        hide-pagination
        separator="vertical"
        :columns="
            [
                { name: 'layout', field: 'layout', label: '类型', align: 'left' },
                { name: 'name', field: 'name', label: '品名', align: 'left' },
                { name: 'norm', field: 'norm', label: '规格', align: 'left' },
                { name: 'formula', field: 'formula', label: '用途', align: 'left' },
                { name: 'count', field: 'count', label: '数量' },
                { name: 'pounds', field: 'pounds', label: '过磅' },
                { name: 'keyOrigin', field: 'keyOrigin', label: '产地', align: 'left' },
                { name: 'keyFeat', field: 'keyFeat', label: '材质', align: 'left' },
                { name: 'keyCode', field: 'keyCode', label: '捆包号', align: 'left' },
                { name: 'warehouseId', field: 'warehouseId', label: '仓库', align: 'left' },
                { name: 'keyHouse', field: 'keyHouse', label: '货位号', align: 'left' },
                { name: 'price', field: 'price', label: '单价' },
                { name: 'remark', field: 'remark', label: '备注', align: 'left' },
            ].concat(
                SkuStore.dialogMore
                    ? [
                          { name: 'timeCreateString', field: 'timeCreateString', label: '时间' },
                          { name: 'poundsFinal', field: 'poundsFinal', label: '剩余库存' },
                          { name: '_id', field: '_id', label: '操作', align: 'left' },
                      ]
                    : []
            )
        "
        :rows-per-page-options="[0]"
        :rows="vue_props.skus || []"
    >
        <template v-slot:body="_props">
            <q-tr>
                <q-td :_props="_props" :style="NotifyStore.fontStyle">
                    <q-badge v-if="_props.row.deductionSkuId" color="negative">
                        现货
                        <q-tooltip class="text-body1">出库后将扣减此规格原材料库存</q-tooltip>
                    </q-badge>
                    <q-badge v-else-if="_props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL" color="primary">
                        原材料
                        <q-tooltip class="text-body1">出库后，将不会扣减此规格的原材料库存</q-tooltip>
                    </q-badge>
                    <q-badge v-else color="grey">
                        普通
                        <q-tooltip class="text-body1">{{ MAP_ENUM_LAYOUT_CABINET.get(_props.row.layout)?.tip }}</q-tooltip>
                    </q-badge>
                </q-td>
                <q-td :_props="_props" :style="NotifyStore.fontStyle">{{ _props.row.name }} </q-td>
                <q-td :_props="_props" :style="NotifyStore.fontStyle">{{ _props.row.norm }}</q-td>
                <q-td :_props="_props" :style="NotifyStore.fontStyle">
                    <q-badge
                        v-if="
                            _props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL && _props.row.type === ENUM_ORDER.GETOUT
                                ? _props.row.deductionSkuId
                                    ? true
                                    : false
                                : true
                        "
                        :color="SkuStore.getLabelByType(_props.row.type).color"
                    >
                        {{ SkuStore.getLabelByType(_props.row.type).text }}
                    </q-badge>
                </q-td>
                <q-td :_props="_props" :style="NotifyStore.fontStyle" class="text-right">
                    <span v-if="[ENUM_ORDER.GETOUT, ENUM_ORDER.MATERIAL].includes(_props.row.type)">-</span>
                    {{ _props.row.count }} {{ _props.row.unit }}
                </q-td>
                <q-td :_props="_props" :style="NotifyStore.fontStyle" class="text-right text-grey">
                    <span v-if="[ENUM_ORDER.GETOUT, ENUM_ORDER.MATERIAL].includes(_props.row.type)">-</span>
                    <span v-if="_props.row.isPriceInPounds">{{ _props.row.pounds.toFixed(3) }} 吨</span>
                </q-td>
                <q-td :_props="_props" :style="NotifyStore.fontStyle">{{ _props.row.keyOrigin || "-" }}</q-td>
                <q-td :_props="_props" :style="NotifyStore.fontStyle">{{ _props.row.keyFeat || "-" }}</q-td>
                <q-td :_props="_props" :style="NotifyStore.fontStyle">{{ _props.row.keyCode || "-" }}</q-td>
                <q-td :_props="_props" :style="NotifyStore.fontStyle">{{ _props.row.joinWarehouse?.name }} </q-td>
                <q-td :_props="_props" :style="NotifyStore.fontStyle">{{ _props.row.keyHouse || "-" }}</q-td>
                <q-td :_props="_props" :style="NotifyStore.fontStyle" class="text-right">{{ _props.row.price.toFixed(2) }}</q-td>
                <q-td :_props="_props" :style="NotifyStore.fontStyle">{{ _props.row.remark }}</q-td>
                <q-td :_props="_props" :style="NotifyStore.fontStyle" v-if="SkuStore.dialogMore">{{ _props.row.timeCreateString }} </q-td>
                <q-td :_props="_props" :style="NotifyStore.fontStyle" v-if="SkuStore.dialogMore" class="text-negative text-bold text-right">
                    <span v-if="_props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL && [ENUM_ORDER.GETIN].includes(_props.row.type)">
                        {{ _props.row.poundsFinal.toFixed(3) }} 吨
                    </span>
                </q-td>
                <q-td :_props="_props" :style="NotifyStore.fontStyle" v-if="SkuStore.dialogMore" style="padding: 0 4px">
                    <q-btn
                        color="negative"
                        padding="xs"
                        flat
                        v-if="[ENUM_ORDER.MATERIAL, ENUM_ORDER.PROCESS].includes(_props.row.type)"
                        v-close-popup
                        @click="
                            async () => {
                                SkuStore.loadding = true;
                                await OrderStore.delete(_props.row.joinOrder?._id);
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

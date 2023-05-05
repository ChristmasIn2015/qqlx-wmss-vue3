<template>
    <q-table
        v-if="!!vue_props.skus"
        dense
        row-key="_id"
        hide-pagination
        separator="vertical"
        :columns="[
            { name: 'layout', field: 'layout', label: '商品性质', align: 'left' },
            { name: 'name', field: 'name', label: '品名', align: 'left' },
            { name: 'norm', field: 'norm', label: '规格', align: 'left' },
            { name: 'count', field: 'count', label: '数量' },
            { name: 'pounds', field: 'pounds', label: '过磅' },
            { name: 'keyOrigin', field: 'keyOrigin', label: '产地', align: 'left' },
            { name: 'keyFeat', field: 'keyFeat', label: '材质', align: 'left' },
            { name: 'keyCode', field: 'keyCode', label: '捆包号', align: 'left' },
            { name: 'warehouseId', field: 'warehouseId', label: '仓库', align: 'left' },
            { name: 'keyHouse', field: 'keyHouse', label: '货位号', align: 'left' },
            { name: 'price', field: 'price', label: '单价' },
            { name: 'remark', field: 'remark', label: '备注', align: 'left' },
        ]"
        :rows-per-page-options="[0]"
        :rows="vue_props.skus || []"
    >
        <template v-slot:body="_props">
            <q-tr>
                <q-td :_props="_props" style="font-size: 16px">
                    <q-badge :color="_props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL ? 'primary' : 'grey'">
                        {{ _props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL ? "原材料" : "普通" }}
                        <q-tooltip class="text-body1">{{ MAP_ENUM_LAYOUT_CABINET.get(_props.row.layout)?.tip }}</q-tooltip>
                    </q-badge>
                </q-td>
                <q-td :_props="_props" style="font-size: 16px">{{ _props.row.name }} </q-td>
                <q-td :_props="_props" style="font-size: 16px">{{ _props.row.norm }}</q-td>
                <q-td :_props="_props" style="font-size: 16px" class="text-right">{{ _props.row.count }} {{ _props.row.unit }}</q-td>
                <q-td :_props="_props" style="font-size: 16px" class="text-right">
                    <span v-if="_props.row.isPriceInPounds">{{ _props.row.pounds.toFixed(3) }} 吨</span>
                </q-td>
                <q-td :_props="_props" style="font-size: 16px">{{ _props.row.keyOrigin || "-" }}</q-td>
                <q-td :_props="_props" style="font-size: 16px">{{ _props.row.keyFeat || "-" }}</q-td>
                <q-td :_props="_props" style="font-size: 16px">{{ _props.row.keyCode || "-" }}</q-td>
                <q-td :_props="_props" style="font-size: 16px">{{ _props.row.joinWarehouse?.name }} </q-td>
                <q-td :_props="_props" style="font-size: 16px">{{ _props.row.keyHouse || "-" }}</q-td>
                <q-td :_props="_props" style="font-size: 16px" class="text-right">{{ _props.row.price.toFixed(2) }}</q-td>
                <q-td :_props="_props" style="font-size: 16px">{{ _props.row.remark }}</q-td>
            </q-tr>
        </template>
    </q-table>
</template>

<script lang="ts" setup>
import { cloneDeep } from "lodash";
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import { ENUM_LAYOUT_CABINET, MAP_ENUM_LAYOUT_CABINET } from "qqlx-core";
import type { Sku } from "qqlx-core";
import { useSkuStore } from "@/stores/wmss/sku";
import { useNotifyStore } from "@/stores/quasar/notify";

const route = useRoute();
const NotifyStore = useNotifyStore();
const SkuStore = useSkuStore();

const vue_props = defineProps({
    skus: {
        type: Array<Sku>,
        default: [],
    },
});
</script>

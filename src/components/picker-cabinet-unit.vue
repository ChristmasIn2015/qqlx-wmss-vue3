<template>
    <q-card>
        <q-splitter v-model="splitIndex" horizontal>
            <template v-slot:before>
                <div class="row no-wrap">
                    <q-tabs v-model="tabIndex" dense class="text-primary">
                        <q-tab v-for="(cabinet, index) in CabinetStore.list" :name="index">
                            <span class="text-body1 q-my-sm">{{ cabinet.name }}</span>
                            <q-badge v-if="cabinet.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL" floating>原料</q-badge>
                        </q-tab>
                    </q-tabs>
                    <q-space></q-space>
                    <q-btn icon="settings" flat color="primary" @click="$router.push('/wmss/system/cabinet')">
                        <q-tooltip class="text-body1">去设置商品</q-tooltip>
                    </q-btn>
                </div>
            </template>
            <template v-slot:after>
                <q-table
                    style="height: 380px"
                    separator="cell"
                    row-key="_id"
                    dense
                    :rows-per-page-options="[0]"
                    :rows="CabinetUnitStore.list"
                    :columns="[
                        { name: 'name', field: 'name', label: '品名', align: 'left', style: NotifyStore.cellStyle },
                        { name: 'norm', field: 'norm', label: '规格', align: 'left', style: NotifyStore.cellStyle },
                        { name: 'countFinal', field: 'countFinal', label: '库存', style: NotifyStore.cellStyle },
                        { name: 'actions', field: 'actions', label: '操作', align: 'left' },
                    ]"
                >
                    <template v-slot:header="props">
                        <q-tr>
                            <q-th :style="NotifyStore.cellStyle">
                                <q-input
                                    square
                                    filled
                                    dense
                                    clearable
                                    placeholder="搜索品名"
                                    v-model="CabinetUnitStore.search.name"
                                    @update:model-value="debounceGet()"
                                />
                            </q-th>
                            <q-th :style="NotifyStore.cellStyle">
                                <q-input
                                    square
                                    filled
                                    dense
                                    clearable
                                    placeholder="搜索规格"
                                    style="margin-left: -6px"
                                    :loading="CabinetUnitStore.loadding"
                                    v-model="CabinetUnitStore.search.norm"
                                    @update:model-value="debounceGet()"
                                />
                            </q-th>
                            <q-th
                                :props="props"
                                key="countFinal"
                                class="cursor-pointer"
                                :class="
                                    nowCabinet?.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL
                                        ? { 'text-negative': CabinetUnitStore.sortKey === 'poundsFinal' }
                                        : { 'text-negative': CabinetUnitStore.sortKey === 'countFinal' }
                                "
                                @click="CabinetUnitStore.sort(nowCabinet, nowCabinet?.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL ? 'poundsFinal' : 'countFinal')"
                            >
                                <span>
                                    <span>剩余库存</span>
                                    <q-icon :name="CabinetUnitStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                                </span>
                            </q-th>
                            <q-th key="actions" :props="props">操作</q-th>
                        </q-tr>
                    </template>

                    <template v-slot:body="props">
                        <q-tr :props="props">
                            <q-td key="name" :props="props"> {{ props.row.name }} </q-td>
                            <q-td key="norm" :props="props"> {{ props.row.norm }} </q-td>
                            <q-td key="countFinal" :props="props">
                                <a class="cursor-pointer text-grey">
                                    <span
                                        v-if="nowCabinet?.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL"
                                        :class="props.row.poundsFinal > 1 ? 'text-negative' : ''"
                                        @click="$router.push('/wmss/warehouse/sku-individual' + `?name=${props.row.name}&norm=${props.row.norm}`)"
                                    >
                                        {{ props.row.poundsFinal.toFixed(3) }} 吨
                                    </span>
                                    <span
                                        v-else
                                        :class="props.row.countFinal > 1 ? 'text-negative' : ''"
                                        @click="$router.push('/wmss/warehouse/sku-list' + `?name=${props.row.name}&norm=${props.row.norm}`)"
                                    >
                                        {{ props.row.countFinal.toFixed(0) }} {{ props.row.joinCabinet?.unit }}
                                    </span>

                                    <q-tooltip class="text-body1">
                                        <div v-if="nowCabinet?.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
                                            <div>一共剩余 {{ props.row.poundsFinal.toFixed(3) }} 吨</div>
                                            <div>点击查看原材料</div>
                                        </div>
                                        <div v-else>
                                            <div>一共剩余 {{ props.row.countFinal.toFixed(0) }} {{ props.row.joinCabinet?.unit }}</div>
                                            <div>点击查看库存流水</div>
                                        </div>
                                    </q-tooltip>
                                </a>
                            </q-td>
                            <q-td key="actions" :props="props" style="padding: 0">
                                <div class="row q-px-sm">
                                    <q-btn
                                        :color="nowCabinet?.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL ? 'primary' : 'negative'"
                                        flat
                                        square
                                        padding="xs"
                                        class="text-body1"
                                        @click="pushSku(props.row)"
                                        >开单</q-btn
                                    >
                                    <q-btn
                                        v-if="route.path.includes('trade/sale-') && nowCabinet?.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL"
                                        flat
                                        square
                                        padding="xs"
                                        color="negative"
                                        class="text-body1 q-ml-xs"
                                        @click="
                                            () => {
                                                namePicking = props.row.name;
                                                normPicking = props.row.norm;
                                                dialogSkuIndividual = true;
                                            }
                                        "
                                        >选择现货</q-btn
                                    >
                                    <q-space></q-space>
                                    <q-btn flat padding="xs" icon="more_horiz" square>
                                        <q-menu>
                                            <q-item clickable v-close-popup class="text-primary" @click="CabinetUnitStore.patch(nowCabinet, [props.row])">
                                                <q-item-section>重新计算</q-item-section>
                                            </q-item>
                                            <q-item clickable v-close-popup class="text-negative" @click="CabinetUnitStore.deleteOne(nowCabinet, props.row)">
                                                <q-item-section>删除</q-item-section>
                                            </q-item>
                                        </q-menu>
                                    </q-btn>
                                </div>
                            </q-td>
                        </q-tr>
                    </template>
                    <template v-slot:bottom="props">
                        <q-pagination
                            square
                            size="16px"
                            color="white"
                            class="q-my-sm"
                            text-color="black"
                            active-color="primary"
                            active-text-color="white"
                            v-model="CabinetUnitStore.page.page"
                            :max-pages="10"
                            :max="Math.ceil(CabinetUnitStore.total / CabinetUnitStore.page.pageSize)"
                            @update:model-value="(value) => CabinetUnitStore.get(nowCabinet, value)"
                        />
                        <q-space></q-space>
                        <span>共 {{ CabinetUnitStore.total }} 项</span>
                    </template>
                </q-table>
            </template>
        </q-splitter>

        <q-inner-loading :showing="CabinetUnitStore.loadding">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </q-card>

    <q-dialog v-model="dialogSkuIndividual" maximized position="bottom">
        <q-card>
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>原材料</q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>

            <list-sku-individual :name="namePicking" :norm="normPicking" @pick="(sku) => pushSkuIndividual(sku)"></list-sku-individual>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import { cloneDeep, debounce } from "lodash";
import { onMounted, ref, computed, watch } from "vue";

import { MongodbSort } from "qqlx-cdk";
import { ENUM_LAYOUT_CABINET, SkuJoined, CabinetUnit, Sku, ENUM_ORDER } from "qqlx-core";

import listSkuIndividual from "./list-sku-individual.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useCabinetStore } from "@/stores/wmss/cabinet";
import { useCabinetUnitStore } from "@/stores/wmss/cabinetUnit";
import { useSkuStore } from "@/stores/wmss/sku";
import { useAreaStore } from "@/stores/brand/area";
import { useOrderStore } from "@/stores/wmss/order";

const route = useRoute();
const NotifyStore = useNotifyStore();

const CabinetStore = useCabinetStore();
const OrderStore = useOrderStore();

const splitIndex = ref(20);
const tabIndex = ref(0);
const nowCabinet = computed(() => (CabinetStore.list[tabIndex.value] ? CabinetStore.list[tabIndex.value] : CabinetStore.list[0]));

const CabinetUnitStore = useCabinetUnitStore();
const AreaStore = useAreaStore();
watch(
    () => nowCabinet.value,
    (cabinet) => {
        CabinetUnitStore.page.pageSize = 8;
        CabinetUnitStore.get(cabinet, 1);
    }
);
const debounceGet = debounce(() => CabinetUnitStore.get(nowCabinet.value, 1), 200);

const SkuStore = useSkuStore();
const dialogSkuIndividual = ref(false);
const namePicking = ref("");
const normPicking = ref("");
const pushSku = (unit: CabinetUnit) => {
    const schema = SkuStore.getSchema() as SkuJoined;
    schema.name = unit.name;
    schema.norm = unit.norm;
    schema.unit = nowCabinet.value?.unit;

    //@ts-ignore
    schema.count = null;
    //@ts-ignore
    schema.price = unit.price ? Number(unit.price || 0) : (null as number);

    schema.formula = nowCabinet.value?.formula;
    schema.layout = nowCabinet.value?.layout;

    if (schema.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL) {
        schema.count = 1;
        schema.isPriceInPounds = true;
    }
    if (SkuStore.listPicked.length >= 8) NotifyStore.fail(`最多添加 8项商品`);
    else SkuStore.listPicked.push(schema);
};
const pushSkuIndividual = (sku: Sku) => {
    const schema = SkuStore.getSchema() as SkuJoined;
    schema.name = sku.name;
    schema.norm = sku.norm;
    schema.unit = nowCabinet.value?.unit;

    schema.count = 1;
    schema.isPriceInPounds = true;
    //@ts-ignore
    schema.price = null as number;

    schema.formula = nowCabinet.value?.formula;
    schema.layout = ENUM_LAYOUT_CABINET.INDIVIDUAL;

    schema.keyOrigin = sku.keyOrigin;
    schema.keyFeat = sku.keyFeat;
    schema.keyCode = sku.keyCode;
    schema.warehouseId = sku.warehouseId;
    schema.keyHouse = sku.keyHouse;

    schema.deductionSkuId = sku._id;
    if (SkuStore.listPicked.length >= 8) NotifyStore.fail(`最多添加 8项商品`);
    else SkuStore.listPicked.push(schema);
};

// action
onMounted(async () => {
    await CabinetStore.get();
});
</script>

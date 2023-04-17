<template>
    <q-card>
        <q-splitter v-model="splitIndex" horizontal>
            <template v-slot:before>
                <div class="row no-wrap">
                    <q-tabs v-model="tabIndex" dense class="text-primary">
                        <q-tab v-for="(cabinet, index) in CabinetStore.list" :name="index">
                            <span class="text-body1 q-my-sm">{{ cabinet.name }}</span>
                            <q-badge v-if="cabinet.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL" floating>大件</q-badge>
                        </q-tab>
                    </q-tabs>
                    <q-space></q-space>
                    <q-btn icon="settings" flat color="primary" @click="$router.push('/wmss/system/cabinet')"></q-btn>
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
                        { name: 'price', field: 'price', label: '推荐单价', style: NotifyStore.cellStyle },
                        { name: 'timeCreateString', field: 'timeCreateString', label: '时间', style: 'font-size: 16px' },
                    ]"
                >
                    <template v-slot:header="props">
                        <q-tr :props="props">
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
                                :class="
                                    nowCabinet?.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL
                                        ? { 'text-negative': CabinetUnitStore.sortKey === 'poundsFinal' }
                                        : { 'text-negative': CabinetUnitStore.sortKey === 'countFinal' }
                                "
                                class="cursor-pointer"
                                @click="CabinetUnitStore.sort(nowCabinet, nowCabinet?.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL ? 'poundsFinal' : 'countFinal')"
                            >
                                <span>
                                    <q-icon name="help_outlined" size="14px" v-if="nowCabinet?.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
                                        <q-tooltip class="text-body1">
                                            <div>您可以在“大件商品”菜单中，查看具体明细</div>
                                        </q-tooltip>
                                    </q-icon>
                                    <span>剩余库存</span>
                                    <q-icon :name="CabinetUnitStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                                </span>
                            </q-th>
                            <q-th
                                :props="props"
                                key="price"
                                :class="{ 'text-negative': CabinetUnitStore.sortKey === 'price' }"
                                class="cursor-pointer"
                                @click="CabinetUnitStore.sort(nowCabinet, 'price')"
                            >
                                <span>推荐单价 </span>
                                <q-icon :name="CabinetUnitStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                            </q-th>
                            <q-th
                                :props="props"
                                key="timeCreateString"
                                :class="{ 'text-negative': CabinetUnitStore.sortKey === 'timeCreate' }"
                                class="cursor-pointer"
                                @click="CabinetUnitStore.sort(nowCabinet, 'timeCreate')"
                            >
                                <span>时间</span>
                                <q-icon :name="CabinetUnitStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                            </q-th>
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
                                        {{ (props.row.poundsFinal / 1000).toFixed(3) }} 吨
                                    </span>
                                    <span
                                        v-else
                                        :class="props.row.countFinal > 1 ? 'text-negative' : ''"
                                        @click="$router.push('/wmss/warehouse/sku-list' + `?name=${props.row.name}&norm=${props.row.norm}`)"
                                    >
                                        {{ props.row.countFinal.toFixed(0) }} {{ props.row.joinCabinet?.unit }}
                                    </span>
                                </a>
                            </q-td>
                            <q-td key="price" :props="props" :class="{}"> {{ props.row.price / 100 }} 元 </q-td>
                            <q-td key="timeCreateString" :props="props">
                                <div class="row">
                                    <a class="text-body1 cursor-pointer text-negative" @click.capture="pushSku(props.row)">开单</a>
                                    <q-space></q-space>
                                    <span>{{ props.row.timeCreateString }}</span>
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
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import { cloneDeep, debounce } from "lodash";
import { onMounted, ref, computed, watch } from "vue";

import { MongodbSort } from "qqlx-cdk";
import { ENUM_LAYOUT_CABINET, SkuJoined, CabinetUnit } from "qqlx-core";

import { useNotifyStore } from "@/stores/quasar/notify";
import { useCabinetStore } from "@/stores/wmss/cabinet";
import { useCabinetUnitStore } from "@/stores/wmss/cabinetUnit";
import { useSkuStore } from "@/stores/wmss/sku";

const route = useRoute();
const NotifyStore = useNotifyStore();

const CabinetStore = useCabinetStore();

const splitIndex = ref(20);
const tabIndex = ref(0);
const nowCabinet = computed(() => (CabinetStore.list[tabIndex.value] ? CabinetStore.list[tabIndex.value] : CabinetStore.list[0]));

const CabinetUnitStore = useCabinetUnitStore();
watch(
    () => nowCabinet.value,
    (cabinet) => {
        CabinetUnitStore.page.pageSize = 8;
        CabinetUnitStore.listPicked = [];
        CabinetUnitStore.get(cabinet, 1);
    }
);
const debounceGet = debounce(() => CabinetUnitStore.get(nowCabinet.value, 1), 200);

const SkuStore = useSkuStore();
const pushSku = (unit: CabinetUnit) => {
    const schema = SkuStore.getSchema() as SkuJoined;
    schema.name = unit.name;
    schema.norm = unit.norm;
    schema.unit = nowCabinet.value?.unit;

    //@ts-ignore
    schema.count = null;
    //@ts-ignore
    schema.price = unit.price ? Number(unit.price || 0) / 100 : (null as number);

    schema.formula = nowCabinet.value?.formula;
    schema.layout = nowCabinet.value?.layout;

    if (schema.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL) {
        schema.count = 1;
        schema.isPriceInPounds = true;
    }
    if (SkuStore.listPicked.length >= 8) NotifyStore.fail(`最多添加 8项商品`);
    else SkuStore.listPicked.push(schema);
};

// action
onMounted(async () => {
    await CabinetStore.get();
});
</script>

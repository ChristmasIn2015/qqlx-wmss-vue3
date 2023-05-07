<template>
    <q-card class="q-mt-sm">
        <q-table
            dense
            row-key="_id"
            separator="cell"
            style="min-height: 450px"
            :columns="(SkuStore.columns as any)"
            :visible-columns="SkuStore.columnsVisiable"
            :rows="SkuStore.list"
            :rows-per-page-options="[0]"
        >
            <template v-slot:header="props">
                <q-tr>
                    <q-th
                        key="timeCreateString"
                        class="cursor-pointer"
                        style="text-align: left"
                        :props="props"
                        :class="{ 'text-negative': SkuStore.sortKey === 'timeCreate' }"
                        @click="SkuStore.sort('timeCreate')"
                    >
                        <span>时间 </span>
                        <q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th key="layout" :props="props">库存类型</q-th>
                    <q-th key="name" :props="props">
                        <q-input square filled dense clearable color="primary" placeholder="搜索品名" v-model="SkuStore.search.name" @blur="SkuStore.get(1)" />
                    </q-th>
                    <q-th key="norm" :props="props">
                        <q-input square filled dense clearable color="primary" placeholder="搜索规格" v-model="SkuStore.search.norm" @blur="SkuStore.get(1)" />
                    </q-th>
                    <q-th key="formula" :props="props">来源</q-th>
                    <q-th
                        key="count"
                        :props="props"
                        class="cursor-pointer"
                        :class="{ 'text-negative': SkuStore.sortKey === 'count' }"
                        @click="SkuStore.sort('count')"
                    >
                        <span>数量</span>
                        <q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th
                        key="pounds"
                        :props="props"
                        class="cursor-pointer"
                        :class="{ 'text-negative': SkuStore.sortKey === 'pounds' }"
                        @click="SkuStore.sort('pounds')"
                    >
                        <span>初始重量</span>
                        <q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th
                        key="poundsFinal"
                        :props="props"
                        class="cursor-pointer"
                        :class="{ 'text-negative': SkuStore.sortKey === 'poundsFinal' }"
                        @click="SkuStore.sort('poundsFinal')"
                    >
                        <span>剩余重量</span>
                        <q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th key="keyOrigin" :props="props">
                        <q-input square filled dense clearable color="primary" placeholder="产地" v-model="SkuStore.search.keyOrigin" @blur="SkuStore.get(1)" />
                    </q-th>
                    <q-th key="keyFeat" :props="props">
                        <q-input square filled dense clearable color="primary" placeholder="材质" v-model="SkuStore.search.keyFeat" @blur="SkuStore.get(1)" />
                    </q-th>
                    <q-th key="keyCode" :props="props">
                        <q-input square filled dense clearable color="primary" placeholder="捆包号" v-model="SkuStore.search.keyCode" @blur="SkuStore.get(1)" />
                    </q-th>
                    <q-th key="warehouseId" :props="props" style="min-width: 155px">
                        <q-select
                            dense
                            square
                            filled
                            clearable
                            emit-value
                            map-options
                            label="仓库"
                            option-value="_id"
                            option-label="name"
                            placeholder="请选择仓库"
                            :options="WarehouseStore.list.filter((e) => e.isDisabled === false)"
                            v-model="SkuStore.search.warehouseId"
                            @update:model-value="SkuStore.get(1)"
                        >
                        </q-select>
                    </q-th>
                    <q-th key="keyHouse" :props="props">
                        <q-input
                            square
                            filled
                            dense
                            clearable
                            color="primary"
                            placeholder="货位号"
                            v-model="SkuStore.search.keyHouse"
                            @blur="SkuStore.get(1)"
                        />
                    </q-th>
                    <q-th
                        key="price"
                        :props="props"
                        :class="{ 'text-negative': SkuStore.sortKey === 'price' }"
                        class="cursor-pointer"
                        @click="SkuStore.sort('price')"
                    >
                        <span>单价 </span>
                        <q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th key="remark" :props="props">
                        <q-input
                            square
                            filled
                            dense
                            clearable
                            color="primary"
                            placeholder="搜索备注"
                            v-model="SkuStore.search.remark"
                            @blur="SkuStore.get(1)"
                        />
                    </q-th>
                    <q-th key="orderContactId" :props="props">
                        <q-btn padding="xs" flat square color="primary" @click="contactDialog = true">
                            {{ contactPicked._id ? contactPicked.name : "点击筛选客户" }}
                        </q-btn>
                        <q-btn
                            v-show="contactPicked._id"
                            padding="xs"
                            flat
                            square
                            color="primary"
                            @click="
                                () => {
                                    contactPicked = ContactStore.getSchema();
                                    SkuStore.search.orderContactId = '';
                                    SkuStore.get(1);
                                }
                            "
                        >
                            <q-icon name="close"></q-icon>
                        </q-btn>
                    </q-th>
                    <q-th key="orderId" :props="props">订单编号</q-th>
                    <q-th key="_id" :props="props">
                        <q-btn flat icon="visibility">
                            <q-menu>
                                <q-card class="w-500">
                                    <plate-sku />
                                </q-card>
                            </q-menu>
                        </q-btn>
                        <q-tooltip class="text-body1">列设置</q-tooltip>
                    </q-th>
                </q-tr>
            </template>
            <template v-slot:body="props">
                <q-tr>
                    <q-td key="timeCreateString" :props="props" style="text-align: left" class="text-grey"> {{ props.row.timeCreateString }} </q-td>
                    <q-td key="layout" :props="props">
                        <q-badge color="primary" v-if="props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">原材料</q-badge>
                        <q-badge color="grey" v-else>普通</q-badge>
                    </q-td>
                    <q-td key="name" :props="props"> {{ props.row.name }} </q-td>
                    <q-td key="norm" :props="props"> {{ props.row.norm }} </q-td>
                    <q-td key="formula" :props="props">
                        <q-badge :color="SkuStore.getLabelByType(props.row.type).color">
                            {{ SkuStore.getLabelByType(props.row.type).text }}
                        </q-badge>
                    </q-td>
                    <q-td key="count" :props="props" :class="{ 'text-grey': props.row.count <= 0 }">
                        <span class="text-grey"> 1 个</span>
                    </q-td>
                    <q-td key="pounds" :props="props" class="text-grey"> {{ props.row.pounds.toFixed(3) }} 吨 </q-td>
                    <q-td key="poundsFinal" :props="props" :class="props.row.poundsFinal < 1 ? 'text-grey' : 'text-negative'">
                        <span
                            class="cursor-pointer"
                            @click="
                                async () => {
                                    skus_rela_order = await SkuStore.getSkuRelaOrder(props.row._id);
                                    SkuStore.dialogSku(skus_rela_order, { title: `${props.row.name} ${props.row.norm}`, more: true });
                                }
                            "
                        >
                            {{ props.row.poundsFinal.toFixed(3) }} 吨
                        </span>
                    </q-td>

                    <q-td key="keyOrigin" :props="props" class="text-grey"> {{ props.row.keyOrigin }} </q-td>
                    <q-td key="keyFeat" :props="props" class="text-grey"> {{ props.row.keyFeat }} </q-td>
                    <q-td key="keyCode" :props="props" class="text-grey"> {{ props.row.keyCode }} </q-td>
                    <q-td key="warehouseId" :props="props" class="text-grey">{{ props.row.joinWarehouse?.name }} </q-td>
                    <q-td key="keyHouse" :props="props" class="text-grey"> {{ props.row.keyHouse }} </q-td>
                    <q-td key="price" :props="props" class="text-grey"> {{ props.row.price.toFixed(2) }} 元</q-td>
                    <q-td key="remark" :props="props" class="text-grey ellipsis"> {{ props.row.remark }} </q-td>
                    <q-td key="orderContactId" :props="props">
                        <span v-if="props.row.joinOrderContact">{{ props.row.joinOrderContact?.name }} </span>
                        <span v-else class="text-grey">批量导入</span>
                    </q-td>
                    <q-td key="orderId" :props="props"> {{ props.row.joinOrder?.code }} </q-td>
                    <q-td key="_id" :props="props" style="padding: 0 0 0 20px">
                        <span
                            v-close-popup
                            class="text-primary cursor-pointer row items-center"
                            v-if="props.row.isConfirmed"
                            @click="$emit('pick', cloneDeep(props.row))"
                        >
                            {{ vue_props.label }}
                            <q-icon name="arrow_right"></q-icon>
                        </span>
                    </q-td>
                </q-tr>
            </template>

            <template v-slot:bottom="props">
                <q-pagination
                    size="16px"
                    color="white"
                    class="q-my-sm"
                    text-color="black"
                    active-color="primary"
                    active-text-color="white"
                    v-model="SkuStore.page.page"
                    :max-pages="10"
                    :max="Math.ceil(SkuStore.total / SkuStore.page.pageSize)"
                    @update:model-value="(value) => SkuStore.get(value)"
                />
                <q-space></q-space>
                <div class="q-pt-sm q-pb-xs">
                    <span>已加载 {{ SkuStore.list.length }} / {{ SkuStore.total }}</span>
                </div>
            </template>
        </q-table>

        <q-inner-loading :showing="SkuStore.loadding">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </q-card>

    <q-dialog v-model="contactDialog" position="bottom">
        <q-card class="w-1000">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title class="text-weight-bold">通讯录</q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>
            <q-separator class="q-mb-md" />

            <list-contact
                @pick="
                    (value) => {
                        contactPicked = value;
                        SkuStore.search.orderContactId = value._id;
                        SkuStore.get(1);
                    }
                "
            ></list-contact>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { cloneDeep, debounce } from "lodash";
import { useRouter, useRoute } from "vue-router";

import { MongodbSort, getPage } from "qqlx-cdk";
import { ENUM_LAYOUT_CABINET, ENUM_ORDER, SkuJoined } from "qqlx-core";

import plateSkuList from "./plate-sku-list.vue";
import plateSku from "@/components/plate-sku.vue";
import dialogIntro from "@/components/dialog-intro.vue";
import listContact from "@/components/list-contact.vue";
import { useContactStore } from "@/stores/brand/contact";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useSkuStore } from "@/stores/wmss/sku";
import { useOrderStore } from "@/stores/wmss/order";
import { useAreaStore } from "@/stores/brand/area";
import { useWarehouseStore } from "@/stores/brand/warehouse";

const NotifyStore = useNotifyStore();

const skus_rela_order = ref([] as SkuJoined[]);
const SkuStore = useSkuStore();
const AreaStore = useAreaStore();
const WarehouseStore = useWarehouseStore();

const ContactStore = useContactStore();
const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());

const route = useRoute();
const init = () => {
    SkuStore.page = getPage(10);
    SkuStore.sortKey = "poundsFinal";
    SkuStore.setEditor(ENUM_ORDER.NONE);
    SkuStore.search.isConfirmed = true;
    SkuStore.search.layout = ENUM_LAYOUT_CABINET.INDIVIDUAL;
    SkuStore.types = [ENUM_ORDER.GETIN, ENUM_ORDER.PROCESS];
};
const vue_props = defineProps({
    label: {
        type: String,
        default: "选择",
    },
    name: {
        type: String,
        default: "",
    },
    norm: {
        type: String,
        default: "",
    },
});
onMounted(() => {
    init();

    const { name, norm } = route.query;
    SkuStore.search.name = (name || vue_props.name || "").toString();
    SkuStore.search.norm = (norm || vue_props.norm || "").toString();

    SkuStore.get(1);
});
</script>

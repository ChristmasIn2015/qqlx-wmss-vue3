<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <q-btn icon="arrow_back" fab flat style="margin-left: -12px" @click="$router.back()"></q-btn>
            <span>采购明细</span>
        </div>
        <div class="text-option text-primary row items-center">
            <div>
                <span>采购明细包含采购清单中的商品明细，</span>
                <span>
                    您可以前往
                    <span class="text-negative cursor-pointer" @click="$router.push('/wmss/warehouse/sku-list')">库存明细</span>
                    查看实际入库内容。
                </span>
            </div>

            <q-space></q-space>
            <div style="float: right">
                <picker-range
                    :start-time="SkuStore.page.startTime"
                    :end-time="SkuStore.page.endTime"
                    @change="
                        ($event) => {
                            SkuStore.page.startTime = $event.startTime;
                            SkuStore.page.endTime = $event.endTime;
                            SkuStore.get(1);
                        }
                    "
                />
            </div>
        </div>
    </div>

    <q-card square>
        <q-splitter v-model="splitIndex">
            <template v-slot:before> </template>

            <template v-slot:after>
                <q-table
                    style="min-height: 700px"
                    separator="cell"
                    row-key="_id"
                    dense
                    :rows="SkuStore.list"
                    :rows-per-page-options="[0]"
                    :columns="(columns as any)"
                    :visible-columns="visibleColumns"
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
                                <q-input
                                    square
                                    filled
                                    dense
                                    clearable
                                    color="primary"
                                    placeholder="搜索品名"
                                    v-model="SkuStore.search.name"
                                    @blur="SkuStore.get(1)"
                                />
                            </q-th>
                            <q-th key="norm" :props="props">
                                <q-input
                                    square
                                    filled
                                    dense
                                    clearable
                                    color="primary"
                                    placeholder="搜索规格"
                                    v-model="SkuStore.search.norm"
                                    @blur="SkuStore.get(1)"
                                />
                            </q-th>
                            <q-th key="formula" :props="props">来源</q-th>
                            <q-th
                                key="count"
                                :props="props"
                                class="cursor-pointer"
                                :class="{
                                    'text-negative': SkuStore.sortKey === 'count',
                                }"
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
                                <span>重量</span>
                                <q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                            </q-th>
                            <q-th key="keyFeat" :props="props">
                                <q-input
                                    square
                                    filled
                                    dense
                                    clearable
                                    color="primary"
                                    placeholder="材质"
                                    v-model="SkuStore.search.keyFeat"
                                    @blur="SkuStore.get(1)"
                                />
                            </q-th>
                            <q-th key="keyOrigin" :props="props">
                                <q-input
                                    square
                                    filled
                                    dense
                                    clearable
                                    color="primary"
                                    placeholder="钢厂"
                                    v-model="SkuStore.search.keyOrigin"
                                    @blur="SkuStore.get(1)"
                                />
                            </q-th>
                            <q-th key="areaId" :props="props">
                                <q-select
                                    dense
                                    square
                                    filled
                                    clearable
                                    emit-value
                                    map-options
                                    label="货位"
                                    option-value="_id"
                                    option-label="name"
                                    placeholder="请选择货位"
                                    :options="AreaStore.list.filter((e) => e.isDisabled === false)"
                                    v-model="SkuStore.search.areaId"
                                    @update:model-value="SkuStore.get(1)"
                                >
                                </q-select>
                            </q-th>
                            <q-th key="keyCode" :props="props">
                                <q-input
                                    square
                                    filled
                                    dense
                                    clearable
                                    color="primary"
                                    placeholder="捆包号"
                                    v-model="SkuStore.search.keyCode"
                                    @blur="SkuStore.get(1)"
                                />
                            </q-th>

                            <q-th
                                key="price"
                                :props="props"
                                class="cursor-pointer"
                                :class="{ 'text-negative': SkuStore.sortKey === 'price' }"
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
                                    flat
                                    square
                                    padding="xs"
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
                                <q-select
                                    dense
                                    filled
                                    multiple
                                    emit-value
                                    map-options
                                    option-value="name"
                                    display-value="列设置"
                                    options-selected-class="bg-primary text-body1 text-white"
                                    v-model="visibleColumns"
                                    :options="columns"
                                />
                            </q-th>
                        </q-tr>
                    </template>

                    <template v-slot:body="props">
                        <q-tr>
                            <q-td key="timeCreateString" :props="props" class="text-grey"> {{ props.row.timeCreateString }} </q-td>
                            <q-td key="layout" :props="props">
                                <q-badge color="primary" v-if="props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
                                    原材料
                                    <q-tooltip class="text-body1"> 您可以在“原材料”菜单中，看见每一项入库原材料剩下多少库存</q-tooltip>
                                </q-badge>
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
                                <span :class="{ 'text-grey': props.row.isPriceInPounds }"> {{ props.row.count }} {{ props.row.unit }}</span>
                            </q-td>
                            <q-td key="pounds" :props="props" :class="{ 'text-grey': props.row.pounds <= 0 }">
                                <span v-if="props.row.isPriceInPounds">{{ props.row.pounds.toFixed(3) }} 吨</span>
                                <span v-else>-</span>
                            </q-td>
                            <q-td key="keyFeat" :props="props" class="text-grey"> {{ props.row.keyFeat }} </q-td>
                            <q-td key="keyOrigin" :props="props" class="text-grey"> {{ props.row.keyOrigin }} </q-td>
                            <q-td key="areaId" :props="props" class="text-grey">
                                {{ props.row.joinArea?.name }}-{{ props.row.joinArea?.joinWarehouse?.name }}
                            </q-td>
                            <q-td key="keyCode" :props="props" class="text-grey"> {{ props.row.keyCode }} </q-td>
                            <q-td key="price" :props="props" class="text-grey"> {{ props.row.price.toFixed(2) }} 元</q-td>
                            <q-td key="remark" :props="props" class="text-grey ellipsis">{{ props.row.remark }} </q-td>
                            <q-td key="orderContactId" :props="props">
                                <span v-if="props.row.joinOrderContact">{{ props.row.joinOrderContact?.name }} </span>
                                <span v-else class="text-grey">批量导入</span>
                            </q-td>
                            <q-td key="orderId" :props="props"> {{ props.row.joinOrder?.code }} </q-td>
                            <q-td key="_id" :props="props">
                                <span v-if="props.row.joinOrder?.managerId" class="text-grey"> 已入库 </span>
                                <span v-else class="text-negative text-bold">
                                    未入库
                                    <q-tooltip class="text-body1">
                                        <div>* 采购清单入库后，将会生成入库单，此商品将会变更为 “已入库”</div>
                                        <div>* 入库商品可以和采购商品不一致，请注意检查</div>
                                    </q-tooltip>
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
                            <span>共 {{ SkuStore.total }} 项</span>
                        </div>
                    </template>
                </q-table>
            </template>
        </q-splitter>

        <q-inner-loading :showing="SkuStore.loadding">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </q-card>

    <q-dialog v-model="contactDialog" position="bottom">
        <q-card class="w-1000">
            <q-toolbar class="bg-green-6 text-white">
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
import { onMounted, ref, computed, watch } from "vue";
import { cloneDeep, debounce } from "lodash";
import { useRouter, useRoute } from "vue-router";
import { MongodbSort, getPage } from "qqlx-cdk";
import { ENUM_LAYOUT_CABINET, ENUM_ORDER, SkuJoined, Cabinet, CabinetUnit } from "qqlx-core";

import pickerRange from "@/components/picker-range.vue";
import listContact from "@/components/list-contact.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useContactStore } from "@/stores/brand/contact";
import { useSkuStore } from "@/stores/wmss/sku";
import { useAreaStore } from "@/stores/brand/area";
import { getPage2 } from "@/lib/time";

const NotifyStore = useNotifyStore();
const columns = ref([
    { name: "timeCreateString", field: "timeCreateString", label: "时间", align: "left", style: NotifyStore.fontStyle },
    { name: "layout", field: "layout", label: "库存类型", align: "left" },
    { name: "name", field: "name", label: "品名", align: "left", style: NotifyStore.fontStyle },
    { name: "norm", field: "norm", label: "规格", align: "left", style: NotifyStore.fontStyle },
    { name: "formula", field: "formula", label: "用途", align: "center" },
    { name: "count", field: "count", label: "数量", style: NotifyStore.fontStyle },
    { name: "pounds", field: "pounds", label: "重量", style: NotifyStore.fontStyle },
    { name: "keyFeat", field: "keyFeat", label: "材质", align: "left", style: NotifyStore.fontStyle },
    { name: "keyOrigin", field: "keyOrigin", label: "产地", align: "left", style: NotifyStore.fontStyle },
    { name: "areaId", field: "areaId", label: "货位", align: "left", style: NotifyStore.cellStyle },
    { name: "keyCode", field: "keyCode", label: "捆包号", align: "left", style: NotifyStore.fontStyle },
    { name: "price", field: "price", label: "单价", style: NotifyStore.fontStyle },
    { name: "remark", field: "remark", label: "备注", style: NotifyStore.fontStyle },
    { name: "orderContactId", field: "orderContactId", label: "客户", align: "left", style: NotifyStore.fontStyle },
    { name: "orderId", field: "orderId", label: "订单编号", align: "left", style: NotifyStore.fontStyle },
    { name: "_id", field: "_id", label: "操作", align: "left", style: NotifyStore.fontStyle },
]);
const visibleColumns = ref(columns.value.filter((e, i) => i < 10 || i >= columns.value.length - 1).map((e) => e.name));

const tabIndex = ref(0);
const splitIndex = ref(0);
const AreaStore = useAreaStore();
const SkuStore = useSkuStore();
watch(
    () => tabIndex.value,
    (index) => {
        if (index === 0) SkuStore.search.isConfirmed = true;
        else if (index === 1) SkuStore.search.isConfirmed = false;
        SkuStore.get(1);
    }
);

const ContactStore = useContactStore();
const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());

const route = useRoute();
onMounted(() => {
    SkuStore.page = getPage2(20);
    SkuStore.sortKey = "timeCreate";
    SkuStore.listPicked = [];
    SkuStore.setEditor(ENUM_ORDER.NONE);
    SkuStore.search.layout = ENUM_LAYOUT_CABINET.SUMMARY;
    SkuStore.search.isConfirmed = false;
    SkuStore.types = [ENUM_ORDER.PURCHASE];

    const { name, norm } = route.query;
    SkuStore.search.name = (name || "").toString();
    SkuStore.search.norm = (norm || "").toString();

    SkuStore.get(1);
});
</script>

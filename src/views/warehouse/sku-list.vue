<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <span>库存日志</span>
            <dialog-intro></dialog-intro>
            <q-space></q-space>
            <picker-range :start-time="SkuStore.page.startTime" :end-time="SkuStore.page.endTime" @change="($event) => {
                    SkuStore.page.startTime = $event.startTime;
                    SkuStore.page.endTime = $event.endTime;
                    SkuStore.get(1);
                }
                " />
        </div>
    </div>

    <q-card square>
        <q-table style="min-height: 700px" separator="cell" row-key="_id" dense :rows="SkuStore.list"
            :rows-per-page-options="[0]" :columns="(SkuStore.columns.filter(e => e.label !== 'poundsFinal') as any)"
            :visible-columns="SkuStore.columnsVisiable">
            <template v-slot:header="props">
                <q-tr>
                    <q-th key="timeCreateString" class="cursor-pointer" style="text-align: left" :props="props"
                        :class="{ 'text-negative': SkuStore.sortKey === 'timeCreate' }"
                        @click="SkuStore.sort('timeCreate')">
                        <span>时间 </span>
                        <q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th key="layout" :props="props">库存类型</q-th>
                    <q-th key="name" :props="props">
                        <q-input square filled dense clearable color="primary" placeholder="搜索品名"
                            v-model="SkuStore.search.name" @blur="SkuStore.get(1)" />
                    </q-th>
                    <q-th key="norm" :props="props">
                        <q-input square filled dense clearable color="primary" placeholder="搜索规格"
                            v-model="SkuStore.search.norm" @blur="SkuStore.get(1)" />
                    </q-th>
                    <q-th key="formula" :props="props">来源</q-th>
                    <q-th key="count" :props="props" class="cursor-pointer" :class="{
                        'text-negative': SkuStore.sortKey === 'count',
                    }" @click="SkuStore.sort('count')">
                        <span>数量</span>
                        <q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th key="pounds" :props="props" class="cursor-pointer"
                        :class="{ 'text-negative': SkuStore.sortKey === 'pounds' }" @click="SkuStore.sort('pounds')">
                        <span>重量</span>
                        <q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th key="keyOrigin" :props="props">
                        <q-input square filled dense clearable color="primary" placeholder="产地"
                            v-model="SkuStore.search.keyOrigin" @blur="SkuStore.get(1)" />
                    </q-th>
                    <q-th key="keyFeat" :props="props">
                        <q-input square filled dense clearable color="primary" placeholder="材质"
                            v-model="SkuStore.search.keyFeat" @blur="SkuStore.get(1)" />
                    </q-th>
                    <q-th key="keyCode" :props="props">
                        <q-input square filled dense clearable color="primary" placeholder="捆包号"
                            v-model="SkuStore.search.keyCode" @blur="SkuStore.get(1)" />
                    </q-th>
                    <q-th key="warehouseId" :props="props" style="min-width: 155px">
                        <q-select dense square filled clearable emit-value map-options label="仓库" option-value="_id"
                            option-label="name" placeholder="请选择仓库"
                            :options="WarehouseStore.list.filter((e) => e.isDisabled === false)"
                            v-model="SkuStore.search.warehouseId" @update:model-value="SkuStore.get(1)">
                        </q-select>
                    </q-th>
                    <q-th key="keyHouse" :props="props">
                        <q-input square filled dense clearable color="primary" placeholder="货位号"
                            v-model="SkuStore.search.keyHouse" @blur="SkuStore.get(1)" />
                    </q-th>
                    <q-th key="price" :props="props" class="cursor-pointer"
                        :class="{ 'text-negative': SkuStore.sortKey === 'price' }" @click="SkuStore.sort('price')">
                        <span>单价 </span>
                        <q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th key="remark" :props="props">
                        <q-input square filled dense clearable color="primary" placeholder="搜索备注"
                            v-model="SkuStore.search.remark" @blur="SkuStore.get(1)" />
                    </q-th>
                    <q-th key="orderContactId" :props="props">
                        <q-btn padding="xs" flat square color="primary" @click="contactDialog = true">
                            {{ contactPicked._id ? contactPicked.name : "点击筛选客户" }}
                        </q-btn>
                        <q-btn v-show="contactPicked._id" flat square padding="xs" color="primary" @click="() => {
                                contactPicked = ContactStore.getSchema();
                                SkuStore.search.orderContactId = '';
                                SkuStore.get(1);
                            }
                            ">
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
                    <q-td key="timeCreateString" :props="props" class="text-grey"> {{ props.row.timeCreateString }}
                    </q-td>
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
                        <span v-if="[ENUM_ORDER.GETOUT, ENUM_ORDER.MATERIAL].includes(props.row.type)">-</span>
                        <span> {{ props.row.count }} {{ props.row.unit }}</span>
                    </q-td>
                    <q-td key="pounds" :props="props" class="text-grey">
                        <span :class="{ 'text-black': props.row.isPriceInPounds }">
                            <span v-if="[ENUM_ORDER.GETOUT, ENUM_ORDER.MATERIAL].includes(props.row.type)">-</span>
                            {{ props.row.pounds.toFixed(3) }} 吨
                        </span>
                    </q-td>
                    <q-td key="keyOrigin" :props="props" class="text-grey"> {{ props.row.keyOrigin }} </q-td>
                    <q-td key="keyFeat" :props="props" class="text-grey"> {{ props.row.keyFeat }} </q-td>
                    <q-td key="keyCode" :props="props" class="text-grey"> {{ props.row.keyCode }} </q-td>
                    <q-td key="warehouseId" :props="props" class="text-grey">{{ props.row.joinWarehouse?.name }} </q-td>
                    <q-td key="keyHouse" :props="props" class="text-grey"> {{ props.row.keyHouse }} </q-td>
                    <q-td key="price" :props="props" class="text-grey"> {{ props.row.price.toFixed(2) }} 元</q-td>
                    <q-td key="remark" :props="props" class="text-grey ellipsis">{{ props.row.remark }} </q-td>
                    <q-td key="orderContactId" :props="props">
                        <span v-if="props.row.joinOrderContact">{{ props.row.joinOrderContact?.name }} </span>
                        <span v-else class="text-grey">批量导入</span>
                    </q-td>
                    <q-td key="orderId" :props="props"> {{ props.row.joinOrder?.code }} </q-td>
                    <q-td key="_id" :props="props">
                        <span v-if="props.row.isConfirmed" class="text-grey">
                            <span v-if="props.row.type === ENUM_ORDER.PROCESS && !props.row.deductionSkuId">
                                <q-btn padding="none" flat square color="negative" @click="async () => {
                                        SkuStore.loadding = true;
                                        await OrderStore.delete(props.row.joinOrder?._id);
                                        SkuStore.get();
                                    }
                                    ">
                                    取消
                                </q-btn>
                            </span>
                            <span v-else>已{{ SkuStore.getLabelByType(props.row.type)?.text }}</span>
                        </span>
                    </q-td>
                </q-tr>
            </template>

            <template v-slot:bottom="props">
                <q-pagination size="16px" color="white" class="q-my-sm" text-color="black" active-color="primary"
                    active-text-color="white" v-model="SkuStore.page.page" :max-pages="10"
                    :max="Math.ceil(SkuStore.total / SkuStore.page.pageSize)"
                    @update:model-value="(value) => SkuStore.get(value)" />

                <q-space></q-space>
                <div class="q-pt-sm q-pb-xs">
                    <span>共 {{ SkuStore.total }} 项</span>
                </div>
            </template>
        </q-table>

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

            <list-contact @pick="(value) => {
                    contactPicked = value;
                    SkuStore.search.orderContactId = value._id;
                    SkuStore.get(1);
                }
                "></list-contact>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed, watch } from "vue";
import { cloneDeep, debounce } from "lodash";
import { useRouter, useRoute } from "vue-router";
import { MongodbSort, getPage } from "qqlx-cdk";
import { ENUM_LAYOUT_CABINET, ENUM_ORDER, SkuJoined, Cabinet, CabinetUnit } from "qqlx-core";

import plateSku from "@/components/plate-sku.vue";
import dialogIntro from "@/components/dialog-intro.vue";
import pickerRange from "@/components/picker-range.vue";
import listContact from "@/components/list-contact.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useContactStore } from "@/stores/brand/contact";
import { useSkuStore } from "@/stores/wmss/sku";
import { useAreaStore } from "@/stores/brand/area";
import { useWarehouseStore } from "@/stores/brand/warehouse";
import { useOrderStore } from "@/stores/wmss/order";
import { getPage2 } from "@/lib/time";

const NotifyStore = useNotifyStore();

const tabIndex = ref(0);
const splitIndex = ref(0);
const SkuStore = useSkuStore();
const AreaStore = useAreaStore();
const WarehouseStore = useWarehouseStore();
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

const OrderStore = useOrderStore();
const route = useRoute();
onMounted(() => {
    SkuStore.page = getPage2(20);
    SkuStore.sortKey = "timeCreate";
    SkuStore.listPicked = [];
    SkuStore.setEditor(ENUM_ORDER.NONE);
    SkuStore.search.layout = ENUM_LAYOUT_CABINET.SUMMARY;
    SkuStore.search.isConfirmed = false;
    SkuStore.types = [ENUM_ORDER.GETIN, ENUM_ORDER.GETOUT, ENUM_ORDER.MATERIAL, ENUM_ORDER.PROCESS];

    const { name, norm } = route.query;
    SkuStore.search.name = (name || "").toString();
    SkuStore.search.norm = (norm || "").toString();

    SkuStore.get(1);
});
</script>

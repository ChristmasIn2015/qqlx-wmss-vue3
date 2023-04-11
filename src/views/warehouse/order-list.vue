<template>
    <div class="q-pl-xs q-mb-md">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <span>仓库订单</span>
            <q-space></q-space>

            <picker-range
                @change="
                    ($event) => {
                        OrderStore.page.startTime = $event.startTime;
                        OrderStore.page.endTime = $event.endTime;
                        OrderStore.get(1, true);
                    }
                "
            />
            <!-- <q-btn
                square
                class="q-ml-sm"
                label="最近删除"
                :color="OrderStore.search.isDisabled ? 'primary' : 'white'"
                :text-color="OrderStore.search.isDisabled ? '' : 'primary'"
                @click="
                    () => {
                        OrderStore.search.isDisabled = !OrderStore.search.isDisabled;
                        OrderStore.get(1, true);
                    }
                "
            /> -->
            <q-btn
                square
                color="negative"
                class="q-ml-sm"
                :loading="OrderStore.loadding"
                @click="
                    () => {
                        if (tab.value === ENUM_ORDER.MATERIAL) {
                            $router.push('/wmss/warehouse/sku-individual');
                        } else {
                            OrderStore.setEditor(OrderStore.getSchema(tab.value));
                            $router.push('/wmss/warehouse/order-create');
                        }
                    }
                "
            >
                添加 @{{ tab?.label }}
            </q-btn>
        </div>
        <div class="text-option text-primary"></div>
    </div>

    <q-card square>
        <q-splitter v-model="splitIndex">
            <template v-slot:before>
                <q-tabs v-model="tabIndex" dense vertical class="text-primary">
                    <q-tab v-for="(option, index) in tabs" :name="index" :label="option.label" :icon="option.icon" class="q-my-md"> </q-tab>
                </q-tabs>
            </template>

            <template v-slot:after>
                <q-table
                    dense
                    row-key="_id"
                    style="min-height: 630px"
                    :rows="OrderStore.list"
                    :rows-per-page-options="[OrderStore.page.pageSize]"
                    :columns="[
                        { name: 'code', field: 'code', label: '批次', align: 'left', style: NotifyStore.cellStyle },
                        { name: 'contactId', field: 'contactId', label: '客户名称', align: 'left', style: NotifyStore.cellStyle },
                        { name: 'amount', field: 'amount', label: '金额', style: NotifyStore.cellStyle },
                        { name: 'pounds', field: 'pounds', label: '来源', align: 'left', style: NotifyStore.cellStyle },
                        { name: 'timeCreateString', field: 'timeCreateString', label: '时间', align: 'left', style: NotifyStore.cellStyle },
                        { name: 'remark', field: 'remark', label: '备注', align: 'left', style: NotifyStore.fontStyle },
                    ]"
                >
                    <template v-slot:header="props">
                        <q-tr>
                            <q-th key="code" :props="props" :style="NotifyStore.cellStyle">
                                <q-input
                                    square
                                    filled
                                    dense
                                    clearable
                                    color="primary"
                                    placeholder="搜索批次"
                                    v-model="OrderStore.search.code"
                                    @blur="OrderStore.get(1, true)"
                                />
                            </q-th>
                            <q-th key="contactId" :props="props" :style="NotifyStore.cellStyle">
                                <q-btn class="q-px-sm" flat square color="primary" style="margin-left: -8px" @click="contactDialog = true">
                                    {{ contactPicked._id ? contactPicked.name : "点击筛选客户" }}
                                </q-btn>
                                <q-btn
                                    v-if="contactPicked._id"
                                    flat
                                    dense
                                    square
                                    color="primary"
                                    class="q-px-sm"
                                    @click="
                                        () => {
                                            contactPicked = ContactStore.getSchema();
                                            OrderStore.search.contactId = '';
                                            OrderStore.get(1, true);
                                        }
                                    "
                                >
                                    <q-icon name="close"></q-icon>
                                </q-btn>
                            </q-th>
                            <q-th class="text-right" key="amount">金额</q-th>
                            <q-th class="text-left">来源</q-th>
                            <q-th class="text-left">备注</q-th>
                            <q-th
                                class="text-left cursor-pointer"
                                :class="{ 'text-negative': OrderStore.sortKey === 'timeCreate' }"
                                @click="OrderStore.sort('timeCreate')"
                            >
                                <span>时间 </span>
                                <q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                            </q-th>
                        </q-tr>
                    </template>

                    <template v-slot:body="props">
                        <q-tr
                            class="cursor-pointer"
                            :props="props"
                            :class="{ 'bg-grey-4': props.expand }"
                            @click.stop="
                                () => {
                                    props.expand = !props.expand;
                                }
                            "
                        >
                            <q-td key="code" :props="props">
                                <q-badge rounded class="q-mr-sm shadow-5" :color="!props.row.isDisabled ? tab.color : 'grey'"></q-badge>
                                {{ props.row.code }}
                            </q-td>
                            <q-td key="contactId" :props="props">
                                <span v-if="props.row.joinContact?.name" class="ellipsis">{{ props.row.joinContact.name }}</span>
                                <span v-else class="text-grey">批量导入</span>
                            </q-td>
                            <q-td key="amount" :props="props">
                                <span v-if="props.row.joinSku?.length > 0" class="text-primary text-weight-bold" :class="`text-${tab?.color}`">{{
                                    props.row.joinSku?.length
                                }}</span>
                                <span v-else class="text-grey"> 0</span>
                                项
                            </q-td>
                            <q-td key="pounds" :props="props">
                                {{ props.row.joinParentOrder[0] ? `${props.row.joinParentOrder[0]?.code}` : "" }}
                            </q-td>
                            <q-td key="remark" :props="props">
                                <span
                                    class="cursor-pointer"
                                    :class="props.row.remark ? 'text-primary' : 'text-grey'"
                                    @click="
                                        () => {
                                            OrderStore.setEditor(props.row);
                                            orderDialog = true;
                                        }
                                    "
                                >
                                    {{ props.row.remark || "点击修改" }}
                                </span>
                            </q-td>
                            <q-td key="timeCreateString" :props="props">{{ props.row.timeCreateString }} </q-td>
                        </q-tr>

                        <q-tr v-show="props.expand">
                            <q-td colspan="100%" style="padding: 0">
                                <div class="row">
                                    <div class="col-8">
                                        <q-table
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
                                                { name: 'keyFeat', field: 'keyFeat', label: '材质', align: 'left' },
                                                { name: 'keyOrigin', field: 'keyOrigin', label: '产地', align: 'left' },
                                                { name: 'keyHouse', field: 'keyHouse', label: '仓库', align: 'left' },
                                                { name: 'price', field: 'price', label: '单价' },
                                                { name: 'remark', field: 'remark', label: '备注' },
                                                { name: '_id', field: '_id', label: '当前状态', align: 'left' },
                                            ]"
                                            :rows-per-page-options="[0]"
                                            :rows="props.row.joinSku || []"
                                        >
                                            <template v-slot:body="_props">
                                                <q-tr>
                                                    <q-td :_props="_props" :style="NotifyStore.fontStyle">
                                                        <q-badge :color="_props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL ? 'primary' : 'grey'">
                                                            {{ _props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL ? "大件商品" : "普通" }}
                                                            <q-tooltip class="text-body1">{{ MAP_ENUM_LAYOUT_CABINET.get(_props.row.layout)?.tip }}</q-tooltip>
                                                        </q-badge>
                                                    </q-td>
                                                    <q-td :_props="_props" :style="NotifyStore.fontStyle">{{ _props.row.name }} </q-td>
                                                    <q-td :_props="_props" :style="NotifyStore.fontStyle">{{ _props.row.norm }}</q-td>
                                                    <q-td :_props="_props" :style="NotifyStore.fontStyle" class="text-right"
                                                        >{{ _props.row.count }} {{ _props.row.unit }}</q-td
                                                    >
                                                    <q-td :_props="_props" :style="NotifyStore.fontStyle" class="text-right">
                                                        <span v-if="_props.row.isPriceInPounds">{{ _props.row.pounds.toFixed(3) }} 吨</span>
                                                    </q-td>
                                                    <q-td :_props="_props" :style="NotifyStore.fontStyle">{{ _props.row.keyFeat || "-" }}</q-td>
                                                    <q-td :_props="_props" :style="NotifyStore.fontStyle">{{ _props.row.keyOrigin || "-" }}</q-td>
                                                    <q-td :_props="_props" :style="NotifyStore.fontStyle">{{ _props.row.keyHouse || "-" }}</q-td>
                                                    <q-td :_props="_props" :style="NotifyStore.fontStyle" class="text-right">
                                                        {{ _props.row.price.toFixed(2) }}
                                                    </q-td>
                                                    <q-td :_props="_props" :style="NotifyStore.fontStyle">{{ _props.row.remark }}</q-td>
                                                    <q-td :_props="_props" :style="NotifyStore.fontStyle">
                                                        <span v-if="_props.row.isConfirmed" class="text-grey">
                                                            已{{ SkuStore.getLabelByType(_props.row.type)?.text }}
                                                        </span>
                                                    </q-td>
                                                </q-tr>
                                            </template>
                                        </q-table>
                                    </div>
                                    <div class="col-4">
                                        <q-card square>
                                            <q-card-section>
                                                <div class="text-h6 text-weight-bold">订单信息</div>
                                                <div class="row text-body1">
                                                    <span class="col-3 text-grey">开单人</span>
                                                    <span class="col-9 text-right text-weight-bold">{{ props.row.joinCreator?.nickname }}</span>
                                                </div>
                                                <div class="row text-body1">
                                                    <span class="col-3 text-grey">客户信息</span>
                                                    <span class="col-9 text-right text-weight-bold">{{ props.row.joinContact?.name || "批量导入" }}</span>
                                                </div>
                                            </q-card-section>
                                            <q-separator />
                                            <q-card-section>
                                                <div class="row text-body1 q-mt-xs">
                                                    <span class="col text-grey">
                                                        <q-badge
                                                            rounded
                                                            :color="props.row.joinParentOrder.length > 0 ? 'primary' : 'grey'"
                                                            class="shadow-5 q-mr-sm"
                                                        >
                                                        </q-badge>
                                                        来源单据
                                                    </span>
                                                    <span class="col text-right text-weight-bold">
                                                        <a
                                                            v-if="props.row.joinParentOrder.length > 0"
                                                            class="cursor-pointer text-negative text-underline"
                                                            @click="() => $router.push(`/wmss/trade/sale-list?code=${props.row.joinParentOrder[0].code}`)"
                                                        >
                                                            查看
                                                        </a>
                                                        <span v-else class="text-bold">无</span>
                                                    </span>
                                                </div>
                                            </q-card-section>
                                            <q-separator />
                                            <q-card-section class="text-body2 text-grey" style="white-space: break-spaces">
                                                <div>1.您可以直接删除/编辑仓库订单，请注意这样不会影响仓库订单的源头，如销售单等</div>
                                            </q-card-section>
                                            <q-card-actions>
                                                <q-space></q-space>
                                                <q-btn
                                                    class="q-ml-sm"
                                                    text-color="negative"
                                                    :disabled="!!props.row.managerId || !!props.row.accounterId"
                                                    @click="
                                                        async () => {
                                                            await OrderStore.delete(props.row._id);
                                                            OrderStore.get(1, true);
                                                        }
                                                    "
                                                >
                                                    {{ props.row.isDisabled ? "恢复" : "删除" }}
                                                </q-btn>
                                                <q-btn
                                                    v-if="!props.row.isDisabled && props.row.type !== ENUM_ORDER.MATERIAL"
                                                    :disabled="!!props.row.managerId || !!props.row.accounterId"
                                                    class="q-ml-sm"
                                                    text-color="primary"
                                                    @click="
                                                        () => {
                                                            OrderStore.setEditor(props.row);
                                                            SkuStore.listPicked = cloneDeep(props.row.joinSku);
                                                            $router.push('/wmss/warehouse/order-edit');
                                                        }
                                                    "
                                                >
                                                    编辑
                                                </q-btn>
                                                <q-tooltip v-if="!!props.row.managerId || !!props.row.accounterId" class="text-body1">
                                                    <div v-if="!!props.row.managerId">* 订单已复核，无法修改</div>
                                                    <div v-if="!!props.row.accounterId">* 财务已签字，无法修改</div>
                                                </q-tooltip>
                                            </q-card-actions>
                                        </q-card>
                                    </div>
                                </div>
                            </q-td>
                        </q-tr>
                    </template>
                    <template v-slot:bottom="props">
                        <q-pagination
                            size="17px"
                            class="q-my-sm"
                            color="white"
                            text-color="black"
                            active-color="primary"
                            active-text-color="white"
                            v-model="OrderStore.page.page"
                            :max-pages="10"
                            :max="Math.ceil(OrderStore.total / OrderStore.page.pageSize)"
                            @update:model-value="(value) => OrderStore.get(value, true)"
                        />
                        <q-space></q-space>
                        <span>共 {{ OrderStore.total }} 项</span>
                    </template>
                </q-table>
            </template>
        </q-splitter>

        <q-inner-loading :showing="OrderStore.loadding">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </q-card>

    <tip-warehouse />

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
                        OrderStore.search.contactId = value._id;
                        OrderStore.get(1, true);
                    }
                "
            ></list-contact>
        </q-card>
    </q-dialog>

    <q-dialog v-model="orderDialog">
        <q-card class="w-400">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>
                    <q-badge rounded color="pink-6" class="shadow-5 q-mr-sm"> </q-badge>
                    修改
                </q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>

            <q-card-section>
                <q-input filled disable label="订单编号" v-model="OrderStore.editor.code" color="primary" class="q-mb-md" />
                <q-input filled label="请输入备注" v-model="OrderStore.editor.remark" color="primary" />
            </q-card-section>

            <q-card-actions>
                <q-space></q-space>
                <q-btn
                    color="primary"
                    v-close-popup
                    @click="
                        async () => {
                            await OrderStore.put();
                            await OrderStore.get(1, true);
                        }
                    "
                >
                    保存
                </q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from "vue-router";
import { onMounted, ref, computed, watch } from "vue";
import { cloneDeep, debounce } from "lodash";
import * as XLSX from "xlsx";

import { MongodbSort } from "qqlx-cdk";
import { ENUM_LAYOUT_CABINET, ENUM_ORDER, MAP_ENUM_LAYOUT_CABINET, OrderJoined } from "qqlx-core";

import pickerRange from "@/components/picker-range.vue";
import listContact from "@/components/list-contact.vue";
import tipWarehouse from "@/components/tip-warehouse.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useContactStore } from "@/stores/brand/contact";
import { useSkuStore } from "@/stores/wmss/sku";
import { useOrderStore } from "@/stores/wmss/order";

const route = useRoute();
const tabs = ref([
    { label: "入库单", value: ENUM_ORDER.GETIN, icon: "playlist_add", color: "positive", comfirmed: "已入库" },
    { label: "加工单", value: ENUM_ORDER.PROCESS, icon: "low_priority", color: "cyan", comfirmed: "已入库" },
    { label: "领料单", value: ENUM_ORDER.MATERIAL, icon: "content_cut", color: "orange", comfirmed: "已扣减" },
    { label: "发货单", value: ENUM_ORDER.GETOUT, icon: "local_shipping", color: "pink-6", comfirmed: "已出库" },
]);
const tabIndex = ref(0);
const tab = computed(() => tabs.value[tabIndex.value]);
const splitIndex = ref(10);
watch(
    () => tabIndex.value,
    () => {
        if (tab) {
            OrderStore.search.type = tab.value.value;
            OrderStore.get(1, true);
        }
    }
);

const NotifyStore = useNotifyStore();
const ContactStore = useContactStore();
const SkuStore = useSkuStore();

const OrderStore = useOrderStore();
const orderDialog = ref(false);

const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());

// action
onMounted(async () => {
    if (tab.value) {
        OrderStore.setEditor();
        OrderStore.search.type = tab.value.value;

        // 根据条件设置搜索
        const { code } = route.query;
        if (code) {
            code.includes("RK") && (tabIndex.value = 0);
            code.includes("JG") && (tabIndex.value = 1);
            code.includes("LL") && (tabIndex.value = 2);
            code.includes("FH") && (tabIndex.value = 3);
            OrderStore.search.code = code as string;
        }
        OrderStore.get(1, true);
    }
});
</script>

<style lang="scss" scoped></style>

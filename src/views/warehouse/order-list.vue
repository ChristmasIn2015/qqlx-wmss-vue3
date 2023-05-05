<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <q-btn icon="arrow_back" fab flat style="margin-left: -12px" @click="$router.back()"></q-btn>
            <span>仓库订单</span>
            <dialog-intro></dialog-intro>
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
                添加{{ tab?.label }}
            </q-btn>
        </div>
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
                    style="min-height: 630px"
                    row-key="_id"
                    dense
                    :rows="OrderStore.list"
                    :rows-per-page-options="[0]"
                    :columns="[
                        { name: 'code', field: 'code', label: '批次', align: 'left', style: NotifyStore.cellStyle },
                        { name: 'contactId', field: 'contactId', label: '客户名称', align: 'left', style: NotifyStore.cellStyle },
                        { name: 'amount', field: 'amount', label: '商品数量', style: NotifyStore.cellStyle },
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
                            <q-th class="text-right" key="amount">商品数量</q-th>
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
                                async () => {
                                    if (props.expand === false) await setOrderInfo(props.row);
                                    props.expand = !props.expand;
                                }
                            "
                        >
                            <q-td key="code" :props="props">
                                <q-badge rounded class="q-mr-sm shadow-2" :color="!props.row.isDisabled ? tab.color : 'grey'"></q-badge>
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
                                        <plate-sku-list :skus="props.row.joinSku || []"></plate-sku-list>
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
                                                            :color="props.row.joinParentOrder?.length > 0 ? 'primary' : 'grey'"
                                                            class="shadow-2 q-mr-sm"
                                                        >
                                                        </q-badge>
                                                        来源单据
                                                    </span>
                                                    <span class="col text-right text-weight-bold">
                                                        <a
                                                            v-if="props.row.joinParentOrder?.length > 0"
                                                            class="cursor-pointer text-negative text-underline"
                                                            @click="
                                                                () => {
                                                                    if (props.row.joinParentOrder[0]?.type === ENUM_ORDER.MATERIAL) {
                                                                        OrderStore.search.code = props.row.joinParentOrder[0]?.code;
                                                                        tabIndex = 2;
                                                                    } else {
                                                                        $router.push(`/wmss/purchase/list?code=${props.row.joinParentOrder[0]?.code}`);
                                                                    }
                                                                }
                                                            "
                                                        >
                                                            查看
                                                        </a>
                                                        <span v-else class="text-bold">无</span>
                                                    </span>
                                                </div>
                                                <div class="row text-body1 q-mt-xs" v-if="props.row.type === ENUM_ORDER.MATERIAL">
                                                    <span class="col text-grey">
                                                        <q-badge
                                                            rounded
                                                            :color="props.row.joinChildOrder?.length > 0 ? 'primary' : 'grey'"
                                                            class="shadow-2 q-mr-sm"
                                                        >
                                                        </q-badge>
                                                        加工单
                                                    </span>
                                                    <span class="col text-right text-weight-bold">
                                                        <a
                                                            v-if="props.row.joinChildOrder?.length > 0"
                                                            class="cursor-pointer text-negative text-underline"
                                                            @click="
                                                                () => {
                                                                    OrderStore.search.code = props.row.joinChildOrder[0]?.code || '';
                                                                    tabIndex = 1;
                                                                }
                                                            "
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
                                                    v-if="!props.row.isDisabled && [ENUM_ORDER.GETIN, ENUM_ORDER.GETOUT].includes(props.row.type)"
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
                <q-toolbar-title> 修改 </q-toolbar-title>
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

import { MongodbSort, getPage } from "qqlx-cdk";
import { ENUM_LAYOUT_CABINET, ENUM_ORDER, MAP_ENUM_LAYOUT_CABINET, OrderJoined } from "qqlx-core";

import plateSkuList from "@/components/plate-sku-list.vue";
import dialogIntro from "@/components/dialog-intro.vue";
import pickerRange from "@/components/picker-range.vue";
import listContact from "@/components/list-contact.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useContactStore } from "@/stores/brand/contact";
import { useSkuStore } from "@/stores/wmss/sku";
import { useOrderStore } from "@/stores/wmss/order";

const route = useRoute();
const tabs = ref([
    { label: "入库单", value: ENUM_ORDER.GETIN, icon: "playlist_add", color: "positive", comfirmed: "已入库" },
    { label: "加工单", value: ENUM_ORDER.PROCESS, icon: "low_priority", color: "positive", comfirmed: "已入库" },
    { label: "领料单", value: ENUM_ORDER.MATERIAL, icon: "content_cut", color: "orange", comfirmed: "已扣减" },
    { label: "发货单", value: ENUM_ORDER.GETOUT, icon: "local_shipping", color: "orange", comfirmed: "已出库" },
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
const setOrderInfo = async (order: OrderJoined) => {
    try {
        OrderStore.loadding = true;
        const info = await OrderStore.getSku(order);
        order.joinSku = info.skuList;
        order.joinBookOfOrder = info.bookOfOrderList;
        order.joinAccounter = info.joinAccounter;
        order.joinCreator = info.joinCreator;
        order.joinManager = info.joinManager;
        order.joinChildOrder = info.joinChildOrder;
        order.joinParentOrder = info.joinParentOrder;
    } catch (error) {
        NotifyStore.fail(`网络异常, 请重新试试`);
    } finally {
        OrderStore.loadding = false;
    }
};

const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());

// action
onMounted(async () => {
    if (tab.value) {
        OrderStore.setEditor();
        OrderStore.search.type = tab.value.value;
        OrderStore.search.contactId = "";
        OrderStore.page = getPage(20);

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

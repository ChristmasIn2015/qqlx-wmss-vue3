<template>
    <div class="q-pl-xs q-py-md row">
        <div class="col">
            <div class="text-h5 text-primary text-weight-bold row items-center">
                <span>{{ MAP_ENUM_ORDER.get(vue_props.type)?.text }}</span>
            </div>
            <div class="text-option text-grey row">
                <span>仅为您展示 1.含税 2.未结清 的订单</span>
            </div>
        </div>

        <div class="col row items-end">
            <q-space></q-space>
            <picker-range
                :start-time="OrderStore.page.startTime"
                :end-time="OrderStore.page.endTime"
                @change="
                    ($event) => {
                        OrderStore.page.startTime = $event.startTime;
                        OrderStore.page.endTime = $event.endTime;
                        OrderStore.get(1, false, true);
                    }
                "
            />
        </div>
    </div>

    <q-card>
        <q-table
            dense
            row-key="_id"
            style="height: 380px"
            :rows="OrderStore.list"
            :rows-per-page-options="[OrderStore.page.pageSize]"
            :columns="[
                { name: 'timeCreateString', field: 'timeCreateString', label: '时间', align: 'left', style: NotifyStore.cellStyle },
                { name: 'code', field: 'code', label: '批次', align: 'left', style: NotifyStore.cellStyle },
                { name: 'contactId', field: 'contactId', label: '客户名称', align: 'left', style: NotifyStore.cellStyle },
                { name: 'amount', field: 'amount', label: '金额', style: NotifyStore.cellStyle },
                { name: 'amountBookOfOrder', field: 'amountBookOfOrder', label: '已收款', style: NotifyStore.cellStyle },
                { name: 'amountBookOfOrderRest', field: 'amountBookOfOrderRest', label: '剩余', align: 'left', style: NotifyStore.cellStyle },
                { name: 'event', field: 'event', label: '事件', align: 'left' },
                { name: '_id', field: '_id', label: '操作', align: 'left' },
                { name: 'remark', field: 'remark', label: '备注', align: 'left', style: NotifyStore.cellStyle },
            ]"
        >
            <template v-slot:header="props">
                <q-tr>
                    <q-th
                        class="text-left cursor-pointer"
                        :class="{ 'text-negative': OrderStore.sortKey === 'timeCreate' }"
                        @click="OrderStore.sort('timeCreate', true)"
                    >
                        <span>时间 </span>
                        <q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th key="code" :props="props" :style="NotifyStore.cellStyle">
                        <q-input
                            square
                            filled
                            dense
                            clearable
                            color="primary"
                            placeholder="搜索批次"
                            v-model="OrderStore.search.code"
                            @blur="OrderStore.get(1, false, true)"
                        />
                    </q-th>
                    <q-th key="contactId" :props="props" :style="NotifyStore.cellStyle">
                        <q-select
                            dense
                            square
                            filled
                            use-input
                            emit-value
                            option-label="name"
                            placeholder="搜索客户"
                            :options="contactSelecting"
                            :color="OrderStore.search.type === ENUM_ORDER.SALES ? 'pink-6' : 'primary'"
                            :loading="ContactStore.loadding"
                            v-model="contactPicked"
                            @filter="searchContact"
                            @update:model-value="
                                () => {
                                    OrderStore.search.contactId = contactPicked ? contactPicked._id : '';
                                    OrderStore.requireAccounterId = true;
                                    OrderStore.get(1, false, true);
                                }
                            "
                        >
                            <template v-slot:no-option>
                                <q-item>
                                    <q-item-section class="text-grey"> 暂无结果 </q-item-section>
                                </q-item>
                            </template>
                        </q-select>
                    </q-th>
                    <q-th
                        class="text-right cursor-pointer"
                        :class="{ 'text-negative': OrderStore.sortKey === 'amount' }"
                        @click="OrderStore.sort('amount', true)"
                    >
                        <span>金额 </span>
                        <q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th
                        class="text-right cursor-pointer"
                        :class="{ 'text-negative': OrderStore.sortKey === (vue_props.isInvoice ? 'amountBookOfOrderVAT' : 'amountBookOfOrder') }"
                        @click="OrderStore.sort(vue_props.isInvoice ? 'amountBookOfOrderVAT' : 'amountBookOfOrder', true)"
                    >
                        <span v-if="vue_props.type === ENUM_ORDER.SALES">{{ vue_props.isInvoice ? "已开发票" : "已收款" }}</span>
                        <span v-else-if="vue_props.type === ENUM_ORDER.PURCHASE">{{ vue_props.isInvoice ? "已收发票" : "已付款" }}</span>
                        <q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th
                        class="text-right cursor-pointer"
                        :class="{ 'text-negative': OrderStore.sortKey === (vue_props.isInvoice ? 'amountBookOfOrderVATRest' : 'amountBookOfOrderRest') }"
                        @click="OrderStore.sort(vue_props.isInvoice ? 'amountBookOfOrderVATRest' : 'amountBookOfOrderRest', true)"
                    >
                        <span>{{ vue_props.isInvoice ? "可开票" : "还应确认" }}</span>
                        <q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th class="text-left">事件</q-th>
                    <q-th class="text-left">操作</q-th>
                    <q-th class="text-left">备注</q-th>
                </q-tr>
            </template>

            <template v-slot:body="props">
                <q-tr>
                    <q-td key="timeCreateString" :props="props"> {{ props.row.timeCreateString }} </q-td>
                    <q-td key="code" :props="props">
                        <q-badge class="q-mr-xs shadow-2" :color="type === ENUM_ORDER.SALES ? 'pink-6' : 'cyan'" rounded></q-badge>
                        {{ props.row.code }}
                    </q-td>
                    <q-td key="contactId" :props="props">
                        <span v-if="props.row.joinContact?.name" class="ellipsis">{{ props.row.joinContact.name }}</span>
                        <span v-else class="text-grey">尚未选择客户</span>
                    </q-td>
                    <q-td
                        key="amount"
                        :props="props"
                        :class="{
                            'text-through': props.row.accounterId,
                            'text-grey': props.row.amount < 1 || props.row.accounterId,
                        }"
                    >
                        {{ props.row.amount.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                    </q-td>
                    <q-td key="amountBookOfOrder" :props="props" class="text-grey">
                        {{
                            (vue_props.isInvoice ? props.row.amountBookOfOrderVAT : props.row.amountBookOfOrder).toLocaleString("zh", {
                                minimumFractionDigits: 2,
                            })
                        }}
                    </q-td>
                    <q-td
                        key="amountBookOfOrderRest"
                        class="text-right"
                        :props="props"
                        :class="{
                            'text-through': props.row.accounterId,
                            'text-grey':
                                (vue_props.isInvoice ? props.row.amountBookOfOrderVATRest : props.row.amountBookOfOrderRest) < 1 || props.row.accounterId,
                            'text-weight-bold': (vue_props.isInvoice ? props.row.amountBookOfOrderVATRest : props.row.amountBookOfOrderRest) >= 1,
                        }"
                    >
                        {{
                            (vue_props.isInvoice ? props.row.amountBookOfOrderVATRest : props.row.amountBookOfOrderRest).toLocaleString("zh", {
                                minimumFractionDigits: 2,
                            })
                        }}
                    </q-td>
                    <q-td key="event" :props="props">
                        <q-badge v-if="props.row.amountBookOfOrderVAT > 0" color="purple" class="q-mr-sm">
                            {{ OrderStore.search.type === ENUM_ORDER.SALES ? "已开发票" : "已收发票" }}
                        </q-badge>
                        <q-badge v-if="props.row.isNotTax"> 不含税</q-badge>
                    </q-td>
                    <q-td key="_id" :props="props">
                        <span
                            v-if="OrderStore.listPicked.find((e) => e._id === props.row._id) ? false : true"
                            class="cursor-pointer text-body1 text-bold text-negative"
                            @click="pick(props.row)"
                        >
                            选择
                        </span>
                        <span v-else class="text-body1 text-grey"> 已选择 </span>
                    </q-td>
                    <q-td key="remark" :props="props"> {{ props.row.remark || "-" }} </q-td>
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
                    @update:model-value="(value) => OrderStore.get(value, false, true)"
                />
                <q-space></q-space>
                <span>共 {{ OrderStore.total }} 项，合计</span>
                <span class="text-body1 text-weight-bold text-negative q-mx-sm"> {{ OrderStore.amountTotal.toFixed(2) }} </span>
                <span>元</span>
            </template>
        </q-table>

        <q-inner-loading :showing="OrderStore.loadding">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </q-card>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from "vue-router";
import { onMounted, ref, computed } from "vue";
import { cloneDeep, debounce } from "lodash";

import { MongodbSort, getPage } from "qqlx-cdk";
import { ENUM_ORDER, ENUM_BOOK_TYPE, ENUM_BOOK_DIRECTION, Contact, Order, MAP_ENUM_ORDER } from "qqlx-core";

import pickerRange from "./picker-range.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useContactStore } from "@/stores/brand/contact";
import { useOrderStore } from "@/stores/wmss/order";
import { useBookStore } from "@/stores/wmss/book";

const NotifyStore = useNotifyStore();

const ContactStore = useContactStore();
const contactPicked = ref(ContactStore.getSchema());
const contactSelecting = ref([] as Contact[]);
const debounceContact = debounce(async () => {
    const page = await ContactStore.get10();
    contactSelecting.value = page.list;
}, 100);
const searchContact = (val: any, update: Function) => {
    update(async () => {
        ContactStore.search.name = val || "";
        debounceContact();
    });
};

const OrderStore = useOrderStore();
const BookStore = useBookStore();
const pick = (order: Order) => {
    // 1.保证订单没有被选择
    const match = OrderStore.listPicked.findIndex((p) => p._id === order._id);
    match > -1 && OrderStore.listPicked.splice(match, 1);

    const picking = cloneDeep(order);
    if (vue_props.isInvoice) {
        picking.amountBookOfOrderVAT = picking.amountBookOfOrderVATRest;
    } else {
        // 2.设置结清金额
        if (picking.amountBookOfOrderRest <= 0) {
            NotifyStore.fail(`此订单已收款 ${picking.amountBookOfOrder} 元，请注意重复结清`);
        }
        picking.amountBookOfOrder = picking.amountBookOfOrderRest;

        // 3.不能超过打款金额
        const gap = BookStore.editor.amount - AmountOrderPicking.value;
        if (picking.amountBookOfOrder > gap) picking.amountBookOfOrder = parseInt((gap * 100).toString()) / 100;

        // 4.剩余可用金额必须大于0
        if (gap <= 0) {
            picking.amountBookOfOrder = 0;
            NotifyStore.fail(`资金使用率已满`);
        }
    }

    // done
    OrderStore.listPicked.push(picking);
};
const AmountOrderPicking = computed(() => {
    let amount = 0;
    OrderStore.listPicked.map((e) => (amount += Number(e.amountBookOfOrder)));
    return Number(parseInt((amount * 100).toString()) / 100);
});

const router = useRouter();
const vue_props = defineProps({
    type: {
        type: Number,
        default: ENUM_ORDER.SALES,
    },
    isInvoice: {
        type: Boolean,
        default: false,
    },
});
onMounted(async () => {
    const edit = BookStore.editor;
    if (!edit._id) router.replace("/wmss/finance/book");

    OrderStore.setEditor(OrderStore.getSchema(vue_props.type));
    OrderStore.page = getPage(8);
    OrderStore.search.isNotTax = true;
    OrderStore.search.contactId = "";
    OrderStore.requireAccounterId = true;
    OrderStore.get(1, false, true);
});
</script>

<style lang="sass" scoped></style>

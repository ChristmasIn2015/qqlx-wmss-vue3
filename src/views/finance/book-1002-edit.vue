<template>
    <div class="q-pl-xs q-mb-md">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <q-btn icon="arrow_back" fab flat style="margin-left: -12px" @click="$router.back()"></q-btn>
            <span>修改收款明细 </span>
        </div>
        <div class="text-option text-primary">
            对以下
            <span class="text-negative">{{ OrderStore.listPicked.length }}张</span>
            订单，您已确认实际收到货款 {{ nowAmount }} / {{ BookStore.editor.amount }} 元。 （{{ ((nowAmount * 100) / BookStore.editor.amount).toFixed(2) }}%）
        </div>
    </div>

    <div class="row items-stretch q-mb-sm">
        <div class="col-8">
            <q-table
                dense
                separator="cell"
                class="full-height"
                :columns="[
                    { name: 'code', field: 'code', label: '订单信息', align: 'left' },
                    { name: 'contactId', field: 'contactId', label: '客户', align: 'left' },
                    { name: 'amount', field: 'amount', label: '订单金额' },
                    { name: 'amountBookOfOrder', field: 'amountBookOfOrder', label: '收款确认' },
                    { name: 'remark', field: 'remark', label: '订单备注', align: 'left' },
                    { name: '_id', field: '_id', align: 'left', label: '操作' },
                ]"
                row-key="_id"
                :rows-per-page-options="[0]"
                :rows="OrderStore.listPicked"
            >
                <template v-slot:body="props">
                    <q-tr>
                        <q-td key="code" :props="props" :style="NotifyStore.cellStyle">
                            <div>
                                <q-badge class="q-mr-xs shadow-5" color="pink-6" rounded></q-badge>
                                {{ props.row.code }}
                            </div>
                        </q-td>
                        <q-td key="contactId" :props="props" :style="NotifyStore.fontStyle">
                            <div>{{ props.row.joinContact?.name }}</div>
                        </q-td>
                        <q-td key="amount" :props="props" class="text-right" :style="NotifyStore.fontStyle">
                            {{ props.row.amount.toFixed(2) }}
                        </q-td>
                        <q-td key="amountBookOfOrder" :style="NotifyStore.cellStyle">
                            <q-input
                                dense
                                square
                                filled
                                type="number"
                                input-class="text-body1 text-right"
                                placeholder="请输入金额"
                                v-model="props.row.amountBookOfOrder"
                                color="pink-6"
                            >
                                <template v-slot:append>
                                    <span class="text-body1">元</span>
                                </template>
                            </q-input>
                        </q-td>
                        <q-td key="remark" :props="props" class="ellipsis" :style="NotifyStore.fontStyle">{{ props.row.remark || "无" }}</q-td>
                        <q-td key="_id" style="padding: 0 4px 0 0">
                            <q-btn dense class="text-negative" icon="close" flat @click="() => OrderStore.listPicked.splice(props.rowIndex, 1)"> </q-btn>
                        </q-td>
                    </q-tr>
                </template>
            </q-table>
        </div>
        <div class="col-4 q-pl-sm">
            <q-card class="full-height column">
                <q-card-section class="text-h5 text-weight-bold">打款信息 </q-card-section>
                <q-separator></q-separator>
                <q-card-section class="text-grey text-body1">
                    <div class="row">
                        <div class="col">编号</div>
                        <div class="col-8 text-right text-">{{ BookStore.editor.code }}</div>
                    </div>
                    <div class="row">
                        <div class="col">银行</div>
                        <div class="col-8 text-right text-">{{ BookStore.editor.keyHouse }}</div>
                    </div>
                    <div class="row">
                        <div class="col">金额</div>
                        <div class="col-8 text-right text-">
                            {{ BookStore.editor.amount.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">时间</div>
                        <div class="col-8 text-right text-">{{ BookStore.editor.timeCreateString }}</div>
                    </div>
                    <div class="row">
                        <div class="col">打款人</div>
                        <div class="col-8 text-right text-teal text-bold">{{ BookStore.editor.keyOrigin }}</div>
                    </div>
                </q-card-section>
                <q-separator></q-separator>
                <q-card-section class="text-grey text-body1">
                    <div class="row">
                        <div class="col">
                            <q-badge class="q-mr-xs shadow-5" color="teal" rounded></q-badge>
                            正在确认
                        </div>
                        <div class="col text-right text-body1">
                            <span>{{ nowAmount.toLocaleString("zh", { minimumFractionDigits: 2 }) }} </span>
                            /
                            <span class="text-teal text-bold">
                                {{ BookStore.editor.amount.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                            </span>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">确认率</div>
                        <div class="col text-right text-body1 text-">{{ ((nowAmount * 100) / BookStore.editor.amount).toFixed(2) }}%</div>
                    </div>
                </q-card-section>
                <q-space></q-space>
                <q-card-actions>
                    <q-space></q-space>
                    <q-btn square push @click="router.back()">返回</q-btn>
                    <q-btn square push color="teal" :loading="BookStore.loadding" @click="put()">确认</q-btn>
                </q-card-actions>
            </q-card>
        </div>
    </div>

    <picker-book-order />
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { onMounted, ref, computed } from "vue";
import { clone, cloneDeep, debounce } from "lodash";

import { ENUM_BOOK_TYPE, ENUM_BOOK_DIRECTION } from "qqlx-core";

import pickerBookOrder from "@/components/picker-order.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useOrderStore } from "@/stores/wmss/order";
import { useBookStore } from "@/stores/wmss/book";

const router = useRouter();
const NotifyStore = useNotifyStore();
const OrderStore = useOrderStore();
const BookStore = useBookStore();

const put = async () => {
    try {
        // 记得把金额换回来
        const orders = cloneDeep(OrderStore.listPicked);
        orders.forEach((o) => (o.amount = o.amountBookOfOrder));
        OrderStore.listPicked = [];

        await BookStore.put(BookStore.editor, orders);
        router.back();
    } catch (error) {
        NotifyStore.fail((error as Error).message);
    }
};
const nowAmount = computed(() => {
    let amount = 0;
    OrderStore.listPicked.map((e) => (amount += Number(e.amountBookOfOrder)));
    return Number(parseInt((amount * 100).toString()) / 100);
});
</script>

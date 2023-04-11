<template>
    <div class="q-pl-xs q-py-md">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <span>收款记录</span>
            <q-space></q-space>
            <picker-range
                @change="
                    ($event) => {
                        BookStore.page.startTime = $event.startTime;
                        BookStore.page.endTime = $event.endTime;
                        BookStore.get(1);
                    }
                "
            />
        </div>
        <div class="text-option text-primary"></div>
    </div>

    <q-table
        dense
        row-key="_id"
        separator="cell"
        style="height: 380px"
        :rows="BookStore.list"
        :rows-per-page-options="[BookStore.page.pageSize]"
        :columns="[
            { name: 'code', field: 'code', label: '编号', align: 'left' },
            { name: 'keyOrigin', field: 'keyOrigin', label: '打款人', align: 'left' },
            { name: 'keyHouse', field: 'keyHouse', label: '银行', align: 'left' },
            { name: 'type', field: 'type', label: '分类', align: 'left' },
            { name: 'amount', field: 'amount', label: '已结清' },
            { name: 'amountBookOfSelf', field: 'amountBookOfSelf', label: '已开票' },
            { name: 'amountBookOfSelfRest', field: 'amountBookOfSelfRest', label: '可开票' },
            { name: '_id', field: '_id', label: '操作', align: 'left' },
            { name: 'remark', field: 'remark', label: '备注', align: 'left' },
            { name: 'timeCreateString', field: 'timeCreateString', label: '时间', align: 'left' },
        ]"
    >
        <template v-slot:header="props">
            <q-tr>
                <q-th key="code" :props="props">
                    <q-input square filled dense clearable color="teal" placeholder="搜索编号" v-model="BookStore.search.code" @blur="BookStore.get(1)" />
                </q-th>
                <q-th key="keyOrigin" :props="props">
                    <q-input
                        square
                        filled
                        dense
                        clearable
                        color="teal"
                        placeholder="搜索打款人"
                        v-model="BookStore.search.keyOrigin"
                        @blur="BookStore.get(1)"
                    />
                </q-th>
                <q-th key="keyHouse" :props="props">
                    <q-input square filled dense clearable color="teal" placeholder="搜索银行" v-model="BookStore.search.keyHouse" @blur="BookStore.get(1)" />
                </q-th>
                <q-th key="type" :props="props">分类</q-th>
                <q-th
                    key="amount"
                    :props="props"
                    class="cursor-pointer"
                    :class="{ 'text-negative': BookStore.sortKey === 'amount' }"
                    @click="BookStore.sort('amount')"
                >
                    <span>金额</span>
                    <q-icon :name="BookStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                </q-th>
                <q-th
                    key="amountBookOfSelf"
                    :props="props"
                    class="cursor-pointer"
                    :class="{ 'text-negative': BookStore.sortKey === 'amountBookOfSelf' }"
                    @click="BookStore.sort('amountBookOfSelf')"
                >
                    <span>已开票</span>
                    <q-icon :name="BookStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                </q-th>
                <q-th
                    key="amountBookOfSelfRest"
                    :props="props"
                    class="cursor-pointer"
                    :class="{ 'text-negative': BookStore.sortKey === 'amountBookOfSelfRest' }"
                    @click="BookStore.sort('amountBookOfSelfRest')"
                >
                    <span>可开票</span>
                    <q-icon :name="BookStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                </q-th>
                <q-th key="_id" :props="props">操作</q-th>
                <q-th key="remark" :props="props">
                    <q-input square filled dense clearable color="teal" placeholder="搜索备注" v-model="BookStore.search.remark" @blur="BookStore.get(1)" />
                </q-th>
                <q-th
                    key="timeCreateString"
                    :props="props"
                    class="cursor-pointer"
                    :class="{ 'text-negative': BookStore.sortKey === 'timeCreate' }"
                    @click="BookStore.sort('timeCreate')"
                >
                    <span>时间</span>
                    <q-icon :name="BookStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                </q-th>
            </q-tr>
        </template>

        <template v-slot:body="props">
            <q-tr>
                <q-td key="code" :props="props" :style="NotifyStore.fontStyle">{{ props.row.code }}</q-td>
                <q-td key="keyOrigin" :props="props" :style="NotifyStore.fontStyle">{{ props.row.keyOrigin }}</q-td>
                <q-td key="keyHouse" :props="props" :style="NotifyStore.fontStyle">{{ props.row.keyHouse }}</q-td>
                <q-td key="type" :style="NotifyStore.fontStyle">收款</q-td>
                <q-td key="amount" :props="props" :style="NotifyStore.fontStyle" :class="{ 'text-grey': props.row.amount <= 1 }">
                    {{ props.row.amount.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                </q-td>
                <q-td key="amountBookOfSelf" :props="props" :style="NotifyStore.fontStyle" :class="{ 'text-grey': true }">
                    {{ props.row.amountBookOfSelf.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                </q-td>
                <q-td
                    key="amountBookOfSelfRest"
                    :props="props"
                    :style="NotifyStore.fontStyle"
                    :class="{
                        'text-grey': props.row.amountBookOfSelfRest < 1,
                        'text-negative': props.row.amountBookOfSelfRest >= 1,
                        'text-weight-bold': props.row.amountBookOfSelfRest >= 1,
                    }"
                >
                    {{ props.row.amountBookOfSelfRest.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                </q-td>
                <q-td key="_id" :props="props" :style="NotifyStore.fontStyle">
                    <span v-if="props.row.isDisabled === false" class="cursor-pointer text-teal" @click="pick(props.row)"> 开票 </span>
                </q-td>
                <q-td key="remark" :props="props" :style="NotifyStore.fontStyle">
                    <span :class="props.row.remark ? '' : 'text-grey'">
                        {{ props.row.remark || "-" }}
                    </span>
                </q-td>
                <q-td key="timeCreateString" :props="props" :style="NotifyStore.fontStyle">{{ props.row.timeCreateString }}</q-td>
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
                v-model="BookStore.page.page"
                :max-pages="10"
                :max="Math.ceil(BookStore.total / BookStore.page.pageSize)"
                @update:model-value="(value) => BookStore.get(value)"
            />
            <q-space></q-space>
            <div>
                <span>共 {{ BookStore.total }} 项</span>
            </div>
        </template>
    </q-table>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { cloneDeep, debounce } from "lodash";

import { MongodbSort } from "qqlx-cdk";
import { ENUM_BOOK_TYPE, ENUM_BOOK_DIRECTION, BookJoined, Book, OrderJoined } from "qqlx-core";

import pickerRange from "@/components/picker-range.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useBookStore } from "@/stores/wmss/book";

const NotifyStore = useNotifyStore();

const BookStore = useBookStore();
const pick = (book: Book) => {
    // 1.保证资金没有被选择
    const match = BookStore.listPicked.findIndex((p) => p._id === book._id);
    match > -1 && BookStore.listPicked.splice(match, 1);

    // 2.设置此资金的开票金额
    const picking = cloneDeep(book);
    picking.amountBookOfSelf = picking.amountBookOfSelfRest;
    BookStore.listPicked.push(picking);

    // 3.设置客户
    if (!BookStore.editor.keyOrigin) {
        BookStore.editor.keyOrigin = picking.keyOrigin;
    }
};

const match = { type: ENUM_BOOK_TYPE.YSZK, direction: ENUM_BOOK_DIRECTION.DAI };
onMounted(async () => {
    // BookStore.setEditor(BookStore.getSchema(match));
    BookStore.search = BookStore.getSchema(match);
    BookStore.page.pageSize = 8;
    BookStore.get(1);
});
</script>

<template>
    <div class="q-pl-xs q-mb-md">
        <div class="text-h5 text-primary text-weight-bold row">
            <span>发票列表</span>
            <q-space></q-space>
            <q-btn
                push
                square
                label="最近删除"
                :color="BookStore.search.isDisabled ? 'purple' : 'white'"
                :text-color="BookStore.search.isDisabled ? '' : 'primary'"
                @click="
                    () => {
                        BookStore.search.isDisabled = !BookStore.search.isDisabled;
                        BookStore.get(1);
                    }
                "
            />

            <picker-range
                @change="
                    ($event) => {
                        BookStore.page.startTime = $event.startTime;
                        BookStore.page.endTime = $event.endTime;
                        BookStore.get(1);
                    }
                "
            />
            <q-btn
                push
                square
                label="继续添加"
                class="q-ml-sm"
                color="purple"
                :loading="BookStore.loadding"
                @click="
                    () => {
                        BookStore.setEditor(BookStore.getSchema(match));
                        BookStore.listPicked = [];
                        $router.push('/wmss/finance/book-1122-edit');
                    }
                "
            />
        </div>
        <div class="text-option text-primary q-my-sm"></div>
    </div>

    <q-table
        style="min-height: 780px"
        separator="cell"
        row-key="_id"
        dense
        :rows="BookStore.list"
        :rows-per-page-options="[0]"
        :columns="[
            { name: 'timeCreateString', field: 'timeCreateString', label: '时间', align: 'left' },
            { name: 'code', field: 'code', label: '系统编号', align: 'left' },
            { name: 'keyCode', field: 'keyCode', label: '票号', align: 'left' },
            { name: 'keyHouse', field: 'keyHouse', label: '抬头', align: 'left' },
            { name: 'keyOrigin', field: 'keyOrigin', label: '客户', align: 'left' },
            { name: 'type', field: 'type', label: '分类', align: 'left' },
            { name: 'amount', field: 'amount', label: '发票金额' },
            { name: 'amountBookOfSelf', field: 'amountBookOfSelf', label: '有效金额' },
            { name: 'remark', field: 'remark', label: '备注', align: 'left' },
            { name: '_id', field: '_id', label: '操作', align: 'left' },
        ]"
    >
        <template v-slot:header="props">
            <q-tr>
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
                <q-th key="code" :props="props">
                    <q-input square filled dense clearable color="purple" placeholder="搜索系统编号" v-model="BookStore.search.code" @blur="BookStore.get(1)" />
                </q-th>
                <q-th key="keyCode" :props="props">
                    <q-input square filled dense clearable color="purple" placeholder="搜索票号" v-model="BookStore.search.keyCode" @blur="BookStore.get(1)" />
                </q-th>
                <q-th key="keyHouse" :props="props">
                    <q-select
                        dense
                        square
                        filled
                        clearable
                        emit-value
                        map-options
                        color="purple"
                        label="搜索抬头"
                        :options="[CorpStore.picked?.name, ...ConfigStore.titles.map((e) => e.text)]"
                        v-model="BookStore.search.keyHouse"
                        @update:model-value="BookStore.get(1)"
                    />
                </q-th>
                <q-th key="keyOrigin" :props="props">
                    <q-input
                        square
                        filled
                        dense
                        clearable
                        color="purple"
                        placeholder="搜索客户"
                        v-model="BookStore.search.keyOrigin"
                        @blur="BookStore.get(1)"
                    />
                </q-th>
                <q-th key="type" :props="props">分类</q-th>
                <q-th
                    key="amount"
                    :props="props"
                    class="cursor-pointer"
                    :class="{ 'text-negative': BookStore.sortKey === 'amount' }"
                    @click="BookStore.sort('amount')"
                >
                    <span>发票金额</span>
                    <q-icon :name="BookStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                </q-th>
                <q-th
                    key="amountBookOfSelf"
                    :props="props"
                    class="cursor-pointer"
                    :class="{ 'text-negative': BookStore.sortKey === 'amountBookOfSelf' }"
                    @click="BookStore.sort('amountBookOfSelf')"
                >
                    <span>有效金额</span>
                    <q-icon :name="BookStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                </q-th>
                <q-th key="remark" :props="props">
                    <q-input square filled dense clearable color="purple" placeholder="搜索备注" v-model="BookStore.search.remark" @blur="BookStore.get(1)" />
                </q-th>
                <q-th key="_id" :props="props">操作</q-th>
            </q-tr>
        </template>
        <template v-slot:body="props">
            <q-tr
                class="cursor-crosshair select-none"
                :class="{
                    'bg-grey-4': startIndex <= props.rowIndex && endIndex >= props.rowIndex,
                }"
                @mousedown.capture.stop="
                    () => {
                        endIndex = props.rowIndex;
                        startIndex = props.rowIndex;
                    }
                "
                @mouseup.capture.stop="
                    () => {
                        endIndex = props.rowIndex > startIndex ? props.rowIndex : startIndex;
                    }
                "
            >
                <q-td key="timeCreateString" :props="props" :style="NotifyStore.cellStyle">{{ props.row.timeCreateString }}</q-td>
                <q-td key="code" :props="props" :style="NotifyStore.cellStyle">{{ props.row.code }}</q-td>
                <q-td key="keyCode" :props="props" :style="NotifyStore.cellStyle">{{ props.row.keyCode }}</q-td>
                <q-td key="keyHouse" :props="props" :style="NotifyStore.cellStyle" style="min-width: 188px">{{ props.row.keyHouse }}</q-td>
                <q-td key="keyOrigin" :props="props" :style="NotifyStore.cellStyle">{{ props.row.keyOrigin }}</q-td>
                <q-td key="type" :style="NotifyStore.cellStyle"> 销项 </q-td>
                <q-td key="amount" :props="props" :style="NotifyStore.cellStyle">
                    {{ props.row.amount.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                </q-td>
                <q-td
                    key="amountBookOfSelf"
                    :props="props"
                    :style="NotifyStore.cellStyle"
                    :class="{
                        'text-weight-bold': props.row.amountBookOfSelf > 0,
                        'text-negative': props.row.amountBookOfSelf > 0,
                        'text-grey': props.row.amountBookOfSelf <= 0,
                    }"
                >
                    {{ props.row.amountBookOfSelf.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                </q-td>
                <q-td key="remark" :props="props" :style="NotifyStore.cellStyle">
                    <span class="cursor-pointer" :class="props.row.remark ? '' : 'text-grey'">
                        {{ props.row.remark || "修改" }}
                        <q-menu anchor="top left" @hide="BookStore.put(props.row)">
                            <q-card class="w-400">
                                <q-toolbar class="bg-purple text-white">
                                    <q-toolbar-title>修改备注</q-toolbar-title>
                                    <q-btn dense flat icon="close" v-close-popup></q-btn>
                                </q-toolbar>

                                <q-card-section>
                                    <q-input filled :label="props.row.code" v-model="props.row.remark" color="purple"> </q-input>
                                </q-card-section>

                                <q-card-actions>
                                    <q-space></q-space>
                                    <span class="text-grey">自动保存</span>
                                </q-card-actions>
                            </q-card>
                        </q-menu>
                    </span>
                </q-td>
                <q-td key="_id" :props="props" :style="NotifyStore.cellStyle">
                    <span v-if="props.row.isDisabled === false" class="cursor-pointer text-purple" @click="toEdit(props.row)"> 修改 </span>
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
                v-model="BookStore.page.page"
                :max-pages="10"
                :max="Math.ceil(BookStore.total / BookStore.page.pageSize)"
                @update:model-value="(value) => BookStore.get(value)"
            />
            <q-space></q-space>
            <div>
                <span v-show="endIndex !== -1 && endIndex - startIndex >= 0">
                    已选择 {{ endIndex - startIndex + 1 }} 项

                    <a
                        class="q-ml-sm text-body2 text-weight-bold text-negative cursor-pointer"
                        @click="
                            () => {
                                BookStore.delete(BookStore.list.slice(startIndex, endIndex + 1));
                                startIndex = -1;
                                endIndex = -1;
                            }
                        "
                    >
                        点击{{ BookStore.search.isDisabled ? "恢复" : "删除" }}
                    </a>
                    ，</span
                >
                <span>共 {{ BookStore.total }} 张</span>
            </div>
        </template>
    </q-table>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { cloneDeep, debounce } from "lodash";

import { MongodbSort } from "qqlx-cdk";
import { ENUM_BOOK_TYPE, ENUM_BOOK_DIRECTION, BookJoined, Book, Order, OrderJoined } from "qqlx-core";

import pickerRange from "@/components/picker-range.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useBookStore } from "@/stores/wmss/book";
import { useCorpStore } from "@/stores/brand/corp";
import { useConfigStore } from "@/stores/brand/config";

const route = useRoute();
const router = useRouter();
const NotifyStore = useNotifyStore();
const CorpStore = useCorpStore();
const ConfigStore = useConfigStore();
const BookStore = useBookStore();

const startIndex = ref(-1);
const endIndex = ref(-1);
const toEdit = (invoice: BookJoined) => {
    const _invoice = cloneDeep(invoice);
    BookStore.setEditor(_invoice);

    const books: Book[] = [];
    _invoice.joinBookOfSelf?.map((BS) => {
        const book = BS.joinBook;
        if (book) {
            // 这里把订单的金额换一下
            book.amountBookOfSelf = BS.amount;
            books.push(book);
        }
    });

    BookStore.listPicked = books;
    router.push("/wmss/finance/book-1122-edit");
};

const match = {
    type: ENUM_BOOK_TYPE.YSZK_VAT,
    direction: ENUM_BOOK_DIRECTION.JIE,
};
onMounted(async () => {
    BookStore.setEditor(BookStore.getSchema(match));
    BookStore.search = BookStore.getSchema(match);
    BookStore.page.pageSize = 20;

    // 根据路由进行搜索
    const { code } = route.query;
    code && (BookStore.search.code = code as string);
    await BookStore.get(1);
    await ConfigStore.get();
});
</script>

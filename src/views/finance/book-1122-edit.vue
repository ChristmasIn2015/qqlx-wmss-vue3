<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <q-btn icon="arrow_back" fab flat style="margin-left: -12px" @click="$router.back()"></q-btn>
            <span>修改发票明细</span>
        </div>
        <div class="text-option text-primary"></div>
    </div>

    <div class="row items-stretch q-mb-sm">
        <div class="col-8">
            <q-table
                dense
                row-key="_id"
                class="full-height"
                separator="cell"
                :rows-per-page-options="[0]"
                :rows="BookStore.listPicked"
                :columns="[
                    { name: 'code', field: 'code', label: '打款编号', align: 'left' },
                    { name: 'keyOrigin', field: 'keyOrigin', label: '打款人', align: 'left' },
                    { name: 'amount', field: 'amount', label: '打款金额', align: 'right' },
                    { name: 'amountBookOfSelf', field: 'amountBookOfSelf', label: '开票金额', align: 'right', style: NotifyStore.cellStyle },
                    { name: 'remark', field: 'remark', label: '备注', align: 'left' },
                    { name: '_id', field: '_id', align: 'left', label: '操作' },
                ]"
            >
                <template v-slot:body="props">
                    <q-tr>
                        <q-td key="code" :props="props" :style="NotifyStore.fontStyle">{{ props.row.code }}</q-td>
                        <q-td key="keyOrigin" :props="props" :style="NotifyStore.fontStyle">{{ props.row.keyOrigin }}</q-td>
                        <q-td key="amount" :props="props" :style="NotifyStore.fontStyle">{{ props.row.amount.toFixed(2) }}</q-td>
                        <q-td key="amountBookOfSelf" :style="NotifyStore.cellStyle">
                            <q-input
                                dense
                                square
                                filled
                                type="number"
                                input-class="text-body1 text-right"
                                placeholder="请输入金额"
                                v-model="props.row.amountBookOfSelf"
                                color="purple"
                            />
                        </q-td>
                        <q-td key="remark" :props="props" :style="NotifyStore.fontStyle">{{ props.row.remark }}</q-td>
                        <q-td key="_id">
                            <q-btn dense class="text-negative" icon="close" flat @click="() => BookStore.listPicked.splice(props.rowIndex, 1)"> </q-btn>
                        </q-td>
                    </q-tr>
                </template>
            </q-table>
        </div>
        <div class="col-4 q-pl-sm">
            <q-card class="full-height column">
                <q-card-section class="text-h5 text-weight-bold">发票信息</q-card-section>
                <q-separator></q-separator>
                <q-card-section>
                    <q-input
                        dense
                        square
                        filled
                        readonly
                        color="purple"
                        class="q-mb-sm"
                        placeholder="请输入日期"
                        input-class="text-body1 cursor-pointer"
                        v-model="BookStore.editor.timeCreateString"
                    >
                        <template v-slot:before>
                            <span class="text-body1">日期</span>
                        </template>

                        <q-menu>
                            <q-date
                                minimal
                                color="primary"
                                first-day-of-week="1"
                                v-model="BookStore.editor.timeCreateString"
                                @update:model-value="($event) => (BookStore.editor.timeCreate = new Date($event).getTime())"
                            />
                        </q-menu>
                    </q-input>
                    <q-select
                        dense
                        square
                        filled
                        emit-value
                        map-options
                        color="purple"
                        class="q-mb-sm"
                        placeholder="请选择抬头"
                        :options="(nowCorps as any)"
                        v-model="BookStore.editor.keyHouse"
                    >
                        <template v-slot:before>
                            <span class="text-body1">抬头</span>
                        </template>
                    </q-select>
                    <q-input
                        dense
                        square
                        filled
                        color="purple"
                        class="q-mb-sm"
                        input-class="text-body1"
                        placeholder="请输入名称"
                        v-model="BookStore.editor.keyOrigin"
                    >
                        <template v-slot:before>
                            <span class="text-body1">客户</span>
                        </template>
                    </q-input>
                    <q-input
                        dense
                        square
                        filled
                        color="purple"
                        class="q-mb-sm"
                        input-class="text-body1"
                        placeholder="请输入票号"
                        v-model="BookStore.editor.keyCode"
                    >
                        <template v-slot:before>
                            <span class="text-body1">票号</span>
                        </template>
                    </q-input>
                    <q-input
                        dense
                        square
                        filled
                        type="number"
                        input-class="text-body1"
                        placeholder="请输入金额"
                        v-model="BookStore.editor.amount"
                        color="purple"
                    >
                        <template v-slot:before>
                            <span class="text-body1">金额</span>
                        </template>
                    </q-input>
                    <div class="row q-pl-lg q-ml-md q-mt-sm">
                        已选金额 {{ amountBookPicking.toLocaleString("zh", { minimumFractionDigits: 2 }) }}

                        <span class="text-purple cursor-pointer q-ml-sm" @click="BookStore.editor.amount = amountBookPicking">设为发票金额</span>
                    </div>
                </q-card-section>
                <q-separator></q-separator>
                <q-space></q-space>
                <q-card-actions>
                    <q-space></q-space>
                    <q-btn square @click="$router.back()">返回</q-btn>
                    <q-btn square color="purple" :loading="BookStore.loadding" @click="action()">保存</q-btn>
                </q-card-actions>
            </q-card>
        </div>
    </div>

    <pickerBook1002 />
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { cloneDeep, debounce } from "lodash";

import { MongodbSort } from "qqlx-cdk";
import { ENUM_BOOK_TYPE, ENUM_BOOK_DIRECTION } from "qqlx-core";

import pickerBook1002 from "@/components/picker-book-1002.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useCorpStore } from "@/stores/brand/corp";
import { useConfigStore } from "@/stores/brand/config";
import { useOrderStore } from "@/stores/wmss/order";
import { useBookStore } from "@/stores/wmss/book";

const router = useRouter();
const NotifyStore = useNotifyStore();
const CorpStore = useCorpStore();
const Config = useConfigStore();
const BookStore = useBookStore();

const action = async () => {
    try {
        // 记得把金额换回来
        const books = cloneDeep(BookStore.listPicked);
        books.forEach((o) => (o.amount = o.amountBookOfSelf));
        BookStore.listPicked = [];

        if (BookStore.editor._id) {
            await BookStore.put(BookStore.editor, [], books);
        } else {
            const create = await BookStore.post(BookStore.editor);
            if (create && create[0]) {
                await BookStore.put(create[0], [], books);
            }
        }
        router.back();
    } catch (error) {
        NotifyStore.fail((error as Error).message);
    }
};

const nowCorps = computed(() => {
    const nowCorp = CorpStore.picked;
    const list: string[] = [nowCorp.name, ...Config.titles.map((e) => e.text)];
    return list;
});
const amountBookPicking = computed(() => {
    let amount = 0;
    BookStore.listPicked.map((e) => (amount += Number(e.amountBookOfSelf)));
    return Number(parseInt((amount * 100).toString()) / 100);
});
</script>

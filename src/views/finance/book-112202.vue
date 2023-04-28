<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <q-btn icon="arrow_back" padding="xs" flat style="margin-left: -4px; margin-right: 4px" @click="$router.back()"></q-btn>
            <span>增值税（销项）发票明细</span>
            <dialog-intro></dialog-intro>
            <q-space></q-space>
            <q-btn
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
            <span v-if="BookStore.listExcel.length > 0">
                <q-btn square color="negative" class="q-ml-sm" :loading="BookStore.loadding" @click="() => BookStore.post()">
                    保存 {{ BookStore.listExcel.length }} 项
                </q-btn>
            </span>
            <q-btn square color="white" class="q-ml-sm" text-color="primary" label="批量导入">
                <q-menu>
                    <q-list>
                        <q-item clickable @click="NotifyStore.download()">
                            <q-item-section>下载模板</q-item-section>
                        </q-item>
                        <q-item clickable>
                            <q-item-section>
                                <q-file dense borderless accept=".xlsx, .xls" v-model="filePicking" label="选择文件" @update:model-value="filePickNext" />
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-btn>
            <q-btn
                square
                label="继续添加"
                class="q-ml-sm"
                color="purple"
                :loading="BookStore.loadding"
                @click="BookStore.listExcel.push(BookStore.getSchema(match))"
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
            { name: 'amountBookOfOrder', field: 'amountBookOfOrder', label: '有效金额' },
            { name: 'remark', field: 'remark', label: '备注', align: 'left', style: 'min-width: 188px' },
            { name: '_id', field: '_id', label: '操作', align: 'left' },
        ]"
    >
        <template v-slot:top-row>
            <q-tr v-for="(schema, index) in BookStore.listExcel">
                <q-td :style="NotifyStore.fontStyle">
                    <a class="text-body1 text-teal cursor-pointer text-underline">
                        {{ schema.timeCreateString }}
                        <q-menu>
                            <q-date
                                minimal
                                color="primary"
                                first-day-of-week="1"
                                v-model="schema.timeCreateString"
                                @update:model-value="($event) => (schema.timeCreate = new Date($event).getTime())"
                            />
                        </q-menu>
                    </a>
                </q-td>
                <q-td :style="NotifyStore.fontStyle" class="text-grey">自动生成</q-td>
                <q-td :style="NotifyStore.fontStyle">
                    <q-input dense square filled clearable color="teal" input-class="text-body1" placeholder="发票号码" v-model="schema.keyCode" />
                </q-td>
                <q-td :style="NotifyStore.fontStyle">
                    <q-select
                        dense
                        square
                        filled
                        emit-value
                        map-options
                        color="purple"
                        placeholder="请选择抬头"
                        :options="(nowCorps as any)"
                        v-model="schema.keyHouse"
                    >
                    </q-select>
                </q-td>
                <q-td :style="NotifyStore.fontStyle">
                    <q-input dense square filled clearable color="teal" input-class="text-body1" placeholder="客户" v-model="schema.keyOrigin" />
                </q-td>
                <q-td :style="NotifyStore.fontStyle">
                    <q-badge class="q-mr-xs shadow-2" color="purple" rounded></q-badge>
                    发票（销项）
                </q-td>
                <q-td :style="NotifyStore.fontStyle">
                    <q-input dense square filled color="teal" input-class="text-right text-body1" placeholder="请输入金额" v-model="schema.amount" />
                </q-td>
                <q-td :style="NotifyStore.fontStyle" class="text-grey">自动计算</q-td>
                <q-td :style="NotifyStore.fontStyle">
                    <q-input dense square filled clearable color="teal" input-class="text-body1" placeholder="请输入备注" v-model="schema.remark" />
                </q-td>
                <q-td :style="NotifyStore.fontStyle">
                    <q-btn icon="close" dense class="text-negative" flat @click="() => BookStore.listExcel.splice(index, 1)"> </q-btn>
                </q-td>
            </q-tr>
        </template>

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
                    key="amountBookOfOrder"
                    :props="props"
                    class="cursor-pointer"
                    :class="{ 'text-negative': BookStore.sortKey === 'amountBookOfOrder' }"
                    @click="BookStore.sort('amountBookOfOrder')"
                >
                    <span>有效金额</span>
                    <q-icon :name="BookStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                </q-th>
                <q-th key="remark" :props="props">
                    <q-input square filled dense clearable color="purple" placeholder="搜索备注" v-model="BookStore.search.remark" @blur="BookStore.get(1)" />
                </q-th>
                <q-th key="_id" :props="props">
                    <span v-if="BookStore.listExcel.length > 0">
                        <q-btn padding="xs" icon="close" text-color="negative" square :loading="BookStore.loadding" @click="BookStore.listExcel = []">
                            <q-tooltip class="text-body1">清空</q-tooltip>
                        </q-btn>
                    </span>
                    <span v-else>操作</span>
                </q-th>
            </q-tr>
        </template>

        <template v-slot:body="props">
            <q-tr
                class="cursor-crosshair"
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
                <q-td key="timeCreateString" :props="props" :style="NotifyStore.cellStyle" class="text-grey">{{ props.row.timeCreateString }}</q-td>
                <q-td key="code" :props="props" :style="NotifyStore.cellStyle" class="text-grey">{{ props.row.code }}</q-td>
                <q-td key="keyCode" :props="props" :style="NotifyStore.cellStyle">{{ props.row.keyCode }}</q-td>
                <q-td key="keyHouse" :props="props" :style="NotifyStore.cellStyle" style="min-width: 188px">{{ props.row.keyHouse }}</q-td>
                <q-td key="keyOrigin" :props="props" :style="NotifyStore.cellStyle">{{ props.row.keyOrigin }}</q-td>
                <q-td key="type" :style="NotifyStore.cellStyle" class="text-grey"> 销项 </q-td>
                <q-td key="amount" :props="props" :style="NotifyStore.cellStyle" class="text-grey">
                    {{ props.row.amount.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                </q-td>
                <q-td
                    key="amountBookOfOrder"
                    :props="props"
                    :style="NotifyStore.cellStyle"
                    :class="{
                        'text-weight-bold': props.row.amountBookOfOrder > 0,
                        'text-negative': props.row.amountBookOfOrder > 0,
                        'text-grey': props.row.amountBookOfOrder <= 0,
                    }"
                >
                    {{ props.row.amountBookOfOrder.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                </q-td>
                <q-td key="remark" :props="props" :style="NotifyStore.cellStyle">
                    <span class="cursor-pointer" :class="props.row.remark ? '' : 'text-grey'">
                        {{ props.row.remark || "备注" }}
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
                    <span v-if="props.row.isDisabled === false" class="cursor-pointer text-purple row items-center no-wrap" @click="toEdit(props.row)">
                        选择订单
                        <q-icon name="chevron_right"></q-icon>
                    </span>
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
import * as XLSX from "xlsx";
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { cloneDeep, debounce } from "lodash";

import { MongodbSort, getTime } from "qqlx-cdk";
import { ENUM_BOOK_TYPE, ENUM_BOOK_DIRECTION, BookJoined, Book, Order, OrderJoined } from "qqlx-core";

import dialogIntro from "@/components/dialog-intro.vue";
import pickerRange from "@/components/picker-range.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useConfigStore } from "@/stores/brand/config";
import { useCorpStore } from "@/stores/brand/corp";
import { useBookStore } from "@/stores/wmss/book";
import { useOrderStore } from "@/stores/wmss/order";

const route = useRoute();
const router = useRouter();
const NotifyStore = useNotifyStore();
const CorpStore = useCorpStore();
const ConfigStore = useConfigStore();
const BookStore = useBookStore();
const OrderStore = useOrderStore();
const nowCorps = computed(() => {
    const nowCorp = CorpStore.picked;
    const list: string[] = [nowCorp.name, ...ConfigStore.titles.map((e) => e.text)];
    return list;
});

const startIndex = ref(-1);
const endIndex = ref(-1);
const filePicking = ref(null);
const filePickNext = async (file: File) => {
    if (!file) return;
    const reader = new FileReader(); // WebAPI
    reader.onload = async () => {
        try {
            const workbook = XLSX.read(reader.result, { type: "binary" });
            const sheet = workbook.Sheets["发票导入"];
            if (!sheet) throw new Error(`找不到表格 [发票导入] !`);
            const rowJsonList: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

            // 1.批量上传打款人
            const uploading = [];
            for (let i in rowJsonList) {
                const row = rowJsonList[i];
                const schema = BookStore.getSchema({ type: BookStore.search.type, direction: BookStore.search.direction });
                schema.keyHouse = String(row["@抬头"] || "");
                schema.keyCode = String(row["@发票号码"] || "");
                schema.keyOrigin = String(row["@客户名称"] || "");
                schema.amount = Number(row["@金额"] || 0) || 0;
                schema.remark = String(row["@备注"] || "");

                const date = row["@日期"] || "";
                if (typeof date === "string") {
                    const _date = new Date(date);
                    schema.timeCreate = _date.getTime();
                    schema.timeCreateString = getTime(schema.timeCreate).text;
                } else if (typeof date === "number") {
                    const time = new Date(new Date("1900/1/1 00:00:00").getTime() + (date - 2) * 86400000 + 1000 * 60 * 60);
                    schema.timeCreate = time.getTime();
                    schema.timeCreateString = getTime(schema.timeCreate).text;
                }
                uploading.push(schema);
            }
            BookStore.listExcel = uploading;
        } catch (error) {
            NotifyStore.fail((error as Error).message);
        }
    };
    reader.readAsBinaryString(file);
};
const toEdit = (invoice: BookJoined) => {
    const _book = cloneDeep(invoice);
    BookStore.setEditor(_book);

    const orders: Order[] = [];
    _book.joinBookOfOrder?.map((BookOfOrder) => {
        const order = BookOfOrder.joinOrder as OrderJoined;
        if (order) {
            // 这里把订单的金额换一下
            order.amountBookOfOrderVAT = BookOfOrder.amount;
            order.joinContact = BookOfOrder.joinContact;
            orders.push(order);
        }
    });
    OrderStore.listPicked = cloneDeep(orders);
    router.push("/wmss/finance/book-112202-edit");
};

const match = {
    type: ENUM_BOOK_TYPE.YSZK_VAT,
    direction: ENUM_BOOK_DIRECTION.JIE,
};
onMounted(async () => {
    BookStore.setEditor(BookStore.getSchema(match));
    BookStore.search = BookStore.getSchema(match);
    BookStore.page.pageSize = 20;
    BookStore.listExcel = [];

    // 根据路由进行搜索
    const { code } = route.query;
    code && (BookStore.search.code = code as string);
    await BookStore.get(1);
    await ConfigStore.get();
});
</script>

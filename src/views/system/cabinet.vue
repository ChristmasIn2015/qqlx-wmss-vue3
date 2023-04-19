<template>
    <div class="q-pl-xs q-mb-md">
        <div class="text-h5 text-primary text-weight-bold row">
            <span>商品分类</span>
            <q-space></q-space>
            <q-btn square class="q-ml-sm" color="primary">
                常见分类
                <q-menu>
                    <q-item
                        clickable
                        v-close-popup
                        v-for="recommand in RECOMAND_POUNDS_FORMULA"
                        @click="
                            () => {
                                CabinetStore.setEditor(recommand);
                                CabinetStore.post(); //async
                            }
                        "
                    >
                        <q-item-section>{{ recommand.name }}</q-item-section>
                        <q-tooltip class="text-body1">点击添加</q-tooltip>
                    </q-item>
                </q-menu>
            </q-btn>
            <q-btn
                square
                class="q-ml-sm"
                color="negative"
                @click="
                    () => {
                        CabinetStore.setEditor();
                        dialogCabinet = true;
                    }
                "
            >
                添加新分类
            </q-btn>
        </div>
        <div class="text-option text-primary q-my-sm"></div>
    </div>

    <q-card square>
        <q-splitter v-model="splitIndex">
            <template v-slot:before>
                <q-tabs v-model="tabIndex" dense vertical class="text-primary">
                    <q-tab v-for="(cabinet, index) in CabinetStore.list" :name="index" class="q-my-md">
                        <span class="text-body1 q-my-sm">{{ cabinet.name }}</span>
                        <q-badge v-if="cabinet.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL" floating>大件</q-badge>
                    </q-tab>
                </q-tabs>
            </template>
            <template v-slot:after>
                <q-splitter v-model="splitIndex2">
                    <template v-slot:after>
                        <div class="q-px-md q-pt-sm text-primary">
                            <div class="text-h6 q-pb-sm row">
                                {{ nowCabinet?.name }}

                                <q-space></q-space>
                                <q-btn padding="xs" icon="more_horiz" flat style="margin-right: -8px">
                                    <q-menu>
                                        <q-item
                                            clickable
                                            v-close-popup
                                            @click="
                                                () => {
                                                    CabinetStore.setEditor(nowCabinet);
                                                    CabinetStore.patch();
                                                }
                                            "
                                        >
                                            <q-item-section>置顶</q-item-section>
                                        </q-item>
                                        <q-item
                                            clickable
                                            v-close-popup
                                            @click="
                                                () => {
                                                    CabinetStore.setEditor(nowCabinet);
                                                    dialogCabinet = true;
                                                }
                                            "
                                        >
                                            <q-item-section>修改</q-item-section>
                                        </q-item>
                                        <q-item clickable v-close-popup>
                                            <q-item-section class="text-negative" @click="deleteConfirm(nowCabinet?._id)">删除</q-item-section>
                                        </q-item>
                                    </q-menu>
                                </q-btn>
                            </div>
                            <div class="text-grey row">
                                <div class="col">过磅方法</div>
                                <div class="col text-right" :class="nowCabinet.formula > 1 ? 'text-negative' : 'text-grey'">
                                    {{ MAP_ENUM_POUNDS_FORMULA.get(nowCabinet?.formula)?.text }}
                                    <q-tooltip class="text-body1">
                                        {{ MAP_ENUM_POUNDS_FORMULA.get(nowCabinet?.formula)?.tip }}
                                    </q-tooltip>
                                </div>
                            </div>
                            <div class="text-grey row">
                                <div class="col">统计方法</div>
                                <div class="col text-right" :class="nowCabinet.layout > 1 ? 'text-negative' : 'text-grey'">
                                    {{ MAP_ENUM_LAYOUT_CABINET.get(nowCabinet?.layout)?.text }}
                                    <q-tooltip class="text-body1">
                                        {{ MAP_ENUM_LAYOUT_CABINET.get(nowCabinet?.layout)?.tip }}
                                    </q-tooltip>
                                </div>
                            </div>
                            <div class="text-grey row">
                                <div class="col">单位</div>
                                <div class="col text-right">{{ nowCabinet?.unit }}</div>
                            </div>
                            <div class="q-pt-md row">
                                <q-space></q-space>
                            </div>
                        </div>
                    </template>
                    <template v-slot:before>
                        <q-table
                            style="min-height: 660px"
                            selection="multiple"
                            separator="cell"
                            row-key="_id"
                            dense
                            :rows="CabinetUnitStore.list"
                            :rows-per-page-options="[0]"
                            v-model:selected="CabinetUnitStore.listPicked"
                            :columns="[
                                { name: 'name', field: 'name', label: '品名', align: 'left', style: NotifyStore.cellStyle },
                                { name: 'norm', field: 'norm', label: '规格', align: 'left', style: NotifyStore.cellStyle },
                                {
                                    name: 'countFinal',
                                    field: 'countFinal',
                                    label: '库存',
                                    format: (countFinal, row) =>
                                        nowCabinet?.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL
                                            ? `${(row.poundsFinal / 1000).toFixed(3)} 吨`
                                            : `${parseInt(countFinal.toString())} ${nowCabinet?.unit}`,
                                    style: NotifyStore.cellStyle,
                                },
                                {
                                    name: 'price',
                                    field: 'price',
                                    label: '推荐单价',
                                    format: (price) => `${price / 100} 元`,
                                    style: NotifyStore.cellStyle,
                                },
                                { name: 'timeCreateString', field: 'timeCreateString', label: '创建时间', style: NotifyStore.cellStyle },
                            ]"
                        >
                            <template v-slot:header="props">
                                <q-tr :props="props">
                                    <q-th>
                                        <q-checkbox
                                            size="sm"
                                            style="transform: translateX(-9px)"
                                            v-model="selectingAll"
                                            @update:model-value="(bool) => (CabinetUnitStore.listPicked = bool ? cloneDeep(CabinetUnitStore.list) : [])"
                                        ></q-checkbox>
                                    </q-th>
                                    <q-th>
                                        <q-input
                                            square
                                            filled
                                            dense
                                            clearable
                                            placeholder="搜索品名"
                                            v-model="CabinetUnitStore.search.name"
                                            @blur="CabinetUnitStore.get(nowCabinet, 1)"
                                        />
                                    </q-th>
                                    <q-th>
                                        <q-input
                                            square
                                            filled
                                            dense
                                            clearable
                                            placeholder="搜索规格"
                                            :loading="CabinetUnitStore.loadding"
                                            v-model="CabinetUnitStore.search.norm"
                                            @blur="CabinetUnitStore.get(nowCabinet, 1)"
                                        />
                                    </q-th>
                                    <q-th
                                        :props="props"
                                        key="countFinal"
                                        :class="
                                            nowCabinet?.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL
                                                ? { 'text-negative': CabinetUnitStore.sortKey === 'poundsFinal' }
                                                : { 'text-negative': CabinetUnitStore.sortKey === 'countFinal' }
                                        "
                                        class="cursor-pointer"
                                        @click="
                                            CabinetUnitStore.sort(
                                                nowCabinet,
                                                nowCabinet?.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL ? 'poundsFinal' : 'countFinal'
                                            )
                                        "
                                    >
                                        <span>
                                            <q-icon name="help_outlined" size="14px" v-if="nowCabinet?.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
                                                <q-tooltip class="text-body1">
                                                    <div>您可以在“大件商品”菜单中，查看具体明细</div>
                                                </q-tooltip>
                                            </q-icon>
                                            <span>剩余库存</span>
                                            <q-icon :name="CabinetUnitStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                                        </span>
                                    </q-th>
                                    <q-th
                                        :props="props"
                                        key="price"
                                        :class="{ 'text-negative': CabinetUnitStore.sortKey === 'price' }"
                                        class="cursor-pointer"
                                        @click="CabinetUnitStore.sort(nowCabinet, 'price')"
                                    >
                                        <span>推荐单价 </span>
                                        <q-icon :name="CabinetUnitStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                                    </q-th>
                                    <q-th
                                        :props="props"
                                        key="timeCreateString"
                                        :class="{ 'text-negative': CabinetUnitStore.sortKey === 'timeCreate' }"
                                        class="cursor-pointer"
                                        @click="CabinetUnitStore.sort(nowCabinet, 'timeCreate')"
                                    >
                                        <span>时间</span>
                                        <q-icon :name="CabinetUnitStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                                    </q-th>
                                </q-tr>
                            </template>
                            <template v-slot:top-row>
                                <q-tr>
                                    <q-td colspan="100%" class="text-center">
                                        <div v-if="CabinetUnitStore.listPicked.length > 0">
                                            <q-btn flat color="negative" @click="CabinetUnitStore.delete(nowCabinet)">
                                                删除 {{ CabinetUnitStore.listPicked.length }} 项
                                            </q-btn>
                                            <q-btn color="primary" @click="dialogPatching = true"> 修改单价 </q-btn>
                                        </div>
                                        <div v-else-if="CabinetUnitStore.listPicked.length === 0">
                                            <q-btn
                                                flat
                                                padding="sm"
                                                label="继续添加"
                                                color="positive"
                                                @click="() => CabinetUnitStore.listExcel.push(CabinetUnitStore.getSchema())"
                                            />
                                            <q-btn label="批量导入" flat color="primary" padding="sm">
                                                <q-menu>
                                                    <q-item clickable @click="NotifyStore.download()">
                                                        <q-item-section>下载模板</q-item-section>
                                                    </q-item>
                                                    <q-item clickable>
                                                        <q-item-section>
                                                            <q-file
                                                                dense
                                                                borderless
                                                                accept=".xlsx, .xls"
                                                                v-model="filePicking"
                                                                label="选择文件"
                                                                @update:model-value="filePickNext"
                                                            />
                                                        </q-item-section>
                                                    </q-item>
                                                </q-menu>
                                            </q-btn>
                                        </div>
                                        <div v-if="CabinetUnitStore.listExcel.length > 0">
                                            <q-btn label="清空" flat color="primary" padding="sm" @click="() => (CabinetUnitStore.listExcel = [])" />
                                            <q-btn square class="q-ma-sm" color="primary" @click="() => CabinetUnitStore.post(nowCabinet)">
                                                <span>保存到 @{{ nowCabinet?.name }}</span>
                                            </q-btn>
                                        </div>
                                    </q-td>
                                </q-tr>
                                <q-tr v-for="(schema, index) in CabinetUnitStore.listExcel">
                                    <q-td>
                                        <q-btn dense icon="close" class="text-negative" flat @click="() => CabinetUnitStore.listExcel.splice(index, 1)" />
                                    </q-td>
                                    <q-td>
                                        <q-input square filled v-model="schema.name" dense clearable placeholder="请输入品名" />
                                    </q-td>
                                    <q-td>
                                        <q-input square filled v-model="schema.norm" dense clearable placeholder="请输入规格" />
                                    </q-td>
                                    <q-td class="text-center">自动计算</q-td>
                                    <q-td class="text-right">
                                        <q-input square filled v-model="schema.price" type="number" dense input-class="text-right" />
                                    </q-td>
                                    <q-td> </q-td>
                                </q-tr>
                            </template>
                            <template v-slot:bottom="props">
                                <q-pagination
                                    square
                                    size="16px"
                                    color="white"
                                    class="q-my-sm"
                                    text-color="black"
                                    active-color="primary"
                                    active-text-color="white"
                                    v-model="CabinetUnitStore.page.page"
                                    :max-pages="10"
                                    :max="Math.ceil(CabinetUnitStore.total / CabinetUnitStore.page.pageSize)"
                                    @update:model-value="(value) => CabinetUnitStore.get(nowCabinet, value)"
                                />
                                <q-space></q-space>
                                <span>共 {{ CabinetUnitStore.total }} 项</span>
                                <span v-if="CabinetUnitStore.listExcel.length">，正在添加 {{ CabinetUnitStore.listExcel.length }} 项</span>
                            </template>
                        </q-table>
                    </template>
                </q-splitter>
            </template>
        </q-splitter>

        <q-inner-loading :showing="CabinetUnitStore.loadding || CabinetStore.loadding">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </q-card>

    <q-dialog v-model="dialogCabinet" persistent>
        <q-card class="w-400">
            <q-toolbar>
                <q-toolbar-title>商品分类</q-toolbar-title>

                <q-btn flat dense icon="close" @click="dialogCabinet = false" />
            </q-toolbar>

            <q-separator />

            <q-card-section>
                <q-input filled label="分类名称" class="q-mb-sm" v-model="CabinetStore.editor.name">
                    <template v-slot:before>
                        <q-icon name="dns" />
                    </template>
                </q-input>
                <q-select
                    filled
                    label="过磅方法"
                    class="q-mb-sm"
                    v-model="CabinetStore.editor.formula"
                    emit-value
                    map-options
                    option-label="text"
                    :options="formulaOptions"
                >
                    <template v-slot:before>
                        <q-icon name="" />
                    </template>
                </q-select>
                <div class="q-ml-lg q-pl-md q-mb-sm text-negative" v-if="CabinetStore.editor.formula === ENUM_POUNDS_FORMULA.TS_PLATE">
                    <div>{{ MAP_ENUM_POUNDS_FORMULA.get(CabinetStore.editor.formula)?.tip }}</div>
                </div>
                <q-select
                    filled
                    label="统计方法"
                    class="q-mb-sm"
                    v-model="CabinetStore.editor.layout"
                    emit-value
                    map-options
                    option-label="text"
                    :options="layoutOptions"
                >
                    <template v-slot:before>
                        <q-icon name="" />
                    </template>
                </q-select>
                <div class="q-ml-lg q-pl-md q-mb-sm text-negative" v-if="CabinetStore.editor.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
                    <div>请注意，此商品分类将被设置为 “大件商品”;</div>
                    <div>您需要在 <a class="text-primary cursor-pointer">大件商品</a> 中看见每个商品剩余多少库存;</div>
                </div>
                <q-input filled label="单位" class="q-mb-sm" v-model="CabinetStore.editor.unit">
                    <template v-slot:before>
                        <q-icon name="" />
                    </template>
                </q-input>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn
                    color="primary"
                    push
                    square
                    @click="
                        async () => {
                            if (CabinetStore.editor._id) await CabinetStore.patch();
                            else await CabinetStore.post();
                            dialogCabinet = false;
                        }
                    "
                >
                    {{ CabinetStore.editor._id ? "保存" : "新增" }}
                </q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>

    <q-dialog v-model="dialogPatching">
        <q-card class="w-400">
            <q-toolbar>
                <q-toolbar-title>批量修改单价</q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>
            <q-separator />

            <q-card-section>
                <q-input square filled v-model="pricePatching" type="number" dense clearable />
            </q-card-section>
            <q-card-actions>
                <q-space></q-space>
                <q-btn
                    @click="
                        async () => {
                            await CabinetUnitStore.patch(nowCabinet, pricePatching);
                            dialogPatching = false;
                        }
                    "
                    color="primary"
                >
                    确定
                </q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import * as XLSX from "xlsx";
import { MongodbSort } from "qqlx-cdk";
import { cloneDeep, debounce } from "lodash";
import { onMounted, watch, ref, computed } from "vue";
import { ENUM_LAYOUT_CABINET, ENUM_POUNDS_FORMULA, MAP_ENUM_LAYOUT_CABINET, MAP_ENUM_POUNDS_FORMULA, RECOMAND_POUNDS_FORMULA } from "qqlx-core";

import { useNotifyStore } from "@/stores/quasar/notify";
import { useCabinetStore } from "@/stores/wmss/cabinet";
import { useCabinetUnitStore } from "@/stores/wmss/cabinetUnit";

const layoutOptions = [...MAP_ENUM_LAYOUT_CABINET].map((e) => e[1]);
const formulaOptions = [...MAP_ENUM_POUNDS_FORMULA].map((e) => e[1]);
const splitIndex = ref(10);
const splitIndex2 = ref(80);
const tabIndex = ref(0);
const nowCabinet = computed(() => (CabinetStore.list[tabIndex.value] ? CabinetStore.list[tabIndex.value] : CabinetStore.list[0]));

const NotifyStore = useNotifyStore();
const $q = NotifyStore.getQuasarStore();

const CabinetStore = useCabinetStore();
const dialogCabinet = ref(false);
const deleteConfirm = (cabinetId: string) => {
    $q.dialog({
        title: "重要确认",
        message: "即将为您保留商品分类中的所有商品库存，仅商品分类会被删除，确定要这样做吗？",
        cancel: true,
    }).onOk(() => CabinetStore.delete(cabinetId));
};

const CabinetUnitStore = useCabinetUnitStore();
watch(
    () => nowCabinet.value,
    (cabinet) => {
        CabinetUnitStore.page.pageSize = 15;
        CabinetUnitStore.listExcel = [];
        CabinetUnitStore.listPicked = [];
        CabinetUnitStore.get(cabinet, 1);
    }
);
const filePicking = ref(null);
const filePickNext = async (file: File) => {
    if (!file) return;
    const reader = new FileReader(); // WebAPI
    reader.onload = async () => {
        try {
            const workbook = XLSX.read(reader.result, { type: "binary" });
            const sheet = workbook.Sheets["商品导入"];
            if (!sheet) throw new Error(`找不到表格 [商品导入] !`);
            const rowJsonList: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

            // 1.批量上传客户
            const uploading = [];
            for (let i in rowJsonList) {
                const row = rowJsonList[i];
                const schema = CabinetUnitStore.getSchema();
                schema.name = String(row["@品名"]);
                schema.norm = String(row["@规格"]);
                schema.price = Number(row["@单价/元"]) || 0;
                uploading.push(schema);
            }
            CabinetUnitStore.listExcel = uploading;
        } catch (error) {
            NotifyStore.fail((error as Error).message);
        }
    };
    reader.readAsBinaryString(file);
};
const selectingAll = ref(false);
const pricePatching = ref(0);
const dialogPatching = ref(false);

// action
onMounted(async () => {
    await CabinetStore.get();
});
</script>

<style lang="scss">
.hover {
    &:hover {
        background-color: rgba(0, 0, 0, 0.125);
    }
}
</style>

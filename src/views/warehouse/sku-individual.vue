<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <span>大件商品</span>
            <dialog-intro></dialog-intro>
            <q-space></q-space>

            <picker-range
                @change="
                    ($event) => {
                        SkuStore.page.startTime = $event.startTime;
                        SkuStore.page.endTime = $event.endTime;
                        SkuStore.get(1);
                    }
                "
            />
        </div>
    </div>

    <q-card>
        <q-table
            dense
            row-key="_id"
            separator="cell"
            :columns="(columns as any)"
            :visible-columns="visibleColumns"
            :rows="SkuStore.list"
            :rows-per-page-options="[0]"
        >
            <template v-slot:header="props">
                <q-tr>
                    <q-th
                        key="timeCreateString"
                        class="cursor-pointer"
                        style="text-align: left"
                        :props="props"
                        :class="{ 'text-negative': SkuStore.sortKey === 'timeCreate' }"
                        @click="SkuStore.sort('timeCreate')"
                    >
                        <span>时间 </span>
                        <q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th key="layout" :props="props">库存类型</q-th>
                    <q-th key="name" :props="props">
                        <q-input square filled dense clearable color="primary" placeholder="搜索品名" v-model="SkuStore.search.name" @blur="SkuStore.get(1)" />
                    </q-th>
                    <q-th key="norm" :props="props">
                        <q-input square filled dense clearable color="primary" placeholder="搜索规格" v-model="SkuStore.search.norm" @blur="SkuStore.get(1)" />
                    </q-th>
                    <q-th key="formula" :props="props">来源</q-th>
                    <q-th
                        key="count"
                        :props="props"
                        class="cursor-pointer"
                        :class="{ 'text-negative': SkuStore.sortKey === 'count' }"
                        @click="SkuStore.sort('count')"
                    >
                        <span>数量</span>
                        <q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th
                        key="pounds"
                        :props="props"
                        class="cursor-pointer"
                        :class="{ 'text-negative': SkuStore.sortKey === 'pounds' }"
                        @click="SkuStore.sort('pounds')"
                    >
                        <span>初始重量</span>
                        <q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th
                        key="poundsFinal"
                        :props="props"
                        class="cursor-pointer"
                        :class="{ 'text-negative': SkuStore.sortKey === 'poundsFinal' }"
                        @click="SkuStore.sort('poundsFinal')"
                    >
                        <span>剩余</span>
                        <q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                        <span class="q-ml-sm">
                            <q-icon name="help_outline"></q-icon>
                            <q-tooltip class="text-body1">
                                <div>每个大件商品的最终库存重量</div>
                                <div>= 入库重量 -领料重量</div>
                                <div>* <span class="text-negative">不包括</span>发货中的重量</div>
                            </q-tooltip>
                        </span>
                    </q-th>
                    <q-th key="keyFeat" :props="props">
                        <q-input square filled dense clearable color="primary" placeholder="材质" v-model="SkuStore.search.keyFeat" @blur="SkuStore.get(1)" />
                    </q-th>
                    <q-th key="keyOrigin" :props="props">
                        <q-input
                            square
                            filled
                            dense
                            clearable
                            color="primary"
                            placeholder="产地/钢厂"
                            v-model="SkuStore.search.keyOrigin"
                            @blur="SkuStore.get(1)"
                        />
                    </q-th>
                    <q-th key="keyHouse" :props="props">当前仓库</q-th>
                    <q-th key="keyCode" :props="props">
                        <q-input
                            square
                            filled
                            dense
                            clearable
                            color="primary"
                            placeholder="自定义编号"
                            v-model="SkuStore.search.keyCode"
                            @blur="SkuStore.get(1)"
                        />
                    </q-th>

                    <q-th
                        key="price"
                        :props="props"
                        :class="{ 'text-negative': SkuStore.sortKey === 'price' }"
                        class="cursor-pointer"
                        @click="SkuStore.sort('price')"
                    >
                        <span>单价 </span>
                        <q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th key="remark" :props="props">
                        <q-input
                            square
                            filled
                            dense
                            clearable
                            color="primary"
                            placeholder="搜索备注"
                            v-model="SkuStore.search.remark"
                            @blur="SkuStore.get(1)"
                        />
                    </q-th>
                    <q-th key="orderContactId" :props="props">
                        <q-btn padding="xs" flat square color="primary" @click="contactDialog = true">
                            {{ contactPicked._id ? contactPicked.name : "点击筛选客户" }}
                        </q-btn>
                        <q-btn
                            v-show="contactPicked._id"
                            padding="xs"
                            flat
                            square
                            color="primary"
                            @click="
                                () => {
                                    contactPicked = ContactStore.getSchema();
                                    SkuStore.search.orderContactId = '';
                                    SkuStore.get(1);
                                }
                            "
                        >
                            <q-icon name="close"></q-icon>
                        </q-btn>
                    </q-th>
                    <q-th key="orderId" :props="props">订单编号</q-th>
                    <q-th key="_id" :props="props">
                        <q-select
                            dense
                            filled
                            multiple
                            borderless
                            emit-value
                            map-options
                            class="q-ml-sm"
                            option-value="name"
                            display-value="列设置"
                            options-selected-class="bg-primary text-body1 text-white"
                            v-model="visibleColumns"
                            :options="columns"
                        />
                    </q-th>
                </q-tr>
            </template>
            <template v-slot:body="props">
                <q-tr>
                    <q-td key="timeCreateString" :props="props" style="text-align: left" class="text-grey"> {{ props.row.timeCreateString }} </q-td>
                    <q-td key="layout" :props="props">
                        <q-badge color="primary" v-if="props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
                            大件商品
                            <q-tooltip class="text-body1"> 您可以看见每一项入库大件商品剩下多少库存</q-tooltip>
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
                        <span class="text-grey"> 1 {{ props.row.unit }}</span>
                    </q-td>

                    <q-td key="pounds" :props="props" class="text-grey"> {{ props.row.pounds.toFixed(3) }} 吨 </q-td>
                    <q-td key="poundsFinal" :props="props" :class="{ 'text-grey': props.row.poundsFinal < 1 }">
                        {{ props.row.poundsFinal.toFixed(3) }} 吨
                    </q-td>

                    <q-td key="keyFeat" :props="props" class="text-grey"> {{ props.row.keyFeat }} </q-td>
                    <q-td key="keyOrigin" :props="props" class="text-grey"> {{ props.row.keyOrigin }} </q-td>
                    <q-td key="keyHouse" :props="props" class="text-grey"> - </q-td>
                    <q-td key="keyCode" :props="props" class="text-grey"> {{ props.row.keyCode }} </q-td>
                    <q-td key="price" :props="props" class="text-grey"> {{ props.row.price.toFixed(2) }} 元</q-td>
                    <q-td key="remark" :props="props" class="text-grey ellipsis"> {{ props.row.remark }} </q-td>
                    <q-td key="orderContactId" :props="props">
                        <span v-if="props.row.joinOrderContact">{{ props.row.joinOrderContact?.name }} </span>
                        <span v-else class="text-grey">批量导入</span>
                    </q-td>
                    <q-td key="orderId" :props="props"> {{ props.row.joinOrder?.code }} </q-td>
                    <q-td key="_id" :props="props" style="padding: 0 0 0 20px">
                        <span v-if="props.row.isConfirmed">
                            <q-btn
                                dense
                                square
                                label="领料"
                                v-close-popup
                                color="primary"
                                @click="
                                    () => {
                                        skuDeduction = cloneDeep(props.row);
                                        skuDeduction._id = '';
                                        skuDeduction.deductionSkuId = props.row._id;
                                        skuDeduction.pounds = skuDeduction.poundsFinal;
                                        orderDialog = true;
                                    }
                                "
                            />
                        </span>
                    </q-td>
                </q-tr>
            </template>

            <template v-slot:bottom="props">
                <q-pagination
                    size="16px"
                    color="white"
                    class="q-my-sm"
                    text-color="black"
                    active-color="primary"
                    active-text-color="white"
                    v-model="SkuStore.page.page"
                    :max-pages="10"
                    :max="Math.ceil(SkuStore.total / SkuStore.page.pageSize)"
                    @update:model-value="(value) => SkuStore.get(value)"
                />
                <q-space></q-space>
                <div class="q-pt-sm q-pb-xs">
                    <span>已加载 {{ SkuStore.list.length }} / {{ SkuStore.total }}</span>
                </div>
            </template>
        </q-table>

        <q-inner-loading :showing="SkuStore.loadding">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </q-card>

    <q-dialog v-model="contactDialog" position="bottom">
        <q-card class="w-1000">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title class="text-weight-bold">通讯录</q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>
            <q-separator class="q-mb-md" />

            <list-contact
                @pick="
                    (value) => {
                        contactPicked = value;
                        SkuStore.search.orderContactId = value._id;
                        SkuStore.get(1);
                    }
                "
            ></list-contact>
        </q-card>
    </q-dialog>

    <q-dialog v-model="orderDialog">
        <q-card class="w-400">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>
                    <q-badge rounded color="negative" class="shadow-2 q-mr-sm"> </q-badge>
                    领料
                </q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>

            <q-card-section>
                <q-input
                    filled
                    type="number"
                    label="请输入本次领料后的剩余重量"
                    :hint="`当前剩余 ${skuDeduction.poundsFinal}吨`"
                    v-model="skuDeduction.pounds"
                    color="primary"
                />
            </q-card-section>

            <q-card-actions>
                <q-space></q-space>
                <q-btn color="primary" v-close-popup @click="postOrder()"> 确定 </q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { cloneDeep, debounce } from "lodash";
import { useRouter, useRoute } from "vue-router";

import { MongodbSort, getPage } from "qqlx-cdk";
import { ENUM_LAYOUT_CABINET, ENUM_ORDER } from "qqlx-core";

import dialogIntro from "@/components/dialog-intro.vue";
import listContact from "@/components/list-contact.vue";
import pickerRange from "@/components/picker-range.vue";
import { useContactStore } from "@/stores/brand/contact";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useSkuStore } from "@/stores/wmss/sku";
import { useOrderStore } from "@/stores/wmss/order";

const NotifyStore = useNotifyStore();
const columns = ref([
    { name: "timeCreateString", field: "timeCreateString", label: "时间", align: "left", style: NotifyStore.fontStyle },
    { name: "layout", field: "layout", label: "库存类型", align: "left" },
    { name: "name", field: "name", label: "品名", align: "left", style: NotifyStore.fontStyle },
    { name: "norm", field: "norm", label: "规格", align: "left", style: NotifyStore.fontStyle },
    { name: "formula", field: "formula", label: "用途", align: "center" },
    { name: "count", field: "count", label: "数量", style: NotifyStore.fontStyle },
    { name: "pounds", field: "pounds", label: "重量", style: NotifyStore.fontStyle },
    { name: "poundsFinal", field: "poundsFinal", label: "剩余重量", style: NotifyStore.fontStyle },
    { name: "keyFeat", field: "keyFeat", label: "材质", align: "left", style: NotifyStore.fontStyle },
    { name: "keyOrigin", field: "keyOrigin", label: "产地", align: "left", style: NotifyStore.fontStyle },
    { name: "keyHouse", field: "keyHouse", label: "仓库", align: "left", style: NotifyStore.fontStyle },
    { name: "keyCode", field: "keyCode", label: "自定义编号", align: "left", style: NotifyStore.fontStyle },
    { name: "price", field: "price", label: "单价", style: NotifyStore.fontStyle },
    { name: "remark", field: "remark", label: "备注", style: NotifyStore.fontStyle },
    { name: "orderContactId", field: "orderContactId", label: "客户", align: "left", style: NotifyStore.fontStyle },
    { name: "orderId", field: "orderId", label: "订单编号", align: "left", style: NotifyStore.fontStyle },
    { name: "_id", field: "_id", label: "操作", align: "left", style: NotifyStore.fontStyle },
]);
const visibleColumns = ref(columns.value.filter((e, i) => i < 10 || i === columns.value.length - 1).map((e) => e.name));

const OrderStore = useOrderStore();
const orderDialog = ref(false);
const SkuStore = useSkuStore();
const skuDeduction = ref(SkuStore.getSchema());
const postOrder = async () => {
    orderDialog.value = false;

    const schema = cloneDeep(skuDeduction.value);
    schema.pounds = schema.poundsFinal - schema.pounds;
    schema.price = 0;

    OrderStore.setEditor();
    OrderStore.editor.type = ENUM_ORDER.MATERIAL;
    await OrderStore.post([schema]);

    init();
    SkuStore.get(1);
};

const ContactStore = useContactStore();
const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());

const route = useRoute();
const init = () => {
    SkuStore.page = getPage(20);
    SkuStore.sortKey = "poundsFinal";
    SkuStore.setEditor(ENUM_ORDER.NONE);
    SkuStore.search.isConfirmed = true;
    SkuStore.search.layout = ENUM_LAYOUT_CABINET.INDIVIDUAL;
    SkuStore.types = [ENUM_ORDER.GETIN, ENUM_ORDER.PROCESS];
};
onMounted(() => {
    init();

    const { name, norm } = route.query;
    SkuStore.search.name = (name || "").toString();
    SkuStore.search.norm = (norm || "").toString();

    SkuStore.get(1);
});
</script>

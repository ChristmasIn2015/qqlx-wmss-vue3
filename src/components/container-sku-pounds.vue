<template>
    <q-card>
        <q-table
            style="min-height: 375px"
            separator="cell"
            row-key="_id"
            dense
            :rows="SkuStore.listPicked"
            :rows-per-page-options="[0]"
            :columns="[
                { name: 'layout', field: 'layout', label: '性质', align: 'left', style: NotifyStore.fontStyle },
                { name: 'name', field: 'name', label: '品名', align: 'left', style: NotifyStore.fontStyle },
                { name: 'norm', field: 'norm', label: '规格', align: 'left', style: NotifyStore.fontStyle },
                { name: 'count', field: 'count', label: '数量', align: 'left', style: NotifyStore.fontStyle },
                { name: 'pounds', field: 'pounds', label: '过磅', align: 'left', style: NotifyStore.fontStyle },
                { name: 'keyHouse', field: 'keyHouse', label: '产地', style: NotifyStore.fontStyle },
                { name: 'keyFeat', field: 'keyFeat', label: '材质', style: NotifyStore.fontStyle },
                { name: 'areaId', field: 'areaId', label: '货位', style: NotifyStore.cellStyle },
                { name: '_id', field: '_id', align: 'left', label: '操作', style: NotifyStore.fontStyle },
            ]"
        >
            <template v-slot:header="props">
                <q-tr :props="props">
                    <q-th key="layout" :props="props">类型</q-th>
                    <q-th key="name" :props="props">品名</q-th>
                    <q-th key="norm" :props="props">规格</q-th>
                    <q-th key="count" :props="props">数量</q-th>
                    <q-th key="pounds" :props="props">过磅</q-th>
                    <q-th key="areaId" :props="props">货位</q-th>
                    <q-th key="keyHouse" :props="props">产地</q-th>
                    <q-th key="keyFeat" :props="props">材质</q-th>
                    <q-th key="_id" :props="props">操作</q-th>
                </q-tr>
            </template>

            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td
                        class="cursor-pointer"
                        @click="
                            props.row.layout =
                                props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL ? ENUM_LAYOUT_CABINET.SUMMARY : ENUM_LAYOUT_CABINET.INDIVIDUAL
                        "
                    >
                        <q-badge color="primary" v-if="props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
                            大件商品
                            <q-tooltip class="text-body1">
                                <div>您可以在“大件商品”菜单中</div>
                                <div>具体看见每一个入库后的“大件商品”的剩余库存（如冷轧卷等）</div>
                                <div>点击修改修改为 “普通”</div>
                            </q-tooltip>
                        </q-badge>
                        <q-badge color="grey" v-else>
                            普通
                            <q-tooltip class="text-body1">
                                <div>点击修改修改为 “大件商品”</div>
                            </q-tooltip>
                        </q-badge>
                    </q-td>
                    <q-td :style="myTableCellStyle">
                        <q-input borderless v-model="props.row.name" dense clearable input-class="text-body1" placeholder="请输入品名" />
                    </q-td>
                    <q-td :style="myTableCellStyle">
                        <q-input
                            dense
                            clearable
                            borderless
                            input-class="text-body1"
                            placeholder="请输入规格"
                            v-model="props.row.norm"
                            @update:model-value="SkuStore.setSkuPounds(props.row)"
                        />
                    </q-td>
                    <q-td :style="myTableCellStyle">
                        <q-input
                            square
                            dense
                            clearable
                            type="number"
                            input-class="text-body1"
                            v-model="props.row.count"
                            :filled="!props.row.isPriceInPounds"
                            :borderless="props.row.isPriceInPounds"
                            color="negative"
                            @update:model-value="SkuStore.setSkuPounds(props.row)"
                        >
                            <template v-slot:after>
                                <span class="text-body1">{{ props.row.unit }}</span>
                            </template>
                        </q-input>
                    </q-td>
                    <q-td style="min-width: 200px; padding: 0 4px 0">
                        <div class="row items-center q-py-none no-wrap">
                            <q-btn
                                push
                                dense
                                square
                                glossy
                                class="q-mx-sm"
                                :color="props.row.isPriceInPounds ? 'dark' : 'negative'"
                                @click="
                                    () => {
                                        SkuStore.setSkuPounds(props.row);
                                        props.row.isPriceInPounds = !props.row.isPriceInPounds;
                                    }
                                "
                            >
                                {{ props.row.isPriceInPounds ? "取消" : "过磅" }}
                            </q-btn>
                            <q-input
                                v-if="props.row.isPriceInPounds"
                                square
                                dense
                                clearable
                                type="number"
                                input-class="text-body1"
                                v-model="props.row.pounds"
                                :filled="props.row.isPriceInPounds"
                                color="negative"
                                :borderless="!props.row.isPriceInPounds"
                            >
                                <template v-slot:after>
                                    <span class="text-body1">吨</span>
                                </template>
                            </q-input>
                        </div>
                    </q-td>
                    <q-td>
                        <q-select
                            dense
                            square
                            filled
                            clearable
                            emit-value
                            map-options
                            color="negative"
                            option-value="_id"
                            option-label="name"
                            placeholder="请选择货位"
                            :options="AreaStore.list.filter((e) => e.isDisabled === false)"
                            v-model="props.row.areaId"
                        >
                        </q-select>
                    </q-td>
                    <q-td :style="myTableCellStyle">
                        <q-input
                            dense
                            square
                            filled
                            clearable
                            placeholder="请输入钢厂"
                            input-class="text-body1"
                            v-model="props.row.keyOrigin"
                            color="negative"
                        />
                    </q-td>
                    <q-td :style="myTableCellStyle">
                        <q-input dense filled square clearable placeholder="请输入材质" input-class="text-body1" v-model="props.row.keyFeat" color="negative" />
                    </q-td>
                    <q-td style="padding: 0 4px 0">
                        <q-btn dense icon="more_vert" flat>
                            <q-menu>
                                <q-card>
                                    <q-card-section>
                                        <q-input
                                            dense
                                            square
                                            filled
                                            clearable
                                            class="q-mb-sm"
                                            label="编号"
                                            placeholder="请输入编号"
                                            input-class="text-body1"
                                            v-model="props.row.keyCode"
                                            color="negative"
                                        />
                                        <q-input
                                            dense
                                            square
                                            filled
                                            clearable
                                            class="q-mb-sm"
                                            label="备注"
                                            placeholder="请输入备注"
                                            input-class="text-body1"
                                            v-model="props.row.remark"
                                            color="negative"
                                        />
                                    </q-card-section>
                                </q-card>
                            </q-menu>
                        </q-btn>
                        <q-btn dense class="primary" icon="content_copy" flat @click="() => SkuStore.listPicked.push(cloneDeep(props.row))"> </q-btn>
                        <q-btn dense class="text-negative" icon="close" flat @click="() => SkuStore.listPicked.splice(props.rowIndex, 1)"> </q-btn>
                    </q-td>
                </q-tr>
            </template>
        </q-table>

        <q-inner-loading :showing="OrderStore.loadding">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </q-card>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { cloneDeep } from "lodash";

import { ENUM_LAYOUT_CABINET } from "qqlx-core";
import { useSkuStore } from "@/stores/wmss/sku";
import { useOrderStore } from "@/stores/wmss/order";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useAreaStore } from "@/stores/brand/area";

const route = useRoute();
const SkuStore = useSkuStore();
const OrderStore = useOrderStore();
const NotifyStore = useNotifyStore();
const AreaStore = useAreaStore();

const myTableCellStyle = ref({ "min-width": "177px", "max-width": "177px" });
const listPickedPriceTotal = computed(() => {
    let price = 0;
    SkuStore.listPicked.map((sku) => {
        const num = sku.isPriceInPounds ? Number(sku.pounds) : Number(sku.count);
        price += num * Number(sku.price);
    });
    return Number(price.toFixed(2)).toLocaleString("zh", { minimumFractionDigits: 2 });
});
</script>

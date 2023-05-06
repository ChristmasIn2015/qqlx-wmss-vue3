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
                { name: 'price', field: 'price', label: '单价', style: NotifyStore.fontStyle },
                { name: 'remark', field: 'remark', label: '备注', align: 'left', style: NotifyStore.fontStyle },
                { name: 'timeCreateString', field: 'timeCreateString', align: 'left', label: '操作', style: NotifyStore.fontStyle },
            ]"
        >
            <template v-slot:header="props">
                <q-tr :props="props">
                    <q-th key="layout" :props="props">类型</q-th>
                    <q-th key="name" :props="props">品名</q-th>
                    <q-th key="norm" :props="props">规格</q-th>
                    <q-th key="count" :props="props">数量</q-th>
                    <q-th key="pounds" :props="props">
                        <span>共</span>
                        <span class="q-mx-sm text-h6 text-negative text-weight-bold">{{ listPickedPoundsTotal }}</span>
                        <span>吨</span>
                    </q-th>
                    <q-th key="price" :props="props">
                        <span>共</span>
                        <span class="q-mx-sm text-h6 text-negative text-weight-bold">{{ listPickedPriceTotal }}</span>
                        <span>元</span>
                    </q-th>
                    <q-th key="remark" :props="props">备注</q-th>
                    <q-th key="timeCreateString" :props="props">操作</q-th>
                </q-tr>
            </template>

            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td>
                        <q-badge color="negative" v-if="props.row.deductionSkuId">
                            现货
                            <q-tooltip class="text-body1">
                                <div>您正在销售 “原材料” 中的商品（如冷轧卷等）</div>
                            </q-tooltip>
                        </q-badge>
                        <q-badge
                            class="cursor-pointer"
                            color="primary"
                            v-else-if="props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL"
                            @click="props.row.layout = ENUM_LAYOUT_CABINET.SUMMARY"
                        >
                            原材料
                            <q-tooltip class="text-body1">
                                <div>点击修改修改为 “普通”</div>
                                <div>* 您可以在“原材料”菜单中</div>
                                <div>* 具体看见每一个入库后的“原材料”的剩余库存（如冷轧卷等）</div>
                            </q-tooltip>
                        </q-badge>
                        <q-badge class="cursor-pointer" color="grey" v-else @click="props.row.layout = ENUM_LAYOUT_CABINET.INDIVIDUAL">
                            普通
                            <q-tooltip class="text-body1">
                                <div>点击修改修改为 “原材料”</div>
                            </q-tooltip>
                        </q-badge>
                    </q-td>
                    <q-td :style="myTableCellStyle">
                        <q-input
                            dense
                            clearable
                            borderless
                            placeholder="请输入品名"
                            input-class="text-body1"
                            v-model="props.row.name"
                            :disable="!!props.row.deductionSkuId"
                        />
                    </q-td>
                    <q-td :style="myTableCellStyle">
                        <q-input
                            dense
                            clearable
                            borderless
                            placeholder="请输入规格"
                            input-class="text-body1"
                            v-model="props.row.norm"
                            :disable="!!props.row.deductionSkuId"
                            @update:model-value="SkuStore.setSkuPounds(props.row)"
                        />
                    </q-td>
                    <q-td :style="myTableCellStyle">
                        <q-input
                            square
                            dense
                            clearable
                            type="number"
                            color="negative"
                            input-class="text-body1"
                            v-model="props.row.count"
                            :filled="!props.row.isPriceInPounds"
                            :disable="!!props.row.deductionSkuId || props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL"
                            :borderless="props.row.isPriceInPounds"
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
                                :disable="!!props.row.deductionSkuId"
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
                    <q-td style="min-width: 188px; padding: 0 4px 0">
                        <q-input
                            dense
                            square
                            filled
                            clearable
                            type="number"
                            color="negative"
                            placeholder="请输入单价"
                            input-class="text-body1 text-right"
                            v-model="props.row.price"
                        >
                            <template v-slot:after>
                                <span class="text-body1">元 / {{ props.row.isPriceInPounds ? "吨" : props.row.unit }}</span>
                            </template>
                        </q-input>
                    </q-td>
                    <q-td>
                        <q-input
                            dense
                            square
                            clearable
                            borderless
                            color="negative"
                            placeholder="请输入备注"
                            input-class="text-body1"
                            v-model="props.row.remark"
                        />
                    </q-td>
                    <q-td style="padding: 0 4px 0">
                        <q-btn dense icon="more_vert" flat>
                            <q-menu>
                                <q-card>
                                    <q-card-section>
                                        <div class="text-h6 q-mb-md q-pl-xs">基础信息</div>
                                        <q-input
                                            dense
                                            square
                                            filled
                                            clearable
                                            class="q-mb-sm"
                                            color="negative"
                                            placeholder="请输入产地"
                                            input-class="text-body1"
                                            v-model="props.row.keyOrigin"
                                            :disable="!!props.row.deductionSkuId"
                                        />
                                        <q-input
                                            dense
                                            filled
                                            square
                                            clearable
                                            color="negative"
                                            class="q-mb-sm"
                                            placeholder="请输入材质"
                                            input-class="text-body1"
                                            v-model="props.row.keyFeat"
                                            :disable="!!props.row.deductionSkuId"
                                        />
                                        <q-input
                                            dense
                                            square
                                            filled
                                            clearable
                                            class="q-mb-sm"
                                            color="negative"
                                            placeholder="请输入捆包号"
                                            input-class="text-body1"
                                            v-model="props.row.keyCode"
                                            :disable="!!props.row.deductionSkuId"
                                        />
                                        <div class="text-h6 q-mt-md q-mb-sm q-pl-xs">位置信息</div>
                                        <q-select
                                            dense
                                            square
                                            filled
                                            clearable
                                            emit-value
                                            map-options
                                            label="仓库"
                                            class="q-mb-sm"
                                            option-value="_id"
                                            option-label="name"
                                            placeholder="请选择仓库"
                                            :disable="!!props.row.deductionSkuId"
                                            :options="WarehouseStore.list.filter((e) => e.isDisabled === false)"
                                            v-model="props.row.warehouseId"
                                        >
                                        </q-select>
                                        <q-input
                                            dense
                                            square
                                            filled
                                            clearable
                                            class="q-mb-sm"
                                            color="negative"
                                            placeholder="请选择货位号"
                                            input-class="text-body1"
                                            v-model="props.row.keyHouse"
                                            :disable="!!props.row.deductionSkuId"
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

            <!-- <template v-slot:bottom> 12 </template> -->
        </q-table>

        <q-inner-loading :showing="OrderStore.loadding">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </q-card>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import { ENUM_LAYOUT_CABINET } from "qqlx-core";
import { useSkuStore } from "@/stores/wmss/sku";
import { useOrderStore } from "@/stores/wmss/order";
import { cloneDeep } from "lodash";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useAreaStore } from "@/stores/brand/area";
import { useWarehouseStore } from "@/stores/brand/warehouse";

const route = useRoute();
const NotifyStore = useNotifyStore();
const AreaStore = useAreaStore();
const WarehouseStore = useWarehouseStore();
const SkuStore = useSkuStore();
const OrderStore = useOrderStore();

const myTableCellStyle = ref({ "min-width": "177px", "max-width": "177px" });
const listPickedPriceTotal = computed(() => {
    let price = 0;
    SkuStore.listPicked.map((sku) => {
        const num = sku.isPriceInPounds ? Number(sku.pounds) : Number(sku.count);
        price += num * Number(sku.price);
    });
    return Number(price.toFixed(2)).toLocaleString("zh", { minimumFractionDigits: 2 });
});
const listPickedPoundsTotal = computed(() => {
    let pounds = 0;
    SkuStore.listPicked.map((sku) => (pounds += sku.isPriceInPounds ? Number(sku.pounds) : 0));
    return Number(pounds).toLocaleString("zh", { minimumFractionDigits: 3 });
});
</script>

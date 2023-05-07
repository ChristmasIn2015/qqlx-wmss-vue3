<template>
    <div style="max-width: 1350px">
        <div class="text-h5 text-primary row items-center text-weight-bold q-pl-xs q-mb-sm">
            <span>经营指标</span>
            <q-space></q-space>
            <dialog-intro />
        </div>

        <!-- 日期选择 -->
        <!-- 日期选择 -->
        <div class="row items-stretch q-mt-md">
            <div class="col row">
                <q-btn
                    push
                    square
                    v-for="(month, index) in month12"
                    class="col full-height no-shadow"
                    :class="{
                        'bg-white': !(yearNow === year && monthNow === index + 1),
                        'bg-primary': yearNow === year && monthNow === index + 1,
                        'text-white': yearNow === year && monthNow === index + 1,
                    }"
                    @click="() => renderOrderAnalysis(month)"
                >
                    {{ year }}
                    <br />
                    {{ index + 1 }} 月
                </q-btn>
            </div>
            <div class="col-1 q-pl-sm">
                <q-btn push square icon="arrow_drop_up" class="text-primary full-width bg-white" @click="year -= 1"></q-btn>
                <q-btn push square icon="arrow_drop_down" class="text-primary full-width bg-white" @click="year += 1"></q-btn>
            </div>
        </div>

        <!-- 经营数字 -->
        <!-- 经营数字 -->
        <div class="row items-stretch text-primary q-mt-md">
            <div class="col q-pr-sm">
                <q-card square class="text-body1 full-height">
                    <q-card-section>
                        <div class="row text-bold">
                            <div class="col">采购金额</div>
                            <div class="col text-right">{{ (PurchaseAnalysis.amount / 10000).toFixed(2) }} 万</div>
                        </div>
                        <div class="row text-grey">
                            <div class="col">订单数</div>
                            <div class="col text-right">{{ PurchaseAnalysis.count }} 张</div>
                        </div>
                    </q-card-section>
                    <q-separator></q-separator>
                    <q-card-section>
                        <div class="row text-grey">
                            <div class="col">付款结清</div>
                            <div class="col text-right">{{ PurchaseAnalysis.amountBookOfOrder.toFixed(0) }} 元</div>
                        </div>
                        <div class="row text-grey">
                            <div class="col">进度</div>
                            <div class="col text-right">{{ ((PurchaseAnalysis.amountBookOfOrder / (PurchaseAnalysis.amount || 1)) * 100).toFixed(2) }} %</div>
                        </div>
                    </q-card-section>
                    <q-inner-loading :showing="AnalysisStore.loadding">
                        <q-spinner-gears size="50px" color="primary" />
                    </q-inner-loading>
                </q-card>
            </div>
            <div class="col q-pr-sm">
                <q-card square class="text-body1 full-height">
                    <q-card-section>
                        <div class="row text-bold">
                            <div class="col">领料订单</div>
                            <div class="col text-right">{{ MaterialAnalysis.count }} 张</div>
                        </div>
                        <div class="row text-bold">
                            <div class="col">加工订单</div>
                            <div class="col text-right">{{ ProcessAnalysis.count }} 张</div>
                        </div>
                    </q-card-section>
                    <q-separator></q-separator>
                    <q-card-section>
                        <div class="text-body2 text-grey">一次完整的原材料加工过程，包含领取原材料 > 产品加工两个步骤。</div>
                    </q-card-section>
                    <q-inner-loading :showing="AnalysisStore.loadding">
                        <q-spinner-gears size="50px" color="primary" />
                    </q-inner-loading>
                </q-card>
            </div>
            <div class="col">
                <q-card square class="text-body1 full-height">
                    <q-card-section>
                        <div class="row text-bold">
                            <div class="col">销售金额</div>
                            <div class="col text-right">{{ (SaleAnalysis.amount / 10000).toFixed(2) }} 万</div>
                        </div>
                        <div class="row text-grey">
                            <div class="col">订单数</div>
                            <div class="col text-right">{{ SaleAnalysis.count }} 张</div>
                        </div>
                    </q-card-section>
                    <q-separator></q-separator>
                    <q-card-section>
                        <div class="row text-grey">
                            <div class="col">收款结清</div>
                            <div class="col text-right">{{ (SaleAnalysis.amountBookOfOrder / 10000).toFixed(2) }} 万</div>
                        </div>
                        <div class="row text-grey">
                            <div class="col">进度</div>
                            <div class="col text-right">{{ ((SaleAnalysis.amountBookOfOrder / (SaleAnalysis.amount || 1)) * 100).toFixed(2) }} %</div>
                        </div>
                    </q-card-section>
                    <q-inner-loading :showing="AnalysisStore.loadding">
                        <q-spinner-gears size="50px" color="primary" />
                    </q-inner-loading>
                </q-card>
            </div>
        </div>

        <!-- 快速入口 -->
        <!-- 快速入口 -->
        <div class="row q-mt-sm">
            <div class="col q-pr-sm">
                <q-btn flat color="primary" class="full-width" @click="$router.push('/wmss/purchase/create')">
                    <span>去采购</span>
                    <q-icon name="arrow_right" style="margin-top: -2px"></q-icon>
                </q-btn>
            </div>
            <div class="col q-pr-sm">
                <q-btn flat color="primary" class="full-width" @click="$router.push('/wmss/warehouse/sku-individual')">
                    <span>查看原材料</span>
                    <q-icon name="arrow_right" style="margin-top: -2px"></q-icon>
                </q-btn>
            </div>
            <div class="col">
                <q-btn flat color="primary" class="full-width" @click="$router.push('/wmss/trade/sale-create')">
                    <q-badge color="negative">HOT</q-badge>
                    <span class="q-ml-sm">去开单</span>
                    <q-icon name="arrow_right" style="margin-top: -2px"></q-icon>
                </q-btn>
            </div>
        </div>

        <!-- 客户分析 -->
        <!-- 客户分析 -->
        <div class="text-h5 text-primary row items-center text-weight-bold q-pl-xs q-mt-xl q-mb-md">
            <span>收款分析</span>
            <q-space></q-space>
        </div>
        <q-card square>
            <q-table
                class="my-sticky-header-table"
                separator="cell"
                row-key="_id"
                dense
                :rows="ContactAnalysisResult"
                :rows-per-page-options="[0]"
                :columns="[
                    { name: 'contactId', field: 'contactId', label: '', align: 'left', style: NotifyStore.cellStyle },
                    { name: 'count', field: 'count', label: '', align: 'right', style: NotifyStore.cellStyle },
                    { name: 'amount', field: 'amount', label: '', align: 'right', style: NotifyStore.cellStyle },
                    { name: 'amountBookOfOrder', field: 'amountBookOfOrder', label: '', align: 'right', style: NotifyStore.cellStyle },
                    { name: 'amountBookOfOrderRest', field: 'amountBookOfOrderRest', label: '', align: 'right', style: NotifyStore.cellStyle },
                ]"
            >
                <template v-slot:header="props">
                    <q-tr :props="props">
                        <q-th :props="props" key="contactId">
                            <q-btn class="q-px-sm" flat square color="negative" style="margin-left: -6px" @click="contactDialog = true">
                                {{ contactPicked._id ? contactPicked.name : "点击筛选客户" }}
                            </q-btn>
                            <q-btn
                                v-if="contactPicked._id"
                                flat
                                square
                                padding="xs"
                                color="negative"
                                @click="
                                    () => {
                                        contactPicked = ContactStore.getSchema();
                                        renderOrderAnalysis();
                                    }
                                "
                            >
                                <q-icon name="close"></q-icon>
                            </q-btn>
                        </q-th>

                        <q-th
                            key="count"
                            class="text-right cursor-pointer"
                            :class="{ 'text-negative': AnalysisStore.sortKey === 'count' }"
                            @click="
                                () => {
                                    AnalysisStore.sortKey = 'count';
                                    AnalysisStore.sortValue = AnalysisStore.sortValue === MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
                                    renderOrderAnalysis();
                                }
                            "
                        >
                            <span>销售订单</span>
                            <q-icon :name="AnalysisStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                        </q-th>
                        <q-th
                            key="amount"
                            class="text-right cursor-pointer"
                            :class="{ 'text-negative': AnalysisStore.sortKey === 'amount' }"
                            @click="
                                () => {
                                    AnalysisStore.sortKey = 'amount';
                                    AnalysisStore.sortValue = AnalysisStore.sortValue === MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
                                    renderOrderAnalysis();
                                }
                            "
                        >
                            <span>应收款</span>
                            <q-icon :name="AnalysisStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                        </q-th>
                        <q-th
                            key="amountBookOfOrder"
                            class="text-right cursor-pointer"
                            :class="{ 'text-negative': AnalysisStore.sortKey === 'amountBookOfOrder' }"
                            @click="
                                () => {
                                    AnalysisStore.sortKey = 'amountBookOfOrder';
                                    AnalysisStore.sortValue = AnalysisStore.sortValue === MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
                                    renderOrderAnalysis();
                                }
                            "
                        >
                            <span>已收款</span>
                            <q-icon :name="AnalysisStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                        </q-th>
                        <q-th
                            key="amountBookOfOrderRest"
                            class="text-right cursor-pointer"
                            :class="{ 'text-negative': AnalysisStore.sortKey === 'amountBookOfOrderRest' }"
                            @click="
                                () => {
                                    AnalysisStore.sortKey = 'amountBookOfOrderRest';
                                    AnalysisStore.sortValue = AnalysisStore.sortValue === MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
                                    renderOrderAnalysis();
                                }
                            "
                        >
                            <span>还应收款</span>
                            <q-icon :name="AnalysisStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                        </q-th>
                    </q-tr>
                </template>

                <template v-slot:body="props">
                    <q-tr>
                        <q-td key="contactId" :props="props">{{ props.row.joinContact?.name }} </q-td>
                        <q-td key="count" :props="props">{{ props.row.count }} </q-td>
                        <q-td key="amount" :props="props" :class="props.row.amount <= 1 ? 'text-grey' : ''">
                            {{ props.row.amount.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                        </q-td>
                        <q-td key="rate" :props="props">
                            <span v-if="props.row.amount > 0"> {{ Math.ceil((props.row.amountBookOfOrder / props.row.amount) * 100) }}% </span>
                        </q-td>
                        <q-td key="amountBookOfOrder" :props="props" class="text-grey">
                            {{ props.row.amountBookOfOrder.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                        </q-td>
                        <q-td
                            key="amountBookOfOrderRest"
                            :props="props"
                            :class="props.row.amountBookOfOrderRest <= 1 ? 'text-grey' : 'text-negative text-bold'"
                        >
                            {{ props.row.amountBookOfOrderRest.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                        </q-td>
                    </q-tr>
                </template>
            </q-table>

            <q-inner-loading :showing="AnalysisStore.loadding">
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
                            renderOrderAnalysis();
                        }
                    "
                ></list-contact>
            </q-card>
        </q-dialog>
    </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { onMounted, ref, computed } from "vue";

import { ENUM_ORDER } from "qqlx-core";
import { getRangeMonth, getTime, MongodbSort } from "qqlx-cdk";

import listContact from "@/components/list-contact.vue";
import dialogIntro from "@/components/dialog-intro.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useAnalysisStore } from "@/stores/wmss/analysis";
import { useCorpStore } from "@/stores/brand/corp";
import { useAnnounceStore } from "@/stores/brand/announce";
import { useWarehouseStore } from "@/stores/brand/warehouse";
import { useAreaStore } from "@/stores/brand/area";
import { useMarketScoAnalysisStore } from "@/stores/market/analysis";
import { useContactStore } from "@/stores/brand/contact";

const NotifyStore = useNotifyStore();
const CorpStore = useCorpStore();
const dialogCorp = ref(false);
const showCorpDisabled = ref(false);
const AnnounceStore = useAnnounceStore();

const WarehouseStore = useWarehouseStore();
const warehouseDialog = ref(false);
const showWarehouseIsDisabled = ref(false);

const AreaStore = useAreaStore();
const areaDialog = ref(false);
const showAreaIsDisabled = ref(false);

const AnalysisStore = useAnalysisStore();
const MarketScoAnalysisStore = useMarketScoAnalysisStore();

// 1~12月
const year = ref(new Date().getFullYear());
const yearNow = computed(() => new Date(AnalysisStore.page.startTime).getFullYear());
const monthNow = computed(() => new Date(AnalysisStore.page.startTime).getMonth() + 1);
const month12 = computed(() => {
    const result: { startTime: number; endTime: number }[] = [];

    for (const index in Array(12).fill(null)) {
        const month = Number(index) + 1;

        const start = `${year.value}/${month}/1 00:00:00`;
        const date_start = new Date(start);

        const end = month + 1 > 12 ? `${year.value + 1}/1/1 23:59:59` : `${year.value}/${month + 1}/1 23:59:59`;
        const date_end = new Date(end);
        date_end.setDate(0);

        result.push({ startTime: date_start.getTime(), endTime: date_end.getTime() });
    }
    return result;
});

// 分析内容
const PurchaseAnalysis = ref({ count: 0, amount: 0, amountBookOfOrder: 0, amountBookOfOrderVAT: 0 });
const MaterialAnalysis = ref({ count: 0, amount: 0, amountBookOfOrder: 0, amountBookOfOrderVAT: 0 });
const ProcessAnalysis = ref({ count: 0, amount: 0, amountBookOfOrder: 0, amountBookOfOrderVAT: 0 });
const SaleAnalysis = ref({ count: 0, amount: 0, amountBookOfOrder: 0, amountBookOfOrderVAT: 0 });

const ContactAnalysisResult = ref([]);
const ContactStore = useContactStore();
const contactPicked = ref(ContactStore.getSchema());
const contactDialog = ref(false);
const renderOrderAnalysis = async (params?: { startTime: number; endTime: number }) => {
    try {
        AnalysisStore.loadding = true;
        if (params) {
            AnalysisStore.page.startTime = params.startTime;
            AnalysisStore.page.endTime = params.endTime;
        }

        const base = { type: ENUM_ORDER.NONE, startTime: AnalysisStore.page.startTime, endTime: AnalysisStore.page.endTime };
        base.type = ENUM_ORDER.PURCHASE;
        PurchaseAnalysis.value = (await AnalysisStore.getOrderAnalysis(base)).analysis;
        base.type = ENUM_ORDER.MATERIAL;
        MaterialAnalysis.value = (await AnalysisStore.getOrderAnalysis(base)).analysis;
        base.type = ENUM_ORDER.PROCESS;
        ProcessAnalysis.value = (await AnalysisStore.getOrderAnalysis(base)).analysis;
        base.type = ENUM_ORDER.SALES;
        SaleAnalysis.value = (await AnalysisStore.getOrderAnalysis(base)).analysis;

        base.type = ENUM_ORDER.SALES;
        ContactAnalysisResult.value = await AnalysisStore.getContactAnalysis({ ...base, contactId: contactPicked.value?._id });
    } catch (error) {
        NotifyStore.fail((error as Error).message);
    } finally {
        AnalysisStore.loadding = false;
    }
};
onMounted(() => {
    AnalysisStore.page = { ...AnalysisStore.page, ...getRangeMonth() };
    renderOrderAnalysis();
});
</script>

<style lang="sass">
.my-sticky-header-table
  /* height or max-height is important */
  height: 300px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: white

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0
</style>

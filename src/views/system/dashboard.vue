<template>
    <div class="text-h5 text-primary row items-center text-weight-bold q-pl-xs q-mb-sm">
        <span>销售指标</span>
        <dialog-intro />
    </div>

    <div class="row q-pb-md">
        <q-card class="q-mx-xs q-mb-md text-body1 full-height text-primary col" square v-for="(time, index) in times">
            <q-card-section class="text-caption">
                <div class="text-h6 text-weight-bold">{{ time.text }}</div>
            </q-card-section>
            <q-separator />
            <q-card-section class="text-primary">
                <div class="row">
                    <span class="col">销售额</span>
                    <span class="col text-right"> {{ Number((time.calcu as any)[ENUM_ORDER.SALES]?.amount / 10000).toFixed(0) }} 万 </span>
                </div>
                <div class="row">
                    <span class="col">订单量</span>
                    <span class="col text-right"> {{ (time.calcu as any)[ENUM_ORDER.SALES]?.count }} 张 </span>
                </div>
            </q-card-section>

            <q-inner-loading :showing="AnalysisStore.loadding">
                <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
            <q-tooltip class="text-body1">
                <div>
                    <span>{{ getTime(time.startTime).text }}</span>
                    ~
                    <span>{{ getTime(time.endTime).text }}</span>
                </div>
            </q-tooltip>
        </q-card>
    </div>

    <div class="text-h5 text-primary row items-center text-weight-bold q-pl-xs">
        <div class="col q-pr-sm">系统设置</div>
        <div class="col q-pr-sm"></div>
        <div class="col q-pr-sm"></div>
        <div class="col q-pr-sm">马上经营</div>
    </div>

    <div class="text-grey row items-center text-weight-bold q-pl-xs q-mb-sm">
        <div class="col q-pr-sm">切换公司、修改仓库等</div>
        <div class="col q-pr-sm"></div>
        <div class="col q-pr-sm"></div>
        <div class="col q-pr-sm">开具销售单、采购单</div>
    </div>

    <div class="row">
        <div class="col q-pr-sm">
            <q-btn class="full-width bg-white text-primary" @click="$router.push('/wmss/system/setting')">设置</q-btn>
        </div>
        <div class="col q-pr-sm"></div>
        <div class="col q-pr-sm"></div>
        <div class="col q-pr-sm">
            <q-btn class="full-width" color="negative" @click="$router.push('/wmss/trade/sale-create')">销售开单</q-btn>
            <q-btn class="full-width bg-white text-primary q-mt-sm" @click="$router.push('/wmss/warehouse/order-list')"
                >仓库订单
                <q-tooltip class="text-body1">库存的变动基于仓库订单</q-tooltip>
            </q-btn>
            <q-btn class="full-width bg-white text-primary q-mt-sm" disable>小程序（敬请期待）</q-btn>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { onMounted, ref, computed } from "vue";

import { ENUM_ORDER } from "qqlx-core";
import { getTime, getRangeDay, getRangeWeek, getRangeMonth, getRangeYear } from "qqlx-cdk";

import dialogIntro from "@/components/dialog-intro.vue";
import { useAnalysisStore } from "@/stores/wmss/analysis";
import { useCorpStore } from "@/stores/brand/corp";
import { useAnnounceStore } from "@/stores/brand/announce";
import { useWarehouseStore } from "@/stores/brand/warehouse";
import { useAreaStore } from "@/stores/brand/area";
import { useMarketScoAnalysisStore } from "@/stores/market/analysis";

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

const time1 = ref({ ...getRangeDay(), text: "今日", calcu: {} });
const time2 = ref({ ...getRangeMonth(), text: "本月", calcu: {} });
const time3 = ref({ ...getRangeYear(), text: "本年", calcu: {} });
const time4 = ref({ startTime: new Date("2020/01/01").getTime(), endTime: Date.now() + 86400000, text: "全部", calcu: {} });
const times = ref([time1.value, time2.value, time3.value, time4.value]);
onMounted(async () => {
    times.value = await AnalysisStore.set(times.value as any);
});
</script>

<style scoped lang="scss"></style>

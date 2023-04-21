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
            <q-badge color="negative" floating v-if="index === 1">HOT</q-badge>
        </q-card>
    </div>

    <div class="row text-h5 text-weight-bold text-primary">
        <div class="col q-px-xs">系统设置</div>
        <div class="col q-px-xs"></div>
        <div class="col q-px-xs">财务指标</div>
        <div class="col q-px-xs">马上经营</div>
    </div>

    <div class="row text-grey q-pt-xs">
        <div class="col q-px-xs">在此切换公司主体、修改公司公告</div>
        <div class="col q-px-xs"></div>
        <div class="col q-px-xs">看见哪些顾客尚有货款未结清</div>
        <div class="col q-px-xs">
            <div>代替顾客创建销售单</div>
            <!-- <div>顾客也可以自主在小程序向您发起订单</div> -->
        </div>
    </div>

    <div class="row text-primary q-mt-sm">
        <div class="col q-px-xs">
            <q-btn class="full-width q-mb-md text-body1" square @click="$router.push('/wmss/system/corp')"> 设置 </q-btn>
        </div>
        <div class="col q-px-xs"></div>
        <div class="col q-px-xs">
            <q-btn class="full-width q-mb-sm text-body1" color="teal" square @click="$router.push('/wmss/finance/book-1002')"> 收款记录 </q-btn>
            <q-btn class="full-width q-mb-sm text-body1" square @click="$router.push('/wmss/system/analysis')"> 回款分析 </q-btn>
        </div>
        <div class="col q-px-xs">
            <q-btn class="full-width q-mb-sm text-body1" color="negative" square @click="$router.push('/wmss/trade/sale-create')">
                <span>代客下单</span>
            </q-btn>
            <q-btn disable class="full-width q-mb-sm text-body1" square>
                小程序商城 (敬请期待)
                <q-tooltip class="text-body1" anchor="center right" self="center right">
                    <div>* 您的客户可以在微信小程序中，直接向您下单</div>
                    <div>* 您的客户将会直接向您的银行卡账户进行付款</div>
                </q-tooltip>
            </q-btn>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { onMounted, ref, computed } from "vue";

import { ENUM_ORDER } from "qqlx-core";
import { getTime, getRangeDay, getRangeWeek, getRangeMonth, getRangeYear } from "qqlx-cdk";

import dialogIntro from "@/components/dialog-intro.vue";
import { useCabinetStore } from "@/stores/wmss/cabinet";
import { useAnnounceStore } from "@/stores/brand/announce";
import { useAnalysisStore } from "@/stores/wmss/analysis";

const AnalysisStore = useAnalysisStore();
const AnnounceStore = useAnnounceStore();
const CabinetStore = useCabinetStore();

const time1 = ref({ ...getRangeDay(), text: "今日", calcu: {} });
const time2 = ref({ ...getRangeMonth(), text: "本月", calcu: {} });
const time3 = ref({ ...getRangeYear(), text: "本年", calcu: {} });
const time4 = ref({ startTime: new Date("2020/01/01").getTime(), endTime: Date.now() + 86400000, text: "全部", calcu: {} });
const times = ref([time1.value, time2.value, time3.value, time4.value]);
onMounted(async () => {
    AnnounceStore.get();
    times.value = await AnalysisStore.set(times.value as any);
    CabinetStore.get();
});
</script>

<style scoped lang="scss"></style>

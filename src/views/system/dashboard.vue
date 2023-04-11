<template>
    <div class="text-h5 text-primary text-weight-bold q-mt-sm q-mb-md q-pl-xs">销售</div>
    <div class="row q-pb-md">
        <q-card class="q-mr-md q-mb-md text-body1 full-height text-primary col" v-for="(time, index) in times">
            <q-card-section>
                <div class="text-h6 text-weight-bold">{{ time.text }}</div>
                <div class="text-caption">
                    <span>{{ new Date(time.startTime).toLocaleString().split(" ")[0] }}</span>
                    ~
                    <span>{{ new Date(time.endTime).toLocaleString().split(" ")[0] }}</span>
                </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="text-primary">
                <div class="row">
                    <span class="col">销售额</span>
                    <span class="col text-right" :class="index === 0 ? 'text-bold text-negative' : ''">
                        {{ Number((time.calcu as any)[ENUM_ORDER.SALES]?.amount / 10000).toFixed(2) }} 万元
                    </span>
                </div>
                <div class="row">
                    <span class="col">订单数量</span>
                    <span class="col text-right" :class="index === 0 ? 'text-bold text-negative' : ''">
                        {{ (time.calcu as any)[ENUM_ORDER.SALES]?.count }} 张
                    </span>
                </div>
            </q-card-section>

            <q-inner-loading :showing="AnalysisStore.loadding">
                <q-spinner-gears size="50px" color="primary" />
            </q-inner-loading>
        </q-card>
    </div>

    <div class="row">
        <div class="col q-pr-md">
            <!-- <div class="text-h5 text-primary text-weight-bold q-mb-md q-pl-xs">仓库</div>
            <q-card class="q-mb-md text-body1 full-width full-height text-primary">
                <q-card-section>
                    <div class="text-h6 text-weight-bold">进项</div>
                    <div class="text-caption">
                        <span>{{ new Date().toLocaleString().split(" ")[0] }}</span>
                        ~
                        <span>{{ new Date().toLocaleString().split(" ")[0] }}</span>
                    </div>
                </q-card-section>
                <q-separator />
                <q-card-section class="text-primary">
                    <div class="row">
                        <span class="col">累计收款</span>
                        <span class="col text-right">
                            <span class="cursor-pointer" @click="">2000万</span>
                        </span>
                    </div>
                    <div class="row">
                        <span class="col">开出发票</span>
                        <span class="col text-right" @click="">
                            <span class="cursor-pointer">2000万</span>
                        </span>
                    </div>
                </q-card-section>

                <q-inner-loading :showing="AnalysisStore.loadding">
                    <q-spinner-gears size="50px" color="primary" />
                </q-inner-loading>
            </q-card> -->
        </div>
        <div class="col q-pr-md">
            <!-- <div class="text-h5 text-primary text-weight-bold q-mb-md q-pl-xs">财务</div>
            <q-card class="q-mb-md text-body1 full-width full-height text-primary">
                <q-card-section>
                    <div class="text-h6 text-weight-bold">进项</div>
                    <div class="text-caption">
                        <span>{{ new Date().toLocaleString().split(" ")[0] }}</span>
                        ~
                        <span>{{ new Date().toLocaleString().split(" ")[0] }}</span>
                    </div>
                </q-card-section>
                <q-separator />
                <q-card-section class="text-primary">
                    <div class="row">
                        <span class="col">累计收款</span>
                        <span class="col text-right">
                            <span class="cursor-pointer" @click="">2000万</span>
                        </span>
                    </div>
                    <div class="row">
                        <span class="col">开出发票</span>
                        <span class="col text-right" @click="">
                            <span class="cursor-pointer">2000万</span>
                        </span>
                    </div>
                </q-card-section>

                <q-inner-loading :showing="AnalysisStore.loadding">
                    <q-spinner-gears size="50px" color="primary" />
                </q-inner-loading>
            </q-card> -->
        </div>
        <div class="col q-pr-md"></div>
        <div class="col">
            <div class="text-h5 text-primary text-weight-bold q-mb-md q-pl-xs">快速操作</div>
            <div class="q-pb-md">
                <q-btn class="full-width q-mb-sm text-body1" color="negative" square @click="$router.push('/wmss/trade/sale-create')">
                    <span>代客下单</span>
                </q-btn>
                <q-btn class="full-width q-mb-sm text-body1" square @click="$router.push('/wmss/system/corp')">
                    系统设置
                    <q-tooltip class="text-body1" anchor="center right" self="center right">
                        <div>* 前往修改公司信息</div>
                        <div>* 前往修改系统公告</div>
                    </q-tooltip>
                </q-btn>
                <!-- <q-btn class="full-width q-mb-sm" square >
                    资金/发票
                    <q-tooltip class="text-body1">
                        <div>* 您可以使用资金对某些订单进行结清</div>
                        <div>* 您也可以直接对某笔订单录入资金</div>
                        <div>* 您将会看到每笔订单的结清情况</div>
                        <div>* 您将会看到每笔资金的发票情况</div>
                    </q-tooltip>
                </q-btn> -->
                <q-btn disable class="full-width q-mb-sm text-body1" square color="primary" flat>
                    小程序商城 (敬请期待)
                    <q-tooltip class="text-body1" anchor="center right" self="center right">
                        <div>* 您的客户可以在微信小程序中，直接向您下单</div>
                        <div>* 您的客户将会直接向您的银行卡账户进行付款</div>
                    </q-tooltip>
                </q-btn>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { onMounted, ref, computed } from "vue";

import { ENUM_ORDER } from "qqlx-core";
import { getTimeGap, getRangeDay, getRangeWeek, getRangeMonth, getRangeYear } from "qqlx-cdk";

import { useCabinetStore } from "@/stores/wmss/cabinet";
import { useAnnounceStore } from "@/stores/brand/announce";
import { useAnalysisStore } from "@/stores/wmss/analysis";

const AnalysisStore = useAnalysisStore();
const AnnounceStore = useAnnounceStore();
const CabinetStore = useCabinetStore();

// vue
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

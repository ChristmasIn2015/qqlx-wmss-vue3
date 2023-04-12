<template>
    <div class="q-pl-xs q-mb-md">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <q-btn icon="arrow_back" fab flat style="margin-left: -12px" @click="$router.push('/wmss')"></q-btn>
            <span>礼品卡</span>
        </div>
        <div class="text-option text-primary q-mb-sm">
            您正在选购礼品卡，购买后将会增加
            <span class="text-negative text-weight-bold q-mx-sm">@{{ CorpStore.picked?.name }}</span>
            的使用期。
        </div>
    </div>

    <!-- 卡片列表 -->
    <div class="row">
        <q-card v-for="card in ScheduleCardStore.list.filter((e) => e.isDisabled === false)" class="w-325 q-mr-md q-mb-md shadow-15">
            <q-card-section>
                <div class="text-h6 ellipsis">{{ card.title }}</div>
                <div class="text-grey ellipsis">{{ card.desc || "-" }}</div>
                <q-separator class="q-my-sm"></q-separator>
                <div class="text-grey">
                    <div class="row">
                        <div class="col">时长</div>
                        <div class="col text-right">{{ card.schedule / 86400000 }} 天</div>
                    </div>
                    <div class="row items-end">
                        <div class="col">金额</div>
                        <div class="col text-right text-negative text-h6 text-weight-bold">{{ card.amount }} 元</div>
                    </div>
                </div>
            </q-card-section>
            <q-card-actions>
                <q-space></q-space>
                <q-btn color="negative" :loading="ScheduleCardOrderStore.loadding" push square @click="ScheduleCardOrderStore.post(card)">购买</q-btn>
            </q-card-actions>
        </q-card>
    </div>

    <div class="q-pl-xs q-mb-md q-mt-lg">
        <div class="text-h5 text-primary text-weight-bold">购买记录</div>
    </div>
    <q-table
        class="w-1000"
        dense
        row-key="_id"
        :columns="[
            { name: 'timeCreateString', field: 'timeCreateString', label: '生效时间', align: 'left', style: 'font-size: 16px;' },
            { name: 'title', field: 'title', label: '商品名称', align: 'left', style: 'font-size: 16px;' },
            { name: 'desc', field: 'desc', label: '描述', align: 'left', style: 'font-size: 16px;' },
            { name: 'schedule', field: 'schedule', label: '含时长', align: 'right', style: 'font-size: 16px;' },
            { name: 'amount', field: 'amount', label: '支付金额', align: 'right', style: 'font-size: 16px;' },
            { name: 'status', field: 'status', label: '支付状态', align: 'right', style: 'font-size: 16px;' },
        ]"
        :loading="ScheduleCardOrderStore.loadding"
        :rows="ScheduleCardOrderStore.list"
        :rows-per-page-options="[ScheduleCardOrderStore.page.pageSize]"
    >
        <template v-slot:body="props">
            <q-tr>
                <q-td key="timeCreateString" :props="props"> {{ props.row.timeCreateString }} </q-td>
                <q-td key="title" :props="props"> {{ props.row.joinCard?.title }} </q-td>
                <q-td key="desc" :props="props"> {{ props.row.joinCard?.desc }} </q-td>
                <q-td key="schedule" :props="props"> {{ props.row.joinCard?.schedule / 86400000 }} 天</q-td>
                <q-td key="amount" :props="props"> {{ props.row.amount }} 元 </q-td>
                <q-td key="status" :props="props"> {{ MAP_ENUM_PAY_STATUS_WECHAT.get(props.row.statusWeChatPay)?.text }} </q-td>
            </q-tr>
        </template>
    </q-table>

    <q-dialog v-model="ScheduleCardOrderStore.dialog" persistent>
        <q-card class="w-600">
            <q-card-section>
                <div class="text-h5 text-weight-bold">购买时长</div>
                <div class="text-caption text-grey">
                    <div>您正在为 @{{ CorpStore.picked?.name }} 进行时长充值，打开手机微信APP，扫描下方二维码即可进行支付</div>
                </div>
            </q-card-section>
            <q-card-section class="text-center q-py-none">
                <q-img width="200px" :src="ScheduleCardOrderStore.WeChatPayUrl"></q-img>
            </q-card-section>
            <q-card-section class="text-center q-pt-none">
                <q-img width="100px" src="https://wx.gtimg.com/outwxgtimg/imgs/logo/wxpaylogo_xxxhdpi.png"></q-img>
            </q-card-section>
            <q-card-actions>
                <q-space></q-space>
                <q-btn v-close-popup @click="ScheduleCardOrderStore.get(1)">取消</q-btn>
                <q-btn v-close-popup color="positive" @click="ScheduleCardOrderStore.get(1)">我已完成支付</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { MAP_ENUM_PAY_STATUS_WECHAT } from "qqlx-core";

import { useCorpStore } from "@/stores/brand/corp";
import { useScheduleCardStore } from "@/stores/market/scheduleCard";
import { useScheduleCardOrderStore } from "@/stores/market/scheduleCardOrder";
import { useMarketScoAnalysisStore } from "@/stores/market/analysis";

const CorpStore = useCorpStore();
const ScheduleCardStore = useScheduleCardStore();
const ScheduleCardOrderStore = useScheduleCardOrderStore();
const MarketScoAnalysisStore = useMarketScoAnalysisStore();

// action
onMounted(() => {
    ScheduleCardStore.get();
    ScheduleCardOrderStore.get(1);
});
</script>

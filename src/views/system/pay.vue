<template>
	<div class="q-pt-md q-pb-lg">
		<div class="text-h4 text-white text-weight-bold">支付中心</div>
		<div class="text-white q-pt-sm">
			<div>
				您正在为 @{{ CorpStore.corpPicked?.name }}
				<span class="text-positive">{{ scheduleString }}</span>
				，进行时长充值；
			</div>
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
					<div class="row">
						<div class="col">金额</div>
						<div class="col text-right">{{ card.amount }} 元</div>
					</div>
				</div>
			</q-card-section>
			<q-card-actions>
				<q-space></q-space>
				<q-btn color="negative" :loading="ScheduleCardOrderStore.loadding" push square @click="ScheduleCardOrderStore.post(card)">购买</q-btn>
			</q-card-actions>
		</q-card>
	</div>

	<div class="q-pt-md q-pb-lg">
		<div class="text-h5 text-dark text-weight-bold">购买记录</div>
	</div>
	<q-table
		class="w-1000"
		dense
		row-key="_id"
		:columns="[
			{ name: 'timeCreateString', field: 'timeCreateString', label: '生效时间', align: 'left' },
			{ name: 'title', field: 'title', label: '商品名称', align: 'left' },
			{ name: 'desc', field: 'desc', label: '描述', align: 'left' },
			{ name: 'schedule', field: 'schedule', label: '含时长', align: 'right' },
			{ name: 'amount', field: 'amount', label: '支付金额', align: 'right' },
			{ name: 'status', field: 'status', label: '支付状态', align: 'right' },
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
				<q-td key="status" :props="props"> {{ MAP_ENUM_PAY_STATUS_WECHAT.find((e) => e.value === props.row.statusWeChatPay)?.text }} </q-td>
			</q-tr>
		</template>
	</q-table>

	<q-dialog v-model="ScheduleCardOrderStore.dialog" persistent>
		<q-card class="w-600">
			<q-card-section>
				<div class="text-h5 text-weight-bold">购买时长</div>
				<div class="text-caption text-grey">
					<div>您正在为 @{{ CorpStore.corpPicked?.name }} 进行时长充值，打开手机微信APP，扫描下方二维码即可进行支付</div>
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
import { Notify, useQuasar } from "quasar";
import { ENUM_ROLE_WMSS, MAP_ENUM_ROLE_WMSS, MAP_ENUM_PAY_STATUS_WECHAT } from "qqlx-core";
import type { RoleWMSSJoined } from "qqlx-core/dto/wmss/role";

import { getTimeGap } from "@/utils";
import { useNotifyStore } from "@/stores/notify";
import { useUserStore } from "@/stores/user";
import { useCorpStore } from "@/stores/corp";
import { useScheduleCardStore } from "@/stores/scheduleCard";
import { useScheduleCardOrderStore } from "@/stores/scheduleCardOrder";
import { useAnalysisStore } from "@/stores/analysis";

const NotifyStore = useNotifyStore();
const CorpStore = useCorpStore();
const ScheduleCardStore = useScheduleCardStore();
const ScheduleCardOrderStore = useScheduleCardOrderStore();
const AnalysisStore = useAnalysisStore();

// action
const scheduleString = computed({
	get() {
		const now = Date.now();
		const last = AnalysisStore.lastActiveScheduleCardOrder;
		const deadline = last ? last.timeCreate + (last.joinCard?.schedule || 0) : 0;
		return now > deadline ? "已过期" : "剩余 " + getTimeGap(deadline, now);
	},
	set() {},
});
onMounted(() => {
	ScheduleCardStore.get();
	ScheduleCardOrderStore.get(1);
});
</script>

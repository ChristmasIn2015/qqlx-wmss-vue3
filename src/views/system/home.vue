<template>
	<div class="row q-pt-xl q-mt-xl items-stretch">
		<!-- 基础信息 -->
		<!-- 基础信息 -->
		<div class="w-350">
			<q-card class="w-325 q-mr-md q-mb-md text-body1 full-height bg-grey-11">
				<q-card-section class="text-h5 text-weight-bold">
					<span>基础信息</span>
				</q-card-section>
				<q-separator />
				<q-card-section>
					<div class="row">
						<span class="col">公司</span>
						<span class="col-10 text-primary text-right text-underline cursor-pointer" @click="router.push('/wmss/system/corp')">
							<span>{{ CorpStore.corpPicked?.name }}</span>
						</span>
					</div>
					<div class="row text-grey">
						<span class="col">您的使用数据，如订单信息、库存信息等，都将会保存在其中</span>
					</div>
				</q-card-section>
				<q-card-section class="">
					<div class="row">
						<span class="col">有效期</span>
						<span class="col-8 text-primary text-right text-underline cursor-pointer" @click="router.push('/wmss/system/pay')">
							{{ scheduleString }}
						</span>
					</div>
					<div class="row text-grey">
						<span class="col">在有效期内，你可以创建销售、采购订单、仓库订单，结清订单开具发票等...</span>
					</div>
				</q-card-section>

				<q-inner-loading :showing="AnalysisStore.loadding">
					<q-spinner-gears size="50px" color="primary" />
				</q-inner-loading>
			</q-card>
		</div>

		<!-- 指标 -->
		<!-- 指标 -->
		<div class="w-350">
			<q-card class="w-325 q-mr-md q-mb-md text-body1 full-height">
				<q-card-section class="text-h5 text-weight-bold">
					<span>经营指标</span>
				</q-card-section>
				<q-separator />
				<q-card-section>
					<div class="row">
						<span class="col">指标范围</span>
						<span class="col-8 text-primary text-right text-underline cursor-pointer">
							<span v-if="AnalysisStore.timeQuasarPicked">
								{{ AnalysisStore.timeQuasarPicked?.from }} ~ {{ AnalysisStore.timeQuasarPicked?.to }}
							</span>
							<span v-else>请重新选择日期</span>
							<q-menu>
								<q-date
									range
									minimal
									no-unset
									color="primary"
									first-day-of-week="1"
									v-model="AnalysisStore.timeQuasarPicked"
									@update:model-value="AnalysisStore.timeChange"
								/>
							</q-menu>
						</span>
					</div>
					<div class="row text-grey">
						<span class="col">使用关键指标，简单分析经营情况</span>
					</div>
				</q-card-section>
				<q-separator />
				<q-separator />
				<q-card-section>
					<div class="row text-weight-bold">
						<span class="col">销售额</span>
						<span class="col text-right text-pink-6 text-underline cursor-pointer" @click="router.push('/wmss/trade/order-list')">
							{{ AnalysisStore.orderAnalysis?.amountSaleOrder.toFixed(0) }} 万元
						</span>
					</div>
					<div class="row items-center">
						<span class="col">订单数量</span>
						<span class="col text-right"> {{ AnalysisStore.orderAnalysis?.countSaleOrder }} 张</span>
					</div>
				</q-card-section>
				<q-card-section>
					<div class="row text-weight-bold">
						<span class="col">收款合计</span>
						<span class="col text-right text-teal text-underline cursor-pointer" @click="router.push('/wmss/finance/book')">
							{{ AnalysisStore.orderAnalysis?.amountBook_1122_DAI.toFixed(0) }} 万元
						</span>
					</div>
					<div class="row">
						<span class="col">已开发票</span>
						<span class="col text-right"> {{ AnalysisStore.orderAnalysis?.amountInvoice_1122_JIE.toFixed(0) }} 万元</span>
					</div>
				</q-card-section>

				<q-inner-loading :showing="AnalysisStore.loadding">
					<q-spinner-gears size="50px" color="primary" />
				</q-inner-loading>
			</q-card>
		</div>

		<!-- 指标 -->
		<!-- 指标 -->
		<div class="w-350">
			<q-card class="w-325 q-mr-md q-mb-md text-body1 full-height">
				<q-card-section class="text-h5 text-weight-bold">
					<div>仓库数据</div>
				</q-card-section>
				<q-separator />
				<q-card-section>
					<div class="row text-weight-bold">
						<span class="col">待处理商品</span>
						<span class="col text-right text-indigo-14 text-underline cursor-pointer" @click="router.push('/wmss/warehouse/sku-list')">
							{{ skuNotConfirmedAll }} 项
						</span>
					</div>
					<div class="text-grey">如待发货的大件商品等</div>
				</q-card-section>
				<q-separator />
				<q-separator />
				<q-card-section>
					<div class="row text-weight-bold">
						<span class="col">发货单</span>
						<span class="col text-right text-indigo-14 text-underline cursor-pointer" @click="router.push('/wmss/warehouse/order-list')">
							{{ AnalysisStore.orderAnalysis?.countGetOutOrder }} 张
						</span>
					</div>
					<div class="row items-center">
						<span class="col">入库单</span>
						<span class="col text-right"> {{ AnalysisStore.orderAnalysis?.countGetInOrder }} 张 </span>
					</div>
				</q-card-section>
				<q-card-section>
					<div class="row text-weight-bold">
						<span class="col">加工单</span>
						<span class="col text-right text-indigo-14 text-underline cursor-pointer" @click="router.push('/wmss/warehouse/order-list')">
							{{ AnalysisStore.orderAnalysis?.countProcessOrder }} 张
						</span>
					</div>
					<div class="row items-center">
						<span class="col">领料单</span>
						<span class="col text-right"> {{ AnalysisStore.orderAnalysis?.countMaterialOrder }} 张 </span>
					</div>
				</q-card-section>

				<q-inner-loading :showing="AnalysisStore.loadding">
					<q-spinner-gears size="50px" color="primary" />
				</q-inner-loading>
			</q-card>
		</div>
	</div>

	<div class="row q-pt-sm q-mt-xl items-stretch">
		<div class="w-350">
			<q-card class="w-325 column q-mr-md q-mb-md text-body1 full-height bg-grey-11">
				<q-card-section class="text-h5 text-weight-bold">
					<span>其他设置</span>
				</q-card-section>
				<q-separator />
				<q-card-section>
					<q-input
						v-for="(title, index) in ConfigCorp.titles"
						dense
						filled
						clearable
						class="q-mb-sm"
						clear-icon="close"
						label="请输入公司别称"
						input-class="text-body1"
						v-model="title.text"
					>
						<template v-slot:after>
							<q-btn v-if="index === 0" dense fab icon="add" flat @click="ConfigCorp.titles.push({ text: '' })"></q-btn>
							<q-btn v-else dense fab icon="remove" text-color="negative" flat @click="ConfigCorp.titles.splice(index, 1)"></q-btn>
						</template>
					</q-input>
					<div class="text-body2 text-grey q-pl-sm">订单打印时，公司别称将出现在顶部</div>
				</q-card-section>
				<q-space></q-space>
				<q-separator />
				<q-card-section class="q-pb-none">
					<div class="row">
						<span class="col">提货仓库</span>
						<span class="col-8 text-primary text-right text-underline cursor-pointer">
							<span @click="router.push('/wmss/system/warehouse')">去查看</span>
						</span>
					</div>
				</q-card-section>
				<q-separator />
				<q-card-actions>
					<q-space></q-space>
					<q-btn color="negative" @click="ConfigCorp.post()">应用</q-btn>
				</q-card-actions>

				<q-inner-loading :showing="ConfigCorp.loadding">
					<q-spinner-gears size="50px" color="primary" />
				</q-inner-loading>
			</q-card>
		</div>

		<!-- 公告 -->
		<!-- 公告 -->
		<div class="w-700">
			<q-card class="q-mr-md q-mb-md text-body1 full-height">
				<q-card-section class="text-h5 text-weight-bold">
					<span>店铺公告</span>
				</q-card-section>
				<q-separator />
				<q-card-section>
					<q-input
						v-for="(ann, index) in Announce.list"
						dense
						filled
						clearable
						class="q-mb-sm"
						clear-icon="close"
						label="请输入公告"
						input-class="text-body1"
						v-model="ann.content"
						@blur="Announce.patch(ann)"
					>
						<template v-slot:after>
							<q-btn v-if="index === 0" dense fab icon="add" flat @click="Announce.post()"></q-btn>
							<q-btn v-else dense fab icon="remove" text-color="negative" flat @click="Announce.delete(ann)"></q-btn>
						</template>
					</q-input>
					<div class="text-body2 text-grey q-pl-sm">订单打印时，公司别称将出现在顶部</div>
				</q-card-section>

				<q-inner-loading :showing="AnalysisStore.loadding">
					<q-spinner-gears size="50px" color="primary" />
				</q-inner-loading>
			</q-card>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { onMounted, ref, computed } from "vue";
import { ENUM_ROLE_WMSS, MAP_ENUM_ROLE_WMSS } from "qqlx-core";

import { getTimeGap } from "@/utils";
import { useNotifyStore } from "@/stores/notify";
import { useUserStore } from "@/stores/user";
import { useCorpStore } from "@/stores/corp";
import { useWarehouseStore } from "@/stores/warehouse";
import { useConfigCorp } from "@/stores/configCorp";
import { useAnnounce } from "@/stores/announce";
import { useAnalysisStore } from "@/stores/analysis";

const router = useRouter();
const CorpStore = useCorpStore();
const AnalysisStore = useAnalysisStore();
const ConfigCorp = useConfigCorp();
const Announce = useAnnounce();

// vue
const scheduleString = computed({
	get() {
		const now = Date.now();
		const last = AnalysisStore.analysis?.lastActiveScheduleCardOrder;
		const deadline = last ? last.timeCreate + (last.joinCard?.schedule || 0) : 0;
		return now > deadline ? "已过期" : `剩余 ${getTimeGap(deadline, now)}`;
	},
	set() {},
});
const skuNotConfirmedAll = computed({
	get() {
		let count = 0;
		AnalysisStore.analysis?.skuNotConfirmed.map((e) => (count += e.count));
		return count;
	},
	set() {},
});
onMounted(() => AnalysisStore.getOrder());
</script>

<style scoped lang="scss"></style>

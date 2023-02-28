<template>
	<div class="row q-pt-xl q-mt-xl items-stretch">
		<!-- 基础信息 -->
		<!-- 基础信息 -->
		<div class="w-350">
			<q-card class="w-325 q-mr-md q-mb-md text-body1 full-height">
				<q-card-section class="text-h5 text-weight-bold">
					<span>基础信息</span>
				</q-card-section>
				<q-separator />
				<q-card-section class="q-pb-none">
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
				<q-card-section class="q-pb-none">
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
				<q-separator />
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
					<div>仓库指标</div>
					<div class="text-body1">
						查看

						<span class="text-underline cursor-pointer text-primary" @click="router.push('/wmss/system/warehouse')">仓库列表</span>
					</div>
				</q-card-section>
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
				<q-separator />
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
				<q-separator />
				<q-card-section>
					<div class="row text-weight-bold">
						<span class="col">待处理</span>
						<span class="col text-right text-indigo-14 text-underline cursor-pointer" @click="router.push('/wmss/warehouse/sku-list')">
							{{ skuNotConfirmedAll }} 项
						</span>
					</div>
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
import { useRoleWMSSStore } from "@/stores/role";
import { useAnalysisStore } from "@/stores/analysis";

const router = useRouter();
const CorpStore = useCorpStore();
const WarehouseStore = useWarehouseStore();
const AnalysisStore = useAnalysisStore();

const showCorpDisabled = ref(false);
const dialogCorp = ref(false);
const showWarehouseDisabled = ref(false);
const dialogWarehouse = ref(false);

const dialogRoleWMSS = ref(false);

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

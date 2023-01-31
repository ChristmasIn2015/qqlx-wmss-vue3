<template>
	<v-card>
		<v-row>
			<v-col>
				<v-tabs bg-color="amber" v-model="tab">
					<v-tab value="create">创建领料单</v-tab>
					<v-tab value="list">领料单列表</v-tab>
				</v-tabs>
			</v-col>
		</v-row>

		<v-window v-model="tab">
			<v-window-item value="create">
				<sku-input />

				<div class="mt-2"></div>
				<v-card class="d-flex pa-2">
					<v-spacer></v-spacer>
					<v-btn color="amber" class="ml-2" @click="postOrder()"> 开单 {{ SkuStore.skuListPicked.length }} 项 </v-btn>
				</v-card>

				<div class="mt-2"></div>
				<cabinet-unit-input />
			</v-window-item>

			<v-window-item value="list">
				<v-row class="pa-2">
					<v-col> </v-col>
					<v-col class="text-end">
						<el-date-picker
							class="ml-2"
							v-model="dateRange"
							type="daterange"
							unlink-panels
							range-separator="To"
							start-placeholder="开始时间"
							end-placeholder="结束时间"
							size="large"
						/>
						<v-btn
							class="mt-n2 ml-2"
							color="amber"
							@click="
								() => {
									SkuStore.setSchema(ENUM_ORDER_TYPE.MATERIAL);
									SkuStore.dialogList = true;
								}
							"
						>
							<v-icon icon="mdi-view-list" class="ml-n1"></v-icon>
							<span class="ml-1">商品明细</span>
						</v-btn>
					</v-col>
				</v-row>

				<v-expansion-panels variant="accordion" readonly>
					<v-expansion-panel bg-color="grey-lighten-4">
						<v-expansion-panel-title class="py-0">
							<v-row no-gutters>
								<v-col cols="2" class="pr-4">
									<search-input placeholder="批次" v-model="OrderStore.orderSearch.code" @blur="OrderStore.get(1)" />
								</v-col>
								<v-col cols="2" class="pt-5">时间</v-col>
								<v-col cols="1" class="pt-5">备注</v-col>
							</v-row>
							<template v-slot:actions>
								<v-sheet width="25"></v-sheet>
							</template>
						</v-expansion-panel-title>
					</v-expansion-panel>
				</v-expansion-panels>

				<v-expansion-panels variant="accordion" class="rounded-0">
					<v-expansion-panel v-for="order in OrderStore.orderList">
						<v-expansion-panel-title class="py-0">
							<v-row no-gutters>
								<v-col cols="2" class="line-28">
									<div>{{ order.code }}</div>
								</v-col>
								<v-col cols="2" class="line-28">{{ order.timeCreateString }} </v-col>
								<v-col cols="1">
									<v-menu :close-on-content-click="false">
										<template v-slot:activator="{ props }">
											<v-btn v-bind="props" class="ml-n3" variant="text" size="small" @click.stop>{{
												order.remark || "点击修改备注"
											}}</v-btn>
										</template>
										<v-card width="350" color="grey-lighten-1">
											<v-card-text>
												<v-text-field
													v-model="order.remark"
													placeholder="请输入备注"
													density="compact"
													variant="solo"
													r
													hide-details
													@blur="
														async () => {
															OrderStore.orderEditor = order;
															OrderStore.put();
														}
													"
												>
												</v-text-field>
											</v-card-text>
										</v-card>
									</v-menu>
								</v-col>
							</v-row>
						</v-expansion-panel-title>

						<!-- 展开 -->
						<!-- 展开 -->
						<!-- 展开 -->
						<!-- 展开 -->
						<v-expansion-panel-text>
							<div class="d-flex">
								<v-spacer></v-spacer>
								<v-btn variant="elevated" class="ml-2 text-red" @click="OrderStore.disable(order)">{{
									order.isDisabled ? "恢复" : "删除"
								}}</v-btn>
								<v-btn
									variant="elevated"
									class="ml-2"
									:disabled="order.isDisabled"
									@click="
										() => {
											SkuStore.skuListPicked = cloneDeep(order.joinSku || []);
											SubjectContactStore.subjectContactPicked = order.joinContact || SubjectContactStore.getSchema();
											OrderStore.orderEditor = order;
											OrderStore.dialogPut = true;
										}
									"
								>
									编辑
								</v-btn>
							</div>
							<div class="d-flex mt-2">
								<v-sheet width="100%" class="mr-2" border>
									<v-table density="compact">
										<thead>
											<tr>
												<th width="155">品名</th>
												<th width="188">规格</th>
												<th width="120" class="text-right">数量</th>
												<th width="120" class="text-right">过磅</th>
												<th width="120" class="text-right">单价</th>
												<th>备注</th>
											</tr>
										</thead>

										<tbody>
											<tr v-for="(sku, index) in order.joinSku || []">
												<td>{{ sku.name }}</td>
												<td>{{ sku.norm }}</td>
												<td class="text-right">{{ sku.count }} {{ sku.unit }}</td>
												<td class="text-right">{{ sku.isPriceInPounds ? sku.pounds.toFixed(3) + " 吨" : "" }}</td>
												<td class="text-right">{{ sku.price.toFixed(2) }}</td>
												<td>{{ sku.remark }}</td>
											</tr>
										</tbody>
									</v-table>
								</v-sheet>
								<v-card class="ml-auto" width="350">
									<v-card-title>签字信息</v-card-title>
									<v-card-text class="text-grey">
										<v-row no-gutters>
											<v-col>创建人</v-col>
											<v-col class="text-right">{{ order.joinCreator?.nickname }}</v-col>
										</v-row>
									</v-card-text>
								</v-card>
							</div>
						</v-expansion-panel-text>
					</v-expansion-panel>
				</v-expansion-panels>

				<v-row no-gutters class="pt-4 pb-2">
					<v-col>
						<v-pagination
							v-model="OrderStore.page.page"
							:length="Math.ceil(OrderStore.total / OrderStore.page.pageSize)"
							@update:model-value="OrderStore.get($event)"
						></v-pagination>
					</v-col>
				</v-row>
			</v-window-item>
		</v-window>
	</v-card>

	<!-- 编辑弹窗 -->
	<v-dialog v-model="OrderStore.dialogPut" fullscreen transition="dialog-bottom-transition" scrollable>
		<v-card>
			<v-toolbar color="primary">
				<v-toolbar-title>编辑订单</v-toolbar-title>
				<v-spacer></v-spacer>
				<v-btn
					icon="mdi-close"
					@click="
						() => {
							SubjectContactStore.setSchema();
							SkuStore.setSchema();
							OrderStore.setSchema(ENUM_ORDER_TYPE.MATERIAL);
							OrderStore.dialogPut = false;
						}
					"
				></v-btn>
			</v-toolbar>

			<v-card-text>
				<div class="mt-4"></div>
				<sku-input />

				<div class="mt-2"></div>
				<v-card class="d-flex pa-2">
					<v-spacer></v-spacer>
					<v-btn color="primary" class="ml-2" @click="putOrder()"> 保存 {{ SkuStore.skuListPicked.length }} 项 </v-btn>
				</v-card>

				<div class="mt-2"></div>
				<cabinet-unit-input />
			</v-card-text>
		</v-card>
	</v-dialog>
</template>

<script lang="ts" setup>
import { onMounted, computed, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { cloneDeep, debounce } from "lodash";

import { ENUM_ORDER_TYPE, ENUM_SUBJECT_TYPE } from "qqlx-core";
import { SubjectContact } from "qqlx-core/brand/entity";
import { SkuJoined } from "qqlx-core/wmss/sku/dto";
import { Order } from "qqlx-core/wmss/order/entity";

import { useSnackbarStore } from "@/store/snackbar";
import { useUserStore } from "@/store/user";
import { useSubjectContactStore } from "@/store/subjectContact";
import { useSkuStore } from "@/store/sku";
import { useOrderStore } from "@/store/order";

import cabinetUnitInput from "@/components/cabinet-unit-input.vue";
import skuInput from "@/components/sku-input.vue";

const tab = ref("create");
const router = useRouter();
const SnackbarStore = useSnackbarStore();
const UserStore = useUserStore();
const SubjectContactStore = useSubjectContactStore();
const SkuStore = useSkuStore();
const OrderStore = useOrderStore();
const debounceOrderGet = debounce(() => OrderStore.get(), 500);
const debounceContactGet10 = debounce(() => SubjectContactStore.get10(), 255);

const dateRange = computed({
	get() {
		const start = OrderStore.page.startTime;
		const end = OrderStore.page.endTime;
		return [new Date(start), new Date(end)];
	},
	set(dates: Date[]) {
		if (dates && dates.length === 2) {
			OrderStore.page.startTime = dates[0].getTime();

			const end = dates[1];
			end.setHours(23);
			end.setMinutes(59);
			end.setSeconds(59);
			OrderStore.page.endTime = end.getTime();
			OrderStore.get(1);
		}
	},
});

const postOrder = async () => {
	try {
		OrderStore.setSchema(ENUM_ORDER_TYPE.MATERIAL);
		const schema = OrderStore.getSchema(ENUM_ORDER_TYPE.MATERIAL);
		OrderStore.orderEditor = schema;
		await OrderStore.post(SkuStore.skuListPicked);

		SkuStore.setSchema();
		OrderStore.setSchema(ENUM_ORDER_TYPE.MATERIAL);
		await OrderStore.get(1);

		tab.value = "list";
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
};

const putOrder = async () => {
	try {
		const code = OrderStore.orderEditor.code;
		await OrderStore.put(SkuStore.skuListPicked);

		SubjectContactStore.setSchema();
		SkuStore.setSchema();
		OrderStore.setSchema(ENUM_ORDER_TYPE.MATERIAL);
		OrderStore.orderSearch.code = code;
		await OrderStore.get(1);

		OrderStore.dialogPut = false;
		tab.value = "list";
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
};

onMounted(async () => {
	try {
		SubjectContactStore.setSchema();
		SkuStore.setSchema();
		OrderStore.managerIdRequired = false;
		OrderStore.accounterIdIdRequired = false;
		OrderStore.setSchema(ENUM_ORDER_TYPE.MATERIAL);
		await OrderStore.get(1);
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
});
</script>

<style>
.line-28 {
	line-height: 30px;
}
</style>

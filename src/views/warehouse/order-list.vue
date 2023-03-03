<template>
	<div class="q-pt-md q-pb-lg text-white">
		<div class="text-h4 text-weight-bold">仓库订单</div>
		<div class="q-pt-sm">
			<div>
				1.仓库订单将会影响
				<span class="text-negative cursor-pointer" @click="router.push('/wmss/warehouse/cabinet')">商品分类</span>
				上统计的商品库存，如发货、入库、领料、加工单
			</div>
			<div>* 发货单，将会减少您的商品库存统计</div>
			<div>* 领料单，需要您手动选择待领料的在库商品，领料后仅将会减少此商品的库存统计</div>
			<div>* 入库单、加工单，都将会 <span class="text-positive">增加</span> 您的商品库存统计</div>
		</div>
	</div>

	<div class="row q-mb-sm">
		<q-btn-toggle
			push
			square
			color="white"
			class="q-mr-sm"
			text-color="grey"
			toggle-color="indigo-14"
			v-model="OrderStore.orderSearch.type"
			:options="[
				{ label: '发货单', value: ENUM_ORDER.GETOUT },
				{ label: '入库单', value: ENUM_ORDER.GETIN },
				{ label: '领料单', value: ENUM_ORDER.MATERIAL },
				{ label: '加工单', value: ENUM_ORDER.PROCESS },
			]"
			@update:model-value="
				(value) => {
					init(value, true);
				}
			"
		>
		</q-btn-toggle>

		<q-btn
			push
			square
			class="q-mr-sm"
			label="最近删除"
			:color="OrderStore.orderSearch.isDisabled ? 'indigo-14' : 'white'"
			:text-color="OrderStore.orderSearch.isDisabled ? '' : 'grey'"
			@click="
				() => {
					OrderStore.orderSearch.isDisabled = !OrderStore.orderSearch.isDisabled;
					OrderStore.getOrderInView(1);
				}
			"
		/>

		<q-space></q-space>
		<q-btn
			push
			square
			color="negative"
			class="text-body1 q-ml-sm"
			:loading="OrderStore.loadding"
			@click="
				() => {
					OrderStore.setSchema(OrderStore.getSchema(nowType));
					router.push('/wmss/warehouse/order-create');
				}
			"
		>
			继续添加
		</q-btn>
		<q-btn color="white" text-color="black" class="text-body1 q-ml-sm">
			<q-icon name="date_range" class="q-mr-xs" style="margin-bottom: -4px"></q-icon>
			{{ timePicked.from }} ~ {{ timePicked.to }}
			<q-menu>
				<q-date v-model="timePicked" range first-day-of-week="1" color="indigo-14" @update:model-value="timeChange" />
			</q-menu>
		</q-btn>
	</div>

	<q-card>
		<q-table
			style="min-height: 400px"
			dense
			row-key="_id"
			:columns="[
				{ name: 'code', field: 'code', label: '批次', align: 'left', style: 'font-size: 16px; width: 150px;' },
				{ name: 'contactId', field: 'contactId', label: '客户名称', align: 'left', style: 'font-size: 16px; width: 188px;' },
				{ name: 'amount', field: 'amount', label: '金额', style: 'font-size: 16px; width: 188px;' },
				{ name: 'pounds', field: 'pounds', label: '来源', align: 'left', style: 'font-size: 16px; width: 188px;' },
				{ name: 'timeCreateString', field: 'timeCreateString', label: '时间', align: 'left', style: 'font-size: 16px; width: 188px;' },
				{ name: 'remark', field: 'remark', label: '备注', align: 'left', style: 'font-size: 16px;' },
			]"
			:rows="OrderStore.orderList"
			:rows-per-page-options="[OrderStore.page.pageSize]"
		>
			<template v-slot:header="props">
				<q-tr>
					<q-th key="code" :props="props" style="width: 188px">
						<q-input
							square
							filled
							dense
							clearable
							color="indigo-14"
							clear-icon="close"
							placeholder="搜索批次"
							style="margin-left: -6px"
							v-model="OrderStore.orderSearch.code"
							@blur="OrderStore.getOrderInView(1)"
						/>
					</q-th>
					<q-th key="contactId" :props="props" style="width: 188px">
						<q-btn class="q-px-sm" flat square color="indigo-14" @click="contactDialog = true">
							{{ contactPicked._id ? contactPicked.name : "点击筛选客户" }}
						</q-btn>
						<q-btn
							v-if="contactPicked._id"
							flat
							dense
							square
							color="indigo-14"
							class="q-px-sm"
							@click="
								() => {
									contactPicked = ContactStore.getSchema();
									OrderStore.orderSearch.contactId = '';
									OrderStore.getOrderInView(1);
								}
							"
						>
							<q-icon name="close" style="margin-bottom: -4px"></q-icon>
						</q-btn>
					</q-th>
					<q-th class="text-right" key="amount">金额</q-th>
					<q-th class="text-left">来源</q-th>
					<q-th class="text-left">备注</q-th>
					<q-th
						class="text-left cursor-pointer"
						:class="{ 'text-indigo-14': OrderStore.sortKey === 'timeCreate' }"
						@click="OrderStore.sort('timeCreate')"
					>
						<span>时间 </span>
						<q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
					</q-th>
				</q-tr>
			</template>
			<template v-slot:body="props">
				<q-tr
					class="cursor-pointer"
					:props="props"
					:class="{
						'bg-grey-4': props.expand,
					}"
					@click="
						() => {
							props.expand = !props.expand;
						}
					"
				>
					<q-td key="code" :props="props"> {{ props.row.code }} </q-td>
					<q-td key="contactId" :props="props">
						<span v-if="props.row.joinContact?.name" class="ellipsis">{{ props.row.joinContact.name }}</span>
						<span v-else class="text-grey">批量导入</span>
					</q-td>
					<q-td key="amount" :props="props">
						<span v-if="props.row.joinSku?.length > 0" class="text-orange text-weight-bold">{{ props.row.joinSku?.length }}</span>
						<span v-else class="text-grey"> 0</span>
						项
					</q-td>
					<q-td key="pounds" :props="props">
						{{ props.row.joinParentOrder ? `${props.row.joinParentOrder?.code}` : "" }}
					</q-td>
					<q-td key="remark" :props="props">
						<span class="cursor-pointer" :class="props.row.remark ? '' : 'text-grey'">
							{{ props.row.remark || "点击修改备注" }}
							<q-menu anchor="top left" @hide="OrderStore.put(props.row)">
								<q-card class="w-400">
									<q-toolbar class="bg-indigo-14 text-white">
										<q-toolbar-title>修改备注</q-toolbar-title>
										<q-btn dense flat icon="close" v-close-popup></q-btn>
									</q-toolbar>

									<q-card-section>
										<q-input filled :label="props.row.code" v-model="props.row.remark" color="indigo-14"> </q-input>
									</q-card-section>

									<q-card-actions>
										<q-space></q-space>
										<span class="text-grey">自动保存</span>
									</q-card-actions>
								</q-card>
							</q-menu>
						</span>
					</q-td>
					<q-td key="timeCreateString" :props="props">
						{{ props.row.timeCreateString }}
					</q-td>
				</q-tr>

				<q-tr v-show="props.expand">
					<q-td colspan="100%" style="padding: 0">
						<div class="row">
							<div class="col-8">
								<q-table
									dense
									row-key="_id"
									hide-pagination
									separator="vertical"
									:columns="[
										{ name: 'layout', field: 'layout', label: '商品性质', align: 'left' },
										{ name: 'name', field: 'name', label: '品名', align: 'left' },
										{ name: 'norm', field: 'norm', label: '规格', align: 'left' },
										{ name: 'count', field: 'count', label: '数量' },
										{ name: 'pounds', field: 'pounds', label: '过磅' },
										{ name: 'keyFeat', field: 'keyFeat', label: '材质', align: 'left' },
										{ name: 'keyOrigin', field: 'keyOrigin', label: '产地', align: 'left' },
										{ name: 'keyHouse', field: 'keyHouse', label: '仓库', align: 'left' },
										{ name: 'price', field: 'price', label: '单价' },
										{ name: 'remark', field: 'remark', label: '备注', align: 'left' },
										{ name: '_id', field: '_id', label: '当前状态', align: 'left' },
									]"
									:rows-per-page-options="[0]"
									:rows="props.row.joinSku || []"
								>
									<template v-slot:body="_props">
										<q-tr>
											<q-td :_props="_props" style="font-size: 16px"
												><q-badge color="grey" v-if="_props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
													大件商品
													<q-tooltip class="text-body1"> “大件商品”发货时，需要单独选择在库的“大件商品”进行发货</q-tooltip>
												</q-badge>
											</q-td>
											<q-td :_props="_props" style="font-size: 16px">{{ _props.row.name }} </q-td>
											<q-td :_props="_props" style="font-size: 16px">{{ _props.row.norm }}</q-td>
											<q-td :_props="_props" style="font-size: 16px" class="text-right"
												>{{ _props.row.count }} {{ _props.row.unit }}</q-td
											>
											<q-td :_props="_props" style="font-size: 16px" class="text-right">
												<span v-if="_props.row.isPriceInPounds">{{ _props.row.pounds.toFixed(3) }} 吨</span>
											</q-td>
											<q-td :_props="_props" style="font-size: 16px">{{ _props.row.keyFeat || "-" }}</q-td>
											<q-td :_props="_props" style="font-size: 16px">{{ _props.row.keyOrigin || "-" }}</q-td>
											<q-td :_props="_props" style="font-size: 16px">{{ _props.row.keyHouse || "-" }}</q-td>
											<q-td :_props="_props" style="font-size: 16px" class="text-right">{{ _props.row.price.toFixed(2) }}</q-td>
											<q-td :_props="_props" style="font-size: 16px">{{ _props.row.remark }}</q-td>
											<q-td :_props="_props" style="font-size: 16px">
												<span v-if="_props.row.type === ENUM_ORDER.GETOUT">
													<span v-if="_props.row.isConfirmed" class="text-positive">已发货</span>
													<span v-else class="text-negative cursor-pointer" @click="$router.push('/wmss/warehouse/sku-list')">
														去发货
													</span>
												</span>
												<span v-else-if="_props.row.type === ENUM_ORDER.MATERIAL" class="text-negative">
													<span v-if="_props.row.isConfirmed">已扣减</span>
													<span v-else class="cursor-pointer" @click="$router.push('/wmss/warehouse/sku-list')"> 去领料 </span>
												</span>
												<span v-else class="text-grey">
													<span v-if="_props.row.isConfirmed" class="text-positive">已入库</span>
													<span v-else class="text-negative cursor-pointer" @click="$router.push('/wmss/warehouse/sku-list')">
														去入库
													</span>
												</span>
											</q-td>
										</q-tr>
									</template>
								</q-table>
							</div>
							<div class="col-4">
								<q-card>
									<q-card-section>
										<div class="text-h6 text-weight-bold">订单信息</div>
										<q-separator class="q-mt-md q-mb-sm" />
										<div class="text-body1">
											<div class="row">
												<span class="col-3 text-grey">客户</span>
												<span class="col-9 text-right">{{ props.row.joinContact?.name || "批量导入" }}</span>
											</div>
											<div class="row">
												<span class="col-3 text-grey">开单人</span>
												<span class="col-9 text-right">{{ props.row.joinCreator?.nickname }}</span>
											</div>
											<div class="row">
												<span class="col text-grey">
													来源单据

													<a
														v-if="props.row.joinParentOrder"
														class="cursor-pointer text-primary"
														@click="() => router.push(`/wmss/trade/order-list?code=${props.row.joinParentOrder.code}`)"
													>
														查看
													</a>
												</span>
												<span class="col text-right">
													{{ props.row.joinParentOrder?.code || "无" }}
												</span>
											</div>
										</div>

										<q-separator class="q-mt-md" />
									</q-card-section>
									<q-card-actions class="q-pt-none">
										<q-btn class="q-ml-sm" flat color="negative" @click="OrderStore.delete(props.row._id)">
											{{ props.row.isDisabled ? "恢复" : props.row.parentOrderId ? "回退" : "删除" }}
										</q-btn>
										<q-space></q-space>
										<q-btn
											v-if="!props.row.isDisabled"
											:disabled="!!props.row.managerId || !!props.row.accounterId"
											class="q-ml-sm"
											text-color="primary"
											@click="
												() => {
													OrderStore.setSchema(props.row);
													SkuStore.skuListPicked = cloneDeep(props.row.joinSku);
													router.push('/wmss/warehouse/order-edit');
												}
											"
										>
											编辑
										</q-btn>
									</q-card-actions>
								</q-card>
							</div>
						</div>
					</q-td>
				</q-tr>
			</template>
			<template v-slot:bottom="props">
				<q-pagination
					size="17px"
					class="q-my-sm"
					color="white"
					text-color="black"
					active-color="indigo-14"
					active-text-color="white"
					v-model="OrderStore.page.page"
					:max-pages="10"
					:max="Math.ceil(OrderStore.total / OrderStore.page.pageSize)"
					@update:model-value="(value) => OrderStore.getOrderInView(value)"
				/>
				<q-space></q-space>
				<span>共 {{ OrderStore.total }} 项</span>
			</template>
		</q-table>

		<q-inner-loading :showing="OrderStore.loadding">
			<q-spinner-gears size="50px" color="indigo-14" />
		</q-inner-loading>
	</q-card>

	<q-dialog v-model="contactDialog" position="bottom">
		<q-card class="w-1000">
			<q-toolbar class="bg-green-6 text-white">
				<q-toolbar-title class="text-weight-bold">通讯录</q-toolbar-title>
				<q-btn dense flat icon="close" v-close-popup></q-btn>
			</q-toolbar>
			<q-separator class="q-mb-md" />

			<list-contact
				@pick="
					(value) => {
						contactPicked = value;
						OrderStore.orderSearch.contactId = value._id;
						OrderStore.getOrderInView(1);
					}
				"
			></list-contact>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from "vue-router";
import { onMounted, ref, computed } from "vue";
import { cloneDeep, debounce } from "lodash";
import * as XLSX from "xlsx";

import { ENUM_LAYOUT_CABINET, ENUM_ORDER, MongodbSort, MAP_ENUM_ORDER } from "qqlx-core";
import type { OrderInView } from "qqlx-core/dto/wmss/order";
import type { Order } from "qqlx-core/schema/wmss/order";

import listContact from "@/components/list-contact.vue";
import { getChineseMoney } from "@/utils";
import { useNotifyStore } from "@/stores/notify";
import { useUserStore } from "@/stores/user";
import { useCorpStore } from "@/stores/corp";
import { useWarehouseStore } from "@/stores/warehouse";
import { useCabinetStore } from "@/stores/cabinet";
import { useCabinetUnitStore } from "@/stores/cabinetUnit";
import { useContactStore } from "@/stores/contact";
import { useSkuStore } from "@/stores/sku";
import { useOrderStore } from "@/stores/order";

const NotifyStore = useNotifyStore();
const router = useRouter();
const route = useRoute();
// const UserStore = useUserStore();
// const CorpStore = useCorpStore();
// const WarehouseStore = useWarehouseStore();
// const CabinetStore = useCabinetStore();
// const CabinetUnitStore = useCabinetUnitStore();
const ContactStore = useContactStore();
const SkuStore = useSkuStore();
const OrderStore = useOrderStore();

const nowType = ref(ENUM_ORDER.GETOUT);
const init = (type: ENUM_ORDER, ignoreRoute: boolean = false) => {
	// 清空SKU
	SkuStore.setSchema();
	// 设置搜索
	nowType.value = type;
	OrderStore.setSchema(OrderStore.getSchema(nowType.value));
	// 根据条件设置搜索
	const { code } = route.query;
	if (ignoreRoute === false && code) {
		code.includes("FH") && (nowType.value = ENUM_ORDER.GETOUT);
		code.includes("RK") && (nowType.value = ENUM_ORDER.GETIN);
		code.includes("LL") && (nowType.value = ENUM_ORDER.MATERIAL);
		code.includes("JG") && (nowType.value = ENUM_ORDER.PROCESS);
		OrderStore.setSchema(OrderStore.getSchema(nowType.value));
		OrderStore.orderSearch.code = code as string;
	}
	OrderStore.getOrderInView(1);
};

const date = new Date();
const timePicked = ref({ from: `${date.getFullYear()}/01/01`, to: date.toLocaleString().split(" ")[0] });
const timeChange = () => {
	console.log(JSON.stringify(timePicked.value));
	if (timePicked.value) {
		OrderStore.page.startTime = new Date(timePicked.value.from + " 00:00:00").getTime();
		OrderStore.page.endTime = new Date(timePicked.value.to + " 23:59:59").getTime();
	}
};

const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());

// action
onMounted(async () => {
	init(ENUM_ORDER.GETOUT);
});
</script>

<style lang="scss" scoped></style>

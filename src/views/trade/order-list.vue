<template>
	<div class="q-pt-md q-pb-lg">
		<div class="text-h4 text-white text-weight-bold">{{ nowType === ENUM_ORDER.SALES ? "销售" : "采购" }}单列表</div>
		<div class="text-white q-pt-sm">
			<span>查看此公司的{{ nowType === ENUM_ORDER.SALES ? "销售" : "采购" }}单据</span>
		</div>
	</div>

	<div class="row q-mb-sm">
		<q-btn-group class="q-mr-sm">
			<q-btn
				class="text-body1"
				push
				square
				label="销售单"
				:color="nowType === ENUM_ORDER.SALES ? 'pink-6' : 'white'"
				:text-color="nowType === ENUM_ORDER.SALES ? '' : 'black'"
				@click="init(ENUM_ORDER.SALES, true)"
			/>
			<q-btn
				class="text-body1"
				push
				square
				label="采购单"
				:color="nowType === ENUM_ORDER.PURCHASE ? 'primary' : 'white'"
				:text-color="nowType === ENUM_ORDER.PURCHASE ? '' : 'black'"
				@click="init(ENUM_ORDER.PURCHASE, true)"
			/>
		</q-btn-group>

		<q-btn
			class="q-mr-sm text-body1"
			push
			square
			label="最近删除"
			:color="OrderStore.orderSearch.isDisabled ? 'pink-6' : 'white'"
			:text-color="OrderStore.orderSearch.isDisabled ? '' : 'black'"
			@click="
				() => {
					OrderStore.orderSearch.isDisabled = !OrderStore.orderSearch.isDisabled;
					OrderStore.get(1);
				}
			"
		/>
		<q-btn
			class="q-mr-sm text-body1"
			push
			square
			label="可复核"
			:color="OrderStore.managerIdRequired ? 'pink-6' : 'white'"
			:text-color="OrderStore.managerIdRequired ? '' : 'black'"
			@click="
				() => {
					OrderStore.managerIdRequired = !OrderStore.managerIdRequired;
					OrderStore.get(1);
				}
			"
		/>
		<q-btn
			class="q-mr-sm text-body1"
			push
			square
			label="可结清"
			:color="OrderStore.accounterIdIdRequired ? 'pink-6' : 'white'"
			:text-color="OrderStore.accounterIdIdRequired ? '' : 'black'"
			@click="
				() => {
					OrderStore.accounterIdIdRequired = !OrderStore.accounterIdIdRequired;
					OrderStore.get(1);
				}
			"
		/>

		<q-space></q-space>
		<q-btn color="white" disabled text-color="black" class="text-body1 q-ml-sm">
			<q-icon name="get_app" class="q-mr-xs" style="margin-bottom: -6px"></q-icon>
			导出订单
			<q-tooltip class="text-body1">敬请期待</q-tooltip>
		</q-btn>
		<q-btn color="white" text-color="black" class="text-body1 q-ml-sm">
			<q-icon name="date_range" class="q-mr-xs" style="margin-bottom: -4px"></q-icon>
			{{ timePicked.from }} ~ {{ timePicked.to }}
			<q-menu>
				<q-date v-model="timePicked" range first-day-of-week="1" color="pink-6" @update:model-value="timeChange" />
			</q-menu>
		</q-btn>
	</div>

	<q-table
		dense
		row-key="_id"
		:columns="[
			{ name: 'code', field: 'code', label: '批次', align: 'left', style: 'font-size: 16px; width: 150px;' },
			{ name: 'contactId', field: 'contactId', label: '客户名称', align: 'left', style: 'font-size: 16px; width: 188px;' },
			{ name: 'amount', field: 'amount', label: '金额', style: 'font-size: 16px; width: 150px;' },
			{ name: 'amountBookOfOrder', field: 'amountBookOfOrder', label: '已收款', style: 'font-size: 16px; width: 150px;' },
			{ name: 'amountBookOfOrderRest', field: 'amountBookOfOrderRest', label: '剩余', align: 'left', style: 'font-size: 16px; width: 150px;' },
			{ name: '_id', field: '_id', label: '操作', align: 'left' },
			{ name: 'timeCreateString', field: 'timeCreateString', label: '时间', align: 'left', style: 'font-size: 16px; width: 188px;' },
			{ name: 'remark', field: 'remark', label: '备注', align: 'left', style: 'font-size: 16px; width: 188px;' },
		]"
		:loading="OrderStore.loadding"
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
						color="pink-6"
						clear-icon="close"
						placeholder="搜索批次"
						style="margin-left: -6px"
						v-model="OrderStore.orderSearch.code"
						@blur="OrderStore.get(1)"
					/>
				</q-th>
				<q-th key="contactId" :props="props" style="width: 188px">
					<q-btn class="q-px-none" flat square color="pink-6" @click="contactDialog = true">
						{{ contactPicked._id ? contactPicked.name : "点击筛选客户" }}
					</q-btn>
					<q-btn
						v-show="contactPicked._id"
						class="q-px-sm"
						flat
						square
						color="pink-6"
						@click="
							() => {
								contactPicked = ContactStore.getSchema();
								OrderStore.orderSearch.contactId = '';
								OrderStore.get(1);
							}
						"
					>
						<q-icon name="close" style="margin-bottom: -4px"></q-icon>
					</q-btn>
				</q-th>
				<q-th class="text-right cursor-pointer" :class="{ 'text-pink-6': OrderStore.sortKey === 'amount' }" @click="OrderStore.sort('amount')">
					<span>金额 </span>
					<q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th
					class="text-right cursor-pointer"
					:class="{ 'text-pink-6': OrderStore.sortKey === 'amountBookOfOrder' }"
					@click="OrderStore.sort('amountBookOfOrder')"
				>
					<span>已收款 </span>
					<q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th
					class="text-left cursor-pointer"
					:class="{ 'text-pink-6': OrderStore.sortKey === 'amountBookOfOrderRest' }"
					@click="OrderStore.sort('amountBookOfOrderRest')"
				>
					<span>剩余 </span>
					<q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th class="text-left">操作</q-th>
				<q-th class="text-left">备注</q-th>
				<q-th class="text-left cursor-pointer" :class="{ 'text-pink-6': OrderStore.sortKey === 'timeCreate' }" @click="OrderStore.sort('timeCreate')">
					<span>时间 </span>
					<q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
			</q-tr>
		</template>
		<template v-slot:body="props">
			<q-tr
				class="cursor-pointer"
				:class="{
					'bg-grey-4': props.expand,
				}"
				@click="props.expand = !props.expand"
			>
				<q-td key="code" :props="props"> {{ props.row.code }} </q-td>
				<q-td key="contactId" :props="props">
					<span v-if="props.row.joinContact?.name" class="ellipsis">{{ props.row.joinContact.name }}</span>
					<span v-else class="text-grey">尚未选择客户</span>
				</q-td>
				<q-td
					key="amount"
					:props="props"
					:class="{
						'text-through': props.row.accounterId,
						'text-grey': props.row.amount < 1 || props.row.accounterId,
					}"
				>
					{{ props.row.amount.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
				</q-td>
				<q-td
					key="amountBookOfOrder"
					:props="props"
					:class="{
						'text-through': props.row.accounterId,
						'text-grey': props.row.amountBookOfOrder < 1 || props.row.accounterId,
						'text-teal': props.row.amountBookOfOrder >= 1,
						'text-weight-bold': props.row.amountBookOfOrder >= 1,
					}"
				>
					{{ props.row.amountBookOfOrder.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
				</q-td>
				<q-td
					key="amountBookOfOrderRest"
					:props="props"
					:class="{
						'text-through': props.row.accounterId,
						'text-grey': props.row.amountBookOfOrderRest < 1 || props.row.accounterId,
						'text-weight-bold': props.row.amountBookOfOrderRest >= 1,
					}"
				>
					{{ props.row.amountBookOfOrderRest.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
				</q-td>
				<q-td key="_id" :props="props">
					<q-btn
						v-show="nowType === ENUM_ORDER.SALES"
						dense
						label="打印"
						class="q-mr-sm"
						color="pink-6"
						@click.stop="
							() => {
								printOrder = props.row;
								printDialog = true;
							}
						"
					/>
					<q-btn v-if="!props.row.managerId" dense label="复核" class="q-mr-sm" color="primary" @click.stop="setManager(props.row)" />
					<q-btn
						v-if="!props.row.accounterId"
						dense
						label="结清"
						class="q-mr-sm"
						color="teal"
						@click.stop="
							() => {
								props.row.accounterId = UserStore.userEditor.userId;
								OrderStore.put(props.row);
							}
						"
					/>
				</q-td>
				<q-td key="remark" :props="props">
					<span class="cursor-pointer" :class="props.row.remark ? '' : 'text-grey'">
						{{ props.row.remark || "点击修改备注" }}
						<q-menu anchor="top left" @hide="OrderStore.put(props.row)">
							<q-card class="w-400">
								<q-toolbar class="bg-pink-6 text-white">
									<q-toolbar-title>修改备注</q-toolbar-title>
									<q-btn dense flat icon="close" v-close-popup></q-btn>
								</q-toolbar>

								<q-card-section>
									<q-input filled :label="props.row.code" v-model="props.row.remark" color="pink-6"> </q-input>
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

			<q-tr v-show="props.expand" :props="props">
				<q-td colspan="100%" style="padding: 0">
					<div class="row">
						<div class="col-8">
							<q-table
								dense
								row-key="_id"
								hide-pagination
								separator="vertical"
								:columns="[
									{ name: 'name', field: 'name', label: '品名', align: 'left' },
									{ name: 'norm', field: 'norm', label: '规格', align: 'left' },
									{ name: 'count', field: 'count', label: '数量' },
									{ name: 'pounds', field: 'pounds', label: '过磅' },
									{ name: 'price', field: 'price', label: '单价' },
									{ name: 'remark', field: 'remark', label: '备注', align: 'left' },
								]"
								:rows-per-page-options="[0]"
								:rows="props.row.joinSku || []"
							>
								<template v-slot:body="_props">
									<q-tr>
										<q-td :_props="_props" style="font-size: 16px">{{ _props.row.name }}</q-td>
										<q-td :_props="_props" style="font-size: 16px">{{ _props.row.norm }}</q-td>
										<q-td :_props="_props" style="font-size: 16px" class="text-right">{{ _props.row.count }} {{ _props.row.unit }}</q-td>
										<q-td :_props="_props" style="font-size: 16px" class="text-right">
											<span v-if="_props.row.isPriceInPounds">{{ _props.row.pounds.toFixed(3) }} 吨</span>
										</q-td>
										<q-td :_props="_props" style="font-size: 16px" class="text-right">{{ _props.row.price.toFixed(2) }}</q-td>
										<q-td :_props="_props" style="font-size: 16px">{{ _props.row.remark }}</q-td>
									</q-tr>
								</template>
							</q-table>
						</div>
						<div class="col-4">
							<q-card>
								<q-card-section>
									<div class="text-body1 text-weight-bold">订单信息</div>
									<div class="text-body2 text-grey">{{ props.row.joinContact?.name }}</div>
									<q-separator class="q-mt-md q-mb-sm" />
									<div class="row">
										<span class="col-3 text-grey">开单人</span>
										<span class="col-9 text-right">{{ props.row.joinCreator?.nickname }}</span>
									</div>
									<div class="row">
										<span class="col text-grey">
											财务签字
											<a
												v-if="props.row.accounterId"
												class="cursor-pointer text-negative"
												@click="
													() => {
														props.row.accounterId = '';
														OrderStore.put(props.row);
													}
												"
											>
												取消
											</a>
										</span>
										<span class="col text-right">
											{{ props.row.joinAccounter?.nickname || "无" }}
										</span>
									</div>

									<div class="row">
										<span class="col text-grey"
											>审核人
											<a
												v-if="props.row.managerId"
												class="cursor-pointer text-negative"
												@click="
													() => {
														props.row.managerId = '';
														OrderStore.put(props.row);
													}
												"
											>
												取消
											</a>
										</span>
										<span class="col text-right">
											{{ props.row.joinManager?.nickname || "无" }}
										</span>
									</div>
									<div class="row">
										<span class="col text-grey">
											{{ nowType === ENUM_ORDER.SALES ? "发货单" : "入库单" }}
											<a
												v-if="props.row.joinChildOrder"
												class="cursor-pointer text-primary"
												@click="() => router.push(`/wmss/warehouse/order-list?code=${props.row.joinChildOrder.code}`)"
											>
												查看
											</a>
										</span>
										<span class="col text-right">{{ props.row.joinChildOrder?.code }}</span>
									</div>
								</q-card-section>
								<q-separator class="q-mt-md" />
								<q-card-actions align="right">
									<q-btn
										class="q-ml-sm"
										text-color="negative"
										:disabled="!!props.row.managerId || !!props.row.accounterId || !!props.row.joinChildOrder"
										@click="OrderStore.delete(props.row._id)"
										>{{ props.row.isDisabled ? "恢复" : "删除" }}</q-btn
									>
									<q-btn
										v-if="!props.row.isDisabled"
										:disabled="!!props.row.managerId || !!props.row.accounterId || !!props.row.joinChildOrder"
										class="q-ml-sm"
										text-color="primary"
										@click="
											() => {
												OrderStore.setSchema(props.row);
												SkuStore.skuListPicked = cloneDeep(props.row.joinSku);
												router.push('/wmss/trade/order-edit');
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
				push
				size="17px"
				class="q-my-sm"
				color="grey-5"
				active-design="push"
				:active-color="nowType === ENUM_ORDER.SALES ? 'pink-6' : 'primary'"
				v-model="OrderStore.page.page"
				:max-pages="10"
				:max="Math.ceil(OrderStore.total / OrderStore.page.pageSize)"
				@update:model-value="(value) => OrderStore.get(value)"
			/>
			<q-space></q-space>
			<span>共 {{ OrderStore.total }} 项，合计</span>
			<span class="text-body1 text-weight-bold text-negative q-mx-sm"> {{ OrderStore.amountTotal.toFixed(2) }} </span>
			<span>元</span>
		</template>
	</q-table>

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
						OrderStore.get(1);
					}
				"
			></list-contact>
		</q-card>
	</q-dialog>

	<q-dialog v-model="printDialog">
		<q-card class="print-container">
			<q-card-section>
				<div id="order">
					<!-- 顶部信息 -->
					<div class="text-weight-bold text-h4 text-center">
						<div>{{ CorpStore.corpPicked?.name }}</div>
						<div v-if="CorpStore.corpList.filter((e) => e.isDisabled === false && e._id !== CorpStore.corpPicked?._id)[0]?.name">
							{{ CorpStore.corpList.filter((e) => e.isDisabled === false && e._id !== CorpStore.corpPicked?._id)[0]?.name }}
						</div>
					</div>
					<div class="row">
						<div class="col">购货单位：{{ printOrder.joinContact?.name }}</div>
						<div class="col text-right">公司地址：{{ CorpStore.corpPicked?.address }}</div>
					</div>
					<div class="row">
						<div class="col">购货单位联系方式：{{ printOrder.joinContact?.address }}</div>
						<div class="col text-right">公司联系方式：{{ CorpStore.corpPicked?.contact || "尚未录入" }}</div>
					</div>
					<div class="row">
						<div class="col">开单日期：{{ printOrder.timeCreateString }}</div>
						<div class="col text-center">开单人：{{ printOrder.joinCreator?.nickname }}</div>
						<div class="col text-right">No. {{ printOrder.code }}</div>
					</div>
					<!-- 表头 -->
					<div class="order-table-line row">
						<div class="col-3">品名规格</div>
						<div class="col-1">数量</div>
						<div class="col-1">单位</div>
						<div class="col-2 text-right">过磅称重</div>
						<div class="col-2 text-right">单价/元</div>
						<div class="col-2 text-right">售价/元</div>
						<div class="col-1">备注</div>
					</div>
					<!-- 内容 -->
					<div class="order-table-line row" v-for="(sku, i) in printSkuList">
						<div class="col-3">{{ sku.name }} {{ sku.norm }}</div>
						<div class="col-1">
							<span v-show="sku.name && sku.norm">{{ sku.count }}</span>
						</div>
						<div class="col-1">{{ sku.unit }}</div>
						<div class="col-2 text-right">
							<span v-show="sku.isPriceInPounds">{{ sku.pounds.toFixed(3) }} 吨</span>
						</div>
						<div class="col-2 text-right">
							<span v-show="sku.name && sku.norm">{{ sku.price.toFixed(2) }}</span>
						</div>
						<div class="col-2 text-right">
							<span v-show="sku.name && sku.norm">{{ (sku.price * (sku.isPriceInPounds ? sku.pounds : sku.count)).toFixed(2) }}</span>
						</div>
						<div class="col-1">{{ sku.remark }}</div>
					</div>
					<div class="order-table-line row">
						<div class="col">{{ getChineseMoney(printOrder.amount) }}</div>
						<div class="col">共计: {{ printOrder.amount.toFixed(2) }} 元</div>
					</div>
					<!-- 尾部 -->
					<div class="order-table-line row">
						<div class="col q-pa-sm">单据说明</div>
						<div class="col-8 q-pa-sm text-body2">
							1、购货方在货物出库/收货时，应当面点清数量并签收，提货人/收货人在本单上签字后，购货方即对本单上所载内容认可。
							2、按产品质量法规定，购货方在使用供方货品前，必须委托权威机构进行检测，确认其品质符合质量要求，方可投入使用。未经检测投入使用，造成一切后果由购货方自负
							3、如经检验有质量问题，必须在七天内提出。本公司可予以退换货（拆包或损坏不予退换），并承担一定的损失（以提货单注明金额为准）
							4、本销售单等同于合同，并代替送货单使用，提货人/收货人签名后生效，如有纠纷在供货方所在地解决。
						</div>
						<div class="col q-pa-sm">
							<div>白联：存根</div>
							<div>红联：提货</div>
							<div>黄联：客户</div>
						</div>
					</div>
					<div class="order-table-line row">
						<div class="col-8 q-px-md" style="text-align: left">仓库地址：{{ WarehouseStore.WarehousePicked?.address }}</div>
						<div class="col-4 q-px-md" style="text-align: left">提货人</div>
					</div>
				</div>
			</q-card-section>
			<q-card-actions>
				<q-space></q-space>
				<q-btn class="q-ml-sm" label="关闭" v-close-popup />
				<q-btn class="q-ml-sm" label="打印" color="pink-6" @click.stop="print" />
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { useRouter, useRoute } from "vue-router";
import { onMounted, ref, computed } from "vue";
import { cloneDeep, debounce } from "lodash";
import { callPrinter } from "call-printer";
import * as XLSX from "xlsx";

import { ENUM_LAYOUT_CABINET, ENUM_ORDER, MongodbSort } from "qqlx-core";
import type { OrderInView } from "qqlx-core/dto/wmss/order";
import type { Order } from "qqlx-core/schema/wmss/order";

import listContact from "@/components/list-contact.vue";
import { getChineseMoney, getPage } from "@/utils";
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
const UserStore = useUserStore();
const CorpStore = useCorpStore();
const WarehouseStore = useWarehouseStore();
const CabinetStore = useCabinetStore();
const CabinetUnitStore = useCabinetUnitStore();
const ContactStore = useContactStore();
const SkuStore = useSkuStore();
const OrderStore = useOrderStore();

const nowType = ref(ENUM_ORDER.SALES);
const init = (type: ENUM_ORDER, ignoreRoute: boolean = false) => {
	// 清空SKU
	SkuStore.setSchema();
	// 设置搜索
	nowType.value = type;
	OrderStore.setSchema(OrderStore.getSchema(nowType.value));
	OrderStore.page = getPage();
	// 根据条件设置搜索
	const { code } = route.query;
	if (ignoreRoute === false && code) {
		code.includes("CG") && (nowType.value = ENUM_ORDER.PURCHASE);
		OrderStore.setSchema(OrderStore.getSchema(nowType.value));
		OrderStore.orderSearch.code = code as string;
	}

	OrderStore.get(1);
};

const date = new Date();
const timePicked = ref({ from: `${date.getFullYear()}/01/01`, to: date.toLocaleString().split(" ")[0] });
const timeChange = () => {
	console.log(JSON.stringify(timePicked.value));
	if (timePicked.value) {
		OrderStore.page.startTime = new Date(timePicked.value.from + " 00:00:00").getTime();
		OrderStore.page.endTime = new Date(timePicked.value.to + " 23:59:59").getTime();
		OrderStore.get(1);
	}
};

const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());

const printDialog = ref(false);
const printOrder = ref(OrderStore.getSchema() as OrderInView);
const printSkuList = computed({
	get() {
		const skus = cloneDeep(printOrder.value.joinSku || []);
		if (skus.length >= 8) return skus.slice(0, 8);
		else {
			const blank = SkuStore.getSchema();
			blank.name = "- 以下空白 -";
			skus.push(blank);
			while (skus.length !== 8) skus.push(SkuStore.getSchema());
			return skus;
		}
	},
	set() {},
});
const print = () => {
	const dom = document.getElementById("order");
	callPrinter(dom as Element);
};

const setManager = async (order: OrderInView) => {
	const entity = cloneDeep(order);
	entity.managerId = UserStore.userEditor.userId;
	await OrderStore.put(entity);
	// 销售单复核，需要自动创建对应发货单
	if (entity.type === ENUM_ORDER.SALES) {
		OrderStore.orderEditor = OrderStore.getSchema(ENUM_ORDER.GETOUT);
		OrderStore.orderEditor.parentOrderId = entity._id;
		OrderStore.orderEditor.parentOrderType = entity.type;
		OrderStore.orderEditor.contactId = entity.contactId;
		await OrderStore.post(entity.joinSku);
	}
	// 采购单复核，需要自动创建对应发货单
	else if (entity.type === ENUM_ORDER.PURCHASE) {
		OrderStore.orderEditor = OrderStore.getSchema(ENUM_ORDER.GETIN);
		OrderStore.orderEditor.parentOrderId = entity._id;
		OrderStore.orderEditor.parentOrderType = entity.type;
		OrderStore.orderEditor.contactId = entity.contactId;
		await OrderStore.post(entity.joinSku);
	}
	OrderStore.setSchema(OrderStore.getSchema(nowType.value));
	await OrderStore.get();
};
// action
onMounted(async () => {
	init(ENUM_ORDER.SALES);
});
</script>

<style lang="scss" scoped>
.print-container {
	width: 960px;
	min-width: 960px;
	max-width: 960px;
}
#order {
	font-size: 18px;
	line-height: 1.375;
	color: black;
	font-family: cursive;
	.order-table-line {
		border-left: 1px solid black;
		border-right: 1px solid black;
		> div {
			min-height: 27px;
			text-align: center;
			border-top: 1px solid black;
			border-right: 1px solid black;
			&:last-child {
				border-right: none;
			}
		}
		&:last-child {
			border-bottom: 1px solid black;
		}
	}
}
</style>

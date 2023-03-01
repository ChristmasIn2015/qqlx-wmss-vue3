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
		<q-btn color="white" :loading="OrderStore.loadding" text-color="black" class="text-body1 q-ml-sm" @click="downloadOrderList()">
			<q-icon name="get_app" class="q-mr-xs"></q-icon>
			导出订单
		</q-btn>
		<q-btn color="white" text-color="black" class="text-body1 q-ml-sm">
			<span v-if="OrderStore.timeQuasarPicked">
				<q-icon name="date_range" class="q-mr-xs" style="margin-bottom: -4px"></q-icon>
				{{ OrderStore.timeQuasarPicked?.from }} ~ {{ OrderStore.timeQuasarPicked?.to }}
			</span>
			<span v-else>请选择日期</span>
			<q-menu>
				<q-date
					range
					minimal
					no-unset
					color="pink-6"
					first-day-of-week="1"
					v-model="OrderStore.timeQuasarPicked"
					@update:model-value="OrderStore.timeChange"
				/>
			</q-menu>
		</q-btn>
	</div>

	<q-card>
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
						<q-btn class="q-px-sm" flat square color="pink-6" @click="contactDialog = true">
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
						<span>订单金额</span>
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
						<span>剩余应收</span>
						<q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
					</q-th>
					<q-th class="text-left">操作</q-th>
					<q-th class="text-left">备注</q-th>
					<q-th
						class="text-left cursor-pointer"
						:class="{ 'text-pink-6': OrderStore.sortKey === 'timeCreate' }"
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
					:class="{
						'bg-grey-4': props.expand,
					}"
					@click="
						async () => {
							if (props.expand === false) await setOrderSku(props.row);
							props.expand = !props.expand;
						}
					"
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
					<q-td key="_id" :props="props" style="padding: 0px 8px">
						<q-btn
							v-show="nowType === ENUM_ORDER.SALES"
							push
							dense
							square
							label="打印"
							class="q-mr-xs"
							color="pink-6"
							@click.stop="
								async () => {
									await setOrderSku(props.row);
									printOrder = props.row;
									printDialog = true;
								}
							"
						/>
						<q-btn v-if="!props.row.managerId" push dense square label="复核" class="q-mr-xs" color="primary" @click.stop="setManager(props.row)" />
						<q-btn
							v-if="!props.row.accounterId"
							push
							dense
							square
							label="结清"
							class="q-mr-xs"
							color="teal"
							@click.stop="setAccounter(props.row)"
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
									v-if="!!props.row.joinSku"
									dense
									row-key="_id"
									hide-pagination
									separator="vertical"
									:columns="[
										{ name: 'keyHouse', field: 'keyHouse', label: '产地', align: 'left' },
										{ name: 'keyFeat', field: 'keyFeat', label: '材质', align: 'left' },
										{ name: 'name', field: 'name', label: '品名', align: 'left' },
										{ name: 'norm', field: 'norm', label: '规格', align: 'left' },
										{ name: 'layout', field: 'layout', label: '性质', align: 'left' },
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
											<q-td :_props="_props" style="font-size: 16px">{{ _props.row.keyHouse || "-" }}</q-td>
											<q-td :_props="_props" style="font-size: 16px">{{ _props.row.keyFeat || "-" }}</q-td>
											<q-td :_props="_props" style="font-size: 16px">{{ _props.row.name }} </q-td>
											<q-td :_props="_props" style="font-size: 16px">{{ _props.row.norm }}</q-td>
											<q-td :_props="_props" style="font-size: 16px"
												><q-badge color="grey" v-if="_props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
													大件商品
													<q-tooltip class="text-body1"> “大件商品”发货时，需要单独选择在库的“大件商品”进行发货</q-tooltip>
												</q-badge>
											</q-td>
											<q-td :_props="_props" style="font-size: 16px" class="text-right"
												>{{ _props.row.count }} {{ _props.row.unit }}</q-td
											>
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
										<div class="text-h6 text-weight-bold">订单信息</div>
										<div class="text-body1 text-grey">{{ props.row.joinContact?.name }}</div>
										<q-separator class="q-mt-md q-mb-sm" />
										<div class="row text-body1">
											<span class="col-3 text-grey">开单人</span>
											<span class="col-9 text-right">{{ props.row.joinCreator?.nickname }}</span>
										</div>
										<div class="row text-body1">
											<span class="col text-grey">
												财务签字
												<a
													v-if="props.row.accounterId"
													class="cursor-pointer text-negative"
													@click.stop="setAccounter(props.row, true)"
												>
													取消
												</a>
											</span>
											<span class="col text-right">
												{{ props.row.joinAccounter?.nickname || "无" }}
											</span>
										</div>

										<div class="row text-body1">
											<span class="col text-grey"
												>复核人
												<a v-if="props.row.managerId" class="cursor-pointer text-negative" @click.stop="setManager(props.row, true)">
													取消
												</a>
											</span>
											<span class="col text-right">
												{{ props.row.joinManager?.nickname || "无" }}
											</span>
										</div>
										<div class="row text-body1">
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
					size="17px"
					class="q-my-sm"
					color="white"
					text-color="black"
					active-text-color="white"
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

		<q-inner-loading :showing="OrderStore.loadding">
			<q-spinner-gears size="50px" color="pink-6" />
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
						OrderStore.setSchema(OrderStore.getSchema(nowType));
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
					<div class="text-weight-bold text-h4 text-center">
						<div>{{ CorpStore.corpPicked?.name }}</div>
						<div v-if="ConfigCorp.titles.length > 0">
							<div v-for="title in ConfigCorp.titles">{{ title.text }}</div>
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
					<div class="order-table-line row">
						<div class="col-3">品名规格</div>
						<div class="col-1">数量</div>
						<div class="col-1" style="width: 45px">单位</div>
						<div class="col-2 text-right" style="width: 100px">过磅称重</div>
						<div class="col-2 text-right" style="width: 110px">单价/元</div>
						<div class="col-2 text-right">售价/元</div>
						<div class="col-1" style="flex: 1">备注</div>
					</div>
					<div class="order-table-line row" v-for="(sku, i) in printSkuList">
						<div class="col-3">{{ sku.name }} {{ sku.norm }}</div>
						<div class="col-1">
							<span v-show="sku.name && sku.norm">{{ sku.count }}</span>
						</div>
						<div class="col-1" style="width: 45px">{{ sku.unit }}</div>
						<div class="col-2 text-right" style="width: 100px">
							<span v-show="sku.isPriceInPounds">{{ sku.pounds.toFixed(3) }} 吨</span>
						</div>
						<div class="col-2 text-right" style="width: 110px">
							<span v-show="sku.name && sku.norm">{{ sku.price.toFixed(2) }}</span>
						</div>
						<div class="col-2 text-right">
							<span v-show="sku.name && sku.norm">{{ (sku.price * (sku.isPriceInPounds ? sku.pounds : sku.count)).toFixed(2) }}</span>
						</div>
						<div class="col-1" style="flex: 1">{{ sku.remark }}</div>
					</div>
					<div class="order-table-line row">
						<div class="col">{{ getChineseMoney(printOrder.amount) }}</div>
						<div class="col">共计: {{ printOrder.amount.toFixed(2) }} 元</div>
					</div>
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
			<div class="row q-px-md q-pb-sm">
				<div class="col">
					<q-select
						dense
						square
						filled
						emit-value
						map-options
						label="选择提货仓库"
						color="pink-6"
						option-label="name"
						:options="WarehouseStore.WarehouseList.filter((e) => e.isDisabled === false)"
						v-model="WarehouseStore.WarehousePicked"
					/>
				</div>
				<div class="col text-right">
					<q-btn class="q-ml-sm" label="关闭" v-close-popup />
					<q-btn class="q-ml-sm" label="打印" color="pink-6" @click.stop="print" />
				</div>
			</div>
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
import { useContactStore } from "@/stores/contact";
import { useSkuStore } from "@/stores/sku";
import { useOrderStore } from "@/stores/order";
import { useConfigCorp } from "@/stores/configCorp";

const NotifyStore = useNotifyStore();
const router = useRouter();
const route = useRoute();
const UserStore = useUserStore();
const CorpStore = useCorpStore();
const WarehouseStore = useWarehouseStore();
const ContactStore = useContactStore();
const SkuStore = useSkuStore();
const OrderStore = useOrderStore();
const ConfigCorp = useConfigCorp();

// view
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

const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());

const printDialog = ref(false);
const printOrder = ref(OrderStore.getSchema() as OrderInView);

// action
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
const print = async () => {
	const dom = document.getElementById("order");
	callPrinter(dom as HTMLElement);
};
const setManager = async (order: OrderInView, toClear = false) => {
	await setOrderSku(order);
	const entity = cloneDeep(order);
	entity.managerId = toClear ? "" : UserStore.userEditor.userId;
	await OrderStore.put(entity);
	// 销售单复核，需要自动创建对应发货单
	if (entity.managerId && entity.type === ENUM_ORDER.SALES) {
		OrderStore.orderEditor = OrderStore.getSchema(ENUM_ORDER.GETOUT);
		OrderStore.orderEditor.parentOrderId = entity._id;
		OrderStore.orderEditor.parentOrderType = entity.type;
		OrderStore.orderEditor.contactId = entity.contactId;
		await OrderStore.post(entity.joinSku);
	}
	// 采购单复核，需要自动创建对应发货单
	else if (entity.managerId && entity.type === ENUM_ORDER.PURCHASE) {
		OrderStore.orderEditor = OrderStore.getSchema(ENUM_ORDER.GETIN);
		OrderStore.orderEditor.parentOrderId = entity._id;
		OrderStore.orderEditor.parentOrderType = entity.type;
		OrderStore.orderEditor.contactId = entity.contactId;
		await OrderStore.post(entity.joinSku);
	}
	OrderStore.orderEditor = OrderStore.getSchema(OrderStore.orderSearch.type);
	await OrderStore.get();

	// sku
	if (entity) {
		const target = OrderStore.orderList.find((e) => e._id === entity._id);
		target && (target.joinSku = await SkuStore.getSkuByOrder(entity));
	}
};
const setAccounter = async (order: OrderInView, toClear = false) => {
	const entity = cloneDeep(order);
	entity.accounterId = toClear ? "" : UserStore.userEditor.userId;
	await OrderStore.put(entity);
	await OrderStore.get();

	// sku
	if (entity) {
		const target = OrderStore.orderList.find((e) => e._id === entity._id);
		target && (target.joinSku = await SkuStore.getSkuByOrder(entity));
	}
};
const setOrderSku = async (order: OrderInView) => {
	try {
		OrderStore.loadding = true;
		order.joinSku = await SkuStore.getSkuByOrder(order);
	} catch (error) {
		NotifyStore.fail(`网络异常, 请重新试试`);
	} finally {
		OrderStore.loadding = false;
	}
};
const downloadOrderList = async () => {
	try {
		// await OrderStore.get(1);
		OrderStore.loadding = true;
		const orders = await OrderStore.geOrderWidthSku();

		// 单据
		const Out: any = [["创建时间", "单号", "客户名称", "单据金额", "单据备注"]];
		// SKU
		const SkuOut: any = [["创建时间", "单号", "客户名称", "产地", "材质", "名称", "规格", "数量", "单位", "过磅", "过磅单位", "单价", "总金额", "备注"]];

		orders.map((E) => {
			const billouts = [E.timeCreateString, E.code, E.joinContact?.name, E.amount.toFixed(2), E.remark];
			Out.push(billouts);
			E.joinSku?.map((C) => {
				SkuOut.push([
					E.timeCreateString,
					E.code,
					E.joinContact?.name,
					C.keyOrigin,
					C.keyFeat,
					C.name,
					C.norm,
					C.count,
					C.unit,
					C.isPriceInPounds ? C.pounds.toFixed(3) : "",
					C.isPriceInPounds ? "吨" : "",
					C.price,
					Number(C.price) * (C.isPriceInPounds ? Number(C.pounds) : Number(C.count)),
					C.remark,
				]);
			});
		});
		const name = OrderStore.orderSearch.type === ENUM_ORDER.SALES ? "销售" : "采购";
		const workbook = XLSX.utils.book_new();

		const sheet1 = XLSX.utils.aoa_to_sheet(Out);
		XLSX.utils.book_append_sheet(workbook, sheet1, `${name}单据导出`);
		const sheet2 = XLSX.utils.aoa_to_sheet(SkuOut);
		XLSX.utils.book_append_sheet(workbook, sheet2, `${name}明细导出`);

		XLSX.writeFile(workbook, `${CorpStore.corpPicked?.name}-${name}单据导出.xlsx`);
	} catch (error) {
		NotifyStore.fail((error as Error).message);
	} finally {
		OrderStore.loadding = false;
	}
};
onMounted(() => init(ENUM_ORDER.SALES));
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
	page-break-before: always;
	print-color-adjust: exact;
	color-adjust: exact;
	-webkit-print-color-adjust: exact;
	.order-table-line {
		// border-left: 1px solid black;
		// border-right: 1px solid black;
		> div {
			min-height: 27px;
			text-align: center;
			border-top: 1px solid black;
			border-right: 1px solid black;
			&:first-child {
				border-left: 1px solid black;
			}
		}
		&:last-child {
			border-bottom: 1px solid black;
		}
	}
}
</style>

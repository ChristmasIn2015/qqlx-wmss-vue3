<template>
	<div class="row q-mb-sm">
		<q-space></q-space>
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
		class="my-sticky-header-table"
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
		:rows-per-page-options="[0]"
		virtual-scroll
		:virtual-scroll-item-size="33"
		:virtual-scroll-sticky-size-start="33"
		@virtual-scroll="loadPage"
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
			<q-tr>
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
				<q-td key="amountBookOfOrder" :props="props" :class="props.row.amountBookOfOrder > 1 ? 'text-teal text-bold-weight' : 'text-grey'">
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
					<span
						v-if="OrderStore.orderListPicked.find((e) => e._id === props.row._id) ? false : true"
						class="cursor-pointer text-pink-6 text-body1"
						@click="pick(props.row)"
					>
						选择
					</span>
				</q-td>
				<q-td key="remark" :props="props"> {{ props.row.remark || "-" }} </q-td>
				<q-td key="timeCreateString" :props="props"> {{ props.row.timeCreateString }} </q-td>
			</q-tr>
		</template>
		<template v-slot:bottom="props">
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
						OrderStore.getNoJoin(1);
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

import { ENUM_ORDER, MongodbSort, ENUM_BOOK_TYPE, ENUM_BOOK_DIRECTION } from "qqlx-core";
import type { Order } from "qqlx-core/schema/wmss/order";

import listContact from "@/components/list-contact.vue";
import { useNotifyStore } from "@/stores/notify";
import { useContactStore } from "@/stores/contact";
import { useOrderStore } from "@/stores/order";
import { useBookStore } from "@/stores/book";

const NotifyStore = useNotifyStore();
const router = useRouter();
const ContactStore = useContactStore();
const OrderStore = useOrderStore();
const BookStore = useBookStore();

const debounceGet = debounce(() => OrderStore.getNoJoin(), 200);
const loadPage = (details: { index: number; from: number; to: number; direction: "increase" | "decrease" }) => {
	if (details.index + 9 >= details.to) {
		debounceGet();
	}
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
const pick = (order: Order) => {
	const o = cloneDeep(order);
	const gap = BookStore.bookEditor.amount - nowAmount.value;

	let amount = o.amountBookOfOrderRest;
	if (amount > gap) amount = gap;
	else if (gap === 0) amount = 0;
	o.amount = amount;
	OrderStore.orderListPicked.push(o);
};

// action
const nowAmount = computed({
	get() {
		let amount = 0;
		OrderStore.orderListPicked.map((e) => (amount += Number(e.amount)));
		return Number(parseInt((amount * 100).toString()) / 100);
	},
	set() {},
});
onMounted(async () => {
	const edit = BookStore.bookEditor;
	if (!edit._id) router.replace("/wmss/finance/book");
	const charge1 = edit.type === ENUM_BOOK_TYPE.YSZK && edit.direction === ENUM_BOOK_DIRECTION.DAI;
	const charge2 = edit.type === ENUM_BOOK_TYPE.YFZK && edit.direction === ENUM_BOOK_DIRECTION.JIE;

	if (charge1) OrderStore.setSchema(OrderStore.getSchema(ENUM_ORDER.SALES));
	else if (charge2) OrderStore.setSchema(OrderStore.getSchema(ENUM_ORDER.PURCHASE));
	else {
		NotifyStore.fail(`信息异常，请重新试试`);
		router.replace("/wmss/finance/book");
		return;
	}

	OrderStore.accounterIdIdRequired = true;
	OrderStore.getNoJoin(1);
});
</script>

<style lang="sass" scoped>
.my-sticky-header-table
  /* height or max-height is important */
  height: 450px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: white

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>

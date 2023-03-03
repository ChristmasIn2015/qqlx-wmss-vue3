<template>
	<div class="row q-mb-sm">
		<q-space></q-space>
		<q-btn color="white" text-color="black" class="text-body1 q-ml-sm">
			<q-icon name="date_range" class="q-mr-xs" style="margin-bottom: -4px"></q-icon>
			{{ OrderStore.timeQuasarPicked?.from }} ~ {{ OrderStore.timeQuasarPicked?.to }}
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
						dense
						square
						filled
						clearable
						clear-icon="close"
						placeholder="搜索批次"
						style="margin-left: -6px"
						:color="OrderStore.orderSearch.type === ENUM_ORDER.SALES ? 'pink-6' : 'primary'"
						v-model="OrderStore.orderSearch.code"
						@blur="OrderStore.getOrderWidthContact(1)"
					/>
				</q-th>
				<q-th key="contactId" :props="props" style="width: 188px">
					<q-select
						dense
						square
						filled
						use-input
						emit-value
						option-label="name"
						placeholder="搜索客户"
						style="margin-left: -6px"
						:options="contactSelecting"
						:color="OrderStore.orderSearch.type === ENUM_ORDER.SALES ? 'pink-6' : 'primary'"
						:loading="ContactStore.loadding"
						v-model="contactPicked"
						@filter="searchContact"
						@update:model-value="
							() => {
								OrderStore.orderSearch.contactId = contactPicked ? contactPicked._id : '';
								OrderStore.accounterIdIdRequired = true;
								OrderStore.getOrderWidthContact(1);
							}
						"
					>
						<template v-slot:no-option>
							<q-item>
								<q-item-section class="text-grey"> 暂无结果 </q-item-section>
							</q-item>
						</template>
					</q-select>
				</q-th>
				<q-th class="text-right cursor-pointer" :class="{ 'text-primary': OrderStore.sortKey === 'amount' }" @click="OrderStore.sort('amount', true)">
					<span>金额 </span>
					<q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th
					class="text-right cursor-pointer"
					:class="{ 'text-primary': OrderStore.sortKey === 'amountBookOfOrder' }"
					@click="OrderStore.sort('amountBookOfOrder', true)"
				>
					<span>{{ OrderStore.orderSearch.type === ENUM_ORDER.SALES ? "已收款" : "已付款" }} </span>
					<q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th
					class="text-left cursor-pointer"
					:class="{ 'text-primary': OrderStore.sortKey === 'amountBookOfOrderRest' }"
					@click="OrderStore.sort('amountBookOfOrderRest', true)"
				>
					<span>剩余 </span>
					<q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th class="text-left">操作</q-th>
				<q-th class="text-left">备注</q-th>
				<q-th
					class="text-left cursor-pointer"
					:class="{ 'text-primary': OrderStore.sortKey === 'timeCreate' }"
					@click="OrderStore.sort('timeCreate', true)"
				>
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
						class="cursor-pointer text-body1"
						:class="OrderStore.orderSearch.type === ENUM_ORDER.SALES ? 'text-pink-6' : 'text-primary'"
						@click="pick(props.row)"
					>
						选择
					</span>
					<span v-else class="text-body1 text-grey"> 已选择 </span>
				</q-td>
				<q-td key="remark" :props="props"> {{ props.row.remark || "-" }} </q-td>
				<q-td key="timeCreateString" :props="props"> {{ props.row.timeCreateString }} </q-td>
			</q-tr>
		</template>
		<template v-slot:bottom="props">
			<q-space></q-space>
			<span>已加载 {{ OrderStore.orderList.length }} / {{ OrderStore.total }} 项，合计</span>
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
						OrderStore.getOrderWidthContact(1);
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
import type { Contact } from "qqlx-core/schema/brand/contact";
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

const debounceGet = debounce(() => OrderStore.getOrderWidthContact(), 100);
const loadPage = (details: { index: number; from: number; to: number; direction: "increase" | "decrease" }) => {
	if (details.index + 10 >= details.to && details.to > 0) {
		debounceGet();
	}
};

const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());
const contactSelecting = ref([] as Contact[]);
const debounceContact = debounce(async () => {
	const page = await ContactStore.get10();
	contactSelecting.value = page.list;
}, 100);
const searchContact = (val: any, update: Function) => {
	update(async () => {
		ContactStore.contactSearch.name = val || "";
		debounceContact();
	});
};
//

// action
const pick = (order: Order) => {
	const o = cloneDeep(order);
	const gap = BookStore.bookEditor.amount - nowAmount.value;

	let amount = o.amountBookOfOrderRest;
	if (amount > gap) amount = gap;
	else if (gap === 0) amount = 0;
	o.amountBookOfOrderRest = amount;
	OrderStore.orderListPicked.push(o);
};
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
	OrderStore.page.page = 1;
	debounceGet();
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

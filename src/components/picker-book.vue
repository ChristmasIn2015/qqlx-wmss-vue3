<template>
	<div class="q-pb-sm row">
		<q-btn
			:color="BookStore.isAmountBookOfSelfRest ? 'teal' : ''"
			:text-color="BookStore.isAmountBookOfSelfRest ? '' : 'black'"
			@click="
				() => {
					BookStore.isAmountBookOfSelfRest = !BookStore.isAmountBookOfSelfRest;
					BookStore.get(1);
				}
			"
		>
			仅查看可开票
		</q-btn>
		<q-space></q-space>
		<q-btn color="white" text-color="black" class="text-body1 q-ml-sm">
			<q-icon name="date_range" class="q-mr-xs" style="margin-bottom: -4px"></q-icon>
			{{ BookStore.timeQuasarPicked?.from }} ~ {{ BookStore.timeQuasarPicked?.to }}
			<q-menu>
				<q-date v-model="BookStore.timeQuasarPicked" range first-day-of-week="1" color="teal" @update:model-value="BookStore.timeChange" />
			</q-menu>
		</q-btn>
	</div>

	<q-table
		dense
		row-key="_id"
		separator="cell"
		class="my-sticky-header-table"
		:columns="[
			{ name: 'type', field: 'type', label: '分类', align: 'left' },
			{ name: 'timeCreateString', field: 'timeCreateString', label: '时间', align: 'left' },
			{ name: 'code', field: 'code', label: '编号', align: 'left' },
			{ name: 'keyOrigin', field: 'keyOrigin', label: '客户', align: 'left' },
			{ name: 'keyHouse', field: 'keyHouse', label: '银行', align: 'left' },
			{ name: 'amountBookOfOrder', field: 'amountBookOfOrder', label: '可开票' },
			{ name: 'amountBookOfSelf', field: 'amountBookOfSelf', label: '已开票' },
			// { name: 'amountBookOfSelfRest', field: 'amountBookOfSelfRest', label: '剩余' },
			{ name: 'remark', field: 'remark', label: '备注', align: 'left' },
			{ name: '_id', field: '_id', label: '操作', align: 'left' },
		]"
		:loading="BookStore.loadding"
		:rows-per-page-options="[0]"
		:rows="BookStore.bookList"
		virtual-scroll
		:virtual-scroll-item-size="33"
		:virtual-scroll-sticky-size-start="33"
		@virtual-scroll="loadPage"
	>
		<template v-slot:header="props">
			<q-tr>
				<q-th key="type" :props="props">分类</q-th>
				<q-th
					key="timeCreateString"
					:props="props"
					class="cursor-pointer"
					:class="{ 'text-teal': BookStore.sortKey === 'timeCreate' }"
					@click="BookStore.sort('timeCreate')"
				>
					<span>时间</span>
					<q-icon :name="BookStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th key="code" :props="props">
					<q-input
						square
						filled
						dense
						clearable
						color="teal"
						clear-icon="close"
						placeholder="搜索编号"
						v-model="BookStore.bookSearch.code"
						@blur="BookStore.get(1)"
					/>
				</q-th>
				<q-th key="keyOrigin" :props="props">
					<q-input
						square
						filled
						dense
						clearable
						color="teal"
						clear-icon="close"
						placeholder="搜索客户"
						v-model="BookStore.bookSearch.keyOrigin"
						@blur="BookStore.get(1)"
					/>
				</q-th>
				<q-th key="keyHouse" :props="props">
					<q-input
						square
						filled
						dense
						clearable
						color="teal"
						clear-icon="close"
						placeholder="搜索银行"
						v-model="BookStore.bookSearch.keyHouse"
						@blur="BookStore.get(1)"
					/>
				</q-th>
				<q-th
					key="amountBookOfOrder"
					:props="props"
					class="cursor-pointer"
					:class="{ 'text-teal': BookStore.sortKey === 'amountBookOfOrder' }"
					@click="BookStore.sort('amountBookOfOrder', true)"
				>
					<span>已结清</span>
					<q-icon :name="BookStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th
					key="amountBookOfSelf"
					:props="props"
					class="cursor-pointer"
					:class="{ 'text-teal': BookStore.sortKey === 'amountBookOfSelf' }"
					@click="BookStore.sort('amountBookOfSelf')"
				>
					<span>已开票</span>
					<q-icon :name="BookStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<!-- <q-th
					key="amountBookOfSelfRest"
					:props="props"
					class="cursor-pointer"
					:class="{ 'text-teal': BookStore.sortKey === 'amountBookOfSelfRest' }"
					@click="BookStore.sort('amountBookOfSelfRest')"
				>
					<span>剩余</span>
					<q-icon :name="BookStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th> -->
				<q-th key="remark" :props="props">
					<q-input
						square
						filled
						dense
						clearable
						color="teal"
						clear-icon="close"
						placeholder="搜索备注"
						v-model="BookStore.bookSearch.remark"
						@blur="BookStore.get(1)"
					/>
				</q-th>
				<q-th key="_id" :props="props">操作</q-th>
			</q-tr>
		</template>
		<template v-slot:body="props">
			<q-tr>
				<q-td key="type" :style="tableStyle">
					<span v-if="BookStore.bookSearch.type === ENUM_BOOK_TYPE.YSZK && BookStore.bookSearch.direction === ENUM_BOOK_DIRECTION.DAI">收款</span>
					<span v-else-if="BookStore.bookSearch.type === ENUM_BOOK_TYPE.YFZK && BookStore.bookSearch.direction === ENUM_BOOK_DIRECTION.JIE">
						付款
					</span>
				</q-td>
				<q-td key="timeCreateString" :props="props" :style="tableStyle">{{ props.row.timeCreateString }}</q-td>
				<q-td key="code" :props="props" :style="tableStyle">{{ props.row.code }}</q-td>
				<q-td key="keyOrigin" :props="props" :style="tableStyle">{{ props.row.keyOrigin }}</q-td>
				<q-td key="keyHouse" :props="props" :style="tableStyle">{{ props.row.keyHouse }}</q-td>
				<q-td key="amountBookOfOrder" :props="props" :style="tableStyle">
					{{ props.row.amountBookOfOrder.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
				</q-td>
				<q-td
					key="amountBookOfSelf"
					:props="props"
					:style="tableStyle"
					:class="{
						'text-grey': props.row.amountBookOfSelf < 1,
						purple: BookStore.bookSearch.type === ENUM_BOOK_TYPE.YSZK && props.row.amountBookOfSelf >= 1,
						'text-weight-bold': props.row.amountBookOfSelf >= 1,
					}"
				>
					{{ props.row.amountBookOfSelf.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
				</q-td>
				<q-td key="remark" :props="props" :style="tableStyle">
					<span class="cursor-pointer" :class="props.row.remark ? '' : 'text-grey'">
						{{ props.row.remark || "-" }}
					</span>
				</q-td>
				<q-td key="_id" :props="props" :style="tableStyle">
					<span v-if="props.row.isDisabled === false" class="cursor-pointer text-teal" @click="pick(props.row)"> 开票 </span>
				</q-td>
			</q-tr>
		</template>
		<template v-slot:bottom="props">
			<span class="text-grey">
				<!-- <q-carousel vertical animated infinite :autoplay="4000" navigation v-model="swiperIndex" height="16px">
					<q-carousel-slide :name="0" class="q-pa-none">【商品分类】从A商品长按至B商品，可以批量选中A-B之间的所有商品...</q-carousel-slide>
					<q-carousel-slide :name="1" class="q-pa-none">【商品分类】单击选择商品，即可以加入开单</q-carousel-slide>
				</q-carousel> -->
			</span>
			<q-space></q-space>
			<div>
				<span>{{ BookStore.bookList.length }} / {{ BookStore.total }}</span>
			</div>
		</template>
	</q-table>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { cloneDeep, debounce } from "lodash";
import { MongodbSort, ENUM_BOOK_TYPE, ENUM_BOOK_DIRECTION } from "qqlx-core";
import type { Book } from "qqlx-core/schema/wmss/book";

import { useNotifyStore } from "@/stores/notify";
import { useBookStore } from "@/stores/book";
import { useOrderStore } from "@/stores/order";
import { useInvoiceStore } from "@/stores/invoice";

const router = useRouter();
const NotifyStore = useNotifyStore();
const OrderStore = useOrderStore();
const BookStore = useBookStore();
const InvoiceStore = useInvoiceStore();

const tableStyle = { "font-size": "16px" };

const debounceGet = debounce(() => BookStore.get(), 200);
const loadPage = (details: { index: number; from: number; to: number; direction: "increase" | "decrease" }) => {
	if (details.index + 11 >= details.to && details.to > 0) {
		debounceGet();
	}
};

const pick = (book: Book) => {
	const b = cloneDeep(book);
	const gap = InvoiceStore.invoiceEditor.amount - nowAmount.value;

	let amount = b.amountBookOfOrder - b.amountBookOfSelf;
	if (InvoiceStore.invoiceEditor.amount > 0) {
		if (amount > gap) amount = gap > 0 ? gap : 0;
		else if (gap === 0) amount = 0;
	}
	b.amount = amount > 0 ? amount : 0;
	BookStore.bookListPicked.push(b);
};

// action
const nowAmount = computed({
	get() {
		let amount = 0;
		BookStore.bookListPicked && BookStore.bookListPicked.map((e) => (amount += Number(e.amount)));
		return Number(parseInt((amount * 100).toString()) / 100);
	},
	set() {},
});
onMounted(async () => {
	const edit = InvoiceStore.invoiceEditor;
	const charge1 = edit.type === ENUM_BOOK_TYPE.YSZK_VAT && edit.direction === ENUM_BOOK_DIRECTION.JIE;
	const charge2 = edit.type === ENUM_BOOK_TYPE.YFZK_VAT && edit.direction === ENUM_BOOK_DIRECTION.DAI;

	if (charge1) BookStore.setSchema(BookStore.getSchema(ENUM_BOOK_TYPE.YSZK, ENUM_BOOK_DIRECTION.DAI));
	else if (charge2) BookStore.setSchema(BookStore.getSchema(ENUM_BOOK_TYPE.YFZK, ENUM_BOOK_DIRECTION.JIE));
	else {
		NotifyStore.fail(`信息异常，请重新试试`);
		router.replace("/wmss/finance/invoice");
		return;
	}

	BookStore.isAmountBookOfSelfRest = true;
	BookStore.get(1);
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

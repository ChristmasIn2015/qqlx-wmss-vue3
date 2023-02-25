<template>
	<div class="q-pt-md q-pb-lg">
		<div class="text-h4 text-white text-weight-bold">开票明细</div>
		<div class="text-white q-pt-sm">
			<div>记录收付款的发票信息。</div>
		</div>
	</div>

	<div class="q-pb-sm row">
		<q-btn-group class="q-mr-sm">
			<q-btn
				push
				square
				label="收款"
				:color="BookStore.bookSearch.type === ENUM_BOOK_TYPE.YSZK && BookStore.bookSearch.direction === ENUM_BOOK_DIRECTION.DAI ? 'teal' : 'white'"
				:text-color="BookStore.bookSearch.type === ENUM_BOOK_TYPE.YSZK && BookStore.bookSearch.direction === ENUM_BOOK_DIRECTION.DAI ? 'white' : 'grey'"
				@click="
					() => {
						BookStore.setSchema(BookStore.getSchema(ENUM_BOOK_TYPE.YSZK, ENUM_BOOK_DIRECTION.DAI));
						BookStore.get(1);
					}
				"
			/>
			<q-btn
				push
				square
				label="付款"
				:color="BookStore.bookSearch.type === ENUM_BOOK_TYPE.YFZK && BookStore.bookSearch.direction === ENUM_BOOK_DIRECTION.JIE ? 'teal' : 'white'"
				:text-color="BookStore.bookSearch.type === ENUM_BOOK_TYPE.YFZK && BookStore.bookSearch.direction === ENUM_BOOK_DIRECTION.JIE ? 'white' : 'grey'"
				@click="
					() => {
						BookStore.setSchema(BookStore.getSchema(ENUM_BOOK_TYPE.YFZK, ENUM_BOOK_DIRECTION.JIE));
						BookStore.get(1);
					}
				"
			/>
		</q-btn-group>
		<q-btn
			class="q-mr-sm"
			push
			square
			label="最近删除"
			:color="BookStore.bookSearch.isDisabled ? 'teal' : 'white'"
			:text-color="BookStore.bookSearch.isDisabled ? '' : 'grey'"
			@click="
				() => {
					BookStore.bookSearch.isDisabled = !BookStore.bookSearch.isDisabled;
					BookStore.get(1);
				}
			"
		/>

		<q-space></q-space>
		<q-btn color="white" text-color="black" class="text-body1 q-ml-sm">
			<q-icon name="date_range" class="q-mr-xs" style="margin-bottom: -4px"></q-icon>
			{{ timePicked.from }} ~ {{ timePicked.to }}
			<q-menu>
				<q-date v-model="timePicked" range first-day-of-week="1" color="teal" @update:model-value="timeChange" />
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
			{ name: 'amount', field: 'amount', label: '初始金额' },
			{ name: 'amountBookOfSelf', field: 'amountBookOfSelf', label: '已结清金额' },
			{ name: 'amountBookOfSelfRest', field: 'amountBookOfSelfRest', label: '剩余' },
			{ name: 'remark', field: 'remark', label: '备注', align: 'left' },
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
					key="amount"
					:props="props"
					class="cursor-pointer"
					:class="{ 'text-teal': BookStore.sortKey === 'amount' }"
					@click="BookStore.sort('amount')"
				>
					<span>金额</span>
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
				<q-th
					key="amountBookOfSelfRest"
					:props="props"
					class="cursor-pointer"
					:class="{ 'text-teal': BookStore.sortKey === 'amountBookOfSelfRest' }"
					@click="BookStore.sort('amountBookOfSelfRest')"
				>
					<span>可开票</span>
					<q-icon :name="BookStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
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
				<q-td key="amount" :props="props" :style="tableStyle">
					{{ props.row.amount.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
				</q-td>
				<q-td
					key="amountBookOfSelf"
					:props="props"
					:style="tableStyle"
					:class="{
						'text-grey': props.row.amountBookOfSelf < 1,
						'text-purple-8': BookStore.bookSearch.type === ENUM_BOOK_TYPE.YSZK && props.row.amountBookOfSelf >= 1,
						'text-primary': BookStore.bookSearch.type === ENUM_BOOK_TYPE.YFZK && props.row.amountBookOfSelf >= 1,
						'text-weight-bold': props.row.amountBookOfSelf >= 1,
					}"
				>
					{{ props.row.amountBookOfSelf.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
				</q-td>
				<q-td
					key="amountBookOfSelfRest"
					:props="props"
					:style="tableStyle"
					:class="{
						'text-grey': props.row.amountBookOfSelfRest < 1,
						'text-weight-bold': props.row.amountBookOfSelfRest >= 1,
					}"
				>
					{{ props.row.amountBookOfSelfRest.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
				</q-td>
				<q-td key="remark" :props="props" :style="tableStyle">
					<span class="cursor-pointer" :class="props.row.remark ? '' : 'text-grey'">
						{{ props.row.remark || "-" }}
					</span>
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
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { cloneDeep, debounce } from "lodash";
import * as XLSX from "xlsx";
import { MongodbSort, ENUM_BOOK_TYPE, ENUM_BOOK_DIRECTION } from "qqlx-core";

import { useNotifyStore } from "@/stores/notify";
import { useBookStore } from "@/stores/book";
import { useOrderStore } from "@/stores/order";

const router = useRouter();
const NotifyStore = useNotifyStore();
const OrderStore = useOrderStore();
const BookStore = useBookStore();

const tableStyle = { "font-size": "16px" };
const date = new Date();
const timePicked = ref({ from: `${date.getFullYear()}/01/01`, to: date.toLocaleString().split(" ")[0] });
const timeChange = () => {
	console.log(JSON.stringify(timePicked.value));
	if (timePicked.value) {
		BookStore.page.startTime = new Date(timePicked.value.from + " 00:00:00").getTime();
		BookStore.page.endTime = new Date(timePicked.value.to + " 23:59:59").getTime();
		BookStore.get(1);
	}
};

const debounceGet = debounce(() => BookStore.get(), 200);
const loadPage = (details: { index: number; from: number; to: number; direction: "increase" | "decrease" }) => {
	if (details.index + 19 >= details.to) {
		debounceGet();
	}
};

// action
onMounted(async () => {
	BookStore.setSchema(BookStore.getSchema(ENUM_BOOK_TYPE.YSZK, ENUM_BOOK_DIRECTION.DAI));
	OrderStore.orderListPicked = [];
	await BookStore.get(1);
});
</script>

<style lang="sass" scoped>
.my-sticky-header-table
  /* height or max-height is important */
  height: 700px

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

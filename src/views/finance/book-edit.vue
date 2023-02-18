<template>
	<div class="q-pt-md q-pb-lg">
		<div class="text-h5 text-white text-weight-bold">
			<q-btn color="white" text-color="black" icon="arrow_back" @click="router.back()"></q-btn>
			创建{{ nowTypeName }}
		</div>
		<div class="text-white q-pt-sm">
			<div>1.选择订单，点击结清后，即可以在“资金记录”、“订单列表”中看到对应资金情况；</div>
		</div>
	</div>

	<div class="row items-stretch q-mb-sm">
		<div class="col-8">
			<q-table
				class="my-sticky-header-table"
				dense
				:columns="[
					{ name: 'code', field: 'code', label: '编号', align: 'left' },
					{ name: 'contactId', field: 'contactId', label: '客户', align: 'left' },
					{ name: 'amount', field: 'amount', label: '金额', align: 'right' },
					{ name: 'remark', field: 'remark', label: '备注', align: 'left' },
					{ name: 'remark', field: 'remark', label: '备注', align: 'left' },
					{ name: '_id', field: '_id', align: 'left', label: '操作' },
				]"
				row-key="_id"
				:rows-per-page-options="[0]"
				:rows="OrderStore.orderListPicked"
			>
				<template v-slot:header="props">
					<q-tr :props="props">
						<q-th key="code" :props="props">编号</q-th>
						<q-th key="contactId" :props="props">客户</q-th>
						<q-th key="amount" :props="props">您期望结清的金额</q-th>
						<q-th key="remark" :props="props">备注</q-th>
						<q-th key="_id" :props="props">操作</q-th>
					</q-tr>
				</template>
				<template v-slot:body="props">
					<q-tr>
						<q-td key="code" :props="props" :style="tableStyle">{{ props.row.code }}</q-td>
						<q-td key="contactId" :props="props" :style="tableStyle">{{ props.row.joinContact?.name }}</q-td>
						<q-td key="amount" :style="tableStyle">
							<q-input
								dense
								square
								filled
								type="number"
								input-class="text-body1 text-right"
								placeholder="请输入金额"
								v-model="props.row.amount"
								color="pink-6"
							/>
						</q-td>
						<q-td key="remark" :props="props" :style="tableStyle">{{ props.row.remark }}</q-td>
						<q-td key="_id" style="padding: 0 4px 0 0">
							<q-btn dense class="text-negative" icon="close" flat @click="() => OrderStore.orderListPicked.splice(props.rowIndex, 1)"> </q-btn>
						</q-td>
					</q-tr>
				</template>
			</q-table>
		</div>
		<div class="col-4 q-pl-sm">
			<q-card class="full-height column">
				<q-card-section class="text-h6 text-weight-bold">资金信息 </q-card-section>
				<q-separator></q-separator>
				<q-card-section class="text-grey">
					<div class="row">
						<div class="col">编号</div>
						<div class="col text-right">{{ BookStore.bookEditor.code }}</div>
					</div>
					<div class="row">
						<div class="col">客户</div>
						<div class="col text-right">{{ BookStore.bookEditor.keyOrigin }}</div>
					</div>
					<div class="row">
						<div class="col">银行</div>
						<div class="col text-right">{{ BookStore.bookEditor.keyHouse }}</div>
					</div>
					<div class="row">
						<div class="col">时间</div>
						<div class="col text-right">{{ BookStore.bookEditor.timeCreateString }}</div>
					</div>
				</q-card-section>
				<q-separator></q-separator>
				<q-card-section class="text-grey">
					<div class="row">
						<div class="col">资金金额</div>
						<div class="col text-right text-body1 text-weight-bold">
							{{ BookStore.bookEditor.amount.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
						</div>
					</div>
					<div class="row">
						<div class="col">您期望的订单结清金额</div>
						<div class="col text-right text-pink-6 text-body1 text-weight-bold">
							{{ nowAmount.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
						</div>
					</div>
				</q-card-section>
				<q-separator></q-separator>
				<q-card-section class="text-grey">
					<div class="row">
						<div class="col">占比</div>
						<div class="col text-right text-h6 text-weight-bold" :class="{ 'text-negative': nowAmount / BookStore.bookEditor.amount > 1 }">
							{{ ((nowAmount * 100) / BookStore.bookEditor.amount).toFixed(2) }}%
						</div>
					</div>
				</q-card-section>
				<q-space></q-space>
				<q-card-actions>
					<q-space></q-space>
					<q-btn @click="router.back()">返回</q-btn>
					<q-btn color="teal" :loading="BookStore.loadding" @click="put()">结清</q-btn>
				</q-card-actions>
			</q-card>
		</div>
	</div>

	<picker-book-order />
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { cloneDeep, debounce } from "lodash";
import { MongodbSort, ENUM_BOOK_TYPE, ENUM_BOOK_DIRECTION } from "qqlx-core";

import pickerBookOrder from "@/components/picker-book-order.vue";
import { useNotifyStore } from "@/stores/notify";
import { useOrderStore } from "@/stores/order";
import { useBookStore } from "@/stores/book";

const router = useRouter();
const NotifyStore = useNotifyStore();
const OrderStore = useOrderStore();
const BookStore = useBookStore();

const tableStyle = { "font-size": "16px" };

const put = async () => {
	try {
		await BookStore.put(BookStore.bookEditor, OrderStore.orderListPicked);
		OrderStore.orderListPicked = [];
		router.back();
	} catch (error) {
		NotifyStore.fail((error as Error).message);
	}
};

// action
const nowTypeName = computed({
	get() {
		const edit = BookStore.bookEditor;
		const charge1 = edit.type === ENUM_BOOK_TYPE.YSZK && edit.direction === ENUM_BOOK_DIRECTION.DAI;
		const charge2 = edit.type === ENUM_BOOK_TYPE.YFZK && edit.direction === ENUM_BOOK_DIRECTION.JIE;
		if (charge1) return "收款单";
		else if (charge2) return "付款单";
		else return "信息异常";
	},
	set() {},
});
const nowAmount = computed({
	get() {
		let amount = 0;
		OrderStore.orderListPicked.map((e) => (amount += Number(e.amount)));
		return Number(parseInt((amount * 100).toString()) / 100);
	},
	set() {},
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

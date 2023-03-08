<template>
	<div class="q-pt-md q-pb-lg">
		<div class="text-h5 text-white text-weight-bold">
			<q-btn color="white" text-color="black" icon="arrow_back" @click="router.back()"></q-btn>
			{{ InvoiceStore.invoiceEditor._id ? "编辑" : "创建" }} {{ nowTypeName }}
		</div>
		<div class="text-white q-pt-sm">
			<div>1.选择对应资金记录，点击保存后，即可以在“发票记录”中看到对应记录；</div>
		</div>
	</div>

	<div class="row items-stretch q-mb-sm">
		<div class="col-8">
			<q-table
				class="my-sticky-header-table full-height"
				dense
				:columns="[
					{ name: 'code', field: 'code', label: '系统编号', align: 'left' },
					{ name: 'keyOrigin', field: 'keyOrigin', label: '客户', align: 'left' },
					{ name: 'amount', field: 'amount', label: '您期望的开票金额', align: 'right' },
					{ name: 'remark', field: 'remark', label: '备注', align: 'left' },
					{ name: '_id', field: '_id', align: 'left', label: '操作' },
				]"
				row-key="_id"
				:rows-per-page-options="[0]"
				:rows="BookStore.bookListPicked"
			>
				<template v-slot:header="props">
					<q-tr :props="props">
						<q-th key="code" :props="props">系统编号</q-th>
						<q-th key="keyOrigin" :props="props">客户</q-th>
						<q-th key="amount" :props="props">您期望的开票金额</q-th>
						<q-th key="remark" :props="props">备注</q-th>
						<q-th key="_id" :props="props">操作</q-th>
					</q-tr>
				</template>
				<template v-slot:body="props">
					<q-tr>
						<q-td key="code" :props="props" :style="tableStyle">{{ props.row.code }}</q-td>
						<q-td key="keyOrigin" :props="props" :style="tableStyle">{{ props.row.keyOrigin }}</q-td>
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
							<q-btn dense class="text-negative" icon="close" flat @click="() => BookStore.bookListPicked.splice(props.rowIndex, 1)"> </q-btn>
						</q-td>
					</q-tr>
				</template>
			</q-table>
		</div>
		<div class="col-4 q-pl-sm">
			<q-card class="full-height column">
				<q-card-section class="text-h5 text-weight-bold">发票信息</q-card-section>
				<q-separator></q-separator>
				<q-card-section class="text-grey text-body1">
					<div class="row">
						<div class="col">系统编号</div>
						<div class="col text-right">{{ InvoiceStore.invoiceEditor.code || "-" }}</div>
					</div>
					<div class="row">
						<div class="col">时间</div>
						<div class="col text-right">{{ InvoiceStore.invoiceEditor.timeCreateString }}</div>
					</div>
				</q-card-section>
				<q-separator></q-separator>
				<q-card-section>
					<q-select
						dense
						square
						filled
						emit-value
						map-options
						color="purple"
						class="q-mb-sm"
						placeholder="请选择抬头"
						:options="(nowCorps as any)"
						v-model="InvoiceStore.invoiceEditor.keyHouse"
						@update:model-value="InvoiceStore.get(1)"
					>
						<template v-slot:before>
							<span class="text-body1">抬头</span>
						</template>
					</q-select>
					<q-input
						dense
						square
						filled
						label="客户名称"
						color="purple"
						class="q-mb-sm"
						input-class="text-body1"
						placeholder="请输入客户名称"
						v-model="InvoiceStore.invoiceEditor.keyOrigin"
					>
						<template v-slot:before>
							<span class="text-body1">客户</span>
						</template>
					</q-input>
					<q-input
						dense
						square
						filled
						label="发票票号"
						color="purple"
						class="q-mb-sm"
						input-class="text-body1"
						placeholder="请输入票号"
						v-model="InvoiceStore.invoiceEditor.keyCode"
					>
						<template v-slot:before>
							<span class="text-body1">票号</span>
						</template>
					</q-input>
					<q-input
						dense
						square
						filled
						type="number"
						label="发票金额"
						input-class="text-body1"
						placeholder="请输入金额"
						v-model="InvoiceStore.invoiceEditor.amount"
						color="purple"
					>
						<template v-slot:before>
							<span class="text-body1">金额</span>
						</template>
					</q-input>
				</q-card-section>
				<q-separator></q-separator>
				<q-card-section class="text-grey text-body1">
					<div class="row">
						<div class="col">
							已选金额

							<span class="text-purple cursor-pointer" @click="InvoiceStore.invoiceEditor.amount = nowAmount">设为发票金额</span>
						</div>
						<div class="col text-right text-weight-bold">
							{{ nowAmount.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
						</div>
					</div>
				</q-card-section>
				<q-separator></q-separator>
				<q-space></q-space>
				<q-card-actions>
					<q-space></q-space>
					<q-btn @click="router.back()">返回</q-btn>
					<q-btn color="purple" :loading="InvoiceStore.loadding" @click="action()">保存</q-btn>
				</q-card-actions>
			</q-card>
		</div>
	</div>

	<picker-book />
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { cloneDeep, debounce } from "lodash";
import { MongodbSort, ENUM_BOOK_TYPE, ENUM_BOOK_DIRECTION } from "qqlx-core";

import pickerBook from "@/components/picker-book.vue";
import { useNotifyStore } from "@/stores/notify";
import { useCorpStore } from "@/stores/corp";
import { useConfigCorp } from "@/stores/configCorp";
import { useOrderStore } from "@/stores/order";
import { useBookStore } from "@/stores/book";
import { useInvoiceStore } from "@/stores/invoice";

const router = useRouter();
const NotifyStore = useNotifyStore();
const CorpStore = useCorpStore();
const ConfigCorp = useConfigCorp();
const BookStore = useBookStore();
const InvoiceStore = useInvoiceStore();

const tableStyle = { "font-size": "16px" };

const action = async () => {
	try {
		if (InvoiceStore.invoiceEditor._id) {
			await InvoiceStore.put(InvoiceStore.invoiceEditor, BookStore.bookListPicked);
		} else {
			const create = await InvoiceStore.post(InvoiceStore.invoiceEditor);
			if (create && create[0]) await InvoiceStore.put(create[0], BookStore.bookListPicked);
		}
		BookStore.bookListPicked = [];
		router.back();
	} catch (error) {
		NotifyStore.fail((error as Error).message);
	}
};

// action
const nowTypeName = computed({
	get() {
		const edit = InvoiceStore.invoiceEditor;
		const charge1 = edit.type === ENUM_BOOK_TYPE.YSZK_VAT && edit.direction === ENUM_BOOK_DIRECTION.JIE;
		const charge2 = edit.type === ENUM_BOOK_TYPE.YFZK_VAT && edit.direction === ENUM_BOOK_DIRECTION.DAI;
		if (charge1) return "增值税（销项）发票记录";
		else if (charge2) return "增值税（进项）发票记录";
		else return "信息异常";
	},
	set() {},
});
const nowCorps = computed({
	get() {
		const nowCorp = CorpStore.corpPicked;
		const list: string[] = [nowCorp.name, ...ConfigCorp.titles.map((e) => e.text)];
		return list;
	},
	set() {},
});
const nowAmount = computed({
	get() {
		let amount = 0;
		BookStore.bookListPicked.map((e) => (amount += Number(e.amount)));
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

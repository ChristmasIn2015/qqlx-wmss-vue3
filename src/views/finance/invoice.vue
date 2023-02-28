<template>
	<div class="q-pt-md q-pb-lg">
		<div class="text-h4 text-white text-weight-bold">发票</div>
		<div class="text-white q-pt-sm">
			<div>1.您可以根据实际收付款情况，对不同资金记录制作对应发票记录；</div>
			<div>2.对记录记录点击修改，可以将实际收付款情况对应到资金记录中；</div>
		</div>
	</div>

	<div class="q-pb-sm row">
		<q-btn-group class="q-mr-sm">
			<q-btn
				push
				square
				label="销项发票"
				:color="
					InvoiceStore.invoiceSearch.type === ENUM_BOOK_TYPE.YSZK_VAT && InvoiceStore.invoiceSearch.direction === ENUM_BOOK_DIRECTION.JIE
						? 'purple'
						: 'white'
				"
				:text-color="
					InvoiceStore.invoiceSearch.type === ENUM_BOOK_TYPE.YSZK_VAT && InvoiceStore.invoiceSearch.direction === ENUM_BOOK_DIRECTION.JIE
						? 'white'
						: 'grey'
				"
				@click="
					() => {
						InvoiceStore.setSchema(InvoiceStore.getSchema(ENUM_BOOK_TYPE.YSZK_VAT, ENUM_BOOK_DIRECTION.JIE));
						startIndex = -1;
						endIndex = -1;
						InvoiceStore.get(1);
					}
				"
			/>
			<q-btn
				push
				square
				label="进项发票"
				:color="
					InvoiceStore.invoiceSearch.type === ENUM_BOOK_TYPE.YFZK_VAT && InvoiceStore.invoiceSearch.direction === ENUM_BOOK_DIRECTION.DAI
						? 'purple'
						: 'white'
				"
				:text-color="
					InvoiceStore.invoiceSearch.type === ENUM_BOOK_TYPE.YFZK_VAT && InvoiceStore.invoiceSearch.direction === ENUM_BOOK_DIRECTION.DAI
						? 'white'
						: 'grey'
				"
				@click="
					() => {
						InvoiceStore.setSchema(InvoiceStore.getSchema(ENUM_BOOK_TYPE.YFZK_VAT, ENUM_BOOK_DIRECTION.DAI));
						startIndex = -1;
						endIndex = -1;
						InvoiceStore.get(1);
					}
				"
			/>
		</q-btn-group>
		<q-btn
			push
			square
			label="最近删除"
			class="q-mr-sm"
			:color="InvoiceStore.invoiceSearch.isDisabled ? 'purple' : 'white'"
			:text-color="InvoiceStore.invoiceSearch.isDisabled ? '' : 'grey'"
			@click="
				() => {
					InvoiceStore.invoiceSearch.isDisabled = !InvoiceStore.invoiceSearch.isDisabled;
					InvoiceStore.get(1);
				}
			"
		/>

		<q-space></q-space>

		<q-btn
			push
			square
			label="继续添加"
			class="q-ml-sm"
			color="purple"
			:loading="InvoiceStore.loadding"
			@click="
				() => {
					InvoiceStore.setSchema(InvoiceStore.getSchema(InvoiceStore.invoiceSearch.type, InvoiceStore.invoiceSearch.direction));
					router.push('/wmss/finance/invoice-edit');
				}
			"
		/>
		<q-btn color="white" text-color="black" class="text-body1 q-ml-sm">
			<q-icon name="date_range" class="q-mr-xs" style="margin-bottom: -4px"></q-icon>
			{{ InvoiceStore.timeQuasarPicked?.from }} ~ {{ InvoiceStore.timeQuasarPicked?.to }}
			<q-menu>
				<q-date v-model="InvoiceStore.timeQuasarPicked" range first-day-of-week="1" color="purple" @update:model-value="InvoiceStore.timeChange" />
			</q-menu>
		</q-btn>
	</div>

	<q-card>
		<q-table
			dense
			row-key="_id"
			separator="cell"
			class="my-sticky-header-table"
			:columns="[
				{ name: 'type', field: 'type', label: '分类', align: 'left' },
				{ name: 'timeCreateString', field: 'timeCreateString', label: '时间', align: 'left' },
				{ name: 'code', field: 'code', label: '系统编号', align: 'left' },
				{ name: 'keyCode', field: 'keyCode', label: '票号', align: 'left' },
				{ name: 'headerId', field: 'headerId', label: '抬头', align: 'left' },
				{ name: 'keyOrigin', field: 'keyOrigin', label: '客户', align: 'left' },
				{ name: 'amount', field: 'amount', label: '发票金额' },
				{ name: 'amountBookOfSelf', field: 'amountBookOfSelf', label: '有效金额' },
				{ name: 'remark', field: 'remark', label: '备注', align: 'left' },
				{ name: '_id', field: '_id', label: '操作', align: 'left' },
			]"
			:loading="InvoiceStore.loadding"
			:rows-per-page-options="[0]"
			:rows="InvoiceStore.invoiceList"
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
						:class="{ 'text-purple': InvoiceStore.sortKey === 'timeCreate' }"
						@click="InvoiceStore.sort('timeCreate')"
					>
						<span>时间</span>
						<q-icon :name="InvoiceStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
					</q-th>
					<q-th key="code" :props="props">
						<q-input
							square
							filled
							dense
							clearable
							color="purple"
							clear-icon="close"
							placeholder="搜索系统编号"
							v-model="InvoiceStore.invoiceSearch.code"
							@blur="InvoiceStore.get(1)"
						/>
					</q-th>
					<q-th key="keyCode" :props="props">
						<q-input
							square
							filled
							dense
							clearable
							color="purple"
							clear-icon="close"
							placeholder="搜索号票号"
							v-model="InvoiceStore.invoiceSearch.keyCode"
							@blur="InvoiceStore.get(1)"
						/>
					</q-th>
					<q-th key="headerId" :props="props">
						<q-select
							dense
							square
							filled
							emit-value
							map-options
							color="purple"
							:options="(nowCorps as any)"
							v-model="InvoiceStore.invoiceSearch.headerId"
							@update:model-value="InvoiceStore.get(1)"
						/>
					</q-th>
					<q-th key="keyOrigin" :props="props">
						<q-input
							square
							filled
							dense
							clearable
							color="purple"
							clear-icon="close"
							placeholder="搜索客户"
							v-model="InvoiceStore.invoiceSearch.keyOrigin"
							@blur="InvoiceStore.get(1)"
						/>
					</q-th>
					<q-th
						key="amount"
						:props="props"
						class="cursor-pointer"
						:class="{ 'text-purple': InvoiceStore.sortKey === 'amount' }"
						@click="InvoiceStore.sort('amount')"
					>
						<span>发票金额</span>
						<q-icon :name="InvoiceStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
					</q-th>
					<q-th
						key="amountBookOfSelf"
						:props="props"
						class="cursor-pointer"
						:class="{ 'text-purple': InvoiceStore.sortKey === 'amountBookOfSelf' }"
						@click="InvoiceStore.sort('amountBookOfSelf')"
					>
						<span>有效金额</span>
						<q-icon :name="InvoiceStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
					</q-th>
					<q-th key="remark" :props="props">
						<q-input
							square
							filled
							dense
							clearable
							color="purple"
							clear-icon="close"
							placeholder="搜索备注"
							v-model="InvoiceStore.invoiceSearch.remark"
							@blur="InvoiceStore.get(1)"
						/>
					</q-th>
					<q-th key="_id" :props="props">操作</q-th>
				</q-tr>
			</template>
			<template v-slot:body="props">
				<q-tr
					class="cursor-crosshair select-none"
					:class="{
						'bg-grey-4': startIndex <= props.rowIndex && endIndex >= props.rowIndex,
					}"
					@mousedown.capture.stop="
						() => {
							endIndex = props.rowIndex;
							startIndex = props.rowIndex;
						}
					"
					@mouseup.capture.stop="
						() => {
							endIndex = props.rowIndex > startIndex ? props.rowIndex : startIndex;
						}
					"
				>
					<q-td key="type" :style="tableStyle">
						<span
							v-if="
								InvoiceStore.invoiceSearch.type === ENUM_BOOK_TYPE.YSZK_VAT && InvoiceStore.invoiceSearch.direction === ENUM_BOOK_DIRECTION.JIE
							"
						>
							销项
						</span>
						<span
							v-else-if="
								InvoiceStore.invoiceSearch.type === ENUM_BOOK_TYPE.YFZK_VAT && InvoiceStore.invoiceSearch.direction === ENUM_BOOK_DIRECTION.DAI
							"
						>
							进项
						</span>
					</q-td>
					<q-td key="timeCreateString" :props="props" :style="tableStyle">{{ props.row.timeCreateString }}</q-td>
					<q-td key="code" :props="props" :style="tableStyle">{{ props.row.code }}</q-td>
					<q-td key="keyCode" :props="props" :style="tableStyle">{{ props.row.keyCode }}</q-td>
					<q-td key="headerId" :props="props" :style="tableStyle">{{ props.row.joinHeader?.name }}</q-td>
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
							'text-weight-bold': props.row.amountBookOfSelf > 0,
							'text-purple': props.row.amountBookOfSelf > 0,
							'text-grey': props.row.amountBookOfSelf <= 0,
						}"
					>
						{{ props.row.amountBookOfSelf.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
					</q-td>
					<q-td key="remark" :props="props" :style="tableStyle">
						<span class="cursor-pointer" :class="props.row.remark ? '' : 'text-grey'">
							{{ props.row.remark || "点击修改备注" }}
							<q-menu anchor="top left" @hide="InvoiceStore.put(props.row)">
								<q-card class="w-400">
									<q-toolbar class="bg-purple text-white">
										<q-toolbar-title>修改备注</q-toolbar-title>
										<q-btn dense flat icon="close" v-close-popup></q-btn>
									</q-toolbar>

									<q-card-section>
										<q-input filled :label="props.row.code" v-model="props.row.remark" color="purple"> </q-input>
									</q-card-section>

									<q-card-actions>
										<q-space></q-space>
										<span class="text-grey">自动保存</span>
									</q-card-actions>
								</q-card>
							</q-menu>
						</span>
					</q-td>
					<q-td key="_id" :props="props" :style="tableStyle">
						<span v-if="props.row.isDisabled === false" class="cursor-pointer text-purple" @click="toEdit(props.row)"> 修改 </span>
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
					<span v-show="endIndex !== -1 && endIndex - startIndex >= 0">
						已选择 {{ endIndex - startIndex + 1 }} 项

						<a
							class="q-ml-sm text-body2 text-weight-bold text-negative cursor-pointer"
							@click="
								() => {
									InvoiceStore.delete(InvoiceStore.invoiceList.slice(startIndex, endIndex + 1));
									startIndex = -1;
									endIndex = -1;
								}
							"
						>
							点击{{ InvoiceStore.invoiceSearch.isDisabled ? "恢复" : "删除" }}
						</a>
						，</span
					>
					<span>{{ InvoiceStore.invoiceList.length }} / {{ InvoiceStore.total }}</span>
				</div>
			</template>
		</q-table>
	</q-card>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { cloneDeep, debounce } from "lodash";
import * as XLSX from "xlsx";
import { MongodbSort, ENUM_BOOK_TYPE, ENUM_BOOK_DIRECTION } from "qqlx-core";
import type { InvoiceInView } from "qqlx-core/dto/wmss/invoice";
import type { Book } from "qqlx-core/schema/wmss/book";

import { useNotifyStore } from "@/stores/notify";
import { useCorpStore } from "@/stores/corp";
import { useInvoiceStore } from "@/stores/invoice";
import { useBookStore } from "@/stores/book";
import { useOrderStore } from "@/stores/order";

const router = useRouter();
const NotifyStore = useNotifyStore();
const CorpStore = useCorpStore();
const OrderStore = useOrderStore();
const InvoiceStore = useInvoiceStore();
const BookStore = useBookStore();

const tableStyle = { "font-size": "16px" };

const debounceGet = debounce(() => InvoiceStore.get(), 200);
const loadPage = (details: { index: number; from: number; to: number; direction: "increase" | "decrease" }) => {
	if (details.index + 19 >= details.to) {
		debounceGet();
	}
};

const startIndex = ref(-1);
const endIndex = ref(-1);

// action
const toEdit = (invoice: InvoiceInView) => {
	const _invoice = cloneDeep(invoice);
	InvoiceStore.setSchema(_invoice);

	const books: Book[] = [];
	_invoice.joinBookOfSelf?.map((e) => {
		const origin = e.joinBook;
		if (origin) {
			origin.amount = e.amount;
			books.push(origin);
		}
	});

	BookStore.bookListPicked = books;
	router.push("/wmss/finance/invoice-edit");
};
const nowCorps = computed({
	get() {
		return CorpStore.corpList.filter((e) => e.isDisabled === false).map((e) => ({ label: e.name, value: e._id }));
	},
	set() {},
});
onMounted(async () => {
	InvoiceStore.setSchema(InvoiceStore.getSchema(ENUM_BOOK_TYPE.YSZK_VAT, ENUM_BOOK_DIRECTION.JIE));
	BookStore.bookListPicked = [];
	await InvoiceStore.get(1);
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

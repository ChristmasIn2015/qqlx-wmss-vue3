<template>
	<div class="q-pt-md q-pb-lg">
		<div class="text-h5 text-white text-weight-bold">财务凭证</div>
		<div class="text-white q-pt-sm">
			<div>记录收付款的发票信息。</div>
		</div>
	</div>

	<div class="q-pb-sm row">
		<q-btn-group class="q-mr-sm">
			<q-btn
				glossy
				square
				label="收款"
				:color="BookStore.bookSearch.type === ENUM_BOOK_TYPE.YSZK && BookStore.bookSearch.direction === ENUM_BOOK_DIRECTION.DAI ? 'teal' : 'white'"
				:text-color="BookStore.bookSearch.type === ENUM_BOOK_TYPE.YSZK && BookStore.bookSearch.direction === ENUM_BOOK_DIRECTION.DAI ? 'white' : 'grey'"
				@click="
					() => {
						BookStore.setSchema(BookStore.getSchema(ENUM_BOOK_TYPE.YSZK, ENUM_BOOK_DIRECTION.DAI));
						startIndex = -1;
						endIndex = -1;
						BookStore.get(1);
					}
				"
			/>
			<q-btn
				glossy
				square
				label="付款"
				:color="BookStore.bookSearch.type === ENUM_BOOK_TYPE.YFZK && BookStore.bookSearch.direction === ENUM_BOOK_DIRECTION.JIE ? 'teal' : 'white'"
				:text-color="BookStore.bookSearch.type === ENUM_BOOK_TYPE.YFZK && BookStore.bookSearch.direction === ENUM_BOOK_DIRECTION.JIE ? 'white' : 'grey'"
				@click="
					() => {
						BookStore.setSchema(BookStore.getSchema(ENUM_BOOK_TYPE.YFZK, ENUM_BOOK_DIRECTION.JIE));
						startIndex = -1;
						endIndex = -1;
						BookStore.get(1);
					}
				"
			/>
		</q-btn-group>
		<q-btn
			class="q-mr-sm"
			glossy
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
		<span v-if="BookStore.bookListExcel.length > 0">
			<q-btn glossy color="teal" class="q-ml-sm" :loading="BookStore.loadding" label="保存" @click="() => BookStore.post()" />
			<q-btn glossy label="清空" class="q-ml-sm" color="white" text-color="negative" @click="() => (BookStore.bookListExcel = [])" />
			<q-btn glossy color="white" class="q-ml-sm" text-color="black" label="批量导入">
				<q-menu>
					<q-list>
						<q-item clickable @click="NotifyStore.download()">
							<q-item-section>下载模板</q-item-section>
						</q-item>
						<q-item clickable>
							<q-item-section>
								<q-file dense borderless accept=".xlsx, .xls" v-model="filePicking" label="选择文件" @update:model-value="filePickNext" />
							</q-item-section>
						</q-item>
					</q-list>
				</q-menu>
			</q-btn>
		</span>

		<q-btn
			class="q-ml-sm"
			color="teal"
			:loading="BookStore.loadding"
			glossy
			label="继续添加"
			@click="() => BookStore.bookListExcel.push(BookStore.getSchema())"
		/>
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
			{ name: 'amountBookOfOrder', field: 'amountBookOfOrder', label: '已结清金额' },
			{ name: 'amountBookOfOrderRest', field: 'amountBookOfOrderRest', label: '剩余' },
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
		<template v-slot:top-row>
			<q-tr v-for="(schema, index) in BookStore.bookListExcel">
				<q-td :style="tableStyle">
					<span v-if="BookStore.bookSearch.type === ENUM_BOOK_TYPE.YSZK && BookStore.bookSearch.direction === ENUM_BOOK_DIRECTION.DAI">收款</span>
					<span v-else-if="BookStore.bookSearch.type === ENUM_BOOK_TYPE.YFZK && BookStore.bookSearch.direction === ENUM_BOOK_DIRECTION.JIE"
						>付款</span
					>
				</q-td>
				<q-td :style="tableStyle">{{ schema.timeCreateString }}</q-td>
				<q-td :style="tableStyle">-</q-td>
				<q-td :style="tableStyle">
					<q-input dense square filled clearable color="teal" clear-icon="close" placeholder="请输入客户" v-model="schema.keyOrigin" />
				</q-td>
				<q-td :style="tableStyle">
					<q-input dense square filled clearable color="teal" clear-icon="close" placeholder="请输入银行" v-model="schema.keyHouse" />
				</q-td>
				<q-td :style="tableStyle">
					<q-input dense square filled color="teal" input-class="text-right" placeholder="请输入金额" v-model="schema.amount" />
				</q-td>
				<q-td :style="tableStyle"> </q-td>
				<q-td :style="tableStyle">-</q-td>
				<q-td :style="tableStyle">
					<q-input dense square filled clearable color="teal" clear-icon="close" placeholder="请输入备注" v-model="schema.remark" />
				</q-td>
				<q-td :style="tableStyle">
					<q-btn icon="close" dense class="text-negative" flat @click="() => BookStore.bookListExcel.splice(index, 1)"> </q-btn>
				</q-td>
			</q-tr>
		</template>
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
					key="amountBookOfOrder"
					:props="props"
					class="cursor-pointer"
					:class="{ 'text-teal': BookStore.sortKey === 'amountBookOfOrder' }"
					@click="BookStore.sort('amountBookOfOrder')"
				>
					<span>已结清金额</span>
					<q-icon :name="BookStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th
					key="amountBookOfOrderRest"
					:props="props"
					class="cursor-pointer"
					:class="{ 'text-teal': BookStore.sortKey === 'amountBookOfOrderRest' }"
					@click="BookStore.sort('amountBookOfOrderRest')"
				>
					<span>剩余</span>
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
				<q-th key="_id" :props="props">操作</q-th>
			</q-tr>
		</template>
		<template v-slot:body="props">
			<q-tr
				class="cursor-crosshair"
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
					key="amountBookOfOrder"
					:props="props"
					:style="tableStyle"
					:class="{
						'text-grey': props.row.amountBookOfOrder < 1,
						'text-pink-6': BookStore.bookSearch.type === ENUM_BOOK_TYPE.YSZK && props.row.amountBookOfOrder >= 1,
						'text-primary': BookStore.bookSearch.type === ENUM_BOOK_TYPE.YFZK && props.row.amountBookOfOrder >= 1,
						'text-weight-bold': props.row.amountBookOfOrder >= 1,
					}"
				>
					{{ props.row.amountBookOfOrder.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
				</q-td>
				<q-td
					key="amountBookOfOrderRest"
					:props="props"
					:style="tableStyle"
					:class="{
						'text-grey': props.row.amountBookOfOrderRest < 1,
						'text-weight-bold': props.row.amountBookOfOrderRest >= 1,
					}"
				>
					{{ props.row.amountBookOfOrderRest.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
				</q-td>
				<q-td key="remark" :props="props" :style="tableStyle">
					<span class="cursor-pointer" :class="props.row.remark ? '' : 'text-grey'">
						{{ props.row.remark || "点击修改备注" }}
						<q-menu anchor="top left" @hide="BookStore.put(props.row)">
							<q-card class="w-400">
								<q-toolbar class="bg-teal text-white">
									<q-toolbar-title>修改备注</q-toolbar-title>
									<q-btn dense flat icon="close" v-close-popup></q-btn>
								</q-toolbar>

								<q-card-section>
									<q-input filled :label="props.row.code" v-model="props.row.remark" color="teal"> </q-input>
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
					<span
						v-if="props.row.isDisabled === false"
						class="cursor-pointer text-teal"
						@click="
							() => {
								BookStore.setSchema(props.row);
								OrderStore.orderListPicked = cloneDeep(props.row.joinBookOfOrder);
								router.push('/wmss/finance/book-edit');
							}
						"
					>
						结清{{ BookStore.bookSearch.type === ENUM_BOOK_TYPE.YSZK ? "销售单" : "采购单" }}
					</span>
				</q-td>
			</q-tr>
		</template>
		<template v-slot:bottom="props">
			<span class="text-grey">
				<!-- <q-carousel vertical animated infinite :autoplay="4000" navigation v-model="swiperIndex" height="16px">
					<q-carousel-slide :name="0" class="q-pa-none">【货架】从A商品长按至B商品，可以批量选中A-B之间的所有商品...</q-carousel-slide>
					<q-carousel-slide :name="1" class="q-pa-none">【货架】单击选择商品，即可以加入开单</q-carousel-slide>
				</q-carousel> -->
			</span>
			<q-space></q-space>
			<div>
				<span v-show="BookStore.bookListExcel.length > 0">正在导入 {{ BookStore.bookListExcel.length }} 项，</span>
				<span v-show="endIndex !== -1 && endIndex - startIndex >= 0">
					已选择 {{ endIndex - startIndex + 1 }} 项

					<a
						class="q-ml-sm text-negative cursor-pointer"
						@click="
							() => {
								BookStore.delete(BookStore.bookList.slice(startIndex, endIndex + 1));
								startIndex = -1;
								endIndex = -1;
							}
						"
					>
						点击{{ BookStore.bookSearch.isDisabled ? "恢复" : "删除" }}
					</a>
					，</span
				>
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

const swiperIndex = ref(0);
const startIndex = ref(-1);
const endIndex = ref(-1);
const filePicking = ref(null);
const filePickNext = async (file: File) => {
	if (!file) return;
	const reader = new FileReader(); // WebAPI
	reader.onload = async () => {
		try {
			const workbook = XLSX.read(reader.result, { type: "binary" });
			const sheet = workbook.Sheets["资金导入"];
			if (!sheet) throw new Error(`找不到表格 [资金导入] !`);
			const rowJsonList: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

			// 1.批量上传客户
			const uploading = [];
			for (let i in rowJsonList) {
				const row = rowJsonList[i];
				const schema = BookStore.getSchema(BookStore.bookSearch.type, BookStore.bookSearch.direction);
				schema.keyOrigin = String(row["@客户名称"] || "");
				schema.keyHouse = String(row["@银行"] || "");
				schema.amount = Number(row["@金额"] || 0) || 0;
				schema.remark = String(row["@备注"] || "");

				const date = row["@日期"] || "";
				if (typeof date === "string") {
					const _date = new Date(date);
					schema.timeCreate = _date.getTime();
					schema.timeCreateString = _date.toLocaleString();
				} else if (typeof date === "number") {
					const time = new Date(new Date("1900/1/1 00:00:00").getTime() + (date - 2) * 86400000 + 1000 * 60 * 60);
					schema.timeCreate = time.getTime();
					schema.timeCreateString = time.toLocaleString();
				}
				uploading.push(schema);
			}
			BookStore.bookListExcel = uploading;
		} catch (error) {
			NotifyStore.fail((error as Error).message);
		}
	};
	reader.readAsBinaryString(file);
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

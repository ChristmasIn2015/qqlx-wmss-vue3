<template>
	<q-table
		dense
		row-key="_id"
		class="my-sticky-header-table"
		separator="cell"
		:columns="[
			{ name: '_id', field: '_id', label: '货架', align: 'left', style: 'font-size: 16px; width: 80px;' },
			{ name: 'name', field: 'name', label: '品名', align: 'left', style: 'font-size: 16px; width: 188px;' },
			{ name: 'norm', field: 'norm', label: '规格', align: 'left', style: 'font-size: 16px; width: 188px;' },
			{ name: 'countFinal', field: 'countFinal', label: '库存', style: 'font-size: 16px; width: 120px;' },
			{ name: 'price', field: 'price', label: '推荐单价', style: 'font-size: 16px; width: 120px;' },
			{ name: 'timeCreateString', field: 'timeCreateString', label: '时间', style: 'font-size: 16px; ' },
		]"
		:loading="CabinetUnitStore.loadding"
		:rows-per-page-options="[0]"
		:rows="CabinetUnitStore.cabinetUnitList"
		virtual-scroll
		:virtual-scroll-item-size="33"
		:virtual-scroll-sticky-size-start="33"
		@virtual-scroll="loadPage"
	>
		<template v-slot:top="props">
			<q-btn-group class="q-my-sm" style="margin-left: -6px">
				<q-btn
					glossy
					square
					v-for="cabinet in CabinetStore.cabinetList"
					:label="cabinet.name"
					:color="cabinetPicked._id === cabinet._id ? 'primary' : 'white'"
					:text-color="cabinetPicked._id === cabinet._id ? 'white' : 'grey'"
					@click="
						() => {
							cabinetPicked = cloneDeep(cabinet);
							CabinetUnitStore.get(cabinet, 1);
							startIndex = -1;
							endIndex = -1;
						}
					"
				/>
			</q-btn-group>

			<q-btn glossy class="q-ml-sm" label="新增" @click="() => CabinetUnitStore.cabinetUnitListExcel.push(CabinetUnitStore.getSchema())" />
			<span v-if="CabinetUnitStore.cabinetUnitListExcel.length > 0">
				<q-btn glossy color="primary" class="q-ml-sm" @click="() => CabinetUnitStore.post(cabinetPicked)">
					<span>保存</span>
				</q-btn>
				<q-btn flat color="primary" label="批量导入">
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
				<q-btn label="清空" flat color="negative" @click="() => (CabinetUnitStore.cabinetUnitListExcel = [])" />
			</span>

			<q-space></q-space>
		</template>
		<template v-slot:top-row>
			<q-tr v-for="(schema, index) in CabinetUnitStore.cabinetUnitListExcel">
				<q-td class="text-body1"> {{ cabinetPicked?.name }} </q-td>
				<q-td>
					<q-input class="ml-n6" square filled v-model="schema.name" dense clearable clear-icon="close" placeholder="请输入品名" />
				</q-td>
				<q-td>
					<q-input class="ml-n6" square filled v-model="schema.norm" dense clearable clear-icon="close" placeholder="请输入规格" />
				</q-td>
				<q-td class="text-right"></q-td>
				<q-td class="text-right">
					<q-input square filled v-model="schema.price" type="number" dense input-class="text-right" />
				</q-td>
				<q-td>
					<q-btn dense icon="close" class="text-negative" flat @click="() => CabinetUnitStore.cabinetUnitListExcel.splice(index, 1)"> </q-btn>
				</q-td>
			</q-tr>
		</template>
		<template v-slot:header="props">
			<q-tr :props="props">
				<q-th key="_id" :props="props">货架 </q-th>
				<q-th key="name" :props="props" style="width: 188px">
					<q-input
						square
						filled
						dense
						clearable
						clear-icon="close"
						placeholder="搜索品名"
						style="margin-left: -6px"
						v-model="CabinetUnitStore.cabinetUnitSearch.name"
						@blur="CabinetUnitStore.get(cabinetPicked, 1)"
					/>
				</q-th>
				<q-th key="norm" :props="props" style="width: 188px">
					<q-input
						square
						filled
						dense
						clearable
						clear-icon="close"
						placeholder="搜索规格"
						style="margin-left: -6px"
						v-model="CabinetUnitStore.cabinetUnitSearch.norm"
						@blur="CabinetUnitStore.get(cabinetPicked, 1)"
					/>
				</q-th>
				<q-th
					key="countFinal"
					:props="props"
					:class="
						cabinetPicked.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL
							? { 'text-primary': CabinetUnitStore.sortKey === 'poundsFinal' }
							: { 'text-primary': CabinetUnitStore.sortKey === 'countFinal' }
					"
					class="cursor-pointer"
					@click="CabinetUnitStore.sort(cabinetPicked, cabinetPicked.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL ? 'poundsFinal' : 'countFinal')"
				>
					<span>库存</span>
					<q-icon :name="CabinetUnitStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th
					key="price"
					:props="props"
					:class="{ 'text-primary': CabinetUnitStore.sortKey === 'price' }"
					class="cursor-pointer"
					@click="CabinetUnitStore.sort(cabinetPicked, 'price')"
				>
					<span>推荐单价 </span>
					<q-icon :name="CabinetUnitStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th
					key="timeCreateString"
					:props="props"
					:class="{ 'text-primary': CabinetUnitStore.sortKey === 'timeCreate' }"
					class="cursor-pointer"
					@click="CabinetUnitStore.sort(cabinetPicked, 'timeCreate')"
				>
					<span>时间 </span>
					<q-icon :name="CabinetUnitStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
			</q-tr>
		</template>
		<template v-slot:body="props">
			<q-tr
				:props="props"
				class="cursor-crosshair"
				style="user-select: none"
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
				<q-td key="_id" :props="props"> {{ cabinetPicked?.name }} </q-td>
				<q-td key="name" :props="props"> {{ props.row.name }} </q-td>
				<q-td key="norm" :props="props">
					{{ props.row.norm }}
				</q-td>
				<q-td key="countFinal" :props="props">
					<a class="cursor-pointer text-primary" @click="skuGetInDialog = true">
						<span v-if="cabinetPicked.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL"> {{ props.row.poundsFinal }} 吨 </span>
						<span v-else> {{ props.row.countFinal }} {{ props.row.joinCabinet?.unit }} </span>
					</a>
				</q-td>
				<q-td key="price" :props="props" :class="{}"> {{ props.row.price }} 元 </q-td>
				<q-td key="timeCreateString" :props="props">
					<div class="row">
						<a class="text-body1 text-primary cursor-pointer" @click.capture="pushSku(props.row)">开单</a>
						<q-space></q-space>
						<span>{{ props.row.timeCreateString }}</span>
					</div>
				</q-td>
			</q-tr>
		</template>
		<template v-slot:bottom="props">
			<span class="text-grey">
				<q-carousel vertical animated infinite :autoplay="4000" navigation v-model="swiperIndex" height="16px">
					<q-carousel-slide :name="0" class="q-pa-none">【货架】从A商品长按至B商品，可以批量选中A-B之间的所有商品...</q-carousel-slide>
					<q-carousel-slide :name="1" class="q-pa-none">【货架】单击选择商品，即可以加入开单</q-carousel-slide>
				</q-carousel>
			</span>
			<q-space></q-space>
			<div>
				<span v-show="CabinetUnitStore.cabinetUnitListExcel.length > 0">正在导入 {{ CabinetUnitStore.cabinetUnitListExcel.length }} 项，</span>
				<span v-show="endIndex !== -1 && endIndex - startIndex >= 0"
					>已选择 {{ endIndex - startIndex + 1 }} 项

					<a
						class="q-ml-sm text-primary cursor-pointer"
						flat
						:disable="CabinetUnitStore.cabinetUnitList.length === 0 || !(startIndex > -1 && endIndex - startIndex >= 0)"
					>
						点击编辑
						<q-menu>
							<q-list>
								<q-item clickable @click="dialogPatching = true">
									<q-item-section>修改单价（{{ 1 + endIndex - startIndex }}）</q-item-section>
								</q-item>
								<q-item
									clickable
									@click="
										async () => {
											await CabinetUnitStore.delete(cabinetPicked, CabinetUnitStore.cabinetUnitList.slice(startIndex, endIndex + 1));

											startIndex = -1;
											endIndex = -1;
										}
									"
								>
									<q-item-section class="text-negative">删除 ({{ 1 + endIndex - startIndex }})</q-item-section>
								</q-item>
							</q-list>
						</q-menu>
					</a>
					，</span
				>
				<span>{{ CabinetUnitStore.cabinetUnitList.length }} / {{ CabinetUnitStore.total }}</span>
			</div>
		</template>
	</q-table>

	<q-dialog v-model="dialogPatching">
		<q-card class="w-400">
			<q-toolbar>
				<q-toolbar-title>批量修改单价</q-toolbar-title>
				<q-btn dense flat icon="close" v-close-popup></q-btn>
			</q-toolbar>
			<q-separator />

			<q-card-section>
				<q-input square filled v-model="pricePatching" type="number" dense clearable />
			</q-card-section>
			<q-card-actions>
				<q-space></q-space>
				<q-btn
					@click="
						async () => {
							await CabinetUnitStore.patch(cabinetPicked, CabinetUnitStore.cabinetUnitList.slice(startIndex, endIndex + 1), pricePatching);
							startIndex = -1;
							endIndex = -1;
							dialogPatching = false;
						}
					"
					color="primary"
				>
					确定
				</q-btn>
			</q-card-actions>
		</q-card>
	</q-dialog>

	<q-dialog v-model="skuGetInDialog" maximized transition-show="slide-up" transition-hide="slide-down">
		<q-card>
			<q-toolbar>
				<q-toolbar-title>
					<div>在库库存</div>
				</q-toolbar-title>
				<q-btn dense flat icon="close" v-close-popup></q-btn>
			</q-toolbar>
			<q-separator />

			<q-card-section>
				<picker-sku-getin />
			</q-card-section>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import * as XLSX from "xlsx";
import { cloneDeep, debounce } from "lodash";
import { ENUM_LAYOUT_CABINET, MongodbSort } from "qqlx-core";
import type { SkuInView } from "qqlx-core/dto/wmss/sku";
import type { CabinetUnit } from "qqlx-core/schema/wmss/cabinetUnit";

import pickerSkuGetin from "@/components/picker-sku-getin.vue";
import { useNotifyStore } from "@/stores/notify";
import { useCabinetStore } from "@/stores/cabinet";
import { useCabinetUnitStore } from "@/stores/cabinetUnit";
import { useSkuStore } from "@/stores/sku";

const NotifyStore = useNotifyStore();
const CabinetStore = useCabinetStore();
const CabinetUnitStore = useCabinetUnitStore();
const SkuStore = useSkuStore();

const cabinetPicked = ref(CabinetStore.getSchema());
const debounceGet = debounce(() => CabinetUnitStore.get(cabinetPicked.value), 200);
const loadPage = (details: { index: number; from: number; to: number; direction: "increase" | "decrease" }) => {
	if (details.index + 9 >= details.to) {
		debounceGet();
	}
};

const skuGetInDialog = ref(false);

const swiperIndex = ref(0);
const startIndex = ref(-1);
const endIndex = ref(-1);
const pricePatching = ref(0);
const dialogPatching = ref(false);
const filePicking = ref(null);
const filePickNext = async (file: File) => {
	if (!file) return;
	const reader = new FileReader(); // WebAPI
	reader.onload = async () => {
		const workbook = XLSX.read(reader.result, { type: "binary" });
		const sheet = workbook.Sheets["商品导入"];
		if (!sheet) throw new Error(`找不到表格 [商品导入] !`);
		const rowJsonList: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

		// 1.批量上传客户
		const uploading = [];
		for (let i in rowJsonList) {
			const row = rowJsonList[i];
			const schema = CabinetUnitStore.getSchema();
			schema.name = String(row["@品名"]);
			schema.norm = String(row["@规格"]);
			schema.price = Number(row["@单价/元"]) || 0;
			uploading.push(schema);
		}
		CabinetUnitStore.cabinetUnitListExcel = uploading;
	};
	reader.readAsBinaryString(file);
};

const pushSku = (unit: CabinetUnit) => {
	const schema = SkuStore.getSchema() as SkuInView;
	schema.name = unit.name;
	schema.norm = unit.norm;
	schema.unit = cabinetPicked.value.unit;
	schema.price = unit.price;

	schema.formula = cabinetPicked.value.formula;
	schema.layout = cabinetPicked.value.layout;
	if (schema.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL) schema.isPriceInPounds = true;
	SkuStore.skuListPicked.push(schema);
};

// action
onMounted(async () => {
	await CabinetStore.get();
	cabinetPicked.value = cloneDeep(CabinetStore.cabinetList[0]);
	await CabinetUnitStore.get(cabinetPicked.value, 1);
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
<template>
	<div class="row q-pb-sm">
		<q-space></q-space>

		<q-btn color="white" text-color="black" class="text-body1 q-ml-sm">
			<q-icon name="date_range" class="q-mr-xs" style="margin-bottom: -4px"></q-icon>
			{{ SkuGetInStore.timeQuasarPicked?.from }} ~ {{ SkuGetInStore.timeQuasarPicked?.to }}
			<q-menu>
				<q-date v-model="SkuGetInStore.timeQuasarPicked" range first-day-of-week="1" color="indigo-14" @update:model-value="SkuGetInStore.timeChange" />
			</q-menu>
		</q-btn>
	</div>

	<q-card>
		<q-table
			dense
			row-key="_id"
			separator="cell"
			class="my-sticky-header-table select-none"
			:columns="(columns as any)"
			:visible-columns="visibleColumns"
			:rows-per-page-options="[0]"
			:rows="SkuGetInStore.skuList"
			virtual-scroll
			:virtual-scroll-item-size="33"
			:virtual-scroll-sticky-size-start="33"
			@virtual-scroll="loadPage"
		>
			<template v-slot:top="props">
				<q-space></q-space>
				<q-select
					dense
					multiple
					borderless
					emit-value
					map-options
					options-dense
					options-cover
					class="q-ml-sm"
					option-value="name"
					display-value="自定义列"
					options-selected-class="text-indigo-14"
					v-model="visibleColumns"
					:options="columns"
				/>
			</template>
			<template v-slot:header="props">
				<q-tr>
					<q-th
						key="timeCreateString"
						class="cursor-pointer"
						style="text-align: left"
						:class="{ 'text-indigo-14': SkuGetInStore.sortKey === 'timeCreate' }"
						:props="props"
						@click="SkuGetInStore.sort('timeCreate')"
					>
						<span>时间 </span>
						<q-icon :name="SkuGetInStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
					</q-th>
					<q-th key="layout" :props="props">性质</q-th>
					<q-th key="name" :props="props">
						<q-input
							square
							filled
							dense
							clearable
							color="indigo-14"
							clear-icon="close"
							placeholder="搜索品名"
							style="margin-left: -6px"
							v-model="SkuGetInStore.skuSearch.name"
							@blur="SkuGetInStore.get(1)"
						/>
					</q-th>
					<q-th key="norm" :props="props">
						<q-input
							square
							filled
							dense
							clearable
							color="indigo-14"
							clear-icon="close"
							placeholder="搜索规格"
							style="margin-left: -6px"
							v-model="SkuGetInStore.skuSearch.norm"
							@blur="SkuGetInStore.get(1)"
						/>
					</q-th>
					<q-th
						key="count"
						:props="props"
						class="cursor-pointer"
						:class="{
							'text-indigo-14': SkuGetInStore.sortKey === 'count',
						}"
						@click="SkuGetInStore.sort('count')"
					>
						<span>数量</span>
						<q-icon :name="SkuGetInStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
					</q-th>
					<q-th
						key="pounds"
						:props="props"
						class="cursor-pointer"
						:class="{ 'text-indigo-14': SkuGetInStore.sortKey === 'pounds' }"
						@click="SkuGetInStore.sort('pounds')"
					>
						<span>初始重量</span>
						<q-icon :name="SkuGetInStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
					</q-th>
					<q-th
						key="poundsFinal"
						:props="props"
						class="cursor-pointer"
						:class="{ 'text-indigo-14': SkuGetInStore.sortKey === 'poundsFinal' }"
						@click="SkuGetInStore.sort('poundsFinal')"
					>
						<span>剩余</span>
						<q-icon :name="SkuGetInStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
					</q-th>
					<q-th key="keyFeat" :props="props">
						<q-input
							square
							filled
							dense
							clearable
							color="indigo-14"
							clear-icon="close"
							placeholder="材质"
							style="margin-left: -6px"
							v-model="SkuGetInStore.skuSearch.keyFeat"
							@blur="SkuGetInStore.get(1)"
						/>
					</q-th>
					<q-th key="keyOrigin" :props="props">
						<q-input
							square
							filled
							dense
							clearable
							color="indigo-14"
							clear-icon="close"
							placeholder="产地/钢厂"
							style="margin-left: -6px"
							v-model="SkuGetInStore.skuSearch.keyOrigin"
							@blur="SkuGetInStore.get(1)"
						/>
					</q-th>
					<q-th key="keyHouse" :props="props">当前仓库</q-th>
					<q-th key="keyCode" :props="props">
						<q-input
							square
							filled
							dense
							clearable
							color="indigo-14"
							clear-icon="close"
							placeholder="自定义编号"
							style="margin-left: -6px"
							v-model="SkuGetInStore.skuSearch.keyCode"
							@blur="SkuGetInStore.get(1)"
						/>
					</q-th>

					<q-th
						key="price"
						:props="props"
						:class="{ 'text-indigo-14': SkuGetInStore.sortKey === 'price' }"
						class="cursor-pointer"
						@click="SkuGetInStore.sort('price')"
					>
						<span>单价 </span>
						<q-icon :name="SkuGetInStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
					</q-th>
					<q-th key="remark" :props="props">
						<q-input
							square
							filled
							dense
							clearable
							color="indigo-14"
							clear-icon="close"
							placeholder="搜索备注"
							style="margin-left: -6px"
							v-model="SkuGetInStore.skuSearch.remark"
							@blur="SkuGetInStore.get(1)"
						/>
					</q-th>
					<q-th key="orderContactId" :props="props">
						<q-btn class="q-px-none" flat square color="indigo-14" @click="contactDialog = true">
							{{ contactPicked._id ? contactPicked.name : "点击筛选客户" }}
						</q-btn>
						<q-btn
							v-show="contactPicked._id"
							class="q-px-sm"
							flat
							square
							color="indigo-14"
							@click="
								() => {
									contactPicked = ContactStore.getSchema();
									SkuGetInStore.skuSearch.orderContactId = '';
									SkuGetInStore.get(1);
								}
							"
						>
							<q-icon name="close" style="margin-bottom: -4px"></q-icon>
						</q-btn>
					</q-th>
					<q-th key="orderId" :props="props">订单编号</q-th>
					<q-th key="_id" :props="props">操作</q-th>
				</q-tr>
			</template>
			<template v-slot:body="props">
				<q-tr>
					<q-td key="timeCreateString" :props="props" style="text-align: left" class="text-grey"> {{ props.row.timeCreateString }} </q-td>
					<q-td key="layout" :props="props">
						<q-badge class="q-mr-sm" :color="getLabelByType(props.row.type).color">{{ getLabelByType(props.row.type).text }}</q-badge>
						<q-badge color="grey" v-if="props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
							大件商品
							<q-tooltip class="text-body1"> “大件商品”发货时，需要单独扣减当前在库的 “大件商品” 库存 </q-tooltip>
						</q-badge>
					</q-td>
					<q-td key="name" :props="props"> {{ props.row.name }} </q-td>
					<q-td key="norm" :props="props"> {{ props.row.norm }} </q-td>
					<q-td key="count" :props="props" :class="{ 'text-grey': props.row.count <= 0 }">
						<span class="text-grey"> 1 {{ props.row.unit }}</span>
					</q-td>
					<q-td key="pounds" :props="props" class="text-grey" style="min-width: 80px; max-width: 200px"> {{ props.row.pounds.toFixed(3) }} 吨 </q-td>
					<q-td key="poundsFinal" :props="props" style="min-width: 80px; max-width: 200px" :class="{ 'text-grey': props.row.poundsFinal < 1 }">
						{{ props.row.poundsFinal.toFixed(3) }} 吨
					</q-td>

					<q-td key="keyFeat" :props="props" class="text-grey"> {{ props.row.keyFeat }} </q-td>
					<q-td key="keyOrigin" :props="props" class="text-grey"> {{ props.row.keyOrigin }} </q-td>
					<q-td key="keyHouse" :props="props" class="text-grey"> - </q-td>
					<q-td key="keyCode" :props="props" class="text-grey"> {{ props.row.keyCode }} </q-td>
					<q-td key="price" :props="props" class="text-grey"> {{ props.row.price.toFixed(2) }} 元</q-td>
					<q-td key="remark" :props="props" class="text-grey ellipsis" style="max-width: 150px; text-align: left"> {{ props.row.remark }} </q-td>
					<q-td key="orderContactId" :props="props">
						<span v-if="props.row.joinOrderContact">{{ props.row.joinOrderContact?.name }} </span>
						<span v-else class="text-grey">批量导入</span>
					</q-td>
					<q-td key="orderId" :props="props"> {{ props.row.joinOrder?.code }} </q-td>
					<q-td key="_id" :props="props">
						<span v-if="!readonly && props.row.isConfirmed">
							<q-btn color="indigo-14" square push dense v-close-popup @click="$emit('pick', cloneDeep(props.row))">选择</q-btn>
						</span>
					</q-td>
				</q-tr>
			</template>
			<template v-slot:bottom="props">
				<q-space></q-space>
				<div class="q-pt-sm q-pb-xs">
					<span>已加载 {{ SkuGetInStore.skuList.length }} / {{ SkuGetInStore.total }}</span>
				</div>
			</template>
		</q-table>

		<q-inner-loading :showing="SkuGetInStore.loadding">
			<q-spinner-gears size="50px" color="indigo-14" />
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
						contactPicked = value;
						SkuGetInStore.skuSearch.orderContactId = value._id;
						SkuGetInStore.get(1);
					}
				"
			></list-contact>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import * as XLSX from "xlsx";
import { cloneDeep, debounce } from "lodash";
import { ENUM_LAYOUT_CABINET, MongodbSort, ENUM_ORDER } from "qqlx-core";
import type { SkuInView } from "qqlx-core/dto/wmss/sku";
import type { Cabinet } from "qqlx-core/schema/wmss/cabinet";
import type { CabinetUnit } from "qqlx-core/schema/wmss/cabinetUnit";

import listContact from "@/components/list-contact.vue";
import { useContactStore } from "@/stores/contact";
import { useNotifyStore } from "@/stores/notify";
import { useCabinetStore } from "@/stores/cabinet";
import { useCabinetUnitStore } from "@/stores/cabinetUnit";
import { useSkuGetInStore } from "@/stores/sku-indivudual";

const route = useRoute();
const NotifyStore = useNotifyStore();
const ContactStore = useContactStore();
const CabinetStore = useCabinetStore();
const SkuGetInStore = useSkuGetInStore();

const cellStyle = { "font-size": "16px" };
const columns = ref([
	{ name: "timeCreateString", field: "timeCreateString", label: "时间", style: cellStyle },
	{ name: "layout", field: "layout", label: "性质", align: "left", style: cellStyle },
	{ name: "name", field: "name", label: "品名", align: "left", style: cellStyle },
	{ name: "norm", field: "norm", label: "规格", align: "left", style: cellStyle },
	{ name: "count", field: "count", label: "数量", style: cellStyle },
	{ name: "pounds", field: "pounds", label: "过磅", style: cellStyle },
	{ name: "poundsFinal", field: "poundsFinal", label: "剩余", style: cellStyle },
	{ name: "keyFeat", field: "keyFeat", label: "材质", align: "left", style: cellStyle },
	{ name: "keyOrigin", field: "keyOrigin", label: "产地", align: "left", style: cellStyle },
	{ name: "keyHouse", field: "keyHouse", label: "仓库", align: "left", style: cellStyle },
	{ name: "keyCode", field: "keyCode", label: "自定义编号", align: "left", style: cellStyle },
	{ name: "price", field: "price", label: "单价", style: cellStyle },
	{ name: "remark", field: "remark", label: "备注", style: cellStyle },
	{ name: "orderContactId", field: "orderContactId", label: "客户", align: "left", style: cellStyle },
	{ name: "orderId", field: "orderId", label: "订单编号", align: "left", style: cellStyle },
	{ name: "_id", field: "_id", label: "当前状态", align: "left", style: cellStyle },
]);
const visibleColumns = ref(columns.value.filter((e, i) => i < 11 || i === columns.value.length - 1).map((e) => e.name));

const debounceGet = debounce(() => SkuGetInStore.get(), 200);
const loadPage = (details: { index: number; from: number; to: number; direction: "increase" | "decrease" }) => {
	console.log("sku individual", details.index, details.to);
	if (details.index + 17 >= details.to && details.to > 0 && details.direction === "increase") {
		debounceGet();
	}
};

const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());

// ACTION
const getLabelByType = (type: ENUM_ORDER) => {
	if (type === ENUM_ORDER.GETIN) return { text: "入库", color: "primary" };
	else if (type === ENUM_ORDER.GETOUT) return { text: "发货", color: "pink-6" };
	else if (type === ENUM_ORDER.MATERIAL) return { text: "领料", color: "indigo-14" };
	else if (type === ENUM_ORDER.PROCESS) return { text: "加工", color: "indigo-14" };
	else return { text: "异常", color: "grey" };
};
const props = defineProps({
	readonly: Boolean,
	name: String,
	norm: String,
});
onMounted(() => {
	SkuGetInStore.page.page = 1;
	SkuGetInStore.skuSearch.name = props.name || "";
	SkuGetInStore.skuSearch.norm = props.norm || "";
	debounceGet();
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

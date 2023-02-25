<template>
	<q-table
		class="my-sticky-header-table"
		dense
		:columns="(SkuGetInStore.columns as any)"
		:visible-columns="SkuGetInStore.visibleColumns"
		:loading="SkuGetInStore.loadding"
		row-key="_id"
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
				filled
				emit-value
				map-options
				options-dense
				options-cover
				color="orange"
				class="q-ml-sm"
				option-value="name"
				display-value="自定义列"
				v-model="SkuGetInStore.visibleColumns"
				:options="SkuGetInStore.columns"
			/>
			<q-btn color="white" text-color="black" class="text-body1 q-ml-sm">
				<q-icon name="date_range" class="q-mr-xs" style="margin-bottom: -4px"></q-icon>
				{{ timePicked.from }} ~ {{ timePicked.to }}
				<q-menu>
					<q-date v-model="timePicked" range first-day-of-week="1" color="orange" @update:model-value="timeChange" />
				</q-menu>
			</q-btn>
		</template>
		<template v-slot:header="props">
			<q-tr>
				<q-th key="orderContactId" :props="props">
					<q-btn class="q-px-none" flat square color="orange" @click="contactDialog = true">
						{{ contactPicked._id ? contactPicked.name : "点击筛选客户" }}
					</q-btn>
					<q-btn
						v-show="contactPicked._id"
						class="q-px-sm"
						flat
						square
						color="orange"
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
				<q-th key="keyOrigin" :props="props">
					<q-input
						square
						filled
						dense
						clearable
						color="orange"
						clear-icon="close"
						placeholder="产地/钢厂"
						style="margin-left: -6px"
						v-model="SkuGetInStore.skuSearch.keyOrigin"
						@blur="SkuGetInStore.get(1)"
					/>
				</q-th>
				<q-th key="keyFeat" :props="props">
					<q-input
						square
						filled
						dense
						clearable
						color="orange"
						clear-icon="close"
						placeholder="材质"
						style="margin-left: -6px"
						v-model="SkuGetInStore.skuSearch.keyFeat"
						@blur="SkuGetInStore.get(1)"
					/>
				</q-th>
				<q-th key="keyCode" :props="props">
					<q-input
						square
						filled
						dense
						clearable
						color="orange"
						clear-icon="close"
						placeholder="自定义编号"
						style="margin-left: -6px"
						v-model="SkuGetInStore.skuSearch.keyCode"
						@blur="SkuGetInStore.get(1)"
					/>
				</q-th>
				<q-th key="orderId" :props="props">订单编号</q-th>
				<q-th key="name" :props="props">
					<q-input
						square
						filled
						dense
						clearable
						color="orange"
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
						color="orange"
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
					:class="{ 'text-orange': SkuGetInStore.sortKey === 'count' }"
					@click="SkuGetInStore.sort('count')"
				>
					<span>订单中的数量</span>
					<q-icon :name="SkuGetInStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th
					key="pounds"
					:props="props"
					class="cursor-pointer"
					:class="{ 'text-orange': SkuGetInStore.sortKey === 'pounds' }"
					@click="SkuGetInStore.sort('pounds')"
				>
					<span>订单中的重量</span>
					<q-icon :name="SkuGetInStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th
					key="countFinal"
					:props="props"
					class="cursor-pointer"
					:class="{ 'text-orange': SkuGetInStore.sortKey === 'countFinal' }"
					@click="SkuGetInStore.sort('countFinal')"
				>
					<span>在库数量</span>
					<q-icon :name="SkuGetInStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th
					key="poundsFinal"
					:props="props"
					class="cursor-pointer"
					:class="{ 'text-orange': SkuGetInStore.sortKey === 'poundsFinal' }"
					@click="SkuGetInStore.sort('poundsFinal')"
				>
					<span>在库重量</span>
					<q-icon :name="SkuGetInStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th
					key="price"
					:props="props"
					:class="{ 'text-orange': SkuGetInStore.sortKey === 'price' }"
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
						color="orange"
						clear-icon="close"
						placeholder="搜索备注"
						style="margin-left: -6px"
						v-model="SkuGetInStore.skuSearch.remark"
						@blur="SkuGetInStore.get(1)"
					/>
				</q-th>
				<q-th
					key="timeCreateString"
					:props="props"
					:class="{ 'text-orange': SkuGetInStore.sortKey === 'timeCreate' }"
					class="cursor-pointer"
					@click="SkuGetInStore.sort('timeCreate')"
				>
					<span>时间 </span>
					<q-icon :name="SkuGetInStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th key="layout" :props="props">性质</q-th>
				<q-th key="_id" :props="props">状态</q-th>
			</q-tr>
		</template>
		<template v-slot:body="props">
			<q-tr>
				<q-td key="orderContactId" :props="props">
					<span v-if="props.row.joinOrderContact">{{ props.row.joinOrderContact?.name }} </span>
					<span v-else class="text-grey">批量导入</span>
				</q-td>
				<q-td key="keyOrigin" :props="props"> {{ props.row.keyOrigin }} </q-td>
				<q-td key="keyFeat" :props="props"> {{ props.row.keyFeat }} </q-td>
				<q-td key="keyCode" :props="props"> {{ props.row.keyCode }} </q-td>
				<q-td key="orderId" :props="props"> {{ props.row.joinOrder?.code }} </q-td>
				<q-td key="name" :props="props"> {{ props.row.name }} </q-td>
				<q-td key="norm" :props="props"> {{ props.row.norm }} </q-td>
				<q-td key="count" :props="props" class="text-grey"> {{ props.row.count }} {{ props.row.unit }} </q-td>
				<q-td key="pounds" :props="props" class="text-grey"> {{ props.row.pounds.toFixed(3) }} 吨 </q-td>
				<q-td key="countFinal" :props="props" :class="{ 'text-grey': props.row.countFinal <= 0 }">
					{{ props.row.countFinal }} {{ props.row.unit }}
				</q-td>
				<q-td key="poundsFinal" :props="props" :class="{ 'text-grey': props.row.poundsFinal <= 0 }"> {{ props.row.poundsFinal.toFixed(3) }} 吨 </q-td>
				<q-td key="price" :props="props" :class="{ 'text-grey': props.row.price <= 0 }"> {{ props.row.price.toFixed(2) }} 元</q-td>
				<q-td key="remark" :props="props"> {{ props.row.remark }} </q-td>
				<q-td key="timeCreateString" :props="props"> {{ props.row.timeCreateString }} </q-td>
				<q-td key="layout" :props="props">
					<q-badge color="grey" v-if="props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
						大件商品
						<q-tooltip class="text-body1"> “大件商品”销售、发货时，需要单独选择一项已入库的商品进行库存扣减。 </q-tooltip>
					</q-badge>
				</q-td>
				<q-td key="_id" :props="props">
					<q-btn color="orange" dense v-close-popup @click="$emit('pick', cloneDeep(props.row))">选择</q-btn>
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
import { useSkuGetInStore } from "@/stores/sku-getin";

const NotifyStore = useNotifyStore();
const ContactStore = useContactStore();
const CabinetStore = useCabinetStore();
const CabinetUnitStore = useCabinetUnitStore();
const SkuGetInStore = useSkuGetInStore();

const date = new Date();
const timePicked = ref({ from: `${date.getFullYear()}/01/01`, to: date.toLocaleString().split(" ")[0] });
const timeChange = () => {
	console.log(JSON.stringify(timePicked.value));
	if (timePicked.value) {
		SkuGetInStore.page.startTime = new Date(timePicked.value.from + " 00:00:00").getTime();
		SkuGetInStore.page.endTime = new Date(timePicked.value.to + " 23:59:59").getTime();
		SkuGetInStore.get(1);
	}
};

const cabinetPicked = ref(CabinetStore.getSchema());
const debounceGet = debounce(() => SkuGetInStore.get(), 200);
const loadPage = (details: { index: number; from: number; to: number; direction: "increase" | "decrease" }) => {
	if (details.index + 16 >= details.to) {
		debounceGet();
	}
};

const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());

// ACTION
onMounted(async () => {
	SkuGetInStore.setSchema(ENUM_ORDER.GETIN);
	SkuGetInStore.skuSearch.isConfirmed = true;
	await SkuGetInStore.get(1);
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

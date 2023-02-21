<template>
	<div class="q-pt-md q-pb-lg text-white">
		<div class="text-h4 text-weight-bold">仓库明细</div>
		<div class="q-pt-sm">
			<div>1.仓库明细包含内部订单中的所有商品记录，如发货、入库、领料、加工等，您可以在这里处理某些内部订单中需要单独处理的商品</div>
			<div>
				2. <span class="text-negative cursor-pointer" @click="router.push('/wmss/warehouse/cabinet')">货架</span>
				中的库存数字，最终等于 入库 + 加工 - 领料- 发货
			</div>
		</div>
	</div>

	<div class="row q-pb-sm">
		<q-btn-group class="q-mr-sm">
			<q-btn
				v-for="option in [
					{ label: '发货记录', value: ENUM_ORDER.GETOUT },
					{ label: '入库记录', value: ENUM_ORDER.GETIN },
					{ label: '领料记录', value: ENUM_ORDER.MATERIAL },
					{ label: '加工记录', value: ENUM_ORDER.PROCESS },
				]"
				push
				square
				:label="option.label"
				:color="SkuStore.skuSearch.type === option.value ? 'indigo' : 'white'"
				:text-color="SkuStore.skuSearch.type === option.value ? 'white' : 'grey'"
				@click="
					() => {
						SkuStore.skuSearch.type = option.value;
						SkuStore.get(1);
						startIndex = -1;
						endIndex = -1;
					}
				"
			>
				<q-badge v-if="AnalysisStore.skuNotConfirmed.find((e) => e.type === option.value)?.count" color="negative" floating>
					{{ AnalysisStore.skuNotConfirmed.find((e) => e.type === option.value)?.count }}
				</q-badge>
			</q-btn>
		</q-btn-group>
		<q-btn-toggle
			push
			square
			color="white"
			class="q-mr-sm"
			text-color="grey"
			toggle-color="indigo"
			v-model="SkuStore.skuSearch.isConfirmed"
			:options="[
				{ label: '已确认', value: true },
				{ label: '待处理', value: false },
			]"
			@update:model-value="
				() => {
					SkuStore.get(1);
					startIndex = -1;
					endIndex = -1;
				}
			"
		>
			<q-badge v-if="AnalysisStore.skuNotConfirmed.find((e) => e.type === SkuStore.skuSearch.type)?.count" color="negative" floating>
				{{ AnalysisStore.skuNotConfirmed.find((e) => e.type === SkuStore.skuSearch.type)?.count }}
			</q-badge>
		</q-btn-toggle>

		<q-space></q-space>

		<q-btn push square color="indigo" class="q-ml-sm" :disabled="endIndex == -1 || endIndex - startIndex < 0" @click="dialogCabinet = true">
			加入货架
			<q-tooltip class="text-body1">
				<div>当你期望在开单时，在货架上看到某些商品</div>
				<div>您可以从上到下长按选中它们，并点击这个按钮</div>
			</q-tooltip>
		</q-btn>

		<q-btn color="white" text-color="black" class="text-body1 q-ml-sm">
			<q-icon name="date_range" class="q-mr-xs" style="margin-bottom: -4px"></q-icon>
			{{ timePicked.from }} ~ {{ timePicked.to }}
			<q-menu>
				<q-date v-model="timePicked" range first-day-of-week="1" color="indigo" @update:model-value="timeChange" />
			</q-menu>
		</q-btn>
	</div>

	<q-table
		dense
		row-key="_id"
		separator="vertical"
		class="my-sticky-header-table select-none"
		:columns="(SkuStore.columns as any)"
		:visible-columns="SkuStore.visibleColumns"
		:loading="SkuStore.loadding"
		:rows-per-page-options="[0]"
		:rows="SkuStore.skuList"
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
				options-selected-class="text-indigo"
				v-model="SkuStore.visibleColumns"
				:options="SkuStore.columns"
			/>
		</template>
		<template v-slot:header="props">
			<q-tr>
				<q-th key="orderContactId" :props="props">
					<q-btn class="q-px-none" flat square color="indigo" @click="contactDialog = true">
						{{ contactPicked._id ? contactPicked.name : "点击筛选客户" }}
					</q-btn>
					<q-btn
						v-show="contactPicked._id"
						class="q-px-sm"
						flat
						square
						color="indigo"
						@click="
							() => {
								contactPicked = ContactStore.getSchema();
								SkuStore.skuSearch.orderContactId = '';
								SkuStore.get(1);
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
						color="indigo"
						clear-icon="close"
						placeholder="产地/钢厂"
						style="margin-left: -6px"
						v-model="SkuStore.skuSearch.keyOrigin"
						@blur="SkuStore.get(1)"
					/>
				</q-th>
				<q-th key="keyFeat" :props="props">
					<q-input
						square
						filled
						dense
						clearable
						color="indigo"
						clear-icon="close"
						placeholder="材质"
						style="margin-left: -6px"
						v-model="SkuStore.skuSearch.keyFeat"
						@blur="SkuStore.get(1)"
					/>
				</q-th>
				<q-th key="keyCode" :props="props">
					<q-input
						square
						filled
						dense
						clearable
						color="indigo"
						clear-icon="close"
						placeholder="自定义编号"
						style="margin-left: -6px"
						v-model="SkuStore.skuSearch.keyCode"
						@blur="SkuStore.get(1)"
					/>
				</q-th>
				<q-th key="orderId" :props="props">订单编号</q-th>
				<q-th key="name" :props="props">
					<q-input
						square
						filled
						dense
						clearable
						color="indigo"
						clear-icon="close"
						placeholder="搜索品名"
						style="margin-left: -6px"
						v-model="SkuStore.skuSearch.name"
						@blur="SkuStore.get(1)"
					/>
				</q-th>
				<q-th key="norm" :props="props">
					<q-input
						square
						filled
						dense
						clearable
						color="indigo"
						clear-icon="close"
						placeholder="搜索规格"
						style="margin-left: -6px"
						v-model="SkuStore.skuSearch.norm"
						@blur="SkuStore.get(1)"
					/>
				</q-th>
				<q-th
					key="count"
					:props="props"
					class="cursor-pointer"
					:class="{ 'text-indigo': SkuStore.sortKey === 'count' }"
					@click="SkuStore.sort('count')"
				>
					<span>单据中的数量</span>
					<q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th
					key="pounds"
					:props="props"
					class="cursor-pointer"
					:class="{ 'text-indigo': SkuStore.sortKey === 'pounds' }"
					@click="SkuStore.sort('pounds')"
				>
					<span>单据中的重量</span>
					<q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th
					key="price"
					:props="props"
					:class="{ 'text-indigo': SkuStore.sortKey === 'price' }"
					class="cursor-pointer"
					@click="SkuStore.sort('price')"
				>
					<span>单价 </span>
					<q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th key="remark" :props="props">
					<q-input
						square
						filled
						dense
						clearable
						color="indigo"
						clear-icon="close"
						placeholder="搜索备注"
						style="margin-left: -6px"
						v-model="SkuStore.skuSearch.remark"
						@blur="SkuStore.get(1)"
					/>
				</q-th>
				<q-th
					key="timeCreateString"
					:props="props"
					:class="{ 'text-indigo': SkuStore.sortKey === 'timeCreate' }"
					class="cursor-pointer"
					@click="SkuStore.sort('timeCreate')"
				>
					<span>时间 </span>
					<q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
				</q-th>
				<q-th key="_id" :props="props">状态</q-th>
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
				<q-td key="count" :props="props" :class="{ 'text-grey': props.row.count <= 0 }"> {{ props.row.count }} {{ props.row.unit }} </q-td>
				<q-td key="pounds" :props="props" :class="{ 'text-grey': props.row.pounds <= 0 }"> {{ props.row.pounds.toFixed(3) }} 吨 </q-td>
				<q-td key="price" :props="props" :class="{ 'text-grey': props.row.price <= 0 }"> {{ props.row.price.toFixed(2) }} 元</q-td>
				<q-td key="remark" :props="props"> {{ props.row.remark }} </q-td>
				<q-td key="timeCreateString" :props="props"> {{ props.row.timeCreateString }} </q-td>
				<q-td key="_id" :props="props">
					<span v-if="props.row.isConfirmed">
						<span v-if="props.row.type === ENUM_ORDER.GETOUT && props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
							<q-btn dense @click="SkuStore.patch([props.row])"> 取消 </q-btn>
						</span>
						<span v-else-if="props.row.type === ENUM_ORDER.MATERIAL">
							<q-btn dense @click="SkuStore.patch([props.row])"> 取消 </q-btn>
						</span>
						<span v-else class="text-grey"> <q-icon color="positive" name="check" class="q-mr-sm"></q-icon>货架已统计 </span>
					</span>
					<span v-else>
						<span v-if="props.row.type === ENUM_ORDER.GETOUT && props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
							<q-btn
								color="indigo"
								dense
								@click="
									() => {
										skuGetInDialog = true;
										skuGetInPicking = cloneDeep(props.row);
									}
								"
							>
								单独发货
							</q-btn>
						</span>
						<span v-else-if="props.row.type === ENUM_ORDER.MATERIAL">
							<q-btn
								color="indigo"
								dense
								@click="
									() => {
										skuGetInDialog = true;
										skuGetInPicking = cloneDeep(props.row);
									}
								"
							>
								单独领料
							</q-btn>
						</span>
					</span>
				</q-td>
			</q-tr>
		</template>
		<template v-slot:bottom="props">
			<span class="text-grey">
				<q-carousel vertical animated infinite :autoplay="4000" navigation v-model="swiperIndex" height="16px">
					<q-carousel-slide :name="0" class="q-pa-none">【商品明细】从A商品长按至B商品，可以批量选中A-B之间的所有商品...</q-carousel-slide>
				</q-carousel>
			</span>
			<q-space></q-space>
			<div class="q-pt-sm q-pb-xs">
				<span v-show="endIndex !== -1 && endIndex - startIndex >= 0">
					<span>
						<span>已选择 {{ endIndex - startIndex + 1 }} 行 ：</span>
						<a class="q-mr-sm text-negative text-body1 text-weight-bold">{{ skuPicking.count }}</a>
						<span>项，</span>
						<a class="q-mr-sm text-negative text-body1 text-weight-bold">{{ skuPicking.pounds.toFixed(3) }}</a>
						<span>吨，</span>
					</span>
					<!-- <span v-if="SkuStore.skuSearch.type === ENUM_ORDER.GETIN" class="q-mr-sm">
						<q-btn
							dense
							color="indigo"
							class="q-mx-sm q-px-sm"
							style="margin-top: -4px"
							:loadding="SkuStore.loadding"
							@click="
								async () => {
									await SkuStore.patch(SkuStore.skuList.slice(startIndex, endIndex + 1));
									startIndex = -1;
									endIndex = -1;
								}
							"
						>
							{{ SkuStore.skuSearch.isConfirmed ? "取消入库" : "点击入库" }}
						</q-btn>
						<span>，</span>
					</span>
					<span v-else-if="SkuStore.skuSearch.type === ENUM_ORDER.GETOUT" class="q-mr-sm">
						<q-btn
							v-if="SkuStore.skuSearch.isConfirmed === true"
							dense
							color="indigo"
							class="q-mx-sm q-px-sm"
							style="margin-top: -4px"
							:loadding="SkuStore.loadding"
							@click="
								async () => {
									await SkuStore.patch(SkuStore.skuList.slice(startIndex, endIndex + 1));
									startIndex = -1;
									endIndex = -1;
								}
							"
						>
							取消发货
						</q-btn>
						<span>，</span>
					</span> -->
				</span>
				<span>已加载 {{ SkuStore.skuList.length }} / {{ SkuStore.total }}</span>
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
						SkuStore.skuSearch.orderContactId = value._id;
						SkuStore.get(1);
					}
				"
			></list-contact>
		</q-card>
	</q-dialog>

	<q-dialog v-model="dialogCabinet">
		<q-card class="w-1200">
			<q-toolbar>
				<q-toolbar-title>
					<div>货架</div>
				</q-toolbar-title>
				<q-btn dense flat icon="close" v-close-popup></q-btn>
			</q-toolbar>
			<q-separator />

			<q-card-section class="q-pb-none">
				<div class="text-body2 text-grey">点击选择后，可以快速在货架中加入商品。</div>
			</q-card-section>
			<q-card-section>
				<picker-cabinet @pick="pickCabinet" />
			</q-card-section>
		</q-card>
	</q-dialog>

	<q-dialog v-model="skuGetInDialog" maximized transition-show="slide-up" transition-hide="slide-down">
		<q-card>
			<q-toolbar>
				<q-toolbar-title>
					<div>入库明细</div>
				</q-toolbar-title>
				<q-btn dense flat icon="close" v-close-popup></q-btn>
			</q-toolbar>
			<q-separator />

			<q-card-section>
				<picker-sku-getin @pick="pickSkuGetIn" />
			</q-card-section>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { cloneDeep, debounce } from "lodash";
import { useRouter } from "vue-router";
import { ENUM_LAYOUT_CABINET, MongodbSort, ENUM_ORDER } from "qqlx-core";
import type { SkuInView } from "qqlx-core/dto/wmss/sku";
import type { Cabinet } from "qqlx-core/schema/wmss/cabinet";
import type { CabinetUnit } from "qqlx-core/schema/wmss/cabinetUnit";

import listContact from "@/components/list-contact.vue";
import pickerCabinet from "@/components/picker-cabinet.vue";
import pickerSkuGetin from "@/components/picker-sku-getin.vue";
import { getPage } from "@/utils";
import { useContactStore } from "@/stores/contact";
import { useNotifyStore } from "@/stores/notify";
import { useCabinetStore } from "@/stores/cabinet";
import { useCabinetUnitStore } from "@/stores/cabinetUnit";
import { useSkuStore } from "@/stores/sku";
import { useAnalysisStore } from "@/stores/analysis";

const router = useRouter();
// const NotifyStore = useNotifyStore();
const ContactStore = useContactStore();
// const CabinetStore = useCabinetStore();
const CabinetUnitStore = useCabinetUnitStore();
const SkuStore = useSkuStore();
const AnalysisStore = useAnalysisStore();

const date = new Date();
const timePicked = ref({ from: `${date.getFullYear()}/01/01`, to: date.toLocaleString().split(" ")[0] });
const timeChange = () => {
	console.log(JSON.stringify(timePicked.value));
	if (timePicked.value) {
		SkuStore.page.startTime = new Date(timePicked.value.from + " 00:00:00").getTime();
		SkuStore.page.endTime = new Date(timePicked.value.to + " 23:59:59").getTime();
		SkuStore.get(1);
	}
};

const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());

const skuGetInDialog = ref(false);
const skuGetInPicking = ref(SkuStore.getSchema() as SkuInView);
const pickSkuGetIn = async (sku: SkuInView) => {
	if (skuGetInPicking.value._id) {
		skuGetInPicking.value.deductionSkuId = sku._id;
		await SkuStore.patch([skuGetInPicking.value]);
	}
	skuGetInPicking.value = SkuStore.getSchema() as SkuInView;
};

const dialogCabinet = ref(false);
const pickCabinet = async (cabinet: Cabinet) => {
	CabinetUnitStore.cabinetUnitListExcel = SkuStore.skuList.slice(startIndex.value, endIndex.value + 1).map((sku) => {
		const unit: CabinetUnit = CabinetUnitStore.getSchema();
		unit.name = sku.name;
		unit.norm = sku.norm;
		return unit;
	});
	await CabinetUnitStore.post(cabinet);
	startIndex.value = -1;
	endIndex.value = -1;
};

const swiperIndex = ref(0);
const startIndex = ref(-1);
const endIndex = ref(-1);

const debounceGet = debounce(() => SkuStore.get(), 200);
const loadPage = (details: { index: number; from: number; to: number; direction: "increase" | "decrease" }) => {
	if (details.index + 16 >= details.to) {
		debounceGet();
	}
};

// action
const skuPicking = computed({
	get() {
		const calcu = { count: 0, pounds: 0, price: 0 };
		const skus = SkuStore.skuList.slice(startIndex.value, endIndex.value + 1);
		skus.map((sku) => {
			calcu.count += sku.count;
			calcu.pounds += sku.pounds;
			// calcu.price += sku.price;
		});
		return calcu;
	},
	set() {},
});
onMounted(async () => {
	SkuStore.setSchema(ENUM_ORDER.GETOUT);
	SkuStore.page = getPage();
	await SkuStore.get(1);
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

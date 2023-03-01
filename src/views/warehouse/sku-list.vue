<template>
	<div class="q-pt-md q-pb-lg text-white">
		<div class="text-h4 text-weight-bold">仓库明细</div>
		<div class="q-pt-sm">
			<div>
				<span class="text-negative cursor-pointer" @click="router.push('/wmss/warehouse/cabinet')">商品分类</span>
				中的库存数字，最终等于 入库 + 加工 - 领料- 发货
			</div>
		</div>
	</div>

	<div class="row q-pb-sm">
		<q-btn-toggle
			push
			square
			color="white"
			class="q-mr-sm"
			text-color="grey"
			toggle-color="indigo-14"
			v-model="SkuStore.skuSearch.isConfirmed"
			:options="[
				{ label: '已处理', value: true },
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
			<q-badge v-if="skuNotConfirmedAll > 0" color="negative" floating>
				{{ AnalysisStore.analysis?.coutIndividualSkuNotConfirmed }}
			</q-badge>
		</q-btn-toggle>

		<q-space></q-space>

		<q-btn push square color="indigo-14" class="q-ml-sm" :disabled="endIndex == -1 || endIndex - startIndex < 0" @click="dialogCabinet = true">
			加入开单
			<q-tooltip class="text-body1">
				<div>当您期望在开单时，在商品分类上看到某些商品</div>
				<div>您可以从上到下长按选中它们，并点击这个按钮</div>
			</q-tooltip>
		</q-btn>

		<q-btn color="white" text-color="black" class="text-body1 q-ml-sm">
			<q-icon name="date_range" class="q-mr-xs" style="margin-bottom: -4px"></q-icon>
			{{ SkuStore.timeQuasarPicked?.from }} ~ {{ SkuStore.timeQuasarPicked?.to }}
			<q-menu>
				<q-date v-model="SkuStore.timeQuasarPicked" range first-day-of-week="1" color="indigo-14" @update:model-value="SkuStore.timeChange" />
			</q-menu>
		</q-btn>
	</div>

	<q-card>
		<q-table
			dense
			row-key="_id"
			separator="vertical"
			class="my-sticky-header-table select-none"
			:columns="(SkuStore.columns as any)"
			:visible-columns="SkuStore.visibleColumns"
			:rows-per-page-options="[0]"
			:rows="SkuStore.skuList"
			virtual-scroll
			:virtual-scroll-item-size="33"
			:virtual-scroll-sticky-size-start="33"
			@virtual-scroll="loadPage"
		>
			<template v-slot:top="props">
				<span class="text-grey">
					<q-carousel vertical animated infinite :autoplay="4000" navigation v-model="swiperIndex" height="16px">
						<q-carousel-slide :name="0" class="q-pa-none">【商品明细】从A商品长按至B商品，可以批量选中A-B之间的所有商品...</q-carousel-slide>
					</q-carousel>
				</span>
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
					v-model="SkuStore.visibleColumns"
					:options="SkuStore.columns"
				/>
			</template>
			<template v-slot:header="props">
				<q-tr>
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
									SkuStore.skuSearch.orderContactId = '';
									SkuStore.get(1);
								}
							"
						>
							<q-icon name="close" style="margin-bottom: -4px"></q-icon>
						</q-btn>
					</q-th>
					<q-th
						key="timeCreateString"
						:props="props"
						:class="{ 'text-indigo-14': SkuStore.sortKey === 'timeCreate' }"
						class="cursor-pointer"
						@click="SkuStore.sort('timeCreate')"
					>
						<span>时间 </span>
						<q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
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
							color="indigo-14"
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
							color="indigo-14"
							clear-icon="close"
							placeholder="自定义编号"
							style="margin-left: -6px"
							v-model="SkuStore.skuSearch.keyCode"
							@blur="SkuStore.get(1)"
						/>
					</q-th>
					<q-th key="orderId" :props="props">订单编号</q-th>
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
							color="indigo-14"
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
						:class="{ 'text-indigo-14': SkuStore.sortKey === 'count' }"
						@click="SkuStore.sort('count')"
					>
						<span>数量</span>
						<q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
					</q-th>
					<q-th
						key="pounds"
						:props="props"
						class="cursor-pointer"
						:class="{ 'text-indigo-14': SkuStore.sortKey === 'pounds' }"
						@click="SkuStore.sort('pounds')"
					>
						<span>重量</span>
						<q-icon :name="SkuStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
					</q-th>
					<q-th
						key="price"
						:props="props"
						:class="{ 'text-indigo-14': SkuStore.sortKey === 'price' }"
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
							color="indigo-14"
							clear-icon="close"
							placeholder="搜索备注"
							style="margin-left: -6px"
							v-model="SkuStore.skuSearch.remark"
							@blur="SkuStore.get(1)"
						/>
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
					<q-td key="timeCreateString" :props="props"> {{ props.row.timeCreateString }} </q-td>
					<q-td key="keyOrigin" :props="props"> {{ props.row.keyOrigin }} </q-td>
					<q-td key="keyFeat" :props="props"> {{ props.row.keyFeat }} </q-td>
					<q-td key="keyCode" :props="props"> {{ props.row.keyCode }} </q-td>
					<q-td key="orderId" :props="props"> {{ props.row.joinOrder?.code }} </q-td>
					<q-td key="layout" :props="props">
						<q-badge class="q-mr-sm" :color="getLabelByType(props.row.type).color">{{ getLabelByType(props.row.type).text }}</q-badge>
						<q-badge color="grey" v-if="props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
							大件商品
							<q-tooltip class="text-body1"> “大件商品”发货时，需要单独扣减在库的 “大件商品” 库存 </q-tooltip>
						</q-badge>
						<span v-else>-</span>
					</q-td>
					<q-td key="name" :props="props"> {{ props.row.name }} </q-td>
					<q-td key="norm" :props="props"> {{ props.row.norm }} </q-td>
					<q-td key="count" :props="props" :class="{ 'text-grey': props.row.count <= 0 }">
						<span> {{ props.row.count }} {{ props.row.unit }}</span>
					</q-td>
					<q-td key="pounds" :props="props" :class="{ 'text-grey': props.row.pounds <= 0 }" style="min-width: 150px; max-width: 200px">
						<span v-if="props.row.isPriceInPounds">{{ props.row.pounds.toFixed(3) }} 吨</span>
						<span v-else>-</span>
					</q-td>
					<q-td key="price" :props="props" class="text-grey"> {{ props.row.price.toFixed(2) }} 元</q-td>
					<q-td key="remark" :props="props" class="text-grey ellipsis" style="max-width: 150px; text-align: left"> {{ props.row.remark }} </q-td>
					<q-td key="_id" :props="props">
						<span v-if="props.row.isConfirmed">
							<span v-if="props.row.type === ENUM_ORDER.GETOUT">
								<span v-if="props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
									<q-btn dense @click="SkuStore.patch([props.row])"> 取消 </q-btn>
								</span>
								<span v-else class="text-grey">已发货</span>
							</span>
							<span v-else-if="props.row.type === ENUM_ORDER.MATERIAL">
								<q-btn dense @click="SkuStore.patch([props.row])"> 取消 </q-btn>
							</span>
							<span v-else class="text-grey">已入库</span>
						</span>
						<span v-else>
							<span v-if="props.row.type === ENUM_ORDER.GETOUT && props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL">
								<q-btn
									dense
									square
									color="indigo-14"
									@click="
										() => {
											skuGetInDialog = true;
											skuGetInPicking = cloneDeep(props.row);
										}
									"
								>
									发货
								</q-btn>
							</span>
							<span v-else-if="props.row.type === ENUM_ORDER.MATERIAL">
								<q-btn
									color="indigo-14"
									dense
									@click="
										() => {
											skuGetInDialog = true;
											skuGetInPicking = cloneDeep(props.row);
										}
									"
								>
									领料
								</q-btn>
							</span>
						</span>
					</q-td>
				</q-tr>
			</template>
			<template v-slot:bottom="props">
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
					</span>
					<span>已加载 {{ SkuStore.skuList.length }} / {{ SkuStore.total }}</span>
				</div>
			</template>
		</q-table>

		<q-inner-loading :showing="SkuStore.loadding">
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
					<div>商品分类</div>
				</q-toolbar-title>
				<q-btn dense flat icon="close" v-close-popup></q-btn>
			</q-toolbar>
			<q-separator />

			<q-card-section class="q-pb-none">
				<div class="text-body2 text-grey">点击选择后，可以快速在商品分类中加入商品。</div>
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
					<div>大件商品 在库库存</div>
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
import { useRouter, useRoute } from "vue-router";
import { ENUM_LAYOUT_CABINET, MongodbSort, ENUM_ORDER } from "qqlx-core";
import type { SkuInView } from "qqlx-core/dto/wmss/sku";
import type { Cabinet } from "qqlx-core/schema/wmss/cabinet";
import type { CabinetUnit } from "qqlx-core/schema/wmss/cabinetUnit";

import listContact from "@/components/list-contact.vue";
import pickerCabinet from "@/components/picker-cabinet.vue";
import pickerSkuGetin from "@/components/picker-sku-individual.vue";
import { getPage } from "@/utils";
import { useContactStore } from "@/stores/contact";
import { useNotifyStore } from "@/stores/notify";
import { useCabinetStore } from "@/stores/cabinet";
import { useCabinetUnitStore } from "@/stores/cabinetUnit";
import { useSkuStore } from "@/stores/sku";
import { useAnalysisStore } from "@/stores/analysis";

const router = useRouter();
const route = useRoute();
// const NotifyStore = useNotifyStore();
const ContactStore = useContactStore();
// const CabinetStore = useCabinetStore();
const CabinetUnitStore = useCabinetUnitStore();
const SkuStore = useSkuStore();
const AnalysisStore = useAnalysisStore();

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

const debounceGet = debounce(() => SkuStore.get(), 500);
const loadPage = (details: { index: number; from: number; to: number; direction: "increase" | "decrease" }) => {
	console.log("sku", details.index, details.to);
	if (details.index + 18 >= details.to && details.to > 0 && details.direction === "increase") {
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
const skuNotConfirmedAll = computed({
	get() {
		let count = 0;
		AnalysisStore.analysis?.skuNotConfirmed.map((e) => (count += e.count));
		return count;
	},
	set() {},
});
const getLabelByType = (type: ENUM_ORDER) => {
	if (type === ENUM_ORDER.GETIN) return { text: "入库", color: "primary" };
	else if (type === ENUM_ORDER.GETOUT) return { text: "发货", color: "pink-6" };
	else if (type === ENUM_ORDER.MATERIAL) return { text: "领料", color: "indigo-14" };
	else if (type === ENUM_ORDER.PROCESS) return { text: "加工", color: "indigo-14" };
	else return { text: "异常", color: "grey" };
};
onMounted(async () => {
	SkuStore.setSchema(ENUM_ORDER.NONE);
	SkuStore.page.page = 1;
	SkuStore.skuSearch.isConfirmed = true;
	const { name, norm } = route.query;
	SkuStore.skuSearch.name = (name || "").toString();
	SkuStore.skuSearch.norm = (norm || "").toString();
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

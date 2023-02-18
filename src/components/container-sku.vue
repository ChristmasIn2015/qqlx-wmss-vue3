<template>
	<q-table
		class="my-sticky-header-table"
		dense
		:columns="[
			{ name: 'name', field: 'name', label: '品名', align: 'left', style: 'font-size: 16px;' },
			{ name: 'norm', field: 'norm', label: '规格', align: 'left', style: 'font-size: 16px;' },
			{ name: 'count', field: 'count', label: '数量', align: 'left', style: 'font-size: 16px;' },
			{ name: 'pounds', field: 'pounds', label: '过磅', align: 'left', style: 'font-size: 16px;' },
			{ name: 'price', field: 'price', label: '单价', style: 'font-size: 16px;' },
			{ name: 'remark', field: 'remark', label: '备注', align: 'left', style: 'font-size: 16px;' },
			{ name: 'timeCreateString', field: 'timeCreateString', align: 'left', label: '操作', style: 'font-size: 16px;' },
		]"
		row-key="_id"
		:rows-per-page-options="[0]"
		:rows="SkuStore.skuListPicked"
	>
		<template v-slot:header="props">
			<q-tr :props="props">
				<q-th key="name" :props="props">品名</q-th>
				<q-th key="norm" :props="props">规格</q-th>
				<q-th key="count" :props="props">数量</q-th>
				<q-th key="pounds" :props="props">过磅</q-th>
				<q-th key="price" :props="props">
					<span>合计</span>
					<span class="q-mx-sm text-body1 text-negative text-weight-bold">{{ skuListPickedPriceTotal }}</span>
					<span>元</span>
				</q-th>
				<q-th key="remark" :props="props">备注</q-th>
				<q-th key="timeCreateString" :props="props">操作</q-th>
			</q-tr>
		</template>
		<template v-slot:body="props">
			<q-tr :props="props">
				<q-td :style="myTableCellStyle">
					<q-input borderless v-model="props.row.name" dense clearable clear-icon="close" input-class="text-body1" placeholder="请输入品名" />
				</q-td>
				<q-td :style="myTableCellStyle">
					<q-input
						dense
						clearable
						borderless
						clear-icon="close"
						input-class="text-body1"
						placeholder="请输入规格"
						v-model="props.row.norm"
						@update:model-value="SkuStore.setSkuPounds(props.row)"
					/>
				</q-td>
				<q-td :style="myTableCellStyle">
					<q-input
						square
						dense
						type="number"
						clear-icon="close"
						input-class="text-body1"
						v-model="props.row.count"
						:filled="!props.row.isPriceInPounds"
						:borderless="props.row.isPriceInPounds"
						:color="(route.meta?.color as string)"
						@update:model-value="SkuStore.setSkuPounds(props.row)"
					>
						<template v-slot:after>
							<span class="text-body1">{{ props.row.unit }}</span>
						</template>
					</q-input>
				</q-td>
				<q-td style="min-width: 255px; padding: 0 4px 0 0">
					<div class="row items-center q-py-none">
						<q-btn
							push
							dense
							square
							glossy
							class="q-mx-sm"
							:color="props.row.isPriceInPounds ? 'dark' : (route.meta?.color as string)"
							@click="
								() => {
									SkuStore.setSkuPounds(props.row);
									props.row.isPriceInPounds = !props.row.isPriceInPounds;
								}
							"
						>
							{{ props.row.isPriceInPounds ? "取消" : "过磅" }}
						</q-btn>
						<q-input
							v-if="props.row.isPriceInPounds"
							square
							dense
							type="number"
							v-model="props.row.pounds"
							:filled="props.row.isPriceInPounds"
							:color="(route.meta?.color as string)"
							:borderless="!props.row.isPriceInPounds"
						>
							<template v-slot:after>
								<span class="text-body1">吨</span>
							</template>
						</q-input>
					</div>
				</q-td>
				<q-td :style="myTableCellStyle">
					<q-input
						dense
						square
						filled
						type="number"
						input-class="text-body1 text-right"
						placeholder="请输入单价"
						v-model="props.row.price"
						:color="(route.meta?.color as string)"
					/>
				</q-td>
				<q-td>
					<q-input
						dense
						square
						clearable
						borderless
						clear-icon="close"
						placeholder="请输入备注"
						input-class="text-body1"
						v-model="props.row.remark"
						:color="(route.meta?.color as string)"
					/>
				</q-td>
				<q-td style="padding: 0 4px 0 0">
					<q-btn dense class="text-negative" icon="close" flat @click="() => SkuStore.skuListPicked.splice(props.rowIndex, 1)"> </q-btn>
					<q-btn dense icon="more_vert" flat>
						<q-menu>
							<q-card>
								<q-card-section>
									<q-input
										dense
										square
										clearable
										clear-icon="close"
										placeholder="请输入产地/钢厂"
										input-class="text-body1"
										v-model="props.row.keyOrigin"
										:color="(route.meta?.color as string)"
									/>
									<q-input
										dense
										square
										clearable
										clear-icon="close"
										placeholder="请输入材质"
										input-class="text-body1"
										v-model="props.row.keyFeat"
										:color="(route.meta?.color as string)"
									/>
									<q-input
										dense
										square
										clearable
										clear-icon="close"
										placeholder="请输入编号"
										input-class="text-body1"
										v-model="props.row.keyCode"
										:color="(route.meta?.color as string)"
									/>
								</q-card-section>
							</q-card>
						</q-menu>
					</q-btn>
				</q-td>
			</q-tr>
		</template>
	</q-table>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import { ENUM_LAYOUT_CABINET } from "qqlx-core";
import { useSkuStore } from "@/stores/sku";

const route = useRoute();
const SkuStore = useSkuStore();

const myTableCellStyle = ref({ "min-width": "155px", "max-width": "155px" });
const skuListPickedPriceTotal = computed(() => {
	let price = 0;
	SkuStore.skuListPicked.map((sku) => {
		const num = sku.isPriceInPounds ? sku.pounds : sku.count;
		price += num * sku.price;
	});
	return Number(price.toFixed(2)).toLocaleString("zh", { minimumFractionDigits: 2 });
});
</script>

<style lang="sass" scoped>
.my-sticky-header-table
  /* height or max-height is important */
  height: 400px

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

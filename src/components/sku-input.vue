<template>
	<v-card>
		<v-card-text>
			<v-table fixed-header height="450" density="compact">
				<thead>
					<tr>
						<th width="80">类型</th>
						<th>品名</th>
						<th>规格</th>
						<th class="text-right" width="120">数量</th>
						<th class="text-right">过磅</th>
						<th width="200">
							<span>合计：</span>
							<span class="text-red text-body-1 font-weight-bold">{{ skuListPickedPriceTotal }}</span>
							<span> 元</span>
						</th>
						<th>备注</th>
						<th>操作</th>
					</tr>
				</thead>

				<tbody>
					<tr v-for="(sku, index) in SkuStore.skuListPicked">
						<td>
							{{ sku.joinCabinet?.name }}
						</td>
						<td>
							<table-input placeholder="请输入名称" v-model="sku.name"></table-input>
						</td>
						<td>
							<table-input placeholder="请输入规格" v-model="sku.norm" @input="SkuStore.setSkuPounds(sku)"></table-input>
						</td>
						<td>
							<table-input placeholder="请输入数量" v-model="sku.count" @input="SkuStore.setSkuPounds(sku)"></table-input>
						</td>
						<td>
							<v-row>
								<v-col cols="3" class="py-0">
									<v-btn
										height="40"
										:class="sku.isPriceInPounds ? 'mt-2' : ''"
										:color="sku.isPriceInPounds ? '' : 'primary'"
										@click="
											() => {
												SkuStore.setSkuPounds(sku);
												sku.isPriceInPounds = !sku.isPriceInPounds;
											}
										"
										>{{ sku.isPriceInPounds ? "取消" : "过磅" }}</v-btn
									>
								</v-col>
								<v-col cols="9" class="pa-0" v-show="sku.isPriceInPounds">
									<table-input placeholder="称重" v-model="sku.pounds"></table-input>
								</v-col>
							</v-row>
						</td>
						<td>
							<table-input placeholder="单价" v-model="sku.price"></table-input>
						</td>
						<td>
							<table-input placeholder="备注" v-model="sku.remark"></table-input>
						</td>
						<td>
							<v-btn icon="mdi-close" variant="text" class="mr-n1" color="red" size="32" @click="SkuStore.skuListPicked.splice(index, 1)"></v-btn>
						</td>
					</tr>
				</tbody>
			</v-table>
		</v-card-text>
	</v-card>
</template>

<script lang="ts" setup>
import { onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ENUM_SUBJECT_TYPE, ENUM_SUBJECT_ROLE, ENUM_COUNT_WAY } from "qqlx-core";

import { debounce } from "lodash";

import { useSnackbarStore } from "@/store/snackbar";
import { useCabinetStore } from "@/store/cabinet";
import { useCabinetUnitStore } from "@/store/cabinetUnit";
import { useSkuStore } from "@/store/sku";

const router = useRouter();
const SnackbarStore = useSnackbarStore();
const CabinetStore = useCabinetStore();
const CabinetUnitStore = useCabinetUnitStore();
const SkuStore = useSkuStore();

const skuListPickedPriceTotal = computed(() => {
	let price = 0;
	SkuStore.skuListPicked.map((sku) => {
		const num = sku.isPriceInPounds ? sku.pounds : sku.count;
		price += num * sku.price;
	});
	return price.toFixed(2);
});

// onMounted(async () => {
// 	try {
// 		SkuStore.setSchema();
// 	} catch (error) {
// 		SnackbarStore.setFail((error as Error).message);
// 	}
// });
</script>

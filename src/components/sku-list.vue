<template>
	<v-card class="rounded-0">
		<v-card-text>
			<v-sheet border>
				<v-table fixed-header height="650" density="compact" @scroll.capture="search()">
					<thead>
						<tr>
							<th width="195">时间</th>
							<th width="155">
								<search-input placeholder="品名" v-model="SkuStore.skuSearch.name" @blur="SkuStore.get(1)"></search-input>
							</th>
							<th width="255">
								<search-input placeholder="规格" v-model="SkuStore.skuSearch.norm" @blur="SkuStore.get(1)"></search-input>
							</th>
							<th width="120" class="text-right">类型</th>
							<th>来源</th>
							<th width="120" class="text-right">数量</th>
							<th width="120" class="text-right">过磅</th>
							<th width="120" class="text-right">单价</th>
							<th>备注</th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="(sku, index) in SkuStore.skuList || []">
							<td>{{ sku.timeCreateString }}</td>
							<td>{{ sku.name }}</td>
							<td>{{ sku.norm }}</td>
							<td class="text-right">
								{{ OrderStore.enum_order_type.find((e) => e.value === sku.orderType)?.text }}
							</td>
							<td>{{ sku.joinOrder?.code }}</td>
							<td class="text-right">{{ sku.count }} {{ sku.unit }}</td>
							<td class="text-right">{{ sku.isPriceInPounds ? sku.pounds.toFixed(3) + " 吨" : "" }}</td>
							<td class="text-right">{{ sku.price.toFixed(2) }}</td>
							<td>{{ sku.remark }}</td>
						</tr>
					</tbody>
				</v-table>

				<v-divider></v-divider>
				<v-progress-linear indeterminate :color="SkuStore.loadding ? 'primary' : 'white'"></v-progress-linear>

				<v-table>
					<tbody>
						<tr>
							<td></td>
							<td></td>
							<td></td>
							<td></td>
							<td></td>
							<td></td>
							<td></td>
							<td class="text-right">
								<span>
									已加载 {{ SkuStore.skuList.length }} / {{ SkuStore.total }} 项
									<span v-show="SkuStore.skuList.length >= SkuStore.total">，已经到底了</span>
								</span>
							</td>
						</tr>
					</tbody>
				</v-table>
			</v-sheet>
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
import { useOrderStore } from "@/store/order";

const router = useRouter();
const SnackbarStore = useSnackbarStore();
const CabinetStore = useCabinetStore();
const CabinetUnitStore = useCabinetUnitStore();
const SkuStore = useSkuStore();
const OrderStore = useOrderStore();

const debounceGet = debounce(() => SkuStore.get(), 500);
const search = () => debounceGet();

onMounted(async () => {
	try {
		SkuStore.get(1);
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
});
</script>

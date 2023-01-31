<template>
	<v-card class="rounded-0">
		<v-card-text>
			<v-sheet border>
				<v-table fixed-header height="450" density="compact" @scroll.capture="search()">
					<thead>
						<tr>
							<th width="155">编号</th>
							<th width="255">客户</th>
							<th>时间</th>
							<th class="text-right">金额</th>
							<th>操作</th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="(order, index) in OrderStore.orderList || []">
							<td>{{ order.code }}</td>
							<td>{{ order.joinContact?.name }}</td>
							<td>{{ order.timeCreateString }}</td>
							<td class="text-right">{{ (order.amount / 100).toFixed(2) }}</td>
							<td>
								<v-btn
									color="pink-lighten-1"
									size="small"
									@click="
										() => {
											let o = cloneDeep(order);
											o.amount /= 100;
											OrderStore.orderListPicked.push(o);
										}
									"
									>选择</v-btn
								>
							</td>
						</tr>
					</tbody>
				</v-table>

				<v-divider></v-divider>
				<v-progress-linear indeterminate :color="OrderStore.loadding ? 'primary' : 'white'"></v-progress-linear>

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
									已加载 {{ OrderStore.orderList.length }} / {{ OrderStore.total }} 项
									<span v-show="OrderStore.orderList.length >= OrderStore.total">，已经到底了</span>
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

import { debounce, cloneDeep } from "lodash";

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
		OrderStore.get(1);
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
});
</script>

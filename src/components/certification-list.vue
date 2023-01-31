<template>
	<v-card class="rounded-0">
		<v-card-text>
			<v-sheet border>
				<v-table fixed-header height="650" density="compact" @scroll.capture="search()">
					<thead>
						<tr>
							<th>类型</th>
							<th>
								<search-input placeholder="编号" v-model="SkuStore.skuSearch.name" @blur="CertificationStore.get(1)"></search-input>
							</th>
							<th>金额</th>
							<th>操作</th>
						</tr>
					</thead>

					<tbody>
						<tr v-for="(cer, index) in CertificationStore.certificationList || []">
							<td>收款证明</td>
							<td>{{ cer.code }}</td>
							<td>{{ (cer.amount / 100).toFixed(2) }}</td>
							<td>
								<v-btn disabled size="small" class="mr-2">明细</v-btn>
								<v-btn
									v-if="!read"
									size="small"
									class="mr-2"
									@click="
										() => {
											CertificationStore.certificationListPicked.push(cloneDeep(cer));
										}
									"
								>
									选择
								</v-btn>
							</td>
						</tr>
					</tbody>
				</v-table>

				<v-divider></v-divider>
				<v-progress-linear indeterminate :color="CertificationStore.loadding ? 'teal' : 'white'"></v-progress-linear>

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
									已加载 {{ CertificationStore.certificationList.length }} / {{ CertificationStore.total }} 项
									<span v-show="CertificationStore.certificationList.length >= CertificationStore.total">，已经到底了</span>
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
import { useCertificationStore } from "@/store/certification";

const router = useRouter();
const SnackbarStore = useSnackbarStore();
const CabinetStore = useCabinetStore();
const CabinetUnitStore = useCabinetUnitStore();
const SkuStore = useSkuStore();
const OrderStore = useOrderStore();
const CertificationStore = useCertificationStore();

const debounceGet = debounce(() => SkuStore.get(), 500);
const search = () => debounceGet();

defineProps({
	read: { type: Boolean, default: false },
});
onMounted(async () => {
	try {
		CertificationStore.get(1);
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
});
</script>

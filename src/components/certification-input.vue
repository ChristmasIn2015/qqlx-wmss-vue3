<template>
	<v-card>
		<v-table fixed-header density="compact">
			<thead>
				<tr>
					<th>编号</th>
					<th>金额</th>
					<th>操作</th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="(cer, index) in CertificationStore.certificationListPicked">
					<td>{{ cer.code }}</td>
					<td>
						<table-input placeholder="请输入金额" v-model="cer.amount"></table-input>
					</td>
					<td>
						<v-btn
							icon="mdi-close"
							variant="text"
							class="mr-n1"
							color="red"
							size="32"
							@click="CertificationStore.certificationListPicked.splice(index, 1)"
						></v-btn>
					</td>
				</tr>
			</tbody>
		</v-table>
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
import { useCertificationStore } from "@/store/certification";

const router = useRouter();
const SnackbarStore = useSnackbarStore();
const CabinetStore = useCabinetStore();
const CabinetUnitStore = useCabinetUnitStore();
const SkuStore = useSkuStore();
const OrderStore = useOrderStore();
const CertificationStore = useCertificationStore();

const pickedTotal = computed(() => {
	let price = 0;
	OrderStore.orderListPicked.map((o) => {
		price += o.amount;
	});
	return Number(price).toFixed(2);
});

// onMounted(async () => {
// 	try {
// 		SkuStore.setSchema();
// 	} catch (error) {
// 		SnackbarStore.setFail((error as Error).message);
// 	}
// });
</script>

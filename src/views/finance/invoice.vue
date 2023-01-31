<template>
	<v-row>
		<v-col cols="4"> </v-col>
		<v-col class="d-flex">
			<v-spacer></v-spacer>
			<v-btn
				class="ml-2"
				color="deep-purple"
				@click="
					() => {
						dialogInvoice = true;
					}
				"
			>
				继续添加
			</v-btn>
		</v-col>
	</v-row>
	<v-card class="mt-3 rounded-0">
		<v-table fixed-header height="650" density="compact" @scroll.capture="search()">
			<thead>
				<tr>
					<th>日期</th>
					<th>
						<search-input placeholder="搜索客户" v-model="LedgerStore.ledgerSearch.keyOrigin" @blur="LedgerStore.get(1)"></search-input>
					</th>
					<th>类型</th>
					<th>金额</th>
					<th>备注</th>
					<th>
						<v-menu>
							<template v-slot:activator="{ props }">
								<v-btn v-bind="props" height="40">
									{{ LedgerStore.ledgerSearch.isDisabled ? "最近删除" : "全部" }}
									<v-icon icon="mdi-menu-down"></v-icon>
								</v-btn>
							</template>
							<v-list>
								<v-list-item
									@click="
										() => {
											LedgerStore.ledgerSearch.isDisabled = false;
											LedgerStore.get(1);
										}
									"
								>
									全部
								</v-list-item>
								<v-list-item
									@click="
										() => {
											LedgerStore.ledgerSearch.isDisabled = true;
											LedgerStore.get(1);
										}
									"
								>
									最近删除
								</v-list-item>
							</v-list>
						</v-menu>
					</th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="item in LedgerStore.ledgerList">
					<td>{{ item.timeCreateString }}</td>
					<td>{{ item.keyOrigin }}</td>
					<td>开出（销）发票</td>
					<td>{{ item.keyHouse }}</td>
					<td class="font-weight-bold">{{ (item.amount / 100).toFixed(2) }}</td>
					<td>{{ item.remark }}</td>
					<td>
						<v-menu>
							<template v-slot:activator="{ props }">
								<v-btn v-bind="props" icon="mdi-dots-horizontal" variant="text" size="32" class="mr-2"></v-btn>
							</template>
							<v-list>
								<v-list-item @click="LedgerStore.delete(item)">
									{{ item.isDisabled ? "恢复" : "删除" }}
								</v-list-item>
							</v-list>
						</v-menu>
					</td>
				</tr>
			</tbody>
		</v-table>

		<v-divider></v-divider>
		<v-progress-linear indeterminate :color="LedgerStore.loadding ? 'deep-purple' : 'white'"></v-progress-linear>

		<v-table>
			<tbody>
				<tr>
					<td></td>
					<td></td>
					<td></td>
					<td class="text-right">
						<span v-show="LedgerStore.ledgerListExcel.length === 0">
							已加载 {{ LedgerStore.ledgerList.length }} / {{ LedgerStore.total }} 项
							<span v-show="LedgerStore.ledgerList.length >= LedgerStore.total">，已经到底了</span>
						</span>
						<span v-show="LedgerStore.ledgerListExcel.length > 0"> 正在导入 {{ LedgerStore.ledgerListExcel.length }} 项 </span>
					</td>
				</tr>
			</tbody>
		</v-table>

		<v-dialog persistent v-model="dialogInvoice" fullscreen transition="dialog-bottom-transition" scrollable>
			<v-toolbar color="deep-purple">
				<v-toolbar-title>添加收款凭证</v-toolbar-title>
				<v-spacer></v-spacer>
				<v-btn icon="mdi-close" @click="dialogInvoice = false"></v-btn>
			</v-toolbar>

			<v-card class="rounded-0 px-4">
				<certification-input />
				<v-card class="my-2 pa-2">
					<v-row>
						<v-col></v-col>
						<v-col cols="1">
							<search-input placeholder="票号"></search-input>
						</v-col>
						<v-col cols="1">
							<search-input placeholder="选择客户"></search-input>
							<v-btn color="deep-purple" block disabled>确定</v-btn>
						</v-col>
					</v-row>
				</v-card>
				<certification-list />
			</v-card>
		</v-dialog>
	</v-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { ENUM_LEDGER_TYPE, ENUM_LEDGER_SCOPE } from "qqlx-core";
import { SubjectContact } from "qqlx-core/brand/entity";
import { CertificationUnit } from "qqlx-core/wmss/certification/entity";

import * as XLSX from "xlsx";
import { debounce, cloneDeep } from "lodash";
import { download } from "@/store/utils";

import { useSnackbarStore } from "@/store/snackbar";
import { useUserStore } from "@/store/user";
import { useSubjectContactStore } from "@/store/subjectContact";
import { useLedgerStore } from "@/store/ledger";
import { useOrderStore } from "@/store/order";
import { useCertificationStore } from "@/store/certification";
import { useCertificationUnitStore } from "@/store/certificationUnit";

import certificationInput from "@/components/certification-input.vue";
import certificationList from "@/components/certification-list.vue";

const SnackbarStore = useSnackbarStore();
const UserStore = useUserStore();
const SubjectContactStore = useSubjectContactStore();
const LedgerStore = useLedgerStore();
const OrderStore = useOrderStore();
const CertificationStore = useCertificationStore();
const CertificationUnitStore = useCertificationUnitStore();

const debounceGet = debounce(() => SubjectContactStore.get(), 500);
const search = () => debounceGet();

const dialogInvoice = ref(false);
const postCertification = async () => {
	try {
		const units: CertificationUnit[] = [];
		OrderStore.orderListPicked.map((o) => {
			const ledger = LedgerStore.ledgerPicked;
			CertificationStore.certificationEditor.ledgerId = ledger._id;
			CertificationStore.certificationEditor.ledgerType = ledger.type;
			CertificationStore.certificationEditor.ledgerScope = ledger.scope;

			const schema = CertificationUnitStore.getSchema();
			schema.orderId = o._id;
			schema.amount = o.amount;
			units.push(schema);
		});
		await CertificationStore.post(units);

		OrderStore.orderListPicked = [];
		LedgerStore.setSchema(ENUM_LEDGER_TYPE.J, ENUM_LEDGER_SCOPE.YSZK_VAT);
		dialogInvoice.value = false;
		await LedgerStore.get(1);
		SnackbarStore.setSuccess("添加成功");
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
};

defineProps({ read: Boolean });
onMounted(async () => {
	try {
		LedgerStore.setSchema(ENUM_LEDGER_TYPE.J, ENUM_LEDGER_SCOPE.YSZK_VAT);
		await LedgerStore.get(1);
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
});
</script>

<template>
	<v-row>
		<v-col cols="4"> </v-col>
		<v-col class="d-flex">
			<v-spacer></v-spacer>
			<v-btn
				class="ml-2"
				v-if="LedgerStore.ledgerListExcel.length > 0"
				@click="
					() => {
						LedgerStore.ledgerListExcel = [];
						LedgerStore.get();
					}
				"
			>
				取消
			</v-btn>
			<v-btn class="ml-2" color="red" v-if="LedgerStore.ledgerListExcel.length > 0" @click="LedgerStore.post()"> 保存 </v-btn>

			<v-menu>
				<template v-slot:activator="{ props }">
					<v-btn class="ml-2" v-bind="props">导入</v-btn>
				</template>
				<v-list>
					<v-list-item @click="download">
						<v-icon icon="mdi-download"></v-icon>
						下载模板
					</v-list-item>
					<v-list-item @click="uploadClick">
						<v-file-input v-show="false" id="file-input" @change="uploadLedger($event)"> </v-file-input>
						<v-icon icon="mdi-import"></v-icon>
						模板导入
					</v-list-item>
				</v-list>
			</v-menu>
			<v-btn
				class="ml-2"
				color="teal"
				@click="
					() => {
						LedgerStore.ledgerListExcel.push(LedgerStore.getSchema());
					}
				"
			>
				继续添加
			</v-btn>
		</v-col>
	</v-row>
	<v-card class="mt-3 rounded-0">
		<v-table fixed-header height="650" density="compact" v-show="LedgerStore.ledgerListExcel.length > 0">
			<thead>
				<tr>
					<th>日期</th>
					<th>客户</th>
					<th>类型</th>
					<th>收款银行</th>
					<th class="text-right">金额</th>
					<!-- <th class="text-right">已结清</th> -->
					<!-- <th>剩余</th> -->
					<th>备注</th>
					<th>操作</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(item, index) in LedgerStore.ledgerListExcel">
					<td class="pr-0">
						{{ item.timeCreateString }}
					</td>
					<td>
						<table-input placeholder="客户" v-model="item.keyOrigin"></table-input>
					</td>
					<td></td>
					<td>
						<table-input placeholder="收款银行" v-model="item.keyHouse"></table-input>
					</td>
					<td>
						<table-input placeholder="金额" v-model="item.amount"></table-input>
					</td>
					<td>
						<table-input placeholder="备注" v-model="item.remark"></table-input>
					</td>
					<td>
						<v-btn
							icon="mdi-close"
							variant="text"
							class="mr-n1"
							color="red"
							size="32"
							@click="LedgerStore.ledgerListExcel.splice(index, 1)"
						></v-btn>
					</td>
				</tr>
			</tbody>
		</v-table>

		<v-table fixed-header height="650" density="compact" @scroll.capture="search()" v-show="LedgerStore.ledgerListExcel.length === 0">
			<thead>
				<tr>
					<th>日期</th>
					<th>
						<search-input placeholder="搜索客户" v-model="LedgerStore.ledgerSearch.keyOrigin" @blur="LedgerStore.get(1)"></search-input>
					</th>
					<th>类型</th>
					<th>
						<search-input placeholder="搜索银行" v-model="LedgerStore.ledgerSearch.keyHouse" @blur="LedgerStore.get(1)"></search-input>
					</th>
					<th>金额</th>
					<th class="text-right">已结清</th>
					<th>剩余</th>
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
					<td>收货款</td>
					<td>{{ item.keyHouse }}</td>
					<td class="font-weight-bold">{{ (item.amount / 100).toFixed(2) }}</td>
					<td class="text-right text-teal font-weight-bold">{{ (item.amountCertification / 100).toFixed(2) }}</td>
					<td>{{ (item.amountCertificationRest / 100).toFixed(2) }}</td>
					<td>{{ item.remark }}</td>
					<td>
						<v-menu>
							<template v-slot:activator="{ props }">
								<v-btn v-bind="props" icon="mdi-dots-horizontal" variant="text" size="32" class="mr-2"></v-btn>
							</template>
							<v-list>
								<v-list-item
									:disabled="item.isDisabled"
									@click="
										() => {
											LedgerStore.ledgerPicked = cloneDeep(item);
											dialogCertification = true;
										}
									"
								>
									添加收款证明</v-list-item
								>
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
		<v-progress-linear indeterminate :color="LedgerStore.loadding ? 'teal' : 'white'"></v-progress-linear>

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

		<v-dialog persistent v-model="dialogCertification" fullscreen transition="dialog-bottom-transition" scrollable>
			<v-toolbar color="teal">
				<v-toolbar-title>添加收款证明</v-toolbar-title>
				<v-spacer></v-spacer>
				<v-btn icon="mdi-close" @click="dialogCertification = false"></v-btn>
			</v-toolbar>

			<v-card class="rounded-0 px-4">
				<certification-unit-input />
				<v-card class="my-2 pa-2 d-flex">
					<v-spacer></v-spacer>
					<v-btn color="teal" @click="postCertification()">确定</v-btn>
				</v-card>
				<order-list-simple />
			</v-card>
		</v-dialog>
	</v-card>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { ENUM_SUBJECT_TYPE } from "qqlx-core";
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

import certificationUnitInput from "@/components/certification-unit-input.vue";
import orderListSimple from "@/components/order-list-simple.vue";

const SnackbarStore = useSnackbarStore();
const UserStore = useUserStore();
const SubjectContactStore = useSubjectContactStore();
const LedgerStore = useLedgerStore();
const OrderStore = useOrderStore();
const CertificationStore = useCertificationStore();
const CertificationUnitStore = useCertificationUnitStore();

const debounceGet = debounce(() => SubjectContactStore.get(), 500);
const search = () => debounceGet();

const uploadClick = () => window.document.getElementById("file-input")?.click();
const uploadLedger = (event: any) => {
	if (!event) return;
	const reader = new FileReader(); // WebAPI
	reader.onload = async () => {
		try {
			LedgerStore.loadding = true;
			const workbook = XLSX.read(reader.result, { type: "binary" });
			const sheet = workbook.Sheets["资金导入"];
			if (!sheet) throw new Error(`找不到表格 [资金导入] !`);
			const rowJsonList: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

			// 1.批量上传 ["@收款银行", "@客户名称", "@日期", "@金额", "@备注", "@@请勿更改标题头部@@"],
			const uploading = [];
			for (let i in rowJsonList) {
				const row = rowJsonList[i];
				const schema = LedgerStore.getSchema();
				schema.keyHouse = String(row["@收款银行"] || "");
				schema.keyOrigin = String(row["@客户名称"] || "");
				// schema.timeCreate = String(row["@日期"]);
				schema.amount = Number(String(row["@金额"] || "0"));
				schema.remark = String(row["@备注"] || "");
				uploading.push(schema);
			}
			LedgerStore.ledgerListExcel = uploading;
		} catch (error) {
			SnackbarStore.setFail((error as Error).message);
		} finally {
			LedgerStore.loadding = false;
		}
	};
	reader.readAsBinaryString(event.target.files[0]);
};

const dialogCertification = ref(false);
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
		LedgerStore.setSchema();
		dialogCertification.value = false;
		await LedgerStore.get(1);
		SnackbarStore.setSuccess("添加成功");
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
};

defineProps({ read: Boolean });
onMounted(async () => {
	try {
		LedgerStore.setSchema();
		await LedgerStore.get(1);
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
});
</script>

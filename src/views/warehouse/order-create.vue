<template>
	<div class="q-pt-md q-pb-lg">
		<div class="text-h4 text-white text-weight-bold">
			<q-btn color="white" square push text-color="black" icon="arrow_back" @click="router.back()"></q-btn>
			创建{{ nowOrderEditorTrans?.text }}
		</div>
		<div class="text-white q-pt-sm">
			<span>您正在以公司 @{{ CorpStore.corpPicked?.name }} 作为主体，开出{{ nowOrderEditorTrans?.text }}据</span>
		</div>
	</div>

	<container-sku />

	<div class="q-py-md row">
		<q-space></q-space>
		<q-btn class="q-ml-sm" square push label="批量导入">
			<q-menu>
				<q-list>
					<q-item clickable @click="NotifyStore.download()">
						<q-item-section>下载模板</q-item-section>
					</q-item>
					<q-item clickable>
						<q-item-section>
							<q-file dense borderless accept=".xlsx, .xls" v-model="filePicking" label="选择文件" @update:model-value="filePickNext" />
						</q-item-section>
					</q-item>
				</q-list>
			</q-menu>
		</q-btn>
		<q-btn
			v-if="nowOrderEditorTrans"
			push
			square
			class="q-ml-sm"
			color="negative"
			@click="
				async () => {
					await OrderStore.post(SkuStore.skuListPicked, FeeStore.feeListPicked);
					router.push('/wmss/warehouse/order-list');
				}
			"
		>
			创建 {{ nowOrderEditorTrans?.text }}
		</q-btn>
	</div>

	<picker-cabinet-unit />
</template>

<script lang="ts" setup>
import * as XLSX from "xlsx";
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { MAP_ENUM_ORDER, ENUM_ORDER } from "qqlx-core";
import type { SkuInView } from "qqlx-core/dto/wmss/sku";

import pickerCabinetUnit from "@/components/picker-cabinet-unit.vue";
import containerSku from "@/components/container-sku.vue";
import { useNotifyStore } from "@/stores/notify";
import { useCorpStore } from "@/stores/corp";
import { useSkuStore } from "@/stores/sku";
import { useFeeStore } from "@/stores/fee";
import { useOrderStore } from "@/stores/order";

const route = useRoute();
const router = useRouter();

const filePicking = ref(null);
const filePickNext = async (file: File) => {
	if (!file) return;
	const reader = new FileReader(); // WebAPI
	reader.onload = async () => {
		const workbook = XLSX.read(reader.result, { type: "binary" });
		const sheet = workbook.Sheets["商品导入"];
		if (!sheet) throw new Error(`找不到表格 [商品导入] !`);
		const rowJsonList: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

		// 1.批量上传客户
		const uploading = [];
		for (let i in rowJsonList) {
			const row = rowJsonList[i];
			const schema = SkuStore.getSchema() as SkuInView;
			schema.keyOrigin = String(row["@产地"] || "");
			schema.keyFeat = String(row["@材质"]);
			schema.keyCode = String(row["@序号"]);
			schema.name = String(row["@品名"] || "");
			schema.norm = String(row["@规格"] || "");
			schema.count = Number(row["@数量"] || 0);
			schema.pounds = Number(row["@重量/吨"] || 0);
			schema.price = Number(row["@单价/元"] || 0);
			schema.unit = String(row["@单位"] || "项");
			schema.remark = String(row["@备注"] || "");

			const date = row["@日期"] || "";
			if (typeof date === "string") schema.timeCreate = new Date(date).getTime();
			else if (typeof date === "number") {
				const time = new Date(new Date("1900/1/1 00:00:00").getTime() + (date - 2) * 86400000 + 1000 * 60 * 60);
				schema.timeCreate = time.getTime();
			}
			if (schema.pounds > 0) schema.isPriceInPounds = true;
			uploading.push(schema);
		}
		SkuStore.skuListPicked = uploading;
	};
	reader.readAsBinaryString(file);
};

const NotifyStore = useNotifyStore();
const CorpStore = useCorpStore();
const SkuStore = useSkuStore();
const FeeStore = useFeeStore();
const OrderStore = useOrderStore();

const nowOrderEditorTrans = computed({
	get() {
		const match = MAP_ENUM_ORDER.find((e) => e.value === OrderStore.orderEditor.type);
		return match;
	},
	set() {},
});
onMounted(() => {
	if (nowOrderEditorTrans.value?.value === ENUM_ORDER.NONE) router.push("/wmss/warehouse/order-list");
	else SkuStore.setSchema();
});
</script>

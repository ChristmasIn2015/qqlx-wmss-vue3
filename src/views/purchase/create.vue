<template>
	<div class="mt-4"></div>
	<sku-input />

	<div class="mt-2"></div>
	<v-card class="d-flex pa-2">
		<v-spacer></v-spacer>
		<v-btn :color="SubjectContactStore.subjectContactPicked._id ? '' : 'primary'" @click="SubjectContactStore.openDialog(setContact)">
			{{ SubjectContactStore.subjectContactPicked._id ? SubjectContactStore.subjectContactPicked.name : "点击选择客户" }}
		</v-btn>
		<v-btn v-if="SubjectContactStore.subjectContactPicked._id" color="primary" class="ml-2" @click="postOrder()"
			>开单 {{ SkuStore.skuListPicked.length }} 项</v-btn
		>
	</v-card>

	<div class="mt-2"></div>
	<cabinet-unit-input />
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ENUM_ORDER_TYPE } from "qqlx-core";
import { SubjectContact } from "qqlx-core/brand/entity";

import { useSnackbarStore } from "@/store/snackbar";
import { useSubjectContactStore } from "@/store/subjectContact";
import { useSkuStore } from "@/store/sku";
import { useOrderStore } from "@/store/order";

import cabinetUnitInput from "@/components/cabinet-unit-input.vue";
import skuInput from "@/components/sku-input.vue";

const router = useRouter();
const SnackbarStore = useSnackbarStore();
const SkuStore = useSkuStore();
const SubjectContactStore = useSubjectContactStore();
const OrderStore = useOrderStore();

const setContact = (picked: SubjectContact) => {
	SubjectContactStore.subjectContactPicked = picked;
};
const postOrder = async () => {
	try {
		OrderStore.setSchema(ENUM_ORDER_TYPE.PURCHASE);
		const schema = OrderStore.getSchema(ENUM_ORDER_TYPE.PURCHASE);
		schema.contactId = SubjectContactStore.subjectContactPicked._id;
		OrderStore.orderEditor = schema;
		await OrderStore.post(SkuStore.skuListPicked);

		SkuStore.setSchema();
		OrderStore.setSchema(ENUM_ORDER_TYPE.PURCHASE);
		router.push("/view/purchase/list");
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
};

onMounted(async () => {
	try {
		SkuStore.setSchema();
		OrderStore.setSchema(ENUM_ORDER_TYPE.PURCHASE);
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
});
</script>

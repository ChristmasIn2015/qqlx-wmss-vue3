<template>
	<div class="q-pt-md q-pb-lg">
		<div class="text-h4 text-white text-weight-bold">
			<q-btn dense color="white" text-color="black" icon="arrow_back" @click="router.back()"></q-btn>
			<span> 修改 {{ nowOrderEditorTrans?.text }} {{ OrderStore.orderEditor.code }} </span>
		</div>
		<div class="text-white q-pt-sm">
			<span>您正在修改{{ nowOrderEditorTrans?.text }}据 {{ OrderStore.orderEditor.code }}</span>
		</div>
	</div>

	<container-sku />

	<div class="q-py-md row">
		<q-space></q-space>
		<q-btn class="q-ml-sm" square push color="negative" :loading="OrderStore.loadding" @click="putOrder()"> 修改 {{ OrderStore.orderEditor.code }} </q-btn>
	</div>

	<picker-cabinet-unit />
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ENUM_ORDER, MAP_ENUM_ORDER } from "qqlx-core";

import pickerCabinetUnit from "@/components/picker-cabinet-unit.vue";
import containerSku from "@/components/container-sku.vue";
import listContact from "@/components/list-contact.vue";
import { useNotifyStore } from "@/stores/notify";
import { useCorpStore } from "@/stores/corp";
import { useSkuStore } from "@/stores/sku";
import { useFeeStore } from "@/stores/fee";
import { useContactStore } from "@/stores/contact";
import { useOrderStore } from "@/stores/order";

const route = useRoute();
const router = useRouter();

const NotifyStore = useNotifyStore();
const CorpStore = useCorpStore();
const SkuStore = useSkuStore();
const FeeStore = useFeeStore();
const ContactStore = useContactStore();
const OrderStore = useOrderStore();

const putOrder = async () => {
	const code = await OrderStore.put(OrderStore.orderEditor, SkuStore.skuListPicked, FeeStore.feeListPicked);
	router.push(`/wmss/warehouse/order-list?code=${code}`);
};

const nowOrderEditorTrans = computed({
	get() {
		const match = MAP_ENUM_ORDER.find((e) => e.value === OrderStore.orderEditor.type);
		return match;
	},
	set() {},
});
onMounted(() => {
	if (OrderStore.orderEditor._id) {
		//
	} else router.push("/wmss/warehouse/order-list");
});
</script>

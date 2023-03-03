<template>
	<div class="q-pt-md q-pb-lg text-white">
		<div class="text-h4 text-weight-bold">大件库存</div>
		<div class="q-pt-sm">
			<div>您可以看到已经入库的 “大件商品”，及它们被领料、发货后的剩余库存</div>
		</div>
	</div>

	<PickerSkuGetIn :name="pickingName" :norm="pickingNorm" :readonly="true" />
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import { useSkuGetInStore } from "@/stores/sku-indivudual";
import PickerSkuGetIn from "@/components/picker-sku-individual.vue";
import { onBeforeMount, ref } from "vue";

const route = useRoute();
const SkuGetInStore = useSkuGetInStore();

const pickingName = ref("");
const pickingNorm = ref("");

onBeforeMount(() => {
	const { name, norm } = route.query;
	pickingName.value = (name || "").toString();
	pickingNorm.value = (norm || "").toString();
});
</script>

<style lang="sass" scoped></style>

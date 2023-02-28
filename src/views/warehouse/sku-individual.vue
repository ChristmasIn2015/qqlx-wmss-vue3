<template>
	<div class="q-pt-md q-pb-lg text-white">
		<div class="text-h4 text-weight-bold">大件库存</div>
		<div class="q-pt-sm">
			<div>您可以看到已经入库的 “大件商品”，及它们被领料、发货后的剩余库存</div>
		</div>
	</div>

	<PickerSkuGetIn :readonly="true" />
</template>

<script lang="ts" setup>
import { useSkuGetInStore } from "@/stores/sku-indivudual";
import PickerSkuGetIn from "@/components/picker-sku-individual.vue";

const SkuGetInStore = useSkuGetInStore();
</script>

<style lang="sass" scoped></style>

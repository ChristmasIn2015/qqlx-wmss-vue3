<template>
	<v-text-field class="my-2 ml-n2" hide-details density="compact" :value="modelValue" loading @input="handleElInput" @blur="$emit('blur')">
		<template v-slot:loader> </template>
	</v-text-field>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
	props: ["modelValue"],
	emits: ["update:modelValue", "blur", "input"],
	methods: {
		handleElInput(value: any) {
			this.$emit("update:modelValue", value.target.value);
			this.$emit("input");
		},
	},
});
</script>

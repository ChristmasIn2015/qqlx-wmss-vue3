<template>
	<v-text-field
		hide-details
		class="my-2 ml-n2"
		variant="solo"
		density="compact"
		:value="modelValue"
		@input="handleElInput"
		@blur="$emit('blur')"
	></v-text-field>
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

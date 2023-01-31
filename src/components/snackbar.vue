<template>
	<!-- 成功 -->
	<v-snackbar v-model="isSuccess" multi-line color="green" location="right bottom">
		<span v-html="successMessage"></span>
	</v-snackbar>

	<!-- 失败 -->
	<v-snackbar v-model="isFail" :timeout="-1" multi-line>
		<span v-html="failMessage"></span>

		<template v-slot:actions>
			<v-btn icon="mdi-close" @click="SnackStore.clearFail()"></v-btn>
		</template>
	</v-snackbar>
</template>

<script lang="ts" setup>
import { storeToRefs } from "pinia";
import { useSnackbarStore } from "@/store/snackbar";

const SnackStore = useSnackbarStore();
const { isSuccess, successMessage, isFail, failMessage } = storeToRefs(SnackStore);
</script>

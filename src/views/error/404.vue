<template>
	<div class="text-center pt-12">
		<div class="text-h1 pt-12 my-12">找不到对应路径</div>
		<v-btn color="primary" @click="router.push('/view')">返回主页</v-btn>
	</div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";

const router = useRouter();
</script>

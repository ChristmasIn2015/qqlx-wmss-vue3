<template>
	<certification-list :read="true" />
</template>

<script lang="ts" setup>
import { onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ENUM_SUBJECT_TYPE, ENUM_SUBJECT_ROLE, ENUM_COUNT_WAY } from "qqlx-core";

import certificationList from "@/components/certification-list.vue";
</script>

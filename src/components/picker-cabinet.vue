<template>
	<div class="row">
		<q-card v-for="cabinet in CabinetStore.cabinetList" class="w-200 q-mr-sm q-mb-sm shadow-15">
			<q-toolbar>
				<q-toolbar-title>
					{{ cabinet.name }}
				</q-toolbar-title>

				<q-btn dense :color="(route.meta?.color as string)" v-close-popup @click="$emit('pick', cloneDeep(cabinet))">选择</q-btn>
			</q-toolbar>
			<q-card-section class="text-grey q-pt-none">
				<div class="row">
					<div class="col">单位</div>
					<div class="col text-right">{{ cabinet.unit }}</div>
				</div>
				<div class="row">
					<div class="col">商品开单</div>
					<div class="col text-right">
						{{ CabinetStore.getLayoutChinese(cabinet.layout)?.text }}

						<q-tooltip v-if="CabinetStore.getLayoutChinese(cabinet.layout)?.tip" class="text-body1">
							{{ CabinetStore.getLayoutChinese(cabinet.layout)?.tip }}
						</q-tooltip>
					</div>
				</div>
				<div class="row">
					<div class="col">过磅公式</div>
					<div class="col text-right">
						{{ CabinetStore.getFormulaChinese(cabinet.formula)?.text }}
						<q-tooltip v-if="CabinetStore.getFormulaChinese(cabinet.formula)?.tip" class="text-body1">
							{{ CabinetStore.getFormulaChinese(cabinet.formula)?.tip }}
						</q-tooltip>
					</div>
				</div>
			</q-card-section>
		</q-card>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import { cloneDeep } from "lodash";
import { Notify, useQuasar } from "quasar";
import { ENUM_ROLE_WMSS, MAP_ENUM_ROLE_WMSS } from "qqlx-core";
import type { RoleWMSSJoined } from "qqlx-core/dto/wmss/role";

import { useNotifyStore } from "@/stores/notify";
import { useUserStore } from "@/stores/user";
import { useCorpStore } from "@/stores/corp";
import { useCabinetStore } from "@/stores/cabinet";

const route = useRoute();
const NotifyStore = useNotifyStore();
const CabinetStore = useCabinetStore();

// action
onMounted(() => {
	CabinetStore.get();
});
</script>

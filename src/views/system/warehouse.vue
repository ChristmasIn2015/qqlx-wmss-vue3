<template>
	<div class="q-pt-md q-pb-lg q-mt-lg text-white">
		<div class="text-h4 text-weight-bold row items-center">
			<span>提货仓库</span>
			<q-btn dense icon="more_vert" class="q-ml-sm" style="margin-bottom: 3px" size="20px">
				<q-menu>
					<q-list>
						<q-item
							clickable
							v-close-popup
							@click="
								() => {
									CorpStore.setSchema();
									dialogWarehouse = true;
								}
							"
						>
							<q-item-section>添加新仓库</q-item-section>
						</q-item>
						<q-item clickable @click="showWarehouseDisabled = !showWarehouseDisabled">
							<q-item-section>
								<span :class="{ 'text-negative': !showWarehouseDisabled }">{{ showWarehouseDisabled ? "返回" : "最近删除" }}</span>
							</q-item-section>
						</q-item>
					</q-list>
				</q-menu>
			</q-btn>
		</div>
		<div class="q-mt-md">
			<div>打印时，已选择的提货仓库将会出现在单据左下方。</div>
		</div>
	</div>

	<div class="row">
		<q-card
			v-for="house in WarehouseStore.WarehouseList.filter((e) => e.isDisabled === showWarehouseDisabled)"
			class="w-200 q-mr-md q-mb-md"
			:class="house._id === WarehouseStore.WarehousePicked?._id ? 'w-325' : ''"
		>
			<q-card-section>
				<div class="text-h6 ellipsis" :class="house._id === WarehouseStore.WarehousePicked?._id ? 'text-weight-bold' : 'text-grey'">
					{{ house.name }}
				</div>
				<div class="text-grey ellipsis">
					<div>{{ house.address || "-" }}</div>
					<div>{{ "-" }}</div>
				</div>
			</q-card-section>
			<q-card-actions align="right">
				<q-btn icon="more_horiz" flat>
					<q-menu>
						<q-list>
							<q-item clickable v-close-popup @click="WarehouseStore.pick(house)">
								<q-item-section>切换</q-item-section>
							</q-item>
							<q-separator />
							<q-item
								clickable
								v-close-popup
								@click="
									() => {
										WarehouseStore.setSchema(house);
										dialogWarehouse = true;
									}
								"
							>
								<q-item-section>修改</q-item-section>
							</q-item>
							<q-item clickable v-close-popup>
								<q-item-section
									class="text-negative"
									@click="
										() => {
											house.isDisabled = !house.isDisabled;
											WarehouseStore.setSchema(house);
											WarehouseStore.patch();
										}
									"
									>{{ house.isDisabled ? "恢复" : "删除" }}</q-item-section
								>
							</q-item>
						</q-list>
					</q-menu>
				</q-btn>
			</q-card-actions>
		</q-card>
	</div>

	<q-dialog v-model="dialogWarehouse" persistent>
		<q-card class="w-400">
			<q-toolbar>
				<q-toolbar-title>仓库</q-toolbar-title>
				<q-btn dense flat icon="close" v-close-popup></q-btn>
			</q-toolbar>
			<q-separator />

			<q-card-section>
				<q-input filled label="仓库名称" class="q-mb-sm" v-model="WarehouseStore.WarehouseEditor.name">
					<template v-slot:before>
						<q-icon name="person" />
					</template>
				</q-input>

				<q-input filled label="仓库地址" class="q-mb-sm" v-model="WarehouseStore.WarehouseEditor.address">
					<template v-slot:before>
						<q-icon name="event" />
					</template>
				</q-input>
			</q-card-section>

			<q-card-actions align="right">
				<q-btn
					color="primary"
					push
					square
					@click="
						async () => {
							if (WarehouseStore.WarehouseEditor._id) await WarehouseStore.patch();
							else await WarehouseStore.post();
							dialogWarehouse = false;
						}
					"
				>
					{{ WarehouseStore.WarehouseEditor._id ? "保存" : "新增" }}
				</q-btn>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { onMounted, ref, computed } from "vue";
import { ENUM_ROLE_WMSS, MAP_ENUM_ROLE_WMSS } from "qqlx-core";

import { getTimeGap } from "@/utils";
import { useNotifyStore } from "@/stores/notify";
import { useUserStore } from "@/stores/user";
import { useCorpStore } from "@/stores/corp";
import { useWarehouseStore } from "@/stores/warehouse";
import { useRoleWMSSStore } from "@/stores/role";
import { useAnalysisStore } from "@/stores/analysis";

const router = useRouter();
const CorpStore = useCorpStore();
const WarehouseStore = useWarehouseStore();
const AnalysisStore = useAnalysisStore();

const showWarehouseDisabled = ref(false);
const dialogWarehouse = ref(false);
</script>

<style scoped lang="scss"></style>

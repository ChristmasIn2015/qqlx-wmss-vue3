<template>
	<div class="q-pt-md q-pb-lg">
		<div class="text-h4 text-white text-weight-bold row items-center">
			<span>公司</span>
			<q-btn dense icon="more_vert" class="q-ml-sm">
				<q-menu>
					<q-list>
						<q-item
							clickable
							v-close-popup
							@click="
								() => {
									CorpStore.setSchema();
									dialogCorp = true;
								}
							"
						>
							<q-item-section>添加新公司</q-item-section>
						</q-item>
						<q-item clickable @click="showCorpDisabled = !showCorpDisabled">
							<q-item-section>
								<span :class="{ 'text-negative': !showCorpDisabled }">{{ showCorpDisabled ? "返回" : "最近删除" }}</span>
							</q-item-section>
						</q-item>
					</q-list>
				</q-menu>
			</q-btn>
		</div>
		<div class="text-white q-mt-md">
			您的使用数据，如订单信息、库存信息等，都将会保存在
			<span class="text-weight-bold">@{{ CorpStore.corpPicked?.name }}</span>
			中。
		</div>
	</div>

	<!-- 公司列表 -->
	<!-- 公司列表 -->
	<div class="row">
		<q-card
			v-for="corp in CorpStore.corpList.filter((e) => e.isDisabled === showCorpDisabled)"
			class="w-200 q-mr-md q-mb-md shadow-15"
			:class="corp._id === CorpStore.corpPicked?._id ? 'w-325' : ''"
		>
			<q-card-section>
				<div class="text-h6 ellipsis" :class="corp._id === CorpStore.corpPicked?._id ? 'text-weight-bold' : 'text-grey'">{{ corp.name }}</div>
				<div class="text-grey ellipsis">{{ corp.contact || "-" }}</div>
				<div class="text-grey ellipsis">{{ corp.address || "-" }}</div>
			</q-card-section>
			<q-card-actions>
				<span class="text-primary q-px-sm" v-if="corp.joinRole?.role === ENUM_ROLE_WMSS.ROOT">
					<q-icon name="manage_accounts" size="20px" class="q-mr-xs"></q-icon>
					<span>管理员</span>
				</span>
				<span v-else text-color="grey">
					<span>成员</span>
				</span>

				<q-space></q-space>
				<q-btn icon="more_horiz" flat>
					<q-menu>
						<q-list>
							<q-item clickable v-close-popup @click="CorpStore.pick(corp)">
								<q-item-section>切换到这家</q-item-section>
							</q-item>
							<q-separator />
							<q-item
								clickable
								v-close-popup
								@click="
									() => {
										CorpStore.setSchema(corp);
										dialogCorp = true;
									}
								"
							>
								<q-item-section>修改</q-item-section>
							</q-item>
							<q-item clickable v-close-popup>
								<q-item-section class="text-negative" @click="CorpStore.delete(corp)">
									{{ corp.isDisabled ? "恢复" : "删除" }}
								</q-item-section>
							</q-item>
						</q-list>
					</q-menu>
				</q-btn>
			</q-card-actions>
		</q-card>
	</div>

	<div class="q-pt-md q-pb-lg q-mt-lg">
		<div class="text-h4 text-weight-bold row items-center">
			<span>提货仓库</span>
			<q-btn dense icon="more_vert" class="q-ml-sm" style="margin-bottom: 3px">
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
		<div class="text-grey q-mt-md">打印时，已选择的提货仓库将会出现在单据左下方。</div>
	</div>

	<!-- 仓库 -->
	<!-- 仓库 -->
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
				<div class="text-grey ellipsis">{{ house.address || "-" }}</div>
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

	<q-dialog v-model="dialogCorp" persistent>
		<q-card class="w-400">
			<q-toolbar>
				<q-toolbar-title>公司</q-toolbar-title>
				<q-btn dense flat icon="close" v-close-popup></q-btn>
			</q-toolbar>
			<q-separator />

			<q-card-section>
				<q-input filled label="公司名称" class="q-mb-sm" v-model="CorpStore.corpEditor.name">
					<template v-slot:before>
						<q-icon name="person" />
					</template>
				</q-input>

				<q-input filled label="联系方式" class="q-mb-sm" v-model="CorpStore.corpEditor.contact">
					<template v-slot:before>
						<q-icon name="phone" />
					</template>
				</q-input>

				<q-input filled label="公司地址" class="q-mb-sm" v-model="CorpStore.corpEditor.address">
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
							if (CorpStore.corpEditor._id) await CorpStore.patch();
							else await CorpStore.post();
							dialogCorp = false;
						}
					"
				>
					{{ CorpStore.corpEditor._id ? "保存" : "新增" }}
				</q-btn>
			</q-card-actions>
		</q-card>
	</q-dialog>

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

	<q-dialog v-model="dialogRoleWMSS">
		<div class="text-center">
			<q-card class="q-mt-xl q-pt-lg w-500">
				<div id="wx-login-join"></div>
			</q-card>
		</div>
	</q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { ENUM_ROLE_WMSS, MAP_ENUM_ROLE_WMSS } from "qqlx-core";

import { useNotifyStore } from "@/stores/notify";
import { useUserStore } from "@/stores/user";
import { useCorpStore } from "@/stores/corp";
import { useWarehouseStore } from "@/stores/warehouse";
import { useRoleWMSSStore } from "@/stores/role";

const CorpStore = useCorpStore();
const WarehouseStore = useWarehouseStore();

const showCorpDisabled = ref(false);
const dialogCorp = ref(false);
const showWarehouseDisabled = ref(false);
const dialogWarehouse = ref(false);

const dialogRoleWMSS = ref(false);
</script>

<style scoped lang="scss"></style>

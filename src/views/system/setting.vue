<template>
	<div class="q-pt-md q-pb-lg">
		<div class="text-h5 text-white text-weight-bold">公司列表</div>
		<div class="text-white q-pt-sm">
			<span>市场商业主体</span>
			<a class="q-mx-sm text-primary cursor-pointer text-negative" @click="showCorpDisabled = !showCorpDisabled">{{
				showCorpDisabled ? "取消" : "最近删除"
			}}</a>
		</div>
	</div>

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
			<q-card-actions align="right">
				<q-chip
					v-if="corp.joinRole?.role === ENUM_ROLE_WMSS.ROOT"
					class="glossy"
					text-color="white"
					:color="corp._id === CorpStore.corpPicked?._id ? 'primary' : ''"
					icon="manage_accounts"
				>
					管理员
				</q-chip>
				<q-chip v-else class="glossy" text-color="white" color="grey">成员</q-chip>

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
										CorpStore.setSchema();
										dialogCorp = true;
									}
								"
							>
								<q-item-section>添加新公司</q-item-section>
							</q-item>
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
								<q-item-section class="text-negative" @click="CorpStore.delete(corp)">{{ corp.isDisabled ? "恢复" : "删除" }}</q-item-section>
							</q-item>
						</q-list>
					</q-menu>
				</q-btn>
			</q-card-actions>
		</q-card>
	</div>

	<div class="q-pt-md q-pb-lg q-mt-lg">
		<div class="text-h5 text-primary text-weight-bold">仓库列表</div>
		<div class="text-grey q-pt-sm">
			<span>您的商品仓库</span>
			<a class="q-mx-sm text-primary cursor-pointer text-negative" @click="showWarehouseDisabled = !showWarehouseDisabled">{{
				showWarehouseDisabled ? "取消" : "最近删除"
			}}</a>
		</div>
	</div>

	<div class="row">
		<q-card
			v-for="house in WarehouseStore.WarehouseList.filter((e) => e.isDisabled === showWarehouseDisabled)"
			class="w-200 q-mr-md q-mb-md shadow-15"
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
										CorpStore.setSchema();
										dialogWarehouse = true;
									}
								"
							>
								<q-item-section>添加新仓库</q-item-section>
							</q-item>
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
					glossy
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
					glossy
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

	<div class="q-pt-xl q-pb-md">
		<div class="text-h5 text-primary text-weight-bold">成员列表</div>
		<div class="text-grey q-pt-sm">
			<span>商业主体 @{{ CorpStore.corpPicked?.name }} 中的成员</span>
		</div>
	</div>

	<div class="q-mb-md">
		<q-btn-group class="bg-white">
			<q-btn
				v-for="role in RoleWMSSStore.MAP_ENUM_ROLE_WMSS"
				square
				:label="role.text"
				:text-color="roleNow === role.value ? 'white' : 'black'"
				:color="roleNow === role.value ? 'primary' : ''"
				@click="roleNow = role.value"
			>
			</q-btn>
		</q-btn-group>
		<q-btn class="q-mx-sm" label="加入我们" color="primary" @click="openRoleWMSS()"> </q-btn>
	</div>
	<q-card style="width: 535px">
		<q-list>
			<q-item v-for="role in RoleWMSSStore.RoleWMSSList.filter((e) => e.role === roleNow)">
				<q-item-section avatar>
					<q-avatar rounded>
						<img :src="role.joinWeChat?.avator || UserStore.wxAvatorDefault" />
					</q-avatar>
				</q-item-section>
				<q-item-section>
					<q-item-label class="text-weight-bold"> {{ role.joinWeChat?.nickname }} </q-item-label>
					<q-item-label caption> {{ role.joinWeChat?.timeCreateString }} </q-item-label>
				</q-item-section>
				<q-item-section side>
					<q-item-label>
						<q-btn icon="more_horiz" flat>
							<q-menu>
								<q-list class="w-100">
									<div v-if="role.role === ENUM_ROLE_WMSS.BASE">
										<div class="q-pa-md text-weight-bold text-primary">设置为</div>
										<q-separator />
										<q-item
											v-for="option in RoleWMSSStore.OPTION_ENUM_ROLE_WMSS"
											clickable
											v-close-popup
											@click="
												async () => {
													await RoleWMSSStore.post(role.userId, option.value);
													roleNow = option.value;
												}
											"
										>
											<q-item-section>{{ option.text }}</q-item-section>
										</q-item>
										<q-separator />
									</div>
									<q-item clickable v-close-popup @click="RoleWMSSStore.delete(role._id)">
										<q-item-section class="text-negative">删除</q-item-section>
									</q-item>
								</q-list>
							</q-menu>
						</q-btn>
					</q-item-label>
					<q-item-label caption> </q-item-label>
				</q-item-section>
			</q-item>
			<q-item v-if="roleRoot">
				<q-item-section avatar>
					<q-avatar rounded>
						<img :src="roleRoot?.joinWeChat?.avator || UserStore.wxAvatorDefault" />
					</q-avatar>
				</q-item-section>
				<q-item-section>
					<q-item-label class="text-weight-bold"> {{ roleRoot.joinWeChat?.nickname }} </q-item-label>
					<q-item-label caption> {{ roleRoot.joinWeChat?.timeCreateString }} </q-item-label>
				</q-item-section>
				<q-item-section side>
					<q-item-label>
						<q-chip class="glossy" text-color="white" color="primary" icon="manage_accounts">管理员</q-chip>
					</q-item-label>
				</q-item-section>
			</q-item>
		</q-list>
	</q-card>
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
import type { RoleWMSSJoined } from "qqlx-core/dto/wmss/role";

import { useNotifyStore } from "@/stores/notify";
import { useUserStore } from "@/stores/user";
import { useCorpStore } from "@/stores/corp";
import { useWarehouseStore } from "@/stores/warehouse";
import { useRoleWMSSStore } from "@/stores/role";

const UserStore = useUserStore();
const CorpStore = useCorpStore();
const WarehouseStore = useWarehouseStore();
const RoleWMSSStore = useRoleWMSSStore();

const showCorpDisabled = ref(false);
const dialogCorp = ref(false);
const showWarehouseDisabled = ref(false);
const dialogWarehouse = ref(false);

const roleNow = ref(ENUM_ROLE_WMSS.BASE);
const roleRoot = computed({
	get: () => RoleWMSSStore.RoleWMSSList.find((e) => e.role === ENUM_ROLE_WMSS.ROOT),
	set: () => {},
});
const dialogRoleWMSS = ref(false);
const openRoleWMSS = () => {
	dialogRoleWMSS.value = true;

	setTimeout(() => {
		const WxLogin = window.WxLogin as any;
		WxLogin &&
			document.getElementById("wx-login-join") &&
			new WxLogin({
				id: "wx-login-join",
				appid: "wxd0e6ee13822ccb7f",
				scope: "snsapi_login",
				redirect_uri: "http://qqlx.tech/wmss/login",
				state: `JOIN`,
			});
	}, 500);
};
</script>

<style scoped lang="scss"></style>

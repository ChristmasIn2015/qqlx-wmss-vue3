<template>
	<div class="q-pt-xl q-pb-md">
		<div class="text-h4 text-white text-weight-bold">公司成员</div>
		<div class="text-white q-pt-sm">
			<span>@{{ CorpStore.corpPicked?.name }}</span>
			<span class="q-mx-sm text-underline text-negative cursor-pointer text-weight-bold" @click="openRoleWMSS()">加入团队</span>
		</div>
	</div>

	<div class="row">
		<q-card class="q-mr-sm q-mb-sm" v-for="base in RoleWMSSStore.RoleWMSSList.filter((e) => e.role === ENUM_ROLE_WMSS.BASE)">
			<q-item>
				<q-item-section avatar>
					<q-avatar rounded>
						<img :src="base.joinWeChat?.avator || UserStore.wxAvatorDefault" />
					</q-avatar>
				</q-item-section>
				<q-item-section>
					<q-item-label class="text-weight-bold"> {{ base.joinWeChat?.nickname }} </q-item-label>
					<q-item-label caption> {{ base.joinWeChat?.timeCreateString }} </q-item-label>
				</q-item-section>
				<q-item-section side>
					<q-item-label>
						<q-btn dense icon="more_horiz" flat>
							<q-menu>
								<q-list class="w-100">
									<q-item clickable v-close-popup @click="RoleWMSSStore.delete(base._id)">
										<q-item-section class="text-negative">删除成员</q-item-section>
									</q-item>
								</q-list>
							</q-menu>
						</q-btn>
					</q-item-label>
					<q-item-label caption> </q-item-label>
				</q-item-section>
			</q-item>
		</q-card>

		<q-card class="q-mr-sm q-mb-sm">
			<q-item v-if="roleRoot">
				<q-item-section avatar>
					<q-avatar rounded>
						<img :src="roleRoot?.joinWeChat?.avator || UserStore.wxAvatorDefault" />
						<q-badge floating>管理员</q-badge>
					</q-avatar>
				</q-item-section>
				<q-item-section>
					<q-item-label class="text-weight-bold">
						{{ roleRoot.joinWeChat?.nickname }}
					</q-item-label>
					<q-item-label caption> {{ roleRoot.joinWeChat?.timeCreateString }} </q-item-label>
				</q-item-section>
			</q-item>
		</q-card>
	</div>

	<div class="q-pt-lg q-pb-lg">
		<div class="text-h5 text-weight-bold">权限管理</div>
	</div>

	<q-card class="q-mb-sm">
		<q-card-section class="q-pb-none">
			<div class="text-h6"><q-icon name="construction"></q-icon> 仓库权限</div>
			<div class="text-body1 text-grey">
				<div>1.对入库/发货单（采购/销售转交的） 中的商品进行入库或是发货</div>
				<div>2.开具仓库订单 (入库单、发货单、领料单、加工单)、编辑/删除仓库订单</div>
			</div>
		</q-card-section>
		<q-card-section class="row">
			<q-btn
				v-for="roleBase in RoleWMSSStore.RoleWMSSList.filter((e) => e.role === ENUM_ROLE_WMSS.BASE)"
				unelevated
				push
				square
				color="grey-11"
				class="q-mr-md q-mb-sm q-py-sm q-px-sm"
				@click="toggleRoleWMSS(roleBase, ENUM_ROLE_WMSS.WM)"
			>
				<q-avatar rounded>
					<img :src="roleBase.joinWeChat?.avator || UserStore.wxAvatorDefault" />
				</q-avatar>
				<div class="text-left text-black q-ml-md">
					<div>{{ roleBase.joinWeChat?.nickname }}</div>
					<div>{{ roleBase.timeCreateString }}</div>
				</div>
				<q-badge
					v-if="!!RoleWMSSStore.RoleWMSSList.find((e) => e.role === ENUM_ROLE_WMSS.WM && e.userId === roleBase.userId)"
					color="indigo-14"
					floating
				>
					已开启
				</q-badge>
				<q-badge v-else color="grey" floating> 未开启 </q-badge>
			</q-btn>

			<q-btn v-if="roleRoot" unelevated push square color="grey-11" class="q-mr-md q-mb-sm q-py-sm q-px-sm" disable>
				<q-avatar rounded>
					<img :src="roleRoot.joinWeChat?.avator || UserStore.wxAvatorDefault" />
				</q-avatar>
				<div class="text-left text-black q-ml-md">
					<div>{{ roleRoot.joinWeChat?.nickname }}</div>
					<div>{{ roleRoot.timeCreateString }}</div>
				</div>
				<q-badge color="indigo-14" floating> 已开启</q-badge>
			</q-btn>
		</q-card-section>
	</q-card>
	<q-card class="q-mb-sm">
		<q-card-section class="q-pb-none">
			<div class="text-h6"><q-icon name="shopping_cart" style="margin-top: -4px"></q-icon> 采购权限</div>
			<div class="text-body1 text-grey">
				<div>1.开具采购订单、编辑采购订单、删除采购订单</div>
			</div>
		</q-card-section>
		<q-card-section class="row">
			<q-btn
				v-for="roleBase in RoleWMSSStore.RoleWMSSList.filter((e) => e.role === ENUM_ROLE_WMSS.BASE)"
				unelevated
				push
				square
				color="grey-11"
				class="q-mr-md q-mb-sm q-py-sm q-px-sm"
				@click="toggleRoleWMSS(roleBase, ENUM_ROLE_WMSS.PURCHASE)"
			>
				<q-avatar rounded>
					<img :src="roleBase.joinWeChat?.avator || UserStore.wxAvatorDefault" />
				</q-avatar>
				<div class="text-left text-black q-ml-md">
					<div>{{ roleBase.joinWeChat?.nickname }}</div>
					<div>{{ roleBase.timeCreateString }}</div>
				</div>
				<q-badge
					v-if="!!RoleWMSSStore.RoleWMSSList.find((e) => e.role === ENUM_ROLE_WMSS.PURCHASE && e.userId === roleBase.userId)"
					color="primary"
					floating
				>
					已开启
				</q-badge>
				<q-badge v-else color="grey" floating> 未开启 </q-badge>
			</q-btn>

			<q-btn v-if="roleRoot" unelevated push square color="grey-11" class="q-mr-md q-mb-sm q-py-sm q-px-sm" disable>
				<q-avatar rounded>
					<img :src="roleRoot.joinWeChat?.avator || UserStore.wxAvatorDefault" />
				</q-avatar>
				<div class="text-left text-black q-ml-md">
					<div>{{ roleRoot.joinWeChat?.nickname }}</div>
					<div>{{ roleRoot.timeCreateString }}</div>
				</div>
				<q-badge color="primary" floating> 已开启</q-badge>
			</q-btn>
		</q-card-section>
	</q-card>
	<q-card class="q-mb-sm">
		<q-card-section class="q-pb-none">
			<div class="text-h6"><q-icon name="phone_callback"></q-icon> 销售权限</div>
			<div class="text-body1 text-grey">
				<div>1.开具销售订单、编辑/删除销售订单</div>
			</div>
		</q-card-section>
		<q-card-section class="row">
			<q-btn
				v-for="roleBase in RoleWMSSStore.RoleWMSSList.filter((e) => e.role === ENUM_ROLE_WMSS.BASE)"
				unelevated
				push
				square
				color="grey-11"
				class="q-mr-md q-mb-sm q-py-sm q-px-sm"
				@click="toggleRoleWMSS(roleBase, ENUM_ROLE_WMSS.SALES)"
			>
				<q-avatar rounded>
					<img :src="roleBase.joinWeChat?.avator || UserStore.wxAvatorDefault" />
				</q-avatar>
				<div class="text-left text-black q-ml-md">
					<div>{{ roleBase.joinWeChat?.nickname }}</div>
					<div>{{ roleBase.timeCreateString }}</div>
				</div>
				<q-badge
					v-if="!!RoleWMSSStore.RoleWMSSList.find((e) => e.role === ENUM_ROLE_WMSS.SALES && e.userId === roleBase.userId)"
					color="pink-6"
					floating
				>
					已开启
				</q-badge>
				<q-badge v-else color="grey" floating> 未开启 </q-badge>
			</q-btn>

			<q-btn v-if="roleRoot" unelevated push square color="grey-11" class="q-mr-md q-mb-sm q-py-sm q-px-sm" disable>
				<q-avatar rounded>
					<img :src="roleRoot.joinWeChat?.avator || UserStore.wxAvatorDefault" />
				</q-avatar>
				<div class="text-left text-black q-ml-md">
					<div>{{ roleRoot.joinWeChat?.nickname }}</div>
					<div>{{ roleRoot.timeCreateString }}</div>
				</div>
				<q-badge color="pink-6" floating> 已开启</q-badge>
			</q-btn>
		</q-card-section>
	</q-card>
	<q-card class="q-mb-sm">
		<q-card-section class="q-pb-none">
			<div class="text-h6"><q-icon name="add_card"></q-icon> 财务权限</div>
			<div class="text-body1 text-grey">
				<div>1.添加资金记录（收款/付款）</div>
				<div>2.使用资金记录结清订单</div>
				<div>3.使用资金记录添加发票记录（销项/进项）</div>
			</div>
		</q-card-section>
		<q-card-section class="row">
			<q-btn
				v-for="roleBase in RoleWMSSStore.RoleWMSSList.filter((e) => e.role === ENUM_ROLE_WMSS.BASE)"
				unelevated
				push
				square
				color="grey-11"
				class="q-mr-md q-mb-sm q-py-sm q-px-sm"
				@click="toggleRoleWMSS(roleBase, ENUM_ROLE_WMSS.FINANCE)"
			>
				<q-avatar rounded>
					<img :src="roleBase.joinWeChat?.avator || UserStore.wxAvatorDefault" />
				</q-avatar>
				<div class="text-left text-black q-ml-md">
					<div>{{ roleBase.joinWeChat?.nickname }}</div>
					<div>{{ roleBase.timeCreateString }}</div>
				</div>
				<q-badge
					v-if="!!RoleWMSSStore.RoleWMSSList.find((e) => e.role === ENUM_ROLE_WMSS.FINANCE && e.userId === roleBase.userId)"
					color="teal"
					floating
				>
					已开启
				</q-badge>
				<q-badge v-else color="grey" floating> 未开启 </q-badge>
			</q-btn>

			<q-btn v-if="roleRoot" unelevated push square color="grey-11" class="q-mr-md q-mb-sm q-py-sm q-px-sm" disable>
				<q-avatar rounded>
					<img :src="roleRoot.joinWeChat?.avator || UserStore.wxAvatorDefault" />
				</q-avatar>
				<div class="text-left text-black q-ml-md">
					<div>{{ roleRoot.joinWeChat?.nickname }}</div>
					<div>{{ roleRoot.timeCreateString }}</div>
				</div>
				<q-badge color="teal" floating> 已开启</q-badge>
			</q-btn>
		</q-card-section>
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
import { useRoute } from "vue-router";
import { ENUM_ROLE_WMSS, MAP_ENUM_ROLE_WMSS } from "qqlx-core";
import type { RoleWMSS } from "qqlx-core/schema/wmss/role";

import { useUserStore } from "@/stores/user";
import { useCorpStore } from "@/stores/corp";
import { useRoleWMSSStore } from "@/stores/role";

const route = useRoute();
const UserStore = useUserStore();
const CorpStore = useCorpStore();
const RoleWMSSStore = useRoleWMSSStore();

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
const toggleRoleWMSS = async (base: RoleWMSS, exist: ENUM_ROLE_WMSS) => {
	const all = RoleWMSSStore.RoleWMSSList;
	const match = all.find((e) => e.role === exist && e.userId === base.userId);
	if (match) await RoleWMSSStore.delete(match._id);
	else await RoleWMSSStore.post(base.userId, exist);
};

// action
onMounted(() => RoleWMSSStore.get());
</script>

<style scoped lang="scss"></style>

<template>
	<div class="q-pt-xl q-pb-md">
		<div class="text-h4 text-white text-weight-bold">团队成员</div>
		<div class="text-white q-pt-sm">
			<span>@{{ CorpStore.corpPicked?.name }}</span>
		</div>
	</div>

	<div class="row items-start">
		<q-card style="width: 575px">
			<q-list>
				<q-item v-for="base in RoleWMSSStore.RoleWMSSList.filter((e) => e.role === ENUM_ROLE_WMSS.BASE)">
					<q-item-section avatar>
						<q-avatar rounded>
							<img :src="base.joinWeChat?.avator || UserStore.wxAvatorDefault" />
						</q-avatar>
					</q-item-section>
					<q-item-section>
						<q-item-label class="text-weight-bold"> {{ base.joinWeChat?.nickname }} </q-item-label>
						<q-item-label caption> {{ base.joinWeChat?.timeCreateString }} </q-item-label>
					</q-item-section>

					<q-item-section>
						<q-item-label caption>
							<q-btn
								v-for="option in RoleWMSSStore.OPTION_ENUM_ROLE_WMSS"
								dense
								push
								square
								icon="check"
								:color="RoleWMSSStore.RoleWMSSList.find((e) => e.role === option.value) ? 'primary' : ''"
								:text-color="RoleWMSSStore.RoleWMSSList.find((e) => e.role === option.value) ? 'white' : 'black'"
								@click="toggleRoleWMSS(base, option.value)"
							>
								<q-tooltip class="text-body1">{{ option.text }}</q-tooltip>
							</q-btn>
						</q-item-label>
					</q-item-section>
					<q-item-section side>
						<q-item-label>
							<q-btn dense icon="more_horiz" flat>
								<q-menu>
									<q-list class="w-100">
										<q-item clickable v-close-popup @click="RoleWMSSStore.delete(base._id)">
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
						<q-chip square text-color="white" color="primary" icon="manage_accounts">管理员</q-chip>
					</q-item-section>
				</q-item>
			</q-list>
		</q-card>

		<q-btn class="q-ml-md" push square color="negative" @click="openRoleWMSS()">加入团队</q-btn>
	</div>

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
import type { RoleWMSS } from "qqlx-core/schema/wmss/role";

import { useUserStore } from "@/stores/user";
import { useCorpStore } from "@/stores/corp";
import { useRoleWMSSStore } from "@/stores/role";

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

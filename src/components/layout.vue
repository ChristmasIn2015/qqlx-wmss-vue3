<template>
	<q-layout container view="lHh Lpr lff">
		<q-drawer side="left" :width="180" show-if-above class="select-none hide-scrollbar bg-blue-grey-1">
			<div class="q-pt-sm q-pl-md text-weight-bold text-h5" :class="`text-${route.meta?.color}`">开单办公室</div>

			<!-- 导航 -->
			<!-- 导航 -->
			<q-list v-for="(container, index) in routes">
				<div class="text-grey-13 q-px-md q-pt-md q-pb-sm">{{ container.name }}</div>
				<router-link
					v-for="route in container.children?.filter((e) => e.meta?.show)"
					:to="`/wmss/${container.path}/${route.path}`"
					v-slot="{ isActive }"
				>
					<q-item clickable :active="isActive" class="text-grey" :class.text-primary="isActive">
						<q-item-section side class="q-pr-sm">
							<q-icon :name="(route.meta?.icon as string)" :class="isActive ? `text-${route.meta?.color}` : 'text-grey'"> </q-icon>
						</q-item-section>
						<q-item-section class="text-weight-bold text-body1" :class="isActive ? `text-${route.meta?.color}` : 'text-grey'">
							<span>
								{{ route.name }}
								<span
									v-if="skuNotConfirmedAll > 0 && route.path === 'sku-list'"
									class="bg-negative text-white q-px-xs q-ml-sm text-body2"
									style="border-radius: 3px"
								>
									{{ skuNotConfirmedAll }}
								</span>
							</span>
						</q-item-section>
					</q-item>
				</router-link>
			</q-list>

			<!-- 个人中心 -->
			<!-- 个人中心 -->
			<div style="height: 200px"></div>
			<q-list class="absolute-bottom bg-white">
				<q-item clickable @click="userDialog = true" class="q-pr-xs">
					<q-item-section avatar>
						<q-avatar rounded>
							<img :src="UserStore.userEditor?.avator || UserStore.wxAvatorDefault" />
						</q-avatar>
					</q-item-section>
					<q-item-section>
						<q-item-label class="text-weight-bold ellipsis">{{ UserStore.userEditor?.nickname }}</q-item-label>
						<q-item-label caption class="ellipsis">{{ scheduleString }}</q-item-label>
					</q-item-section>
					<q-item-section side style="padding-left: 4px">
						<q-icon name="unfold_more" />
					</q-item-section>
				</q-item>
			</q-list>
			<q-dialog v-model="userDialog" persistent>
				<q-card class="w-400">
					<q-toolbar>
						<q-toolbar-title>个人信息</q-toolbar-title>

						<q-btn flat dense icon="close" v-close-popup />
					</q-toolbar>

					<q-separator />

					<q-card-section>
						<q-input filled label="用户昵称" class="q-mb-sm" v-model="UserStore.userEditor.nickname">
							<template v-slot:before>
								<q-icon name="person" />
							</template>
						</q-input>

						<q-input filled disable label="创建日期" class="q-mb-sm" v-model="UserStore.userEditor.timeCreateString">
							<template v-slot:before>
								<q-icon name="event" />
							</template>
						</q-input>

						<q-input filled readonly label="当前公司剩余时长" class="q-mb-sm" v-model="scheduleString">
							<template v-slot:before>
								<q-icon name="" />
							</template>
						</q-input>
						<span v-close-popup class="q-ml-lg q-pl-md cursor-pointer text-negative" @click="router.push('/wmss/system/pay')">点击充值</span>
					</q-card-section>

					<q-card-actions>
						<q-btn color="negative" flat v-close-popup @click="router.push('/wmss/login')">
							<q-icon name="logout"></q-icon>
							<span class="q-ml-xs">退出</span>
						</q-btn>
						<q-space></q-space>
						<q-btn color="primary" v-close-popup @click="UserStore.patch()"> 应用 </q-btn>
					</q-card-actions>
				</q-card>
			</q-dialog>
		</q-drawer>

		<q-page-container>
			<q-page class="bg-blue-grey-1">
				<div class="app-background bg-dark">
					<q-img
						style="width: 200px; float: right; top: 20px; right: 20px"
						class="cursor-pointer select-none"
						src="@/assets/index.png"
						fit="cover"
						@click="openWebTab()"
					></q-img>
				</div>
				<div class="q-px-lg q-py-md" style="margin-top: -210px">
					<router-view />
				</div>
			</q-page>
		</q-page-container>
	</q-layout>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";

import { getTimeGap } from "@/utils";
import { useNotifyStore } from "@/stores/notify";
import { useUserStore } from "@/stores/user";
import { useCorpStore } from "@/stores/corp";
import { useWarehouseStore } from "@/stores/warehouse";
import { useAnalysisStore } from "@/stores/analysis";

const route = useRoute();
const router = useRouter();
const routes = router.options.routes[0].children;

const NotifyStore = useNotifyStore();
const UserStore = useUserStore();
const CorpStore = useCorpStore();
const WarehouseStore = useWarehouseStore();
const AnalysisStore = useAnalysisStore();

const userDialog = ref(false);
const openWebTab = () => window.open("https://qqlx.tech");

// vue
const skuNotConfirmedAll = computed({
	get() {
		let count = 0;
		AnalysisStore.skuNotConfirmed.map((e) => (count += e.count));
		return count;
	},
	set() {},
});
const scheduleString = computed({
	get() {
		const now = Date.now();
		const last = AnalysisStore.lastActiveScheduleCardOrder;
		const deadline = last ? last.timeCreate + (last.joinCard?.schedule || 0) : 0;
		return now > deadline ? "已过期" : "剩余 " + getTimeGap(deadline, now);
	},
	set() {},
});
onMounted(async () => {
	try {
		await UserStore.setNowUser();
		await CorpStore.get();
		CorpStore.pick(CorpStore.corpList.find((e) => e.isDisabled === false));
		await WarehouseStore.get();
		WarehouseStore.pick(WarehouseStore.WarehouseList.find((e) => e.isDisabled === false));
	} catch (error) {
		NotifyStore.fail((error as Error).message);
	}
});
</script>

<style scoped lang="scss"></style>

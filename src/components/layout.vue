<template>
	<q-layout container view="lHh Lpr lff">
		<q-drawer :width="180" show-if-above>
			<div class="q-py-sm q-pl-md text-weight-bold text-h5 text-primary">开单办公室</div>

			<q-list v-for="(container, index) in routes">
				<div class="text-grey-13 q-px-md q-pt-sm">{{ container.name }}</div>
				<router-link
					v-for="route in container.children?.filter((e) => e.meta?.show)"
					:to="`/wmss/${container.path}/${route.path}`"
					v-slot="{ isActive }"
				>
					<q-item clickable :active="isActive" class="text-grey" :class.text-primary="isActive" active-class="bg-grey-11">
						<q-item-section side class="q-pr-sm">
							<q-avatar
								:color="isActive ? (route.meta?.color as string) || 'primary' : ''"
								:text-color="isActive ? 'white' : ''"
								size="28px"
								font-size="20px"
								rounded
								:icon="(route.meta?.icon as string)"
							/>
						</q-item-section>
						<q-item-section class="text-weight-bold text-body1" :class="'text-'+(isActive ? (route.meta?.color as string) || 'primary' : '')">
							{{ route.name }}
						</q-item-section>
					</q-item>
				</router-link>
			</q-list>

			<q-list class="absolute-bottom bg-transparent">
				<q-item clickable @click="userDialog = true" class="q-pr-xs">
					<q-item-section avatar>
						<q-avatar rounded>
							<img :src="UserStore.userEditor?.avator || UserStore.wxAvatorDefault" />
						</q-avatar>
					</q-item-section>
					<q-item-section>
						<q-item-label class="text-weight-bold ellipsis">{{ UserStore.userEditor?.nickname }}</q-item-label>
						<q-item-label caption>欢迎使用</q-item-label>
					</q-item-section>
					<q-item-section side>
						<q-icon name="unfold_more" />
					</q-item-section>
				</q-item>
			</q-list>
		</q-drawer>

		<q-page-container>
			<q-page>
				<div class="app-background color-back-main" :class="{ 'color-back-warehouse': route.path.includes('warehouse') }"></div>
				<div class="q-px-lg q-py-md" style="margin-top: -220px">
					<router-view />
				</div>
			</q-page>
		</q-page-container>
	</q-layout>

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
			</q-card-section>

			<q-card-actions>
				<q-btn color="negative" flat v-close-popup @click="router.push('/wmss/login')">退出登录</q-btn>
				<q-space></q-space>
				<q-btn
					color="primary"
					push
					v-close-popup
					@click="
						async () => {
							await UserStore.patch();
						}
					"
				>
					应用
				</q-btn>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";

import { useNotifyStore } from "@/stores/notify";
import { useUserStore } from "@/stores/user";
import { useCorpStore } from "@/stores/corp";
import { useWarehouseStore } from "@/stores/warehouse";

// import { useSubjectContactStore } from "@/store/subjectContact";
// import { useSkuStore } from "@/store/sku";

// import contactList from "@/components/contact-list.vue";
// import skuList from "@/components/sku-list.vue";

const route = useRoute();
const router = useRouter();
const routes = router.options.routes[0].children;

const NotifyStore = useNotifyStore();
const UserStore = useUserStore();
const CorpStore = useCorpStore();
const WarehouseStore = useWarehouseStore();
// // const SubjectContactStore = useSubjectContactStore();
// // const SkuStore = useSkuStore();

const userDialog = ref(false);
onMounted(async () => {
	try {
		await UserStore.setNowUser();
		await CorpStore.get();
		CorpStore.pick(CorpStore.corpList.filter((e) => e.isDisabled === false)[0]);
	} catch (error) {
		NotifyStore.fail((error as Error).message);
	}
});
</script>

<style scoped lang="scss">
.app-background {
	height: 255px;
	border-top-left-radius: 0;
	border-top-right-radius: 0;
	border-bottom-left-radius: 16px;
	border-bottom-right-radius: 16px;
}
</style>

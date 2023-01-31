<template>
	<v-app color="grey-lighten-5">
		<v-app-bar density="compact">
			<v-app-bar-title>
				<span class="font-weight-bold text-primary"> 开单办公室 {{ UserStore.wxLoginModal }}</span>
			</v-app-bar-title>

			<v-menu>
				<template v-slot:activator="{ props }">
					<v-list-item v-bind="props" class="pl-2">
						<template v-slot:prepend>
							<v-avatar :image="UserStore.userEditor?.avator || UserStore.wxAvatorDefault" class="rounded" size="36"></v-avatar>
						</template>
						<v-list-item-title class="font-weight-bold">{{ UserStore.userEditor.nickname }}</v-list-item-title>
						<v-list-item-subtitle>{{ UserStore.userEditor.contact || "尚无联系方式" }}</v-list-item-subtitle>
						<template v-slot:append>
							<v-icon class="ml-2" icon="mdi-menu-down" color="primary"></v-icon>
						</template>
					</v-list-item>
					<!-- <v-btn  variant="elevated" class="rounded-0">
						<span class="ml-1"></span>
						
					</v-btn> -->
				</template>

				<v-list density="compact">
					<v-dialog width="500">
						<template v-slot:activator="{ props }">
							<v-list-item v-bind="props">
								<v-list-item-title> 个人信息 </v-list-item-title>
							</v-list-item>
						</template>
						<v-card>
							<v-card-title>个人信息</v-card-title>
							<v-card-text>
								<v-text-field label="请输入昵称（建议为姓名）" color="primary" v-model="UserStore.userEditor.nickname"></v-text-field>
								<v-text-field label="联系方式" color="primary" v-model="UserStore.userEditor.contact"></v-text-field>
							</v-card-text>
							<v-card-actions>
								<v-spacer></v-spacer>
								<v-btn color="primary" variant="elevated" @click="UserStore.patch()">应用</v-btn>
							</v-card-actions>
						</v-card>
					</v-dialog>
					<v-list-item class="text-red">
						<v-list-item-title> 退出 </v-list-item-title>
					</v-list-item>
				</v-list>
			</v-menu>
		</v-app-bar>

		<v-navigation-drawer width="170" color="grey-lighten-5">
			<div v-for="container in routes" class="pb-3 pt-2">
				<v-card-subtitle class="text-grey">{{ container.name }}</v-card-subtitle>

				<router-link v-for="route in container.children" :to="container.path + '/' + route.path" v-slot="{ isActive }">
					<v-card
						class="ml-2 mt-2"
						@click="() => router.push(route.path)"
						:color="isActive ? 'primary' : 'grey-lighten-5'"
						:class="isActive ? '' : 'elevation-0'"
					>
						<v-card-title class="font-weight-bold text-subtitle-1 px-2 py-1" :class="isActive ? '' : 'text-grey'">
							<v-icon :icon="(route.meta?.icon as string)" class="mr-2 mt-n1"></v-icon>
							<span>{{ route.name }}</span>
						</v-card-title>
					</v-card>
				</router-link>
			</div>
		</v-navigation-drawer>

		<v-main>
			<div class="pa-4">
				<router-view></router-view>
			</div>
		</v-main>

		<!-- 登录 -->
		<v-dialog persistent v-model="UserStore.wxLoginModal" width="500">
			<v-card>
				<div class="mx-auto mt-6" id="wx-login"></div>
			</v-card>
		</v-dialog>

		<!-- 全局选择客户 -->
		<v-dialog persistent v-model="SubjectContactStore.dialog" width="1200">
			<v-toolbar>
				<v-toolbar-title>通讯录</v-toolbar-title>
				<v-spacer></v-spacer>
				<v-btn icon="mdi-close" @click="SubjectContactStore.closeDialog()"></v-btn>
			</v-toolbar>
			<v-card class="rounded-0">
				<v-card-text>
					<contact-list />
				</v-card-text>
			</v-card>
		</v-dialog>

		<!-- 全局展示SKU -->
		<v-dialog persistent v-model="SkuStore.dialogList" fullscreen transition="dialog-bottom-transition" scrollable>
			<v-toolbar>
				<v-toolbar-title>商品明细</v-toolbar-title>
				<v-spacer></v-spacer>
				<v-btn icon="mdi-close" @click="SkuStore.dialogList = false"></v-btn>
			</v-toolbar>
			<sku-list />
		</v-dialog>

		<!-- 全局提示 -->
		<snackbar></snackbar>
	</v-app>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

import { useSnackbarStore } from "@/store/snackbar";
import { useUserStore } from "@/store/user";
import { useSubjectStore } from "@/store/subject";
import { useSubjectContactStore } from "@/store/subjectContact";
import { useSkuStore } from "@/store/sku";

import contactList from "@/components/contact-list.vue";
import skuList from "@/components/sku-list.vue";

const route = useRoute();
const router = useRouter();
const routes = router.options.routes[0].children;

const SnackbarStore = useSnackbarStore();
const UserStore = useUserStore();
const SubjectStore = useSubjectStore();
const SubjectContactStore = useSubjectContactStore();
const SkuStore = useSkuStore();

onMounted(async () => {
	try {
		const { code, state } = route.query;
		if (state === "LOGIN" && code) {
			await UserStore.post(code as string);
			return;
		}
		await UserStore.setUserInfo();
		await SubjectStore.get();
		SubjectStore.pick(SubjectStore.subjectList[0]);
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
});
</script>

<style scope>
.v-main {
	background-color: #fafafa;
}
.v-navigation-drawer,
.v-navigation-drawer--left {
	border-right-width: 0 !important;
}
</style>

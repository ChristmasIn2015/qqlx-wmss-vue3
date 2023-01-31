<template>
	<v-card-text class="d-flex flex-wrap align-stretch pa-0">
		<v-card v-for="sub in SubjectStore.subjectList.filter((e) => e.type === ENUM_SUBJECT_TYPE.COMPANY)" class="mr-2 mb-2" min-width="355" max-width="355">
			<v-toolbar :color="SubjectStore.subjectPicked._id === sub._id ? 'primary' : ''">
				<v-toolbar-title> {{ sub.name }} </v-toolbar-title>
				<v-spacer></v-spacer>

				<v-menu>
					<template v-slot:activator="{ props }">
						<v-btn v-bind="props" icon="mdi-dots-horizontal"> </v-btn>
					</template>
					<v-list density="compact">
						<v-list-item @click="SubjectStore.pick(sub)">
							<v-list-item-title> 切换 </v-list-item-title>
						</v-list-item>
						<v-list-item
							@click="
								() => {
									SubjectStore.dialogPatch = true;
									SubjectStore.edit(sub);
								}
							"
						>
							<v-list-item-title> 修改 </v-list-item-title>
						</v-list-item>
						<v-list-item
							@click="
								() => {
									SubjectStore.edit();
									SubjectStore.subjectEditor.type = ENUM_SUBJECT_TYPE.SUB_COMPANY;
									SubjectStore.dialogPost2 = true;
								}
							"
						>
							<v-list-item-title> 添加抬头 </v-list-item-title>
						</v-list-item>
						<v-list-item
							@click="
								() => {
									SubjectStore.dialogPost = true;
									SubjectStore.edit();
								}
							"
						>
							<v-list-item-title> 添加新公司 </v-list-item-title>
						</v-list-item>
					</v-list>
				</v-menu>
			</v-toolbar>
			<v-card-text class="text-grey">
				<div>{{ sub.name }}</div>
				<div>{{ sub.address }}</div>
			</v-card-text>

			<v-divider class="mt-8"></v-divider>
			<v-card-title>可用抬头</v-card-title>
			<v-card-text v-if="SubjectStore.subjectPicked._id === sub._id">
				<v-card v-for="sub in SubjectStore.subjectList.filter((s) => s.type !== ENUM_SUBJECT_TYPE.COMPANY)" class="mt-2">
					<v-card-actions class="py-0 pl-4">
						<span>{{ sub.name }}</span>
						<v-spacer></v-spacer>

						<v-menu>
							<template v-slot:activator="{ props }">
								<v-btn v-bind="props" icon="mdi-dots-horizontal"></v-btn>
							</template>
							<v-list density="compact">
								<v-list-item
									@click="
										() => {
											SubjectStore.edit(sub);
											SubjectStore.dialogPatch2 = true;
										}
									"
								>
									<v-list-item-title> 修改 </v-list-item-title>
								</v-list-item>
								<v-list-item @click="SubjectStore.delete(sub)">
									<v-list-item-title> 删除 </v-list-item-title>
								</v-list-item>
							</v-list>
						</v-menu>
					</v-card-actions>
				</v-card>
			</v-card-text>
		</v-card>
	</v-card-text>

	<v-card-text class="px-0">
		<v-tabs class="ml-n1" v-model="SubjectRoleStore.subjectRoleEnumIndexNow">
			<v-tab v-for="ENUM in SubjectRoleStore.subjectRoleEnum" :value="ENUM.value">{{ ENUM.text }}</v-tab>
		</v-tabs>

		<v-window v-model="SubjectRoleStore.subjectRoleEnumIndexNow" class="ml-n2">
			<v-window-item :value="ENUM_SUBJECT_ROLE.MANAGER" class="px-1 pt-4">
				<v-sheet width="450" class="pb-2">
					<v-card
						max-width="450"
						class="mb-2"
						v-for="role in SubjectRoleStore.subjectRoleList.filter((e) => [ENUM_SUBJECT_ROLE.MANAGER, ENUM_SUBJECT_ROLE.NONE].includes(e.role))"
					>
						<v-list-item :title="role?.joinUser.nickname" :subtitle="role?.joinUser.contact">
							<template v-slot:prepend>
								<v-avatar :image="role?.joinUser.avator || UserStore.wxAvatorDefault"></v-avatar>
							</template>

							<template v-slot:append>
								<v-chip v-if="role.role === ENUM_SUBJECT_ROLE.MANAGER" color="red-lighten-1">管理员</v-chip>
							</template>
						</v-list-item>
					</v-card>
				</v-sheet>
				<v-btn color="primary" variant="elevated">加入我们</v-btn>
			</v-window-item>

			<v-window-item :value="ENUM_SUBJECT_ROLE.WM" class="px-1 pt-4">
				<v-sheet width="450" class="pb-2">
					<v-btn color="primary" variant="elevated">添加</v-btn>
				</v-sheet>
			</v-window-item>

			<v-window-item :value="ENUM_SUBJECT_ROLE.PURCHASE" class="px-1 pt-4">
				<v-sheet width="450" class="pb-2">
					<v-btn color="primary" variant="elevated">添加</v-btn>
				</v-sheet>
			</v-window-item>

			<v-window-item :value="ENUM_SUBJECT_ROLE.SALES" class="px-1 pt-4">
				<v-sheet width="450" class="pb-2">
					<v-btn color="primary" variant="elevated">添加</v-btn>
				</v-sheet>
			</v-window-item>

			<v-window-item :value="ENUM_SUBJECT_ROLE.FINANCE" class="px-1 pt-4">
				<v-sheet width="450" class="pb-2">
					<v-btn color="primary" variant="elevated">添加</v-btn>
				</v-sheet>
			</v-window-item>
		</v-window>
	</v-card-text>

	<!-- 添加新公司 -->
	<v-dialog width="500" v-model="SubjectStore.dialogPost">
		<v-card>
			<v-card-title>添加新公司</v-card-title>
			<v-card-text>
				<v-text-field label="公司名称" v-model="SubjectStore.subjectEditor.name"></v-text-field>
				<v-text-field label="公司地址" v-model="SubjectStore.subjectEditor.address"></v-text-field>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn @click="SubjectStore.dialogPost = false">取消</v-btn>
				<v-btn color="primary" variant="elevated" @click="SubjectStore.post()">添加</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<!-- 修改公司 -->
	<v-dialog width="500" v-model="SubjectStore.dialogPatch">
		<v-card>
			<v-card-title>修改公司</v-card-title>
			<v-card-text>
				<v-text-field label="公司名称" v-model="SubjectStore.subjectEditor.name"></v-text-field>
				<v-text-field label="公司地址" v-model="SubjectStore.subjectEditor.address"></v-text-field>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn @click="SubjectStore.dialogPatch = false">取消</v-btn>
				<v-btn color="primary" variant="elevated" @click="SubjectStore.patch()">保存</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<!-- 添加新抬头 -->
	<v-dialog width="500" v-model="SubjectStore.dialogPost2">
		<v-card>
			<v-card-title>添加新抬头</v-card-title>
			<v-card-text>
				<v-text-field label="公司名称" v-model="SubjectStore.subjectEditor.name"></v-text-field>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn @click="SubjectStore.dialogPost2 = false">取消</v-btn>
				<v-btn color="primary" variant="elevated" @click="SubjectStore.post()">添加</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<!-- 修改抬头 -->
	<v-dialog width="500" v-model="SubjectStore.dialogPatch2">
		<v-card>
			<v-card-title>修改抬头</v-card-title>
			<v-card-text>
				<v-text-field label="公司名称" v-model="SubjectStore.subjectEditor.name"></v-text-field>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn @click="SubjectStore.dialogPatch2 = false">取消</v-btn>
				<v-btn color="primary" variant="elevated" @click="SubjectStore.patch()">修改</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useSnackbarStore } from "@/store/snackbar";

import { ENUM_SUBJECT_TYPE, ENUM_SUBJECT_ROLE } from "qqlx-core";
import { useUserStore } from "@/store/user";
import { useSubjectStore } from "@/store/subject";
import { useSubjectRoleStore } from "@/store/subjectRole";

const SnackbarStore = useSnackbarStore();
const UserStore = useUserStore();
const SubjectStore = useSubjectStore();
const SubjectRoleStore = useSubjectRoleStore();
</script>

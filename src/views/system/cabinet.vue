<template>
	<v-row>
		<v-col cols="4">
			<v-card-title class="font-weight-bold pa-0 text-h4">货架</v-card-title>
		</v-col>
	</v-row>

	<v-card-text class="d-flex flex-wrap align-stretch ml-n1 px-0">
		<v-card v-for="cabinet in CabinetStore.cabinetList" class="mr-2 mb-2" min-width="255" max-width="290">
			<v-toolbar>
				<v-toolbar-title>{{ cabinet.name }}</v-toolbar-title>

				<v-spacer></v-spacer>

				<v-menu>
					<template v-slot:activator="{ props }">
						<v-btn v-bind="props" icon="mdi-dots-horizontal"> </v-btn>
					</template>
					<v-list density="compact">
						<v-list-item
							@click="
								() => {
									CabinetStore.dialogPost = true;
									CabinetStore.edit();
								}
							"
						>
							<v-list-item-title> 添加新货架 </v-list-item-title>
						</v-list-item>
						<v-list-item
							@click="
								() => {
									CabinetStore.dialogPatch = true;
									CabinetStore.edit(cabinet);
								}
							"
						>
							<v-list-item-title> 修改 </v-list-item-title>
						</v-list-item>
						<v-list-item @click="CabinetStore.delete(cabinet._id)">
							<v-list-item-title> 删除 </v-list-item-title>
						</v-list-item>
					</v-list>
				</v-menu>
			</v-toolbar>
			<v-card-text>
				<div class="d-flex">
					<span class="font-weight-bold">单位</span>
					<span class="ml-auto text-grey">{{ cabinet.unit || "无" }}</span>
				</div>
				<div class="mt-4" v-if="CabinetStore.getCountWayChinese(cabinet.countWay)">
					<div class="d-flex">
						<span class="font-weight-bold">计量方法</span>
						<span class="ml-auto text-primary">{{ CabinetStore.getCountWayChinese(cabinet.countWay)?.title }}</span>
					</div>
					<div class="text-wrap text-grey">{{ CabinetStore.getCountWayChinese(cabinet.countWay)?.tip }}</div>
				</div>
				<div class="mt-4" v-if="CabinetStore.getPoundsWayChinese(cabinet.poundsWay)">
					<div class="d-flex">
						<span class="font-weight-bold">称重公式</span>
						<span class="ml-auto text-primary">{{ CabinetStore.getPoundsWayChinese(cabinet.poundsWay)?.title }}</span>
					</div>
					<div class="text-wrap text-grey">{{ CabinetStore.getPoundsWayChinese(cabinet.poundsWay)?.tip }}</div>
				</div>
			</v-card-text>
		</v-card>
	</v-card-text>

	<v-row>
		<v-col cols="4">
			<v-card-title class="font-weight-bold pa-0 text-h4">推荐配置</v-card-title>
		</v-col>
	</v-row>

	<!-- 添加新货架 -->
	<v-dialog width="500" v-model="CabinetStore.dialogPost">
		<v-card>
			<v-card-title>添加新货架</v-card-title>
			<v-card-text>
				<v-text-field label="货架名称" v-model="CabinetStore.cabinetEditor.name"></v-text-field>
				<v-text-field label="货架单位" v-model="CabinetStore.cabinetEditor.unit"></v-text-field>
				<v-autocomplete
					v-model="CabinetStore.cabinetEditor.countWay"
					:items="CabinetStore.ENUM_COUNT_WAY_MAP"
					label="计量方法（注意：创建后无法修改）"
				></v-autocomplete>
				<v-autocomplete v-model="CabinetStore.cabinetEditor.poundsWay" :items="CabinetStore.ENUM_POUNDS_WAY_MAP" label="称重方法"></v-autocomplete>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn @click="CabinetStore.dialogPost = false">取消</v-btn>
				<v-btn color="primary" variant="elevated" @click="CabinetStore.post()">添加</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
	<!-- 修改货架 -->
	<v-dialog width="500" v-model="CabinetStore.dialogPatch">
		<v-card>
			<v-card-title>修改货架</v-card-title>
			<v-card-text>
				<v-text-field label="货架名称" v-model="CabinetStore.cabinetEditor.name"></v-text-field>
				<v-text-field label="货架单位" v-model="CabinetStore.cabinetEditor.unit"></v-text-field>
				<v-autocomplete
					disabled
					v-model="CabinetStore.cabinetEditor.countWay"
					:items="CabinetStore.ENUM_COUNT_WAY_MAP"
					label="计量方法（无法修改）"
				></v-autocomplete>
				<v-autocomplete v-model="CabinetStore.cabinetEditor.poundsWay" :items="CabinetStore.ENUM_POUNDS_WAY_MAP" label="称重方法"></v-autocomplete>
			</v-card-text>
			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn @click="CabinetStore.dialogPatch = false">取消</v-btn>
				<v-btn color="primary" variant="elevated" @click="CabinetStore.patch()">添加</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useSnackbarStore } from "@/store/snackbar";

import { ENUM_SUBJECT_TYPE, ENUM_SUBJECT_ROLE } from "qqlx-core";
import { useCabinetStore } from "@/store/cabinet";

const SnackbarStore = useSnackbarStore();
const CabinetStore = useCabinetStore();

onMounted(async () => {
	try {
		await CabinetStore.get();
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
});
</script>

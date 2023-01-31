<template>
	<v-card>
		<v-table fixed-header height="450" density="compact" @scroll.capture="search()">
			<thead>
				<tr>
					<th width="50">
						<v-menu>
							<template v-slot:activator="{ props }">
								<v-btn v-bind="props" class="my-2 ml-n2" :disabled="CabinetUnitStore.cabinetUnitListExcel.length > 0">
									{{ CabinetStore.cabinetPicked?.name }}
									<v-icon icon="mdi-menu-down"></v-icon>
								</v-btn>
							</template>
							<v-list>
								<v-list-item v-for="cabinet in CabinetStore.cabinetList" @click="CabinetStore.pick(cabinet)">
									{{ cabinet.name }}
								</v-list-item>
							</v-list>
						</v-menu>
					</th>
					<th width="200">
						<search-input placeholder="搜索品名" v-model="CabinetUnitStore.cabinetUnitSearch.name" @blur="CabinetUnitStore.get(1)"></search-input>
					</th>
					<th width="200">
						<search-input placeholder="搜索规格" v-model="CabinetUnitStore.cabinetUnitSearch.norm" @blur="CabinetUnitStore.get(1)"></search-input>
					</th>
					<th width="200" class="text-right">库存/{{ CabinetStore.cabinetPicked.unit }}</th>
					<th>
						<v-menu>
							<template v-slot:activator="{ props }">
								<v-btn v-bind="props" variant="text" class="mr-2">
									<v-icon icon="mdi-dots-horizontal" size="26"></v-icon>
								</v-btn>
							</template>
							<v-list>
								<v-list-item
									@click="
										() => {
											CabinetUnitStore.cabinetUnitListExcel.push(CabinetUnitStore.getSchema());
										}
									"
								>
									添加
								</v-list-item>
								<v-list-item @click="router.push('/view/system/cabinet')"> 设置 </v-list-item>
								<v-list-item> 导出当前库存 </v-list-item>
							</v-list>
						</v-menu>
						<v-btn v-show="CabinetUnitStore.cabinetUnitListExcel.length > 0" color="primary" class="mr-2" @click="CabinetUnitStore.post()">
							保存
						</v-btn>
					</th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="(item, index) in CabinetUnitStore.cabinetUnitListExcel">
					<td>
						<v-btn color="red" variant="text" icon="mdi-close" @click="CabinetUnitStore.cabinetUnitListExcel.splice(index, 1)"></v-btn>
					</td>
					<td>
						<table-input placeholder="请输入名称" v-model="item.name"></table-input>
					</td>
					<td>
						<table-input placeholder="请输入规格" v-model="item.norm"></table-input>
					</td>
					<td></td>
					<td></td>
				</tr>
			</tbody>
			<tbody v-show="CabinetUnitStore.cabinetUnitListExcel.length === 0">
				<tr v-for="item in CabinetUnitStore.cabinetUnitList">
					<td>
						{{ CabinetStore.cabinetPicked?.name }}
					</td>
					<td>
						<span>{{ item.name }}</span>
					</td>
					<td>
						<span>{{ item.norm }}</span>
					</td>
					<td class="text-right" v-if="CabinetStore.cabinetPicked.countWay === ENUM_COUNT_WAY.SPECIFIC_IDENTIFICATION">
						<v-btn variant="text" size="small" class="text-subtitle-1" t>
							<span>{{ item.pounds }}</span>
						</v-btn>
					</td>
					<td class="text-right" v-else>
						<v-btn variant="text" size="small" class="text-subtitle-1" t>
							<span>{{ item.count }}</span>
						</v-btn>
					</td>
					<td>
						<v-menu>
							<template v-slot:activator="{ props }">
								<v-btn v-bind="props" variant="text" class="ml-1 text-subtitle-1" size="small">
									<v-icon icon="mdi-dots-horizontal"></v-icon>
								</v-btn>
							</template>
							<v-list>
								<v-list-item @click="CabinetUnitStore.delete(item._id)"> 删除 </v-list-item>
							</v-list>
						</v-menu>
						<v-btn class="mr-2 text-subtitle-1" size="small" color="primary" variant="text" @click="SkuStore.push(item)">开单</v-btn>
					</td>
				</tr>
			</tbody>
		</v-table>

		<v-divider></v-divider>
		<v-progress-linear indeterminate :color="CabinetUnitStore.loadding ? 'primary' : 'white'"></v-progress-linear>

		<v-table>
			<tbody>
				<tr>
					<td></td>
					<td></td>
					<td></td>
					<td class="text-right">
						<span v-show="CabinetUnitStore.cabinetUnitListExcel.length === 0">
							已加载 {{ CabinetUnitStore.cabinetUnitList.length }} / {{ CabinetUnitStore.total }} 项
						</span>
						<span v-show="CabinetUnitStore.cabinetUnitListExcel.length > 0"> 正在导入 {{ CabinetUnitStore.cabinetUnitListExcel.length }} 项 </span>
					</td>
				</tr>
			</tbody>
		</v-table>
	</v-card>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ENUM_SUBJECT_TYPE, ENUM_SUBJECT_ROLE, ENUM_COUNT_WAY } from "qqlx-core";

import { debounce } from "lodash";

import { useSnackbarStore } from "@/store/snackbar";
import { useCabinetStore } from "@/store/cabinet";
import { useCabinetUnitStore } from "@/store/cabinetUnit";
import { useSkuStore } from "@/store/sku";

const router = useRouter();
const SnackbarStore = useSnackbarStore();
const CabinetStore = useCabinetStore();
const CabinetUnitStore = useCabinetUnitStore();
const SkuStore = useSkuStore();

const debounceGet = debounce(() => CabinetUnitStore.get(), 500);
const search = () => debounceGet();

onMounted(async () => {
	try {
		await CabinetStore.get();
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
});
</script>

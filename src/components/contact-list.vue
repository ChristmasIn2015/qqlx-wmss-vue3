<template>
	<v-row>
		<v-col cols="4"> </v-col>
		<v-col class="d-flex">
			<v-spacer></v-spacer>
			<v-btn
				class="ml-2"
				v-if="SubjectContactStore.subjectContactListExcel.length > 0"
				@click="
					() => {
						SubjectContactStore.subjectContactListExcel = [];
						SubjectContactStore.get();
					}
				"
			>
				取消
			</v-btn>
			<v-btn class="ml-2" color="red" v-if="SubjectContactStore.subjectContactListExcel.length > 0" @click="SubjectContactStore.post()"> 保存 </v-btn>

			<v-menu v-if="read">
				<template v-slot:activator="{ props }">
					<v-btn class="ml-2" v-bind="props">导入</v-btn>
				</template>
				<v-list>
					<v-list-item @click="download">
						<v-icon icon="mdi-download"></v-icon>
						下载模板
					</v-list-item>
					<v-list-item @click="uploadClick">
						<v-file-input v-show="false" id="file-input" @change="uploadContact($event)"> </v-file-input>
						<v-icon icon="mdi-import"></v-icon>
						模板导入
					</v-list-item>
				</v-list>
			</v-menu>
			<v-btn
				class="ml-2"
				color="primary"
				@click="
					() => {
						SubjectContactStore.subjectContactListExcel.push(SubjectContactStore.getSchema());
					}
				"
			>
				添加
			</v-btn>
		</v-col>
	</v-row>
	<v-card class="mt-3 rounded-0">
		<v-table fixed-header height="650" density="compact" v-show="SubjectContactStore.subjectContactListExcel.length > 0">
			<thead>
				<tr>
					<th width="50"></th>
					<th width="400" class="pl-6">名称</th>
					<th width="255" class="pl-6">联系方式</th>
					<th width="150">备注</th>
					<th class="text-right"></th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(item, index) in SubjectContactStore.subjectContactListExcel">
					<td class="pr-0">
						<v-btn
							icon="mdi-close"
							variant="text"
							class="mr-n1"
							color="red"
							size="32"
							@click="SubjectContactStore.subjectContactListExcel.splice(index, 1)"
						></v-btn>
					</td>
					<td>
						<table-input placeholder="请输入名称" v-model="item.name"></table-input>
					</td>
					<td>
						<table-input placeholder="请输入联系方式" v-model="item.contact"></table-input>
					</td>
					<td>
						<table-input placeholder="请输入备注" v-model="item.remark"></table-input>
					</td>
					<td class="text-right"></td>
				</tr>
			</tbody>
		</v-table>

		<v-table fixed-header height="650" density="compact" @scroll.capture="search()" v-show="SubjectContactStore.subjectContactListExcel.length === 0">
			<thead>
				<tr>
					<th width="50" class="pr-0 text-right">
						<v-btn icon="mdi-magnify" variant="text" size="32" disabled></v-btn>
					</th>
					<th width="400">
						<search-input
							placeholder="搜索名称"
							v-model="SubjectContactStore.subjectContactSearch.name"
							@blur="SubjectContactStore.get(1)"
						></search-input>
					</th>
					<th width="255">
						<search-input
							placeholder="搜索联系方式"
							v-model="SubjectContactStore.subjectContactSearch.contact"
							@blur="SubjectContactStore.get(1)"
						></search-input>
					</th>
					<th width="150">
						<search-input
							placeholder="搜索备注"
							v-model="SubjectContactStore.subjectContactSearch.remark"
							@blur="SubjectContactStore.get(1)"
						></search-input>
					</th>
					<th>
						<v-menu>
							<template v-slot:activator="{ props }">
								<v-btn v-bind="props" height="40">
									{{ SubjectContactStore.subjectContactSearch.isDisabled ? "最近删除" : "全部" }}
									<v-icon icon="mdi-menu-down"></v-icon>
								</v-btn>
							</template>
							<v-list>
								<v-list-item
									@click="
										() => {
											SubjectContactStore.subjectContactSearch.isDisabled = false;
											SubjectContactStore.get(1);
										}
									"
								>
									全部
								</v-list-item>
								<v-list-item
									@click="
										() => {
											SubjectContactStore.subjectContactSearch.isDisabled = true;
											SubjectContactStore.get(1);
										}
									"
								>
									最近删除
								</v-list-item>
							</v-list>
						</v-menu>
					</th>
				</tr>
			</thead>

			<tbody>
				<tr v-for="item in SubjectContactStore.subjectContactList">
					<td class="pr-0">
						<v-btn
							:disabled="SubjectContactStore.subjectContactEditor._id === item._id"
							icon="mdi-square-edit-outline"
							variant="text"
							size="32"
							@click="SubjectContactStore.pick(item)"
						></v-btn>
					</td>
					<td>
						<table-input
							v-if="SubjectContactStore.subjectContactEditor._id === item._id"
							placeholder="请输入名称"
							v-model="SubjectContactStore.subjectContactEditor.name"
						></table-input>
						<span v-else>{{ item.name }}</span>
					</td>
					<td>
						<table-input
							v-if="SubjectContactStore.subjectContactEditor._id === item._id"
							placeholder="请输入联系方式"
							v-model="SubjectContactStore.subjectContactEditor.contact"
						></table-input>
						<span v-else>{{ item.contact }}</span>
					</td>
					<td>
						<table-input
							v-if="SubjectContactStore.subjectContactEditor._id === item._id"
							placeholder="请输入备注"
							v-model="SubjectContactStore.subjectContactEditor.remark"
						></table-input>
						<span v-else>{{ item.remark }}</span>
					</td>
					<td>
						<span v-if="SubjectContactStore.subjectContactEditor._id === item._id">
							<v-btn class="mr-2" color="primary" @click="SubjectContactStore.patch()">保存</v-btn>
							<v-btn class="mr-2" @click="SubjectContactStore.subjectContactEditor = SubjectContactStore.getSchema()">取消</v-btn>
						</span>
						<span v-else>
							<v-btn v-if="!read" class="mr-2" color="primary" size="small" @click.stop="SubjectContactStore.closeDialog(item)">选择</v-btn>
							<v-menu>
								<template v-slot:activator="{ props }">
									<v-btn v-bind="props" icon="mdi-dots-horizontal" variant="text" size="32" class="mr-2"></v-btn>
								</template>
								<v-list>
									<v-list-item
										@click="
											() => {
												item.isDisabled = !item.isDisabled;
												SubjectContactStore.patch(item);
											}
										"
									>
										{{ item.isDisabled ? "恢复" : "删除" }}
									</v-list-item>
								</v-list>
							</v-menu>
						</span>
					</td>
				</tr>
			</tbody>
		</v-table>

		<v-divider></v-divider>
		<v-progress-linear indeterminate :color="SubjectContactStore.loadding ? 'primary' : 'white'"></v-progress-linear>

		<v-table>
			<tbody>
				<tr>
					<td></td>
					<td></td>
					<td></td>
					<td class="text-right">
						<span v-show="SubjectContactStore.subjectContactListExcel.length === 0">
							已加载 {{ SubjectContactStore.subjectContactList.length }} / {{ SubjectContactStore.total }} 项
							<span v-show="SubjectContactStore.subjectContactList.length >= SubjectContactStore.total">，已经到底了</span>
						</span>
						<span v-show="SubjectContactStore.subjectContactListExcel.length > 0">
							正在导入 {{ SubjectContactStore.subjectContactListExcel.length }} 项
						</span>
					</td>
				</tr>
			</tbody>
		</v-table>
	</v-card>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { ENUM_SUBJECT_TYPE } from "qqlx-core";
import { SubjectContact } from "qqlx-core/brand/entity";

import * as XLSX from "xlsx";
import { debounce } from "lodash";

import { useSnackbarStore } from "@/store/snackbar";
import { useUserStore } from "@/store/user";
import { useSubjectContactStore } from "@/store/subjectContact";
import { download } from "@/store/utils";

const SnackbarStore = useSnackbarStore();
const UserStore = useUserStore();
const SubjectContactStore = useSubjectContactStore();

const debounceGet = debounce(() => SubjectContactStore.get(), 500);
const search = () => debounceGet();

const uploadClick = () => window.document.getElementById("file-input")?.click();
const uploadContact = (event: any) => {
	if (!event) return;
	const reader = new FileReader(); // WebAPI
	reader.onload = async () => {
		try {
			SubjectContactStore.loadding = true;
			const workbook = XLSX.read(reader.result, { type: "binary" });
			const sheet = workbook.Sheets["客户导入"];
			if (!sheet) throw new Error(`找不到表格 [客户导入] !`);
			const rowJsonList: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

			// 1.批量上传客户
			const uploading = [];
			for (let i in rowJsonList) {
				const row = rowJsonList[i];
				const schema = SubjectContactStore.getSchema();
				schema.name = String(row["@客户名称"]);
				schema.contact = String(row["@联系方式"]);
				schema.remark = String(row["@备注"]);
				uploading.push(schema);
			}
			SubjectContactStore.subjectContactListExcel = uploading;
		} catch (error) {
			SnackbarStore.setFail((error as Error).message);
		} finally {
			SubjectContactStore.loadding = false;
		}
	};
	reader.readAsBinaryString(event.target.files[0]);
};

defineProps({ read: Boolean });
onMounted(async () => {
	try {
		await SubjectContactStore.get(1);
	} catch (error) {
		SnackbarStore.setFail((error as Error).message);
	}
});
</script>

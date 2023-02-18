<template>
	<q-table
		class="my-sticky-header-contact"
		dense
		:columns="[
			{ name: 'name', field: 'name', label: '客户名称', align: 'left', style: 'font-size: 16px; width: 300px; max-width: 300px;' },
			{ name: 'address', field: 'address', label: '联系方式', align: 'left', style: 'font-size: 16px; width: 150px;' },
			{ name: 'remark', field: 'remark', label: '备注', align: 'left', style: 'font-size: 16px; width: 150px;' },
			{ name: 'timeCreateString', field: 'timeCreateString', align: 'left', label: '创建时间', style: 'font-size: 16px;' },
		]"
		row-key="_id"
		:rows-per-page-options="[0]"
		:rows="ContactStore.contactList"
		virtual-scroll
		:virtual-scroll-item-size="33"
		:virtual-scroll-sticky-size-start="33"
		@virtual-scroll="loadPage"
	>
		<template v-slot:top="props">
			<div class="col q-mb-md">
				<q-input
					standout
					dense
					clearable
					color="green-6"
					clear-icon="close"
					placeholder="请输入客户名称、联系方式、备注"
					v-model="ContactStore.contactSearch.name"
					:loading="ContactStore.loadding"
					@blur="ContactStore.get(1)"
				>
					<template v-slot:before>
						<q-icon name="search" />
					</template>
				</q-input>
			</div>
			<div class="col text-right q-mb-md">
				<q-btn
					class="q-ml-sm"
					glossy
					label="最近删除"
					:color="ContactStore.contactSearch.isDisabled ? 'green-6' : ''"
					:text-color="ContactStore.contactSearch.isDisabled ? '' : 'black'"
					@click="
						() => {
							ContactStore.contactSearch.isDisabled = !ContactStore.contactSearch.isDisabled;
							ContactStore.get(1);
						}
					"
				/>
				<span v-if="ContactStore.contactListExcel.length > 0">
					<q-btn
						class="q-ml-sm"
						glossy
						:label="`保存 ${ContactStore.contactListExcel.length}项`"
						color="green-6"
						@click="() => ContactStore.post()"
					/>
					<q-btn class="q-ml-sm" glossy label="清空" @click="() => (ContactStore.contactListExcel = [])" />
					<q-btn class="q-ml-sm" glossy label="批量导入">
						<q-menu>
							<q-list>
								<q-item clickable @click="NotifyStore.download()">
									<q-item-section>下载模板</q-item-section>
								</q-item>
								<q-item clickable>
									<q-item-section>
										<q-file
											dense
											borderless
											accept=".xlsx, .xls"
											v-model="filePicking"
											label="选择文件"
											@update:model-value="filePickNext"
										/>
									</q-item-section>
								</q-item>
							</q-list>
						</q-menu>
					</q-btn>
				</span>
				<q-btn class="q-ml-sm" glossy label="继续添加" @click="() => ContactStore.contactListExcel.push(ContactStore.getSchema())" />
			</div>
		</template>
		<template v-slot:top-row>
			<q-tr v-for="(schema, index) in ContactStore.contactListExcel">
				<q-td>
					<q-input square filled v-model="schema.name" dense clearable clear-icon="close" color="green-6" placeholder="请输入客户名称" />
				</q-td>
				<q-td>
					<q-input square filled v-model="schema.address" dense clearable clear-icon="close" color="green-6" placeholder="请输入联系方式" />
				</q-td>
				<q-td>
					<q-input square filled v-model="schema.remark" dense clearable clear-icon="close" color="green-6" placeholder="请输入备注" />
				</q-td>
				<q-td>
					<q-btn icon="close" dense class="text-negative" flat @click="() => ContactStore.contactListExcel.splice(index, 1)"> </q-btn>
				</q-td>
			</q-tr>
		</template>
		<template v-slot:body="props">
			<q-tr :props="props">
				<q-td key="name" :props="props" class="ellipsis"> {{ props.row.name }} </q-td>
				<q-td key="address" :props="props"> {{ props.row.address }} </q-td>
				<q-td key="remark" :props="props"> {{ props.row.remark }} </q-td>
				<q-td key="timeCreateString" :props="props">
					<div class="row items-center">
						<span>{{ props.row.timeCreateString }}</span>
						<q-space></q-space>
						<q-btn dense class="q-ml-sm" color="green-6" v-close-popup glossy @click="$emit('pick', cloneDeep(props.row))"> 选择 </q-btn>
						<q-btn dense icon="more_horiz" class="q-ml-sm">
							<q-menu anchor="top left" @hide="ContactStore.patch(props.row)">
								<q-card class="w-400">
									<q-toolbar class="bg-green-6 text-white">
										<q-toolbar-title>修改客户</q-toolbar-title>
										<q-btn dense flat icon="close" v-close-popup></q-btn>
									</q-toolbar>

									<q-card-section>
										<q-input filled label="客户名称" v-model="props.row.name" color="green-6">
											<template v-slot:before>
												<q-icon name="person" />
											</template>
										</q-input>
										<q-input filled label="联系方式" v-model="props.row.address" color="green-6">
											<template v-slot:before>
												<q-icon name="" />
											</template>
										</q-input>
										<q-input filled label="备注" v-model="props.row.remark" color="green-6">
											<template v-slot:before>
												<q-icon name="" />
											</template>
										</q-input>
									</q-card-section>

									<q-card-actions>
										<q-btn class="text-negative" flat v-close-popup @click="ContactStore.delete(props.row._id)">删除</q-btn>
										<q-space></q-space>
										<span class="text-grey">自动保存</span>
									</q-card-actions>
								</q-card>
							</q-menu>
						</q-btn>
					</div>
				</q-td>
			</q-tr>
		</template>
		<template v-slot:bottom="props">
			<span class="text-grey">
				<q-carousel vertical animated infinite :autoplay="4000" navigation v-model="swiperIndex" height="16px">
					<q-carousel-slide :name="0" class="q-pa-none">【通讯录】搜索框中，点击空白区域可以开始搜索</q-carousel-slide>
					<q-carousel-slide :name="0" class="q-pa-none">【通讯录】客户不会消失，删除后可以在“最近删除”中查看</q-carousel-slide>
					<q-carousel-slide :name="1" class="q-pa-none">【通讯录】修改客户后，其对应订单中的客户名称也会同时变化</q-carousel-slide>
				</q-carousel>
			</span>
			<q-space></q-space>
			<div>
				<span>{{ ContactStore.contactList.length }} / {{ ContactStore.total }}</span>
			</div>
		</template>
	</q-table>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from "vue";
import * as XLSX from "xlsx";
import { cloneDeep, debounce } from "lodash";

import { useNotifyStore } from "@/stores/notify";
import { useContactStore } from "@/stores/contact";

const NotifyStore = useNotifyStore();
const ContactStore = useContactStore();

const debounceGet = debounce(() => ContactStore.get(), 200);
const loadPage = (details: { index: number; from: number; to: number; direction: "increase" | "decrease" }) => {
	if (details.index + 17 >= ContactStore.contactList.length) {
		debounceGet();
	}
};

const swiperIndex = ref(0);
const filePicking = ref(null);
const filePickNext = async (file: File) => {
	if (!file) return;
	const reader = new FileReader(); // WebAPI
	reader.onload = async () => {
		const workbook = XLSX.read(reader.result, { type: "binary" });
		const sheet = workbook.Sheets["客户导入"];
		if (!sheet) throw new Error(`找不到表格 [客户导入] !`);
		const rowJsonList: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet);

		// 1.批量上传客户
		const uploading = [];
		for (let i in rowJsonList) {
			const row = rowJsonList[i];
			const schema = ContactStore.getSchema();
			schema.name = String(row["@客户名称"]);
			schema.address = String(row["@联系方式"] || "");
			schema.remark = String(row["@备注"] || "");
			uploading.push(schema);
		}
		ContactStore.contactListExcel = uploading;
	};
	reader.readAsBinaryString(file);
};

// action
onMounted(async () => {
	await ContactStore.get(1);
});
</script>

<style lang="sass" scoped>
.my-sticky-header-contact
  /* height or max-height is important */
  height: 700px

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th
    /* bg color is important for th; just specify one */
    background-color: white

  thead tr th
    position: sticky
    z-index: 1
  thead tr:first-child th
    top: 0

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th
    /* height of all previous header rows */
    top: 48px
</style>

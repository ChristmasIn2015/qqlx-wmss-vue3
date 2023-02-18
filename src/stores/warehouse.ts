import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { PATH_WAREHOUSE } from "qqlx-core";
import type { postWarehouseDto, postWarehouseRes, getWarehouseDto, getWarehouseRes, patchWarehouseDto, patchWarehouseRes } from "qqlx-core/dto/brand/warehouse";
import type { User } from "qqlx-core/schema/user/user";
import type { Warehouse } from "qqlx-core/schema/brand/warehouse";

import { getMongodbBase, request } from "@/utils";
import { useNotifyStore } from "@/stores/notify";

const NotifyStore = useNotifyStore();

function getSchema(): Warehouse {
	return {
		corpId: "",
		name: "",
		address: "",
		isDisabled: false,
		...getMongodbBase(),
	};
}

export const useWarehouseStore = defineStore("Warehouse", {
	state: () => ({
		WarehousePicked: getSchema(),
		WarehouseEditor: getSchema(),
		WarehouseList: [] as Warehouse[],
	}),
	actions: {
		async get() {
			const dto: getWarehouseDto = null;
			const res: getWarehouseRes = await request.get(PATH_WAREHOUSE);
			this.WarehouseList = res;
		},
		async post() {
			try {
				const dto: postWarehouseDto = this.WarehouseEditor;
				const res: postWarehouseRes = await request.post(PATH_WAREHOUSE, { dto });
				await this.get();
				NotifyStore.success("添加成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		async patch() {
			try {
				const dto: patchWarehouseDto = this.WarehouseEditor;
				const res: patchWarehouseRes = await request.patch(PATH_WAREHOUSE, { dto });
				await this.get();
				NotifyStore.success("修改成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		pick(house: Warehouse) {
			if (!house) throw new Error(`请选择正确的仓库`);
			this.WarehousePicked = house;
			NotifyStore.success(`切换 @${this.WarehousePicked.name} 成功`);
		},
		getSchema() {
			const schema: Warehouse = getSchema();
			return schema;
		},
		setSchema(target?: Warehouse) {
			const schema = target ? cloneDeep(target) : this.getSchema();
			this.WarehouseEditor = schema;
		},
	},
});

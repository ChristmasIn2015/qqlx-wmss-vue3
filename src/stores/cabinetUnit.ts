import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { PATH_CABINET_UNIT, MongodbSort } from "qqlx-core";
import type {
	postCabinetUnitDto,
	postCabinetUnitRes,
	getCabinetUnitDto,
	getCabinetUnitRes,
	patchCabinetUnitDto,
	patchCabinetUnitRes,
	deleteCabinetUnitDto,
	deleteCabinetUnitRes,
	CabinetUnitJoined,
} from "qqlx-core/dto/wmss/cabinetUnit";
import type { MongodbPage } from "qqlx-core/utils/database";
import type { Cabinet } from "qqlx-core/schema/wmss/cabinet";
import type { CabinetUnit } from "qqlx-core/schema/wmss/cabinetUnit";

import { getMongodbBase, request, getPage } from "@/utils";
import { useNotifyStore } from "@/stores/notify";

const NotifyStore = useNotifyStore();

function getSchema(): CabinetUnit {
	return {
		corpId: "",
		cabinetId: "",
		name: "",
		norm: "",
		poundsFinal: 0,
		countFinal: 0,
		price: 0,
		...getMongodbBase(),
	};
}

export const useCabinetUnitStore = defineStore("CabinetUnit", {
	state: () => ({
		cabinetUnitSearch: getSchema() as CabinetUnit,
		cabinetUnitEditor: getSchema() as CabinetUnit,
		cabinetUnitList: [] as CabinetUnitJoined[],
		cabinetUnitListExcel: [] as CabinetUnit[],

		sortKey: "timeCreate",
		sortValue: MongodbSort.DES,
		page: getPage() as MongodbPage,
		total: 0,
		loadding: false,
	}),
	actions: {
		async get(cabinet: Cabinet, page?: number) {
			try {
				// 分页
				if (page && page > 0) this.page.page = page;
				this.loadding = true;

				// 数据加载
				this.cabinetUnitSearch.cabinetId = cabinet._id;
				const dto: getCabinetUnitDto = {
					page: this.page,
					search: this.cabinetUnitSearch,
					sortKey: this.sortKey,
					sortValue: this.sortValue,
				};
				const res: getCabinetUnitRes = await request.get(PATH_CABINET_UNIT, { dto });
				this.cabinetUnitList = this.page.page === 1 ? res.list : this.cabinetUnitList.concat(res.list);
				this.total = res.total;

				if (res.list.length > 0) this.page.page++;
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		sort(cabinet: Cabinet, sortKey: string) {
			if (sortKey) {
				this.sortKey = sortKey;
			} else {
				this.sortKey = "timeCreate";
			}
			this.sortValue = this.sortValue === MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
			this.get(cabinet, 1); // async
		},
		async post(cabinet: Cabinet) {
			try {
				const excels = cloneDeep(this.cabinetUnitListExcel);
				while (excels.length > 0) {
					const dto: postCabinetUnitDto = {
						cabinet,
						excels: excels.splice(0, 80),
					};
					const res: postCabinetUnitRes = await request.post(PATH_CABINET_UNIT, { dto });
				}
				await this.get(cabinet, 1);

				this.setSchema();
				this.cabinetUnitListExcel = [];
				NotifyStore.success("添加成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		async patch(cabinet: Cabinet, excels: CabinetUnit[], price: number) {
			try {
				const list = JSON.parse(JSON.stringify(excels)) as CabinetUnit[];
				list.forEach((e) => (e.price = Number(price) || 0));
				const dto: patchCabinetUnitDto = { excels: list };
				const res: patchCabinetUnitRes = await request.patch(PATH_CABINET_UNIT, { dto });
				await this.get(cabinet, 1);

				NotifyStore.success("修改成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		async delete(cabinet: Cabinet, CabinetUnits: CabinetUnit[]) {
			try {
				for (let unit of CabinetUnits) {
					const dto: deleteCabinetUnitDto = { cabinetUnitId: unit._id };
					const res: deleteCabinetUnitRes = await request.delete(PATH_CABINET_UNIT, { dto });
				}
				await this.get(cabinet, 1);

				NotifyStore.success("删除成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		getSchema() {
			const schema: CabinetUnit = getSchema();
			return schema;
		},
		setSchema(entity?: CabinetUnit) {
			const schema = entity ? cloneDeep(entity) : this.getSchema();
			this.cabinetUnitEditor = schema;
			this.cabinetUnitSearch = schema;
		},
	},
});

import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { MongodbPage } from "qqlx-core/utils/database";
import { ENUM_SYSTEM_ROLE, ENUM_SUBJECT_TYPE, ENUM_POUNDS_WAY, ENUM_COUNT_WAY, CABINET_UNIT_PATH } from "qqlx-core";
import {
	postCabinetUnitDto,
	postCabinetUnitRes,
	getCabinetUnitDto,
	getCabinetUnitRes,
	patchCabinetUnitDto,
	patchCabinetUnitRes,
	deleteCabinetUnitDto,
	deleteCabinetUnitRes,
} from "qqlx-core/wmss/cabinetUnit/dto";
import { User } from "qqlx-core/user/entity";
import { CabinetUnitJoined } from "qqlx-core/wmss/cabinetUnit/dto";
import { CabinetUnit } from "qqlx-core/wmss/cabinetUnit/entity";

import { getMongodbBase, request, getPage } from "./utils";
import { useSnackbarStore } from "@/store/snackbar";
import { useCabinetStore } from "@/store/cabinet";

const SnackbarStore = useSnackbarStore();

function getSchema(): CabinetUnit {
	return {
		subjectId: "",
		cabinetId: "",
		name: "",
		norm: "",
		pounds: 0,
		count: 0,
		price: 0,
		...getMongodbBase(),
	};
}

export const useCabinetUnitStore = defineStore("CabinetUnit", {
	state: () => ({
		cabinetUnitSearch: getSchema() as CabinetUnit,
		cabinetUnitEditor: getSchema() as CabinetUnit,
		cabinetUnitList: [] as CabinetUnit[],
		cabinetUnitListExcel: [] as CabinetUnit[],
		page: getPage() as MongodbPage,
		total: 0,
		loadding: false,
	}),
	actions: {
		async get(page?: number) {
			try {
				this.page.startTime = 0;
				if (page && page > 0) this.page.page = page;
				if (this.page.page === 1) this.cabinetUnitList = [];
				this.loadding = true;

				const CabinetStore = useCabinetStore();
				this.cabinetUnitSearch.cabinetId = CabinetStore.cabinetPicked?._id;
				const dto: getCabinetUnitDto = { page: this.page, search: this.cabinetUnitSearch };
				const res: getCabinetUnitRes = await request.get(CABINET_UNIT_PATH, { dto });
				this.cabinetUnitList = this.cabinetUnitList.concat(res.list);
				this.total = res.total;

				if (res.list.length > 0) this.page.page++;
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		async post() {
			try {
				const CabinetStore = useCabinetStore();
				const dto: postCabinetUnitDto = this.cabinetUnitListExcel.map((e) => {
					e.cabinetId = CabinetStore.cabinetPicked?._id;
					return e;
				});
				const res: postCabinetUnitRes = await request.post(CABINET_UNIT_PATH, { dto });
				await this.get(1);

				this.setSchema();
				this.cabinetUnitListExcel = [];
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		async patch() {
			try {
				const dto: patchCabinetUnitDto = this.cabinetUnitEditor;
				const res: patchCabinetUnitRes = await request.patch(CABINET_UNIT_PATH, { dto });
				await this.get(1);

				SnackbarStore.setSuccess("修改成功");
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		async delete(cabinetUnitId: string) {
			try {
				const dto: deleteCabinetUnitDto = { cabinetUnitId };
				const res: deleteCabinetUnitRes = await request.delete(CABINET_UNIT_PATH, { dto });
				await this.get(1);

				SnackbarStore.setSuccess("删除成功");
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		getSchema() {
			const schema: CabinetUnit = getSchema();
			return schema;
		},
		setSchema() {
			this.cabinetUnitEditor = this.getSchema();
			this.cabinetUnitSearch = this.getSchema();
		},
	},
});

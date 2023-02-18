import { defineStore } from "pinia";
import { cloneDeep } from "lodash";
import { Notify, useQuasar } from "quasar";

import { ENUM_POUNDS_FORMULA, MAP_ENUM_POUNDS_FORMULA, ENUM_LAYOUT_CABINET, MAP_ENUM_LAYOUT_CABINET, PATH_CABINET } from "qqlx-core";
import type {
	postCabinetDto,
	postCabinetRes,
	getCabinetDto,
	getCabinetRes,
	patchCabinetDto,
	patchCabinetRes,
	deleteCabinetDto,
	deleteCabinetRes,
} from "qqlx-core/dto/wmss/cabinet";
import type { User } from "qqlx-core/schema/user/user";
import type { Cabinet } from "qqlx-core/schema/wmss/cabinet";

import { getMongodbBase, request } from "@/utils";
import { useNotifyStore } from "@/stores/notify";
import { useCabinetUnitStore } from "@/stores/cabinetUnit";

const NotifyStore = useNotifyStore();

function getSchema(): Cabinet {
	return {
		corpId: "",
		name: "",
		unit: "",
		formula: ENUM_POUNDS_FORMULA.NONE,
		layout: ENUM_LAYOUT_CABINET.SUMMARY,
		...getMongodbBase(),
	};
}

const recommand0 = getSchema();
recommand0.name = "自定义";
recommand0.unit = "您期望的单位";
const recommand1 = getSchema();
recommand1.name = "钢卷";
recommand1.unit = "个";
recommand1.layout = ENUM_LAYOUT_CABINET.INDIVIDUAL;
const recommand2 = getSchema();
recommand2.name = "板材";
recommand2.unit = "张";
recommand2.formula = ENUM_POUNDS_FORMULA.STEEL_PLATE;

export const useCabinetStore = defineStore("Cabinet", {
	state: () => ({
		cabinetEditor: getSchema() as Cabinet,
		cabinetSearch: getSchema() as Cabinet,
		cabinetList: [] as Cabinet[],
		cabinetListRecommand: [recommand0, recommand1, recommand2],

		OPTION_ENUM_POUNDS_FORMULA: MAP_ENUM_POUNDS_FORMULA,
		OPTION_ENUM_LAYOUT_CABINET: MAP_ENUM_LAYOUT_CABINET,
	}),
	actions: {
		async get() {
			const dto: getCabinetDto = null;
			const res: getCabinetRes = await request.get(PATH_CABINET);
			this.cabinetList = res;
		},
		async post() {
			try {
				const dto: postCabinetDto = this.cabinetEditor;
				const res: postCabinetRes = await request.post(PATH_CABINET, { dto });
				await this.get();
				this.setSchema();
				NotifyStore.success("创建成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		async patch() {
			try {
				const dto: patchCabinetDto = this.cabinetEditor;
				const res: patchCabinetRes = await request.patch(PATH_CABINET, { dto });
				await this.get();
				NotifyStore.success("修改成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		async delete(cabinetId: string) {
			try {
				const dto: deleteCabinetDto = { cabinetId };
				const res: deleteCabinetRes = await request.delete(PATH_CABINET, { dto });
				await this.get();
				NotifyStore.success("删除成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		getSchema() {
			const schema: Cabinet = getSchema();
			return schema;
		},
		setSchema(entity?: Cabinet) {
			const schema = cloneDeep(entity || this.getSchema());
			this.cabinetEditor = schema;
			this.cabinetSearch = schema;
		},
		getFormulaChinese(way: ENUM_POUNDS_FORMULA) {
			const map = MAP_ENUM_POUNDS_FORMULA;
			return map.find((e) => e.value === way);
		},
		getLayoutChinese(way: ENUM_LAYOUT_CABINET) {
			const map = MAP_ENUM_LAYOUT_CABINET;
			return map.find((e) => e.value === way);
		},
	},
});

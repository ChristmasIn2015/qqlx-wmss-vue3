import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { ENUM_SYSTEM_ROLE, ENUM_SUBJECT_TYPE, ENUM_POUNDS_WAY, ENUM_COUNT_WAY, CABINET_PATH } from "qqlx-core";
import {
	postCabinetDto,
	postCabinetRes,
	getCabinetDto,
	getCabinetRes,
	patchCabinetDto,
	patchCabinetRes,
	deleteCabinetDto,
	deleteCabinetRes,
} from "qqlx-core/wmss/cabinet/dto";
import { User } from "qqlx-core/user/entity";
import { Cabinet } from "qqlx-core/wmss/cabinet/entity";

import { getMongodbBase, request } from "./utils";
import { useSnackbarStore } from "@/store/snackbar";
import { useCabinetUnitStore } from "@/store/cabinetUnit";

const SnackbarStore = useSnackbarStore();
const CabinetUnitStore = useCabinetUnitStore();

function getSchema(): Cabinet {
	return {
		subjectId: "",
		name: "",
		unit: "",
		poundsWay: ENUM_POUNDS_WAY.NONE,
		countWay: ENUM_COUNT_WAY.WEIGHTED_AVERAGE,
		...getMongodbBase(),
	};
}
export const useCabinetStore = defineStore("Cabinet", {
	state: () => ({
		cabinetPicked: getSchema() as Cabinet,
		cabinetEditor: getSchema() as Cabinet,
		cabinetSearch: getSchema() as Cabinet,
		cabinetList: [] as Cabinet[],
		dialogPost: false,
		dialogPatch: false,
		ENUM_POUNDS_WAY_MAP: [
			{ value: ENUM_POUNDS_WAY.NONE, title: "无", tip: "" },
			{ value: ENUM_POUNDS_WAY.SPECIFIC_IDENTIFICATION, title: "钢板自动理算", tip: "如：1张 1.0mm*1250mm*2500mm 的钢板理算重量为 0.025 吨" },
		],

		ENUM_COUNT_WAY_MAP: [
			{ value: ENUM_COUNT_WAY.WEIGHTED_AVERAGE, title: "合计法", tip: "同名称、规格、单位的商品，将会自动汇总到此货架匹配的商品明细中" },
			{ value: ENUM_COUNT_WAY.SPECIFIC_IDENTIFICATION, title: "单独计价法", tip: "每项入库、加工的商品，将会单独进入此货架匹配的商品明细中" },
		],
	}),
	actions: {
		async get() {
			const dto: getCabinetDto = null;
			const res: getCabinetRes = await request.get(CABINET_PATH);
			this.cabinetList = res;
			if (!this.cabinetPicked._id) this.pick(res[0]);

			this.dialogPost = false;
			this.dialogPatch = false;
		},
		async post() {
			try {
				const dto: postCabinetDto = this.cabinetEditor;
				const res: postCabinetRes = await request.post(CABINET_PATH, { dto });
				await this.get();
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		async patch() {
			try {
				const dto: patchCabinetDto = this.cabinetEditor;
				const res: patchCabinetRes = await request.patch(CABINET_PATH, { dto });
				await this.get();
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		async delete(cabinetId: string) {
			try {
				const answer = window.confirm("删除后，货架中的商品也会被删除，确定要这样做吗？");
				if (!answer) return;
				const dto: deleteCabinetDto = { cabinetId };
				const res: deleteCabinetRes = await request.delete(CABINET_PATH, { dto });
				await this.get();
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		pick(origin?: Cabinet) {
			if (origin) {
				this.cabinetPicked = JSON.parse(JSON.stringify(origin));
				CabinetUnitStore.get(1); // async
			}
		},
		edit(origin?: Cabinet) {
			this.setSchema();
			if (origin) {
				this.cabinetEditor = JSON.parse(JSON.stringify(origin));
			}
		},
		getSchema() {
			const schema: Cabinet = getSchema();
			return schema;
		},
		setSchema() {
			this.cabinetEditor = this.getSchema();
			this.cabinetSearch = this.getSchema();
			this.cabinetPicked = this.getSchema();
		},
		getPoundsWayChinese(way: ENUM_POUNDS_WAY) {
			const map = this.ENUM_POUNDS_WAY_MAP;
			return map.find((e) => e.value === way);
		},
		getCountWayChinese(way: ENUM_COUNT_WAY) {
			const map = this.ENUM_COUNT_WAY_MAP;
			return map.find((e) => e.value === way);
		},
	},
});

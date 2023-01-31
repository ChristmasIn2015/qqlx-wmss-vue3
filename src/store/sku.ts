import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { MongodbPage } from "qqlx-core/utils/database";
import { ENUM_SYSTEM_ROLE, ENUM_ORDER_TYPE, ENUM_POUNDS_WAY, ENUM_COUNT_WAY, SKU_PATH } from "qqlx-core";
import { getSkuDto, getSkuRes, patchSkuDto, patchSkuRes, SkuJoined } from "qqlx-core/wmss/sku/dto";
import { User } from "qqlx-core/user/entity";
import { Cabinet } from "qqlx-core/wmss/cabinet/entity";
import { CabinetUnit } from "qqlx-core/wmss/cabinetUnit/entity";
import { Sku } from "qqlx-core/wmss/sku/entity";

import { getMongodbBase, request, getPage } from "./utils";
import { useSnackbarStore } from "@/store/snackbar";
import { useCabinetStore } from "@/store/cabinet";

const SnackbarStore = useSnackbarStore();

function getSchema(): Sku {
	return {
		subjectId: "",

		orderId: "",
		orderType: ENUM_ORDER_TYPE.SALES,
		isConfirmed: false,

		pounds: 0,
		count: 0,

		actionSkuId: "",

		joinedPounds: 0,
		joinedCount: 0,

		keyCode: "",
		keyOrigin: "",
		keyFeat: "",
		keyHouseId: "",

		name: "",
		norm: "",
		unit: "",
		poundsWay: ENUM_POUNDS_WAY.NONE,

		isPriceInPounds: false,
		remark: "",
		price: 0,
		...getMongodbBase(),
	};
}

export const useSkuStore = defineStore("Sku", {
	state: () => ({
		skuSearch: getSchema() as Sku,
		skuEditor: getSchema() as Sku,
		skuPicked: getSchema() as Sku,
		skuList: [] as SkuJoined[],
		skuListPicked: [] as SkuJoined[],
		page: getPage() as MongodbPage,
		total: 0,
		loadding: false,
		dialogList: false,
	}),
	actions: {
		async get(page?: number) {
			try {
				this.page.startTime = 0;
				if (page && page > 0) this.page.page = page;
				if (this.page.page === 1) this.skuList = [];
				this.loadding = true;

				const dto: getSkuDto = { page: this.page, search: this.skuSearch };
				const res: getSkuRes = await request.get(SKU_PATH, { dto });
				this.skuList = this.skuList.concat(res.list);
				this.total = res.total;

				if (res.list.length > 0) this.page.page++;
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		/** @cabinetId 入库 加工的时候一定要选择 */
		async patch(cabinetId: string) {
			const dto: patchSkuDto = { entity: this.skuEditor, cabinetId };
			const res: patchSkuRes = await request.patch(SKU_PATH, { dto });
			await this.get();
		},
		getSchema(type: ENUM_ORDER_TYPE = ENUM_ORDER_TYPE.NONE) {
			const schema: Sku = getSchema();
			schema.orderType = type;
			return schema;
		},
		setSchema(type: ENUM_ORDER_TYPE = ENUM_ORDER_TYPE.NONE) {
			this.skuEditor = this.getSchema(type);
			this.skuSearch = this.getSchema(type);
			this.skuListPicked = [];
		},
		push(unit: CabinetUnit) {
			const CabinetStore = useCabinetStore();

			const schema = this.getSchema() as SkuJoined;
			schema.name = unit.name;
			schema.norm = unit.norm;
			schema.unit = CabinetStore.cabinetPicked.unit;
			schema.poundsWay = CabinetStore.cabinetPicked.poundsWay;
			schema.joinCabinet = JSON.parse(JSON.stringify(CabinetStore.cabinetPicked));
			this.skuListPicked.push(schema);
		},
		setSkuPounds(sku: SkuJoined) {
			if (sku.poundsWay === ENUM_POUNDS_WAY.SPECIFIC_IDENTIFICATION) {
				sku.pounds = this.getNormPounds_1(sku.norm, sku.count);
			}
		},
		/** 根据 厚度mm *宽度mm *长度mm 计算板材重量（吨）
		 */
		getNormPounds_1(norm: string, count: number): number {
			norm = String(norm).replace(/ /g, "");
			count = Number(count) || 0;

			let POUNDS = 0;
			let VOLUME = 7.85; // 1t = 1000kg = 1000000g，钢材密度 7.85g/cm^3
			norm.split("*").map((MM) => (VOLUME = VOLUME * (Number(MM) / 10))); // 1m = 100cm = 1000mm
			POUNDS = (VOLUME / 1000 / 1000) * Number(count); // 吨

			return POUNDS || 0;
		},
	},
});

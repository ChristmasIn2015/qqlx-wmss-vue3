import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { ENUM_ORDER, ENUM_LAYOUT_CABINET, ENUM_POUNDS_FORMULA, PATH_SKU, MongodbSort } from "qqlx-core";
import type { getSkuDto, getSkuRes, patchSkuDto, patchSkuRes, SkuInView, getSkuByOrderDto, getSkuByOrderRes } from "qqlx-core/dto/wmss/sku";
import type { MongodbPage } from "qqlx-core/utils/database";
import type { Cabinet } from "qqlx-core/schema/wmss/cabinet";
import type { CabinetUnit } from "qqlx-core/schema/wmss/cabinetUnit";
import type { Sku } from "qqlx-core/schema/wmss/sku";
import type { Order } from "qqlx-core/schema/wmss/order";

import { getMongodbBase, request, getPage } from "@/utils";
import { useNotifyStore } from "@/stores/notify";
import { useAnalysisStore } from "@/stores/analysis";

const NotifyStore = useNotifyStore();
const AnalysisStore = useAnalysisStore();

function getSchema(): Sku {
	return {
		type: ENUM_ORDER.NONE,
		name: "",
		norm: "",
		unit: "",
		remark: "",

		pounds: 0,
		count: 0,
		poundsFinal: 0,
		countFinal: 0,

		price: 0,
		isConfirmed: false,
		isPriceInPounds: false,

		layout: ENUM_LAYOUT_CABINET.SUMMARY,
		formula: ENUM_POUNDS_FORMULA.NONE,

		keyCode: "",
		keyOrigin: "",
		keyFeat: "",

		corpId: "",
		warehouseId: "",
		orderId: "",
		orderContactId: "",
		orderIsDisabled: false,

		deductionSkuId: "",

		...getMongodbBase(),
	};
}
const cellStyle = { "font-size": "16px" };
const columns = [
	{ name: "orderContactId", field: "orderContactId", label: "客户", align: "left", style: cellStyle },
	{ name: "timeCreateString", field: "timeCreateString", label: "时间", style: cellStyle },
	{ name: "keyOrigin", field: "keyOrigin", label: "产地", align: "left", style: cellStyle },
	{ name: "keyFeat", field: "keyFeat", label: "材质", align: "left", style: cellStyle },
	{ name: "keyCode", field: "keyCode", label: "自定义编号", align: "left", style: cellStyle },
	{ name: "orderId", field: "orderId", label: "订单编号", align: "left", style: cellStyle },
	{ name: "layout", field: "layout", label: "性质", align: "left", style: cellStyle },
	{ name: "name", field: "name", label: "品名", align: "left", style: cellStyle },
	{ name: "norm", field: "norm", label: "规格", align: "left", style: cellStyle },
	{ name: "count", field: "count", label: "数量", style: cellStyle },
	{ name: "pounds", field: "pounds", label: "过磅", style: cellStyle },
	{ name: "price", field: "price", label: "单价", style: cellStyle },
	{ name: "remark", field: "remark", label: "备注", style: cellStyle },
	{ name: "_id", field: "_id", label: "操作", align: "left", style: cellStyle },
];
export const useSkuStore = defineStore("Sku", {
	state: () => ({
		isIndividual: false,
		skuSearch: getSchema() as Sku,
		skuEditor: getSchema() as Sku,
		skuList: [] as SkuInView[],
		skuListPicked: [] as SkuInView[],

		sortKey: "timeCreate",
		timeQuasarPicked: { from: `${new Date().getFullYear()}/01/01`, to: new Date().toLocaleString().split(" ")[0] },
		sortValue: MongodbSort.DES,
		page: getPage(40) as MongodbPage,
		total: 0,
		loadding: false,

		columns: columns,
		visibleColumns: columns.filter((e, i) => i === 0 || i > 5).map((e) => e.name),
	}),
	actions: {
		async get(page?: number) {
			try {
				// 分页
				if (page && page > 0) this.page.page = page;
				this.loadding = true;

				const dto: getSkuDto = {
					sortKey: this.sortKey,
					sortValue: this.sortValue,
					isIndividual: this.isIndividual,

					page: this.page,
					search: this.skuSearch,
				};
				const res: getSkuRes = await request.get(PATH_SKU, { dto });
				this.skuList = this.page.page === 1 ? res.list : this.skuList.concat(res.list);
				this.total = res.total;

				if (res.list.length > 0) this.page.page++;
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
				await AnalysisStore.get();
			}
		},
		timeChange(event: string) {
			if (typeof event === "string") {
				this.timeQuasarPicked = { from: event, to: event };
				this.page.startTime = new Date(event + " 00:00:00").getTime();
				this.page.endTime = new Date(event + " 23:59:59").getTime();
				this.get(1);
			} else if (this.timeQuasarPicked) {
				this.page.startTime = new Date(this.timeQuasarPicked.from + " 00:00:00").getTime();
				this.page.endTime = new Date(this.timeQuasarPicked.to + " 23:59:59").getTime();
				this.get(1);
			}
		},
		async getSkuByOrder(order: Order) {
			const dto: getSkuByOrderDto = { orderId: order._id };
			const res: getSkuByOrderRes = await request.get(PATH_SKU + "/byOrder", { dto });
			return res;
		},
		sort(sortKey: string) {
			if (sortKey) {
				this.sortKey = sortKey;
			} else {
				this.sortKey = "timeCreate";
			}
			this.sortValue = this.sortValue === MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
			this.get(1); // async
		},
		async patch(entitys: SkuInView[]) {
			try {
				this.loadding = true;
				for (let sku of entitys) {
					const dto: patchSkuDto = { entity: sku };
					const res: patchSkuRes = await request.patch(PATH_SKU, { dto });
				}
				await this.get(1);
				NotifyStore.success("修改成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		getSchema(type: ENUM_ORDER = ENUM_ORDER.NONE) {
			const schema: Sku = getSchema();
			schema.type = type;
			return schema;
		},
		setSchema(type: ENUM_ORDER = ENUM_ORDER.NONE, entity?: Sku) {
			const schema = entity ? cloneDeep(entity) : this.getSchema();
			schema.type = type;

			this.skuEditor = schema;
			this.skuSearch = schema;
			this.skuListPicked = [];
		},
		setSkuPounds(sku: SkuInView) {
			if (sku.formula === ENUM_POUNDS_FORMULA.STEEL_PLATE) {
				sku.pounds = this.getNormPounds_1(sku.norm, sku.count);
			}
		},
		/** 根据 厚度mm *宽度mm *长度mm 计算板材重量（吨）
		 */
		getNormPounds_1(norm: string, count: number): number {
			norm = String(norm).replace(/s/g, "");
			count = Number(count) || 0;

			let POUNDS = 0;
			let VOLUME = 7.85; // 1t = 1000kg = 1000000g，钢材密度 7.85g/cm^3
			norm.split("*").map((MM) => (VOLUME = VOLUME * (Number(MM) / 10))); // 1m = 100cm = 1000mm
			POUNDS = (VOLUME / 1000 / 1000) * Number(count); // 吨

			return parseInt(Math.round((POUNDS || 0) * 1000).toString()) / 1000;
		},
	},
});

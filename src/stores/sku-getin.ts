import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { ENUM_ORDER, ENUM_LAYOUT_CABINET, ENUM_POUNDS_FORMULA, PATH_SKU, MongodbSort } from "qqlx-core";
import type { getSkuDto, getSkuRes, patchSkuDto, patchSkuRes, SkuInView } from "qqlx-core/dto/wmss/sku";
import type { MongodbPage } from "qqlx-core/utils/database";
import type { Cabinet } from "qqlx-core/schema/wmss/cabinet";
import type { CabinetUnit } from "qqlx-core/schema/wmss/cabinetUnit";
import type { Sku } from "qqlx-core/schema/wmss/sku";

import { getMongodbBase, request, getPage } from "@/utils";
import { useNotifyStore } from "@/stores/notify";

const NotifyStore = useNotifyStore();

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

const columns = [
	{ name: "orderContactId", field: "orderContactId", label: "客户", align: "left", style: "font-size: 16px;" },
	{ name: "timeCreateString", field: "timeCreateString", label: "时间", style: "font-size: 16px; " },
	{ name: "keyOrigin", field: "keyOrigin", label: "产地", align: "left", style: "font-size: 16px;" },
	{ name: "keyFeat", field: "keyFeat", label: "材质", align: "left", style: "font-size: 16px;" },
	{ name: "keyCode", field: "keyCode", label: "自定义编号", align: "left", style: "font-size: 16px;" },
	{ name: "orderId", field: "orderId", label: "订单编号", align: "left", style: "font-size: 16px;" },
	{ name: "name", field: "name", label: "品名", align: "left", style: "font-size: 16px;" },
	{ name: "norm", field: "norm", label: "规格", align: "left", style: "font-size: 16px;" },
	{ name: "count", field: "count", label: "数量", style: "font-size: 16px;" },
	{ name: "pounds", field: "pounds", label: "过磅", style: "font-size: 16px;" },
	{ name: "countFinal", field: "countFinal", label: "数量", style: "font-size: 16px;" },
	{ name: "poundsFinal", field: "poundsFinal", label: "过磅", style: "font-size: 16px;" },
	{ name: "price", field: "price", label: "单价", style: "font-size: 16px;" },
	{ name: "remark", field: "remark", label: "备注", style: "font-size: 16px;" },
	{ name: "layout", field: "layout", label: "性质", align: "left", style: "font-size: 16px; " },
	{ name: "_id", field: "_id", label: "操作", align: "left", style: "font-size: 16px; " },
];
export const useSkuGetInStore = defineStore("SkuGetIn", {
	state: () => ({
		skuSearch: getSchema() as Sku,
		skuList: [] as SkuInView[],

		sortKey: "timeCreate",
		sortValue: MongodbSort.DES,
		types: [],
		page: getPage() as MongodbPage,
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

					page: this.page,
					search: this.skuSearch,
					types: this.types,
				};
				const res: getSkuRes = await request.get(PATH_SKU, { dto });
				this.skuList = this.page.page === 1 ? res.list : this.skuList.concat(res.list);
				this.total = res.total;

				if (res.list.length > 0) this.page.page++;
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
			}
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
		getSchema(type: ENUM_ORDER = ENUM_ORDER.NONE) {
			const schema: Sku = getSchema();
			schema.type = type;
			return schema;
		},
		setSchema(type: ENUM_ORDER = ENUM_ORDER.NONE, entity?: Sku) {
			const schema = entity ? cloneDeep(entity) : this.getSchema();
			schema.type = type;

			this.skuSearch = schema;
		},
	},
});

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
export const useSkuGetInStore = defineStore("SkuGetIn", {
	state: () => ({
		skuSearch: getSchema() as Sku,
		skuList: [] as SkuInView[],

		timeQuasarPicked: { from: `${new Date().getFullYear()}/01/01`, to: new Date().toLocaleString().split(" ")[0] },
		sortKey: "timeCreate",
		sortValue: MongodbSort.DES,
		types: [],
		page: getPage() as MongodbPage,
		total: 0,
		loadding: false,
	}),
	actions: {
		async get(page?: number) {
			try {
				// 分页
				if (page && page > 0) this.page.page = page;
				this.loadding = true;
				this.skuSearch.type = ENUM_ORDER.GETIN;
				this.skuSearch.isConfirmed = true;

				const dto: getSkuDto = {
					sortKey: this.sortKey,
					sortValue: this.sortValue,
					isIndividual: true,

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

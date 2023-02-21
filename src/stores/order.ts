import { defineStore } from "pinia";
import { cloneDeep } from "lodash";
import { useRouter, useRoute } from "vue-router";

import { ENUM_ORDER, PATH_ORDER, MongodbSort } from "qqlx-core";
import type { MongodbPage } from "qqlx-core/utils/database";
import type {
	postOrderDto,
	postOrderRes,
	getOrderDto,
	getOrderRes,
	putOrderDto,
	putOrderRes,
	deleteOrderDto,
	deleteOrderRes,
	OrderInView,
} from "qqlx-core/dto/wmss/order";
import type { Order } from "qqlx-core/schema/wmss/order";
import type { Fee } from "qqlx-core/schema/wmss/fee";
import type { Sku } from "qqlx-core/schema/wmss/sku";

import { getMongodbBase, request, getPage } from "@/utils";
import { useNotifyStore } from "@/stores/notify";
import { useAnalysisStore } from "@/stores/analysis";
import { useSkuStore } from "@/stores/sku";
import { useFeeStore } from "@/stores/fee";

const NotifyStore = useNotifyStore();
const AnalysisStore = useAnalysisStore();
const SkuStore = useSkuStore();
const FeeStore = useFeeStore();

function getSchema(): Order {
	return {
		corpId: "",

		parentOrderId: "",
		parentOrderType: ENUM_ORDER.NONE,

		creatorId: "",
		contactId: "",
		managerId: "",
		accounterId: "",

		type: ENUM_ORDER.NONE,
		code: "",
		amount: 0,
		remark: "",
		isDisabled: false,

		amountBookOfOrder: 0,
		amountBookOfOrderRest: 0,
		...getMongodbBase(),
	};
}

export const useOrderStore = defineStore("Order", {
	state: () => ({
		orderSearch: getSchema() as Order,
		orderEditor: getSchema() as OrderInView,
		orderList: [] as OrderInView[],

		sortKey: "timeCreate",
		sortValue: MongodbSort.DES,
		page: getPage(15),
		total: 0,
		amountTotal: 0,
		loadding: false,

		// 是否可以复核、结清
		managerIdRequired: false,
		accounterIdIdRequired: false,

		// 资金用于结清
		orderListPicked: [] as OrderInView[],
	}),
	actions: {
		async get(page?: number) {
			try {
				if (page && page > 0) this.page.page = page;
				this.loadding = true;

				const dto: getOrderDto = {
					page: this.page,
					search: this.orderSearch,
					managerIdRequired: this.managerIdRequired,
					accounterIdIdRequired: this.accounterIdIdRequired,
					sortKey: this.sortKey,
					sortValue: this.sortValue,
					noJoin: false,
				};
				const res: getOrderRes = await request.get(PATH_ORDER, { dto });
				this.orderList = res.list;
				this.total = res.total;
				this.amountTotal = res.group?.value as number;
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		async getNoJoin(page?: number) {
			try {
				if (page && page > 0) this.page.page = page;
				this.loadding = true;

				const dto: getOrderDto = {
					page: this.page,
					search: this.orderSearch,
					managerIdRequired: this.managerIdRequired,
					accounterIdIdRequired: this.accounterIdIdRequired,
					sortKey: this.sortKey,
					sortValue: this.sortValue,
					noJoin: true,
				};
				const res: getOrderRes = await request.get(PATH_ORDER, { dto });
				this.orderList = res.list;
				this.total = res.total;
				this.amountTotal = res.group?.value as number;
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
		async post(skuList?: Sku[], feeList?: Fee[]) {
			try {
				this.loadding = true;
				const dto: postOrderDto = { schema: this.orderEditor, skuList, feeList };
				const res: postOrderRes = await request.post(PATH_ORDER, { dto });
				this.loadding = false;

				NotifyStore.success("创建成功");

				SkuStore.setSchema();
				FeeStore.setSchema();
				await AnalysisStore.get();
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		async put(entity?: Order, skuList?: Sku[], feeList?: Fee[]) {
			let code = "";
			try {
				const target = entity || this.orderEditor;
				const dto: putOrderDto = { entity: target, skuList, feeList };
				const res: putOrderRes = await request.put(PATH_ORDER, { dto });
				await this.get();

				code = target.code;
				this.orderEditor = this.getSchema(this.orderSearch.type);
				NotifyStore.success("修改成功");
				await AnalysisStore.get();
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				return code;
			}
		},
		async delete(orderId: string) {
			try {
				const dto: deleteOrderDto = { orderId };
				const res: deleteOrderRes = await request.delete(PATH_ORDER, { dto });

				await this.get();
				NotifyStore.success("操作成功");
				await AnalysisStore.get();
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		getSchema(type: ENUM_ORDER = ENUM_ORDER.NONE) {
			const schema: Order = getSchema();
			schema.type = type;
			return schema;
		},
		setSchema(entity?: Order) {
			const schema = entity ? cloneDeep(entity) : this.getSchema();
			this.orderEditor = schema;
			this.orderSearch = schema;

			this.managerIdRequired = false;
			this.accounterIdIdRequired = false;
			this.sortKey = "timeCreate";
			this.sortValue = MongodbSort.DES;
		},
	},
});

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

		loadding: false,
		sortKey: "timeCreate",
		sortValue: MongodbSort.DES,
		page: getPage(15),
		timeQuasarPicked: { from: `${new Date().getFullYear()}/01/01`, to: new Date().toLocaleString().split(" ")[0] },
		total: 0,
		amountTotal: 0,

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
					joinContact: false,
					joinSku: false,
					joinUser: true,
					join: false,
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
		async getOrderWidthContact(page?: number) {
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
					joinContact: false,
					joinUser: false,
					joinSku: true,
					join: false,
				};
				const res: getOrderRes = await request.get(PATH_ORDER, { dto });
				this.orderList = this.page.page === 1 ? res.list : this.orderList.concat(res.list);
				this.total = res.total;
				this.amountTotal = res.group?.value as number;
				if (res.list.length > 0) this.page.page++;
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		async geOrderWidthSku(): Promise<OrderInView[]> {
			const page = cloneDeep(this.page);
			page.page = 1;
			page.pageSize = this.total;
			if (page.endTime - page.startTime > 86400000 * 90) throw new Error(`最多选择90天`);

			this.loadding = true;

			const dto: getOrderDto = {
				page,
				search: this.orderSearch,
				sortKey: this.sortKey,
				sortValue: this.sortValue,
				joinContact: false,
				joinUser: false,
				joinSku: true,
				join: false,
			};
			const res: getOrderRes = await request.get(PATH_ORDER, { dto });
			return res.list;
		},
		async getOrderInView(page?: number) {
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
					joinContact: false,
					joinSku: false,
					joinUser: false,
					join: true,
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
		sort(sortKey: string, widthJoin = false) {
			if (sortKey) {
				this.sortKey = sortKey;
			} else {
				this.sortKey = "timeCreate";
			}
			this.sortValue = this.sortValue === MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
			widthJoin ? this.getOrderWidthContact(1) : this.get(1); // async
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
		async put(entity?: OrderInView, skuList?: Sku[], feeList?: Fee[]) {
			let code = "";
			try {
				const target = entity || this.orderEditor;
				const dto: putOrderDto = { entity: target, skuList, feeList };
				const res: putOrderRes = await request.put(PATH_ORDER, { dto });
				NotifyStore.success("修改成功");

				code = target.code;
				await AnalysisStore.get();
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				return code;
			}
		},
		async delete(orderId: string) {
			try {
				this.loadding = true;
				const dto: deleteOrderDto = { orderId };
				const res: deleteOrderRes = await request.delete(PATH_ORDER, { dto });

				await this.get();
				NotifyStore.success("操作成功");
				await AnalysisStore.get();
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
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

import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { MongodbPage } from "qqlx-core/utils/database";
import { ENUM_SYSTEM_ROLE, ENUM_ORDER_TYPE, ENUM_POUNDS_WAY, ENUM_COUNT_WAY, ORDER_PATH } from "qqlx-core";
import {
	postOrderDto,
	postOrderRes,
	getOrderDto,
	getOrderRes,
	putOrderDto,
	putOrderRes,
	deleteOrderDto,
	deleteOrderRes,
	OrderJoined,
} from "qqlx-core/wmss/order/dto";
import { User } from "qqlx-core/user/entity";
import { Order } from "qqlx-core/wmss/order/entity";
import { OrderFee } from "qqlx-core/wmss/orderFee/entity";
import { Sku } from "qqlx-core/wmss/sku/entity";

import { getMongodbBase, request, getPage } from "./utils";
import { useSnackbarStore } from "@/store/snackbar";
import { useSubjectContactStore } from "@/store/subjectContact";

const SnackbarStore = useSnackbarStore();
const SubjectContactStore = useSubjectContactStore();

function getSchema(): Order {
	return {
		subjectId: "",

		fromOrderId: "",
		fromOrderType: ENUM_ORDER_TYPE.NONE,

		creatorId: "",
		contactId: "",
		managerId: "",
		accounterId: "",

		code: "",
		type: ENUM_ORDER_TYPE.SALES,
		remark: "",
		isDisabled: false,

		amount: 0,
		amountSku: 0,

		amountFee: 0,
		amountCertification: 0,
		amountCertificationRest: 0,
		...getMongodbBase(),
	};
}

export const useOrderStore = defineStore("Order", {
	state: () => ({
		orderSearch: getSchema() as Order,
		orderEditor: getSchema() as Order,
		orderPicked: getSchema() as Order,
		orderList: [] as OrderJoined[],
		orderListPicked: [] as OrderJoined[],
		page: getPage(12),
		total: 0,
		loadding: false,
		// 是否可以复核、结清
		managerIdRequired: false,
		accounterIdIdRequired: false,
		// 编辑弹窗
		dialogPut: false,
		// 枚举翻译
		enum_order_type: [
			{ text: "无", value: ENUM_ORDER_TYPE.NONE },
			{ text: "采购", value: ENUM_ORDER_TYPE.PURCHASE },
			{ text: "销售", value: ENUM_ORDER_TYPE.SALES },
			{ text: "领料", value: ENUM_ORDER_TYPE.MATERIAL },
			{ text: "加工", value: ENUM_ORDER_TYPE.PROCESS },
			{ text: "入库", value: ENUM_ORDER_TYPE.GETIN },
			{ text: "发货", value: ENUM_ORDER_TYPE.GETOUT },
		],
	}),
	actions: {
		async get(page?: number) {
			try {
				if (SubjectContactStore.keyword === "") this.orderSearch.contactId = "";

				if (page && page > 0) this.page.page = page;
				this.loadding = true;

				const dto: getOrderDto = {
					page: this.page,
					search: this.orderSearch,
					managerIdRequired: this.managerIdRequired,
					accounterIdIdRequired: this.accounterIdIdRequired,
				};
				const res: getOrderRes = await request.get(ORDER_PATH, { dto });
				this.orderList = res.list;
				this.total = res.total;
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		async post(skuList?: Sku[], orderFeeList?: OrderFee[]) {
			this.loadding = true;
			const dto: postOrderDto = { schema: this.orderEditor, skuList, orderFeeList };
			const res: postOrderRes = await request.post(ORDER_PATH, { dto });
			this.loadding = false;
			SnackbarStore.setSuccess("创建成功");
		},
		async put(skuList?: Sku[], orderFeeList?: OrderFee[]) {
			const dto: putOrderDto = { entity: this.orderEditor, skuList, orderFeeList };
			const res: putOrderRes = await request.put(ORDER_PATH, { dto });

			this.setSchema(this.orderEditor.type);
			SnackbarStore.setSuccess("修改成功");
		},
		async disable(entity: Order) {
			try {
				const confirm = window.confirm(`确定要 ${entity.isDisabled ? "恢复" : "删除"}订单 ${entity.code} 吗?`);
				if (!confirm) return;

				const dto: deleteOrderDto = { entity: { ...entity, ...{ isDisabled: !entity.isDisabled } } };
				const res: deleteOrderRes = await request.delete(ORDER_PATH, { dto });

				this.setSchema(this.orderEditor.type);
				await this.get(1);
				SnackbarStore.setSuccess("操作成功");
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		getSchema(type: ENUM_ORDER_TYPE) {
			const schema: Order = getSchema();
			schema.type = type;
			schema.fromOrderType = ENUM_ORDER_TYPE.NONE;
			return schema;
		},
		setSchema(type: ENUM_ORDER_TYPE) {
			this.orderEditor = this.getSchema(type);
			this.orderSearch = this.getSchema(type);
		},
	},
});

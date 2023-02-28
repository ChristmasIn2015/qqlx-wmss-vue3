import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { ENUM_BOOK_TYPE, ENUM_BOOK_DIRECTION, PATH_INVOICE, MongodbSort } from "qqlx-core";
import type {
	postInvoiceDto,
	postInvoiceRes,
	getInvoiceDto,
	getInvoiceRes,
	putInvoiceDto,
	putInvoiceRes,
	deleteInvoiceDto,
	deleteInvoiceRes,
} from "qqlx-core/dto/wmss/invoice";
import type { InvoiceInView } from "qqlx-core/dto/wmss/invoice";
import type { Book } from "qqlx-core/schema/wmss/book";
import type { Invoice } from "qqlx-core/schema/wmss/invoice";

import { getMongodbBase, request, getPage } from "@/utils";
import { useNotifyStore } from "@/stores/notify";
import { useOrderStore } from "@/stores/order";

const NotifyStore = useNotifyStore();
const OrderStore = useOrderStore();

function getSchema(): Invoice {
	return {
		corpId: "",
		headerId: "",

		type: ENUM_BOOK_TYPE.YSZK,
		direction: ENUM_BOOK_DIRECTION.DAI,

		code: "",
		remark: "",
		amount: 0,
		isDisabled: false,

		keyCode: "",
		keyOrigin: "",
		keyHouse: "",

		amountBookOfSelf: 0,
		amountBookOfSelfRest: 0,
		...getMongodbBase(),
	};
}

export const useInvoiceStore = defineStore("Invoice", {
	state: () => ({
		invoiceSearch: getSchema() as Invoice,
		invoiceEditor: getSchema() as InvoiceInView,
		invoiceList: [] as InvoiceInView[],
		invoiceListExcel: [] as Invoice[],

		timeQuasarPicked: { from: `${new Date().getFullYear()}/01/01`, to: new Date().toLocaleString().split(" ")[0] },
		sortKey: "timeCreate",
		sortValue: MongodbSort.DES,
		page: getPage(),
		total: 0,
		loadding: false,
	}),
	actions: {
		async get(page?: number) {
			try {
				// 分页
				if (page && page > 0) this.page.page = page;
				this.loadding = true;

				// 数据加载
				const dto: getInvoiceDto = {
					page: this.page,
					search: this.invoiceSearch,
					sortKey: this.sortKey,
					sortValue: this.sortValue,
				};
				const res: getInvoiceRes = await request.get(PATH_INVOICE, { dto });
				this.invoiceList = this.page.page === 1 ? res.list : this.invoiceList.concat(res.list);
				this.total = res.total;

				if (res.list.length > 0) this.page.page++;
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		timeChange() {
			if (this.timeQuasarPicked) {
				this.page.startTime = new Date(this.timeQuasarPicked.from + " 00:00:00").getTime();
				this.page.endTime = new Date(this.timeQuasarPicked.to + " 23:59:59").getTime();
				this.get(1);
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
		async post(schema: Invoice) {
			const dto: postInvoiceDto = { excels: [schema] };
			const res: postInvoiceRes = await request.post(PATH_INVOICE, { dto });

			this.setSchema();
			NotifyStore.success("添加成功");
			return res;
		},
		async put(entity?: Invoice, books?: Book[]) {
			const _entity = entity || this.invoiceEditor;
			const dto: putInvoiceDto = { entity: _entity, books };
			const res: putInvoiceRes = await request.put(PATH_INVOICE, { dto });

			this.setSchema();
			NotifyStore.success("修改成功");
		},
		async delete(invoices: Invoice[]) {
			try {
				const dto: deleteInvoiceDto = { invoiceIds: (invoices || []).map((e) => e._id) };
				const res: deleteInvoiceRes = await request.delete(PATH_INVOICE, { dto });

				await this.get(1);
				NotifyStore.success("删除成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		getSchema(type: ENUM_BOOK_TYPE = ENUM_BOOK_TYPE.YSZK, direction: ENUM_BOOK_DIRECTION = ENUM_BOOK_DIRECTION.DAI) {
			const schema: Invoice = getSchema();
			schema.type = type;
			schema.direction = direction;
			schema.timeCreate = Date.now();
			schema.timeCreateString = new Date().toLocaleString();
			return schema;
		},
		setSchema(entity?: Invoice) {
			const schema = entity ? cloneDeep(entity) : this.getSchema();
			this.invoiceEditor = schema;
			this.invoiceSearch = schema;
		},
	},
});

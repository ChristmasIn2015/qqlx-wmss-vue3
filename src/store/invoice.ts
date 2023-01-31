import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { MongodbPage } from "qqlx-core/utils/database";
import { ENUM_LEDGER_TYPE, ENUM_LEDGER_SCOPE, ENUM_SUBJECT_TYPE, CERTIFICATION_PATH } from "qqlx-core";
import { postInvoiceDto, postInvoiceRes, getInvoiceDto, getInvoiceRes, putInvoiceDto, putInvoiceRes } from "qqlx-core/wmss/invoice/dto";
import { User } from "qqlx-core/user/entity";
import { Invoice, InvoiceUnit } from "qqlx-core/wmss/invoice/entity";

import { getMongodbBase, request, getPage } from "./utils";

function getSchema(): Invoice {
	return {
		subjectId: "",
		ledgerId: "",
		ledgerType: ENUM_LEDGER_TYPE.J,
		ledgerScope: ENUM_LEDGER_SCOPE.YFZK,

		creatorId: "",
		code: "",
		amount: 0,
		...getMongodbBase(),
	};
}

export const useInvoiceStore = defineStore("Invoice", {
	state: () =>
		({
			invoiceSearch: getSchema(),
			invoiceEditor: getSchema(),
			invoiceListExcel: [],
			invoiceList: [],
			page: getPage(),
			total: 0,
		} as {
			invoiceSearch: Invoice;
			invoiceEditor: Invoice;
			invoiceListExcel: Invoice[];
			invoiceList: Invoice[];
			page: MongodbPage;
			total: number;
		}),
	actions: {
		async get() {
			const dto: getInvoiceDto = { page: this.page, search: this.invoiceSearch };
			const res: getInvoiceRes = await request.get(CERTIFICATION_PATH);
			this.invoiceList = res.list;
			this.total = res.total;
		},
		async post(details: InvoiceUnit[]) {
			const dto: postInvoiceDto = { schema: this.invoiceEditor, details };
			const res: postInvoiceRes = await request.post(CERTIFICATION_PATH, { dto });
			await this.get();
		},
		async put(details: InvoiceUnit[]) {
			const dto: putInvoiceDto = { entity: this.invoiceEditor, details };
			const res: putInvoiceRes = await request.put(CERTIFICATION_PATH, { dto });
			await this.get();
		},
		pick(target: Invoice) {
			this.invoiceEditor = cloneDeep(target);
		},
		getSchema() {
			const schema: Invoice = getSchema();
			return schema;
		},
		setSchema() {
			this.invoiceEditor = this.getSchema();
		},
	},
});

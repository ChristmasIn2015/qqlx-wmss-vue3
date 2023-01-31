import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { MongodbPage } from "qqlx-core/utils/database";
import { ENUM_LEDGER_TYPE, ENUM_LEDGER_SCOPE, ENUM_SUBJECT_TYPE, LEDGER_PATH } from "qqlx-core";
import { postLedgerDto, postLedgerRes, getLedgerDto, getLedgerRes, patchLedgerDto, patchLedgerRes } from "qqlx-core/wmss/ledger/dto";
import { User } from "qqlx-core/user/entity";
import { LedgerJoined } from "qqlx-core/wmss/ledger/dto";
import { Ledger } from "qqlx-core/wmss/ledger/entity";

import { getMongodbBase, request, getPage } from "./utils";
import { useSnackbarStore } from "@/store/snackbar";

const SnackbarStore = useSnackbarStore();

function getSchema(): Ledger {
	return {
		subjectId: "",
		type: ENUM_LEDGER_TYPE.J,
		scope: ENUM_LEDGER_SCOPE.YSZK,
		isDisabled: false,

		code: "",
		remark: "",
		amount: 0,

		keyCode: "",
		keyOrigin: "",
		keyHouse: "",

		amountCertification: 0,
		amountCertificationRest: 0,
		...getMongodbBase(),
	};
}

export const useLedgerStore = defineStore("Ledger", {
	state: () => ({
		ledgerSearch: getSchema() as Ledger,
		ledgerEditor: getSchema() as Ledger,
		ledgerPicked: getSchema() as Ledger,
		ledgerListExcel: [] as Ledger[],
		ledgerList: [] as LedgerJoined[],
		page: getPage(),
		total: 0,
		loadding: false,
	}),
	actions: {
		async get(page?: number) {
			try {
				this.page.startTime = 0;
				if (page && page > 0) this.page.page = page;
				if (this.page.page === 1) this.ledgerList = [];
				this.loadding = true;

				const dto: getLedgerDto = { page: this.page, search: this.ledgerSearch };
				const res: getLedgerRes = await request.get(LEDGER_PATH, { dto });
				this.ledgerList = this.ledgerList.concat(res.list);
				this.total = res.total;

				if (res.list.length > 0) this.page.page++;
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		async post() {
			try {
				const dto: postLedgerDto = { schemas: this.ledgerListExcel };
				const res: postLedgerRes = await request.post(LEDGER_PATH, { dto });
				await this.get(1);
				SnackbarStore.setSuccess("添加成功");

				this.ledgerListExcel = [];
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		async patch(ledger?: Ledger) {
			try {
				const target = ledger || this.ledgerEditor;
				const dto: patchLedgerDto = target;
				const res: patchLedgerRes = await request.patch(LEDGER_PATH, { dto });

				await this.get(1);
				SnackbarStore.setSuccess("修改成功");
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		async delete(ledger: Ledger) {
			try {
				const dto: patchLedgerDto = ledger;
				const res: patchLedgerRes = await request.delete(LEDGER_PATH, { dto });

				await this.get(1);
				SnackbarStore.setSuccess("修改成功");
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		getSchema(type: ENUM_LEDGER_TYPE = ENUM_LEDGER_TYPE.D, scope: ENUM_LEDGER_SCOPE = ENUM_LEDGER_SCOPE.YSZK) {
			const schema: Ledger = getSchema();
			const date = new Date();
			schema.timeCreate = date.getTime();
			schema.timeUpdate = date.getTime();
			schema.timeCreateString = date.toLocaleDateString();
			schema.timeUpdateString = date.toLocaleDateString();
			schema.type = type;
			schema.scope = scope;
			return schema;
		},
		setSchema(type: ENUM_LEDGER_TYPE = ENUM_LEDGER_TYPE.D, scope: ENUM_LEDGER_SCOPE = ENUM_LEDGER_SCOPE.YSZK) {
			this.ledgerEditor = this.getSchema(type, scope);
			this.ledgerSearch = this.getSchema(type, scope);
		},
	},
});

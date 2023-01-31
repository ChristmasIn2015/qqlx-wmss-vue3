import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { MongodbPage } from "qqlx-core/utils/database";
import { ENUM_LEDGER_TYPE, ENUM_LEDGER_SCOPE, ENUM_SUBJECT_TYPE, CERTIFICATION_PATH } from "qqlx-core";
import {
	postCertificationDto,
	postCertificationRes,
	getCertificationDto,
	getCertificationRes,
	putCertificationDto,
	putCertificationRes,
} from "qqlx-core/wmss/certification/dto";
import { User } from "qqlx-core/user/entity";
import { Certification, CertificationUnit } from "qqlx-core/wmss/certification/entity";

import { getMongodbBase, request, getPage } from "./utils";
import { useSnackbarStore } from "@/store/snackbar";

const SnackbarStore = useSnackbarStore();

function getSchema(): Certification {
	return {
		subjectId: "",
		ledgerId: "",
		ledgerType: ENUM_LEDGER_TYPE.D,
		ledgerScope: ENUM_LEDGER_SCOPE.YSZK,

		creatorId: "",
		code: "",
		amount: 0,
		amountIncoice: 0,
		amountIncoiceRest: 0,
		...getMongodbBase(),
	};
}

export const useCertificationStore = defineStore("Certification", {
	state: () => ({
		certificationSearch: getSchema() as Certification,
		certificationEditor: getSchema() as Certification,
		certificationListExcel: [] as Certification[],
		certificationList: [] as Certification[],
		certificationListPicked: [] as Certification[],
		page: getPage(),
		total: 0,
		loadding: false,
	}),
	actions: {
		async get(page?: number) {
			try {
				this.page.startTime = 0;
				if (page && page > 0) this.page.page = page;
				if (this.page.page === 1) this.certificationList = [];
				this.loadding = true;

				const dto: getCertificationDto = { page: this.page, search: this.certificationSearch };
				const res: getCertificationRes = await request.get(CERTIFICATION_PATH, { dto });
				this.certificationList = this.certificationList.concat(res.list);
				this.total = res.total;

				if (res.list.length > 0) this.page.page++;
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		async post(details: CertificationUnit[]) {
			const dto: postCertificationDto = { schema: this.certificationEditor, details };
			const res: postCertificationRes = await request.post(CERTIFICATION_PATH, { dto });
		},
		async put(details: CertificationUnit[]) {
			const dto: putCertificationDto = { entity: this.certificationEditor, details };
			const res: putCertificationRes = await request.put(CERTIFICATION_PATH, { dto });
		},
		pick(target: Certification) {
			this.certificationEditor = cloneDeep(target);
		},
		getSchema() {
			const schema: Certification = getSchema();
			return schema;
		},
		setSchema() {
			this.certificationEditor = this.getSchema();
		},
	},
});

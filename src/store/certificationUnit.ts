import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { MongodbPage } from "qqlx-core/utils/database";
import { ENUM_LEDGER_TYPE, ENUM_LEDGER_SCOPE, ENUM_SUBJECT_TYPE, CERTIFICATION_UNIT_PATH } from "qqlx-core";
import { getCertificationUnitDto, getCertificationUnitRes } from "qqlx-core/wmss/certification/dto";
import { User } from "qqlx-core/user/entity";
import { CertificationUnitJoined } from "qqlx-core/wmss/certification/dto";
import { Certification, CertificationUnit } from "qqlx-core/wmss/certification/entity";

import { getMongodbBase, request, getPage } from "./utils";

function getSchema(): CertificationUnit {
	return {
		certificationId: "",
		orderId: "",
		amount: 0,
		...getMongodbBase(),
	};
}

export const useCertificationUnitStore = defineStore("CertificationUnit", {
	state: () => ({
		certificationSearch: getSchema(),
		certificationEditor: getSchema(),
		certificationUnitList: [] as CertificationUnitJoined[],
		certificationUnitListPicked: [] as CertificationUnit[],
		page: getPage(),
		total: 0,
	}),
	actions: {
		async get(certificationId: string) {
			const dto: getCertificationUnitDto = { certificationId };
			const res: getCertificationUnitRes = await request.get(CERTIFICATION_UNIT_PATH, { dto });
			this.certificationUnitList = res;
		},
		pick(target: CertificationUnit) {
			this.certificationEditor = cloneDeep(target);
		},
		getSchema() {
			const schema: CertificationUnit = getSchema();
			return schema;
		},
		setSchema() {
			this.certificationEditor = this.getSchema();
		},
	},
});

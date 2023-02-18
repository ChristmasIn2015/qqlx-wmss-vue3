import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import {} from "qqlx-core";
import type { Fee } from "qqlx-core/schema/wmss/fee";

import { getMongodbBase, request } from "@/utils";

function getSchema(): Fee {
	return {
		orderId: "",
		name: "",
		desc: "",
		amount: 0,
		...getMongodbBase(),
	};
}

export const useFeeStore = defineStore("Fee", {
	state: () => ({
		feeEditor: getSchema(),
		feeList: [] as Fee[],
		feeListPicked: [] as Fee[],
	}),
	actions: {
		getSchema() {
			const schema: Fee = getSchema();
			return schema;
		},
		setSchema(entity?: Fee) {
			const schema = entity ? cloneDeep(entity) : this.getSchema();

			this.feeEditor = schema;
			this.feeListPicked = [];
		},
	},
});

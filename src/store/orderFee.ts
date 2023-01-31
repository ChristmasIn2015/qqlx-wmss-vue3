import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { ENUM_SYSTEM_ROLE, ENUM_PROJECT, USER_PATH } from "qqlx-core";
import {} from "qqlx-core/wmss/orderFee/dto";
import { User } from "qqlx-core/user/entity";
import { OrderFee } from "qqlx-core/wmss/orderFee/entity";

import { getMongodbBase, request } from "./utils";

function getSchema(): OrderFee {
	return {
		orderId: "",
		name: "",
		desc: "",
		amount: 0,
		...getMongodbBase(),
	};
}

export const useOrderFeeStore = defineStore("OrderFee", {
	state: () =>
		({
			orderFeeEditor: getSchema(),
			orderFeeList: [],
		} as {
			orderFeeEditor: OrderFee;
			orderFeeList: OrderFee[];
		}),
	actions: {
		getSchema() {
			const schema: OrderFee = getSchema();
			return schema;
		},
		setSchema() {
			this.orderFeeEditor = this.getSchema();
		},
	},
});

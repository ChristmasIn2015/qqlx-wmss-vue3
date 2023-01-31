import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { MongodbPage } from "qqlx-core/utils/database";
import { ENUM_SYSTEM_ROLE, ENUM_PROJECT, USER_PATH, SCHEDULE_CARD_PATH, ENUM_STATUS_WECHAT } from "qqlx-core";
import {
	postScheduleCardOrderDto,
	postScheduleCardOrderRes,
	getScheduleCardOrderDto,
	getScheduleCardOrderRes,
	patchScheduleCardOrderDto,
	patchScheduleCardOrderRes,
} from "qqlx-core/pay/dto";
import { User } from "qqlx-core/user/entity";
import { ScheduleCardOrderJoined } from "qqlx-core/pay/dto";
import { ScheduleCardOrder } from "qqlx-core/pay/entity";

import { getMongodbBase, request, getPage } from "./utils";

export const useScheduleCardOrderStore = defineStore("ScheduleCardOrder", {
	state: () =>
		({
			scheduleCardEditor: {
				subjectId: "",
				cardId: "",
				statusWeChatPay: ENUM_STATUS_WECHAT.NOTPAY,
				...getMongodbBase(),
			},
			scheduleCardOrderList: [],
			page: getPage(),
			total: 0,
		} as {
			scheduleCardEditor: ScheduleCardOrder;
			scheduleCardOrderList: ScheduleCardOrderJoined[];
			page: MongodbPage;
			total: number;
		}),
	actions: {
		async get() {
			const dto: getScheduleCardOrderDto = { page: this.page };
			const res: getScheduleCardOrderRes = await request.get(SCHEDULE_CARD_PATH, { dto });
			this.scheduleCardOrderList = res.list;
			this.total = res.total;
		},
		async post() {
			const dto: postScheduleCardOrderDto = this.scheduleCardEditor;
			const res: postScheduleCardOrderRes = await request.post(SCHEDULE_CARD_PATH, { dto });
			await this.get();
		},
		async patch() {
			const dto: patchScheduleCardOrderDto = null;
			const res: patchScheduleCardOrderRes = await request.patch(SCHEDULE_CARD_PATH);
			await this.get();
		},
		getSchema() {
			const schema: ScheduleCardOrder = {
				subjectId: "",
				cardId: "",
				statusWeChatPay: ENUM_STATUS_WECHAT.NOTPAY,
				...getMongodbBase(),
			};
			return schema;
		},
		setSchema() {
			this.scheduleCardEditor = this.getSchema();
		},
	},
});

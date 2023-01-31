import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { ENUM_SYSTEM_ROLE, ENUM_PROJECT, USER_PATH, SCHEDULE_CARD_PATH } from "qqlx-core";
import {
	postScheduleCardDto,
	postScheduleCardRes,
	getScheduleCardDto,
	getScheduleCardRes,
	patchScheduleCardDto,
	patchScheduleCardRes,
} from "qqlx-core/pay/dto";
import { User } from "qqlx-core/user/entity";
import { ScheduleCard } from "qqlx-core/pay/entity";

import { getMongodbBase, request } from "./utils";

function getSchema(): ScheduleCard {
	return {
		projectEnum: ENUM_PROJECT.QQLX_KDBGS,
		isDisabled: false,
		title: "",
		desc: "",
		schedule: 0,
		amount: 0,
		...getMongodbBase(),
	};
}

export const useScheduleCardStore = defineStore("ScheduleCard", {
	state: () =>
		({
			scheduleCardEditor: getSchema(),
			scheduleCardList: [],
		} as {
			scheduleCardEditor: ScheduleCard;
			scheduleCardList: ScheduleCard[];
		}),
	actions: {
		async get() {
			const dto: getScheduleCardDto = this.scheduleCardEditor;
			const res: getScheduleCardRes = await request.get(SCHEDULE_CARD_PATH);
			this.scheduleCardList = res;
		},
		async post() {
			const dto: postScheduleCardDto = this.scheduleCardEditor;
			const res: postScheduleCardRes = await request.post(SCHEDULE_CARD_PATH, { dto });
			await this.get();
		},
		async patch() {
			const dto: patchScheduleCardDto = this.scheduleCardEditor;
			const res: patchScheduleCardRes = await request.patch(SCHEDULE_CARD_PATH, { dto });
			await this.get();
		},
		getSchema() {
			const schema: ScheduleCard = getSchema();
			return schema;
		},
		setSchema() {
			this.scheduleCardEditor = this.getSchema();
		},
	},
});

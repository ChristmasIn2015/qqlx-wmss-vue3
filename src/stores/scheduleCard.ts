import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { PATH_SCHEDULE_CARD, ENUM_PROJECT } from "qqlx-core";
import type { getScheduleCardDto, getScheduleCardRes } from "qqlx-core/dto/market/scheduleCard";
import type { ScheduleCard } from "qqlx-core/schema/market/scheduleCard";

import { getMongodbBase, request } from "@/utils";
import { useNotifyStore } from "@/stores/notify";
const NotifyStore = useNotifyStore();

function getSchema(): ScheduleCard {
	return {
		title: "",
		desc: "",
		scope: ENUM_PROJECT.QQLX_GCBGS,
		schedule: 0,
		amount: 0,
		isDisabled: false,
		...getMongodbBase(),
	};
}
export const useScheduleCardStore = defineStore({
	id: "ScheduleCard",
	state: () => ({
		list: [] as ScheduleCard[],
	}),
	actions: {
		async get() {
			try {
				const dto: getScheduleCardDto = { scope: ENUM_PROJECT.QQLX_GCBGS };
				const res: getScheduleCardRes = await request.get(PATH_SCHEDULE_CARD, { dto });
				this.list = res;
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		getSchema() {
			const schema: ScheduleCard = getSchema();
			return schema;
		},
		setSchema(entity?: ScheduleCard) {
			const schema = entity ? cloneDeep(entity) : this.getSchema();
			this.editor = schema;
		},
	},
});

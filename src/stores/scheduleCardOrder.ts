import { defineStore } from "pinia";
import { cloneDeep } from "lodash";
import QrCode from "qrcode";

import { PATH_SCHEDULE_CARD_ORDER, ENUM_PROJECT, ENUM_PAY_STATUS_WECHAT } from "qqlx-core";
import type {
	getScheduleCardOrderDto,
	getScheduleCardOrderRes,
	postScheduleCardOrderDto,
	postScheduleCardOrderRes,
	patchScheduleCardOrderDto,
	patchScheduleCardOrderRes,
} from "qqlx-core/dto/market/scheduleCardOrder";
import type { ScheduleCard } from "qqlx-core/schema/market/scheduleCard";
import type { ScheduleCardOrder } from "qqlx-core/schema/market/scheduleCardOrder";
import type { ScheduleCardOrderJoined } from "qqlx-core/dto/market/scheduleCardOrder";

import { getMongodbBase, request, getPage } from "@/utils";
import { useNotifyStore } from "@/stores/notify";
import { useAnalysisStore } from "@/stores/analysis";
const NotifyStore = useNotifyStore();
const AnalysisStore = useAnalysisStore();

function getSchema(): ScheduleCardOrder {
	return {
		corpId: "",
		cardId: "",
		statusWeChatPay: ENUM_PAY_STATUS_WECHAT.NOTPAY,
		amount: 0,
		...getMongodbBase(),
	};
}
export const useScheduleCardOrderStore = defineStore({
	id: "ScheduleCardOrder",
	state: () => ({
		list: [] as ScheduleCardOrderJoined[],
		page: getPage(999),
		total: 0,
		loadding: false,
		//
		dialog: false,
		WeChatPayUrl: "",
	}),
	actions: {
		async get(page: number = 1) {
			try {
				this.loadding = true;
				this.page.page = page;
				const corpId = localStorage.getItem("qqlx-corp-id") as string;
				await this.patch();
				await AnalysisStore.get();

				const dto: getScheduleCardOrderDto = { page: this.page, corpId };
				const res: getScheduleCardOrderRes = await request.get(PATH_SCHEDULE_CARD_ORDER, { dto });

				this.list = res.list;
				this.total = res.total;
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		async post(card: ScheduleCard) {
			try {
				this.loadding = true;
				const corpId = localStorage.getItem("qqlx-corp-id") as string;
				const schema = this.getSchema();
				schema.cardId = card._id;
				const dto: postScheduleCardOrderDto = { schema, corpId };
				const res: postScheduleCardOrderRes = await request.post(PATH_SCHEDULE_CARD_ORDER, { dto });

				this.WeChatPayUrl = await QrCode.toDataURL(res);
				this.dialog = true;
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			} finally {
				this.loadding = false;
			}
		},
		async patch() {
			const corpId = localStorage.getItem("qqlx-corp-id") as string;
			const dto: patchScheduleCardOrderDto = { corpId };
			const res: patchScheduleCardOrderRes = await request.patch(PATH_SCHEDULE_CARD_ORDER, { dto });
		},
		getSchema() {
			const schema: ScheduleCardOrder = getSchema();
			return schema;
		},
		setSchema(entity?: ScheduleCard) {
			const schema = entity ? cloneDeep(entity) : this.getSchema();
			// this.editor = schema;
		},
	},
});

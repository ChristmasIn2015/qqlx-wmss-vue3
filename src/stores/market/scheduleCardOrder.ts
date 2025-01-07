import { defineStore } from "pinia";
import { cloneDeep } from "lodash";
import QrCode from "qrcode";

import { getMongodbBase, getPage, MongodbSort } from "qqlx-cdk";
import { ENUM_PROJECT, PATH_MARKET_CARD_ORDER, ENUM_PAY_STATUS_WECHAT } from "qqlx-core";

import type {
  getScheduleCardOrderDto,
  getScheduleCardOrderRes,
  postScheduleCardOrderDto,
  postScheduleCardOrderRes,
  patchScheduleCardOrderDto,
  patchScheduleCardOrderRes,
  ScheduleCard,
  ScheduleCardOrder,
  ScheduleCardOrderJoined,
} from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useAnalysisStore } from "@/stores/wmss/analysis";
import { getPage2 } from "@/lib/time";
const NotifyStore = useNotifyStore();
// const AnalysisStore = useAnalysisStore();

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
    page: getPage2(),
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
        // await AnalysisStore.get();

        const dto: getScheduleCardOrderDto = { page: this.page, corpId };
        const res: getScheduleCardOrderRes = await request.get(PATH_MARKET_CARD_ORDER, { dto });

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
        const res: postScheduleCardOrderRes = await request.post(PATH_MARKET_CARD_ORDER, { dto });

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
      const res: patchScheduleCardOrderRes = await request.patch(PATH_MARKET_CARD_ORDER, { dto });
    },
    getSchema() {
      const schema: ScheduleCardOrder = getSchema();
      return schema;
    },
    setEditor(entity?: ScheduleCard) {
      const schema = entity ? cloneDeep(entity) : this.getSchema();
      // this.editor = schema;
    },
  },
});

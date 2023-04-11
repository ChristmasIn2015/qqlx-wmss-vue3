import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { getMongodbBase, getPage, MongodbSort } from "qqlx-cdk";
import { ENUM_PROJECT, PATH_MARKET_CARD } from "qqlx-core";

import type { getScheduleCardDto, getScheduleCardRes, ScheduleCard } from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
const NotifyStore = useNotifyStore();

function getSchema(): ScheduleCard {
    return {
        title: "",
        desc: "",
        scope: ENUM_PROJECT.KDBGS,
        schedule: 0,
        amount: 0,
        isDisabled: false,
        ...getMongodbBase(),
    };
}
export const useScheduleCardStore = defineStore({
    id: "ScheduleCard",
    state: () => ({
        editor: getSchema(),
        list: [] as ScheduleCard[],
    }),
    actions: {
        async get() {
            try {
                const dto: getScheduleCardDto = { scope: ENUM_PROJECT.KDBGS };
                const res: getScheduleCardRes = await request.get(PATH_MARKET_CARD, { dto });
                this.list = res;
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        getSchema() {
            const schema: ScheduleCard = getSchema();
            return schema;
        },
        setEditor(entity?: ScheduleCard) {
            const schema = entity ? cloneDeep(entity) : this.getSchema();
            this.editor = schema;
        },
    },
});

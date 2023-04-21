import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { getMongodbBase, getPage, MongodbSort } from "qqlx-cdk";
import { ENUM_INTRO, PATH_INTRO_GROUP, ENUM_PROJECT, PATH_LOG, type Intro } from "qqlx-core";

import type { IntroGroup, IntroGroupJoined, getIntroGroupDto, getIntroGroupRes } from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
const NotifyStore = useNotifyStore();

function getSchema(): IntroGroup {
    return {
        scope: ENUM_PROJECT.KDBGS,
        path: "",
        actions: "",
        ...getMongodbBase(),
    };
}
export const useIntroGroupStore = defineStore({
    id: "IntroGroup",
    state: () => ({
        search: getSchema(),
        list: [] as IntroGroupJoined[],
        listMatched: [] as IntroGroupJoined[],
        picked: getSchema(),

        swiperIndex: 0,
        dialog: false,
    }),
    actions: {
        /** @view catch */
        async get(path: string) {
            try {
                const dto: getIntroGroupDto = { search: this.search };
                const res: getIntroGroupRes = await request.get(PATH_INTRO_GROUP, { dto });
                this.listMatched = res.filter((e) => e.path.includes(path || ""));
                this.list = res.filter((e) => !e.path.includes(path || ""));
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        pick(entity: IntroGroupJoined) {
            this.picked = cloneDeep(entity);
            this.dialog = true;
        },
    },
});

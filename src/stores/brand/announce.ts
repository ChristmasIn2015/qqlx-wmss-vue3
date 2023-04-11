import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { getMongodbBase } from "qqlx-cdk";
import { PATH_BRAND_ANNOUNCE } from "qqlx-core";
import type {
    getAnnounceDto,
    getAnnounceRes,
    postAnnounceDto,
    postAnnounceRes,
    patchAnnounceDto,
    patchAnnounceRes,
    deleteAnnounceDto,
    deleteAnnounceRes,
    Announce,
} from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";

const NotifyStore = useNotifyStore();

function getSchema(): Announce {
    return {
        corpId: "",
        content: "",
        ...getMongodbBase(),
    };
}

export const useAnnounceStore = defineStore("AnnounceStore", {
    state: () => ({
        editor: getSchema() as Announce,
        list: [] as Announce[],
        loadding: false,
    }),
    actions: {
        async get() {
            const dto: getAnnounceDto = null;
            const res: getAnnounceRes = await request.get(PATH_BRAND_ANNOUNCE);
            this.list = res;
        },
        /** @viewcatch */
        async post() {
            try {
                this.loadding = true;
                const dto: postAnnounceDto = this.editor;
                const res: postAnnounceRes = await request.post(PATH_BRAND_ANNOUNCE, { dto });
                await this.get();

                this.setEditor();
                NotifyStore.success("创建成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
        /** @viewcatch */
        async patch(entity: Announce) {
            try {
                this.loadding = true;
                const dto: patchAnnounceDto = entity;
                const res: patchAnnounceRes = await request.patch(PATH_BRAND_ANNOUNCE, { dto });
                await this.get();

                this.setEditor();
                NotifyStore.success("修改成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
        /** @viewcatch */
        async delete(entity: Announce) {
            try {
                const dto: deleteAnnounceDto = entity;
                const res: deleteAnnounceRes = await request.delete(PATH_BRAND_ANNOUNCE, { dto });
                await this.get();

                this.setEditor();
                NotifyStore.success("删除成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        getSchema() {
            const schema: Announce = getSchema();
            return schema;
        },
        setEditor(entity?: Announce) {
            const schema = cloneDeep(entity || this.getSchema());
            this.editor = schema;
        },
    },
});

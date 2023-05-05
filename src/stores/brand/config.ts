import { defineStore } from "pinia";
import { cloneDeep } from "lodash";
import { Notify, useQuasar } from "quasar";

import { getMongodbBase } from "qqlx-cdk";
import { ENUM_POUNDS_FORMULA, MAP_ENUM_POUNDS_FORMULA, ENUM_LAYOUT_CABINET, MAP_ENUM_LAYOUT_CABINET, PATH_BRAND_CONFIG } from "qqlx-core";
import type { Config, postConfigDto, postConfigRes, getConfigDto, getConfigRes } from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";

const NotifyStore = useNotifyStore();
function getSchema(): Config {
    return {
        corpId: "",
        titles: "",
        confirmAuto: true,
        ...getMongodbBase(),
    };
}

export const useConfigStore = defineStore("ConfigStore", {
    state: () => ({
        editor: getSchema() as Config,
        titles: [] as { text: string }[],
        loadding: false,
    }),
    actions: {
        /** @viewcatch */
        async get() {
            try {
                const dto: getConfigDto = null;
                const res: getConfigRes = await request.get(PATH_BRAND_CONFIG);
                this.editor = res;

                const titles = res.titles
                    .split(",")
                    .filter((e) => e)
                    .map((e: string) => ({ text: e }));

                if (titles.length === 0) this.titles = [{ text: "" }];
                else this.titles = titles;
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
        /** @viewcatch */
        async post(title?: string) {
            try {
                this.loadding = true;
                title && this.titles.push({ text: title });
                this.editor.titles = this.titles.map((e) => e.text).toString();
                const dto: postConfigDto = this.editor;
                const res: postConfigRes = await request.post(PATH_BRAND_CONFIG, { dto });

                NotifyStore.success("保存成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
                this.get();
            }
        },
        getSchema() {
            const schema: Config = getSchema();
            return schema;
        },
        setEditor(entity?: Config) {
            const schema = cloneDeep(entity || this.getSchema());
            this.editor = schema;
        },
    },
});

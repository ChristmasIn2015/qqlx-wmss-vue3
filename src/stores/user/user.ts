import { defineStore } from "pinia";

import { getMongodbBase } from "qqlx-cdk";
import { PATH_USER_WECHAT } from "qqlx-core";
import type { postUserWeChatDto, postUserWeChatRes, getUserWeChatDto, getUserWeChatRes, patchUserWeChatDto, patchUserWeChatRes, UserInfo } from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";
const NotifyStore = useNotifyStore();

function getSchema(): UserInfo {
    return {
        userId: "",
        phone: "",
        nickname: "",
        avator: "",
        ...getMongodbBase(),
    };
}
export const useUserStore = defineStore("User", {
    state: () => ({
        wxLoginModal: false,
        wxLoginQrCode: "",

        wxAvatorDefault: "https://pic4.zhimg.com/50/v2-6afa72220d29f045c15217aa6b275808_hd.jpg?source=1940ef5c",
        userEditor: getSchema() as UserInfo,
    }),
    actions: {
        /** 仅仅根据微信授权码返回用户信息 */
        async get(wechatResponseCode: string): Promise<postUserWeChatRes> {
            const dto: postUserWeChatDto = { wechatResponseCode };
            const res: postUserWeChatRes = await request.post(PATH_USER_WECHAT, { dto });

            return res;
        },
        /** 根据微信授权码进行登陆 */
        async post(wechatResponseCode: string): Promise<postUserWeChatRes> {
            const res = await this.get(wechatResponseCode);

            if (res.jwt) localStorage.setItem("qqlx-token", res.jwt);
            else localStorage.setItem("qqlx-token", "");
            return res;
        },
        async transformAuthorization() {
            this.setEditor();
            const dto: getUserWeChatDto = null;
            const res: getUserWeChatRes = await request.get(PATH_USER_WECHAT, { dto });
            this.userEditor = res;
        },
        async patch() {
            try {
                const dto: patchUserWeChatDto = this.userEditor;
                await request.patch(PATH_USER_WECHAT, { dto });
                await this.transformAuthorization();
                NotifyStore.success("修改成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        getSchema() {
            const schema = getSchema();
            return schema;
        },
        setEditor() {
            this.userEditor = this.getSchema();
        },
    },
});

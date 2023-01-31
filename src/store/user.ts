import { defineStore } from "pinia";

import { ENUM_SYSTEM_ROLE, USER_PATH } from "qqlx-core";
import { postUserWeChatDto, postUserWeChatRes, getUserDto, getUserRes, patchUserDto, patchUserRes } from "qqlx-core/user/dto";
import { User } from "qqlx-core/user/entity";

import { getMongodbBase, request } from "./utils";
import { useSnackbarStore } from "@/store/snackbar";

const SnackbarStore = useSnackbarStore();

function getSchema(): User {
	return {
		nickname: "",
		avator: "",
		phone: "",
		contact: "",
		systemRole: ENUM_SYSTEM_ROLE.NORMAL,
		...getMongodbBase(),
	};
}

export const useUserStore = defineStore("User", {
	state: () => ({
		wxLoginModal: false,
		wxLoginQrCode: "",

		wxAvatorDefault: "https://pic4.zhimg.com/50/v2-6afa72220d29f045c15217aa6b275808_hd.jpg?source=1940ef5c",
		userEditor: getSchema() as User,
	}),
	actions: {
		// 获取用户信息
		async setUserInfo() {
			this.setSchema();
			const res: getUserRes = await request.get(USER_PATH);
			const user = res.list[0];
			this.userEditor = user;
		},
		// 登录
		async post(wechatResponseCode: string) {
			try {
				const dto: postUserWeChatDto = { wechatResponseCode };
				const res: postUserWeChatRes = await request.post(USER_PATH, { dto });
				localStorage.setItem("qqlx-token", res.jwt);
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			} finally {
				window.location.assign(location.pathname);
			}
		},
		// 修改用户信息
		async patch() {
			try {
				const dto: patchUserDto = this.userEditor;
				await request.patch(USER_PATH, { dto });
				await this.setUserInfo();
				SnackbarStore.setSuccess("修改成功");
			} catch (error) {
				SnackbarStore.setFail((error as Error).message);
			}
		},
		getSchema() {
			const schema: User = getSchema();
			return schema;
		},
		setSchema() {
			this.userEditor = this.getSchema();
		},
		dialogLogin() {
			this.wxLoginModal = true;
		},
	},
});

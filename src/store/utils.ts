import axios from "axios";
import * as XLSX from "xlsx";

import { MongodbPage } from "qqlx-core/utils/database";
import { ResponseREST } from "qqlx-core/utils/interface";
import { useUserStore } from "@/store/user";

declare global {
	interface Window {
		WxLogin: any;
	}
}

class Request {
	private localAxios;

	constructor() {
		this.localAxios = axios.create({});
		this.localAxios.interceptors.request.use(function (config) {
			config.headers["Content-Type"] = "application/json";
			config.headers["Authorization"] = localStorage.getItem("qqlx-token") || "";
			config.headers["qqlx-subject-id"] = localStorage.getItem("qqlx-subject-id") || "";
			return config;
		});
		this.localAxios.interceptors.response.use(function (response) {
			if (response.status === 200 && ["40301", "40302"].includes(response.data?.code)) {
				localStorage.setItem("qqlx-token", "");
				const UserStore = useUserStore();
				UserStore.dialogLogin();

				if (window.document.getElementById("wx-login")) {
					const WxLogin = window.WxLogin as any;
					WxLogin &&
						new WxLogin({
							id: "wx-login",
							appid: "wxd0e6ee13822ccb7f",
							scope: "snsapi_login",
							redirect_uri: "http://qqlx.tech",
							state: "LOGIN",
						});
				}
			}
			return response;
		});
	}

	async get(url: string, body?: any) {
		let result = await this.localAxios.post(url + "/get", body);
		const responseREST = result.data as ResponseREST<any>;
		if (responseREST.code === "200") return responseREST.data;
		else {
			throw new Error(responseREST.message);
		}
	}

	async post(url: string, body?: any) {
		let result = await this.localAxios.post(url, body);
		const responseREST = result.data as ResponseREST<any>;
		if (responseREST.code === "200") return responseREST.data;
		else {
			throw new Error(responseREST.message);
		}
	}

	async patch(url: string, body?: any) {
		let result = await this.localAxios.patch(url, body);
		const responseREST = result.data as ResponseREST<any>;
		if (responseREST.code === "200") return responseREST.data;
		else {
			throw new Error(responseREST.message);
		}
	}

	async put(url: string, body?: any) {
		let result = await this.localAxios.put(url, body);
		const responseREST = result.data as ResponseREST<any>;
		if (responseREST.code === "200") return responseREST.data;
		else {
			throw new Error(responseREST.message);
		}
	}

	async delete(url: string, body?: any) {
		let result = await this.localAxios.post(url + "/delete", body);
		const responseREST = result.data as ResponseREST<any>;
		if (responseREST.code === "200") return responseREST.data;
		else {
			throw new Error(responseREST.message);
		}
	}
}

export const request = new Request();

export function getMongodbBase() {
	return {
		_id: "",
		timeCreate: 0,
		timeCreateString: "",
		timeUpdate: 0,
		timeUpdateString: "",
	};
}
export function getPage(pageSize = 20): MongodbPage {
	const page = {
		page: 1,
		pageSize,
		startTime: 0,
		endTime: Date.now() + 1000 * 60 * 60,
	};
	const date = new Date();
	const year = date.getFullYear();
	page.startTime = new Date(`${year}/01/01 00:00`).getTime();
	return page;
}

export function download() {
	let workbook = XLSX.utils.book_new();

	const Sheet0 = XLSX.utils.aoa_to_sheet([
		["@产地", "@材质", "@序号", "@日期", "@品名", "@规格", "@重量/吨", "@数量", "@单价/元", "@客户", "@备注", "@@请勿更改标题头部@@"],
		["马鞍山", "FEAT", "A0001", "2023-01-01", "无花大板", "1.0*1250*C", "10", "1", "6300", "宝钢集团有限公司", ""],
		["马鞍山", "FEAT", "A0001", "2023-01-10", "无花大板", "1.0*1250*C", "10", "1", "6300", "宝钢集团有限公司", ""],
		["马鞍山", "FEAT", "A0001", "2023-01-15", "无花大板", "1.0*1250*C", "10", "1", "6300", "宝钢集团有限公司", ""],
		["马鞍山", "FEAT", "A0001", "2023-01-20", "无花大板", "1.0*1250*C", "10", "1", "6300", "宝钢集团有限公司", ""],
	]);
	XLSX.utils.book_append_sheet(workbook, Sheet0, "商品导入");

	const Sheet1 = XLSX.utils.aoa_to_sheet([
		["@客户名称", "@联系方式", "@备注", "@@请勿更改标题头部@@"],
		["中信泰富特钢集团股份有限公司", "0510-80673288", "tftg"],
		["中国建筑上海设计研究院有限公司", "021-62858180", "zgjz"],
		["首页-鞍山钢铁集团有限公司", "0412-6734881", "asgt"],
		["宝钢集团有限公司", "021-58350000", "bg"],
	]);
	XLSX.utils.book_append_sheet(workbook, Sheet1, "客户导入");

	const Sheet2 = XLSX.utils.aoa_to_sheet([
		["@收款银行", "@客户名称", "@日期", "@金额", "@备注", "@@请勿更改标题头部@@"],
		["中国银行", "中国建筑上海设计研究院有限公司", "2022-3-1", "200000"],
		["农业银行", "中国建筑上海设计研究院有限公司", "2022-4-10", "14000"],
		["建设银行", "中信泰富特钢集团股份有限公司", "2022-6-1", "1000"],
		["招商银行", "中信泰富特钢集团股份有限公司", "2022-6-1", "2000"],
	]);
	XLSX.utils.book_append_sheet(workbook, Sheet2, "资金导入");

	// let result = []
	// let TEMP1 = ['有花', '无花', '冷', '酸洗', '镀锌'].map((Name1) => {
	//     let TEMP2 = ['小板', '大板', '超大板'].map((Name2) => {
	//         let TEMP3 = ['1000', '1250', '1500'].map((Norm2) => {
	//             let Norm1 = 0.5
	//             let TEMP4 = Array(6)
	//                 .fill(null)
	//                 .map((Norm11) => {
	//                     result.push([Name1 + Name2, `${(Norm1 += 0.5).toFixed(1)}*${Norm2}*C`])
	//                 })
	//         })
	//     })
	// })
	// let Sheet2 = XLSX.utils.aoa_to_sheet([['品名', '规格', '<- 请勿更改标题头部']].concat(result))
	// XLSX.utils.book_append_sheet(workbook, Sheet2, '销售模板导入')

	XLSX.writeFile(workbook, "清泉流响-批量导入模板.xlsx");
}

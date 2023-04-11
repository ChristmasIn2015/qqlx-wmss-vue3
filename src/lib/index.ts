import axios from "axios";
import * as XLSX from "xlsx";

import type { Response } from "qqlx-cdk";
import { ENUM_ERROR_CODE } from "qqlx-core";

declare global {
    interface Window {
        WxLogin: any;
        loginTimer: any;
    }
}

class Request {
    private localAxios;

    constructor() {
        this.localAxios = axios.create({});
        this.localAxios.interceptors.request.use(function (config) {
            config.headers["Content-Type"] = "application/json";
            config.headers["Authorization"] = localStorage.getItem("qqlx-token") || "";
            config.headers["qqlx-corp-id"] = localStorage.getItem("qqlx-corp-id") || "";
            return config;
        });
        this.localAxios.interceptors.response.use(function (response) {
            if ([200, 201].includes(response.status)) {
                switch (response.data?.code) {
                    case ENUM_ERROR_CODE.UNAUTHORIZED_USER: {
                        localStorage.setItem("qqlx-token", "");
                        setTimeout(() => location.assign("/wmss/login"), 2000);
                        break;
                    }
                    case ENUM_ERROR_CODE.SCHEDULE_MARKET_BELOW: {
                        setTimeout(() => location.assign("/wmss/system/pay"), 2000);
                        break;
                    }
                }
            }
            return response;
        });
    }

    async get(url: string, body?: any) {
        let result = await this.localAxios.post(url + "/get", body);
        const response = result.data as Response<any>;
        if (response.code !== 200) throw new Error(response.message);
        return response.data;
    }

    async post(url: string, body?: any) {
        let result = await this.localAxios.post(url, body);
        const response = result.data as Response<any>;
        if (response.code !== 200) throw new Error(response.message);
        return response.data;
    }

    async patch(url: string, body?: any) {
        let result = await this.localAxios.patch(url, body);
        const response = result.data as Response<any>;
        if (response.code !== 200) throw new Error(response.message);
        return response.data;
    }

    async put(url: string, body?: any) {
        let result = await this.localAxios.put(url, body);
        const response = result.data as Response<any>;
        if (response.code !== 200) throw new Error(response.message);
        return response.data;
    }

    async delete(url: string, body?: any) {
        let result = await this.localAxios.post(url + "/delete", body);
        const response = result.data as Response<any>;
        if (response.code !== 200) throw new Error(response.message);
        return response.data;
    }
}

export const request = new Request();

import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { MongodbSort, getMongodbBase, getPage, getTime } from "qqlx-cdk";
import { ENUM_BOOK_TYPE, ENUM_BOOK_DIRECTION, PATH_BOOK } from "qqlx-core";
import type {
    postBookDto,
    postBookRes,
    getBookDto,
    getBookRes,
    putBookDto,
    putBookRes,
    deleteBookDto,
    deleteBookRes,
    BookJoined,
    Order,
    Book,
} from "qqlx-core";

import { request } from "@/lib";
import { useNotifyStore } from "@/stores/quasar/notify";

const NotifyStore = useNotifyStore();

function getSchema(): Book {
    return {
        corpId: "",
        type: ENUM_BOOK_TYPE.YSZK,
        direction: ENUM_BOOK_DIRECTION.DAI,

        code: "",
        remark: "",
        amount: 0,
        isDisabled: false,

        keyCode: "",
        keyOrigin: "",
        keyHouse: "",

        amountBookOfOrder: 0,
        amountBookOfOrderRest: 0,
        ...getMongodbBase(),
    };
}

export const useBookStore = defineStore("Book", {
    state: () => ({
        search: getSchema() as Book,
        editor: getSchema() as BookJoined,
        list: [] as BookJoined[],
        listExcel: [] as Book[],

        sortKey: "timeCreate",
        sortValue: MongodbSort.DES,
        page: getPage(),
        timeQuasarPicked: { from: `${new Date().getFullYear()}/01/01`, to: new Date().toLocaleString().split(" ")[0] },
        total: 0,
        amountTotal: 0,
        loadding: false,

        // 仅仅用于开发票
        listPicked: [] as BookJoined[],
    }),
    actions: {
        /** @viewcatch */
        async get(page?: number) {
            try {
                // 分页
                if (page && page > 0) this.page.page = page;
                this.loadding = true;

                // 数据加载
                const dto: getBookDto = {
                    page: this.page,
                    search: this.search,
                    sortKey: this.sortKey,
                    sortValue: this.sortValue,
                };
                const res: getBookRes = await request.get(PATH_BOOK, { dto });
                this.list = res.list;

                this.total = res.total;
                this.amountTotal = (res.group?.amount || 0) / 100;
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.loadding = false;
            }
        },
        sort(sortKey: string) {
            if (sortKey) {
                this.sortKey = sortKey;
            } else {
                this.sortKey = "timeCreate";
            }
            this.sortValue = this.sortValue === MongodbSort.DES ? MongodbSort.ASC : MongodbSort.DES;
            this.get(1); // async
        },
        /** @viewcatch */
        async post(entity?: Book) {
            const entitys: Book[] = [];
            try {
                const excels = cloneDeep(entity ? [entity] : this.listExcel);
                while (excels.length > 0) {
                    excels.forEach((e) => {
                        e.type = this.editor.type;
                        e.direction = this.editor.direction;
                    });
                    const dto: postBookDto = { excels: excels.splice(0, 80) };
                    const res: postBookRes = await request.post(PATH_BOOK, { dto });
                    entitys.push(...res);
                }
                await this.get(1);

                NotifyStore.success("添加成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            } finally {
                this.listExcel = [];
                return entitys;
            }
        },
        async put(entity?: Book, orders?: Order[], books?: Book[]) {
            const _entity = entity || this.editor;
            const dto: putBookDto = { entity: _entity, orders };
            const res: putBookRes = await request.put(PATH_BOOK, { dto });

            this.setEditor();
            NotifyStore.success("修改成功");
        },
        async delete(books: Book[]) {
            try {
                const dto: deleteBookDto = { bookIds: (books || []).map((e) => e._id) };
                const res: deleteBookRes = await request.delete(PATH_BOOK, { dto });

                await this.get(1);
                NotifyStore.success("删除成功");
            } catch (error) {
                NotifyStore.fail((error as Error).message);
            }
        },
        getSchema(option: { type: ENUM_BOOK_TYPE; direction: ENUM_BOOK_DIRECTION } = { type: ENUM_BOOK_TYPE.YSZK, direction: ENUM_BOOK_DIRECTION.DAI }) {
            const schema: Book = getSchema();

            schema.type = option.type;
            schema.direction = option.direction;
            schema.timeCreate = Date.now();
            schema.timeCreateString = getTime(schema.timeCreate).text;
            return schema;
        },
        setEditor(entity?: Book) {
            const schema = entity ? cloneDeep(entity) : this.getSchema();
            this.editor = schema;
        },
    },
});

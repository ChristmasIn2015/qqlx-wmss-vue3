import { defineStore } from "pinia";
import { cloneDeep } from "lodash";

import { ENUM_BOOK_TYPE, ENUM_BOOK_DIRECTION, PATH_BOOK, MongodbSort } from "qqlx-core";
import type { postBookDto, postBookRes, getBookDto, getBookRes, putBookDto, putBookRes, deleteBookDto, deleteBookRes } from "qqlx-core/dto/wmss/book";
import type { BookInView } from "qqlx-core/dto/wmss/book";
import type { Order } from "qqlx-core/schema/wmss/order";
import type { Book } from "qqlx-core/schema/wmss/book";

import { getMongodbBase, request, getPage } from "@/utils";
import { useNotifyStore } from "@/stores/notify";
import { useOrderStore } from "@/stores/order";

const NotifyStore = useNotifyStore();
const OrderStore = useOrderStore();

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
		amountBookOfSelf: 0,
		amountBookOfSelfRest: 0,
		...getMongodbBase(),
	};
}

export const useBookStore = defineStore("Book", {
	state: () => ({
		bookSearch: getSchema() as Book,
		bookEditor: getSchema() as BookInView,
		bookList: [] as BookInView[],
		bookListExcel: [] as Book[],

		sortKey: "timeCreate",
		sortValue: MongodbSort.DES,
		page: getPage(),
		total: 0,
		loadding: false,

		// 仅仅用于开发票
		bookListPicked: [] as BookInView[],
	}),
	actions: {
		async get(page?: number) {
			try {
				// 分页
				if (page && page > 0) this.page.page = page;
				this.loadding = true;

				// 数据加载
				const dto: getBookDto = {
					page: this.page,
					search: this.bookSearch,
					sortKey: this.sortKey,
					sortValue: this.sortValue,
				};
				const res: getBookRes = await request.get(PATH_BOOK, { dto });
				this.bookList = this.page.page === 1 ? res.list : this.bookList.concat(res.list);
				this.total = res.total;

				if (res.list.length > 0) this.page.page++;
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
		async post() {
			try {
				const excels = cloneDeep(this.bookListExcel);
				while (excels.length > 0) {
					const dto: postBookDto = { excels: excels.splice(0, 80) };
					const res: postBookRes = await request.post(PATH_BOOK, { dto });
				}
				await this.get(1);

				this.setSchema();
				this.bookListExcel = [];
				NotifyStore.success("添加成功");
			} catch (error) {
				NotifyStore.fail((error as Error).message);
			}
		},
		async put(entity?: Book, orders?: Order[]) {
			const _entity = entity || this.bookEditor;
			const dto: putBookDto = { entity: _entity, orders };
			const res: putBookRes = await request.put(PATH_BOOK, { dto });

			this.setSchema();
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
		getSchema(type: ENUM_BOOK_TYPE = ENUM_BOOK_TYPE.YSZK, direction: ENUM_BOOK_DIRECTION = ENUM_BOOK_DIRECTION.DAI) {
			const schema: Book = getSchema();
			schema.type = type;
			schema.direction = direction;
			schema.timeCreate = Date.now();
			schema.timeCreateString = new Date().toLocaleString();
			return schema;
		},
		setSchema(entity?: Book) {
			const schema = entity ? cloneDeep(entity) : this.getSchema();
			this.bookEditor = schema;
			this.bookSearch = schema;
		},
	},
});
<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <span>采购清单</span>
            <dialog-intro></dialog-intro>
            <q-space></q-space>
        </div>
    </div>

    <div class="row q-mb-sm">
        <q-btn
            square
            class="q-mr-sm"
            label="最近删除"
            :color="OrderStore.search.isDisabled ? 'primary' : 'white'"
            :text-color="OrderStore.search.isDisabled ? '' : 'black'"
            @click="
                () => {
                    OrderStore.search.isDisabled = !OrderStore.search.isDisabled;
                    OrderStore.get(1);
                }
            "
        />
        <q-btn
            square
            class="q-mr-sm"
            label="可复核"
            :color="OrderStore.requireManagerId ? 'primary' : 'white'"
            :text-color="OrderStore.requireManagerId ? '' : 'black'"
            @click="
                () => {
                    OrderStore.requireManagerId = !OrderStore.requireManagerId;
                    OrderStore.get(1);
                }
            "
        />
        <q-btn
            square
            class="q-mr-sm"
            label="可结清"
            :color="OrderStore.requireAccounterId ? 'primary' : 'white'"
            :text-color="OrderStore.requireAccounterId ? '' : 'black'"
            @click="
                () => {
                    OrderStore.requireAccounterId = !OrderStore.requireAccounterId;
                    OrderStore.get(1);
                }
            "
        />
        <q-space></q-space>

        <q-btn class="q-ml-sm bg-white" :color="isInvoice ? 'purple' : ''" :text-color="isInvoice ? 'white' : 'primary'" square @click="isInvoice = !isInvoice">
            <q-icon v-if="isInvoice" name="visibility" class="q-mr-sm"></q-icon>

            <q-icon v-else name="visibility_off" class="q-mr-sm"></q-icon>
            {{ isInvoice ? "发票视角" : "付款视角" }}
            <q-tooltip class="text-body1">
                <div v-if="isInvoice">
                    <div>当前正在发票视角</div>
                    <div>您可以看到订单已经收到了哪些发票</div>
                </div>
                <div v-else>
                    <div>当前正在货款视角</div>
                    <div>您可以看到订单已经付给了哪些货款</div>
                </div>
            </q-tooltip>
        </q-btn>
        <q-btn v-if="isInvoice" square class="q-ml-sm bg-white" @click="$router.push('/wmss/finance/book-220202')"> 发票明细 </q-btn>
        <q-btn v-else square class="q-ml-sm bg-white" @click="$router.push('/wmss/finance/book-220201')"> 付款明细 </q-btn>

        <picker-range
            @change="
                ($event) => {
                    OrderStore.page.startTime = $event.startTime;
                    OrderStore.page.endTime = $event.endTime;
                    OrderStore.get(1);
                }
            "
        />
        <q-btn color="white" text-color="black" icon="more_vert" class="q-ml-sm">
            <q-menu>
                <q-item clickable @click="$router.push('/wmss/system/clue')">
                    <q-item-section>
                        <div><q-icon name="subject" class="q-mr-xs" size="22px"></q-icon>操作记录</div>
                    </q-item-section>
                </q-item>
                <q-item clickable @click="$router.push('/wmss/purchase/sku')">
                    <q-item-section>
                        <div><q-icon name="format_list_bulleted" class="q-mr-xs" size="22px"></q-icon>采购明细</div>
                    </q-item-section>
                </q-item>
                <q-item clickable @click="downloadOrderList()">
                    <q-item-section>
                        <div><q-icon name="get_app" class="q-mr-xs" size="18px"></q-icon>导出清单</div>
                    </q-item-section>
                </q-item>
            </q-menu>
        </q-btn>
    </div>

    <q-card>
        <q-table
            dense
            row-key="_id"
            style="min-height: 630px"
            :rows="OrderStore.list"
            :rows-per-page-options="[0]"
            :columns="[
                { name: 'timeCreateString', field: 'timeCreateString', label: '', align: 'left', style: NotifyStore.cellStyle },
                { name: 'code', field: 'code', label: '', align: 'left', style: NotifyStore.cellStyle },
                { name: 'contactId', field: 'contactId', label: '', align: 'left', style: NotifyStore.cellStyle },
                { name: 'amount', field: 'amount', label: '', style: NotifyStore.fontStyle + ';width: 155px;' },
                { name: 'amountBookOfOrder', field: 'amountBookOfOrder', label: '', style: NotifyStore.fontStyle + ';width: 155px;' },
                {
                    name: 'amountBookOfOrderRest',
                    field: 'amountBookOfOrderRest',
                    label: '',
                    align: 'left',
                    style: NotifyStore.fontStyle + ';width: 155px; padding-right: 48px;',
                },
                { name: '_id', field: '_id', label: '', align: 'left' },
                { name: 'remark', field: 'remark', label: '', align: 'left', style: NotifyStore.cellStyle },
            ]"
        >
            <template v-slot:header="props">
                <q-tr>
                    <q-th
                        class="text-left cursor-pointer"
                        :class="{ 'text-negative': OrderStore.sortKey === 'timeCreate' }"
                        @click="OrderStore.sort('timeCreate')"
                    >
                        <span>时间 </span>
                        <q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th key="code" :props="props" :style="NotifyStore.cellStyle">
                        <q-input
                            square
                            filled
                            dense
                            clearable
                            color="primary"
                            placeholder="搜索批次"
                            style="margin-left: -6px"
                            v-model="OrderStore.search.code"
                            @blur="OrderStore.get(1)"
                        />
                    </q-th>
                    <q-th key="contactId" :props="props" :style="NotifyStore.cellStyle">
                        <q-btn class="q-px-sm" flat square color="negative" style="margin-left: -6px" @click="contactDialog = true">
                            {{ contactPicked._id ? contactPicked.name : "点击筛选客户" }}
                        </q-btn>
                        <q-btn
                            v-if="contactPicked._id"
                            flat
                            square
                            padding="xs"
                            color="negative"
                            @click="
                                () => {
                                    contactPicked = ContactStore.getSchema();
                                    OrderStore.search.contactId = '';
                                    OrderStore.get(1);
                                }
                            "
                        >
                            <q-icon name="close"></q-icon>
                        </q-btn>
                    </q-th>
                    <q-th class="text-right cursor-pointer" :class="{ 'text-negative': OrderStore.sortKey === 'amount' }" @click="OrderStore.sort('amount')">
                        <span>清单金额</span>
                        <q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th
                        class="text-right cursor-pointer"
                        :class="{ 'text-negative': OrderStore.sortKey === (isInvoice ? 'amountBookOfOrderVAT' : 'amountBookOfOrder') }"
                        @click="OrderStore.sort(isInvoice ? 'amountBookOfOrderVAT' : 'amountBookOfOrder')"
                    >
                        <span>{{ isInvoice ? "已收发票" : "已付款" }}</span>
                        <q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th
                        class="text-right cursor-pointer"
                        style="padding-right: 48px"
                        :class="{ 'text-negative': OrderStore.sortKey === (isInvoice ? 'amountBookOfOrderVATRest' : 'amountBookOfOrderRest') }"
                        @click="OrderStore.sort(isInvoice ? 'amountBookOfOrderVATRest' : 'amountBookOfOrderRest')"
                    >
                        <span>{{ isInvoice ? "可收票" : "还应付款" }}</span>
                        <q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th class="text-left">操作</q-th>
                    <q-th class="text-left">
                        <q-input
                            square
                            filled
                            dense
                            clearable
                            color="primary"
                            placeholder="搜索备注"
                            style="margin-left: -6px"
                            v-model="OrderStore.search.remark"
                            @blur="OrderStore.get(1)"
                        />
                    </q-th>
                </q-tr>
            </template>

            <template v-slot:body="props">
                <q-tr
                    class="cursor-pointer"
                    :class="{ 'bg-grey-4': props.expand }"
                    @click.stop="
                        async () => {
                            if (props.expand === false) await setOrderSku(props.row);
                            props.expand = !props.expand;
                        }
                    "
                >
                    <q-td key="timeCreateString" :props="props">
                        {{ props.row.timeCreateString }}
                    </q-td>
                    <q-td key="code" :props="props">
                        <q-badge rounded :color="props.row.isDisabled ? 'grey' : 'cyan'" class="shadow-2 q-mr-sm"> </q-badge>
                        <span>{{ props.row.code }}</span>
                    </q-td>
                    <q-td key="contactId" :props="props" class="text-body1">
                        <span v-if="props.row.joinContact?.name" class="ellipsis">{{ props.row.joinContact.name }}</span>
                        <span v-else class="text-grey">无</span>
                    </q-td>
                    <q-td
                        key="amount"
                        :props="props"
                        :class="{
                            'text-through': props.row.accounterId,
                            'text-grey': props.row.amount < 1 || props.row.accounterId,
                        }"
                    >
                        {{ props.row.amount.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                    </q-td>
                    <q-td
                        key="amountBookOfOrder"
                        class="text-grey"
                        :props="props"
                        :class="{
                            'text-through': props.row.accounterId,
                        }"
                    >
                        {{ (isInvoice ? props.row.amountBookOfOrderVAT : props.row.amountBookOfOrder).toLocaleString("zh", { minimumFractionDigits: 2 }) }}
                    </q-td>
                    <q-td
                        key="amountBookOfOrderRest"
                        class="text-right"
                        :props="props"
                        :class="{
                            'text-through': props.row.accounterId,
                            'text-grey': (isInvoice ? props.row.amountBookOfOrderVATRest : props.row.amountBookOfOrderRest) < 1 || props.row.accounterId,
                            'text-weight-bold': (isInvoice ? props.row.amountBookOfOrderVATRest : props.row.amountBookOfOrderRest) >= 1,
                            'text-purple': isInvoice,
                        }"
                    >
                        {{
                            (isInvoice ? props.row.amountBookOfOrderVATRest : props.row.amountBookOfOrderRest).toLocaleString("zh", {
                                minimumFractionDigits: 2,
                            })
                        }}
                    </q-td>
                    <q-td key="_id" :props="props" style="padding: 0px 8px">
                        <q-btn
                            push
                            dense
                            square
                            label="复核"
                            class="q-mr-xs"
                            :disable="!!props.row.managerId"
                            :color="!!props.row.managerId ? 'standard' : 'primary'"
                            :text-color="!!props.row.managerId ? 'grey' : 'white'"
                            @click.stop="setManager(props.row)"
                        />
                        <q-btn
                            push
                            dense
                            square
                            label="结清"
                            class="q-mr-xs"
                            :disable="!!props.row.accounterId"
                            :color="props.row.accounterId ? 'standard' : 'teal'"
                            :text-color="props.row.accounterId ? 'grey' : 'white'"
                            @click.stop="setAccounter(props.row)"
                        />
                    </q-td>
                    <q-td key="remark" :props="props">
                        <span
                            class="cursor-pointer"
                            :class="props.row.remark ? 'text-primary' : 'text-grey'"
                            @click="
                                () => {
                                    OrderStore.setEditor(props.row);
                                    orderDialog = true;
                                }
                            "
                        >
                            {{ props.row.remark || "点击修改" }}
                        </span>
                    </q-td>
                </q-tr>

                <q-tr v-show="props.expand" :props="props">
                    <q-td colspan="100%" style="padding: 0">
                        <div class="row">
                            <div class="col-9">
                                <q-table
                                    v-if="!!props.row.joinSku"
                                    dense
                                    row-key="_id"
                                    hide-pagination
                                    separator="vertical"
                                    :columns="[
                                        { name: 'layout', field: 'layout', label: '商品性质', align: 'left' },
                                        { name: 'name', field: 'name', label: '品名', align: 'left' },
                                        { name: 'norm', field: 'norm', label: '规格', align: 'left' },
                                        { name: 'count', field: 'count', label: '数量' },
                                        { name: 'pounds', field: 'pounds', label: '过磅' },
                                        { name: 'keyFeat', field: 'keyFeat', label: '材质', align: 'left' },
                                        { name: 'keyOrigin', field: 'keyOrigin', label: '产地', align: 'left' },
                                        { name: 'keyHouse', field: 'keyHouse', label: '仓库', align: 'left' },
                                        { name: 'price', field: 'price', label: '单价' },
                                        { name: 'remark', field: 'remark', label: '备注', align: 'left' },
                                    ]"
                                    :rows-per-page-options="[0]"
                                    :rows="props.row.joinSku || []"
                                >
                                    <template v-slot:body="_props">
                                        <q-tr>
                                            <q-td :_props="_props" style="font-size: 16px">
                                                <q-badge :color="_props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL ? 'primary' : 'grey'">
                                                    {{ _props.row.layout === ENUM_LAYOUT_CABINET.INDIVIDUAL ? "大件商品" : "普通" }}
                                                    <q-tooltip class="text-body1">{{ MAP_ENUM_LAYOUT_CABINET.get(_props.row.layout)?.tip }}</q-tooltip>
                                                </q-badge>
                                            </q-td>
                                            <q-td :_props="_props" style="font-size: 16px">{{ _props.row.name }} </q-td>
                                            <q-td :_props="_props" style="font-size: 16px">{{ _props.row.norm }}</q-td>
                                            <q-td :_props="_props" style="font-size: 16px" class="text-right"
                                                >{{ _props.row.count }} {{ _props.row.unit }}</q-td
                                            >
                                            <q-td :_props="_props" style="font-size: 16px" class="text-right">
                                                <span v-if="_props.row.isPriceInPounds">{{ _props.row.pounds.toFixed(3) }} 吨</span>
                                            </q-td>
                                            <q-td :_props="_props" style="font-size: 16px">{{ _props.row.keyFeat || "-" }}</q-td>
                                            <q-td :_props="_props" style="font-size: 16px">{{ _props.row.keyOrigin || "-" }}</q-td>
                                            <q-td :_props="_props" style="font-size: 16px">{{ _props.row.keyHouse || "-" }}</q-td>
                                            <q-td :_props="_props" style="font-size: 16px" class="text-right">{{ _props.row.price.toFixed(2) }}</q-td>
                                            <q-td :_props="_props" style="font-size: 16px">{{ _props.row.remark }}</q-td>
                                        </q-tr>
                                    </template>
                                </q-table>
                            </div>
                            <div class="col-3">
                                <div>
                                    <q-card square class="q-mb-sm">
                                        <q-card-section>
                                            <div class="text-h6 text-weight-bold">订单信息</div>
                                            <div class="row text-body1">
                                                <span class="col-3 text-grey">开单人</span>
                                                <span class="col-9 text-right text-weight-bold">{{ props.row.joinCreator?.nickname }}</span>
                                            </div>
                                            <div class="row text-body1">
                                                <span class="col-3 text-grey">客户信息</span>
                                                <span class="col-9 text-right text-weight-bold">{{ props.row.joinContact?.name || "无" }}</span>
                                            </div>
                                        </q-card-section>
                                        <q-card-actions>
                                            <q-space></q-space>
                                            <q-btn
                                                class="q-ml-sm"
                                                text-color="negative"
                                                :disabled="!!props.row.managerId || !!props.row.accounterId || props.row.joinChildOrder?.length > 0"
                                                @click="
                                                    async () => {
                                                        await OrderStore.delete(props.row._id);
                                                        OrderStore.get(1, true);
                                                    }
                                                "
                                            >
                                                {{ props.row.isDisabled ? "恢复" : "删除" }}
                                            </q-btn>
                                            <q-btn
                                                v-if="!props.row.isDisabled"
                                                :disabled="!!props.row.managerId || !!props.row.accounterId || props.row.joinChildOrder?.length > 0"
                                                class="q-ml-sm"
                                                text-color="primary"
                                                @click="
                                                    () => {
                                                        OrderStore.setEditor(props.row);
                                                        SkuStore.listPicked = cloneDeep(props.row.joinSku);
                                                        $router.push('/wmss/trade/sale-edit');
                                                    }
                                                "
                                            >
                                                编辑
                                            </q-btn>
                                            <q-tooltip
                                                v-if="!!props.row.managerId || !!props.row.accounterId || props.row.joinChildOrder?.length > 0"
                                                class="text-body1"
                                            >
                                                <div v-if="!!props.row.managerId">* 订单已复核，无法修改</div>
                                                <div v-if="!!props.row.accounterId">* 订单已确认结清，无法修改</div>
                                                <div v-if="props.row.joinChildOrder?.length > 0">* 监测到入库单，无法修改</div>
                                            </q-tooltip>
                                        </q-card-actions>
                                    </q-card>
                                    <q-card square class="q-mb-sm">
                                        <q-card-section>
                                            <div class="text-h6 text-weight-bold">财务信息</div>
                                            <div class="row text-body1 q-mt-xs">
                                                <span class="col text-grey">
                                                    <q-badge rounded :color="props.row.accounterId ? 'teal' : 'grey'" class="shadow-2 q-mr-sm"> </q-badge
                                                    >结清确认
                                                    <a
                                                        v-if="props.row.accounterId"
                                                        class="cursor-pointer q-mx-sm text-negative"
                                                        @click.stop="setAccounter(props.row, true)"
                                                    >
                                                        取消
                                                    </a>
                                                </span>
                                                <span class="col text-right text-weight-bold">{{ props.row.joinAccounter?.nickname || "无" }}</span>
                                            </div>
                                            <div class="text-body1 text-grey q-mt-xs" v-if="props.row.joinBookOfOrder">
                                                <div>
                                                    <q-badge
                                                        rounded
                                                        :color="props.row.joinBookOfOrder.filter(
                                                    (e:BookOfOrder) => e.bookType === ENUM_BOOK_TYPE.YFZK && e.bookDirection === ENUM_BOOK_DIRECTION.JIE
                                                ).length ? 'teal' : 'grey'"
                                                        class="shadow-2 q-mr-sm"
                                                    >
                                                    </q-badge
                                                    >收到货款
                                                </div>
                                                <div
                                                    class="row q-mt-xs"
                                                    v-for="BO in props.row.joinBookOfOrder.filter(
                                                    (e:BookOfOrder) => e.bookType === ENUM_BOOK_TYPE.YFZK && e.bookDirection === ENUM_BOOK_DIRECTION.JIE
                                                )"
                                                >
                                                    <span class="col-8 text-grey" style="white-space: break-spaces"
                                                        >{{ BO.joinBook?.keyOrigin || "客户异常" }}
                                                    </span>
                                                    <span
                                                        class="col-4 text-right text-teal text-weight-bold text-underline cursor-pointer"
                                                        @click="$router.push(`/wmss/finance/book-220201?code=${BO.joinBook?.code}`)"
                                                    >
                                                        {{ BO.amount.toFixed(2) }} 元
                                                    </span>
                                                </div>
                                            </div>
                                        </q-card-section>
                                        <q-separator />
                                        <q-card-section>
                                            <div class="text-body1 text-grey q-mt-xs" v-if="props.row.joinBookOfOrder">
                                                <div>
                                                    <q-badge
                                                        rounded
                                                        :color="props.row.joinBookOfOrder.filter(
                                                    (e:BookOfOrder) => e.bookType === ENUM_BOOK_TYPE.YFZK_VAT && e.bookDirection === ENUM_BOOK_DIRECTION.DAI
                                                ).length ? 'purple' : 'grey'"
                                                        class="shadow-2 q-mr-sm"
                                                    >
                                                    </q-badge
                                                    >开出发票
                                                </div>
                                                <div
                                                    class="row q-mt-xs"
                                                    v-for="BO in props.row.joinBookOfOrder.filter(
                                                    (e:BookOfOrder) => e.bookType === ENUM_BOOK_TYPE.YFZK_VAT && e.bookDirection === ENUM_BOOK_DIRECTION.DAI
                                                )"
                                                >
                                                    <span class="col-8 text-grey" style="white-space: break-spaces"
                                                        >{{ BO.joinBook?.keyOrigin || "客户异常" }}
                                                    </span>
                                                    <span
                                                        class="col-4 text-right text-purple text-weight-bold text-underline cursor-pointer"
                                                        @click="$router.push(`/wmss/finance/book-220202?code=${BO.joinBook?.code}`)"
                                                    >
                                                        {{ BO.amount.toFixed(2) }} 元
                                                    </span>
                                                </div>
                                            </div>
                                        </q-card-section>
                                    </q-card>
                                    <q-card square class="q-mb-sm">
                                        <q-card-section>
                                            <div class="text-h6 text-weight-bold">仓库信息</div>
                                            <div class="row text-body1">
                                                <span class="col-6 text-grey">
                                                    <q-badge rounded :color="props.row.managerId ? 'primary' : 'grey'" class="shadow-2 q-mr-sm"> </q-badge
                                                    >复核人
                                                </span>
                                                <span class="col-6 text-right text-weight-bold">
                                                    {{ props.row.joinManager?.nickname || "无" }}
                                                    <a
                                                        v-if="props.row.managerId"
                                                        class="cursor-pointer text-negative text-underline"
                                                        @click="setManager(props.row, true)"
                                                    >
                                                        取消
                                                    </a></span
                                                >
                                            </div>
                                            <div class="row text-body1 q-mt-xs">
                                                <span class="col text-grey"
                                                    ><q-badge
                                                        rounded
                                                        :color="props.row.joinChildOrder?.length > 0 ? 'primary' : 'grey'"
                                                        class="shadow-2 q-mr-sm"
                                                    >
                                                    </q-badge
                                                    >入库单
                                                </span>
                                                <span class="col text-right text-weight-bold">
                                                    <a
                                                        v-if="props.row.joinChildOrder?.length > 0"
                                                        class="cursor-pointer text-negative text-underline"
                                                        @click="() => $router.push(`/wmss/warehouse/order-list?code=${props.row.joinChildOrder[0]?.code}`)"
                                                    >
                                                        查看
                                                    </a>
                                                    <span v-else class="text-bold">无</span>
                                                </span>
                                            </div>
                                        </q-card-section>
                                        <q-separator />
                                        <q-card-section class="text-body2 text-grey" style="white-space: break-spaces">
                                            <div>1.复核后将会通知仓库卸货，并生成入库单</div>
                                            <div>2.取消复核后，不会影响入库单</div>
                                            <div>3.删除入库单后，您可以继续编辑此采购单</div>
                                        </q-card-section>
                                    </q-card>
                                </div>
                            </div>
                        </div>
                    </q-td>
                </q-tr>
            </template>

            <template v-slot:bottom="props">
                <q-pagination
                    size="17px"
                    class="q-my-sm"
                    color="white"
                    text-color="black"
                    active-color="primary"
                    active-text-color="white"
                    v-model="OrderStore.page.page"
                    :max-pages="10"
                    :max="Math.ceil(OrderStore.total / OrderStore.page.pageSize)"
                    @update:model-value="(value) => OrderStore.get(value)"
                />
                <q-space></q-space>
                <span>共 {{ OrderStore.total }} 项，合计</span>
                <span class="text-body1 text-weight-bold text-negative q-mx-sm"> {{ (OrderStore.amountTotal / 100).toFixed(2) }} </span>
                <span>元</span>
            </template>
        </q-table>

        <q-inner-loading :showing="OrderStore.loadding">
            <q-spinner-gears size="50px" color="primary" />
        </q-inner-loading>
    </q-card>

    <q-dialog v-model="contactDialog" position="bottom">
        <q-card class="w-1000">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title class="text-weight-bold">通讯录</q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>
            <q-separator class="q-mb-md" />

            <list-contact
                @pick="
                    (value) => {
                        OrderStore.setEditor(OrderStore.getSchema(ENUM_ORDER.SALES));
                        contactPicked = value;
                        OrderStore.search.contactId = value._id;
                        OrderStore.get(1);
                    }
                "
            ></list-contact>
        </q-card>
    </q-dialog>

    <q-dialog v-model="orderDialog">
        <q-card class="w-400">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>
                    <q-badge rounded color="cyan" class="shadow-2 q-mr-sm"> </q-badge>
                    修改
                </q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>

            <q-card-section>
                <q-input filled disable label="清单编号" v-model="OrderStore.editor.code" color="primary" class="q-mb-md" />
                <q-input filled label="请输入备注" v-model="OrderStore.editor.remark" color="primary" />
            </q-card-section>

            <q-card-actions>
                <q-space></q-space>
                <q-btn
                    color="primary"
                    v-close-popup
                    @click="
                        async () => {
                            await OrderStore.put();
                            await OrderStore.get(1);
                        }
                    "
                >
                    保存
                </q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { getChineseMoney, getPage, MongodbSort } from "qqlx-cdk";
import { useRouter, useRoute } from "vue-router";
import { onMounted, ref, computed } from "vue";
import { cloneDeep, debounce } from "lodash";
import * as XLSX from "xlsx";

import { ENUM_LAYOUT_CABINET, ENUM_ORDER, MAP_ENUM_LAYOUT_CABINET, BookOfOrder, ENUM_BOOK_DIRECTION, ENUM_BOOK_TYPE } from "qqlx-core";
import type { Order, OrderJoined } from "qqlx-core";

import dialogIntro from "@/components/dialog-intro.vue";
import listContact from "@/components/list-contact.vue";
import pickerRange from "@/components/picker-range.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useUserStore } from "@/stores/user/user";
import { useCorpStore } from "@/stores/brand/corp";
import { useWarehouseStore } from "@/stores/brand/warehouse";
import { useContactStore } from "@/stores/brand/contact";
import { useSkuStore } from "@/stores/wmss/sku";
import { useOrderStore } from "@/stores/wmss/order";
import { useClueStore } from "@/stores/wmss/clue";

const NotifyStore = useNotifyStore();

const CorpStore = useCorpStore();
const OrderStore = useOrderStore();
const orderDialog = ref(false);
const isInvoice = ref(false);
const downloadOrderList = async () => {
    try {
        await OrderStore.get(1);
        OrderStore.loadding = true;
        const orders = await OrderStore.geOrderWidthSku();

        // 单据
        const Out: any = [["创建时间", "单号", "客户名称", "单据金额", "单据备注"]];
        // SKU
        const SkuOut: any = [["创建时间", "单号", "客户名称", "产地", "材质", "名称", "规格", "数量", "单位", "过磅", "过磅单位", "单价", "总金额", "备注"]];

        orders.map((E) => {
            const billouts = [E.timeCreateString, E.code, E.joinContact?.name, E.amount.toFixed(2), E.remark];
            Out.push(billouts);
            E.joinSku?.map((C) => {
                SkuOut.push([
                    E.timeCreateString,
                    E.code,
                    E.joinContact?.name,
                    C.keyOrigin,
                    C.keyFeat,
                    C.name,
                    C.norm,
                    C.count,
                    C.unit,
                    C.isPriceInPounds ? C.pounds.toFixed(3) : "",
                    C.isPriceInPounds ? "吨" : "",
                    C.price,
                    Number(C.price) * (C.isPriceInPounds ? Number(C.pounds) : Number(C.count)),
                    C.remark,
                ]);
            });
        });
        const name = OrderStore.search.type === ENUM_ORDER.SALES ? "销售" : "采购";
        const workbook = XLSX.utils.book_new();

        const sheet1 = XLSX.utils.aoa_to_sheet(Out);
        XLSX.utils.book_append_sheet(workbook, sheet1, `${name}单据导出`);
        const sheet2 = XLSX.utils.aoa_to_sheet(SkuOut);
        XLSX.utils.book_append_sheet(workbook, sheet2, `${name}明细导出`);

        XLSX.writeFile(workbook, `${CorpStore.picked?.name}-${name}单据导出.xlsx`);
    } catch (error) {
        NotifyStore.fail((error as Error).message);
    } finally {
        OrderStore.loadding = false;
    }
};
const setOrderSku = async (order: OrderJoined) => {
    try {
        OrderStore.loadding = true;
        const info = await OrderStore.getSku(order);
        order.joinSku = info.skuList;
        order.joinBookOfOrder = info.bookOfOrderList;
        order.joinAccounter = info.joinAccounter;
        order.joinCreator = info.joinCreator;
        order.joinManager = info.joinManager;
        order.joinChildOrder = info.joinChildOrder;
        order.joinParentOrder = info.joinParentOrder;
    } catch (error) {
        NotifyStore.fail(`网络异常, 请重新试试`);
    } finally {
        OrderStore.loadding = false;
    }
};

const SkuStore = useSkuStore();
const ContactStore = useContactStore();
const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());

const UserStore = useUserStore();
const setManager = async (order: OrderJoined, toClear = false) => {
    await setOrderSku(order);
    const entity = cloneDeep(order);
    entity.managerId = toClear ? "" : UserStore.userEditor.userId;
    await OrderStore.put(entity);

    // 销售单复核，需要自动创建对应发货单
    if (entity.managerId && entity.type === ENUM_ORDER.PURCHASE) {
        OrderStore.editor = OrderStore.getSchema(ENUM_ORDER.GETIN);
        OrderStore.editor.parentOrderId = entity._id;
        OrderStore.editor.parentOrderType = entity.type;
        OrderStore.editor.contactId = entity.contactId;
        await OrderStore.post(entity.joinSku);
    }
    OrderStore.setEditor(OrderStore.getSchema(OrderStore.search.type));

    // sku
    await OrderStore.get();
    const target = OrderStore.list.find((e) => e._id === entity._id);
    await setOrderSku(target as OrderJoined);
};
const setAccounter = async (order: OrderJoined, toClear = false) => {
    await setOrderSku(order);
    const entity = cloneDeep(order);
    entity.accounterId = toClear ? "" : UserStore.userEditor.userId;
    await OrderStore.put(entity);

    // sku
    await OrderStore.get();
    const target = OrderStore.list.find((e) => e._id === entity._id);
    await setOrderSku(target as OrderJoined);
};

const route = useRoute();
onMounted(() => {
    // 清空SKU
    SkuStore.setEditor();
    // 清空清单
    OrderStore.setEditor(OrderStore.getSchema(ENUM_ORDER.PURCHASE));
    OrderStore.search.contactId = "";
    OrderStore.page = getPage(20);
    // 根据路由进行搜索
    const { code } = route.query;
    code && (OrderStore.search.code = code as string);
    // 搜索
    OrderStore.get(1);
});
</script>

<style lang="scss" scoped></style>

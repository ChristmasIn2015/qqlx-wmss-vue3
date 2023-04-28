<template>
    <div class="q-pl-xs q-mb-sm">
        <div class="text-h5 text-primary text-weight-bold row items-center">
            <span>销售单列表</span>
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
            {{ isInvoice ? "发票视角" : "收款视角" }}
            <q-tooltip class="text-body1">
                <div v-if="isInvoice">
                    <div>当前正在发票视角</div>
                    <div>您可以看到订单已经开出了哪些发票</div>
                </div>
                <div v-else>
                    <div>当前正在货款视角</div>
                    <div>您可以看到订单已经收到了哪些货款</div>
                </div>
            </q-tooltip>
        </q-btn>
        <q-btn v-if="isInvoice" square class="q-ml-sm bg-white" @click="$router.push('/wmss/finance/book-112202')"> 发票明细 </q-btn>
        <q-btn v-else square class="q-ml-sm bg-white" @click="$router.push('/wmss/finance/book-112201')"> 收款明细 </q-btn>

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
            <q-menu class="text-body1">
                <q-item clickable @click="$router.push('/wmss/system/clue')">
                    <q-item-section>
                        <div><q-icon name="subject" class="q-mr-xs" size="22px"></q-icon>操作记录</div>
                    </q-item-section>
                </q-item>
                <q-item clickable @click="$router.push('/wmss/trade/sale-sku')">
                    <q-item-section>
                        <div><q-icon name="format_list_bulleted" class="q-mr-xs" size="22px"></q-icon>销售明细</div>
                    </q-item-section>
                </q-item>
                <q-item clickable @click="downloadOrderList()">
                    <q-item-section>
                        <div><q-icon name="get_app" class="q-mr-xs" size="18px"></q-icon>导出订单</div>
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
                        <span>订单金额</span>
                        <q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th
                        class="text-right cursor-pointer"
                        :class="{ 'text-negative': OrderStore.sortKey === (isInvoice ? 'amountBookOfOrderVAT' : 'amountBookOfOrder') }"
                        @click="OrderStore.sort(isInvoice ? 'amountBookOfOrderVAT' : 'amountBookOfOrder')"
                    >
                        <span>{{ isInvoice ? "已开发票" : "已收款" }}</span>
                        <q-icon :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
                    </q-th>
                    <q-th
                        class="text-right cursor-pointer"
                        style="padding-right: 48px"
                        :class="{ 'text-negative': OrderStore.sortKey === (isInvoice ? 'amountBookOfOrderVATRest' : 'amountBookOfOrderRest') }"
                        @click="OrderStore.sort(isInvoice ? 'amountBookOfOrderVATRest' : 'amountBookOfOrderRest')"
                    >
                        <span>{{ isInvoice ? "可开票" : "还应收款" }}</span>
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
                            if (props.expand === false) await setOrderInfo(props.row);
                            props.expand = !props.expand;
                        }
                    "
                >
                    <q-td key="timeCreateString" :props="props">
                        {{ props.row.timeCreateString }}
                    </q-td>
                    <q-td key="code" :props="props">
                        <q-badge rounded :color="props.row.isDisabled ? 'grey' : 'pink-6'" class="shadow-2 q-mr-sm"> </q-badge>
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
                            label="打印"
                            class="q-mr-xs"
                            color="negative"
                            @click.stop="
                                async () => {
                                    await setOrderInfo(props.row);
                                    orderPrinting = props.row;
                                    printDialog = true;
                                }
                            "
                        />
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
                                                <div v-if="props.row.joinChildOrder?.length > 0">* 仓库已经装货，无法修改，请检查仓库（发货）订单</div>
                                                <div v-if="!!props.row.accounterId">* 订单已确认结清，无法修改</div>
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
                                                    (e:BookOfOrder) => e.bookType === ENUM_BOOK_TYPE.YSZK && e.bookDirection === ENUM_BOOK_DIRECTION.DAI
                                                ).length ? 'teal' : 'grey'"
                                                        class="shadow-2 q-mr-sm"
                                                    >
                                                    </q-badge
                                                    >收到货款
                                                </div>
                                                <div
                                                    class="row q-mt-xs"
                                                    v-for="BO in props.row.joinBookOfOrder.filter(
                                                    (e:BookOfOrder) => e.bookType === ENUM_BOOK_TYPE.YSZK && e.bookDirection === ENUM_BOOK_DIRECTION.DAI
                                                )"
                                                >
                                                    <span class="col-8 text-grey" style="white-space: break-spaces"
                                                        >{{ BO.joinBook?.keyOrigin || "客户异常" }}
                                                    </span>
                                                    <span
                                                        class="col-4 text-right text-teal text-weight-bold text-underline cursor-pointer"
                                                        @click="$router.push(`/wmss/finance/book-112201?code=${BO.joinBook?.code}`)"
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
                                                    (e:BookOfOrder) => e.bookType === ENUM_BOOK_TYPE.YSZK_VAT && e.bookDirection === ENUM_BOOK_DIRECTION.JIE
                                                ).length ? 'purple' : 'grey'"
                                                        class="shadow-2 q-mr-sm"
                                                    >
                                                    </q-badge
                                                    >开出发票
                                                </div>
                                                <div
                                                    class="row q-mt-xs"
                                                    v-for="BO in props.row.joinBookOfOrder.filter(
                                                    (e:BookOfOrder) => e.bookType === ENUM_BOOK_TYPE.YSZK_VAT && e.bookDirection === ENUM_BOOK_DIRECTION.JIE
                                                )"
                                                >
                                                    <span class="col-8 text-grey" style="white-space: break-spaces"
                                                        >{{ BO.joinBook?.keyOrigin || "客户异常" }}
                                                    </span>
                                                    <span
                                                        class="col-4 text-right text-purple text-weight-bold text-underline cursor-pointer"
                                                        @click="$router.push(`/wmss/finance/book-112202?code=${BO.joinBook?.code}`)"
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
                                                    >发货单
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
                                            <div>1.复核后将会通知仓库装货，并生成发货单</div>
                                            <div>2.取消复核后，不会影响发货单</div>
                                            <div>3.删除发货单后，您可以继续编辑此销售单</div>
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

    <q-dialog v-model="printDialog">
        <div class="row" style="min-width: 1330px">
            <q-card class="w-350" id="order-config">
                <q-card-section class="text-h6 text-bold">打印设置</q-card-section>
                <q-separator></q-separator>
                <q-card-section>
                    <div class="text-body1 q-mb-md q-ml-xs text-bold">列设置</div>
                    <q-checkbox v-model="OrderStore.columnNameShow" label="品名规格"></q-checkbox>
                    <q-checkbox v-model="OrderStore.columnCountShow" label="数量"></q-checkbox>
                    <q-checkbox v-model="OrderStore.columnUnitShow" label="单位"></q-checkbox>
                    <q-checkbox v-model="OrderStore.columnPoundsShow" label="过磅称重"></q-checkbox>
                    <q-checkbox v-model="OrderStore.columnPriceShow" label="单价"></q-checkbox>
                    <q-checkbox v-model="OrderStore.columnPriceReverseShow" label="单价（从售价逆推算）"></q-checkbox>
                    <q-checkbox v-model="OrderStore.columnPriceAllShow" label="售价"></q-checkbox>
                    <q-checkbox v-model="OrderStore.columnRemarkShow" label="备注"></q-checkbox>
                </q-card-section>
                <q-separator></q-separator>
                <q-card-section>
                    <div class="text-body1 q-mb-md q-ml-xs text-bold">公司别称</div>
                    <q-input
                        filled
                        clearable
                        color="primary"
                        class="q-mb-sm"
                        label="请输入公司别称"
                        v-model="title.text"
                        v-for="(title, index) in ConfigStore.titles"
                        @blur="ConfigStore.post()"
                    >
                        <template v-slot:after>
                            <q-btn
                                v-if="index === 0"
                                fab
                                outline
                                padding="sm"
                                icon="add"
                                color="primary"
                                @click="
                                    () => {
                                        ConfigStore.titles.push({ text: '公司别称' });
                                        ConfigStore.post();
                                    }
                                "
                            ></q-btn>
                            <q-btn
                                v-else
                                fab
                                padding="sm"
                                icon="remove"
                                color="negative"
                                @click="
                                    () => {
                                        ConfigStore.titles.splice(index, 1);
                                        ConfigStore.post();
                                    }
                                "
                            ></q-btn>
                        </template>
                    </q-input>
                </q-card-section>
                <q-separator></q-separator>
                <q-card-section>
                    <div class="text-body1 q-mb-md q-ml-xs text-bold row">
                        <span>提货仓库</span>
                        <a class="cursor-pointer q-ml-auto text-negative" @click="warehouseIsDisabled = !warehouseIsDisabled">
                            {{ warehouseIsDisabled ? "返回" : "最近删除" }}
                        </a>
                    </div>
                    <div class="q-mb-sm row items-center" v-for="house in WarehouseStore.list.filter((e) => e.isDisabled === warehouseIsDisabled)">
                        <q-card class="col-10">
                            <q-item class="col">
                                <q-item-section>
                                    <q-item-label>{{ house.name }}</q-item-label>
                                    <q-item-label caption>{{ house.address }}</q-item-label>
                                </q-item-section>
                                <q-item-section side>
                                    <q-btn padding="sm" fab flat icon="more_vert">
                                        <q-menu>
                                            <q-item clickable>
                                                <q-item-section
                                                    @click="
                                                        () => {
                                                            WarehouseStore.setEditor();
                                                            warehouseDialog = true;
                                                        }
                                                    "
                                                >
                                                    添加新仓库
                                                </q-item-section>
                                            </q-item>
                                            <q-item clickable>
                                                <q-item-section
                                                    @click="
                                                        () => {
                                                            WarehouseStore.setEditor(house);
                                                            warehouseDialog = true;
                                                        }
                                                    "
                                                >
                                                    修改
                                                </q-item-section>
                                            </q-item>
                                            <q-item
                                                clickable
                                                class="text-negative"
                                                @click="
                                                    () => {
                                                        WarehouseStore.setEditor(house);
                                                        WarehouseStore.editor.isDisabled = !WarehouseStore.editor.isDisabled;
                                                        WarehouseStore.patch();
                                                    }
                                                "
                                            >
                                                <q-item-section>{{ house.isDisabled ? "恢复" : "删除" }}</q-item-section>
                                            </q-item>
                                        </q-menu>
                                    </q-btn>
                                </q-item-section>
                            </q-item>
                        </q-card>
                        <div class="col-2 text-right">
                            <q-btn
                                fab
                                padding="sm"
                                icon="check"
                                class="inset-shadow"
                                :text-color="WarehouseStore.picked._id === house._id ? '' : 'primary'"
                                :color="WarehouseStore.picked._id === house._id ? 'primary' : ''"
                                @click="WarehouseStore.pick(house)"
                            ></q-btn>
                        </div>
                    </div>
                </q-card-section>
            </q-card>

            <q-space></q-space>
            <q-card class="print-container">
                <q-card-section>
                    <div id="order">
                        <div class="text-weight-bold text-h4 text-center">
                            <div>{{ CorpStore.picked?.name }}</div>
                            <div v-if="ConfigStore.titles.length > 0">
                                <div v-for="title in ConfigStore.titles">{{ title.text }}</div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col">购货单位：{{ orderPrinting.joinContact?.name }}</div>
                            <div class="col text-right">公司地址：{{ CorpStore.picked?.address }}</div>
                        </div>
                        <div class="row">
                            <div class="col">购货单位联系方式：{{ orderPrinting.joinContact?.address }}</div>
                            <div class="col text-right">公司联系方式：{{ CorpStore.picked?.contact || "尚未录入" }}</div>
                        </div>
                        <div class="row">
                            <div class="col">开单日期：{{ orderPrinting.timeCreateString }}</div>
                            <div class="col text-center">开单人：{{ orderPrinting.joinCreator?.nickname }}</div>
                            <div class="col text-right">No. {{ orderPrinting.code }}</div>
                        </div>
                        <table class="full-width">
                            <tr>
                                <th v-if="OrderStore.columnNameShow">品名规格</th>
                                <th v-if="OrderStore.columnCountShow">数量</th>
                                <th v-if="OrderStore.columnUnitShow">单位</th>
                                <th v-if="OrderStore.columnPoundsShow">过磅称重</th>
                                <th v-if="OrderStore.columnPriceShow">单价/元</th>
                                <th v-if="OrderStore.columnPriceReverseShow">* 单价/元</th>
                                <th v-if="OrderStore.columnPriceAllShow">售价/元</th>
                                <th v-if="OrderStore.columnRemarkShow">备注</th>
                            </tr>
                            <tr v-for="(sku, i) in skuPrinting">
                                <td v-if="OrderStore.columnNameShow">{{ sku.name }} {{ sku.norm }}</td>
                                <td v-if="OrderStore.columnCountShow">
                                    <span v-show="sku.name && sku.norm">{{ sku.count }}</span>
                                </td>
                                <td v-if="OrderStore.columnUnitShow">{{ sku.unit }}</td>
                                <td v-if="OrderStore.columnPoundsShow">
                                    <span v-show="sku.isPriceInPounds && sku.pounds > 0">{{ sku.pounds.toFixed(3) }} 吨</span>
                                </td>
                                <td v-if="OrderStore.columnPriceShow">
                                    <span v-show="sku.name && sku.norm">{{ sku.price.toFixed(2) }}</span>
                                </td>
                                <td v-if="OrderStore.columnPriceReverseShow">
                                    <span v-show="sku.name && sku.norm">
                                        {{ ((sku.price * (sku.isPriceInPounds ? sku.pounds : sku.count)) / sku.count).toFixed(2) }}
                                    </span>
                                </td>
                                <td v-if="OrderStore.columnPriceAllShow">
                                    <span v-show="sku.name && sku.norm">{{ (sku.price * (sku.isPriceInPounds ? sku.pounds : sku.count)).toFixed(2) }}</span>
                                </td>
                                <td v-if="OrderStore.columnRemarkShow">{{ sku.remark }}</td>
                            </tr>
                        </table>
                        <div class="order-table-line row">
                            <div class="col">{{ getChineseMoney(orderPrinting.amount) }}</div>
                            <div class="col">共计: {{ orderPrinting.amount.toFixed(2) }} 元</div>
                        </div>
                        <div class="order-table-line row">
                            <div class="col q-pa-sm">单据说明</div>
                            <div class="col-8 q-pa-sm text-body2">
                                1、购货方在货物出库/收货时，应当面点清数量并签收，提货人/收货人在本单上签字后，购货方即对本单上所载内容认可。
                                2、按产品质量法规定，购货方在使用供方货品前，必须委托权威机构进行检测，确认其品质符合质量要求，方可投入使用。未经检测投入使用，造成一切后果由购货方自负
                                3、如经检验有质量问题，必须在七天内提出。本公司可予以退换货（拆包或损坏不予退换），并承担一定的损失（以提货单注明金额为准）
                                4、本销售单等同于合同，并代替送货单使用，提货人/收货人签名后生效，如有纠纷在供货方所在地解决。
                            </div>
                            <div class="col q-pa-sm">
                                <div>白联：存根</div>
                                <div>红联：提货</div>
                                <div>黄联：客户</div>
                            </div>
                        </div>
                        <div class="order-table-line row">
                            <div class="col-8 q-px-md" style="text-align: left">仓库地址：{{ WarehouseStore.picked?.address }}</div>
                            <div class="col-4 q-px-md" style="text-align: left">提货人</div>
                        </div>
                    </div>
                </q-card-section>
                <div class="row q-px-md q-pb-sm">
                    <div class="col"></div>
                    <div class="col text-right">
                        <q-btn v-if="copyAllow" class="q-ml-sm" label="复制" color="primary" @click.stop="copy()" />
                        <q-btn v-else label="复制" disable>
                            <q-tooltip class="text-body1">此浏览器不支持复制功能</q-tooltip>
                        </q-btn>
                        <q-btn class="q-ml-sm" label="关闭" v-close-popup />
                        <q-btn class="q-ml-sm" label="打印" color="primary" @click.stop="print()" />
                    </div>
                </div>
            </q-card>
        </div>
    </q-dialog>

    <q-dialog v-model="orderDialog">
        <q-card class="w-400">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>
                    <q-badge rounded color="pink-6" class="shadow-2 q-mr-sm"> </q-badge>
                    修改
                </q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>

            <q-card-section>
                <q-input filled disable label="订单编号" v-model="OrderStore.editor.code" color="primary" class="q-mb-md" />
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

    <q-dialog v-model="warehouseDialog">
        <q-card class="w-400">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>
                    <q-badge rounded color="pink-6" class="shadow-2 q-mr-sm"> </q-badge>
                    提货仓库
                </q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>

            <q-card-section>
                <q-input filled label="请输入仓库名称" v-model="WarehouseStore.editor.name" color="primary" class="q-mb-md" />
                <q-input filled label="请输入地址" v-model="WarehouseStore.editor.address" color="primary" />
            </q-card-section>

            <q-card-actions>
                <q-space></q-space>
                <q-btn v-if="WarehouseStore.editor._id" color="primary" v-close-popup @click="WarehouseStore.patch()"> 保存 </q-btn>
                <q-btn v-else color="primary" v-close-popup @click="WarehouseStore.post()"> 新增 </q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { getChineseMoney, getPage, MongodbSort } from "qqlx-cdk";
import { useRouter, useRoute } from "vue-router";
import { onMounted, ref, computed } from "vue";
import { cloneDeep, debounce } from "lodash";
import { callPrinter } from "call-printer";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

import { BookOfOrder, ENUM_BOOK_DIRECTION, ENUM_BOOK_TYPE, ENUM_LAYOUT_CABINET, ENUM_ORDER, MAP_ENUM_LAYOUT_CABINET } from "qqlx-core";
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
import { useConfigStore } from "@/stores/brand/config";
import { useClueStore } from "@/stores/wmss/clue";

const NotifyStore = useNotifyStore();
const ClueStore = useClueStore();

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
const setOrderInfo = async (order: OrderJoined) => {
    try {
        // OrderStore.loadding = true;
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
        // OrderStore.loadding = false;
    }
};

const SkuStore = useSkuStore();
const ContactStore = useContactStore();
const contactDialog = ref(false);
const contactPicked = ref(ContactStore.getSchema());

const WarehouseStore = useWarehouseStore();
const warehouseIsDisabled = ref(false);
const warehouseDialog = ref(false);

const CorpStore = useCorpStore();
const ConfigStore = useConfigStore();
const skuPrinting = computed(() => {
    const skus = cloneDeep(orderPrinting.value.joinSku || []);
    if (skus.length >= 8) return skus.slice(0, 8);
    else {
        const blank = SkuStore.getSchema();
        blank.name = "- 以下空白 -";
        skus.push(blank);
        while (skus.length !== 8) skus.push(SkuStore.getSchema());
        return skus;
    }
});
const printDialog = ref(false);
const orderPrinting = ref(OrderStore.getSchema() as OrderJoined);
const print = async () => {
    const dom = document.getElementById("order");
    const info = callPrinter(dom as HTMLElement);
};
const printLog = () => ClueStore.post(orderPrinting.value); // async
const { ClipboardItem } = window;
const copyAllow = computed(() => !!navigator.clipboard && !!ClipboardItem);
const copy = async () => {
    const dom = document.getElementById("order");
    const canvas = await html2canvas(dom as HTMLElement);

    canvas.toBlob(async (blob) => {
        try {
            const CBD = navigator.clipboard;
            if (!CBD || !ClipboardItem) throw new Error("您的浏览器不允许此次操作");
            const type = blob?.type as string;
            const _ = blob as Blob;
            const data = [new ClipboardItem({ [type]: _ })];
            await navigator.clipboard.write(data);
            NotifyStore.success("复制成功");
        } catch (error) {
            NotifyStore.fail((error as Error).message);
        }
    });
};

const UserStore = useUserStore();
const setManager = async (order: OrderJoined, toClear = false) => {
    await setOrderInfo(order);
    const entity = cloneDeep(order);
    entity.managerId = toClear ? "" : UserStore.userEditor.userId;
    await OrderStore.put(entity);

    // 销售单复核，需要自动创建对应发货单
    if (entity.managerId && entity.type === ENUM_ORDER.SALES) {
        OrderStore.editor = OrderStore.getSchema(ENUM_ORDER.GETOUT);
        OrderStore.editor.parentOrderId = entity._id;
        OrderStore.editor.parentOrderType = entity.type;
        OrderStore.editor.contactId = entity.contactId;
        await OrderStore.post(entity.joinSku);
    }
    OrderStore.setEditor(OrderStore.getSchema(OrderStore.search.type));

    // sku
    await OrderStore.get();
    const target = OrderStore.list.find((e) => e._id === entity._id);
    await setOrderInfo(target as OrderJoined);
};
const setAccounter = async (order: OrderJoined, toClear = false) => {
    await setOrderInfo(order);
    const entity = cloneDeep(order);
    entity.accounterId = toClear ? "" : UserStore.userEditor.userId;
    await OrderStore.put(entity);

    // sku
    await OrderStore.get();
    const target = OrderStore.list.find((e) => e._id === entity._id);
    await setOrderInfo(target as OrderJoined);
};

const route = useRoute();
onMounted(() => {
    // 打印预设置
    window.removeEventListener("afterprint", printLog);
    window.addEventListener("afterprint", printLog);
    // 清空SKU
    SkuStore.setEditor();
    // 清空订单
    OrderStore.setEditor(OrderStore.getSchema(ENUM_ORDER.SALES));
    OrderStore.search.contactId = "";
    OrderStore.page = getPage(20);
    // 根据路由进行搜索
    const { code } = route.query;
    code && (OrderStore.search.code = code as string);
    // 搜索
    OrderStore.get(1);
    // 配置
    ConfigStore.get();
});
</script>

<style lang="scss" scoped>
.print-container {
    width: 960px;
    min-width: 960px;
    max-width: 960px;
}
#order {
    color: black;
    font-size: 19px;
    line-height: 1.375;
    font-family: cursive;
    page-break-before: always;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
    table {
        border-collapse: separate;
        border-spacing: 0px 0px;
        tr {
            > th {
                border-top: 1px solid black;
                border-right: 1px solid black;
                &:first-child {
                    border-left: 1px solid black;
                }
            }
            > td {
                height: 27px;
                min-height: 27px;
                line-height: 27px;
                text-align: center;
                border-top: 1px solid black;
                border-right: 1px solid black;
                &:first-child {
                    border-left: 1px solid black;
                }
            }
        }
    }
    .order-table-line {
        > div {
            min-height: 27px;
            text-align: center;
            border-top: 1px solid black;
            border-right: 1px solid black;
            &:first-child {
                border-left: 1px solid black;
            }
        }

        &:last-child {
            border-bottom: 1px solid black;
        }
    }
}
// @media screen and (max-width: 1200px) {
//     #order-config {
//         display: none;
//     }
// }
</style>

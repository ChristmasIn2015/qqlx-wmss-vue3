<template>
  <div class="q-pl-xs q-mb-sm">
    <div class="text-h5 text-primary text-weight-bold row items-center">
      <span>销售单列表</span>
      <q-space></q-space>
      <dialog-intro></dialog-intro>
    </div>
  </div>
  <div class="row q-mb-sm">
    <q-btn square class="q-mr-sm" label="最近删除" :color="OrderStore.search.isDisabled ? 'primary' : 'white'"
      :text-color="OrderStore.search.isDisabled ? '' : 'black'" @click="() => {
        OrderStore.search.isDisabled = !OrderStore.search.isDisabled;
        OrderStore.get(1);
      }
      " />
    <q-btn square class="q-mr-sm" label="可出库" :color="OrderStore.requireManagerId ? 'primary' : 'white'"
      :text-color="OrderStore.requireManagerId ? '' : 'black'" @click="() => {
        OrderStore.requireManagerId = !OrderStore.requireManagerId;
        OrderStore.get(1);
      }
      " />
    <q-btn square class="q-mr-sm" label="可结清" :color="OrderStore.requireAccounterId ? 'primary' : 'white'"
      :text-color="OrderStore.requireAccounterId ? '' : 'black'" @click="() => {
        OrderStore.requireAccounterId = !OrderStore.requireAccounterId;
        OrderStore.get(1);
      }
      " />
    <q-space></q-space>
    <q-btn square class="q-ml-sm bg-white" @click="$router.push('/wmss/trade/sale-sku')">
      销售明细
    </q-btn>

    <div>
      <picker-range :start-time="OrderStore.page.startTime" :end-time="OrderStore.page.endTime" @change="($event) => {
        OrderStore.page.startTime = $event.startTime;
        OrderStore.page.endTime = $event.endTime;
        OrderStore.get(1);
      }
      ">
      </picker-range>
      <q-tooltip class="text-body1">
        <div>点击开始筛选（根据单据的创建时间）</div>
        <div></div>
      </q-tooltip>
    </div>

    <q-btn color="white" text-color="black" icon="visibility" class="q-ml-sm">
      <q-menu>
        <q-card class="w-500">
          <plate-order />
        </q-card>
      </q-menu>
    </q-btn>

    <q-btn color="white" text-color="black" icon="more_vert" class="q-ml-sm">
      <q-menu class="text-body1">
        <q-item clickable @click="$router.push('/wmss/system/clue')">
          <q-item-section>
            <div><q-icon name="subject" class="q-mr-xs" size="22px"></q-icon>操作记录</div>
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
    <q-table style="min-height: 630px" row-key="_id" dense :rows="OrderStore.list" :rows-per-page-options="[0]"
      :columns="OrderStore.columns" :visible-columns="OrderStore.columnsVisiable">
      <template v-slot:header="props">
        <div class="q-pt-sm"></div>
        <q-tr>
          <q-th key="timeContractString" :props="props" class="text-left"
            :class="{ 'text-negative': OrderStore.sortKey === 'timeContract' }">
            <div>
              <q-btn flat small class="q-px-xs" @click="OrderStore.sort('timeContract')">
                <span class="q-pr-xs">合同时间</span>
                <q-icon size="medium" :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
              </q-btn>
            </div>
          </q-th>
          <q-th key="timeCreateString" :props="props" class="text-left"
            :class="{ 'text-negative': OrderStore.sortKey === 'timeCreate' }">
            <q-btn flat small class="q-px-xs" @click="OrderStore.sort('timeCreate')">
              <span class="q-pr-xs">开单时间</span>
              <q-icon size="medium" :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
            </q-btn>
          </q-th>
          <q-th key="code" :props="props" :style="NotifyStore.cellStyle">
            <q-input square filled dense clearable color="primary" placeholder="搜索批次" style="margin-left: -6px"
              v-model="OrderStore.search.code" @blur="OrderStore.get(1)" />
          </q-th>
          <q-th key="contactId" :props="props" :style="NotifyStore.cellStyle">
            <div>
              <q-btn class="q-px-sm" flat square color="negative" style="margin-left: -6px"
                @click="contactDialog = true">
                {{ contactPicked._id ? contactPicked.name : "点击筛选客户" }}
              </q-btn>
              <q-btn v-if="contactPicked._id" flat square padding="xs" color="negative" @click="() => {
                contactPicked = ContactStore.getSchema();
                OrderStore.search.contactId = '';
                OrderStore.get(1);
              }
              ">
                <q-icon name="close"></q-icon>
              </q-btn>
            </div>
          </q-th>
          <q-th key="amount" :props="props" class="text-right relative cursor-pointer"
            :class="{ 'text-negative': OrderStore.sortKey === 'amount' }" @click="OrderStore.sort('amount')">
            <div class="row items-center no-wrap text-body2">
              <q-space></q-space>
              <div>{{ "单据金额" }}</div>
              <q-icon class="q-ml-sm" v-if="OrderStore.sortKey === 'amount'"
                :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
            </div>
          </q-th>
          <q-th key="amountBookOfOrder" :props="props" class="text-right cursor-pointer"
            :class="{ 'text-negative': OrderStore.sortKey === 'amountBookOfOrder' }"
            @click="OrderStore.sort('amountBookOfOrder')">
            <div class="row items-center no-wrap text-grey text-body2">
              <q-space></q-space>
              <div>{{ "已收款" }}</div>
              <q-icon class="q-ml-sm" v-if="OrderStore.sortKey === 'amountBookOfOrder'"
                :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
            </div>
          </q-th>
          <q-th key="amountBookOfOrderRest" :props="props" class="text-right cursor-pointer"
            :class="{ 'text-negative': OrderStore.sortKey === 'amountBookOfOrderRest' }"
            @click="OrderStore.sort('amountBookOfOrderRest')">
            <div class="row items-center no-wrap text-body2">
              <q-space></q-space>
              <div>{{ "还应收款" }}</div>
              <q-icon class="q-ml-sm" v-if="OrderStore.sortKey === 'amountBookOfOrderRest'"
                :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
            </div>
          </q-th>
          <q-th key="amountBookOfOrderVAT" :props="props" class="text-right cursor-pointer"
            :class="{ 'text-negative': OrderStore.sortKey === 'amountBookOfOrderVAT' }"
            @click="OrderStore.sort('amountBookOfOrderVAT')">
            <div class="row items-center no-wrap text-body2">
              <q-space></q-space>
              <div>{{ "已开发票" }}</div>
              <q-icon class="q-pl-sm" v-if="OrderStore.sortKey === 'amountBookOfOrderVAT'"
                :name="OrderStore.sortValue == MongodbSort.DES ? 'south' : 'north'"></q-icon>
            </div>
          </q-th>
          <q-th class="text-left" key="event" :props="props">事件</q-th>
          <q-th class="text-left" key="_id" :props="props">操作</q-th>
          <q-th class="text-left" key="remark" :props="props">
            <q-input square filled dense clearable color="primary" placeholder="搜索备注" style="margin-left: -6px"
              v-model="OrderStore.search.remark" @blur="OrderStore.get(1)" />
          </q-th>
        </q-tr>
      </template>

      <template v-slot:body="props">
        <q-tr class="cursor-pointer" :class="{ 'bg-grey-4': props.expand }" @click.stop="async () => {
          if (props.expand === false) {
            OrderStore.loadding = true;
            await setOrderInfo(props.row);
            props.expand = true;
            OrderStore.loadding = false;
          } else {
            props.expand = false;
          }
        }
        ">
          <q-td key="timeContractString" :props="props">
            {{ props.row.timeContractString }}
          </q-td>
          <q-td key="timeCreateString" :props="props">
            {{ props.row.timeCreateString }}
          </q-td>
          <q-td key="code" :props="props">
            <q-badge rounded :color="props.row.isDisabled ? 'grey' : 'pink-6'" class="shadow-2 q-mr-sm">
            </q-badge>
            <span>{{ props.row.code }}</span>
          </q-td>
          <q-td key="contactId" :props="props" class="text-body1">
            <span v-if="props.row.joinContact?.name" class="ellipsis">{{
              props.row.joinContact.name
            }}</span>
            <span v-else class="text-grey">无</span>
          </q-td>
          <q-td key="amount" :props="props" :class="{
            'text-through': props.row.accounterId,
            'text-grey': props.row.amount < 1 || props.row.accounterId,
          }">
            {{ props.row.amount.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
          </q-td>
          <q-td key="amountBookOfOrder" class="text-grey" :props="props" :class="{
            'text-through': props.row.accounterId,
          }">
            {{ props.row.amountBookOfOrder.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
          </q-td>
          <q-td key="amountBookOfOrderRest" class="text-right" :props="props" :class="{
            'text-through': props.row.accounterId,
            'text-grey': props.row.amountBookOfOrderRest < 1 || props.row.accounterId,
            'text-weight-bold': props.row.amountBookOfOrderRest >= 1,
          }">
            {{ props.row.amountBookOfOrderRest.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
          </q-td>
          <q-td key="amountBookOfOrderVAT" class="text-right text-grey" :props="props"
            :class="{ 'text-through': props.row.accounterId }">
            {{ props.row.amountBookOfOrderVAT.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
          </q-td>
          <q-td key="event" :props="props">
            <div class="row items-center no-wrap">
              <q-badge v-if="props.row.joinCluePrint" color="negative" class="q-mr-sm"
                @click="$router.push(`/wmss/system/clue?content=${props.row.code}`)">
                {{ props.row.joinCluePrint }}
                <q-tooltip class="text-body1">打印次数</q-tooltip>
              </q-badge>
              <q-badge v-if="props.row.amountBookOfOrderVAT > 0" color="purple" class="q-mr-sm">已开发票</q-badge>
              <q-badge v-if="props.row.isNotTax"> 不含税</q-badge>
            </div>
          </q-td>

          <q-td key="_id" :props="props" style="padding: 0px 8px">
            <q-btn push dense square label="打印" class="q-mr-xs" color="negative" @click.stop="async () => {
              await setOrderInfo(props.row);
              orderPrinting = props.row;
              printDialog = true;
            }
            " />
            <q-btn push dense square label="出库" class="q-mr-xs" :disable="!!props.row.managerId"
              :color="!!props.row.managerId ? 'standard' : 'primary'"
              :text-color="!!props.row.managerId ? 'grey' : 'white'" @click.stop="setManager(props.row)" />
            <q-btn push dense square label="结清" class="q-mr-xs" :disable="!!props.row.accounterId"
              :color="props.row.accounterId ? 'standard' : 'teal'"
              :text-color="props.row.accounterId ? 'grey' : 'white'" @click.stop="setAccounter(props.row)">
              <q-tooltip class="text-body1">
                <div>结清意味着您已知晓：</div>
                <div>1.此订单已经收到所有款项</div>
                <div>2.此订单销售发票已经开出</div>
              </q-tooltip>
            </q-btn>
          </q-td>
          <q-td key="remark" :props="props">
            <span class="cursor-pointer" :class="props.row.remark ? 'text-primary' : 'text-grey'" @click="() => {
              OrderStore.setEditor(props.row);
              orderDialog = true;
            }
            ">
              {{ props.row.remark || "点击修改" }}
            </span>
          </q-td>
        </q-tr>

        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%" style="padding: 0">
            <div class="row">
              <div class="col-9 q-pa-sm">
                <list-sku :skus="props.row.joinSku || []"></list-sku>
              </div>
              <div class="col-3">
                <div>
                  <q-card square class="q-mb-sm">
                    <q-card-section>
                      <div class="text-h6 text-weight-bold">单据（销售）</div>

                      <div class="q-mb-sm"></div>
                      <div class="row text-body1">
                        <span class="col-3 text-grey">开单时间</span>
                        <span class="col-9 text-grey text-right text-weight-bold">
                          {{ props.row.timeCreateString }}
                        </span>
                      </div>
                      <div class="row text-body1">
                        <span class="col-3 text-grey">开单人</span>
                        <span class="col-9 text-grey text-right text-weight-bold">{{
                          props.row.joinCreator?.nickname
                        }}</span>
                      </div>

                      <div class="q-mb-sm"></div>
                      <div class="row text-body1">
                        <span class="col-3 text-grey">合同时间</span>
                        <span class="col-9 text-right text-weight-bold ellipsis">{{
                          props.row.timeContractString
                        }}</span>
                      </div>
                      <div class="row text-body1">
                        <span class="col-3 text-grey">客户信息</span>
                        <span class="col-9 text-right text-weight-bold ellipsis">{{
                          props.row.joinContact?.name || "无"
                        }}</span>
                      </div>
                    </q-card-section>
                    <q-card-actions>
                      <q-btn :class="{ 'text-negative': props.row.isNotTax }" @click="setTax(props.row)">
                        {{ props.row.isNotTax ? "不含税" : "含税" }}
                      </q-btn>
                      <q-space></q-space>
                      <q-btn class="q-ml-sm" text-color="negative" :disabled="!!props.row.managerId ||
                        !!props.row.accounterId ||
                        props.row.joinChildOrder?.length > 0
                        " @click="async () => {
                          await OrderStore.delete(props.row._id);
                          OrderStore.get(1, true);
                        }
                        ">
                        {{ props.row.isDisabled ? "恢复" : "删除" }}
                      </q-btn>
                      <q-btn v-if="!props.row.isDisabled" :disabled="!!props.row.managerId ||
                        !!props.row.accounterId ||
                        props.row.joinChildOrder?.length > 0
                        " class="q-ml-sm" text-color="primary" @click="() => {
                          OrderStore.setEditor(props.row);
                          SkuStore.listPicked = cloneDeep(props.row.joinSku);
                          $router.push('/wmss/trade/sale-edit');
                        }
                        ">
                        编辑
                      </q-btn>
                      <q-tooltip v-if="
                        !!props.row.managerId ||
                        !!props.row.accounterId ||
                        props.row.joinChildOrder?.length > 0
                      " class="text-body1">
                        <div v-if="!!props.row.managerId">* 检查到出库人签字，无法修改</div>
                        <div v-if="props.row.joinChildOrder?.length > 0">
                          * 检查到出库单，无法修改
                        </div>
                        <div v-if="!!props.row.accounterId">* 订单已结清签字，无法修改</div>
                      </q-tooltip>
                    </q-card-actions>
                  </q-card>
                  <q-card square class="q-mb-sm">
                    <q-card-section>
                      <div class="text-body1 text-grey" v-if="props.row.joinBookOfOrder">
                        <div>
                          <q-badge rounded :color="props.row.joinBookOfOrder.filter(
                            (e: BookOfOrder) => e.bookType === ENUM_BOOK_TYPE.YSZK && e.bookDirection === ENUM_BOOK_DIRECTION.DAI
                          ).length ? 'teal' : 'grey'" class="shadow-2 q-mr-sm">
                          </q-badge>收到货款
                        </div>
                        <div class="row q-mt-xs" v-for="BO in props.row.joinBookOfOrder.filter(
                          (e: BookOfOrder) => e.bookType === ENUM_BOOK_TYPE.YSZK && e.bookDirection === ENUM_BOOK_DIRECTION.DAI
                        )" :key="BO._id">
                          <span class="col-8 text-grey" style="white-space: break-spaces">{{ BO.joinBook?.keyOrigin ||
                            "客户异常" }}
                          </span>
                          <span class="col-4 text-right text-teal text-weight-bold text-underline cursor-pointer"
                            @click="
                              $router.push(`/wmss/trade/book-112201?code=${BO.joinBook?.code}`)
                              ">
                            {{ BO.amount.toFixed(2) }} 元
                          </span>
                        </div>
                      </div>
                    </q-card-section>
                    <q-card-actions>
                      <q-btn class="q-ml-auto" :disabled="!!props.row.accounterId" @click="() => {
                        pickQrderQuickBooking(props.row);
                        quickBookModal = true;
                      }
                      ">
                        快速收款
                      </q-btn>
                    </q-card-actions>
                    <q-separator />
                  </q-card>
                  <q-card square class="q-mb-sm">
                    <q-card-section>
                      <div class="text-body1 text-grey" v-if="props.row.joinBookOfOrder">
                        <div>
                          <q-badge rounded :color="props.row.joinBookOfOrder.filter(
                            (e: BookOfOrder) => e.bookType === ENUM_BOOK_TYPE.YSZK_VAT && e.bookDirection === ENUM_BOOK_DIRECTION.JIE
                          ).length ? 'purple' : 'grey'" class="shadow-2 q-mr-sm">
                          </q-badge>已开出发票：
                        </div>
                        <div class="row q-mt-xs" v-for="BO in props.row.joinBookOfOrder.filter(
                          (e: BookOfOrder) => e.bookType === ENUM_BOOK_TYPE.YSZK_VAT && e.bookDirection === ENUM_BOOK_DIRECTION.JIE
                        )" :key="BO._id">
                          <span class="col-8 text-grey" style="white-space: break-spaces">{{ BO.joinBook?.keyOrigin ||
                            "客户异常" }}
                          </span>
                          <span class="col-4 text-right text-purple text-weight-bold text-underline cursor-pointer"
                            @click="
                              $router.push(`/wmss/trade/book-112202?code=${BO.joinBook?.code}`)
                              ">
                            {{ BO.amount.toFixed(2) }} 元
                          </span>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                  <q-card square class="q-mb-sm">
                    <q-card-section>
                      <div class="text-h6 text-weight-bold">财务审核</div>
                      <div class="text-grey q-mb-sm" style="text-wrap: unset; white-space: initial">
                        结清：您已确认此订单已经收到所有款项，同时也知晓销售发票已经开出。
                      </div>
                      <div class="row text-body1 q-mt-xs">
                        <span class="col text-grey">
                          <q-badge rounded :color="props.row.accounterId ? 'teal' : 'grey'" class="shadow-2 q-mr-sm">
                          </q-badge>结清确认
                        </span>
                        <span class="col text-right text-weight-bold">{{ props.row.joinAccounter?.nickname || "无" }}

                          <a v-if="props.row.accounterId" class="cursor-pointer text-negative text-underline"
                            @click.stop="setAccounter(props.row, true)">
                            取消
                          </a>
                        </span>
                      </div>
                    </q-card-section>
                  </q-card>
                  <q-card square class="q-mb-sm">
                    <q-card-section>
                      <div class="text-h6 text-weight-bold">仓库信息</div>
                      <div class="row text-body1">
                        <span class="col-6 text-grey">
                          <q-badge rounded :color="props.row.managerId ? 'primary' : 'grey'" class="shadow-2 q-mr-sm">
                          </q-badge>出库人
                        </span>
                        <span class="col-6 text-right text-weight-bold">
                          {{ props.row.joinManager?.nickname || "无" }}
                          <a v-if="props.row.managerId" class="cursor-pointer text-negative text-underline"
                            @click="setManager(props.row, true)">
                            取消
                          </a></span>
                      </div>
                      <div class="row text-body1 q-mt-xs">
                        <span class="col text-grey"><q-badge rounded
                            :color="props.row.joinChildOrder?.length > 0 ? 'primary' : 'grey'" class="shadow-2 q-mr-sm">
                          </q-badge>出库单

                          <span v-if="props.row.joinChildOrder?.length > 0">
                            <a v-if="props.row.managerId" class="cursor-pointer text-grey text-underline">
                              删除
                              <q-tooltip class="text-body1">请先取消出库人的签字</q-tooltip>
                            </a>
                            <a v-else class="cursor-pointer text-negative text-underline" @click="async () => {
                              await OrderStore.delete(props.row.joinChildOrder[0]._id);
                              setOrderInfo(props.row);
                            }
                            ">
                              删除
                            </a>
                          </span>
                        </span>
                        <span class="col text-right text-weight-bold">
                          <a v-if="props.row.joinChildOrder?.length > 0"
                            class="cursor-pointer text-negative text-underline" @click="async () => {
                              OrderStore.loadding = true;
                              await setOrderInfo(props.row.joinChildOrder[0]);
                              SkuStore.dialogSku(props.row.joinChildOrder[0].joinSku, {
                                title: '出库信息',
                                more: false,
                              });
                              OrderStore.loadding = false;
                            }
                            ">
                            查看
                          </a>
                          <span v-else class="text-bold">无</span>
                        </span>
                      </div>
                    </q-card-section>
                    <q-separator />
                    <q-card-section class="text-body2 text-grey" style="white-space: break-spaces">
                      <div>1.出库后将会通知仓库装货，并生成出库单</div>
                      <div>2.取消出库后，不会影响出库单</div>
                      <div>3.删除出库单后，您可以继续编辑此销售单</div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </q-td>
        </q-tr>
      </template>

      <template v-slot:bottom="props">
        <q-pagination size="16px" color="white" class="q-my-sm" text-color="black" active-color="primary"
          active-text-color="white" v-model="OrderStore.page.page" :max-pages="10"
          :max="Math.ceil(OrderStore.total / OrderStore.page.pageSize)"
          @update:model-value="(value) => OrderStore.get(value)" />
        <q-space></q-space>
        <span>共 {{ OrderStore.total }} 项</span>
      </template>

      <template v-slot:bottom-row="props">
        <q-tr class="bg-grey-11">
          <q-td v-for="column in props.cols" class="text-right">
            <div v-if="column.name === 'amount'" class="text-body1 q-py-sm">
              <div>
                {{ OrderStore.group.amount.toLocaleString("zh", { minimumFractionDigits: 2 }) }}
              </div>
              <div class="row text-negative">
                <span>合计：</span>
                <q-space></q-space>
                <span>金额</span>
              </div>
            </div>
            <div v-if="column.name === 'amountBookOfOrder'" class="text-body1 text-grey q-py-sm">
              <div>
                {{
                  OrderStore.group.amountBookOfOrder.toLocaleString("zh", {
                    minimumFractionDigits: 2,
                  })
                }}
              </div>
              <div class="row text-">
                <q-space></q-space>
                <span>已收</span>
              </div>
            </div>
            <div v-if="column.name === 'amountBookOfOrderRest'" class="text-body1 q-py-sm">
              <div class="text-weight-bold">
                {{
                  OrderStore.group.amountBookOfOrderRest.toLocaleString("zh", {
                    minimumFractionDigits: 2,
                  })
                }}
              </div>
              <div class="row text-">
                <q-space></q-space>
                <span>应收</span>
              </div>
            </div>
            <div v-if="column.name === 'amountBookOfOrderVAT'" class="text-body1 text-grey q-py-sm">
              <div>
                {{
                  OrderStore.group.amountBookOfOrderVAT.toLocaleString("zh", {
                    minimumFractionDigits: 2,
                  })
                }}
              </div>
              <div class="row text-">
                <q-space></q-space>
                <span>发票</span>
              </div>
            </div>
          </q-td>
        </q-tr>
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

      <list-contact @pick="(value) => {
        OrderStore.setEditor(OrderStore.getSchema(ENUM_ORDER.SALES));
        contactPicked = value;
        OrderStore.search.contactId = value._id;
        OrderStore.get(1);
      }
      "></list-contact>
    </q-card>
  </q-dialog>

  <q-dialog v-model="printDialog">
    <div class="row no-wrap" id="order-container">
      <q-card class="w-350" id="order-config">
        <q-card-section class="text-h6 text-bold"> 打印设置 </q-card-section>
        <q-separator></q-separator>
        <q-card-section>
          <div class="text-body1 q-mb-md q-ml-xs text-bold">公司别称</div>
          <q-input filled clearable color="primary" class="q-mb-sm" label="请输入公司别称" v-model="title.text"
            v-for="(title, index) in ConfigStore.titles" @blur="ConfigStore.post()">
            <template v-slot:after>
              <q-btn v-if="index === 0" fab outline padding="sm" icon="add" color="primary" @click="() => {
                ConfigStore.titles.push({ text: '公司别称' });
                ConfigStore.post();
              }
              "></q-btn>
              <q-btn v-else fab padding="sm" icon="remove" color="negative" @click="() => {
                ConfigStore.titles.splice(index, 1);
                ConfigStore.post();
              }
              "></q-btn>
            </template>
          </q-input>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section>
          <div class="text-body1 q-mb-sm q-ml-xs text-bold row items-center">
            销售信息
            <q-space></q-space>
            <q-btn :icon="infoColumnBase ? 'visibility' : 'visibility_off'" padding="xs" fab flat
              @click="infoColumnBase = !infoColumnBase"></q-btn>
          </div>
          <div v-show="infoColumnBase">
            <q-checkbox v-model="OrderStore.columnNameShow" label="品名规格"></q-checkbox>
            <q-checkbox v-model="OrderStore.columnCountShow" label="数量"></q-checkbox>
            <q-checkbox v-model="OrderStore.columnUnitShow" label="单位"></q-checkbox>
            <q-checkbox v-model="OrderStore.columnPoundsShow" label="重量"></q-checkbox>
            <q-checkbox v-model="OrderStore.columnPriceShow" label="单价"></q-checkbox>
            <q-checkbox v-model="OrderStore.columnPriceReverseShow" label="单价（从售价逆推算）"></q-checkbox>
            <q-checkbox v-model="OrderStore.columnPriceAllShow" label="售价"></q-checkbox>
            <q-checkbox v-model="OrderStore.columnRemarkShow" label="备注"></q-checkbox>
          </div>
          <div class="text-body1 q-my-sm q-ml-xs text-bold row items-center">
            其他信息
            <q-space></q-space>
            <q-btn :icon="infoColumnMore ? 'visibility' : 'visibility_off'" padding="xs" fab flat
              @click="infoColumnMore = !infoColumnMore"></q-btn>
          </div>
          <div v-show="infoColumnMore">
            <q-checkbox v-model="OrderStore.columnKeyOriginShow" label="产地"></q-checkbox>
            <q-checkbox v-model="OrderStore.columnKeyFeatShow" label="材质"></q-checkbox>
            <q-checkbox v-model="OrderStore.columnKeyCodeShow" label="捆包号"></q-checkbox>
            <q-checkbox v-model="OrderStore.columnKeyWarehouseShow" label="仓库"></q-checkbox>
            <q-checkbox v-model="OrderStore.columnKeyHouseShow" label="货位号"></q-checkbox>
          </div>
          <div class="text-body1 q-my-sm q-ml-xs text-bold row items-center">
            金额信息
            <q-space></q-space>
            <q-btn :icon="infoAmount ? 'visibility' : 'visibility_off'" padding="xs" fab flat
              @click="infoAmount = !infoAmount"></q-btn>
          </div>
          <div v-show="infoAmount">
            <q-checkbox v-model="rowAmountShow" label="金额合计"></q-checkbox>
          </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section>
          <div class="text-body1 q-mb-md q-ml-xs text-bold row">
            <span>提货仓库</span>
          </div>
          <div class="q-mb-sm row items-center"
            v-for="house in WarehouseStore.list.filter((e) => e.isDisabled === false)">
            <q-card class="col-10">
              <q-item class="col">
                <q-item-section>
                  <q-item-label>{{ house.name }}</q-item-label>
                  <q-item-label caption>{{ house.address }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-card>
            <div class="col-2 text-right">
              <q-btn fab padding="sm" icon="check" class="inset-shadow"
                :text-color="WarehouseStore.picked._id === house._id ? '' : 'primary'"
                :color="WarehouseStore.picked._id === house._id ? 'primary' : ''"
                @click="WarehouseStore.pick(house)"></q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-space id="order-space"></q-space>
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
              <div class="col text-right">
                公司联系方式：{{ CorpStore.picked?.contact || "尚未录入" }}
              </div>
            </div>
            <div class="row">
              <div class="col">合同日期：{{ orderPrinting.timeContractString }}</div>
              <div class="col text-center">开单人：{{ orderPrinting.joinCreator?.nickname }}</div>
              <div class="col text-right">No. {{ orderPrinting.code }}</div>
            </div>
            <table class="full-width">
              <tr>
                <th v-if="OrderStore.columnNameShow">品名规格</th>
                <th v-if="OrderStore.columnCountShow">数量</th>
                <th v-if="OrderStore.columnUnitShow">单位</th>
                <th v-if="OrderStore.columnPoundsShow">重量</th>
                <th v-if="OrderStore.columnPriceShow">单价/元</th>
                <th v-if="OrderStore.columnPriceReverseShow">* 单价/元</th>
                <th v-if="OrderStore.columnPriceAllShow">售价/元</th>
                <th v-if="OrderStore.columnRemarkShow">备注</th>
                <th v-if="OrderStore.columnKeyOriginShow">产地</th>
                <th v-if="OrderStore.columnKeyFeatShow">材质</th>
                <th v-if="OrderStore.columnKeyCodeShow">捆包号</th>
                <th v-if="OrderStore.columnKeyWarehouseShow">仓库</th>
                <th v-if="OrderStore.columnKeyHouseShow">货位号</th>
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
                    {{
                      (
                        (sku.price * (sku.isPriceInPounds ? sku.pounds : sku.count)) /
                        sku.count
                      ).toFixed(2)
                    }}
                  </span>
                </td>
                <td v-if="OrderStore.columnPriceAllShow">
                  <span v-show="sku.name && sku.norm">{{
                    (sku.price * (sku.isPriceInPounds ? sku.pounds : sku.count)).toFixed(2)
                  }}</span>
                </td>
                <td v-if="OrderStore.columnRemarkShow">{{ sku.remark }}</td>
                <td v-if="OrderStore.columnKeyOriginShow">{{ sku.keyOrigin }}</td>
                <td v-if="OrderStore.columnKeyFeatShow">{{ sku.keyFeat }}</td>
                <td v-if="OrderStore.columnKeyCodeShow">{{ sku.keyCode }}</td>
                <td v-if="OrderStore.columnKeyWarehouseShow">{{ sku.joinWarehouse?.name }}</td>
                <td v-if="OrderStore.columnKeyHouseShow">{{ sku.keyHouse }}</td>
              </tr>
            </table>
            <div class="order-table-line row" v-if="rowAmountShow">
              <div class="col">{{ getChineseMoney(orderPrinting.amount) }}</div>
              <div class="col">
                <span>共计：</span>
                <span v-if="orderPrintingTonsTotal > 0">{{ orderPrintingTonsTotal.toFixed(3) }} 吨，</span>
                <span>{{ orderPrinting.amount.toFixed(2) }} 元</span>
              </div>
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
              <div class="col-8 q-px-md" style="text-align: left">
                仓库地址：{{ WarehouseStore.picked?.address }}
              </div>
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
        <q-btn color="primary" v-close-popup @click="async () => {
          await OrderStore.put();
          await OrderStore.get();
        }
        ">
          保存
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="quickBookModal">
    <q-card class="w-400">
      <q-toolbar class="bg-primary text-white">
        <q-toolbar-title>
          <q-badge rounded color="teal" class="shadow-2 q-mr-sm"> </q-badge>
          {{ orderQuickBooking.joinContact?.name || "..." }}
        </q-toolbar-title>
        <q-btn dense flat icon="close" v-close-popup></q-btn>
      </q-toolbar>

      <q-list class="q-mt-md">
        <q-item class="q-py-none">
          <q-item-section>
            <q-item-label>剩余应收款：{{ orderQuickBooking.amountBookOfOrderRest }}</q-item-label>
            <q-item-label caption lines="2">订单金额：{{ orderQuickBooking.amount }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label>收款进度：{{
              (
                ((orderQuickBooking.amount - orderQuickBooking.amountBookOfOrderRest) /
                  orderQuickBooking.amount) *
                100
              ).toFixed(2)
            }}%</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <q-card-section>
        <q-input filled label="本次收款金额" v-model="orderQuickBooking.amountBookOfOrderRest" color="primary"
          class="q-mb-md" />
      </q-card-section>

      <q-card-actions>
        <q-space></q-space>
        <q-btn color="primary" :disable="orderQuickBooking.amountBookOfOrderRest <= 1" @click="async () => {
          await createOrderBookQuick112201();
          await OrderStore.get(1);
        }
        ">
          确定
        </q-btn>
      </q-card-actions>

      <q-inner-loading :showing="OrderStore.loadding">
        <q-spinner-gears size="50px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { getChineseMoney, getPage, MongodbSort } from "qqlx-cdk";
import { useRouter, useRoute } from "vue-router";
import { onMounted, ref, computed, nextTick } from "vue";
import { cloneDeep, debounce } from "lodash";
import { callPrinter } from "call-printer";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";

import {
  BookOfOrder,
  ENUM_BOOK_DIRECTION,
  ENUM_BOOK_TYPE,
  ENUM_LAYOUT_CABINET,
  ENUM_ORDER,
  MAP_ENUM_LAYOUT_CABINET,
} from "qqlx-core";
import type { Order, OrderJoined } from "qqlx-core";

import listSku from "@/components/list-sku.vue";
import dialogIntro from "@/components/dialog-intro.vue";
import listContact from "@/components/list-contact.vue";
import pickerRange from "@/components/picker-range.vue";
import plateOrder from "@/components/plate-order.vue";
import { useNotifyStore } from "@/stores/quasar/notify";
import { useUserStore } from "@/stores/user/user";
import { useCorpStore } from "@/stores/brand/corp";
import { useWarehouseStore } from "@/stores/brand/warehouse";
import { useContactStore } from "@/stores/brand/contact";
import { useSkuStore } from "@/stores/wmss/sku";
import { useOrderStore } from "@/stores/wmss/order";
import { useConfigStore } from "@/stores/brand/config";
import { useClueStore } from "@/stores/wmss/clue";
import { useBookStore } from "@/stores/wmss/book";
import { getPage2 } from "@/lib/time";

const NotifyStore = useNotifyStore();
const ClueStore = useClueStore();
const WarehouseStore = useWarehouseStore();
const AmountTooltip = ref(true);

const columnsVisiable = computed(() => OrderStore.columnsVisiable);
const OrderStore = useOrderStore();
const orderDialog = ref(false);
const downloadOrderList = async () => {
  try {
    await OrderStore.get(1);
    OrderStore.loadding = true;
    const orders = await OrderStore.geOrderWidthSku();

    // 单据
    const Out: any = [["创建时间", "单号", "客户名称", "单据金额", "单据备注"]];
    // SKU
    const SkuOut: any = [
      [
        "创建时间",
        "单号",
        "客户名称",
        "产地",
        "材质",
        "名称",
        "规格",
        "数量",
        "单位",
        "过磅",
        "过磅单位",
        "单价",
        "总金额",
        "备注",
      ],
    ];

    orders.map((E) => {
      const billouts = [
        E.timeCreateString,
        E.code,
        E.joinContact?.name,
        E.amount.toFixed(2),
        E.remark,
      ];
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
    order.amount = info.amount;
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
const orderPrintingTonsTotal = computed(() => {
  return skuPrinting.value
    .filter((e) => e.isPriceInPounds)
    .reduce((a, b) => a + b.pounds, 0);
});

const print = async () => {
  const dom = document.getElementById("order");
  callPrinter(dom as HTMLElement);
  await printLog();
  OrderStore.get();
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
const infoColumnBase = ref(true);
const infoColumnMore = ref(false);
const infoAmount = ref(false);
const rowAmountShow = ref(true);

const UserStore = useUserStore();
const setManager = async (order: OrderJoined, toClear = false) => {
  await setOrderInfo(order); // 保证必要数据
  const entity = cloneDeep(order);
  entity.managerId = toClear ? "" : UserStore.userEditor.userId;
  await OrderStore.put(entity);

  // 销售单出库，需要自动创建对应出库单
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
  target && (await setOrderInfo(target as OrderJoined));
};
const setAccounter = async (order: OrderJoined, toClear = false) => {
  const entity = cloneDeep(order);
  entity.accounterId = toClear ? "" : UserStore.userEditor.userId;
  await OrderStore.put(entity);

  // sku
  await OrderStore.get();
  const target = OrderStore.list.find((e) => e._id === entity._id);
  await setOrderInfo(target as OrderJoined);
};
const setTax = async (order: OrderJoined) => {
  const entity = cloneDeep(order);
  entity.isNotTax = !Boolean(order.isNotTax);
  await OrderStore.put(entity);

  // sku
  await OrderStore.get();
  const target = OrderStore.list.find((e) => e._id === entity._id);
  await setOrderInfo(target as OrderJoined);
};

// 快速收款
const BookStore = useBookStore();
const orderQuickBooking = ref(OrderStore.getSchema() as OrderJoined);
const quickBookModal = ref(false);
const pickQrderQuickBooking = (e: OrderJoined) => (orderQuickBooking.value = cloneDeep(e));
const createOrderBookQuick112201 = async () => {
  try {
    BookStore.setEditor(
      BookStore.getSchema({
        type: ENUM_BOOK_TYPE.YSZK,
        direction: ENUM_BOOK_DIRECTION.DAI,
      }),
    );
    BookStore.editor = {
      ...BookStore.editor,
      ...{
        amount: orderQuickBooking.value.amountBookOfOrderRest,
        keyOrigin: orderQuickBooking.value.joinContact?.name || "未知",
        keyHouse: "待补充",
        remark: "自动生成",
      },
    };
    const books = await BookStore.post(BookStore.editor);
    await BookStore.put(books[0], [
      {
        ...orderQuickBooking.value,
        ...{ amount: orderQuickBooking.value.amountBookOfOrderRest },
      },
    ]);
    quickBookModal.value = false;

    await OrderStore.get();
    setTimeout(async () => {
      const target = OrderStore.list.find((e) => e._id === orderQuickBooking.value._id);
      await setOrderInfo(target as OrderJoined);
    }, 755);
  } catch (error) {
    NotifyStore.fail((error as Error).message);
  }
};

const route = useRoute();
onMounted(() => {
  // 打印预设置
  // window.removeEventListener("afterprint", printLog);
  // window.addEventListener("afterprint", printLog);
  // 清空SKU
  SkuStore.listPicked = [];
  SkuStore.setEditor();
  // 清空订单
  OrderStore.setEditor(OrderStore.getSchema(ENUM_ORDER.SALES));
  // OrderStore.search.contactId = "";
  if (OrderStore.search.contactId) {
    contactPicked.value._id = OrderStore.search.contactId || "";
    contactPicked.value.name = "已选择";
  }
  OrderStore.page = getPage2(20);
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
      >th {
        border-top: 1px solid black;
        border-right: 1px solid black;

        &:first-child {
          border-left: 1px solid black;
        }
      }

      >td {
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
    >div {
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

#order-container {
  min-width: 1325px;
}

@media screen and (max-width: 1200px) {
  #order-container {
    min-width: 960px;
  }

  #order-config {
    display: none;
  }

  #order-space {
    display: none;
  }
}
</style>

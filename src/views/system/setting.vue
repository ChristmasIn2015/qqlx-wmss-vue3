<template>
    <div style="max-width: 1400px">
        <div class="text-h5 text-primary row items-center text-weight-bold q-pl-xs q-mb-sm">
            <span>系统设置</span>
            <dialog-intro />
        </div>

        <div class="row text-primary">
            <div class="col-4 q-pr-lg">
                <q-card>
                    <q-card-section class="text-center q-pt-lg cursor-pointer" @click="userDialog = true">
                        <q-avatar size="108px">
                            <img :src="UserStore.userEditor?.avator || UserStore.wxAvatorDefault" />
                        </q-avatar>
                        <div class="text-h5 text-bold q-mt-md">{{ UserStore.userEditor?.nickname }}</div>
                        <div class="text-grey">{{ UserStore.userEditor?.phone || "尚未设置手机号" }}</div>
                    </q-card-section>

                    <div class="text-center">
                        <q-btn class="q-mb-sm" flat color="negative" @click="$router.push('/wmss/login')">
                            <q-icon name="logout" class="q-mr-xs"></q-icon>
                            切换用户
                        </q-btn>
                    </div>
                </q-card>

                <div class="text-h6 text-bold q-my-md row items-center q-pl-xs">
                    相关公司
                    <q-space></q-space>
                    <q-btn square padding="xs" flat color="primary" @click="showCorpDisabled = !showCorpDisabled">
                        <q-icon :name="showCorpDisabled ? 'visibility' : 'visibility_off'"></q-icon>
                        <q-tooltip class="text-body1">
                            {{ showCorpDisabled ? "隐藏最近删除的公司" : "查看最近删除的公司" }}
                        </q-tooltip>
                    </q-btn>
                </div>

                <div v-show="showCorpDisabled">
                    <div class="text-center text-grey" v-show="CorpStore.list.filter((e) => e.isDisabled === true).length === 0">暂无已删除的公司</div>
                    <q-card class="q-mb-md" v-for="corp in CorpStore.list.filter((e) => e.isDisabled === true)">
                        <q-card-section>
                            <div class="row items-center" :class="corp._id === CorpStore.picked?._id ? 'text-weight-bold' : 'text-grey'">
                                <q-badge v-if="corp._id === CorpStore.picked?._id" floating color="negative">当前公司</q-badge>
                                <span class="ellipsis text-through">{{ corp.name }}</span>
                                <q-space></q-space>

                                <q-btn icon="more_horiz" padding="xs" flat>
                                    <q-menu>
                                        <q-item clickable v-close-popup>
                                            <q-item-section class="text-negative" @click="CorpStore.delete(corp)"> 恢复 </q-item-section>
                                        </q-item>
                                    </q-menu>
                                </q-btn>
                            </div>
                            <div class="text-grey">
                                <div class="ellipsis">联系方式：{{ corp.contact || "-" }}</div>
                                <div class="ellipsis">公司地址：{{ corp.address || "-" }}</div>
                                <div class="ellipsis row">
                                    您的角色：
                                    <q-space></q-space>
                                    <span v-if="corp.isRoot" class="text-bold">管理员</span>
                                    <span v-else>成员</span>
                                </div>
                            </div>
                        </q-card-section>
                    </q-card>
                </div>
                <q-card square v-for="corp in CorpStore.list.filter((e) => e.isDisabled === false)" class="q-my-md">
                    <q-card-section>
                        <div class="ellipsis row items-center" :class="corp._id === CorpStore.picked?._id ? 'text-bold' : 'text-grey'">
                            {{ corp.name }}
                            <q-space></q-space>
                            <q-badge v-if="corp._id === CorpStore.picked?._id" floating color="negative">当前公司</q-badge>
                            <q-btn v-else icon="more_horiz" padding="xs" flat>
                                <q-menu>
                                    <q-list>
                                        <q-item clickable v-close-popup @click="CorpStore.pick(corp)">
                                            <q-item-section>切换到这家</q-item-section>
                                        </q-item>
                                        <q-separator />
                                        <q-item
                                            clickable
                                            v-close-popup
                                            @click="
                                                () => {
                                                    CorpStore.setEditor(corp);
                                                    dialogCorp = true;
                                                }
                                            "
                                        >
                                            <q-item-section>修改</q-item-section>
                                        </q-item>
                                        <q-item clickable v-close-popup>
                                            <q-item-section class="text-negative" @click="CorpStore.delete(corp)">
                                                {{ corp.isDisabled ? "恢复" : "删除" }}
                                            </q-item-section>
                                        </q-item>
                                    </q-list>
                                </q-menu>
                            </q-btn>
                        </div>
                        <div class="text-grey">
                            <div class="ellipsis">公司地址：{{ corp.address || "-" }}</div>
                            <div class="ellipsis">联系方式：{{ corp.contact || "-" }}</div>
                            <div class="ellipsis row">
                                您的角色：
                                <q-space></q-space>
                                <span v-if="corp.isRoot" class="text-bold text-primary text-bold">管理员</span>
                                <span v-else>成员</span>
                            </div>
                        </div>
                    </q-card-section>
                </q-card>

                <q-btn
                    flat
                    color="primary"
                    class="full-width"
                    @click="
                        () => {
                            CorpStore.setEditor();
                            dialogCorp = true;
                        }
                    "
                >
                    <q-icon name="add" class="q-mr-xs"></q-icon>
                    创建新公司
                </q-btn>
            </div>

            <div class="col-8">
                <!-- 权限 -->
                <!-- 权限 -->
                <!-- 权限 -->
                <!-- 权限 -->
                <div class="text-h6 text-bold row items-center q-pl-xs q-mb-md">
                    操作权限
                    <q-space></q-space>
                    <q-btn square color="negative" @click="openBrandRole()">加入我们</q-btn>
                </div>
                <q-card class="q-py-md" square>
                    <q-splitter v-model="splitIndex">
                        <template v-slot:before>
                            <q-tabs v-model="tabIndex" dense vertical class="text-primary">
                                <q-tab
                                    class="q-my-md"
                                    v-for="RoleOption in tabOptions"
                                    :icon="RoleOption.icon"
                                    :name="RoleOption.value"
                                    :label="MAP_ENUM_BRAND_ROLE.get(RoleOption.value)?.text"
                                >
                                </q-tab>
                            </q-tabs>
                        </template>
                        <template v-slot:after>
                            <q-tab-panels v-model="tabIndex" animated>
                                <q-tab-panel v-for="RoleOption in tabOptions" :name="RoleOption.value" class="q-py-none">
                                    <div
                                        v-for="Role in BrandRoleStore.list
                                            .filter((e) => [ENUM_BRAND_ROLE.TRAINEE, ENUM_BRAND_ROLE.ROOT].includes(e.role))
                                            .reverse()"
                                    >
                                        <q-item>
                                            <q-item-section avatar>
                                                <q-avatar rounded v-if="Role.role === ENUM_BRAND_ROLE.ROOT">
                                                    <img :src="Role.joinUserInfo?.avator || UserStore.wxAvatorDefault" />
                                                    <q-badge floating>管理员</q-badge>
                                                </q-avatar>
                                                <q-avatar
                                                    v-else-if="
                                                        !!BrandRoleStore.list.filter((e) => e.userId === Role.userId).find((e) => e.role === RoleOption.value)
                                                    "
                                                    rounded
                                                    class="cursor-pointer"
                                                    @click="
                                                        BrandRoleStore.delete(
                                                            BrandRoleStore.list.filter((e) => e.userId === Role.userId).find((e) => e.role === RoleOption.value)
                                                                ?._id as string
                                                        )
                                                    "
                                                >
                                                    <img :src="Role.joinUserInfo?.avator || UserStore.wxAvatorDefault" />
                                                    <q-badge floating color="positive"> 已开启 </q-badge>
                                                </q-avatar>
                                                <q-avatar
                                                    rounded
                                                    v-else
                                                    class="cursor-pointer"
                                                    @click="BrandRoleStore.post(Role.joinUserInfo?.userId, RoleOption.value)"
                                                >
                                                    <img :src="Role.joinUserInfo?.avator || UserStore.wxAvatorDefault" />
                                                    <q-badge floating color="negative"> 已关闭 </q-badge>
                                                </q-avatar>
                                            </q-item-section>
                                            <q-item-section>
                                                <q-item-label class="text-weight-bold"> {{ Role.joinUserInfo?.nickname }} </q-item-label>
                                                <q-item-label class="text-weight-bold text-option"> -</q-item-label>
                                            </q-item-section>
                                            <q-item-section side>
                                                <q-item-label>
                                                    <q-btn dense icon="more_horiz" flat>
                                                        <q-menu>
                                                            <q-list class="w-100">
                                                                <q-item
                                                                    clickable
                                                                    v-close-popup
                                                                    :disable="Role.role === ENUM_BRAND_ROLE.ROOT"
                                                                    @click="BrandRoleStore.delete(Role._id)"
                                                                >
                                                                    <q-item-section class="text-negative">删除成员</q-item-section>
                                                                </q-item>
                                                            </q-list>
                                                        </q-menu>
                                                    </q-btn>
                                                </q-item-label>
                                                <q-item-label caption> </q-item-label>
                                            </q-item-section>
                                        </q-item>
                                        <q-separator></q-separator>
                                    </div>
                                </q-tab-panel>
                            </q-tab-panels>
                        </template>
                    </q-splitter>
                </q-card>
                <q-card class="q-mr-sm q-mb-sm" v-for="base in BrandRoleStore.list.filter((e) => e.role === ENUM_BRAND_ROLE.ENTERTAIN)">
                    <q-item>
                        <q-item-section avatar>
                            <q-avatar rounded>
                                <img :src="base.joinUserInfo?.avator || UserStore.wxAvatorDefault" />
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label class="text-weight-bold"> {{ base.joinUserInfo?.nickname }} </q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-item-label>
                                <q-btn dense icon="more_horiz" flat>
                                    <q-menu>
                                        <q-list class="w-100">
                                            <q-item clickable v-close-popup @click="BrandRoleStore.delete(base._id)">
                                                <q-item-section class="text-negative">删除成员</q-item-section>
                                            </q-item>
                                        </q-list>
                                    </q-menu>
                                </q-btn>
                            </q-item-label>
                            <q-item-label caption> </q-item-label>
                        </q-item-section>
                    </q-item>
                </q-card>
                <q-dialog v-model="dialogBrandRole">
                    <div class="text-center">
                        <q-card class="q-mt-xl q-pt-lg w-500">
                            <div id="wx-login-join"></div>
                        </q-card>
                    </div>
                </q-dialog>

                <!-- 支付 -->
                <!-- 支付 -->
                <!-- 支付 -->
                <!-- 支付 -->
                <div class="text-h6 text-bold row items-center q-pl-xs q-mt-lg">
                    时长卡
                    <q-space></q-space>
                    <q-btn square padding="xs" flat color="primary">
                        <q-icon name="list"></q-icon>
                        <q-tooltip class="text-body1">查看购买记录</q-tooltip>
                        <q-menu>
                            <q-table
                                dense
                                row-key="_id"
                                :columns="[
                                    { name: 'timeCreateString', field: 'timeCreateString', label: '生效时间', align: 'left' },
                                    { name: 'title', field: 'title', label: '商品名称', align: 'left' },
                                    { name: 'desc', field: 'desc', label: '描述', align: 'left' },
                                    { name: 'schedule', field: 'schedule', label: '含时长', align: 'right' },
                                    { name: 'amount', field: 'amount', label: '支付金额', align: 'right' },
                                    { name: 'status', field: 'status', label: '支付状态', align: 'right' },
                                ]"
                                :loading="ScheduleCardOrderStore.loadding"
                                :rows="ScheduleCardOrderStore.list"
                                :rows-per-page-options="[ScheduleCardOrderStore.page.pageSize]"
                            >
                                <template v-slot:body="props">
                                    <q-tr>
                                        <q-td key="timeCreateString" :props="props"> {{ props.row.timeCreateString }} </q-td>
                                        <q-td key="title" :props="props"> {{ props.row.joinCard?.title }} </q-td>
                                        <q-td key="desc" :props="props"> {{ props.row.joinCard?.desc }} </q-td>
                                        <q-td key="schedule" :props="props"> {{ props.row.joinCard?.schedule / 86400000 }} 天</q-td>
                                        <q-td key="amount" :props="props"> {{ props.row.amount }} 元 </q-td>
                                        <q-td key="status" :props="props"> {{ MAP_ENUM_PAY_STATUS_WECHAT.get(props.row.statusWeChatPay)?.text }} </q-td>
                                    </q-tr>
                                </template>
                            </q-table>
                        </q-menu>
                    </q-btn>
                </div>
                <div class="text-option text-primary q-mb-md q-pl-xs">
                    您正在选购时长卡，购买后将会增加 @{{ CorpStore.picked?.name }} 的使用期。 当前剩余：
                    <span class="text-body1 text-bold text-negative">{{ MarketScoAnalysisStore.message }}</span>
                </div>
                <div class="row">
                    <q-card v-for="card in ScheduleCardStore.list.filter((e) => e.isDisabled === false)" class="col q-mr-md">
                        <q-card-section>
                            <div class="text-h6 ellipsis">{{ card.title }}</div>
                            <div class="text-grey ellipsis">{{ card.desc || "-" }}</div>
                            <q-separator class="q-my-sm"></q-separator>
                            <div class="text-grey">
                                <div class="row">
                                    <div class="col">时长</div>
                                    <div class="col text-right">{{ card.schedule / 86400000 }} 天</div>
                                </div>
                                <div class="row items-end">
                                    <div class="col">金额</div>
                                    <div class="col text-right text-negative text-h6 text-weight-bold">{{ card.amount }} 元</div>
                                </div>
                            </div>
                        </q-card-section>
                        <q-card-actions>
                            <q-space></q-space>
                            <q-btn color="negative" :loading="ScheduleCardOrderStore.loadding" push square @click="ScheduleCardOrderStore.post(card)"
                                >购买</q-btn
                            >
                        </q-card-actions>
                    </q-card>
                    <div class="col"></div>
                </div>
                <q-dialog v-model="ScheduleCardOrderStore.dialog" persistent>
                    <q-card class="w-600">
                        <q-card-section>
                            <div class="text-h5 text-weight-bold">购买时长</div>
                            <div class="text-caption text-grey">
                                <div>您正在为 @{{ CorpStore.picked?.name }} 进行时长充值，打开手机微信APP，扫描下方二维码即可进行支付</div>
                            </div>
                        </q-card-section>
                        <q-card-section class="text-center q-py-none">
                            <q-img width="200px" :src="ScheduleCardOrderStore.WeChatPayUrl"></q-img>
                        </q-card-section>
                        <q-card-section class="text-center q-pt-none">
                            <q-img width="100px" src="https://wx.gtimg.com/outwxgtimg/imgs/logo/wxpaylogo_xxxhdpi.png"></q-img>
                        </q-card-section>
                        <q-card-actions>
                            <q-space></q-space>
                            <q-btn
                                v-close-popup
                                @click="
                                    async () => {
                                        await ScheduleCardOrderStore.get(1);
                                        await MarketScoAnalysisStore.get();
                                    }
                                "
                                >取消</q-btn
                            >
                            <q-btn
                                v-close-popup
                                color="positive"
                                @click="
                                    async () => {
                                        await ScheduleCardOrderStore.get(1);
                                        await MarketScoAnalysisStore.get();
                                    }
                                "
                                >我已完成支付</q-btn
                            >
                        </q-card-actions>
                    </q-card>
                </q-dialog>

                <!-- 提货仓库 -->
                <!-- 提货仓库 -->
                <!-- 提货仓库 -->
                <!-- 提货仓库 -->
                <div class="text-h6 text-bold row items-center q-pl-xs q-mt-lg q-mb-md">
                    提货仓库
                    <q-space></q-space>

                    <q-btn square padding="xs" flat color="primary" @click="showWarehouseIsDisabled = !showWarehouseIsDisabled">
                        <q-icon :name="showWarehouseIsDisabled ? 'visibility' : 'visibility_off'"></q-icon>
                        <q-tooltip class="text-body1">
                            {{ showWarehouseIsDisabled ? "隐藏最近删除的提货仓库" : "查看最近删除的提货仓库" }}
                        </q-tooltip>
                    </q-btn>
                </div>
                <div class="text-grey q-mb-md q-pl-xs">所有在 @{{ CorpStore.picked?.name }} 中的仓库</div>
                <div v-show="showWarehouseIsDisabled">
                    <div class="text-center text-grey q-mb-lg" v-show="WarehouseStore.list.filter((e) => e.isDisabled === true).length === 0">
                        暂无已删除的仓库
                    </div>
                    <q-card class="q-mb-sm" v-for="warehouse in WarehouseStore.list.filter((e) => e.isDisabled === true)">
                        <q-card-section class="text-grey">
                            <div class="text-weight-bold row items-center">
                                <span class="ellipsis text-through">{{ warehouse.name }}</span>
                                <q-space></q-space>

                                <q-btn icon="more_horiz" padding="xs" flat>
                                    <q-menu>
                                        <q-item clickable v-close-popup>
                                            <q-item-section
                                                class="text-negative"
                                                @click="
                                                    () => {
                                                        WarehouseStore.setEditor(warehouse);
                                                        WarehouseStore.editor.isDisabled = !WarehouseStore.editor.isDisabled;
                                                        WarehouseStore.patch();
                                                    }
                                                "
                                            >
                                                恢复
                                            </q-item-section>
                                        </q-item>
                                    </q-menu>
                                </q-btn>
                            </div>
                            <div class="ellipsis">地址：{{ warehouse.address || "-" }}</div>
                        </q-card-section>
                    </q-card>
                </div>
                <q-card class="q-mb-sm" v-for="warehouse in WarehouseStore.list.filter((e) => e.isDisabled === false)">
                    <q-card-section class="text-grey">
                        <div class="text-primary ellipsis text-weight-bold row items-center">
                            {{ warehouse.name }}
                            <q-space></q-space>

                            <q-btn icon="more_horiz" padding="xs" flat>
                                <q-menu>
                                    <q-item
                                        clickable
                                        v-close-popup
                                        @click="
                                            () => {
                                                WarehouseStore.setEditor(warehouse);
                                                warehouseDialog = true;
                                            }
                                        "
                                    >
                                        <q-item-section>修改</q-item-section>
                                    </q-item>
                                    <q-item clickable v-close-popup>
                                        <q-item-section
                                            class="text-negative"
                                            @click="
                                                () => {
                                                    WarehouseStore.setEditor(warehouse);
                                                    WarehouseStore.editor.isDisabled = !WarehouseStore.editor.isDisabled;
                                                    WarehouseStore.patch();
                                                }
                                            "
                                        >
                                            删除
                                        </q-item-section>
                                    </q-item>
                                </q-menu>
                            </q-btn>
                        </div>
                        <div class="ellipsis">地址：{{ warehouse.address || "-" }}</div>
                    </q-card-section>
                </q-card>
                <q-btn
                    flat
                    color="primary"
                    class="full-width q-mt-sm"
                    @click="
                        () => {
                            WarehouseStore.setEditor();
                            warehouseDialog = true;
                        }
                    "
                >
                    <q-icon name="add" class="q-mr-xs"></q-icon>
                    创建新仓库
                </q-btn>

                <!-- 公告 -->
                <!-- 公告 -->
                <!-- 公告 -->
                <!-- 公告 -->
                <div class="text-h6 text-bold row items-center q-pl-xs q-mt-lg">
                    公告
                    <q-space></q-space>
                </div>
                <div class="text-grey q-mb-md q-pl-xs">所有在 @{{ CorpStore.picked?.name }} 的成员都能看见公告</div>
                <q-card v-for="(announce, index) in AnnounceStore.list" class="q-mb-sm">
                    <q-card-section class="text-grey">
                        <div class="text-primary ellipsis row items-center">
                            {{ announce.content }}
                            <q-space></q-space>
                            <q-btn icon="more_horiz" padding="xs" flat>
                                <q-menu>
                                    <q-item clickable>
                                        <q-item-section>
                                            修改
                                            <q-menu>
                                                <q-card>
                                                    <q-card-section class="text-body1 q-pb-none">修改公告</q-card-section>
                                                    <q-card-section>
                                                        <q-input
                                                            dense
                                                            filled
                                                            borderless
                                                            type="textarea"
                                                            input-class="text-body1"
                                                            placeholder="请输入公告内容"
                                                            v-model="announce.content"
                                                        />
                                                    </q-card-section>
                                                    <q-card-actions>
                                                        <q-space></q-space>
                                                        <q-btn color="primary" v-close-popup @click="() => AnnounceStore.patch(announce)">确定</q-btn>
                                                    </q-card-actions>
                                                </q-card>
                                            </q-menu>
                                        </q-item-section>
                                    </q-item>
                                    <q-item clickable v-close-popup>
                                        <q-item-section class="text-negative" @click="AnnounceStore.delete(announce)">删除</q-item-section>
                                    </q-item>
                                </q-menu>
                            </q-btn>
                        </div>
                    </q-card-section>
                </q-card>
                <q-btn flat color="primary" class="full-width">
                    <q-icon name="add" class="q-mr-xs"></q-icon>
                    创建新公告

                    <q-menu>
                        <q-card>
                            <q-card-section class="text-body1 q-pb-none">添加公告</q-card-section>
                            <q-card-section>
                                <q-input
                                    dense
                                    filled
                                    borderless
                                    type="textarea"
                                    input-class="text-body1"
                                    placeholder="请输入公告内容"
                                    v-model="AnnounceStore.editor.content"
                                />
                            </q-card-section>
                            <q-card-actions>
                                <q-space></q-space>
                                <q-btn color="primary" v-close-popup @click="() => AnnounceStore.post()">确定</q-btn>
                            </q-card-actions>
                        </q-card>
                    </q-menu>
                </q-btn>
            </div>
        </div>
    </div>

    <!-- 个人中心弹窗 -->
    <!-- 个人中心弹窗 -->
    <q-dialog v-model="userDialog" persistent>
        <q-card class="w-400">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>个人信息</q-toolbar-title>

                <q-btn flat dense icon="close" v-close-popup />
            </q-toolbar>

            <q-separator />

            <q-card-section>
                <q-input filled label="用户昵称" class="q-mb-sm" v-model="UserStore.userEditor.nickname">
                    <template v-slot:append> </template>
                </q-input>
            </q-card-section>

            <q-card-actions>
                <q-space></q-space>

                <q-btn color="primary" @click="UserStore.patch()">保存</q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>

    <q-dialog v-model="dialogCorp">
        <q-card class="w-400">
            <q-toolbar>
                <q-toolbar-title>公司</q-toolbar-title>
                <q-btn dense flat icon="close" v-close-popup></q-btn>
            </q-toolbar>
            <q-separator />

            <q-card-section>
                <q-input filled label="公司名称" class="q-mb-sm" v-model="CorpStore.editor.name">
                    <template v-slot:before>
                        <q-icon name="person" />
                    </template>
                </q-input>

                <q-input filled label="联系方式" class="q-mb-sm" v-model="CorpStore.editor.contact">
                    <template v-slot:before>
                        <q-icon name="phone" />
                    </template>
                </q-input>

                <q-input filled label="公司地址" class="q-mb-sm" v-model="CorpStore.editor.address">
                    <template v-slot:before>
                        <q-icon name="event" />
                    </template>
                </q-input>
            </q-card-section>

            <q-card-actions>
                <q-space></q-space>
                <q-btn
                    color="primary"
                    push
                    square
                    @click="
                        async () => {
                            if (CorpStore.editor._id) await CorpStore.patch();
                            else await CorpStore.post();
                            dialogCorp = false;
                        }
                    "
                >
                    {{ CorpStore.editor._id ? "保存" : "新增" }}
                </q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>

    <q-dialog v-model="warehouseDialog">
        <q-card class="w-400">
            <q-toolbar class="bg-primary text-white">
                <q-toolbar-title> 提货仓库 </q-toolbar-title>
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
import { useRouter } from "vue-router";
import { onMounted, ref, computed } from "vue";

import { ENUM_ORDER, MAP_ENUM_PAY_STATUS_WECHAT, ENUM_BRAND_ROLE, MAP_ENUM_BRAND_ROLE } from "qqlx-core";
import { getTime, getRangeDay, getRangeWeek, getRangeMonth, getRangeYear } from "qqlx-cdk";

import dialogIntro from "@/components/dialog-intro.vue";
import { useUserStore } from "@/stores/user/user";
import { useAnalysisStore } from "@/stores/wmss/analysis";
import { useCorpStore } from "@/stores/brand/corp";
import { useBrandRoleStore } from "@/stores/brand/role";
import { useAnnounceStore } from "@/stores/brand/announce";
import { useWarehouseStore } from "@/stores/brand/warehouse";
import { useAreaStore } from "@/stores/brand/area";
import { useMarketScoAnalysisStore } from "@/stores/market/analysis";
import { useScheduleCardStore } from "@/stores/market/scheduleCard";
import { useScheduleCardOrderStore } from "@/stores/market/scheduleCardOrder";

const UserStore = useUserStore();
const userDialog = ref(false);

const CorpStore = useCorpStore();
const dialogCorp = ref(false);
const showCorpDisabled = ref(false);
const AnnounceStore = useAnnounceStore();

const BrandRoleStore = useBrandRoleStore();
const dialogBrandRole = ref(false);
const splitIndex = ref(15);
const tabIndex = ref(ENUM_BRAND_ROLE.WM);
const tabOptions = ref([
    { icon: "construction", value: ENUM_BRAND_ROLE.WM },
    { icon: "shopping_cart", value: ENUM_BRAND_ROLE.PURCHASE },
    { icon: "phone_callback", value: ENUM_BRAND_ROLE.SALES },
    { icon: "add_card", value: ENUM_BRAND_ROLE.FINANCE },
]);
const openBrandRole = () => {
    dialogBrandRole.value = true;
    setTimeout(() => {
        const WxLogin = window.WxLogin as any;
        WxLogin &&
            document.getElementById("wx-login-join") &&
            new WxLogin({
                id: "wx-login-join",
                appid: "wxd0e6ee13822ccb7f",
                scope: "snsapi_login",
                redirect_uri: "http://qqlx.tech/wmss/login",
                state: `JOIN`,
            });
    }, 500);
};

const WarehouseStore = useWarehouseStore();
const warehouseDialog = ref(false);
const showWarehouseIsDisabled = ref(false);

const ScheduleCardStore = useScheduleCardStore();
const ScheduleCardOrderStore = useScheduleCardOrderStore();
const MarketScoAnalysisStore = useMarketScoAnalysisStore();
onMounted(async () => {
    BrandRoleStore.get();
    ScheduleCardStore.get();
    ScheduleCardOrderStore.get(1);
});
</script>

<style scoped lang="scss"></style>

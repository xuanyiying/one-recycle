# 管理端C端用户管理 - Spec

## Why

管理端需要对小程序端（C端）用户进行管理，包括查看用户列表、用户详情、用户积分、订单情况等，以便运营人员了解用户情况、进行客服支持。

## What Changes

* **Server**: 新增 C 端用户管理相关 API（用户列表、用户详情、用户积分记录、订单记录）

* **Admin Web**: 新增用户管理页面（用户列表、用户详情）

## Impact

* Affected specs: 无

* Affected code:

  * `server/src/modules/customer/controller/service`

  * `apps/admin-web/src/app/(dashboard)/customers/` - 新增用户管理页面

## ADDED Requirements

### Requirement: C端用户列表查询

系统 SHALL 提供 C 端用户列表查询接口，支持分页、筛选、搜索。

#### Scenario: 查询用户列表

* **WHEN** 管理员请求用户列表

* **THEN** 返回用户列表，包含基本信息和统计数据

* **AND** 支持按手机号、昵称、注册时间筛选

* **AND** 支持分页

#### Scenario: 搜索用户

* **WHEN** 管理员输入搜索关键词

* **THEN** 返回匹配的用户列表

* **AND** 支持手机号、昵称搜索

### Requirement: C端用户详情查看

系统 SHALL 提供 C 端用户详情接口，返回用户的完整信息。

#### Scenario: 查看用户详情

* **WHEN** 管理员请求查看某用户详情

* **THEN** 返回用户基本信息、积分信息、订单统计、邀请关系

### Requirement: C端用户积分记录

系统 SHALL 提供用户积分记录查询接口。

#### Scenario: 查看积分记录

* **WHEN** 管理员请求某用户的积分记录

* **THEN** 返回该用户的积分变动记录列表

* **AND** 支持按时间范围筛选

### Requirement: C端用户订单记录

系统 SHALL 提供用户订单记录查询接口。

#### Scenario: 查看订单记录

* **WHEN** 管理员请求某用户的订单记录

* **THEN** 返回该用户的订单列表

* **AND** 支持按订单状态筛选

* **AND** 支持分页

### Requirement: C端用户管理页面

管理端 SHALL 提供用户管理页面，包括用户列表页和用户详情页。

#### Scenario: 用户列表页

* **WHEN** 管理员访问用户管理页面

* **THEN** 展示用户列表，包含筛选和分页功能

* **AND** 显示用户基本信息、积分、订单数

#### Scenario: 用户详情页

* **WHEN** 管理员点击某用户查看详情

* **THEN** 展示用户完整信息和操作记录

## MODIFIED Requirements

无修改需求。

## REMOVED Requirements

无移除功能。

## Technical Notes

* 用户列表接口需要高效，支持大数据量

* 积分统计和订单统计使用聚合查询

* 管理端需要区分 C 端用户和后台管理员


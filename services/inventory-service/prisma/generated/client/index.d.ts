
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Warehouse
 * 
 */
export type Warehouse = $Result.DefaultSelection<Prisma.$WarehousePayload>
/**
 * Model ItemCategory
 * 
 */
export type ItemCategory = $Result.DefaultSelection<Prisma.$ItemCategoryPayload>
/**
 * Model InventoryItem
 * 
 */
export type InventoryItem = $Result.DefaultSelection<Prisma.$InventoryItemPayload>
/**
 * Model InventoryTransaction
 * 
 */
export type InventoryTransaction = $Result.DefaultSelection<Prisma.$InventoryTransactionPayload>
/**
 * Model SalesRecord
 * 
 */
export type SalesRecord = $Result.DefaultSelection<Prisma.$SalesRecordPayload>
/**
 * Model QualityCheck
 * 
 */
export type QualityCheck = $Result.DefaultSelection<Prisma.$QualityCheckPayload>
/**
 * Model Reservation
 * 
 */
export type Reservation = $Result.DefaultSelection<Prisma.$ReservationPayload>
/**
 * Model InventoryMovement
 * 
 */
export type InventoryMovement = $Result.DefaultSelection<Prisma.$InventoryMovementPayload>
/**
 * Model PricingRule
 * 
 */
export type PricingRule = $Result.DefaultSelection<Prisma.$PricingRulePayload>
/**
 * Model InventoryAlert
 * 
 */
export type InventoryAlert = $Result.DefaultSelection<Prisma.$InventoryAlertPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const WarehouseType: {
  MAIN: 'MAIN',
  BRANCH: 'BRANCH',
  TRANSIT: 'TRANSIT',
  RETURN: 'RETURN'
};

export type WarehouseType = (typeof WarehouseType)[keyof typeof WarehouseType]


export const WarehouseStatus: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  MAINTENANCE: 'MAINTENANCE'
};

export type WarehouseStatus = (typeof WarehouseStatus)[keyof typeof WarehouseStatus]


export const InventoryStatus: {
  IN_STOCK: 'IN_STOCK',
  LOW_STOCK: 'LOW_STOCK',
  OUT_OF_STOCK: 'OUT_OF_STOCK'
};

export type InventoryStatus = (typeof InventoryStatus)[keyof typeof InventoryStatus]


export const ItemType: {
  RECYCLED: 'RECYCLED',
  PURCHASED: 'PURCHASED',
  RETURNED: 'RETURNED'
};

export type ItemType = (typeof ItemType)[keyof typeof ItemType]


export const ItemCondition: {
  EXCELLENT: 'EXCELLENT',
  GOOD: 'GOOD',
  FAIR: 'FAIR',
  POOR: 'POOR',
  DAMAGED: 'DAMAGED'
};

export type ItemCondition = (typeof ItemCondition)[keyof typeof ItemCondition]


export const ProcessingStatus: {
  RECEIVED: 'RECEIVED',
  INSPECTING: 'INSPECTING',
  PROCESSING: 'PROCESSING',
  CLEANED: 'CLEANED',
  REPAIRED: 'REPAIRED',
  READY: 'READY',
  REJECTED: 'REJECTED'
};

export type ProcessingStatus = (typeof ProcessingStatus)[keyof typeof ProcessingStatus]


export const TransactionType: {
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND',
  ADJUSTMENT: 'ADJUSTMENT',
  TRANSFER_OUT: 'TRANSFER_OUT',
  TRANSFER_IN: 'TRANSFER_IN'
};

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType]


export const CheckType: {
  INITIAL: 'INITIAL',
  DETAILED: 'DETAILED',
  FINAL: 'FINAL',
  RANDOM: 'RANDOM'
};

export type CheckType = (typeof CheckType)[keyof typeof CheckType]


export const CheckResult: {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  CONDITIONAL: 'CONDITIONAL'
};

export type CheckResult = (typeof CheckResult)[keyof typeof CheckResult]


export const ReservationStatus: {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED'
};

export type ReservationStatus = (typeof ReservationStatus)[keyof typeof ReservationStatus]


export const MovementType: {
  PURCHASE: 'PURCHASE',
  RECYCLE_IN: 'RECYCLE_IN',
  SALE_OUT: 'SALE_OUT',
  TRANSFER_IN: 'TRANSFER_IN',
  TRANSFER_OUT: 'TRANSFER_OUT',
  ADJUST_IN: 'ADJUST_IN',
  ADJUST_OUT: 'ADJUST_OUT',
  DAMAGE_OUT: 'DAMAGE_OUT',
  RETURN_IN: 'RETURN_IN',
  RETURN_OUT: 'RETURN_OUT'
};

export type MovementType = (typeof MovementType)[keyof typeof MovementType]


export const MovementDirection: {
  IN: 'IN',
  OUT: 'OUT'
};

export type MovementDirection = (typeof MovementDirection)[keyof typeof MovementDirection]


export const PriceType: {
  RECYCLE: 'RECYCLE',
  SALE: 'SALE',
  WHOLESALE: 'WHOLESALE'
};

export type PriceType = (typeof PriceType)[keyof typeof PriceType]


export const AlertType: {
  LOW_STOCK: 'LOW_STOCK',
  HIGH_STOCK: 'HIGH_STOCK',
  EXPIRY: 'EXPIRY',
  ZERO_STOCK: 'ZERO_STOCK'
};

export type AlertType = (typeof AlertType)[keyof typeof AlertType]


export const AlertLevel: {
  INFO: 'INFO',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL'
};

export type AlertLevel = (typeof AlertLevel)[keyof typeof AlertLevel]


export const AlertStatus: {
  PENDING: 'PENDING',
  HANDLED: 'HANDLED',
  IGNORED: 'IGNORED'
};

export type AlertStatus = (typeof AlertStatus)[keyof typeof AlertStatus]

}

export type WarehouseType = $Enums.WarehouseType

export const WarehouseType: typeof $Enums.WarehouseType

export type WarehouseStatus = $Enums.WarehouseStatus

export const WarehouseStatus: typeof $Enums.WarehouseStatus

export type InventoryStatus = $Enums.InventoryStatus

export const InventoryStatus: typeof $Enums.InventoryStatus

export type ItemType = $Enums.ItemType

export const ItemType: typeof $Enums.ItemType

export type ItemCondition = $Enums.ItemCondition

export const ItemCondition: typeof $Enums.ItemCondition

export type ProcessingStatus = $Enums.ProcessingStatus

export const ProcessingStatus: typeof $Enums.ProcessingStatus

export type TransactionType = $Enums.TransactionType

export const TransactionType: typeof $Enums.TransactionType

export type CheckType = $Enums.CheckType

export const CheckType: typeof $Enums.CheckType

export type CheckResult = $Enums.CheckResult

export const CheckResult: typeof $Enums.CheckResult

export type ReservationStatus = $Enums.ReservationStatus

export const ReservationStatus: typeof $Enums.ReservationStatus

export type MovementType = $Enums.MovementType

export const MovementType: typeof $Enums.MovementType

export type MovementDirection = $Enums.MovementDirection

export const MovementDirection: typeof $Enums.MovementDirection

export type PriceType = $Enums.PriceType

export const PriceType: typeof $Enums.PriceType

export type AlertType = $Enums.AlertType

export const AlertType: typeof $Enums.AlertType

export type AlertLevel = $Enums.AlertLevel

export const AlertLevel: typeof $Enums.AlertLevel

export type AlertStatus = $Enums.AlertStatus

export const AlertStatus: typeof $Enums.AlertStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Warehouses
 * const warehouses = await prisma.warehouse.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Warehouses
   * const warehouses = await prisma.warehouse.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.warehouse`: Exposes CRUD operations for the **Warehouse** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Warehouses
    * const warehouses = await prisma.warehouse.findMany()
    * ```
    */
  get warehouse(): Prisma.WarehouseDelegate<ExtArgs>;

  /**
   * `prisma.itemCategory`: Exposes CRUD operations for the **ItemCategory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ItemCategories
    * const itemCategories = await prisma.itemCategory.findMany()
    * ```
    */
  get itemCategory(): Prisma.ItemCategoryDelegate<ExtArgs>;

  /**
   * `prisma.inventoryItem`: Exposes CRUD operations for the **InventoryItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InventoryItems
    * const inventoryItems = await prisma.inventoryItem.findMany()
    * ```
    */
  get inventoryItem(): Prisma.InventoryItemDelegate<ExtArgs>;

  /**
   * `prisma.inventoryTransaction`: Exposes CRUD operations for the **InventoryTransaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InventoryTransactions
    * const inventoryTransactions = await prisma.inventoryTransaction.findMany()
    * ```
    */
  get inventoryTransaction(): Prisma.InventoryTransactionDelegate<ExtArgs>;

  /**
   * `prisma.salesRecord`: Exposes CRUD operations for the **SalesRecord** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SalesRecords
    * const salesRecords = await prisma.salesRecord.findMany()
    * ```
    */
  get salesRecord(): Prisma.SalesRecordDelegate<ExtArgs>;

  /**
   * `prisma.qualityCheck`: Exposes CRUD operations for the **QualityCheck** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more QualityChecks
    * const qualityChecks = await prisma.qualityCheck.findMany()
    * ```
    */
  get qualityCheck(): Prisma.QualityCheckDelegate<ExtArgs>;

  /**
   * `prisma.reservation`: Exposes CRUD operations for the **Reservation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Reservations
    * const reservations = await prisma.reservation.findMany()
    * ```
    */
  get reservation(): Prisma.ReservationDelegate<ExtArgs>;

  /**
   * `prisma.inventoryMovement`: Exposes CRUD operations for the **InventoryMovement** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InventoryMovements
    * const inventoryMovements = await prisma.inventoryMovement.findMany()
    * ```
    */
  get inventoryMovement(): Prisma.InventoryMovementDelegate<ExtArgs>;

  /**
   * `prisma.pricingRule`: Exposes CRUD operations for the **PricingRule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PricingRules
    * const pricingRules = await prisma.pricingRule.findMany()
    * ```
    */
  get pricingRule(): Prisma.PricingRuleDelegate<ExtArgs>;

  /**
   * `prisma.inventoryAlert`: Exposes CRUD operations for the **InventoryAlert** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InventoryAlerts
    * const inventoryAlerts = await prisma.inventoryAlert.findMany()
    * ```
    */
  get inventoryAlert(): Prisma.InventoryAlertDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Warehouse: 'Warehouse',
    ItemCategory: 'ItemCategory',
    InventoryItem: 'InventoryItem',
    InventoryTransaction: 'InventoryTransaction',
    SalesRecord: 'SalesRecord',
    QualityCheck: 'QualityCheck',
    Reservation: 'Reservation',
    InventoryMovement: 'InventoryMovement',
    PricingRule: 'PricingRule',
    InventoryAlert: 'InventoryAlert'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "warehouse" | "itemCategory" | "inventoryItem" | "inventoryTransaction" | "salesRecord" | "qualityCheck" | "reservation" | "inventoryMovement" | "pricingRule" | "inventoryAlert"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Warehouse: {
        payload: Prisma.$WarehousePayload<ExtArgs>
        fields: Prisma.WarehouseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WarehouseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WarehouseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>
          }
          findFirst: {
            args: Prisma.WarehouseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WarehouseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>
          }
          findMany: {
            args: Prisma.WarehouseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>[]
          }
          create: {
            args: Prisma.WarehouseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>
          }
          createMany: {
            args: Prisma.WarehouseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WarehouseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>[]
          }
          delete: {
            args: Prisma.WarehouseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>
          }
          update: {
            args: Prisma.WarehouseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>
          }
          deleteMany: {
            args: Prisma.WarehouseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WarehouseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.WarehouseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WarehousePayload>
          }
          aggregate: {
            args: Prisma.WarehouseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWarehouse>
          }
          groupBy: {
            args: Prisma.WarehouseGroupByArgs<ExtArgs>
            result: $Utils.Optional<WarehouseGroupByOutputType>[]
          }
          count: {
            args: Prisma.WarehouseCountArgs<ExtArgs>
            result: $Utils.Optional<WarehouseCountAggregateOutputType> | number
          }
        }
      }
      ItemCategory: {
        payload: Prisma.$ItemCategoryPayload<ExtArgs>
        fields: Prisma.ItemCategoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ItemCategoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCategoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ItemCategoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCategoryPayload>
          }
          findFirst: {
            args: Prisma.ItemCategoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCategoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ItemCategoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCategoryPayload>
          }
          findMany: {
            args: Prisma.ItemCategoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCategoryPayload>[]
          }
          create: {
            args: Prisma.ItemCategoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCategoryPayload>
          }
          createMany: {
            args: Prisma.ItemCategoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ItemCategoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCategoryPayload>[]
          }
          delete: {
            args: Prisma.ItemCategoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCategoryPayload>
          }
          update: {
            args: Prisma.ItemCategoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCategoryPayload>
          }
          deleteMany: {
            args: Prisma.ItemCategoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ItemCategoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ItemCategoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ItemCategoryPayload>
          }
          aggregate: {
            args: Prisma.ItemCategoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateItemCategory>
          }
          groupBy: {
            args: Prisma.ItemCategoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<ItemCategoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.ItemCategoryCountArgs<ExtArgs>
            result: $Utils.Optional<ItemCategoryCountAggregateOutputType> | number
          }
        }
      }
      InventoryItem: {
        payload: Prisma.$InventoryItemPayload<ExtArgs>
        fields: Prisma.InventoryItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InventoryItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InventoryItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>
          }
          findFirst: {
            args: Prisma.InventoryItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InventoryItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>
          }
          findMany: {
            args: Prisma.InventoryItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>[]
          }
          create: {
            args: Prisma.InventoryItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>
          }
          createMany: {
            args: Prisma.InventoryItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InventoryItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>[]
          }
          delete: {
            args: Prisma.InventoryItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>
          }
          update: {
            args: Prisma.InventoryItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>
          }
          deleteMany: {
            args: Prisma.InventoryItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InventoryItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.InventoryItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryItemPayload>
          }
          aggregate: {
            args: Prisma.InventoryItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInventoryItem>
          }
          groupBy: {
            args: Prisma.InventoryItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<InventoryItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.InventoryItemCountArgs<ExtArgs>
            result: $Utils.Optional<InventoryItemCountAggregateOutputType> | number
          }
        }
      }
      InventoryTransaction: {
        payload: Prisma.$InventoryTransactionPayload<ExtArgs>
        fields: Prisma.InventoryTransactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InventoryTransactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryTransactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InventoryTransactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryTransactionPayload>
          }
          findFirst: {
            args: Prisma.InventoryTransactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryTransactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InventoryTransactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryTransactionPayload>
          }
          findMany: {
            args: Prisma.InventoryTransactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryTransactionPayload>[]
          }
          create: {
            args: Prisma.InventoryTransactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryTransactionPayload>
          }
          createMany: {
            args: Prisma.InventoryTransactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InventoryTransactionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryTransactionPayload>[]
          }
          delete: {
            args: Prisma.InventoryTransactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryTransactionPayload>
          }
          update: {
            args: Prisma.InventoryTransactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryTransactionPayload>
          }
          deleteMany: {
            args: Prisma.InventoryTransactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InventoryTransactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.InventoryTransactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryTransactionPayload>
          }
          aggregate: {
            args: Prisma.InventoryTransactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInventoryTransaction>
          }
          groupBy: {
            args: Prisma.InventoryTransactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<InventoryTransactionGroupByOutputType>[]
          }
          count: {
            args: Prisma.InventoryTransactionCountArgs<ExtArgs>
            result: $Utils.Optional<InventoryTransactionCountAggregateOutputType> | number
          }
        }
      }
      SalesRecord: {
        payload: Prisma.$SalesRecordPayload<ExtArgs>
        fields: Prisma.SalesRecordFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SalesRecordFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SalesRecordPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SalesRecordFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SalesRecordPayload>
          }
          findFirst: {
            args: Prisma.SalesRecordFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SalesRecordPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SalesRecordFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SalesRecordPayload>
          }
          findMany: {
            args: Prisma.SalesRecordFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SalesRecordPayload>[]
          }
          create: {
            args: Prisma.SalesRecordCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SalesRecordPayload>
          }
          createMany: {
            args: Prisma.SalesRecordCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SalesRecordCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SalesRecordPayload>[]
          }
          delete: {
            args: Prisma.SalesRecordDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SalesRecordPayload>
          }
          update: {
            args: Prisma.SalesRecordUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SalesRecordPayload>
          }
          deleteMany: {
            args: Prisma.SalesRecordDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SalesRecordUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SalesRecordUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SalesRecordPayload>
          }
          aggregate: {
            args: Prisma.SalesRecordAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSalesRecord>
          }
          groupBy: {
            args: Prisma.SalesRecordGroupByArgs<ExtArgs>
            result: $Utils.Optional<SalesRecordGroupByOutputType>[]
          }
          count: {
            args: Prisma.SalesRecordCountArgs<ExtArgs>
            result: $Utils.Optional<SalesRecordCountAggregateOutputType> | number
          }
        }
      }
      QualityCheck: {
        payload: Prisma.$QualityCheckPayload<ExtArgs>
        fields: Prisma.QualityCheckFieldRefs
        operations: {
          findUnique: {
            args: Prisma.QualityCheckFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QualityCheckPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.QualityCheckFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QualityCheckPayload>
          }
          findFirst: {
            args: Prisma.QualityCheckFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QualityCheckPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.QualityCheckFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QualityCheckPayload>
          }
          findMany: {
            args: Prisma.QualityCheckFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QualityCheckPayload>[]
          }
          create: {
            args: Prisma.QualityCheckCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QualityCheckPayload>
          }
          createMany: {
            args: Prisma.QualityCheckCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.QualityCheckCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QualityCheckPayload>[]
          }
          delete: {
            args: Prisma.QualityCheckDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QualityCheckPayload>
          }
          update: {
            args: Prisma.QualityCheckUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QualityCheckPayload>
          }
          deleteMany: {
            args: Prisma.QualityCheckDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.QualityCheckUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.QualityCheckUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$QualityCheckPayload>
          }
          aggregate: {
            args: Prisma.QualityCheckAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateQualityCheck>
          }
          groupBy: {
            args: Prisma.QualityCheckGroupByArgs<ExtArgs>
            result: $Utils.Optional<QualityCheckGroupByOutputType>[]
          }
          count: {
            args: Prisma.QualityCheckCountArgs<ExtArgs>
            result: $Utils.Optional<QualityCheckCountAggregateOutputType> | number
          }
        }
      }
      Reservation: {
        payload: Prisma.$ReservationPayload<ExtArgs>
        fields: Prisma.ReservationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ReservationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReservationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ReservationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReservationPayload>
          }
          findFirst: {
            args: Prisma.ReservationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReservationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ReservationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReservationPayload>
          }
          findMany: {
            args: Prisma.ReservationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReservationPayload>[]
          }
          create: {
            args: Prisma.ReservationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReservationPayload>
          }
          createMany: {
            args: Prisma.ReservationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ReservationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReservationPayload>[]
          }
          delete: {
            args: Prisma.ReservationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReservationPayload>
          }
          update: {
            args: Prisma.ReservationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReservationPayload>
          }
          deleteMany: {
            args: Prisma.ReservationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ReservationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ReservationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ReservationPayload>
          }
          aggregate: {
            args: Prisma.ReservationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateReservation>
          }
          groupBy: {
            args: Prisma.ReservationGroupByArgs<ExtArgs>
            result: $Utils.Optional<ReservationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ReservationCountArgs<ExtArgs>
            result: $Utils.Optional<ReservationCountAggregateOutputType> | number
          }
        }
      }
      InventoryMovement: {
        payload: Prisma.$InventoryMovementPayload<ExtArgs>
        fields: Prisma.InventoryMovementFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InventoryMovementFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryMovementPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InventoryMovementFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryMovementPayload>
          }
          findFirst: {
            args: Prisma.InventoryMovementFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryMovementPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InventoryMovementFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryMovementPayload>
          }
          findMany: {
            args: Prisma.InventoryMovementFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryMovementPayload>[]
          }
          create: {
            args: Prisma.InventoryMovementCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryMovementPayload>
          }
          createMany: {
            args: Prisma.InventoryMovementCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InventoryMovementCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryMovementPayload>[]
          }
          delete: {
            args: Prisma.InventoryMovementDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryMovementPayload>
          }
          update: {
            args: Prisma.InventoryMovementUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryMovementPayload>
          }
          deleteMany: {
            args: Prisma.InventoryMovementDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InventoryMovementUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.InventoryMovementUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryMovementPayload>
          }
          aggregate: {
            args: Prisma.InventoryMovementAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInventoryMovement>
          }
          groupBy: {
            args: Prisma.InventoryMovementGroupByArgs<ExtArgs>
            result: $Utils.Optional<InventoryMovementGroupByOutputType>[]
          }
          count: {
            args: Prisma.InventoryMovementCountArgs<ExtArgs>
            result: $Utils.Optional<InventoryMovementCountAggregateOutputType> | number
          }
        }
      }
      PricingRule: {
        payload: Prisma.$PricingRulePayload<ExtArgs>
        fields: Prisma.PricingRuleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PricingRuleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricingRulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PricingRuleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricingRulePayload>
          }
          findFirst: {
            args: Prisma.PricingRuleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricingRulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PricingRuleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricingRulePayload>
          }
          findMany: {
            args: Prisma.PricingRuleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricingRulePayload>[]
          }
          create: {
            args: Prisma.PricingRuleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricingRulePayload>
          }
          createMany: {
            args: Prisma.PricingRuleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PricingRuleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricingRulePayload>[]
          }
          delete: {
            args: Prisma.PricingRuleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricingRulePayload>
          }
          update: {
            args: Prisma.PricingRuleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricingRulePayload>
          }
          deleteMany: {
            args: Prisma.PricingRuleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PricingRuleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PricingRuleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PricingRulePayload>
          }
          aggregate: {
            args: Prisma.PricingRuleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePricingRule>
          }
          groupBy: {
            args: Prisma.PricingRuleGroupByArgs<ExtArgs>
            result: $Utils.Optional<PricingRuleGroupByOutputType>[]
          }
          count: {
            args: Prisma.PricingRuleCountArgs<ExtArgs>
            result: $Utils.Optional<PricingRuleCountAggregateOutputType> | number
          }
        }
      }
      InventoryAlert: {
        payload: Prisma.$InventoryAlertPayload<ExtArgs>
        fields: Prisma.InventoryAlertFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InventoryAlertFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InventoryAlertFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertPayload>
          }
          findFirst: {
            args: Prisma.InventoryAlertFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InventoryAlertFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertPayload>
          }
          findMany: {
            args: Prisma.InventoryAlertFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertPayload>[]
          }
          create: {
            args: Prisma.InventoryAlertCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertPayload>
          }
          createMany: {
            args: Prisma.InventoryAlertCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InventoryAlertCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertPayload>[]
          }
          delete: {
            args: Prisma.InventoryAlertDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertPayload>
          }
          update: {
            args: Prisma.InventoryAlertUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertPayload>
          }
          deleteMany: {
            args: Prisma.InventoryAlertDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InventoryAlertUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.InventoryAlertUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InventoryAlertPayload>
          }
          aggregate: {
            args: Prisma.InventoryAlertAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInventoryAlert>
          }
          groupBy: {
            args: Prisma.InventoryAlertGroupByArgs<ExtArgs>
            result: $Utils.Optional<InventoryAlertGroupByOutputType>[]
          }
          count: {
            args: Prisma.InventoryAlertCountArgs<ExtArgs>
            result: $Utils.Optional<InventoryAlertCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type WarehouseCountOutputType
   */

  export type WarehouseCountOutputType = {
    inventoryItems: number
    movements: number
  }

  export type WarehouseCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inventoryItems?: boolean | WarehouseCountOutputTypeCountInventoryItemsArgs
    movements?: boolean | WarehouseCountOutputTypeCountMovementsArgs
  }

  // Custom InputTypes
  /**
   * WarehouseCountOutputType without action
   */
  export type WarehouseCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the WarehouseCountOutputType
     */
    select?: WarehouseCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * WarehouseCountOutputType without action
   */
  export type WarehouseCountOutputTypeCountInventoryItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventoryItemWhereInput
  }

  /**
   * WarehouseCountOutputType without action
   */
  export type WarehouseCountOutputTypeCountMovementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventoryMovementWhereInput
  }


  /**
   * Count Type ItemCategoryCountOutputType
   */

  export type ItemCategoryCountOutputType = {
    children: number
    inventoryItems: number
    movements: number
    pricingRules: number
  }

  export type ItemCategoryCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    children?: boolean | ItemCategoryCountOutputTypeCountChildrenArgs
    inventoryItems?: boolean | ItemCategoryCountOutputTypeCountInventoryItemsArgs
    movements?: boolean | ItemCategoryCountOutputTypeCountMovementsArgs
    pricingRules?: boolean | ItemCategoryCountOutputTypeCountPricingRulesArgs
  }

  // Custom InputTypes
  /**
   * ItemCategoryCountOutputType without action
   */
  export type ItemCategoryCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCategoryCountOutputType
     */
    select?: ItemCategoryCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ItemCategoryCountOutputType without action
   */
  export type ItemCategoryCountOutputTypeCountChildrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ItemCategoryWhereInput
  }

  /**
   * ItemCategoryCountOutputType without action
   */
  export type ItemCategoryCountOutputTypeCountInventoryItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventoryItemWhereInput
  }

  /**
   * ItemCategoryCountOutputType without action
   */
  export type ItemCategoryCountOutputTypeCountMovementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventoryMovementWhereInput
  }

  /**
   * ItemCategoryCountOutputType without action
   */
  export type ItemCategoryCountOutputTypeCountPricingRulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PricingRuleWhereInput
  }


  /**
   * Count Type InventoryItemCountOutputType
   */

  export type InventoryItemCountOutputType = {
    transactions: number
    salesRecords: number
    qualityChecks: number
    movements: number
    reservations: number
  }

  export type InventoryItemCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transactions?: boolean | InventoryItemCountOutputTypeCountTransactionsArgs
    salesRecords?: boolean | InventoryItemCountOutputTypeCountSalesRecordsArgs
    qualityChecks?: boolean | InventoryItemCountOutputTypeCountQualityChecksArgs
    movements?: boolean | InventoryItemCountOutputTypeCountMovementsArgs
    reservations?: boolean | InventoryItemCountOutputTypeCountReservationsArgs
  }

  // Custom InputTypes
  /**
   * InventoryItemCountOutputType without action
   */
  export type InventoryItemCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItemCountOutputType
     */
    select?: InventoryItemCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InventoryItemCountOutputType without action
   */
  export type InventoryItemCountOutputTypeCountTransactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventoryTransactionWhereInput
  }

  /**
   * InventoryItemCountOutputType without action
   */
  export type InventoryItemCountOutputTypeCountSalesRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SalesRecordWhereInput
  }

  /**
   * InventoryItemCountOutputType without action
   */
  export type InventoryItemCountOutputTypeCountQualityChecksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: QualityCheckWhereInput
  }

  /**
   * InventoryItemCountOutputType without action
   */
  export type InventoryItemCountOutputTypeCountMovementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventoryMovementWhereInput
  }

  /**
   * InventoryItemCountOutputType without action
   */
  export type InventoryItemCountOutputTypeCountReservationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReservationWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Warehouse
   */

  export type AggregateWarehouse = {
    _count: WarehouseCountAggregateOutputType | null
    _avg: WarehouseAvgAggregateOutputType | null
    _sum: WarehouseSumAggregateOutputType | null
    _min: WarehouseMinAggregateOutputType | null
    _max: WarehouseMaxAggregateOutputType | null
  }

  export type WarehouseAvgAggregateOutputType = {
    id: number | null
    capacity: Decimal | null
  }

  export type WarehouseSumAggregateOutputType = {
    id: bigint | null
    capacity: Decimal | null
  }

  export type WarehouseMinAggregateOutputType = {
    id: bigint | null
    name: string | null
    code: string | null
    type: $Enums.WarehouseType | null
    address: string | null
    contactName: string | null
    contactPhone: string | null
    capacity: Decimal | null
    status: $Enums.WarehouseStatus | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WarehouseMaxAggregateOutputType = {
    id: bigint | null
    name: string | null
    code: string | null
    type: $Enums.WarehouseType | null
    address: string | null
    contactName: string | null
    contactPhone: string | null
    capacity: Decimal | null
    status: $Enums.WarehouseStatus | null
    description: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WarehouseCountAggregateOutputType = {
    id: number
    name: number
    code: number
    type: number
    address: number
    contactName: number
    contactPhone: number
    capacity: number
    status: number
    description: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type WarehouseAvgAggregateInputType = {
    id?: true
    capacity?: true
  }

  export type WarehouseSumAggregateInputType = {
    id?: true
    capacity?: true
  }

  export type WarehouseMinAggregateInputType = {
    id?: true
    name?: true
    code?: true
    type?: true
    address?: true
    contactName?: true
    contactPhone?: true
    capacity?: true
    status?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WarehouseMaxAggregateInputType = {
    id?: true
    name?: true
    code?: true
    type?: true
    address?: true
    contactName?: true
    contactPhone?: true
    capacity?: true
    status?: true
    description?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WarehouseCountAggregateInputType = {
    id?: true
    name?: true
    code?: true
    type?: true
    address?: true
    contactName?: true
    contactPhone?: true
    capacity?: true
    status?: true
    description?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type WarehouseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Warehouse to aggregate.
     */
    where?: WarehouseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Warehouses to fetch.
     */
    orderBy?: WarehouseOrderByWithRelationInput | WarehouseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WarehouseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Warehouses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Warehouses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Warehouses
    **/
    _count?: true | WarehouseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WarehouseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WarehouseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WarehouseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WarehouseMaxAggregateInputType
  }

  export type GetWarehouseAggregateType<T extends WarehouseAggregateArgs> = {
        [P in keyof T & keyof AggregateWarehouse]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWarehouse[P]>
      : GetScalarType<T[P], AggregateWarehouse[P]>
  }




  export type WarehouseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WarehouseWhereInput
    orderBy?: WarehouseOrderByWithAggregationInput | WarehouseOrderByWithAggregationInput[]
    by: WarehouseScalarFieldEnum[] | WarehouseScalarFieldEnum
    having?: WarehouseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WarehouseCountAggregateInputType | true
    _avg?: WarehouseAvgAggregateInputType
    _sum?: WarehouseSumAggregateInputType
    _min?: WarehouseMinAggregateInputType
    _max?: WarehouseMaxAggregateInputType
  }

  export type WarehouseGroupByOutputType = {
    id: bigint
    name: string
    code: string
    type: $Enums.WarehouseType
    address: string
    contactName: string | null
    contactPhone: string | null
    capacity: Decimal | null
    status: $Enums.WarehouseStatus
    description: string | null
    createdAt: Date
    updatedAt: Date
    _count: WarehouseCountAggregateOutputType | null
    _avg: WarehouseAvgAggregateOutputType | null
    _sum: WarehouseSumAggregateOutputType | null
    _min: WarehouseMinAggregateOutputType | null
    _max: WarehouseMaxAggregateOutputType | null
  }

  type GetWarehouseGroupByPayload<T extends WarehouseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WarehouseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WarehouseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WarehouseGroupByOutputType[P]>
            : GetScalarType<T[P], WarehouseGroupByOutputType[P]>
        }
      >
    >


  export type WarehouseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    type?: boolean
    address?: boolean
    contactName?: boolean
    contactPhone?: boolean
    capacity?: boolean
    status?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    inventoryItems?: boolean | Warehouse$inventoryItemsArgs<ExtArgs>
    movements?: boolean | Warehouse$movementsArgs<ExtArgs>
    _count?: boolean | WarehouseCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["warehouse"]>

  export type WarehouseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    type?: boolean
    address?: boolean
    contactName?: boolean
    contactPhone?: boolean
    capacity?: boolean
    status?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["warehouse"]>

  export type WarehouseSelectScalar = {
    id?: boolean
    name?: boolean
    code?: boolean
    type?: boolean
    address?: boolean
    contactName?: boolean
    contactPhone?: boolean
    capacity?: boolean
    status?: boolean
    description?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type WarehouseInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    inventoryItems?: boolean | Warehouse$inventoryItemsArgs<ExtArgs>
    movements?: boolean | Warehouse$movementsArgs<ExtArgs>
    _count?: boolean | WarehouseCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type WarehouseIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $WarehousePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Warehouse"
    objects: {
      inventoryItems: Prisma.$InventoryItemPayload<ExtArgs>[]
      movements: Prisma.$InventoryMovementPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      name: string
      code: string
      type: $Enums.WarehouseType
      address: string
      contactName: string | null
      contactPhone: string | null
      capacity: Prisma.Decimal | null
      status: $Enums.WarehouseStatus
      description: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["warehouse"]>
    composites: {}
  }

  type WarehouseGetPayload<S extends boolean | null | undefined | WarehouseDefaultArgs> = $Result.GetResult<Prisma.$WarehousePayload, S>

  type WarehouseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<WarehouseFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: WarehouseCountAggregateInputType | true
    }

  export interface WarehouseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Warehouse'], meta: { name: 'Warehouse' } }
    /**
     * Find zero or one Warehouse that matches the filter.
     * @param {WarehouseFindUniqueArgs} args - Arguments to find a Warehouse
     * @example
     * // Get one Warehouse
     * const warehouse = await prisma.warehouse.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WarehouseFindUniqueArgs>(args: SelectSubset<T, WarehouseFindUniqueArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Warehouse that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {WarehouseFindUniqueOrThrowArgs} args - Arguments to find a Warehouse
     * @example
     * // Get one Warehouse
     * const warehouse = await prisma.warehouse.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WarehouseFindUniqueOrThrowArgs>(args: SelectSubset<T, WarehouseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Warehouse that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WarehouseFindFirstArgs} args - Arguments to find a Warehouse
     * @example
     * // Get one Warehouse
     * const warehouse = await prisma.warehouse.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WarehouseFindFirstArgs>(args?: SelectSubset<T, WarehouseFindFirstArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Warehouse that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WarehouseFindFirstOrThrowArgs} args - Arguments to find a Warehouse
     * @example
     * // Get one Warehouse
     * const warehouse = await prisma.warehouse.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WarehouseFindFirstOrThrowArgs>(args?: SelectSubset<T, WarehouseFindFirstOrThrowArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Warehouses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WarehouseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Warehouses
     * const warehouses = await prisma.warehouse.findMany()
     * 
     * // Get first 10 Warehouses
     * const warehouses = await prisma.warehouse.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const warehouseWithIdOnly = await prisma.warehouse.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WarehouseFindManyArgs>(args?: SelectSubset<T, WarehouseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Warehouse.
     * @param {WarehouseCreateArgs} args - Arguments to create a Warehouse.
     * @example
     * // Create one Warehouse
     * const Warehouse = await prisma.warehouse.create({
     *   data: {
     *     // ... data to create a Warehouse
     *   }
     * })
     * 
     */
    create<T extends WarehouseCreateArgs>(args: SelectSubset<T, WarehouseCreateArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Warehouses.
     * @param {WarehouseCreateManyArgs} args - Arguments to create many Warehouses.
     * @example
     * // Create many Warehouses
     * const warehouse = await prisma.warehouse.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WarehouseCreateManyArgs>(args?: SelectSubset<T, WarehouseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Warehouses and returns the data saved in the database.
     * @param {WarehouseCreateManyAndReturnArgs} args - Arguments to create many Warehouses.
     * @example
     * // Create many Warehouses
     * const warehouse = await prisma.warehouse.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Warehouses and only return the `id`
     * const warehouseWithIdOnly = await prisma.warehouse.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WarehouseCreateManyAndReturnArgs>(args?: SelectSubset<T, WarehouseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Warehouse.
     * @param {WarehouseDeleteArgs} args - Arguments to delete one Warehouse.
     * @example
     * // Delete one Warehouse
     * const Warehouse = await prisma.warehouse.delete({
     *   where: {
     *     // ... filter to delete one Warehouse
     *   }
     * })
     * 
     */
    delete<T extends WarehouseDeleteArgs>(args: SelectSubset<T, WarehouseDeleteArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Warehouse.
     * @param {WarehouseUpdateArgs} args - Arguments to update one Warehouse.
     * @example
     * // Update one Warehouse
     * const warehouse = await prisma.warehouse.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WarehouseUpdateArgs>(args: SelectSubset<T, WarehouseUpdateArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Warehouses.
     * @param {WarehouseDeleteManyArgs} args - Arguments to filter Warehouses to delete.
     * @example
     * // Delete a few Warehouses
     * const { count } = await prisma.warehouse.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WarehouseDeleteManyArgs>(args?: SelectSubset<T, WarehouseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Warehouses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WarehouseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Warehouses
     * const warehouse = await prisma.warehouse.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WarehouseUpdateManyArgs>(args: SelectSubset<T, WarehouseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Warehouse.
     * @param {WarehouseUpsertArgs} args - Arguments to update or create a Warehouse.
     * @example
     * // Update or create a Warehouse
     * const warehouse = await prisma.warehouse.upsert({
     *   create: {
     *     // ... data to create a Warehouse
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Warehouse we want to update
     *   }
     * })
     */
    upsert<T extends WarehouseUpsertArgs>(args: SelectSubset<T, WarehouseUpsertArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Warehouses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WarehouseCountArgs} args - Arguments to filter Warehouses to count.
     * @example
     * // Count the number of Warehouses
     * const count = await prisma.warehouse.count({
     *   where: {
     *     // ... the filter for the Warehouses we want to count
     *   }
     * })
    **/
    count<T extends WarehouseCountArgs>(
      args?: Subset<T, WarehouseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WarehouseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Warehouse.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WarehouseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WarehouseAggregateArgs>(args: Subset<T, WarehouseAggregateArgs>): Prisma.PrismaPromise<GetWarehouseAggregateType<T>>

    /**
     * Group by Warehouse.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WarehouseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WarehouseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WarehouseGroupByArgs['orderBy'] }
        : { orderBy?: WarehouseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WarehouseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWarehouseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Warehouse model
   */
  readonly fields: WarehouseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Warehouse.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WarehouseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    inventoryItems<T extends Warehouse$inventoryItemsArgs<ExtArgs> = {}>(args?: Subset<T, Warehouse$inventoryItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findMany"> | Null>
    movements<T extends Warehouse$movementsArgs<ExtArgs> = {}>(args?: Subset<T, Warehouse$movementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryMovementPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Warehouse model
   */ 
  interface WarehouseFieldRefs {
    readonly id: FieldRef<"Warehouse", 'BigInt'>
    readonly name: FieldRef<"Warehouse", 'String'>
    readonly code: FieldRef<"Warehouse", 'String'>
    readonly type: FieldRef<"Warehouse", 'WarehouseType'>
    readonly address: FieldRef<"Warehouse", 'String'>
    readonly contactName: FieldRef<"Warehouse", 'String'>
    readonly contactPhone: FieldRef<"Warehouse", 'String'>
    readonly capacity: FieldRef<"Warehouse", 'Decimal'>
    readonly status: FieldRef<"Warehouse", 'WarehouseStatus'>
    readonly description: FieldRef<"Warehouse", 'String'>
    readonly createdAt: FieldRef<"Warehouse", 'DateTime'>
    readonly updatedAt: FieldRef<"Warehouse", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Warehouse findUnique
   */
  export type WarehouseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * Filter, which Warehouse to fetch.
     */
    where: WarehouseWhereUniqueInput
  }

  /**
   * Warehouse findUniqueOrThrow
   */
  export type WarehouseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * Filter, which Warehouse to fetch.
     */
    where: WarehouseWhereUniqueInput
  }

  /**
   * Warehouse findFirst
   */
  export type WarehouseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * Filter, which Warehouse to fetch.
     */
    where?: WarehouseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Warehouses to fetch.
     */
    orderBy?: WarehouseOrderByWithRelationInput | WarehouseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Warehouses.
     */
    cursor?: WarehouseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Warehouses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Warehouses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Warehouses.
     */
    distinct?: WarehouseScalarFieldEnum | WarehouseScalarFieldEnum[]
  }

  /**
   * Warehouse findFirstOrThrow
   */
  export type WarehouseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * Filter, which Warehouse to fetch.
     */
    where?: WarehouseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Warehouses to fetch.
     */
    orderBy?: WarehouseOrderByWithRelationInput | WarehouseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Warehouses.
     */
    cursor?: WarehouseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Warehouses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Warehouses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Warehouses.
     */
    distinct?: WarehouseScalarFieldEnum | WarehouseScalarFieldEnum[]
  }

  /**
   * Warehouse findMany
   */
  export type WarehouseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * Filter, which Warehouses to fetch.
     */
    where?: WarehouseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Warehouses to fetch.
     */
    orderBy?: WarehouseOrderByWithRelationInput | WarehouseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Warehouses.
     */
    cursor?: WarehouseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Warehouses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Warehouses.
     */
    skip?: number
    distinct?: WarehouseScalarFieldEnum | WarehouseScalarFieldEnum[]
  }

  /**
   * Warehouse create
   */
  export type WarehouseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * The data needed to create a Warehouse.
     */
    data: XOR<WarehouseCreateInput, WarehouseUncheckedCreateInput>
  }

  /**
   * Warehouse createMany
   */
  export type WarehouseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Warehouses.
     */
    data: WarehouseCreateManyInput | WarehouseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Warehouse createManyAndReturn
   */
  export type WarehouseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Warehouses.
     */
    data: WarehouseCreateManyInput | WarehouseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Warehouse update
   */
  export type WarehouseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * The data needed to update a Warehouse.
     */
    data: XOR<WarehouseUpdateInput, WarehouseUncheckedUpdateInput>
    /**
     * Choose, which Warehouse to update.
     */
    where: WarehouseWhereUniqueInput
  }

  /**
   * Warehouse updateMany
   */
  export type WarehouseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Warehouses.
     */
    data: XOR<WarehouseUpdateManyMutationInput, WarehouseUncheckedUpdateManyInput>
    /**
     * Filter which Warehouses to update
     */
    where?: WarehouseWhereInput
  }

  /**
   * Warehouse upsert
   */
  export type WarehouseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * The filter to search for the Warehouse to update in case it exists.
     */
    where: WarehouseWhereUniqueInput
    /**
     * In case the Warehouse found by the `where` argument doesn't exist, create a new Warehouse with this data.
     */
    create: XOR<WarehouseCreateInput, WarehouseUncheckedCreateInput>
    /**
     * In case the Warehouse was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WarehouseUpdateInput, WarehouseUncheckedUpdateInput>
  }

  /**
   * Warehouse delete
   */
  export type WarehouseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
    /**
     * Filter which Warehouse to delete.
     */
    where: WarehouseWhereUniqueInput
  }

  /**
   * Warehouse deleteMany
   */
  export type WarehouseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Warehouses to delete
     */
    where?: WarehouseWhereInput
  }

  /**
   * Warehouse.inventoryItems
   */
  export type Warehouse$inventoryItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryItemInclude<ExtArgs> | null
    where?: InventoryItemWhereInput
    orderBy?: InventoryItemOrderByWithRelationInput | InventoryItemOrderByWithRelationInput[]
    cursor?: InventoryItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InventoryItemScalarFieldEnum | InventoryItemScalarFieldEnum[]
  }

  /**
   * Warehouse.movements
   */
  export type Warehouse$movementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryMovement
     */
    select?: InventoryMovementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryMovementInclude<ExtArgs> | null
    where?: InventoryMovementWhereInput
    orderBy?: InventoryMovementOrderByWithRelationInput | InventoryMovementOrderByWithRelationInput[]
    cursor?: InventoryMovementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InventoryMovementScalarFieldEnum | InventoryMovementScalarFieldEnum[]
  }

  /**
   * Warehouse without action
   */
  export type WarehouseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Warehouse
     */
    select?: WarehouseSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: WarehouseInclude<ExtArgs> | null
  }


  /**
   * Model ItemCategory
   */

  export type AggregateItemCategory = {
    _count: ItemCategoryCountAggregateOutputType | null
    _avg: ItemCategoryAvgAggregateOutputType | null
    _sum: ItemCategorySumAggregateOutputType | null
    _min: ItemCategoryMinAggregateOutputType | null
    _max: ItemCategoryMaxAggregateOutputType | null
  }

  export type ItemCategoryAvgAggregateOutputType = {
    id: number | null
    parentId: number | null
    level: number | null
    sortOrder: number | null
  }

  export type ItemCategorySumAggregateOutputType = {
    id: bigint | null
    parentId: bigint | null
    level: number | null
    sortOrder: number | null
  }

  export type ItemCategoryMinAggregateOutputType = {
    id: bigint | null
    name: string | null
    code: string | null
    parentId: bigint | null
    level: number | null
    enabled: boolean | null
    iconUrl: string | null
    description: string | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ItemCategoryMaxAggregateOutputType = {
    id: bigint | null
    name: string | null
    code: string | null
    parentId: bigint | null
    level: number | null
    enabled: boolean | null
    iconUrl: string | null
    description: string | null
    sortOrder: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ItemCategoryCountAggregateOutputType = {
    id: number
    name: number
    code: number
    parentId: number
    level: number
    enabled: number
    iconUrl: number
    description: number
    sortOrder: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ItemCategoryAvgAggregateInputType = {
    id?: true
    parentId?: true
    level?: true
    sortOrder?: true
  }

  export type ItemCategorySumAggregateInputType = {
    id?: true
    parentId?: true
    level?: true
    sortOrder?: true
  }

  export type ItemCategoryMinAggregateInputType = {
    id?: true
    name?: true
    code?: true
    parentId?: true
    level?: true
    enabled?: true
    iconUrl?: true
    description?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ItemCategoryMaxAggregateInputType = {
    id?: true
    name?: true
    code?: true
    parentId?: true
    level?: true
    enabled?: true
    iconUrl?: true
    description?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ItemCategoryCountAggregateInputType = {
    id?: true
    name?: true
    code?: true
    parentId?: true
    level?: true
    enabled?: true
    iconUrl?: true
    description?: true
    sortOrder?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ItemCategoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ItemCategory to aggregate.
     */
    where?: ItemCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemCategories to fetch.
     */
    orderBy?: ItemCategoryOrderByWithRelationInput | ItemCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ItemCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ItemCategories
    **/
    _count?: true | ItemCategoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ItemCategoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ItemCategorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ItemCategoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ItemCategoryMaxAggregateInputType
  }

  export type GetItemCategoryAggregateType<T extends ItemCategoryAggregateArgs> = {
        [P in keyof T & keyof AggregateItemCategory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateItemCategory[P]>
      : GetScalarType<T[P], AggregateItemCategory[P]>
  }




  export type ItemCategoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ItemCategoryWhereInput
    orderBy?: ItemCategoryOrderByWithAggregationInput | ItemCategoryOrderByWithAggregationInput[]
    by: ItemCategoryScalarFieldEnum[] | ItemCategoryScalarFieldEnum
    having?: ItemCategoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ItemCategoryCountAggregateInputType | true
    _avg?: ItemCategoryAvgAggregateInputType
    _sum?: ItemCategorySumAggregateInputType
    _min?: ItemCategoryMinAggregateInputType
    _max?: ItemCategoryMaxAggregateInputType
  }

  export type ItemCategoryGroupByOutputType = {
    id: bigint
    name: string
    code: string
    parentId: bigint | null
    level: number
    enabled: boolean
    iconUrl: string | null
    description: string | null
    sortOrder: number
    createdAt: Date
    updatedAt: Date
    _count: ItemCategoryCountAggregateOutputType | null
    _avg: ItemCategoryAvgAggregateOutputType | null
    _sum: ItemCategorySumAggregateOutputType | null
    _min: ItemCategoryMinAggregateOutputType | null
    _max: ItemCategoryMaxAggregateOutputType | null
  }

  type GetItemCategoryGroupByPayload<T extends ItemCategoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ItemCategoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ItemCategoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ItemCategoryGroupByOutputType[P]>
            : GetScalarType<T[P], ItemCategoryGroupByOutputType[P]>
        }
      >
    >


  export type ItemCategorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    parentId?: boolean
    level?: boolean
    enabled?: boolean
    iconUrl?: boolean
    description?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | ItemCategory$parentArgs<ExtArgs>
    children?: boolean | ItemCategory$childrenArgs<ExtArgs>
    inventoryItems?: boolean | ItemCategory$inventoryItemsArgs<ExtArgs>
    movements?: boolean | ItemCategory$movementsArgs<ExtArgs>
    pricingRules?: boolean | ItemCategory$pricingRulesArgs<ExtArgs>
    _count?: boolean | ItemCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["itemCategory"]>

  export type ItemCategorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    code?: boolean
    parentId?: boolean
    level?: boolean
    enabled?: boolean
    iconUrl?: boolean
    description?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    parent?: boolean | ItemCategory$parentArgs<ExtArgs>
  }, ExtArgs["result"]["itemCategory"]>

  export type ItemCategorySelectScalar = {
    id?: boolean
    name?: boolean
    code?: boolean
    parentId?: boolean
    level?: boolean
    enabled?: boolean
    iconUrl?: boolean
    description?: boolean
    sortOrder?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ItemCategoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | ItemCategory$parentArgs<ExtArgs>
    children?: boolean | ItemCategory$childrenArgs<ExtArgs>
    inventoryItems?: boolean | ItemCategory$inventoryItemsArgs<ExtArgs>
    movements?: boolean | ItemCategory$movementsArgs<ExtArgs>
    pricingRules?: boolean | ItemCategory$pricingRulesArgs<ExtArgs>
    _count?: boolean | ItemCategoryCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ItemCategoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    parent?: boolean | ItemCategory$parentArgs<ExtArgs>
  }

  export type $ItemCategoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ItemCategory"
    objects: {
      parent: Prisma.$ItemCategoryPayload<ExtArgs> | null
      children: Prisma.$ItemCategoryPayload<ExtArgs>[]
      inventoryItems: Prisma.$InventoryItemPayload<ExtArgs>[]
      movements: Prisma.$InventoryMovementPayload<ExtArgs>[]
      pricingRules: Prisma.$PricingRulePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      name: string
      code: string
      parentId: bigint | null
      level: number
      enabled: boolean
      iconUrl: string | null
      description: string | null
      sortOrder: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["itemCategory"]>
    composites: {}
  }

  type ItemCategoryGetPayload<S extends boolean | null | undefined | ItemCategoryDefaultArgs> = $Result.GetResult<Prisma.$ItemCategoryPayload, S>

  type ItemCategoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ItemCategoryFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ItemCategoryCountAggregateInputType | true
    }

  export interface ItemCategoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ItemCategory'], meta: { name: 'ItemCategory' } }
    /**
     * Find zero or one ItemCategory that matches the filter.
     * @param {ItemCategoryFindUniqueArgs} args - Arguments to find a ItemCategory
     * @example
     * // Get one ItemCategory
     * const itemCategory = await prisma.itemCategory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ItemCategoryFindUniqueArgs>(args: SelectSubset<T, ItemCategoryFindUniqueArgs<ExtArgs>>): Prisma__ItemCategoryClient<$Result.GetResult<Prisma.$ItemCategoryPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ItemCategory that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ItemCategoryFindUniqueOrThrowArgs} args - Arguments to find a ItemCategory
     * @example
     * // Get one ItemCategory
     * const itemCategory = await prisma.itemCategory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ItemCategoryFindUniqueOrThrowArgs>(args: SelectSubset<T, ItemCategoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ItemCategoryClient<$Result.GetResult<Prisma.$ItemCategoryPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ItemCategory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemCategoryFindFirstArgs} args - Arguments to find a ItemCategory
     * @example
     * // Get one ItemCategory
     * const itemCategory = await prisma.itemCategory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ItemCategoryFindFirstArgs>(args?: SelectSubset<T, ItemCategoryFindFirstArgs<ExtArgs>>): Prisma__ItemCategoryClient<$Result.GetResult<Prisma.$ItemCategoryPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ItemCategory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemCategoryFindFirstOrThrowArgs} args - Arguments to find a ItemCategory
     * @example
     * // Get one ItemCategory
     * const itemCategory = await prisma.itemCategory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ItemCategoryFindFirstOrThrowArgs>(args?: SelectSubset<T, ItemCategoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__ItemCategoryClient<$Result.GetResult<Prisma.$ItemCategoryPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ItemCategories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemCategoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ItemCategories
     * const itemCategories = await prisma.itemCategory.findMany()
     * 
     * // Get first 10 ItemCategories
     * const itemCategories = await prisma.itemCategory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const itemCategoryWithIdOnly = await prisma.itemCategory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ItemCategoryFindManyArgs>(args?: SelectSubset<T, ItemCategoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemCategoryPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ItemCategory.
     * @param {ItemCategoryCreateArgs} args - Arguments to create a ItemCategory.
     * @example
     * // Create one ItemCategory
     * const ItemCategory = await prisma.itemCategory.create({
     *   data: {
     *     // ... data to create a ItemCategory
     *   }
     * })
     * 
     */
    create<T extends ItemCategoryCreateArgs>(args: SelectSubset<T, ItemCategoryCreateArgs<ExtArgs>>): Prisma__ItemCategoryClient<$Result.GetResult<Prisma.$ItemCategoryPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ItemCategories.
     * @param {ItemCategoryCreateManyArgs} args - Arguments to create many ItemCategories.
     * @example
     * // Create many ItemCategories
     * const itemCategory = await prisma.itemCategory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ItemCategoryCreateManyArgs>(args?: SelectSubset<T, ItemCategoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ItemCategories and returns the data saved in the database.
     * @param {ItemCategoryCreateManyAndReturnArgs} args - Arguments to create many ItemCategories.
     * @example
     * // Create many ItemCategories
     * const itemCategory = await prisma.itemCategory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ItemCategories and only return the `id`
     * const itemCategoryWithIdOnly = await prisma.itemCategory.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ItemCategoryCreateManyAndReturnArgs>(args?: SelectSubset<T, ItemCategoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemCategoryPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ItemCategory.
     * @param {ItemCategoryDeleteArgs} args - Arguments to delete one ItemCategory.
     * @example
     * // Delete one ItemCategory
     * const ItemCategory = await prisma.itemCategory.delete({
     *   where: {
     *     // ... filter to delete one ItemCategory
     *   }
     * })
     * 
     */
    delete<T extends ItemCategoryDeleteArgs>(args: SelectSubset<T, ItemCategoryDeleteArgs<ExtArgs>>): Prisma__ItemCategoryClient<$Result.GetResult<Prisma.$ItemCategoryPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ItemCategory.
     * @param {ItemCategoryUpdateArgs} args - Arguments to update one ItemCategory.
     * @example
     * // Update one ItemCategory
     * const itemCategory = await prisma.itemCategory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ItemCategoryUpdateArgs>(args: SelectSubset<T, ItemCategoryUpdateArgs<ExtArgs>>): Prisma__ItemCategoryClient<$Result.GetResult<Prisma.$ItemCategoryPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ItemCategories.
     * @param {ItemCategoryDeleteManyArgs} args - Arguments to filter ItemCategories to delete.
     * @example
     * // Delete a few ItemCategories
     * const { count } = await prisma.itemCategory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ItemCategoryDeleteManyArgs>(args?: SelectSubset<T, ItemCategoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ItemCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemCategoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ItemCategories
     * const itemCategory = await prisma.itemCategory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ItemCategoryUpdateManyArgs>(args: SelectSubset<T, ItemCategoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ItemCategory.
     * @param {ItemCategoryUpsertArgs} args - Arguments to update or create a ItemCategory.
     * @example
     * // Update or create a ItemCategory
     * const itemCategory = await prisma.itemCategory.upsert({
     *   create: {
     *     // ... data to create a ItemCategory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ItemCategory we want to update
     *   }
     * })
     */
    upsert<T extends ItemCategoryUpsertArgs>(args: SelectSubset<T, ItemCategoryUpsertArgs<ExtArgs>>): Prisma__ItemCategoryClient<$Result.GetResult<Prisma.$ItemCategoryPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ItemCategories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemCategoryCountArgs} args - Arguments to filter ItemCategories to count.
     * @example
     * // Count the number of ItemCategories
     * const count = await prisma.itemCategory.count({
     *   where: {
     *     // ... the filter for the ItemCategories we want to count
     *   }
     * })
    **/
    count<T extends ItemCategoryCountArgs>(
      args?: Subset<T, ItemCategoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ItemCategoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ItemCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemCategoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ItemCategoryAggregateArgs>(args: Subset<T, ItemCategoryAggregateArgs>): Prisma.PrismaPromise<GetItemCategoryAggregateType<T>>

    /**
     * Group by ItemCategory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ItemCategoryGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ItemCategoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ItemCategoryGroupByArgs['orderBy'] }
        : { orderBy?: ItemCategoryGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ItemCategoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetItemCategoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ItemCategory model
   */
  readonly fields: ItemCategoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ItemCategory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ItemCategoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    parent<T extends ItemCategory$parentArgs<ExtArgs> = {}>(args?: Subset<T, ItemCategory$parentArgs<ExtArgs>>): Prisma__ItemCategoryClient<$Result.GetResult<Prisma.$ItemCategoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    children<T extends ItemCategory$childrenArgs<ExtArgs> = {}>(args?: Subset<T, ItemCategory$childrenArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ItemCategoryPayload<ExtArgs>, T, "findMany"> | Null>
    inventoryItems<T extends ItemCategory$inventoryItemsArgs<ExtArgs> = {}>(args?: Subset<T, ItemCategory$inventoryItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findMany"> | Null>
    movements<T extends ItemCategory$movementsArgs<ExtArgs> = {}>(args?: Subset<T, ItemCategory$movementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryMovementPayload<ExtArgs>, T, "findMany"> | Null>
    pricingRules<T extends ItemCategory$pricingRulesArgs<ExtArgs> = {}>(args?: Subset<T, ItemCategory$pricingRulesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PricingRulePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ItemCategory model
   */ 
  interface ItemCategoryFieldRefs {
    readonly id: FieldRef<"ItemCategory", 'BigInt'>
    readonly name: FieldRef<"ItemCategory", 'String'>
    readonly code: FieldRef<"ItemCategory", 'String'>
    readonly parentId: FieldRef<"ItemCategory", 'BigInt'>
    readonly level: FieldRef<"ItemCategory", 'Int'>
    readonly enabled: FieldRef<"ItemCategory", 'Boolean'>
    readonly iconUrl: FieldRef<"ItemCategory", 'String'>
    readonly description: FieldRef<"ItemCategory", 'String'>
    readonly sortOrder: FieldRef<"ItemCategory", 'Int'>
    readonly createdAt: FieldRef<"ItemCategory", 'DateTime'>
    readonly updatedAt: FieldRef<"ItemCategory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ItemCategory findUnique
   */
  export type ItemCategoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCategory
     */
    select?: ItemCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCategoryInclude<ExtArgs> | null
    /**
     * Filter, which ItemCategory to fetch.
     */
    where: ItemCategoryWhereUniqueInput
  }

  /**
   * ItemCategory findUniqueOrThrow
   */
  export type ItemCategoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCategory
     */
    select?: ItemCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCategoryInclude<ExtArgs> | null
    /**
     * Filter, which ItemCategory to fetch.
     */
    where: ItemCategoryWhereUniqueInput
  }

  /**
   * ItemCategory findFirst
   */
  export type ItemCategoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCategory
     */
    select?: ItemCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCategoryInclude<ExtArgs> | null
    /**
     * Filter, which ItemCategory to fetch.
     */
    where?: ItemCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemCategories to fetch.
     */
    orderBy?: ItemCategoryOrderByWithRelationInput | ItemCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ItemCategories.
     */
    cursor?: ItemCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ItemCategories.
     */
    distinct?: ItemCategoryScalarFieldEnum | ItemCategoryScalarFieldEnum[]
  }

  /**
   * ItemCategory findFirstOrThrow
   */
  export type ItemCategoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCategory
     */
    select?: ItemCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCategoryInclude<ExtArgs> | null
    /**
     * Filter, which ItemCategory to fetch.
     */
    where?: ItemCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemCategories to fetch.
     */
    orderBy?: ItemCategoryOrderByWithRelationInput | ItemCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ItemCategories.
     */
    cursor?: ItemCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemCategories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ItemCategories.
     */
    distinct?: ItemCategoryScalarFieldEnum | ItemCategoryScalarFieldEnum[]
  }

  /**
   * ItemCategory findMany
   */
  export type ItemCategoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCategory
     */
    select?: ItemCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCategoryInclude<ExtArgs> | null
    /**
     * Filter, which ItemCategories to fetch.
     */
    where?: ItemCategoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ItemCategories to fetch.
     */
    orderBy?: ItemCategoryOrderByWithRelationInput | ItemCategoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ItemCategories.
     */
    cursor?: ItemCategoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ItemCategories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ItemCategories.
     */
    skip?: number
    distinct?: ItemCategoryScalarFieldEnum | ItemCategoryScalarFieldEnum[]
  }

  /**
   * ItemCategory create
   */
  export type ItemCategoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCategory
     */
    select?: ItemCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCategoryInclude<ExtArgs> | null
    /**
     * The data needed to create a ItemCategory.
     */
    data: XOR<ItemCategoryCreateInput, ItemCategoryUncheckedCreateInput>
  }

  /**
   * ItemCategory createMany
   */
  export type ItemCategoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ItemCategories.
     */
    data: ItemCategoryCreateManyInput | ItemCategoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ItemCategory createManyAndReturn
   */
  export type ItemCategoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCategory
     */
    select?: ItemCategorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ItemCategories.
     */
    data: ItemCategoryCreateManyInput | ItemCategoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCategoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ItemCategory update
   */
  export type ItemCategoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCategory
     */
    select?: ItemCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCategoryInclude<ExtArgs> | null
    /**
     * The data needed to update a ItemCategory.
     */
    data: XOR<ItemCategoryUpdateInput, ItemCategoryUncheckedUpdateInput>
    /**
     * Choose, which ItemCategory to update.
     */
    where: ItemCategoryWhereUniqueInput
  }

  /**
   * ItemCategory updateMany
   */
  export type ItemCategoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ItemCategories.
     */
    data: XOR<ItemCategoryUpdateManyMutationInput, ItemCategoryUncheckedUpdateManyInput>
    /**
     * Filter which ItemCategories to update
     */
    where?: ItemCategoryWhereInput
  }

  /**
   * ItemCategory upsert
   */
  export type ItemCategoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCategory
     */
    select?: ItemCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCategoryInclude<ExtArgs> | null
    /**
     * The filter to search for the ItemCategory to update in case it exists.
     */
    where: ItemCategoryWhereUniqueInput
    /**
     * In case the ItemCategory found by the `where` argument doesn't exist, create a new ItemCategory with this data.
     */
    create: XOR<ItemCategoryCreateInput, ItemCategoryUncheckedCreateInput>
    /**
     * In case the ItemCategory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ItemCategoryUpdateInput, ItemCategoryUncheckedUpdateInput>
  }

  /**
   * ItemCategory delete
   */
  export type ItemCategoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCategory
     */
    select?: ItemCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCategoryInclude<ExtArgs> | null
    /**
     * Filter which ItemCategory to delete.
     */
    where: ItemCategoryWhereUniqueInput
  }

  /**
   * ItemCategory deleteMany
   */
  export type ItemCategoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ItemCategories to delete
     */
    where?: ItemCategoryWhereInput
  }

  /**
   * ItemCategory.parent
   */
  export type ItemCategory$parentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCategory
     */
    select?: ItemCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCategoryInclude<ExtArgs> | null
    where?: ItemCategoryWhereInput
  }

  /**
   * ItemCategory.children
   */
  export type ItemCategory$childrenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCategory
     */
    select?: ItemCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCategoryInclude<ExtArgs> | null
    where?: ItemCategoryWhereInput
    orderBy?: ItemCategoryOrderByWithRelationInput | ItemCategoryOrderByWithRelationInput[]
    cursor?: ItemCategoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ItemCategoryScalarFieldEnum | ItemCategoryScalarFieldEnum[]
  }

  /**
   * ItemCategory.inventoryItems
   */
  export type ItemCategory$inventoryItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryItemInclude<ExtArgs> | null
    where?: InventoryItemWhereInput
    orderBy?: InventoryItemOrderByWithRelationInput | InventoryItemOrderByWithRelationInput[]
    cursor?: InventoryItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InventoryItemScalarFieldEnum | InventoryItemScalarFieldEnum[]
  }

  /**
   * ItemCategory.movements
   */
  export type ItemCategory$movementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryMovement
     */
    select?: InventoryMovementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryMovementInclude<ExtArgs> | null
    where?: InventoryMovementWhereInput
    orderBy?: InventoryMovementOrderByWithRelationInput | InventoryMovementOrderByWithRelationInput[]
    cursor?: InventoryMovementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InventoryMovementScalarFieldEnum | InventoryMovementScalarFieldEnum[]
  }

  /**
   * ItemCategory.pricingRules
   */
  export type ItemCategory$pricingRulesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricingRule
     */
    select?: PricingRuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PricingRuleInclude<ExtArgs> | null
    where?: PricingRuleWhereInput
    orderBy?: PricingRuleOrderByWithRelationInput | PricingRuleOrderByWithRelationInput[]
    cursor?: PricingRuleWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PricingRuleScalarFieldEnum | PricingRuleScalarFieldEnum[]
  }

  /**
   * ItemCategory without action
   */
  export type ItemCategoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ItemCategory
     */
    select?: ItemCategorySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ItemCategoryInclude<ExtArgs> | null
  }


  /**
   * Model InventoryItem
   */

  export type AggregateInventoryItem = {
    _count: InventoryItemCountAggregateOutputType | null
    _avg: InventoryItemAvgAggregateOutputType | null
    _sum: InventoryItemSumAggregateOutputType | null
    _min: InventoryItemMinAggregateOutputType | null
    _max: InventoryItemMaxAggregateOutputType | null
  }

  export type InventoryItemAvgAggregateOutputType = {
    id: number | null
    warehouseId: number | null
    categoryId: number | null
    quantity: Decimal | null
    reservedQty: Decimal | null
    availableQty: Decimal | null
    unitPrice: Decimal | null
    totalPrice: Decimal | null
    minStockLevel: Decimal | null
    maxStockLevel: Decimal | null
  }

  export type InventoryItemSumAggregateOutputType = {
    id: bigint | null
    warehouseId: bigint | null
    categoryId: bigint | null
    quantity: Decimal | null
    reservedQty: Decimal | null
    availableQty: Decimal | null
    unitPrice: Decimal | null
    totalPrice: Decimal | null
    minStockLevel: Decimal | null
    maxStockLevel: Decimal | null
  }

  export type InventoryItemMinAggregateOutputType = {
    id: bigint | null
    warehouseId: bigint | null
    categoryId: bigint | null
    name: string | null
    description: string | null
    unit: string | null
    quantity: Decimal | null
    reservedQty: Decimal | null
    availableQty: Decimal | null
    unitPrice: Decimal | null
    totalPrice: Decimal | null
    location: string | null
    status: $Enums.InventoryStatus | null
    itemType: $Enums.ItemType | null
    condition: $Enums.ItemCondition | null
    sourceOrderId: string | null
    qualityGrade: string | null
    processingStatus: $Enums.ProcessingStatus | null
    expiryDate: Date | null
    batchNumber: string | null
    minStockLevel: Decimal | null
    maxStockLevel: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InventoryItemMaxAggregateOutputType = {
    id: bigint | null
    warehouseId: bigint | null
    categoryId: bigint | null
    name: string | null
    description: string | null
    unit: string | null
    quantity: Decimal | null
    reservedQty: Decimal | null
    availableQty: Decimal | null
    unitPrice: Decimal | null
    totalPrice: Decimal | null
    location: string | null
    status: $Enums.InventoryStatus | null
    itemType: $Enums.ItemType | null
    condition: $Enums.ItemCondition | null
    sourceOrderId: string | null
    qualityGrade: string | null
    processingStatus: $Enums.ProcessingStatus | null
    expiryDate: Date | null
    batchNumber: string | null
    minStockLevel: Decimal | null
    maxStockLevel: Decimal | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InventoryItemCountAggregateOutputType = {
    id: number
    warehouseId: number
    categoryId: number
    name: number
    description: number
    unit: number
    quantity: number
    reservedQty: number
    availableQty: number
    unitPrice: number
    totalPrice: number
    location: number
    status: number
    itemType: number
    condition: number
    sourceOrderId: number
    qualityGrade: number
    processingStatus: number
    expiryDate: number
    batchNumber: number
    minStockLevel: number
    maxStockLevel: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type InventoryItemAvgAggregateInputType = {
    id?: true
    warehouseId?: true
    categoryId?: true
    quantity?: true
    reservedQty?: true
    availableQty?: true
    unitPrice?: true
    totalPrice?: true
    minStockLevel?: true
    maxStockLevel?: true
  }

  export type InventoryItemSumAggregateInputType = {
    id?: true
    warehouseId?: true
    categoryId?: true
    quantity?: true
    reservedQty?: true
    availableQty?: true
    unitPrice?: true
    totalPrice?: true
    minStockLevel?: true
    maxStockLevel?: true
  }

  export type InventoryItemMinAggregateInputType = {
    id?: true
    warehouseId?: true
    categoryId?: true
    name?: true
    description?: true
    unit?: true
    quantity?: true
    reservedQty?: true
    availableQty?: true
    unitPrice?: true
    totalPrice?: true
    location?: true
    status?: true
    itemType?: true
    condition?: true
    sourceOrderId?: true
    qualityGrade?: true
    processingStatus?: true
    expiryDate?: true
    batchNumber?: true
    minStockLevel?: true
    maxStockLevel?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InventoryItemMaxAggregateInputType = {
    id?: true
    warehouseId?: true
    categoryId?: true
    name?: true
    description?: true
    unit?: true
    quantity?: true
    reservedQty?: true
    availableQty?: true
    unitPrice?: true
    totalPrice?: true
    location?: true
    status?: true
    itemType?: true
    condition?: true
    sourceOrderId?: true
    qualityGrade?: true
    processingStatus?: true
    expiryDate?: true
    batchNumber?: true
    minStockLevel?: true
    maxStockLevel?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InventoryItemCountAggregateInputType = {
    id?: true
    warehouseId?: true
    categoryId?: true
    name?: true
    description?: true
    unit?: true
    quantity?: true
    reservedQty?: true
    availableQty?: true
    unitPrice?: true
    totalPrice?: true
    location?: true
    status?: true
    itemType?: true
    condition?: true
    sourceOrderId?: true
    qualityGrade?: true
    processingStatus?: true
    expiryDate?: true
    batchNumber?: true
    minStockLevel?: true
    maxStockLevel?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type InventoryItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InventoryItem to aggregate.
     */
    where?: InventoryItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryItems to fetch.
     */
    orderBy?: InventoryItemOrderByWithRelationInput | InventoryItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InventoryItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InventoryItems
    **/
    _count?: true | InventoryItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InventoryItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InventoryItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InventoryItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InventoryItemMaxAggregateInputType
  }

  export type GetInventoryItemAggregateType<T extends InventoryItemAggregateArgs> = {
        [P in keyof T & keyof AggregateInventoryItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInventoryItem[P]>
      : GetScalarType<T[P], AggregateInventoryItem[P]>
  }




  export type InventoryItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventoryItemWhereInput
    orderBy?: InventoryItemOrderByWithAggregationInput | InventoryItemOrderByWithAggregationInput[]
    by: InventoryItemScalarFieldEnum[] | InventoryItemScalarFieldEnum
    having?: InventoryItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InventoryItemCountAggregateInputType | true
    _avg?: InventoryItemAvgAggregateInputType
    _sum?: InventoryItemSumAggregateInputType
    _min?: InventoryItemMinAggregateInputType
    _max?: InventoryItemMaxAggregateInputType
  }

  export type InventoryItemGroupByOutputType = {
    id: bigint
    warehouseId: bigint
    categoryId: bigint
    name: string
    description: string | null
    unit: string
    quantity: Decimal
    reservedQty: Decimal
    availableQty: Decimal
    unitPrice: Decimal
    totalPrice: Decimal
    location: string | null
    status: $Enums.InventoryStatus
    itemType: $Enums.ItemType
    condition: $Enums.ItemCondition
    sourceOrderId: string | null
    qualityGrade: string | null
    processingStatus: $Enums.ProcessingStatus
    expiryDate: Date | null
    batchNumber: string | null
    minStockLevel: Decimal | null
    maxStockLevel: Decimal | null
    createdAt: Date
    updatedAt: Date
    _count: InventoryItemCountAggregateOutputType | null
    _avg: InventoryItemAvgAggregateOutputType | null
    _sum: InventoryItemSumAggregateOutputType | null
    _min: InventoryItemMinAggregateOutputType | null
    _max: InventoryItemMaxAggregateOutputType | null
  }

  type GetInventoryItemGroupByPayload<T extends InventoryItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InventoryItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InventoryItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InventoryItemGroupByOutputType[P]>
            : GetScalarType<T[P], InventoryItemGroupByOutputType[P]>
        }
      >
    >


  export type InventoryItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    warehouseId?: boolean
    categoryId?: boolean
    name?: boolean
    description?: boolean
    unit?: boolean
    quantity?: boolean
    reservedQty?: boolean
    availableQty?: boolean
    unitPrice?: boolean
    totalPrice?: boolean
    location?: boolean
    status?: boolean
    itemType?: boolean
    condition?: boolean
    sourceOrderId?: boolean
    qualityGrade?: boolean
    processingStatus?: boolean
    expiryDate?: boolean
    batchNumber?: boolean
    minStockLevel?: boolean
    maxStockLevel?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    warehouse?: boolean | WarehouseDefaultArgs<ExtArgs>
    category?: boolean | ItemCategoryDefaultArgs<ExtArgs>
    transactions?: boolean | InventoryItem$transactionsArgs<ExtArgs>
    salesRecords?: boolean | InventoryItem$salesRecordsArgs<ExtArgs>
    qualityChecks?: boolean | InventoryItem$qualityChecksArgs<ExtArgs>
    movements?: boolean | InventoryItem$movementsArgs<ExtArgs>
    reservations?: boolean | InventoryItem$reservationsArgs<ExtArgs>
    _count?: boolean | InventoryItemCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inventoryItem"]>

  export type InventoryItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    warehouseId?: boolean
    categoryId?: boolean
    name?: boolean
    description?: boolean
    unit?: boolean
    quantity?: boolean
    reservedQty?: boolean
    availableQty?: boolean
    unitPrice?: boolean
    totalPrice?: boolean
    location?: boolean
    status?: boolean
    itemType?: boolean
    condition?: boolean
    sourceOrderId?: boolean
    qualityGrade?: boolean
    processingStatus?: boolean
    expiryDate?: boolean
    batchNumber?: boolean
    minStockLevel?: boolean
    maxStockLevel?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    warehouse?: boolean | WarehouseDefaultArgs<ExtArgs>
    category?: boolean | ItemCategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inventoryItem"]>

  export type InventoryItemSelectScalar = {
    id?: boolean
    warehouseId?: boolean
    categoryId?: boolean
    name?: boolean
    description?: boolean
    unit?: boolean
    quantity?: boolean
    reservedQty?: boolean
    availableQty?: boolean
    unitPrice?: boolean
    totalPrice?: boolean
    location?: boolean
    status?: boolean
    itemType?: boolean
    condition?: boolean
    sourceOrderId?: boolean
    qualityGrade?: boolean
    processingStatus?: boolean
    expiryDate?: boolean
    batchNumber?: boolean
    minStockLevel?: boolean
    maxStockLevel?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type InventoryItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    warehouse?: boolean | WarehouseDefaultArgs<ExtArgs>
    category?: boolean | ItemCategoryDefaultArgs<ExtArgs>
    transactions?: boolean | InventoryItem$transactionsArgs<ExtArgs>
    salesRecords?: boolean | InventoryItem$salesRecordsArgs<ExtArgs>
    qualityChecks?: boolean | InventoryItem$qualityChecksArgs<ExtArgs>
    movements?: boolean | InventoryItem$movementsArgs<ExtArgs>
    reservations?: boolean | InventoryItem$reservationsArgs<ExtArgs>
    _count?: boolean | InventoryItemCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type InventoryItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    warehouse?: boolean | WarehouseDefaultArgs<ExtArgs>
    category?: boolean | ItemCategoryDefaultArgs<ExtArgs>
  }

  export type $InventoryItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InventoryItem"
    objects: {
      warehouse: Prisma.$WarehousePayload<ExtArgs>
      category: Prisma.$ItemCategoryPayload<ExtArgs>
      transactions: Prisma.$InventoryTransactionPayload<ExtArgs>[]
      salesRecords: Prisma.$SalesRecordPayload<ExtArgs>[]
      qualityChecks: Prisma.$QualityCheckPayload<ExtArgs>[]
      movements: Prisma.$InventoryMovementPayload<ExtArgs>[]
      reservations: Prisma.$ReservationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      warehouseId: bigint
      categoryId: bigint
      name: string
      description: string | null
      unit: string
      quantity: Prisma.Decimal
      reservedQty: Prisma.Decimal
      availableQty: Prisma.Decimal
      unitPrice: Prisma.Decimal
      totalPrice: Prisma.Decimal
      location: string | null
      status: $Enums.InventoryStatus
      itemType: $Enums.ItemType
      condition: $Enums.ItemCondition
      sourceOrderId: string | null
      qualityGrade: string | null
      processingStatus: $Enums.ProcessingStatus
      expiryDate: Date | null
      batchNumber: string | null
      minStockLevel: Prisma.Decimal | null
      maxStockLevel: Prisma.Decimal | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["inventoryItem"]>
    composites: {}
  }

  type InventoryItemGetPayload<S extends boolean | null | undefined | InventoryItemDefaultArgs> = $Result.GetResult<Prisma.$InventoryItemPayload, S>

  type InventoryItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<InventoryItemFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: InventoryItemCountAggregateInputType | true
    }

  export interface InventoryItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InventoryItem'], meta: { name: 'InventoryItem' } }
    /**
     * Find zero or one InventoryItem that matches the filter.
     * @param {InventoryItemFindUniqueArgs} args - Arguments to find a InventoryItem
     * @example
     * // Get one InventoryItem
     * const inventoryItem = await prisma.inventoryItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InventoryItemFindUniqueArgs>(args: SelectSubset<T, InventoryItemFindUniqueArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one InventoryItem that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {InventoryItemFindUniqueOrThrowArgs} args - Arguments to find a InventoryItem
     * @example
     * // Get one InventoryItem
     * const inventoryItem = await prisma.inventoryItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InventoryItemFindUniqueOrThrowArgs>(args: SelectSubset<T, InventoryItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first InventoryItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryItemFindFirstArgs} args - Arguments to find a InventoryItem
     * @example
     * // Get one InventoryItem
     * const inventoryItem = await prisma.inventoryItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InventoryItemFindFirstArgs>(args?: SelectSubset<T, InventoryItemFindFirstArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first InventoryItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryItemFindFirstOrThrowArgs} args - Arguments to find a InventoryItem
     * @example
     * // Get one InventoryItem
     * const inventoryItem = await prisma.inventoryItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InventoryItemFindFirstOrThrowArgs>(args?: SelectSubset<T, InventoryItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more InventoryItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InventoryItems
     * const inventoryItems = await prisma.inventoryItem.findMany()
     * 
     * // Get first 10 InventoryItems
     * const inventoryItems = await prisma.inventoryItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inventoryItemWithIdOnly = await prisma.inventoryItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InventoryItemFindManyArgs>(args?: SelectSubset<T, InventoryItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a InventoryItem.
     * @param {InventoryItemCreateArgs} args - Arguments to create a InventoryItem.
     * @example
     * // Create one InventoryItem
     * const InventoryItem = await prisma.inventoryItem.create({
     *   data: {
     *     // ... data to create a InventoryItem
     *   }
     * })
     * 
     */
    create<T extends InventoryItemCreateArgs>(args: SelectSubset<T, InventoryItemCreateArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many InventoryItems.
     * @param {InventoryItemCreateManyArgs} args - Arguments to create many InventoryItems.
     * @example
     * // Create many InventoryItems
     * const inventoryItem = await prisma.inventoryItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InventoryItemCreateManyArgs>(args?: SelectSubset<T, InventoryItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InventoryItems and returns the data saved in the database.
     * @param {InventoryItemCreateManyAndReturnArgs} args - Arguments to create many InventoryItems.
     * @example
     * // Create many InventoryItems
     * const inventoryItem = await prisma.inventoryItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InventoryItems and only return the `id`
     * const inventoryItemWithIdOnly = await prisma.inventoryItem.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InventoryItemCreateManyAndReturnArgs>(args?: SelectSubset<T, InventoryItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a InventoryItem.
     * @param {InventoryItemDeleteArgs} args - Arguments to delete one InventoryItem.
     * @example
     * // Delete one InventoryItem
     * const InventoryItem = await prisma.inventoryItem.delete({
     *   where: {
     *     // ... filter to delete one InventoryItem
     *   }
     * })
     * 
     */
    delete<T extends InventoryItemDeleteArgs>(args: SelectSubset<T, InventoryItemDeleteArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one InventoryItem.
     * @param {InventoryItemUpdateArgs} args - Arguments to update one InventoryItem.
     * @example
     * // Update one InventoryItem
     * const inventoryItem = await prisma.inventoryItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InventoryItemUpdateArgs>(args: SelectSubset<T, InventoryItemUpdateArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more InventoryItems.
     * @param {InventoryItemDeleteManyArgs} args - Arguments to filter InventoryItems to delete.
     * @example
     * // Delete a few InventoryItems
     * const { count } = await prisma.inventoryItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InventoryItemDeleteManyArgs>(args?: SelectSubset<T, InventoryItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InventoryItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InventoryItems
     * const inventoryItem = await prisma.inventoryItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InventoryItemUpdateManyArgs>(args: SelectSubset<T, InventoryItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one InventoryItem.
     * @param {InventoryItemUpsertArgs} args - Arguments to update or create a InventoryItem.
     * @example
     * // Update or create a InventoryItem
     * const inventoryItem = await prisma.inventoryItem.upsert({
     *   create: {
     *     // ... data to create a InventoryItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InventoryItem we want to update
     *   }
     * })
     */
    upsert<T extends InventoryItemUpsertArgs>(args: SelectSubset<T, InventoryItemUpsertArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of InventoryItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryItemCountArgs} args - Arguments to filter InventoryItems to count.
     * @example
     * // Count the number of InventoryItems
     * const count = await prisma.inventoryItem.count({
     *   where: {
     *     // ... the filter for the InventoryItems we want to count
     *   }
     * })
    **/
    count<T extends InventoryItemCountArgs>(
      args?: Subset<T, InventoryItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InventoryItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InventoryItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InventoryItemAggregateArgs>(args: Subset<T, InventoryItemAggregateArgs>): Prisma.PrismaPromise<GetInventoryItemAggregateType<T>>

    /**
     * Group by InventoryItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryItemGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InventoryItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InventoryItemGroupByArgs['orderBy'] }
        : { orderBy?: InventoryItemGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InventoryItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInventoryItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InventoryItem model
   */
  readonly fields: InventoryItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InventoryItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InventoryItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    warehouse<T extends WarehouseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, WarehouseDefaultArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    category<T extends ItemCategoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ItemCategoryDefaultArgs<ExtArgs>>): Prisma__ItemCategoryClient<$Result.GetResult<Prisma.$ItemCategoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    transactions<T extends InventoryItem$transactionsArgs<ExtArgs> = {}>(args?: Subset<T, InventoryItem$transactionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryTransactionPayload<ExtArgs>, T, "findMany"> | Null>
    salesRecords<T extends InventoryItem$salesRecordsArgs<ExtArgs> = {}>(args?: Subset<T, InventoryItem$salesRecordsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SalesRecordPayload<ExtArgs>, T, "findMany"> | Null>
    qualityChecks<T extends InventoryItem$qualityChecksArgs<ExtArgs> = {}>(args?: Subset<T, InventoryItem$qualityChecksArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QualityCheckPayload<ExtArgs>, T, "findMany"> | Null>
    movements<T extends InventoryItem$movementsArgs<ExtArgs> = {}>(args?: Subset<T, InventoryItem$movementsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryMovementPayload<ExtArgs>, T, "findMany"> | Null>
    reservations<T extends InventoryItem$reservationsArgs<ExtArgs> = {}>(args?: Subset<T, InventoryItem$reservationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReservationPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the InventoryItem model
   */ 
  interface InventoryItemFieldRefs {
    readonly id: FieldRef<"InventoryItem", 'BigInt'>
    readonly warehouseId: FieldRef<"InventoryItem", 'BigInt'>
    readonly categoryId: FieldRef<"InventoryItem", 'BigInt'>
    readonly name: FieldRef<"InventoryItem", 'String'>
    readonly description: FieldRef<"InventoryItem", 'String'>
    readonly unit: FieldRef<"InventoryItem", 'String'>
    readonly quantity: FieldRef<"InventoryItem", 'Decimal'>
    readonly reservedQty: FieldRef<"InventoryItem", 'Decimal'>
    readonly availableQty: FieldRef<"InventoryItem", 'Decimal'>
    readonly unitPrice: FieldRef<"InventoryItem", 'Decimal'>
    readonly totalPrice: FieldRef<"InventoryItem", 'Decimal'>
    readonly location: FieldRef<"InventoryItem", 'String'>
    readonly status: FieldRef<"InventoryItem", 'InventoryStatus'>
    readonly itemType: FieldRef<"InventoryItem", 'ItemType'>
    readonly condition: FieldRef<"InventoryItem", 'ItemCondition'>
    readonly sourceOrderId: FieldRef<"InventoryItem", 'String'>
    readonly qualityGrade: FieldRef<"InventoryItem", 'String'>
    readonly processingStatus: FieldRef<"InventoryItem", 'ProcessingStatus'>
    readonly expiryDate: FieldRef<"InventoryItem", 'DateTime'>
    readonly batchNumber: FieldRef<"InventoryItem", 'String'>
    readonly minStockLevel: FieldRef<"InventoryItem", 'Decimal'>
    readonly maxStockLevel: FieldRef<"InventoryItem", 'Decimal'>
    readonly createdAt: FieldRef<"InventoryItem", 'DateTime'>
    readonly updatedAt: FieldRef<"InventoryItem", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InventoryItem findUnique
   */
  export type InventoryItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryItemInclude<ExtArgs> | null
    /**
     * Filter, which InventoryItem to fetch.
     */
    where: InventoryItemWhereUniqueInput
  }

  /**
   * InventoryItem findUniqueOrThrow
   */
  export type InventoryItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryItemInclude<ExtArgs> | null
    /**
     * Filter, which InventoryItem to fetch.
     */
    where: InventoryItemWhereUniqueInput
  }

  /**
   * InventoryItem findFirst
   */
  export type InventoryItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryItemInclude<ExtArgs> | null
    /**
     * Filter, which InventoryItem to fetch.
     */
    where?: InventoryItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryItems to fetch.
     */
    orderBy?: InventoryItemOrderByWithRelationInput | InventoryItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InventoryItems.
     */
    cursor?: InventoryItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InventoryItems.
     */
    distinct?: InventoryItemScalarFieldEnum | InventoryItemScalarFieldEnum[]
  }

  /**
   * InventoryItem findFirstOrThrow
   */
  export type InventoryItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryItemInclude<ExtArgs> | null
    /**
     * Filter, which InventoryItem to fetch.
     */
    where?: InventoryItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryItems to fetch.
     */
    orderBy?: InventoryItemOrderByWithRelationInput | InventoryItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InventoryItems.
     */
    cursor?: InventoryItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InventoryItems.
     */
    distinct?: InventoryItemScalarFieldEnum | InventoryItemScalarFieldEnum[]
  }

  /**
   * InventoryItem findMany
   */
  export type InventoryItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryItemInclude<ExtArgs> | null
    /**
     * Filter, which InventoryItems to fetch.
     */
    where?: InventoryItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryItems to fetch.
     */
    orderBy?: InventoryItemOrderByWithRelationInput | InventoryItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InventoryItems.
     */
    cursor?: InventoryItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryItems.
     */
    skip?: number
    distinct?: InventoryItemScalarFieldEnum | InventoryItemScalarFieldEnum[]
  }

  /**
   * InventoryItem create
   */
  export type InventoryItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryItemInclude<ExtArgs> | null
    /**
     * The data needed to create a InventoryItem.
     */
    data: XOR<InventoryItemCreateInput, InventoryItemUncheckedCreateInput>
  }

  /**
   * InventoryItem createMany
   */
  export type InventoryItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InventoryItems.
     */
    data: InventoryItemCreateManyInput | InventoryItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InventoryItem createManyAndReturn
   */
  export type InventoryItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many InventoryItems.
     */
    data: InventoryItemCreateManyInput | InventoryItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * InventoryItem update
   */
  export type InventoryItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryItemInclude<ExtArgs> | null
    /**
     * The data needed to update a InventoryItem.
     */
    data: XOR<InventoryItemUpdateInput, InventoryItemUncheckedUpdateInput>
    /**
     * Choose, which InventoryItem to update.
     */
    where: InventoryItemWhereUniqueInput
  }

  /**
   * InventoryItem updateMany
   */
  export type InventoryItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InventoryItems.
     */
    data: XOR<InventoryItemUpdateManyMutationInput, InventoryItemUncheckedUpdateManyInput>
    /**
     * Filter which InventoryItems to update
     */
    where?: InventoryItemWhereInput
  }

  /**
   * InventoryItem upsert
   */
  export type InventoryItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryItemInclude<ExtArgs> | null
    /**
     * The filter to search for the InventoryItem to update in case it exists.
     */
    where: InventoryItemWhereUniqueInput
    /**
     * In case the InventoryItem found by the `where` argument doesn't exist, create a new InventoryItem with this data.
     */
    create: XOR<InventoryItemCreateInput, InventoryItemUncheckedCreateInput>
    /**
     * In case the InventoryItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InventoryItemUpdateInput, InventoryItemUncheckedUpdateInput>
  }

  /**
   * InventoryItem delete
   */
  export type InventoryItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryItemInclude<ExtArgs> | null
    /**
     * Filter which InventoryItem to delete.
     */
    where: InventoryItemWhereUniqueInput
  }

  /**
   * InventoryItem deleteMany
   */
  export type InventoryItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InventoryItems to delete
     */
    where?: InventoryItemWhereInput
  }

  /**
   * InventoryItem.transactions
   */
  export type InventoryItem$transactionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryTransaction
     */
    select?: InventoryTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryTransactionInclude<ExtArgs> | null
    where?: InventoryTransactionWhereInput
    orderBy?: InventoryTransactionOrderByWithRelationInput | InventoryTransactionOrderByWithRelationInput[]
    cursor?: InventoryTransactionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InventoryTransactionScalarFieldEnum | InventoryTransactionScalarFieldEnum[]
  }

  /**
   * InventoryItem.salesRecords
   */
  export type InventoryItem$salesRecordsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SalesRecord
     */
    select?: SalesRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SalesRecordInclude<ExtArgs> | null
    where?: SalesRecordWhereInput
    orderBy?: SalesRecordOrderByWithRelationInput | SalesRecordOrderByWithRelationInput[]
    cursor?: SalesRecordWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SalesRecordScalarFieldEnum | SalesRecordScalarFieldEnum[]
  }

  /**
   * InventoryItem.qualityChecks
   */
  export type InventoryItem$qualityChecksArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QualityCheck
     */
    select?: QualityCheckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QualityCheckInclude<ExtArgs> | null
    where?: QualityCheckWhereInput
    orderBy?: QualityCheckOrderByWithRelationInput | QualityCheckOrderByWithRelationInput[]
    cursor?: QualityCheckWhereUniqueInput
    take?: number
    skip?: number
    distinct?: QualityCheckScalarFieldEnum | QualityCheckScalarFieldEnum[]
  }

  /**
   * InventoryItem.movements
   */
  export type InventoryItem$movementsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryMovement
     */
    select?: InventoryMovementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryMovementInclude<ExtArgs> | null
    where?: InventoryMovementWhereInput
    orderBy?: InventoryMovementOrderByWithRelationInput | InventoryMovementOrderByWithRelationInput[]
    cursor?: InventoryMovementWhereUniqueInput
    take?: number
    skip?: number
    distinct?: InventoryMovementScalarFieldEnum | InventoryMovementScalarFieldEnum[]
  }

  /**
   * InventoryItem.reservations
   */
  export type InventoryItem$reservationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reservation
     */
    select?: ReservationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReservationInclude<ExtArgs> | null
    where?: ReservationWhereInput
    orderBy?: ReservationOrderByWithRelationInput | ReservationOrderByWithRelationInput[]
    cursor?: ReservationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ReservationScalarFieldEnum | ReservationScalarFieldEnum[]
  }

  /**
   * InventoryItem without action
   */
  export type InventoryItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryItem
     */
    select?: InventoryItemSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryItemInclude<ExtArgs> | null
  }


  /**
   * Model InventoryTransaction
   */

  export type AggregateInventoryTransaction = {
    _count: InventoryTransactionCountAggregateOutputType | null
    _avg: InventoryTransactionAvgAggregateOutputType | null
    _sum: InventoryTransactionSumAggregateOutputType | null
    _min: InventoryTransactionMinAggregateOutputType | null
    _max: InventoryTransactionMaxAggregateOutputType | null
  }

  export type InventoryTransactionAvgAggregateOutputType = {
    id: number | null
    itemId: number | null
    quantity: Decimal | null
    unitPrice: Decimal | null
    totalPrice: Decimal | null
  }

  export type InventoryTransactionSumAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    quantity: Decimal | null
    unitPrice: Decimal | null
    totalPrice: Decimal | null
  }

  export type InventoryTransactionMinAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    type: $Enums.TransactionType | null
    quantity: Decimal | null
    unitPrice: Decimal | null
    totalPrice: Decimal | null
    referenceId: string | null
    notes: string | null
    createdAt: Date | null
  }

  export type InventoryTransactionMaxAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    type: $Enums.TransactionType | null
    quantity: Decimal | null
    unitPrice: Decimal | null
    totalPrice: Decimal | null
    referenceId: string | null
    notes: string | null
    createdAt: Date | null
  }

  export type InventoryTransactionCountAggregateOutputType = {
    id: number
    itemId: number
    type: number
    quantity: number
    unitPrice: number
    totalPrice: number
    referenceId: number
    notes: number
    createdAt: number
    _all: number
  }


  export type InventoryTransactionAvgAggregateInputType = {
    id?: true
    itemId?: true
    quantity?: true
    unitPrice?: true
    totalPrice?: true
  }

  export type InventoryTransactionSumAggregateInputType = {
    id?: true
    itemId?: true
    quantity?: true
    unitPrice?: true
    totalPrice?: true
  }

  export type InventoryTransactionMinAggregateInputType = {
    id?: true
    itemId?: true
    type?: true
    quantity?: true
    unitPrice?: true
    totalPrice?: true
    referenceId?: true
    notes?: true
    createdAt?: true
  }

  export type InventoryTransactionMaxAggregateInputType = {
    id?: true
    itemId?: true
    type?: true
    quantity?: true
    unitPrice?: true
    totalPrice?: true
    referenceId?: true
    notes?: true
    createdAt?: true
  }

  export type InventoryTransactionCountAggregateInputType = {
    id?: true
    itemId?: true
    type?: true
    quantity?: true
    unitPrice?: true
    totalPrice?: true
    referenceId?: true
    notes?: true
    createdAt?: true
    _all?: true
  }

  export type InventoryTransactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InventoryTransaction to aggregate.
     */
    where?: InventoryTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryTransactions to fetch.
     */
    orderBy?: InventoryTransactionOrderByWithRelationInput | InventoryTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InventoryTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InventoryTransactions
    **/
    _count?: true | InventoryTransactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InventoryTransactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InventoryTransactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InventoryTransactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InventoryTransactionMaxAggregateInputType
  }

  export type GetInventoryTransactionAggregateType<T extends InventoryTransactionAggregateArgs> = {
        [P in keyof T & keyof AggregateInventoryTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInventoryTransaction[P]>
      : GetScalarType<T[P], AggregateInventoryTransaction[P]>
  }




  export type InventoryTransactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventoryTransactionWhereInput
    orderBy?: InventoryTransactionOrderByWithAggregationInput | InventoryTransactionOrderByWithAggregationInput[]
    by: InventoryTransactionScalarFieldEnum[] | InventoryTransactionScalarFieldEnum
    having?: InventoryTransactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InventoryTransactionCountAggregateInputType | true
    _avg?: InventoryTransactionAvgAggregateInputType
    _sum?: InventoryTransactionSumAggregateInputType
    _min?: InventoryTransactionMinAggregateInputType
    _max?: InventoryTransactionMaxAggregateInputType
  }

  export type InventoryTransactionGroupByOutputType = {
    id: bigint
    itemId: bigint
    type: $Enums.TransactionType
    quantity: Decimal
    unitPrice: Decimal
    totalPrice: Decimal
    referenceId: string | null
    notes: string | null
    createdAt: Date
    _count: InventoryTransactionCountAggregateOutputType | null
    _avg: InventoryTransactionAvgAggregateOutputType | null
    _sum: InventoryTransactionSumAggregateOutputType | null
    _min: InventoryTransactionMinAggregateOutputType | null
    _max: InventoryTransactionMaxAggregateOutputType | null
  }

  type GetInventoryTransactionGroupByPayload<T extends InventoryTransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InventoryTransactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InventoryTransactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InventoryTransactionGroupByOutputType[P]>
            : GetScalarType<T[P], InventoryTransactionGroupByOutputType[P]>
        }
      >
    >


  export type InventoryTransactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    type?: boolean
    quantity?: boolean
    unitPrice?: boolean
    totalPrice?: boolean
    referenceId?: boolean
    notes?: boolean
    createdAt?: boolean
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inventoryTransaction"]>

  export type InventoryTransactionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    type?: boolean
    quantity?: boolean
    unitPrice?: boolean
    totalPrice?: boolean
    referenceId?: boolean
    notes?: boolean
    createdAt?: boolean
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inventoryTransaction"]>

  export type InventoryTransactionSelectScalar = {
    id?: boolean
    itemId?: boolean
    type?: boolean
    quantity?: boolean
    unitPrice?: boolean
    totalPrice?: boolean
    referenceId?: boolean
    notes?: boolean
    createdAt?: boolean
  }

  export type InventoryTransactionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }
  export type InventoryTransactionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }

  export type $InventoryTransactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InventoryTransaction"
    objects: {
      item: Prisma.$InventoryItemPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      itemId: bigint
      type: $Enums.TransactionType
      quantity: Prisma.Decimal
      unitPrice: Prisma.Decimal
      totalPrice: Prisma.Decimal
      referenceId: string | null
      notes: string | null
      createdAt: Date
    }, ExtArgs["result"]["inventoryTransaction"]>
    composites: {}
  }

  type InventoryTransactionGetPayload<S extends boolean | null | undefined | InventoryTransactionDefaultArgs> = $Result.GetResult<Prisma.$InventoryTransactionPayload, S>

  type InventoryTransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<InventoryTransactionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: InventoryTransactionCountAggregateInputType | true
    }

  export interface InventoryTransactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InventoryTransaction'], meta: { name: 'InventoryTransaction' } }
    /**
     * Find zero or one InventoryTransaction that matches the filter.
     * @param {InventoryTransactionFindUniqueArgs} args - Arguments to find a InventoryTransaction
     * @example
     * // Get one InventoryTransaction
     * const inventoryTransaction = await prisma.inventoryTransaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InventoryTransactionFindUniqueArgs>(args: SelectSubset<T, InventoryTransactionFindUniqueArgs<ExtArgs>>): Prisma__InventoryTransactionClient<$Result.GetResult<Prisma.$InventoryTransactionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one InventoryTransaction that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {InventoryTransactionFindUniqueOrThrowArgs} args - Arguments to find a InventoryTransaction
     * @example
     * // Get one InventoryTransaction
     * const inventoryTransaction = await prisma.inventoryTransaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InventoryTransactionFindUniqueOrThrowArgs>(args: SelectSubset<T, InventoryTransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InventoryTransactionClient<$Result.GetResult<Prisma.$InventoryTransactionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first InventoryTransaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryTransactionFindFirstArgs} args - Arguments to find a InventoryTransaction
     * @example
     * // Get one InventoryTransaction
     * const inventoryTransaction = await prisma.inventoryTransaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InventoryTransactionFindFirstArgs>(args?: SelectSubset<T, InventoryTransactionFindFirstArgs<ExtArgs>>): Prisma__InventoryTransactionClient<$Result.GetResult<Prisma.$InventoryTransactionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first InventoryTransaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryTransactionFindFirstOrThrowArgs} args - Arguments to find a InventoryTransaction
     * @example
     * // Get one InventoryTransaction
     * const inventoryTransaction = await prisma.inventoryTransaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InventoryTransactionFindFirstOrThrowArgs>(args?: SelectSubset<T, InventoryTransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__InventoryTransactionClient<$Result.GetResult<Prisma.$InventoryTransactionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more InventoryTransactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryTransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InventoryTransactions
     * const inventoryTransactions = await prisma.inventoryTransaction.findMany()
     * 
     * // Get first 10 InventoryTransactions
     * const inventoryTransactions = await prisma.inventoryTransaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inventoryTransactionWithIdOnly = await prisma.inventoryTransaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InventoryTransactionFindManyArgs>(args?: SelectSubset<T, InventoryTransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryTransactionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a InventoryTransaction.
     * @param {InventoryTransactionCreateArgs} args - Arguments to create a InventoryTransaction.
     * @example
     * // Create one InventoryTransaction
     * const InventoryTransaction = await prisma.inventoryTransaction.create({
     *   data: {
     *     // ... data to create a InventoryTransaction
     *   }
     * })
     * 
     */
    create<T extends InventoryTransactionCreateArgs>(args: SelectSubset<T, InventoryTransactionCreateArgs<ExtArgs>>): Prisma__InventoryTransactionClient<$Result.GetResult<Prisma.$InventoryTransactionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many InventoryTransactions.
     * @param {InventoryTransactionCreateManyArgs} args - Arguments to create many InventoryTransactions.
     * @example
     * // Create many InventoryTransactions
     * const inventoryTransaction = await prisma.inventoryTransaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InventoryTransactionCreateManyArgs>(args?: SelectSubset<T, InventoryTransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InventoryTransactions and returns the data saved in the database.
     * @param {InventoryTransactionCreateManyAndReturnArgs} args - Arguments to create many InventoryTransactions.
     * @example
     * // Create many InventoryTransactions
     * const inventoryTransaction = await prisma.inventoryTransaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InventoryTransactions and only return the `id`
     * const inventoryTransactionWithIdOnly = await prisma.inventoryTransaction.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InventoryTransactionCreateManyAndReturnArgs>(args?: SelectSubset<T, InventoryTransactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryTransactionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a InventoryTransaction.
     * @param {InventoryTransactionDeleteArgs} args - Arguments to delete one InventoryTransaction.
     * @example
     * // Delete one InventoryTransaction
     * const InventoryTransaction = await prisma.inventoryTransaction.delete({
     *   where: {
     *     // ... filter to delete one InventoryTransaction
     *   }
     * })
     * 
     */
    delete<T extends InventoryTransactionDeleteArgs>(args: SelectSubset<T, InventoryTransactionDeleteArgs<ExtArgs>>): Prisma__InventoryTransactionClient<$Result.GetResult<Prisma.$InventoryTransactionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one InventoryTransaction.
     * @param {InventoryTransactionUpdateArgs} args - Arguments to update one InventoryTransaction.
     * @example
     * // Update one InventoryTransaction
     * const inventoryTransaction = await prisma.inventoryTransaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InventoryTransactionUpdateArgs>(args: SelectSubset<T, InventoryTransactionUpdateArgs<ExtArgs>>): Prisma__InventoryTransactionClient<$Result.GetResult<Prisma.$InventoryTransactionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more InventoryTransactions.
     * @param {InventoryTransactionDeleteManyArgs} args - Arguments to filter InventoryTransactions to delete.
     * @example
     * // Delete a few InventoryTransactions
     * const { count } = await prisma.inventoryTransaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InventoryTransactionDeleteManyArgs>(args?: SelectSubset<T, InventoryTransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InventoryTransactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryTransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InventoryTransactions
     * const inventoryTransaction = await prisma.inventoryTransaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InventoryTransactionUpdateManyArgs>(args: SelectSubset<T, InventoryTransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one InventoryTransaction.
     * @param {InventoryTransactionUpsertArgs} args - Arguments to update or create a InventoryTransaction.
     * @example
     * // Update or create a InventoryTransaction
     * const inventoryTransaction = await prisma.inventoryTransaction.upsert({
     *   create: {
     *     // ... data to create a InventoryTransaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InventoryTransaction we want to update
     *   }
     * })
     */
    upsert<T extends InventoryTransactionUpsertArgs>(args: SelectSubset<T, InventoryTransactionUpsertArgs<ExtArgs>>): Prisma__InventoryTransactionClient<$Result.GetResult<Prisma.$InventoryTransactionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of InventoryTransactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryTransactionCountArgs} args - Arguments to filter InventoryTransactions to count.
     * @example
     * // Count the number of InventoryTransactions
     * const count = await prisma.inventoryTransaction.count({
     *   where: {
     *     // ... the filter for the InventoryTransactions we want to count
     *   }
     * })
    **/
    count<T extends InventoryTransactionCountArgs>(
      args?: Subset<T, InventoryTransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InventoryTransactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InventoryTransaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryTransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InventoryTransactionAggregateArgs>(args: Subset<T, InventoryTransactionAggregateArgs>): Prisma.PrismaPromise<GetInventoryTransactionAggregateType<T>>

    /**
     * Group by InventoryTransaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryTransactionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InventoryTransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InventoryTransactionGroupByArgs['orderBy'] }
        : { orderBy?: InventoryTransactionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InventoryTransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInventoryTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InventoryTransaction model
   */
  readonly fields: InventoryTransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InventoryTransaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InventoryTransactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    item<T extends InventoryItemDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InventoryItemDefaultArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the InventoryTransaction model
   */ 
  interface InventoryTransactionFieldRefs {
    readonly id: FieldRef<"InventoryTransaction", 'BigInt'>
    readonly itemId: FieldRef<"InventoryTransaction", 'BigInt'>
    readonly type: FieldRef<"InventoryTransaction", 'TransactionType'>
    readonly quantity: FieldRef<"InventoryTransaction", 'Decimal'>
    readonly unitPrice: FieldRef<"InventoryTransaction", 'Decimal'>
    readonly totalPrice: FieldRef<"InventoryTransaction", 'Decimal'>
    readonly referenceId: FieldRef<"InventoryTransaction", 'String'>
    readonly notes: FieldRef<"InventoryTransaction", 'String'>
    readonly createdAt: FieldRef<"InventoryTransaction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InventoryTransaction findUnique
   */
  export type InventoryTransactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryTransaction
     */
    select?: InventoryTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryTransactionInclude<ExtArgs> | null
    /**
     * Filter, which InventoryTransaction to fetch.
     */
    where: InventoryTransactionWhereUniqueInput
  }

  /**
   * InventoryTransaction findUniqueOrThrow
   */
  export type InventoryTransactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryTransaction
     */
    select?: InventoryTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryTransactionInclude<ExtArgs> | null
    /**
     * Filter, which InventoryTransaction to fetch.
     */
    where: InventoryTransactionWhereUniqueInput
  }

  /**
   * InventoryTransaction findFirst
   */
  export type InventoryTransactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryTransaction
     */
    select?: InventoryTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryTransactionInclude<ExtArgs> | null
    /**
     * Filter, which InventoryTransaction to fetch.
     */
    where?: InventoryTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryTransactions to fetch.
     */
    orderBy?: InventoryTransactionOrderByWithRelationInput | InventoryTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InventoryTransactions.
     */
    cursor?: InventoryTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InventoryTransactions.
     */
    distinct?: InventoryTransactionScalarFieldEnum | InventoryTransactionScalarFieldEnum[]
  }

  /**
   * InventoryTransaction findFirstOrThrow
   */
  export type InventoryTransactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryTransaction
     */
    select?: InventoryTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryTransactionInclude<ExtArgs> | null
    /**
     * Filter, which InventoryTransaction to fetch.
     */
    where?: InventoryTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryTransactions to fetch.
     */
    orderBy?: InventoryTransactionOrderByWithRelationInput | InventoryTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InventoryTransactions.
     */
    cursor?: InventoryTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryTransactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InventoryTransactions.
     */
    distinct?: InventoryTransactionScalarFieldEnum | InventoryTransactionScalarFieldEnum[]
  }

  /**
   * InventoryTransaction findMany
   */
  export type InventoryTransactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryTransaction
     */
    select?: InventoryTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryTransactionInclude<ExtArgs> | null
    /**
     * Filter, which InventoryTransactions to fetch.
     */
    where?: InventoryTransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryTransactions to fetch.
     */
    orderBy?: InventoryTransactionOrderByWithRelationInput | InventoryTransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InventoryTransactions.
     */
    cursor?: InventoryTransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryTransactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryTransactions.
     */
    skip?: number
    distinct?: InventoryTransactionScalarFieldEnum | InventoryTransactionScalarFieldEnum[]
  }

  /**
   * InventoryTransaction create
   */
  export type InventoryTransactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryTransaction
     */
    select?: InventoryTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryTransactionInclude<ExtArgs> | null
    /**
     * The data needed to create a InventoryTransaction.
     */
    data: XOR<InventoryTransactionCreateInput, InventoryTransactionUncheckedCreateInput>
  }

  /**
   * InventoryTransaction createMany
   */
  export type InventoryTransactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InventoryTransactions.
     */
    data: InventoryTransactionCreateManyInput | InventoryTransactionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InventoryTransaction createManyAndReturn
   */
  export type InventoryTransactionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryTransaction
     */
    select?: InventoryTransactionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many InventoryTransactions.
     */
    data: InventoryTransactionCreateManyInput | InventoryTransactionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryTransactionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * InventoryTransaction update
   */
  export type InventoryTransactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryTransaction
     */
    select?: InventoryTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryTransactionInclude<ExtArgs> | null
    /**
     * The data needed to update a InventoryTransaction.
     */
    data: XOR<InventoryTransactionUpdateInput, InventoryTransactionUncheckedUpdateInput>
    /**
     * Choose, which InventoryTransaction to update.
     */
    where: InventoryTransactionWhereUniqueInput
  }

  /**
   * InventoryTransaction updateMany
   */
  export type InventoryTransactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InventoryTransactions.
     */
    data: XOR<InventoryTransactionUpdateManyMutationInput, InventoryTransactionUncheckedUpdateManyInput>
    /**
     * Filter which InventoryTransactions to update
     */
    where?: InventoryTransactionWhereInput
  }

  /**
   * InventoryTransaction upsert
   */
  export type InventoryTransactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryTransaction
     */
    select?: InventoryTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryTransactionInclude<ExtArgs> | null
    /**
     * The filter to search for the InventoryTransaction to update in case it exists.
     */
    where: InventoryTransactionWhereUniqueInput
    /**
     * In case the InventoryTransaction found by the `where` argument doesn't exist, create a new InventoryTransaction with this data.
     */
    create: XOR<InventoryTransactionCreateInput, InventoryTransactionUncheckedCreateInput>
    /**
     * In case the InventoryTransaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InventoryTransactionUpdateInput, InventoryTransactionUncheckedUpdateInput>
  }

  /**
   * InventoryTransaction delete
   */
  export type InventoryTransactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryTransaction
     */
    select?: InventoryTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryTransactionInclude<ExtArgs> | null
    /**
     * Filter which InventoryTransaction to delete.
     */
    where: InventoryTransactionWhereUniqueInput
  }

  /**
   * InventoryTransaction deleteMany
   */
  export type InventoryTransactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InventoryTransactions to delete
     */
    where?: InventoryTransactionWhereInput
  }

  /**
   * InventoryTransaction without action
   */
  export type InventoryTransactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryTransaction
     */
    select?: InventoryTransactionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryTransactionInclude<ExtArgs> | null
  }


  /**
   * Model SalesRecord
   */

  export type AggregateSalesRecord = {
    _count: SalesRecordCountAggregateOutputType | null
    _avg: SalesRecordAvgAggregateOutputType | null
    _sum: SalesRecordSumAggregateOutputType | null
    _min: SalesRecordMinAggregateOutputType | null
    _max: SalesRecordMaxAggregateOutputType | null
  }

  export type SalesRecordAvgAggregateOutputType = {
    id: number | null
    itemId: number | null
    quantity: Decimal | null
    unitPrice: Decimal | null
    totalPrice: Decimal | null
    customerId: number | null
  }

  export type SalesRecordSumAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    quantity: Decimal | null
    unitPrice: Decimal | null
    totalPrice: Decimal | null
    customerId: bigint | null
  }

  export type SalesRecordMinAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    quantity: Decimal | null
    unitPrice: Decimal | null
    totalPrice: Decimal | null
    orderId: string | null
    customerId: bigint | null
    soldAt: Date | null
    notes: string | null
    createdAt: Date | null
  }

  export type SalesRecordMaxAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    quantity: Decimal | null
    unitPrice: Decimal | null
    totalPrice: Decimal | null
    orderId: string | null
    customerId: bigint | null
    soldAt: Date | null
    notes: string | null
    createdAt: Date | null
  }

  export type SalesRecordCountAggregateOutputType = {
    id: number
    itemId: number
    quantity: number
    unitPrice: number
    totalPrice: number
    orderId: number
    customerId: number
    soldAt: number
    notes: number
    createdAt: number
    _all: number
  }


  export type SalesRecordAvgAggregateInputType = {
    id?: true
    itemId?: true
    quantity?: true
    unitPrice?: true
    totalPrice?: true
    customerId?: true
  }

  export type SalesRecordSumAggregateInputType = {
    id?: true
    itemId?: true
    quantity?: true
    unitPrice?: true
    totalPrice?: true
    customerId?: true
  }

  export type SalesRecordMinAggregateInputType = {
    id?: true
    itemId?: true
    quantity?: true
    unitPrice?: true
    totalPrice?: true
    orderId?: true
    customerId?: true
    soldAt?: true
    notes?: true
    createdAt?: true
  }

  export type SalesRecordMaxAggregateInputType = {
    id?: true
    itemId?: true
    quantity?: true
    unitPrice?: true
    totalPrice?: true
    orderId?: true
    customerId?: true
    soldAt?: true
    notes?: true
    createdAt?: true
  }

  export type SalesRecordCountAggregateInputType = {
    id?: true
    itemId?: true
    quantity?: true
    unitPrice?: true
    totalPrice?: true
    orderId?: true
    customerId?: true
    soldAt?: true
    notes?: true
    createdAt?: true
    _all?: true
  }

  export type SalesRecordAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SalesRecord to aggregate.
     */
    where?: SalesRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SalesRecords to fetch.
     */
    orderBy?: SalesRecordOrderByWithRelationInput | SalesRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SalesRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SalesRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SalesRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SalesRecords
    **/
    _count?: true | SalesRecordCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SalesRecordAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SalesRecordSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SalesRecordMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SalesRecordMaxAggregateInputType
  }

  export type GetSalesRecordAggregateType<T extends SalesRecordAggregateArgs> = {
        [P in keyof T & keyof AggregateSalesRecord]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSalesRecord[P]>
      : GetScalarType<T[P], AggregateSalesRecord[P]>
  }




  export type SalesRecordGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SalesRecordWhereInput
    orderBy?: SalesRecordOrderByWithAggregationInput | SalesRecordOrderByWithAggregationInput[]
    by: SalesRecordScalarFieldEnum[] | SalesRecordScalarFieldEnum
    having?: SalesRecordScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SalesRecordCountAggregateInputType | true
    _avg?: SalesRecordAvgAggregateInputType
    _sum?: SalesRecordSumAggregateInputType
    _min?: SalesRecordMinAggregateInputType
    _max?: SalesRecordMaxAggregateInputType
  }

  export type SalesRecordGroupByOutputType = {
    id: bigint
    itemId: bigint
    quantity: Decimal
    unitPrice: Decimal
    totalPrice: Decimal
    orderId: string
    customerId: bigint
    soldAt: Date
    notes: string | null
    createdAt: Date
    _count: SalesRecordCountAggregateOutputType | null
    _avg: SalesRecordAvgAggregateOutputType | null
    _sum: SalesRecordSumAggregateOutputType | null
    _min: SalesRecordMinAggregateOutputType | null
    _max: SalesRecordMaxAggregateOutputType | null
  }

  type GetSalesRecordGroupByPayload<T extends SalesRecordGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SalesRecordGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SalesRecordGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SalesRecordGroupByOutputType[P]>
            : GetScalarType<T[P], SalesRecordGroupByOutputType[P]>
        }
      >
    >


  export type SalesRecordSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    quantity?: boolean
    unitPrice?: boolean
    totalPrice?: boolean
    orderId?: boolean
    customerId?: boolean
    soldAt?: boolean
    notes?: boolean
    createdAt?: boolean
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["salesRecord"]>

  export type SalesRecordSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    quantity?: boolean
    unitPrice?: boolean
    totalPrice?: boolean
    orderId?: boolean
    customerId?: boolean
    soldAt?: boolean
    notes?: boolean
    createdAt?: boolean
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["salesRecord"]>

  export type SalesRecordSelectScalar = {
    id?: boolean
    itemId?: boolean
    quantity?: boolean
    unitPrice?: boolean
    totalPrice?: boolean
    orderId?: boolean
    customerId?: boolean
    soldAt?: boolean
    notes?: boolean
    createdAt?: boolean
  }

  export type SalesRecordInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }
  export type SalesRecordIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }

  export type $SalesRecordPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SalesRecord"
    objects: {
      item: Prisma.$InventoryItemPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      itemId: bigint
      quantity: Prisma.Decimal
      unitPrice: Prisma.Decimal
      totalPrice: Prisma.Decimal
      orderId: string
      customerId: bigint
      soldAt: Date
      notes: string | null
      createdAt: Date
    }, ExtArgs["result"]["salesRecord"]>
    composites: {}
  }

  type SalesRecordGetPayload<S extends boolean | null | undefined | SalesRecordDefaultArgs> = $Result.GetResult<Prisma.$SalesRecordPayload, S>

  type SalesRecordCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SalesRecordFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SalesRecordCountAggregateInputType | true
    }

  export interface SalesRecordDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SalesRecord'], meta: { name: 'SalesRecord' } }
    /**
     * Find zero or one SalesRecord that matches the filter.
     * @param {SalesRecordFindUniqueArgs} args - Arguments to find a SalesRecord
     * @example
     * // Get one SalesRecord
     * const salesRecord = await prisma.salesRecord.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SalesRecordFindUniqueArgs>(args: SelectSubset<T, SalesRecordFindUniqueArgs<ExtArgs>>): Prisma__SalesRecordClient<$Result.GetResult<Prisma.$SalesRecordPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SalesRecord that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SalesRecordFindUniqueOrThrowArgs} args - Arguments to find a SalesRecord
     * @example
     * // Get one SalesRecord
     * const salesRecord = await prisma.salesRecord.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SalesRecordFindUniqueOrThrowArgs>(args: SelectSubset<T, SalesRecordFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SalesRecordClient<$Result.GetResult<Prisma.$SalesRecordPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SalesRecord that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SalesRecordFindFirstArgs} args - Arguments to find a SalesRecord
     * @example
     * // Get one SalesRecord
     * const salesRecord = await prisma.salesRecord.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SalesRecordFindFirstArgs>(args?: SelectSubset<T, SalesRecordFindFirstArgs<ExtArgs>>): Prisma__SalesRecordClient<$Result.GetResult<Prisma.$SalesRecordPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SalesRecord that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SalesRecordFindFirstOrThrowArgs} args - Arguments to find a SalesRecord
     * @example
     * // Get one SalesRecord
     * const salesRecord = await prisma.salesRecord.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SalesRecordFindFirstOrThrowArgs>(args?: SelectSubset<T, SalesRecordFindFirstOrThrowArgs<ExtArgs>>): Prisma__SalesRecordClient<$Result.GetResult<Prisma.$SalesRecordPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SalesRecords that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SalesRecordFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SalesRecords
     * const salesRecords = await prisma.salesRecord.findMany()
     * 
     * // Get first 10 SalesRecords
     * const salesRecords = await prisma.salesRecord.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const salesRecordWithIdOnly = await prisma.salesRecord.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SalesRecordFindManyArgs>(args?: SelectSubset<T, SalesRecordFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SalesRecordPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SalesRecord.
     * @param {SalesRecordCreateArgs} args - Arguments to create a SalesRecord.
     * @example
     * // Create one SalesRecord
     * const SalesRecord = await prisma.salesRecord.create({
     *   data: {
     *     // ... data to create a SalesRecord
     *   }
     * })
     * 
     */
    create<T extends SalesRecordCreateArgs>(args: SelectSubset<T, SalesRecordCreateArgs<ExtArgs>>): Prisma__SalesRecordClient<$Result.GetResult<Prisma.$SalesRecordPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SalesRecords.
     * @param {SalesRecordCreateManyArgs} args - Arguments to create many SalesRecords.
     * @example
     * // Create many SalesRecords
     * const salesRecord = await prisma.salesRecord.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SalesRecordCreateManyArgs>(args?: SelectSubset<T, SalesRecordCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SalesRecords and returns the data saved in the database.
     * @param {SalesRecordCreateManyAndReturnArgs} args - Arguments to create many SalesRecords.
     * @example
     * // Create many SalesRecords
     * const salesRecord = await prisma.salesRecord.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SalesRecords and only return the `id`
     * const salesRecordWithIdOnly = await prisma.salesRecord.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SalesRecordCreateManyAndReturnArgs>(args?: SelectSubset<T, SalesRecordCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SalesRecordPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SalesRecord.
     * @param {SalesRecordDeleteArgs} args - Arguments to delete one SalesRecord.
     * @example
     * // Delete one SalesRecord
     * const SalesRecord = await prisma.salesRecord.delete({
     *   where: {
     *     // ... filter to delete one SalesRecord
     *   }
     * })
     * 
     */
    delete<T extends SalesRecordDeleteArgs>(args: SelectSubset<T, SalesRecordDeleteArgs<ExtArgs>>): Prisma__SalesRecordClient<$Result.GetResult<Prisma.$SalesRecordPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SalesRecord.
     * @param {SalesRecordUpdateArgs} args - Arguments to update one SalesRecord.
     * @example
     * // Update one SalesRecord
     * const salesRecord = await prisma.salesRecord.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SalesRecordUpdateArgs>(args: SelectSubset<T, SalesRecordUpdateArgs<ExtArgs>>): Prisma__SalesRecordClient<$Result.GetResult<Prisma.$SalesRecordPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SalesRecords.
     * @param {SalesRecordDeleteManyArgs} args - Arguments to filter SalesRecords to delete.
     * @example
     * // Delete a few SalesRecords
     * const { count } = await prisma.salesRecord.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SalesRecordDeleteManyArgs>(args?: SelectSubset<T, SalesRecordDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SalesRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SalesRecordUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SalesRecords
     * const salesRecord = await prisma.salesRecord.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SalesRecordUpdateManyArgs>(args: SelectSubset<T, SalesRecordUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SalesRecord.
     * @param {SalesRecordUpsertArgs} args - Arguments to update or create a SalesRecord.
     * @example
     * // Update or create a SalesRecord
     * const salesRecord = await prisma.salesRecord.upsert({
     *   create: {
     *     // ... data to create a SalesRecord
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SalesRecord we want to update
     *   }
     * })
     */
    upsert<T extends SalesRecordUpsertArgs>(args: SelectSubset<T, SalesRecordUpsertArgs<ExtArgs>>): Prisma__SalesRecordClient<$Result.GetResult<Prisma.$SalesRecordPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SalesRecords.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SalesRecordCountArgs} args - Arguments to filter SalesRecords to count.
     * @example
     * // Count the number of SalesRecords
     * const count = await prisma.salesRecord.count({
     *   where: {
     *     // ... the filter for the SalesRecords we want to count
     *   }
     * })
    **/
    count<T extends SalesRecordCountArgs>(
      args?: Subset<T, SalesRecordCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SalesRecordCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SalesRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SalesRecordAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SalesRecordAggregateArgs>(args: Subset<T, SalesRecordAggregateArgs>): Prisma.PrismaPromise<GetSalesRecordAggregateType<T>>

    /**
     * Group by SalesRecord.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SalesRecordGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SalesRecordGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SalesRecordGroupByArgs['orderBy'] }
        : { orderBy?: SalesRecordGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SalesRecordGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSalesRecordGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SalesRecord model
   */
  readonly fields: SalesRecordFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SalesRecord.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SalesRecordClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    item<T extends InventoryItemDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InventoryItemDefaultArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SalesRecord model
   */ 
  interface SalesRecordFieldRefs {
    readonly id: FieldRef<"SalesRecord", 'BigInt'>
    readonly itemId: FieldRef<"SalesRecord", 'BigInt'>
    readonly quantity: FieldRef<"SalesRecord", 'Decimal'>
    readonly unitPrice: FieldRef<"SalesRecord", 'Decimal'>
    readonly totalPrice: FieldRef<"SalesRecord", 'Decimal'>
    readonly orderId: FieldRef<"SalesRecord", 'String'>
    readonly customerId: FieldRef<"SalesRecord", 'BigInt'>
    readonly soldAt: FieldRef<"SalesRecord", 'DateTime'>
    readonly notes: FieldRef<"SalesRecord", 'String'>
    readonly createdAt: FieldRef<"SalesRecord", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SalesRecord findUnique
   */
  export type SalesRecordFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SalesRecord
     */
    select?: SalesRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SalesRecordInclude<ExtArgs> | null
    /**
     * Filter, which SalesRecord to fetch.
     */
    where: SalesRecordWhereUniqueInput
  }

  /**
   * SalesRecord findUniqueOrThrow
   */
  export type SalesRecordFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SalesRecord
     */
    select?: SalesRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SalesRecordInclude<ExtArgs> | null
    /**
     * Filter, which SalesRecord to fetch.
     */
    where: SalesRecordWhereUniqueInput
  }

  /**
   * SalesRecord findFirst
   */
  export type SalesRecordFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SalesRecord
     */
    select?: SalesRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SalesRecordInclude<ExtArgs> | null
    /**
     * Filter, which SalesRecord to fetch.
     */
    where?: SalesRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SalesRecords to fetch.
     */
    orderBy?: SalesRecordOrderByWithRelationInput | SalesRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SalesRecords.
     */
    cursor?: SalesRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SalesRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SalesRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SalesRecords.
     */
    distinct?: SalesRecordScalarFieldEnum | SalesRecordScalarFieldEnum[]
  }

  /**
   * SalesRecord findFirstOrThrow
   */
  export type SalesRecordFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SalesRecord
     */
    select?: SalesRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SalesRecordInclude<ExtArgs> | null
    /**
     * Filter, which SalesRecord to fetch.
     */
    where?: SalesRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SalesRecords to fetch.
     */
    orderBy?: SalesRecordOrderByWithRelationInput | SalesRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SalesRecords.
     */
    cursor?: SalesRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SalesRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SalesRecords.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SalesRecords.
     */
    distinct?: SalesRecordScalarFieldEnum | SalesRecordScalarFieldEnum[]
  }

  /**
   * SalesRecord findMany
   */
  export type SalesRecordFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SalesRecord
     */
    select?: SalesRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SalesRecordInclude<ExtArgs> | null
    /**
     * Filter, which SalesRecords to fetch.
     */
    where?: SalesRecordWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SalesRecords to fetch.
     */
    orderBy?: SalesRecordOrderByWithRelationInput | SalesRecordOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SalesRecords.
     */
    cursor?: SalesRecordWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SalesRecords from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SalesRecords.
     */
    skip?: number
    distinct?: SalesRecordScalarFieldEnum | SalesRecordScalarFieldEnum[]
  }

  /**
   * SalesRecord create
   */
  export type SalesRecordCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SalesRecord
     */
    select?: SalesRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SalesRecordInclude<ExtArgs> | null
    /**
     * The data needed to create a SalesRecord.
     */
    data: XOR<SalesRecordCreateInput, SalesRecordUncheckedCreateInput>
  }

  /**
   * SalesRecord createMany
   */
  export type SalesRecordCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SalesRecords.
     */
    data: SalesRecordCreateManyInput | SalesRecordCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SalesRecord createManyAndReturn
   */
  export type SalesRecordCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SalesRecord
     */
    select?: SalesRecordSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SalesRecords.
     */
    data: SalesRecordCreateManyInput | SalesRecordCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SalesRecordIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SalesRecord update
   */
  export type SalesRecordUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SalesRecord
     */
    select?: SalesRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SalesRecordInclude<ExtArgs> | null
    /**
     * The data needed to update a SalesRecord.
     */
    data: XOR<SalesRecordUpdateInput, SalesRecordUncheckedUpdateInput>
    /**
     * Choose, which SalesRecord to update.
     */
    where: SalesRecordWhereUniqueInput
  }

  /**
   * SalesRecord updateMany
   */
  export type SalesRecordUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SalesRecords.
     */
    data: XOR<SalesRecordUpdateManyMutationInput, SalesRecordUncheckedUpdateManyInput>
    /**
     * Filter which SalesRecords to update
     */
    where?: SalesRecordWhereInput
  }

  /**
   * SalesRecord upsert
   */
  export type SalesRecordUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SalesRecord
     */
    select?: SalesRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SalesRecordInclude<ExtArgs> | null
    /**
     * The filter to search for the SalesRecord to update in case it exists.
     */
    where: SalesRecordWhereUniqueInput
    /**
     * In case the SalesRecord found by the `where` argument doesn't exist, create a new SalesRecord with this data.
     */
    create: XOR<SalesRecordCreateInput, SalesRecordUncheckedCreateInput>
    /**
     * In case the SalesRecord was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SalesRecordUpdateInput, SalesRecordUncheckedUpdateInput>
  }

  /**
   * SalesRecord delete
   */
  export type SalesRecordDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SalesRecord
     */
    select?: SalesRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SalesRecordInclude<ExtArgs> | null
    /**
     * Filter which SalesRecord to delete.
     */
    where: SalesRecordWhereUniqueInput
  }

  /**
   * SalesRecord deleteMany
   */
  export type SalesRecordDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SalesRecords to delete
     */
    where?: SalesRecordWhereInput
  }

  /**
   * SalesRecord without action
   */
  export type SalesRecordDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SalesRecord
     */
    select?: SalesRecordSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SalesRecordInclude<ExtArgs> | null
  }


  /**
   * Model QualityCheck
   */

  export type AggregateQualityCheck = {
    _count: QualityCheckCountAggregateOutputType | null
    _avg: QualityCheckAvgAggregateOutputType | null
    _sum: QualityCheckSumAggregateOutputType | null
    _min: QualityCheckMinAggregateOutputType | null
    _max: QualityCheckMaxAggregateOutputType | null
  }

  export type QualityCheckAvgAggregateOutputType = {
    id: number | null
    itemId: number | null
    checkerId: number | null
    score: number | null
  }

  export type QualityCheckSumAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    checkerId: bigint | null
    score: number | null
  }

  export type QualityCheckMinAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    checkerId: bigint | null
    checkType: $Enums.CheckType | null
    result: $Enums.CheckResult | null
    score: number | null
    notes: string | null
    checkedAt: Date | null
    createdAt: Date | null
  }

  export type QualityCheckMaxAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    checkerId: bigint | null
    checkType: $Enums.CheckType | null
    result: $Enums.CheckResult | null
    score: number | null
    notes: string | null
    checkedAt: Date | null
    createdAt: Date | null
  }

  export type QualityCheckCountAggregateOutputType = {
    id: number
    itemId: number
    checkerId: number
    checkType: number
    result: number
    score: number
    notes: number
    images: number
    checkedAt: number
    createdAt: number
    _all: number
  }


  export type QualityCheckAvgAggregateInputType = {
    id?: true
    itemId?: true
    checkerId?: true
    score?: true
  }

  export type QualityCheckSumAggregateInputType = {
    id?: true
    itemId?: true
    checkerId?: true
    score?: true
  }

  export type QualityCheckMinAggregateInputType = {
    id?: true
    itemId?: true
    checkerId?: true
    checkType?: true
    result?: true
    score?: true
    notes?: true
    checkedAt?: true
    createdAt?: true
  }

  export type QualityCheckMaxAggregateInputType = {
    id?: true
    itemId?: true
    checkerId?: true
    checkType?: true
    result?: true
    score?: true
    notes?: true
    checkedAt?: true
    createdAt?: true
  }

  export type QualityCheckCountAggregateInputType = {
    id?: true
    itemId?: true
    checkerId?: true
    checkType?: true
    result?: true
    score?: true
    notes?: true
    images?: true
    checkedAt?: true
    createdAt?: true
    _all?: true
  }

  export type QualityCheckAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which QualityCheck to aggregate.
     */
    where?: QualityCheckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QualityChecks to fetch.
     */
    orderBy?: QualityCheckOrderByWithRelationInput | QualityCheckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: QualityCheckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QualityChecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QualityChecks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned QualityChecks
    **/
    _count?: true | QualityCheckCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: QualityCheckAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: QualityCheckSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: QualityCheckMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: QualityCheckMaxAggregateInputType
  }

  export type GetQualityCheckAggregateType<T extends QualityCheckAggregateArgs> = {
        [P in keyof T & keyof AggregateQualityCheck]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateQualityCheck[P]>
      : GetScalarType<T[P], AggregateQualityCheck[P]>
  }




  export type QualityCheckGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: QualityCheckWhereInput
    orderBy?: QualityCheckOrderByWithAggregationInput | QualityCheckOrderByWithAggregationInput[]
    by: QualityCheckScalarFieldEnum[] | QualityCheckScalarFieldEnum
    having?: QualityCheckScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: QualityCheckCountAggregateInputType | true
    _avg?: QualityCheckAvgAggregateInputType
    _sum?: QualityCheckSumAggregateInputType
    _min?: QualityCheckMinAggregateInputType
    _max?: QualityCheckMaxAggregateInputType
  }

  export type QualityCheckGroupByOutputType = {
    id: bigint
    itemId: bigint
    checkerId: bigint
    checkType: $Enums.CheckType
    result: $Enums.CheckResult
    score: number | null
    notes: string | null
    images: string[]
    checkedAt: Date
    createdAt: Date
    _count: QualityCheckCountAggregateOutputType | null
    _avg: QualityCheckAvgAggregateOutputType | null
    _sum: QualityCheckSumAggregateOutputType | null
    _min: QualityCheckMinAggregateOutputType | null
    _max: QualityCheckMaxAggregateOutputType | null
  }

  type GetQualityCheckGroupByPayload<T extends QualityCheckGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<QualityCheckGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof QualityCheckGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], QualityCheckGroupByOutputType[P]>
            : GetScalarType<T[P], QualityCheckGroupByOutputType[P]>
        }
      >
    >


  export type QualityCheckSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    checkerId?: boolean
    checkType?: boolean
    result?: boolean
    score?: boolean
    notes?: boolean
    images?: boolean
    checkedAt?: boolean
    createdAt?: boolean
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["qualityCheck"]>

  export type QualityCheckSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    checkerId?: boolean
    checkType?: boolean
    result?: boolean
    score?: boolean
    notes?: boolean
    images?: boolean
    checkedAt?: boolean
    createdAt?: boolean
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["qualityCheck"]>

  export type QualityCheckSelectScalar = {
    id?: boolean
    itemId?: boolean
    checkerId?: boolean
    checkType?: boolean
    result?: boolean
    score?: boolean
    notes?: boolean
    images?: boolean
    checkedAt?: boolean
    createdAt?: boolean
  }

  export type QualityCheckInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }
  export type QualityCheckIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }

  export type $QualityCheckPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "QualityCheck"
    objects: {
      item: Prisma.$InventoryItemPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      itemId: bigint
      checkerId: bigint
      checkType: $Enums.CheckType
      result: $Enums.CheckResult
      score: number | null
      notes: string | null
      images: string[]
      checkedAt: Date
      createdAt: Date
    }, ExtArgs["result"]["qualityCheck"]>
    composites: {}
  }

  type QualityCheckGetPayload<S extends boolean | null | undefined | QualityCheckDefaultArgs> = $Result.GetResult<Prisma.$QualityCheckPayload, S>

  type QualityCheckCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<QualityCheckFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: QualityCheckCountAggregateInputType | true
    }

  export interface QualityCheckDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['QualityCheck'], meta: { name: 'QualityCheck' } }
    /**
     * Find zero or one QualityCheck that matches the filter.
     * @param {QualityCheckFindUniqueArgs} args - Arguments to find a QualityCheck
     * @example
     * // Get one QualityCheck
     * const qualityCheck = await prisma.qualityCheck.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends QualityCheckFindUniqueArgs>(args: SelectSubset<T, QualityCheckFindUniqueArgs<ExtArgs>>): Prisma__QualityCheckClient<$Result.GetResult<Prisma.$QualityCheckPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one QualityCheck that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {QualityCheckFindUniqueOrThrowArgs} args - Arguments to find a QualityCheck
     * @example
     * // Get one QualityCheck
     * const qualityCheck = await prisma.qualityCheck.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends QualityCheckFindUniqueOrThrowArgs>(args: SelectSubset<T, QualityCheckFindUniqueOrThrowArgs<ExtArgs>>): Prisma__QualityCheckClient<$Result.GetResult<Prisma.$QualityCheckPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first QualityCheck that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QualityCheckFindFirstArgs} args - Arguments to find a QualityCheck
     * @example
     * // Get one QualityCheck
     * const qualityCheck = await prisma.qualityCheck.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends QualityCheckFindFirstArgs>(args?: SelectSubset<T, QualityCheckFindFirstArgs<ExtArgs>>): Prisma__QualityCheckClient<$Result.GetResult<Prisma.$QualityCheckPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first QualityCheck that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QualityCheckFindFirstOrThrowArgs} args - Arguments to find a QualityCheck
     * @example
     * // Get one QualityCheck
     * const qualityCheck = await prisma.qualityCheck.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends QualityCheckFindFirstOrThrowArgs>(args?: SelectSubset<T, QualityCheckFindFirstOrThrowArgs<ExtArgs>>): Prisma__QualityCheckClient<$Result.GetResult<Prisma.$QualityCheckPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more QualityChecks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QualityCheckFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all QualityChecks
     * const qualityChecks = await prisma.qualityCheck.findMany()
     * 
     * // Get first 10 QualityChecks
     * const qualityChecks = await prisma.qualityCheck.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const qualityCheckWithIdOnly = await prisma.qualityCheck.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends QualityCheckFindManyArgs>(args?: SelectSubset<T, QualityCheckFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QualityCheckPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a QualityCheck.
     * @param {QualityCheckCreateArgs} args - Arguments to create a QualityCheck.
     * @example
     * // Create one QualityCheck
     * const QualityCheck = await prisma.qualityCheck.create({
     *   data: {
     *     // ... data to create a QualityCheck
     *   }
     * })
     * 
     */
    create<T extends QualityCheckCreateArgs>(args: SelectSubset<T, QualityCheckCreateArgs<ExtArgs>>): Prisma__QualityCheckClient<$Result.GetResult<Prisma.$QualityCheckPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many QualityChecks.
     * @param {QualityCheckCreateManyArgs} args - Arguments to create many QualityChecks.
     * @example
     * // Create many QualityChecks
     * const qualityCheck = await prisma.qualityCheck.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends QualityCheckCreateManyArgs>(args?: SelectSubset<T, QualityCheckCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many QualityChecks and returns the data saved in the database.
     * @param {QualityCheckCreateManyAndReturnArgs} args - Arguments to create many QualityChecks.
     * @example
     * // Create many QualityChecks
     * const qualityCheck = await prisma.qualityCheck.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many QualityChecks and only return the `id`
     * const qualityCheckWithIdOnly = await prisma.qualityCheck.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends QualityCheckCreateManyAndReturnArgs>(args?: SelectSubset<T, QualityCheckCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$QualityCheckPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a QualityCheck.
     * @param {QualityCheckDeleteArgs} args - Arguments to delete one QualityCheck.
     * @example
     * // Delete one QualityCheck
     * const QualityCheck = await prisma.qualityCheck.delete({
     *   where: {
     *     // ... filter to delete one QualityCheck
     *   }
     * })
     * 
     */
    delete<T extends QualityCheckDeleteArgs>(args: SelectSubset<T, QualityCheckDeleteArgs<ExtArgs>>): Prisma__QualityCheckClient<$Result.GetResult<Prisma.$QualityCheckPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one QualityCheck.
     * @param {QualityCheckUpdateArgs} args - Arguments to update one QualityCheck.
     * @example
     * // Update one QualityCheck
     * const qualityCheck = await prisma.qualityCheck.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends QualityCheckUpdateArgs>(args: SelectSubset<T, QualityCheckUpdateArgs<ExtArgs>>): Prisma__QualityCheckClient<$Result.GetResult<Prisma.$QualityCheckPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more QualityChecks.
     * @param {QualityCheckDeleteManyArgs} args - Arguments to filter QualityChecks to delete.
     * @example
     * // Delete a few QualityChecks
     * const { count } = await prisma.qualityCheck.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends QualityCheckDeleteManyArgs>(args?: SelectSubset<T, QualityCheckDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more QualityChecks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QualityCheckUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many QualityChecks
     * const qualityCheck = await prisma.qualityCheck.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends QualityCheckUpdateManyArgs>(args: SelectSubset<T, QualityCheckUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one QualityCheck.
     * @param {QualityCheckUpsertArgs} args - Arguments to update or create a QualityCheck.
     * @example
     * // Update or create a QualityCheck
     * const qualityCheck = await prisma.qualityCheck.upsert({
     *   create: {
     *     // ... data to create a QualityCheck
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the QualityCheck we want to update
     *   }
     * })
     */
    upsert<T extends QualityCheckUpsertArgs>(args: SelectSubset<T, QualityCheckUpsertArgs<ExtArgs>>): Prisma__QualityCheckClient<$Result.GetResult<Prisma.$QualityCheckPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of QualityChecks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QualityCheckCountArgs} args - Arguments to filter QualityChecks to count.
     * @example
     * // Count the number of QualityChecks
     * const count = await prisma.qualityCheck.count({
     *   where: {
     *     // ... the filter for the QualityChecks we want to count
     *   }
     * })
    **/
    count<T extends QualityCheckCountArgs>(
      args?: Subset<T, QualityCheckCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], QualityCheckCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a QualityCheck.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QualityCheckAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends QualityCheckAggregateArgs>(args: Subset<T, QualityCheckAggregateArgs>): Prisma.PrismaPromise<GetQualityCheckAggregateType<T>>

    /**
     * Group by QualityCheck.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {QualityCheckGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends QualityCheckGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: QualityCheckGroupByArgs['orderBy'] }
        : { orderBy?: QualityCheckGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, QualityCheckGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetQualityCheckGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the QualityCheck model
   */
  readonly fields: QualityCheckFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for QualityCheck.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__QualityCheckClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    item<T extends InventoryItemDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InventoryItemDefaultArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the QualityCheck model
   */ 
  interface QualityCheckFieldRefs {
    readonly id: FieldRef<"QualityCheck", 'BigInt'>
    readonly itemId: FieldRef<"QualityCheck", 'BigInt'>
    readonly checkerId: FieldRef<"QualityCheck", 'BigInt'>
    readonly checkType: FieldRef<"QualityCheck", 'CheckType'>
    readonly result: FieldRef<"QualityCheck", 'CheckResult'>
    readonly score: FieldRef<"QualityCheck", 'Int'>
    readonly notes: FieldRef<"QualityCheck", 'String'>
    readonly images: FieldRef<"QualityCheck", 'String[]'>
    readonly checkedAt: FieldRef<"QualityCheck", 'DateTime'>
    readonly createdAt: FieldRef<"QualityCheck", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * QualityCheck findUnique
   */
  export type QualityCheckFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QualityCheck
     */
    select?: QualityCheckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QualityCheckInclude<ExtArgs> | null
    /**
     * Filter, which QualityCheck to fetch.
     */
    where: QualityCheckWhereUniqueInput
  }

  /**
   * QualityCheck findUniqueOrThrow
   */
  export type QualityCheckFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QualityCheck
     */
    select?: QualityCheckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QualityCheckInclude<ExtArgs> | null
    /**
     * Filter, which QualityCheck to fetch.
     */
    where: QualityCheckWhereUniqueInput
  }

  /**
   * QualityCheck findFirst
   */
  export type QualityCheckFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QualityCheck
     */
    select?: QualityCheckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QualityCheckInclude<ExtArgs> | null
    /**
     * Filter, which QualityCheck to fetch.
     */
    where?: QualityCheckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QualityChecks to fetch.
     */
    orderBy?: QualityCheckOrderByWithRelationInput | QualityCheckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for QualityChecks.
     */
    cursor?: QualityCheckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QualityChecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QualityChecks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of QualityChecks.
     */
    distinct?: QualityCheckScalarFieldEnum | QualityCheckScalarFieldEnum[]
  }

  /**
   * QualityCheck findFirstOrThrow
   */
  export type QualityCheckFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QualityCheck
     */
    select?: QualityCheckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QualityCheckInclude<ExtArgs> | null
    /**
     * Filter, which QualityCheck to fetch.
     */
    where?: QualityCheckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QualityChecks to fetch.
     */
    orderBy?: QualityCheckOrderByWithRelationInput | QualityCheckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for QualityChecks.
     */
    cursor?: QualityCheckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QualityChecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QualityChecks.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of QualityChecks.
     */
    distinct?: QualityCheckScalarFieldEnum | QualityCheckScalarFieldEnum[]
  }

  /**
   * QualityCheck findMany
   */
  export type QualityCheckFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QualityCheck
     */
    select?: QualityCheckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QualityCheckInclude<ExtArgs> | null
    /**
     * Filter, which QualityChecks to fetch.
     */
    where?: QualityCheckWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of QualityChecks to fetch.
     */
    orderBy?: QualityCheckOrderByWithRelationInput | QualityCheckOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing QualityChecks.
     */
    cursor?: QualityCheckWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` QualityChecks from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` QualityChecks.
     */
    skip?: number
    distinct?: QualityCheckScalarFieldEnum | QualityCheckScalarFieldEnum[]
  }

  /**
   * QualityCheck create
   */
  export type QualityCheckCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QualityCheck
     */
    select?: QualityCheckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QualityCheckInclude<ExtArgs> | null
    /**
     * The data needed to create a QualityCheck.
     */
    data: XOR<QualityCheckCreateInput, QualityCheckUncheckedCreateInput>
  }

  /**
   * QualityCheck createMany
   */
  export type QualityCheckCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many QualityChecks.
     */
    data: QualityCheckCreateManyInput | QualityCheckCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * QualityCheck createManyAndReturn
   */
  export type QualityCheckCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QualityCheck
     */
    select?: QualityCheckSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many QualityChecks.
     */
    data: QualityCheckCreateManyInput | QualityCheckCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QualityCheckIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * QualityCheck update
   */
  export type QualityCheckUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QualityCheck
     */
    select?: QualityCheckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QualityCheckInclude<ExtArgs> | null
    /**
     * The data needed to update a QualityCheck.
     */
    data: XOR<QualityCheckUpdateInput, QualityCheckUncheckedUpdateInput>
    /**
     * Choose, which QualityCheck to update.
     */
    where: QualityCheckWhereUniqueInput
  }

  /**
   * QualityCheck updateMany
   */
  export type QualityCheckUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update QualityChecks.
     */
    data: XOR<QualityCheckUpdateManyMutationInput, QualityCheckUncheckedUpdateManyInput>
    /**
     * Filter which QualityChecks to update
     */
    where?: QualityCheckWhereInput
  }

  /**
   * QualityCheck upsert
   */
  export type QualityCheckUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QualityCheck
     */
    select?: QualityCheckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QualityCheckInclude<ExtArgs> | null
    /**
     * The filter to search for the QualityCheck to update in case it exists.
     */
    where: QualityCheckWhereUniqueInput
    /**
     * In case the QualityCheck found by the `where` argument doesn't exist, create a new QualityCheck with this data.
     */
    create: XOR<QualityCheckCreateInput, QualityCheckUncheckedCreateInput>
    /**
     * In case the QualityCheck was found with the provided `where` argument, update it with this data.
     */
    update: XOR<QualityCheckUpdateInput, QualityCheckUncheckedUpdateInput>
  }

  /**
   * QualityCheck delete
   */
  export type QualityCheckDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QualityCheck
     */
    select?: QualityCheckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QualityCheckInclude<ExtArgs> | null
    /**
     * Filter which QualityCheck to delete.
     */
    where: QualityCheckWhereUniqueInput
  }

  /**
   * QualityCheck deleteMany
   */
  export type QualityCheckDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which QualityChecks to delete
     */
    where?: QualityCheckWhereInput
  }

  /**
   * QualityCheck without action
   */
  export type QualityCheckDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the QualityCheck
     */
    select?: QualityCheckSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: QualityCheckInclude<ExtArgs> | null
  }


  /**
   * Model Reservation
   */

  export type AggregateReservation = {
    _count: ReservationCountAggregateOutputType | null
    _avg: ReservationAvgAggregateOutputType | null
    _sum: ReservationSumAggregateOutputType | null
    _min: ReservationMinAggregateOutputType | null
    _max: ReservationMaxAggregateOutputType | null
  }

  export type ReservationAvgAggregateOutputType = {
    id: number | null
    itemId: number | null
    quantity: Decimal | null
  }

  export type ReservationSumAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    quantity: Decimal | null
  }

  export type ReservationMinAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    orderId: string | null
    quantity: Decimal | null
    status: $Enums.ReservationStatus | null
    reservedAt: Date | null
    expiresAt: Date | null
    confirmedAt: Date | null
    cancelledAt: Date | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReservationMaxAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    orderId: string | null
    quantity: Decimal | null
    status: $Enums.ReservationStatus | null
    reservedAt: Date | null
    expiresAt: Date | null
    confirmedAt: Date | null
    cancelledAt: Date | null
    notes: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ReservationCountAggregateOutputType = {
    id: number
    itemId: number
    orderId: number
    quantity: number
    status: number
    reservedAt: number
    expiresAt: number
    confirmedAt: number
    cancelledAt: number
    notes: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ReservationAvgAggregateInputType = {
    id?: true
    itemId?: true
    quantity?: true
  }

  export type ReservationSumAggregateInputType = {
    id?: true
    itemId?: true
    quantity?: true
  }

  export type ReservationMinAggregateInputType = {
    id?: true
    itemId?: true
    orderId?: true
    quantity?: true
    status?: true
    reservedAt?: true
    expiresAt?: true
    confirmedAt?: true
    cancelledAt?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReservationMaxAggregateInputType = {
    id?: true
    itemId?: true
    orderId?: true
    quantity?: true
    status?: true
    reservedAt?: true
    expiresAt?: true
    confirmedAt?: true
    cancelledAt?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ReservationCountAggregateInputType = {
    id?: true
    itemId?: true
    orderId?: true
    quantity?: true
    status?: true
    reservedAt?: true
    expiresAt?: true
    confirmedAt?: true
    cancelledAt?: true
    notes?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ReservationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Reservation to aggregate.
     */
    where?: ReservationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reservations to fetch.
     */
    orderBy?: ReservationOrderByWithRelationInput | ReservationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ReservationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reservations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reservations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Reservations
    **/
    _count?: true | ReservationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ReservationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ReservationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ReservationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ReservationMaxAggregateInputType
  }

  export type GetReservationAggregateType<T extends ReservationAggregateArgs> = {
        [P in keyof T & keyof AggregateReservation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateReservation[P]>
      : GetScalarType<T[P], AggregateReservation[P]>
  }




  export type ReservationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ReservationWhereInput
    orderBy?: ReservationOrderByWithAggregationInput | ReservationOrderByWithAggregationInput[]
    by: ReservationScalarFieldEnum[] | ReservationScalarFieldEnum
    having?: ReservationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ReservationCountAggregateInputType | true
    _avg?: ReservationAvgAggregateInputType
    _sum?: ReservationSumAggregateInputType
    _min?: ReservationMinAggregateInputType
    _max?: ReservationMaxAggregateInputType
  }

  export type ReservationGroupByOutputType = {
    id: bigint
    itemId: bigint
    orderId: string
    quantity: Decimal
    status: $Enums.ReservationStatus
    reservedAt: Date
    expiresAt: Date | null
    confirmedAt: Date | null
    cancelledAt: Date | null
    notes: string | null
    createdAt: Date
    updatedAt: Date
    _count: ReservationCountAggregateOutputType | null
    _avg: ReservationAvgAggregateOutputType | null
    _sum: ReservationSumAggregateOutputType | null
    _min: ReservationMinAggregateOutputType | null
    _max: ReservationMaxAggregateOutputType | null
  }

  type GetReservationGroupByPayload<T extends ReservationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ReservationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ReservationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ReservationGroupByOutputType[P]>
            : GetScalarType<T[P], ReservationGroupByOutputType[P]>
        }
      >
    >


  export type ReservationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    orderId?: boolean
    quantity?: boolean
    status?: boolean
    reservedAt?: boolean
    expiresAt?: boolean
    confirmedAt?: boolean
    cancelledAt?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reservation"]>

  export type ReservationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    orderId?: boolean
    quantity?: boolean
    status?: boolean
    reservedAt?: boolean
    expiresAt?: boolean
    confirmedAt?: boolean
    cancelledAt?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["reservation"]>

  export type ReservationSelectScalar = {
    id?: boolean
    itemId?: boolean
    orderId?: boolean
    quantity?: boolean
    status?: boolean
    reservedAt?: boolean
    expiresAt?: boolean
    confirmedAt?: boolean
    cancelledAt?: boolean
    notes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ReservationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }
  export type ReservationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
  }

  export type $ReservationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Reservation"
    objects: {
      item: Prisma.$InventoryItemPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      itemId: bigint
      orderId: string
      quantity: Prisma.Decimal
      status: $Enums.ReservationStatus
      reservedAt: Date
      expiresAt: Date | null
      confirmedAt: Date | null
      cancelledAt: Date | null
      notes: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["reservation"]>
    composites: {}
  }

  type ReservationGetPayload<S extends boolean | null | undefined | ReservationDefaultArgs> = $Result.GetResult<Prisma.$ReservationPayload, S>

  type ReservationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ReservationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ReservationCountAggregateInputType | true
    }

  export interface ReservationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Reservation'], meta: { name: 'Reservation' } }
    /**
     * Find zero or one Reservation that matches the filter.
     * @param {ReservationFindUniqueArgs} args - Arguments to find a Reservation
     * @example
     * // Get one Reservation
     * const reservation = await prisma.reservation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ReservationFindUniqueArgs>(args: SelectSubset<T, ReservationFindUniqueArgs<ExtArgs>>): Prisma__ReservationClient<$Result.GetResult<Prisma.$ReservationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Reservation that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ReservationFindUniqueOrThrowArgs} args - Arguments to find a Reservation
     * @example
     * // Get one Reservation
     * const reservation = await prisma.reservation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ReservationFindUniqueOrThrowArgs>(args: SelectSubset<T, ReservationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ReservationClient<$Result.GetResult<Prisma.$ReservationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Reservation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReservationFindFirstArgs} args - Arguments to find a Reservation
     * @example
     * // Get one Reservation
     * const reservation = await prisma.reservation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ReservationFindFirstArgs>(args?: SelectSubset<T, ReservationFindFirstArgs<ExtArgs>>): Prisma__ReservationClient<$Result.GetResult<Prisma.$ReservationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Reservation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReservationFindFirstOrThrowArgs} args - Arguments to find a Reservation
     * @example
     * // Get one Reservation
     * const reservation = await prisma.reservation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ReservationFindFirstOrThrowArgs>(args?: SelectSubset<T, ReservationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ReservationClient<$Result.GetResult<Prisma.$ReservationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Reservations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReservationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Reservations
     * const reservations = await prisma.reservation.findMany()
     * 
     * // Get first 10 Reservations
     * const reservations = await prisma.reservation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const reservationWithIdOnly = await prisma.reservation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ReservationFindManyArgs>(args?: SelectSubset<T, ReservationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReservationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Reservation.
     * @param {ReservationCreateArgs} args - Arguments to create a Reservation.
     * @example
     * // Create one Reservation
     * const Reservation = await prisma.reservation.create({
     *   data: {
     *     // ... data to create a Reservation
     *   }
     * })
     * 
     */
    create<T extends ReservationCreateArgs>(args: SelectSubset<T, ReservationCreateArgs<ExtArgs>>): Prisma__ReservationClient<$Result.GetResult<Prisma.$ReservationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Reservations.
     * @param {ReservationCreateManyArgs} args - Arguments to create many Reservations.
     * @example
     * // Create many Reservations
     * const reservation = await prisma.reservation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ReservationCreateManyArgs>(args?: SelectSubset<T, ReservationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Reservations and returns the data saved in the database.
     * @param {ReservationCreateManyAndReturnArgs} args - Arguments to create many Reservations.
     * @example
     * // Create many Reservations
     * const reservation = await prisma.reservation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Reservations and only return the `id`
     * const reservationWithIdOnly = await prisma.reservation.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ReservationCreateManyAndReturnArgs>(args?: SelectSubset<T, ReservationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ReservationPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Reservation.
     * @param {ReservationDeleteArgs} args - Arguments to delete one Reservation.
     * @example
     * // Delete one Reservation
     * const Reservation = await prisma.reservation.delete({
     *   where: {
     *     // ... filter to delete one Reservation
     *   }
     * })
     * 
     */
    delete<T extends ReservationDeleteArgs>(args: SelectSubset<T, ReservationDeleteArgs<ExtArgs>>): Prisma__ReservationClient<$Result.GetResult<Prisma.$ReservationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Reservation.
     * @param {ReservationUpdateArgs} args - Arguments to update one Reservation.
     * @example
     * // Update one Reservation
     * const reservation = await prisma.reservation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ReservationUpdateArgs>(args: SelectSubset<T, ReservationUpdateArgs<ExtArgs>>): Prisma__ReservationClient<$Result.GetResult<Prisma.$ReservationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Reservations.
     * @param {ReservationDeleteManyArgs} args - Arguments to filter Reservations to delete.
     * @example
     * // Delete a few Reservations
     * const { count } = await prisma.reservation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ReservationDeleteManyArgs>(args?: SelectSubset<T, ReservationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Reservations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReservationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Reservations
     * const reservation = await prisma.reservation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ReservationUpdateManyArgs>(args: SelectSubset<T, ReservationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Reservation.
     * @param {ReservationUpsertArgs} args - Arguments to update or create a Reservation.
     * @example
     * // Update or create a Reservation
     * const reservation = await prisma.reservation.upsert({
     *   create: {
     *     // ... data to create a Reservation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Reservation we want to update
     *   }
     * })
     */
    upsert<T extends ReservationUpsertArgs>(args: SelectSubset<T, ReservationUpsertArgs<ExtArgs>>): Prisma__ReservationClient<$Result.GetResult<Prisma.$ReservationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Reservations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReservationCountArgs} args - Arguments to filter Reservations to count.
     * @example
     * // Count the number of Reservations
     * const count = await prisma.reservation.count({
     *   where: {
     *     // ... the filter for the Reservations we want to count
     *   }
     * })
    **/
    count<T extends ReservationCountArgs>(
      args?: Subset<T, ReservationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ReservationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Reservation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReservationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ReservationAggregateArgs>(args: Subset<T, ReservationAggregateArgs>): Prisma.PrismaPromise<GetReservationAggregateType<T>>

    /**
     * Group by Reservation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ReservationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ReservationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ReservationGroupByArgs['orderBy'] }
        : { orderBy?: ReservationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ReservationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetReservationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Reservation model
   */
  readonly fields: ReservationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Reservation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ReservationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    item<T extends InventoryItemDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InventoryItemDefaultArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Reservation model
   */ 
  interface ReservationFieldRefs {
    readonly id: FieldRef<"Reservation", 'BigInt'>
    readonly itemId: FieldRef<"Reservation", 'BigInt'>
    readonly orderId: FieldRef<"Reservation", 'String'>
    readonly quantity: FieldRef<"Reservation", 'Decimal'>
    readonly status: FieldRef<"Reservation", 'ReservationStatus'>
    readonly reservedAt: FieldRef<"Reservation", 'DateTime'>
    readonly expiresAt: FieldRef<"Reservation", 'DateTime'>
    readonly confirmedAt: FieldRef<"Reservation", 'DateTime'>
    readonly cancelledAt: FieldRef<"Reservation", 'DateTime'>
    readonly notes: FieldRef<"Reservation", 'String'>
    readonly createdAt: FieldRef<"Reservation", 'DateTime'>
    readonly updatedAt: FieldRef<"Reservation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Reservation findUnique
   */
  export type ReservationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reservation
     */
    select?: ReservationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReservationInclude<ExtArgs> | null
    /**
     * Filter, which Reservation to fetch.
     */
    where: ReservationWhereUniqueInput
  }

  /**
   * Reservation findUniqueOrThrow
   */
  export type ReservationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reservation
     */
    select?: ReservationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReservationInclude<ExtArgs> | null
    /**
     * Filter, which Reservation to fetch.
     */
    where: ReservationWhereUniqueInput
  }

  /**
   * Reservation findFirst
   */
  export type ReservationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reservation
     */
    select?: ReservationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReservationInclude<ExtArgs> | null
    /**
     * Filter, which Reservation to fetch.
     */
    where?: ReservationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reservations to fetch.
     */
    orderBy?: ReservationOrderByWithRelationInput | ReservationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Reservations.
     */
    cursor?: ReservationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reservations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reservations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Reservations.
     */
    distinct?: ReservationScalarFieldEnum | ReservationScalarFieldEnum[]
  }

  /**
   * Reservation findFirstOrThrow
   */
  export type ReservationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reservation
     */
    select?: ReservationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReservationInclude<ExtArgs> | null
    /**
     * Filter, which Reservation to fetch.
     */
    where?: ReservationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reservations to fetch.
     */
    orderBy?: ReservationOrderByWithRelationInput | ReservationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Reservations.
     */
    cursor?: ReservationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reservations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reservations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Reservations.
     */
    distinct?: ReservationScalarFieldEnum | ReservationScalarFieldEnum[]
  }

  /**
   * Reservation findMany
   */
  export type ReservationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reservation
     */
    select?: ReservationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReservationInclude<ExtArgs> | null
    /**
     * Filter, which Reservations to fetch.
     */
    where?: ReservationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Reservations to fetch.
     */
    orderBy?: ReservationOrderByWithRelationInput | ReservationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Reservations.
     */
    cursor?: ReservationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Reservations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Reservations.
     */
    skip?: number
    distinct?: ReservationScalarFieldEnum | ReservationScalarFieldEnum[]
  }

  /**
   * Reservation create
   */
  export type ReservationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reservation
     */
    select?: ReservationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReservationInclude<ExtArgs> | null
    /**
     * The data needed to create a Reservation.
     */
    data: XOR<ReservationCreateInput, ReservationUncheckedCreateInput>
  }

  /**
   * Reservation createMany
   */
  export type ReservationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Reservations.
     */
    data: ReservationCreateManyInput | ReservationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Reservation createManyAndReturn
   */
  export type ReservationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reservation
     */
    select?: ReservationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Reservations.
     */
    data: ReservationCreateManyInput | ReservationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReservationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Reservation update
   */
  export type ReservationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reservation
     */
    select?: ReservationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReservationInclude<ExtArgs> | null
    /**
     * The data needed to update a Reservation.
     */
    data: XOR<ReservationUpdateInput, ReservationUncheckedUpdateInput>
    /**
     * Choose, which Reservation to update.
     */
    where: ReservationWhereUniqueInput
  }

  /**
   * Reservation updateMany
   */
  export type ReservationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Reservations.
     */
    data: XOR<ReservationUpdateManyMutationInput, ReservationUncheckedUpdateManyInput>
    /**
     * Filter which Reservations to update
     */
    where?: ReservationWhereInput
  }

  /**
   * Reservation upsert
   */
  export type ReservationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reservation
     */
    select?: ReservationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReservationInclude<ExtArgs> | null
    /**
     * The filter to search for the Reservation to update in case it exists.
     */
    where: ReservationWhereUniqueInput
    /**
     * In case the Reservation found by the `where` argument doesn't exist, create a new Reservation with this data.
     */
    create: XOR<ReservationCreateInput, ReservationUncheckedCreateInput>
    /**
     * In case the Reservation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ReservationUpdateInput, ReservationUncheckedUpdateInput>
  }

  /**
   * Reservation delete
   */
  export type ReservationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reservation
     */
    select?: ReservationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReservationInclude<ExtArgs> | null
    /**
     * Filter which Reservation to delete.
     */
    where: ReservationWhereUniqueInput
  }

  /**
   * Reservation deleteMany
   */
  export type ReservationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Reservations to delete
     */
    where?: ReservationWhereInput
  }

  /**
   * Reservation without action
   */
  export type ReservationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Reservation
     */
    select?: ReservationSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ReservationInclude<ExtArgs> | null
  }


  /**
   * Model InventoryMovement
   */

  export type AggregateInventoryMovement = {
    _count: InventoryMovementCountAggregateOutputType | null
    _avg: InventoryMovementAvgAggregateOutputType | null
    _sum: InventoryMovementSumAggregateOutputType | null
    _min: InventoryMovementMinAggregateOutputType | null
    _max: InventoryMovementMaxAggregateOutputType | null
  }

  export type InventoryMovementAvgAggregateOutputType = {
    id: number | null
    itemId: number | null
    warehouseId: number | null
    categoryId: number | null
    quantity: Decimal | null
    unitPrice: Decimal | null
    totalAmount: Decimal | null
    beforeQty: Decimal | null
    afterQty: Decimal | null
    referenceId: number | null
    operatorId: number | null
  }

  export type InventoryMovementSumAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    warehouseId: bigint | null
    categoryId: bigint | null
    quantity: Decimal | null
    unitPrice: Decimal | null
    totalAmount: Decimal | null
    beforeQty: Decimal | null
    afterQty: Decimal | null
    referenceId: bigint | null
    operatorId: bigint | null
  }

  export type InventoryMovementMinAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    warehouseId: bigint | null
    categoryId: bigint | null
    movementType: $Enums.MovementType | null
    direction: $Enums.MovementDirection | null
    quantity: Decimal | null
    unitPrice: Decimal | null
    totalAmount: Decimal | null
    beforeQty: Decimal | null
    afterQty: Decimal | null
    referenceType: string | null
    referenceId: bigint | null
    referenceNo: string | null
    operatorId: bigint | null
    operatorName: string | null
    remark: string | null
    createdAt: Date | null
  }

  export type InventoryMovementMaxAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    warehouseId: bigint | null
    categoryId: bigint | null
    movementType: $Enums.MovementType | null
    direction: $Enums.MovementDirection | null
    quantity: Decimal | null
    unitPrice: Decimal | null
    totalAmount: Decimal | null
    beforeQty: Decimal | null
    afterQty: Decimal | null
    referenceType: string | null
    referenceId: bigint | null
    referenceNo: string | null
    operatorId: bigint | null
    operatorName: string | null
    remark: string | null
    createdAt: Date | null
  }

  export type InventoryMovementCountAggregateOutputType = {
    id: number
    itemId: number
    warehouseId: number
    categoryId: number
    movementType: number
    direction: number
    quantity: number
    unitPrice: number
    totalAmount: number
    beforeQty: number
    afterQty: number
    referenceType: number
    referenceId: number
    referenceNo: number
    operatorId: number
    operatorName: number
    remark: number
    createdAt: number
    _all: number
  }


  export type InventoryMovementAvgAggregateInputType = {
    id?: true
    itemId?: true
    warehouseId?: true
    categoryId?: true
    quantity?: true
    unitPrice?: true
    totalAmount?: true
    beforeQty?: true
    afterQty?: true
    referenceId?: true
    operatorId?: true
  }

  export type InventoryMovementSumAggregateInputType = {
    id?: true
    itemId?: true
    warehouseId?: true
    categoryId?: true
    quantity?: true
    unitPrice?: true
    totalAmount?: true
    beforeQty?: true
    afterQty?: true
    referenceId?: true
    operatorId?: true
  }

  export type InventoryMovementMinAggregateInputType = {
    id?: true
    itemId?: true
    warehouseId?: true
    categoryId?: true
    movementType?: true
    direction?: true
    quantity?: true
    unitPrice?: true
    totalAmount?: true
    beforeQty?: true
    afterQty?: true
    referenceType?: true
    referenceId?: true
    referenceNo?: true
    operatorId?: true
    operatorName?: true
    remark?: true
    createdAt?: true
  }

  export type InventoryMovementMaxAggregateInputType = {
    id?: true
    itemId?: true
    warehouseId?: true
    categoryId?: true
    movementType?: true
    direction?: true
    quantity?: true
    unitPrice?: true
    totalAmount?: true
    beforeQty?: true
    afterQty?: true
    referenceType?: true
    referenceId?: true
    referenceNo?: true
    operatorId?: true
    operatorName?: true
    remark?: true
    createdAt?: true
  }

  export type InventoryMovementCountAggregateInputType = {
    id?: true
    itemId?: true
    warehouseId?: true
    categoryId?: true
    movementType?: true
    direction?: true
    quantity?: true
    unitPrice?: true
    totalAmount?: true
    beforeQty?: true
    afterQty?: true
    referenceType?: true
    referenceId?: true
    referenceNo?: true
    operatorId?: true
    operatorName?: true
    remark?: true
    createdAt?: true
    _all?: true
  }

  export type InventoryMovementAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InventoryMovement to aggregate.
     */
    where?: InventoryMovementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryMovements to fetch.
     */
    orderBy?: InventoryMovementOrderByWithRelationInput | InventoryMovementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InventoryMovementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryMovements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryMovements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InventoryMovements
    **/
    _count?: true | InventoryMovementCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InventoryMovementAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InventoryMovementSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InventoryMovementMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InventoryMovementMaxAggregateInputType
  }

  export type GetInventoryMovementAggregateType<T extends InventoryMovementAggregateArgs> = {
        [P in keyof T & keyof AggregateInventoryMovement]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInventoryMovement[P]>
      : GetScalarType<T[P], AggregateInventoryMovement[P]>
  }




  export type InventoryMovementGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventoryMovementWhereInput
    orderBy?: InventoryMovementOrderByWithAggregationInput | InventoryMovementOrderByWithAggregationInput[]
    by: InventoryMovementScalarFieldEnum[] | InventoryMovementScalarFieldEnum
    having?: InventoryMovementScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InventoryMovementCountAggregateInputType | true
    _avg?: InventoryMovementAvgAggregateInputType
    _sum?: InventoryMovementSumAggregateInputType
    _min?: InventoryMovementMinAggregateInputType
    _max?: InventoryMovementMaxAggregateInputType
  }

  export type InventoryMovementGroupByOutputType = {
    id: bigint
    itemId: bigint
    warehouseId: bigint
    categoryId: bigint
    movementType: $Enums.MovementType
    direction: $Enums.MovementDirection
    quantity: Decimal
    unitPrice: Decimal | null
    totalAmount: Decimal | null
    beforeQty: Decimal
    afterQty: Decimal
    referenceType: string | null
    referenceId: bigint | null
    referenceNo: string | null
    operatorId: bigint | null
    operatorName: string | null
    remark: string | null
    createdAt: Date
    _count: InventoryMovementCountAggregateOutputType | null
    _avg: InventoryMovementAvgAggregateOutputType | null
    _sum: InventoryMovementSumAggregateOutputType | null
    _min: InventoryMovementMinAggregateOutputType | null
    _max: InventoryMovementMaxAggregateOutputType | null
  }

  type GetInventoryMovementGroupByPayload<T extends InventoryMovementGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InventoryMovementGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InventoryMovementGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InventoryMovementGroupByOutputType[P]>
            : GetScalarType<T[P], InventoryMovementGroupByOutputType[P]>
        }
      >
    >


  export type InventoryMovementSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    warehouseId?: boolean
    categoryId?: boolean
    movementType?: boolean
    direction?: boolean
    quantity?: boolean
    unitPrice?: boolean
    totalAmount?: boolean
    beforeQty?: boolean
    afterQty?: boolean
    referenceType?: boolean
    referenceId?: boolean
    referenceNo?: boolean
    operatorId?: boolean
    operatorName?: boolean
    remark?: boolean
    createdAt?: boolean
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
    warehouse?: boolean | WarehouseDefaultArgs<ExtArgs>
    category?: boolean | ItemCategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inventoryMovement"]>

  export type InventoryMovementSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    warehouseId?: boolean
    categoryId?: boolean
    movementType?: boolean
    direction?: boolean
    quantity?: boolean
    unitPrice?: boolean
    totalAmount?: boolean
    beforeQty?: boolean
    afterQty?: boolean
    referenceType?: boolean
    referenceId?: boolean
    referenceNo?: boolean
    operatorId?: boolean
    operatorName?: boolean
    remark?: boolean
    createdAt?: boolean
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
    warehouse?: boolean | WarehouseDefaultArgs<ExtArgs>
    category?: boolean | ItemCategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["inventoryMovement"]>

  export type InventoryMovementSelectScalar = {
    id?: boolean
    itemId?: boolean
    warehouseId?: boolean
    categoryId?: boolean
    movementType?: boolean
    direction?: boolean
    quantity?: boolean
    unitPrice?: boolean
    totalAmount?: boolean
    beforeQty?: boolean
    afterQty?: boolean
    referenceType?: boolean
    referenceId?: boolean
    referenceNo?: boolean
    operatorId?: boolean
    operatorName?: boolean
    remark?: boolean
    createdAt?: boolean
  }

  export type InventoryMovementInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
    warehouse?: boolean | WarehouseDefaultArgs<ExtArgs>
    category?: boolean | ItemCategoryDefaultArgs<ExtArgs>
  }
  export type InventoryMovementIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    item?: boolean | InventoryItemDefaultArgs<ExtArgs>
    warehouse?: boolean | WarehouseDefaultArgs<ExtArgs>
    category?: boolean | ItemCategoryDefaultArgs<ExtArgs>
  }

  export type $InventoryMovementPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InventoryMovement"
    objects: {
      item: Prisma.$InventoryItemPayload<ExtArgs>
      warehouse: Prisma.$WarehousePayload<ExtArgs>
      category: Prisma.$ItemCategoryPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      itemId: bigint
      warehouseId: bigint
      categoryId: bigint
      movementType: $Enums.MovementType
      direction: $Enums.MovementDirection
      quantity: Prisma.Decimal
      unitPrice: Prisma.Decimal | null
      totalAmount: Prisma.Decimal | null
      beforeQty: Prisma.Decimal
      afterQty: Prisma.Decimal
      referenceType: string | null
      referenceId: bigint | null
      referenceNo: string | null
      operatorId: bigint | null
      operatorName: string | null
      remark: string | null
      createdAt: Date
    }, ExtArgs["result"]["inventoryMovement"]>
    composites: {}
  }

  type InventoryMovementGetPayload<S extends boolean | null | undefined | InventoryMovementDefaultArgs> = $Result.GetResult<Prisma.$InventoryMovementPayload, S>

  type InventoryMovementCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<InventoryMovementFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: InventoryMovementCountAggregateInputType | true
    }

  export interface InventoryMovementDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InventoryMovement'], meta: { name: 'InventoryMovement' } }
    /**
     * Find zero or one InventoryMovement that matches the filter.
     * @param {InventoryMovementFindUniqueArgs} args - Arguments to find a InventoryMovement
     * @example
     * // Get one InventoryMovement
     * const inventoryMovement = await prisma.inventoryMovement.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InventoryMovementFindUniqueArgs>(args: SelectSubset<T, InventoryMovementFindUniqueArgs<ExtArgs>>): Prisma__InventoryMovementClient<$Result.GetResult<Prisma.$InventoryMovementPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one InventoryMovement that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {InventoryMovementFindUniqueOrThrowArgs} args - Arguments to find a InventoryMovement
     * @example
     * // Get one InventoryMovement
     * const inventoryMovement = await prisma.inventoryMovement.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InventoryMovementFindUniqueOrThrowArgs>(args: SelectSubset<T, InventoryMovementFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InventoryMovementClient<$Result.GetResult<Prisma.$InventoryMovementPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first InventoryMovement that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryMovementFindFirstArgs} args - Arguments to find a InventoryMovement
     * @example
     * // Get one InventoryMovement
     * const inventoryMovement = await prisma.inventoryMovement.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InventoryMovementFindFirstArgs>(args?: SelectSubset<T, InventoryMovementFindFirstArgs<ExtArgs>>): Prisma__InventoryMovementClient<$Result.GetResult<Prisma.$InventoryMovementPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first InventoryMovement that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryMovementFindFirstOrThrowArgs} args - Arguments to find a InventoryMovement
     * @example
     * // Get one InventoryMovement
     * const inventoryMovement = await prisma.inventoryMovement.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InventoryMovementFindFirstOrThrowArgs>(args?: SelectSubset<T, InventoryMovementFindFirstOrThrowArgs<ExtArgs>>): Prisma__InventoryMovementClient<$Result.GetResult<Prisma.$InventoryMovementPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more InventoryMovements that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryMovementFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InventoryMovements
     * const inventoryMovements = await prisma.inventoryMovement.findMany()
     * 
     * // Get first 10 InventoryMovements
     * const inventoryMovements = await prisma.inventoryMovement.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inventoryMovementWithIdOnly = await prisma.inventoryMovement.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InventoryMovementFindManyArgs>(args?: SelectSubset<T, InventoryMovementFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryMovementPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a InventoryMovement.
     * @param {InventoryMovementCreateArgs} args - Arguments to create a InventoryMovement.
     * @example
     * // Create one InventoryMovement
     * const InventoryMovement = await prisma.inventoryMovement.create({
     *   data: {
     *     // ... data to create a InventoryMovement
     *   }
     * })
     * 
     */
    create<T extends InventoryMovementCreateArgs>(args: SelectSubset<T, InventoryMovementCreateArgs<ExtArgs>>): Prisma__InventoryMovementClient<$Result.GetResult<Prisma.$InventoryMovementPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many InventoryMovements.
     * @param {InventoryMovementCreateManyArgs} args - Arguments to create many InventoryMovements.
     * @example
     * // Create many InventoryMovements
     * const inventoryMovement = await prisma.inventoryMovement.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InventoryMovementCreateManyArgs>(args?: SelectSubset<T, InventoryMovementCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InventoryMovements and returns the data saved in the database.
     * @param {InventoryMovementCreateManyAndReturnArgs} args - Arguments to create many InventoryMovements.
     * @example
     * // Create many InventoryMovements
     * const inventoryMovement = await prisma.inventoryMovement.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InventoryMovements and only return the `id`
     * const inventoryMovementWithIdOnly = await prisma.inventoryMovement.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InventoryMovementCreateManyAndReturnArgs>(args?: SelectSubset<T, InventoryMovementCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryMovementPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a InventoryMovement.
     * @param {InventoryMovementDeleteArgs} args - Arguments to delete one InventoryMovement.
     * @example
     * // Delete one InventoryMovement
     * const InventoryMovement = await prisma.inventoryMovement.delete({
     *   where: {
     *     // ... filter to delete one InventoryMovement
     *   }
     * })
     * 
     */
    delete<T extends InventoryMovementDeleteArgs>(args: SelectSubset<T, InventoryMovementDeleteArgs<ExtArgs>>): Prisma__InventoryMovementClient<$Result.GetResult<Prisma.$InventoryMovementPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one InventoryMovement.
     * @param {InventoryMovementUpdateArgs} args - Arguments to update one InventoryMovement.
     * @example
     * // Update one InventoryMovement
     * const inventoryMovement = await prisma.inventoryMovement.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InventoryMovementUpdateArgs>(args: SelectSubset<T, InventoryMovementUpdateArgs<ExtArgs>>): Prisma__InventoryMovementClient<$Result.GetResult<Prisma.$InventoryMovementPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more InventoryMovements.
     * @param {InventoryMovementDeleteManyArgs} args - Arguments to filter InventoryMovements to delete.
     * @example
     * // Delete a few InventoryMovements
     * const { count } = await prisma.inventoryMovement.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InventoryMovementDeleteManyArgs>(args?: SelectSubset<T, InventoryMovementDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InventoryMovements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryMovementUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InventoryMovements
     * const inventoryMovement = await prisma.inventoryMovement.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InventoryMovementUpdateManyArgs>(args: SelectSubset<T, InventoryMovementUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one InventoryMovement.
     * @param {InventoryMovementUpsertArgs} args - Arguments to update or create a InventoryMovement.
     * @example
     * // Update or create a InventoryMovement
     * const inventoryMovement = await prisma.inventoryMovement.upsert({
     *   create: {
     *     // ... data to create a InventoryMovement
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InventoryMovement we want to update
     *   }
     * })
     */
    upsert<T extends InventoryMovementUpsertArgs>(args: SelectSubset<T, InventoryMovementUpsertArgs<ExtArgs>>): Prisma__InventoryMovementClient<$Result.GetResult<Prisma.$InventoryMovementPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of InventoryMovements.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryMovementCountArgs} args - Arguments to filter InventoryMovements to count.
     * @example
     * // Count the number of InventoryMovements
     * const count = await prisma.inventoryMovement.count({
     *   where: {
     *     // ... the filter for the InventoryMovements we want to count
     *   }
     * })
    **/
    count<T extends InventoryMovementCountArgs>(
      args?: Subset<T, InventoryMovementCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InventoryMovementCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InventoryMovement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryMovementAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InventoryMovementAggregateArgs>(args: Subset<T, InventoryMovementAggregateArgs>): Prisma.PrismaPromise<GetInventoryMovementAggregateType<T>>

    /**
     * Group by InventoryMovement.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryMovementGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InventoryMovementGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InventoryMovementGroupByArgs['orderBy'] }
        : { orderBy?: InventoryMovementGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InventoryMovementGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInventoryMovementGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InventoryMovement model
   */
  readonly fields: InventoryMovementFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InventoryMovement.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InventoryMovementClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    item<T extends InventoryItemDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InventoryItemDefaultArgs<ExtArgs>>): Prisma__InventoryItemClient<$Result.GetResult<Prisma.$InventoryItemPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    warehouse<T extends WarehouseDefaultArgs<ExtArgs> = {}>(args?: Subset<T, WarehouseDefaultArgs<ExtArgs>>): Prisma__WarehouseClient<$Result.GetResult<Prisma.$WarehousePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    category<T extends ItemCategoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ItemCategoryDefaultArgs<ExtArgs>>): Prisma__ItemCategoryClient<$Result.GetResult<Prisma.$ItemCategoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the InventoryMovement model
   */ 
  interface InventoryMovementFieldRefs {
    readonly id: FieldRef<"InventoryMovement", 'BigInt'>
    readonly itemId: FieldRef<"InventoryMovement", 'BigInt'>
    readonly warehouseId: FieldRef<"InventoryMovement", 'BigInt'>
    readonly categoryId: FieldRef<"InventoryMovement", 'BigInt'>
    readonly movementType: FieldRef<"InventoryMovement", 'MovementType'>
    readonly direction: FieldRef<"InventoryMovement", 'MovementDirection'>
    readonly quantity: FieldRef<"InventoryMovement", 'Decimal'>
    readonly unitPrice: FieldRef<"InventoryMovement", 'Decimal'>
    readonly totalAmount: FieldRef<"InventoryMovement", 'Decimal'>
    readonly beforeQty: FieldRef<"InventoryMovement", 'Decimal'>
    readonly afterQty: FieldRef<"InventoryMovement", 'Decimal'>
    readonly referenceType: FieldRef<"InventoryMovement", 'String'>
    readonly referenceId: FieldRef<"InventoryMovement", 'BigInt'>
    readonly referenceNo: FieldRef<"InventoryMovement", 'String'>
    readonly operatorId: FieldRef<"InventoryMovement", 'BigInt'>
    readonly operatorName: FieldRef<"InventoryMovement", 'String'>
    readonly remark: FieldRef<"InventoryMovement", 'String'>
    readonly createdAt: FieldRef<"InventoryMovement", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InventoryMovement findUnique
   */
  export type InventoryMovementFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryMovement
     */
    select?: InventoryMovementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryMovementInclude<ExtArgs> | null
    /**
     * Filter, which InventoryMovement to fetch.
     */
    where: InventoryMovementWhereUniqueInput
  }

  /**
   * InventoryMovement findUniqueOrThrow
   */
  export type InventoryMovementFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryMovement
     */
    select?: InventoryMovementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryMovementInclude<ExtArgs> | null
    /**
     * Filter, which InventoryMovement to fetch.
     */
    where: InventoryMovementWhereUniqueInput
  }

  /**
   * InventoryMovement findFirst
   */
  export type InventoryMovementFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryMovement
     */
    select?: InventoryMovementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryMovementInclude<ExtArgs> | null
    /**
     * Filter, which InventoryMovement to fetch.
     */
    where?: InventoryMovementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryMovements to fetch.
     */
    orderBy?: InventoryMovementOrderByWithRelationInput | InventoryMovementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InventoryMovements.
     */
    cursor?: InventoryMovementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryMovements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryMovements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InventoryMovements.
     */
    distinct?: InventoryMovementScalarFieldEnum | InventoryMovementScalarFieldEnum[]
  }

  /**
   * InventoryMovement findFirstOrThrow
   */
  export type InventoryMovementFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryMovement
     */
    select?: InventoryMovementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryMovementInclude<ExtArgs> | null
    /**
     * Filter, which InventoryMovement to fetch.
     */
    where?: InventoryMovementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryMovements to fetch.
     */
    orderBy?: InventoryMovementOrderByWithRelationInput | InventoryMovementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InventoryMovements.
     */
    cursor?: InventoryMovementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryMovements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryMovements.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InventoryMovements.
     */
    distinct?: InventoryMovementScalarFieldEnum | InventoryMovementScalarFieldEnum[]
  }

  /**
   * InventoryMovement findMany
   */
  export type InventoryMovementFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryMovement
     */
    select?: InventoryMovementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryMovementInclude<ExtArgs> | null
    /**
     * Filter, which InventoryMovements to fetch.
     */
    where?: InventoryMovementWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryMovements to fetch.
     */
    orderBy?: InventoryMovementOrderByWithRelationInput | InventoryMovementOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InventoryMovements.
     */
    cursor?: InventoryMovementWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryMovements from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryMovements.
     */
    skip?: number
    distinct?: InventoryMovementScalarFieldEnum | InventoryMovementScalarFieldEnum[]
  }

  /**
   * InventoryMovement create
   */
  export type InventoryMovementCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryMovement
     */
    select?: InventoryMovementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryMovementInclude<ExtArgs> | null
    /**
     * The data needed to create a InventoryMovement.
     */
    data: XOR<InventoryMovementCreateInput, InventoryMovementUncheckedCreateInput>
  }

  /**
   * InventoryMovement createMany
   */
  export type InventoryMovementCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InventoryMovements.
     */
    data: InventoryMovementCreateManyInput | InventoryMovementCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InventoryMovement createManyAndReturn
   */
  export type InventoryMovementCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryMovement
     */
    select?: InventoryMovementSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many InventoryMovements.
     */
    data: InventoryMovementCreateManyInput | InventoryMovementCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryMovementIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * InventoryMovement update
   */
  export type InventoryMovementUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryMovement
     */
    select?: InventoryMovementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryMovementInclude<ExtArgs> | null
    /**
     * The data needed to update a InventoryMovement.
     */
    data: XOR<InventoryMovementUpdateInput, InventoryMovementUncheckedUpdateInput>
    /**
     * Choose, which InventoryMovement to update.
     */
    where: InventoryMovementWhereUniqueInput
  }

  /**
   * InventoryMovement updateMany
   */
  export type InventoryMovementUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InventoryMovements.
     */
    data: XOR<InventoryMovementUpdateManyMutationInput, InventoryMovementUncheckedUpdateManyInput>
    /**
     * Filter which InventoryMovements to update
     */
    where?: InventoryMovementWhereInput
  }

  /**
   * InventoryMovement upsert
   */
  export type InventoryMovementUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryMovement
     */
    select?: InventoryMovementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryMovementInclude<ExtArgs> | null
    /**
     * The filter to search for the InventoryMovement to update in case it exists.
     */
    where: InventoryMovementWhereUniqueInput
    /**
     * In case the InventoryMovement found by the `where` argument doesn't exist, create a new InventoryMovement with this data.
     */
    create: XOR<InventoryMovementCreateInput, InventoryMovementUncheckedCreateInput>
    /**
     * In case the InventoryMovement was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InventoryMovementUpdateInput, InventoryMovementUncheckedUpdateInput>
  }

  /**
   * InventoryMovement delete
   */
  export type InventoryMovementDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryMovement
     */
    select?: InventoryMovementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryMovementInclude<ExtArgs> | null
    /**
     * Filter which InventoryMovement to delete.
     */
    where: InventoryMovementWhereUniqueInput
  }

  /**
   * InventoryMovement deleteMany
   */
  export type InventoryMovementDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InventoryMovements to delete
     */
    where?: InventoryMovementWhereInput
  }

  /**
   * InventoryMovement without action
   */
  export type InventoryMovementDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryMovement
     */
    select?: InventoryMovementSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InventoryMovementInclude<ExtArgs> | null
  }


  /**
   * Model PricingRule
   */

  export type AggregatePricingRule = {
    _count: PricingRuleCountAggregateOutputType | null
    _avg: PricingRuleAvgAggregateOutputType | null
    _sum: PricingRuleSumAggregateOutputType | null
    _min: PricingRuleMinAggregateOutputType | null
    _max: PricingRuleMaxAggregateOutputType | null
  }

  export type PricingRuleAvgAggregateOutputType = {
    id: number | null
    categoryId: number | null
    basePrice: Decimal | null
  }

  export type PricingRuleSumAggregateOutputType = {
    id: bigint | null
    categoryId: bigint | null
    basePrice: Decimal | null
  }

  export type PricingRuleMinAggregateOutputType = {
    id: bigint | null
    categoryId: bigint | null
    regionCode: string | null
    priceType: $Enums.PriceType | null
    basePrice: Decimal | null
    unit: string | null
    enabled: boolean | null
    validFrom: Date | null
    validTo: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PricingRuleMaxAggregateOutputType = {
    id: bigint | null
    categoryId: bigint | null
    regionCode: string | null
    priceType: $Enums.PriceType | null
    basePrice: Decimal | null
    unit: string | null
    enabled: boolean | null
    validFrom: Date | null
    validTo: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PricingRuleCountAggregateOutputType = {
    id: number
    categoryId: number
    regionCode: number
    priceType: number
    basePrice: number
    unit: number
    weightTiers: number
    qualityFactors: number
    seasonFactors: number
    enabled: number
    validFrom: number
    validTo: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PricingRuleAvgAggregateInputType = {
    id?: true
    categoryId?: true
    basePrice?: true
  }

  export type PricingRuleSumAggregateInputType = {
    id?: true
    categoryId?: true
    basePrice?: true
  }

  export type PricingRuleMinAggregateInputType = {
    id?: true
    categoryId?: true
    regionCode?: true
    priceType?: true
    basePrice?: true
    unit?: true
    enabled?: true
    validFrom?: true
    validTo?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PricingRuleMaxAggregateInputType = {
    id?: true
    categoryId?: true
    regionCode?: true
    priceType?: true
    basePrice?: true
    unit?: true
    enabled?: true
    validFrom?: true
    validTo?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PricingRuleCountAggregateInputType = {
    id?: true
    categoryId?: true
    regionCode?: true
    priceType?: true
    basePrice?: true
    unit?: true
    weightTiers?: true
    qualityFactors?: true
    seasonFactors?: true
    enabled?: true
    validFrom?: true
    validTo?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PricingRuleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PricingRule to aggregate.
     */
    where?: PricingRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PricingRules to fetch.
     */
    orderBy?: PricingRuleOrderByWithRelationInput | PricingRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PricingRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PricingRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PricingRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PricingRules
    **/
    _count?: true | PricingRuleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PricingRuleAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PricingRuleSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PricingRuleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PricingRuleMaxAggregateInputType
  }

  export type GetPricingRuleAggregateType<T extends PricingRuleAggregateArgs> = {
        [P in keyof T & keyof AggregatePricingRule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePricingRule[P]>
      : GetScalarType<T[P], AggregatePricingRule[P]>
  }




  export type PricingRuleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PricingRuleWhereInput
    orderBy?: PricingRuleOrderByWithAggregationInput | PricingRuleOrderByWithAggregationInput[]
    by: PricingRuleScalarFieldEnum[] | PricingRuleScalarFieldEnum
    having?: PricingRuleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PricingRuleCountAggregateInputType | true
    _avg?: PricingRuleAvgAggregateInputType
    _sum?: PricingRuleSumAggregateInputType
    _min?: PricingRuleMinAggregateInputType
    _max?: PricingRuleMaxAggregateInputType
  }

  export type PricingRuleGroupByOutputType = {
    id: bigint
    categoryId: bigint
    regionCode: string | null
    priceType: $Enums.PriceType
    basePrice: Decimal
    unit: string
    weightTiers: JsonValue | null
    qualityFactors: JsonValue | null
    seasonFactors: JsonValue | null
    enabled: boolean
    validFrom: Date
    validTo: Date | null
    createdAt: Date
    updatedAt: Date
    _count: PricingRuleCountAggregateOutputType | null
    _avg: PricingRuleAvgAggregateOutputType | null
    _sum: PricingRuleSumAggregateOutputType | null
    _min: PricingRuleMinAggregateOutputType | null
    _max: PricingRuleMaxAggregateOutputType | null
  }

  type GetPricingRuleGroupByPayload<T extends PricingRuleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PricingRuleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PricingRuleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PricingRuleGroupByOutputType[P]>
            : GetScalarType<T[P], PricingRuleGroupByOutputType[P]>
        }
      >
    >


  export type PricingRuleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    categoryId?: boolean
    regionCode?: boolean
    priceType?: boolean
    basePrice?: boolean
    unit?: boolean
    weightTiers?: boolean
    qualityFactors?: boolean
    seasonFactors?: boolean
    enabled?: boolean
    validFrom?: boolean
    validTo?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | ItemCategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pricingRule"]>

  export type PricingRuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    categoryId?: boolean
    regionCode?: boolean
    priceType?: boolean
    basePrice?: boolean
    unit?: boolean
    weightTiers?: boolean
    qualityFactors?: boolean
    seasonFactors?: boolean
    enabled?: boolean
    validFrom?: boolean
    validTo?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    category?: boolean | ItemCategoryDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pricingRule"]>

  export type PricingRuleSelectScalar = {
    id?: boolean
    categoryId?: boolean
    regionCode?: boolean
    priceType?: boolean
    basePrice?: boolean
    unit?: boolean
    weightTiers?: boolean
    qualityFactors?: boolean
    seasonFactors?: boolean
    enabled?: boolean
    validFrom?: boolean
    validTo?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PricingRuleInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | ItemCategoryDefaultArgs<ExtArgs>
  }
  export type PricingRuleIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    category?: boolean | ItemCategoryDefaultArgs<ExtArgs>
  }

  export type $PricingRulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PricingRule"
    objects: {
      category: Prisma.$ItemCategoryPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      categoryId: bigint
      regionCode: string | null
      priceType: $Enums.PriceType
      basePrice: Prisma.Decimal
      unit: string
      weightTiers: Prisma.JsonValue | null
      qualityFactors: Prisma.JsonValue | null
      seasonFactors: Prisma.JsonValue | null
      enabled: boolean
      validFrom: Date
      validTo: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["pricingRule"]>
    composites: {}
  }

  type PricingRuleGetPayload<S extends boolean | null | undefined | PricingRuleDefaultArgs> = $Result.GetResult<Prisma.$PricingRulePayload, S>

  type PricingRuleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PricingRuleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PricingRuleCountAggregateInputType | true
    }

  export interface PricingRuleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PricingRule'], meta: { name: 'PricingRule' } }
    /**
     * Find zero or one PricingRule that matches the filter.
     * @param {PricingRuleFindUniqueArgs} args - Arguments to find a PricingRule
     * @example
     * // Get one PricingRule
     * const pricingRule = await prisma.pricingRule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PricingRuleFindUniqueArgs>(args: SelectSubset<T, PricingRuleFindUniqueArgs<ExtArgs>>): Prisma__PricingRuleClient<$Result.GetResult<Prisma.$PricingRulePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PricingRule that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PricingRuleFindUniqueOrThrowArgs} args - Arguments to find a PricingRule
     * @example
     * // Get one PricingRule
     * const pricingRule = await prisma.pricingRule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PricingRuleFindUniqueOrThrowArgs>(args: SelectSubset<T, PricingRuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PricingRuleClient<$Result.GetResult<Prisma.$PricingRulePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PricingRule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricingRuleFindFirstArgs} args - Arguments to find a PricingRule
     * @example
     * // Get one PricingRule
     * const pricingRule = await prisma.pricingRule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PricingRuleFindFirstArgs>(args?: SelectSubset<T, PricingRuleFindFirstArgs<ExtArgs>>): Prisma__PricingRuleClient<$Result.GetResult<Prisma.$PricingRulePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PricingRule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricingRuleFindFirstOrThrowArgs} args - Arguments to find a PricingRule
     * @example
     * // Get one PricingRule
     * const pricingRule = await prisma.pricingRule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PricingRuleFindFirstOrThrowArgs>(args?: SelectSubset<T, PricingRuleFindFirstOrThrowArgs<ExtArgs>>): Prisma__PricingRuleClient<$Result.GetResult<Prisma.$PricingRulePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PricingRules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricingRuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PricingRules
     * const pricingRules = await prisma.pricingRule.findMany()
     * 
     * // Get first 10 PricingRules
     * const pricingRules = await prisma.pricingRule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pricingRuleWithIdOnly = await prisma.pricingRule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PricingRuleFindManyArgs>(args?: SelectSubset<T, PricingRuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PricingRulePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PricingRule.
     * @param {PricingRuleCreateArgs} args - Arguments to create a PricingRule.
     * @example
     * // Create one PricingRule
     * const PricingRule = await prisma.pricingRule.create({
     *   data: {
     *     // ... data to create a PricingRule
     *   }
     * })
     * 
     */
    create<T extends PricingRuleCreateArgs>(args: SelectSubset<T, PricingRuleCreateArgs<ExtArgs>>): Prisma__PricingRuleClient<$Result.GetResult<Prisma.$PricingRulePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PricingRules.
     * @param {PricingRuleCreateManyArgs} args - Arguments to create many PricingRules.
     * @example
     * // Create many PricingRules
     * const pricingRule = await prisma.pricingRule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PricingRuleCreateManyArgs>(args?: SelectSubset<T, PricingRuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PricingRules and returns the data saved in the database.
     * @param {PricingRuleCreateManyAndReturnArgs} args - Arguments to create many PricingRules.
     * @example
     * // Create many PricingRules
     * const pricingRule = await prisma.pricingRule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PricingRules and only return the `id`
     * const pricingRuleWithIdOnly = await prisma.pricingRule.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PricingRuleCreateManyAndReturnArgs>(args?: SelectSubset<T, PricingRuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PricingRulePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PricingRule.
     * @param {PricingRuleDeleteArgs} args - Arguments to delete one PricingRule.
     * @example
     * // Delete one PricingRule
     * const PricingRule = await prisma.pricingRule.delete({
     *   where: {
     *     // ... filter to delete one PricingRule
     *   }
     * })
     * 
     */
    delete<T extends PricingRuleDeleteArgs>(args: SelectSubset<T, PricingRuleDeleteArgs<ExtArgs>>): Prisma__PricingRuleClient<$Result.GetResult<Prisma.$PricingRulePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PricingRule.
     * @param {PricingRuleUpdateArgs} args - Arguments to update one PricingRule.
     * @example
     * // Update one PricingRule
     * const pricingRule = await prisma.pricingRule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PricingRuleUpdateArgs>(args: SelectSubset<T, PricingRuleUpdateArgs<ExtArgs>>): Prisma__PricingRuleClient<$Result.GetResult<Prisma.$PricingRulePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PricingRules.
     * @param {PricingRuleDeleteManyArgs} args - Arguments to filter PricingRules to delete.
     * @example
     * // Delete a few PricingRules
     * const { count } = await prisma.pricingRule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PricingRuleDeleteManyArgs>(args?: SelectSubset<T, PricingRuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PricingRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricingRuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PricingRules
     * const pricingRule = await prisma.pricingRule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PricingRuleUpdateManyArgs>(args: SelectSubset<T, PricingRuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PricingRule.
     * @param {PricingRuleUpsertArgs} args - Arguments to update or create a PricingRule.
     * @example
     * // Update or create a PricingRule
     * const pricingRule = await prisma.pricingRule.upsert({
     *   create: {
     *     // ... data to create a PricingRule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PricingRule we want to update
     *   }
     * })
     */
    upsert<T extends PricingRuleUpsertArgs>(args: SelectSubset<T, PricingRuleUpsertArgs<ExtArgs>>): Prisma__PricingRuleClient<$Result.GetResult<Prisma.$PricingRulePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PricingRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricingRuleCountArgs} args - Arguments to filter PricingRules to count.
     * @example
     * // Count the number of PricingRules
     * const count = await prisma.pricingRule.count({
     *   where: {
     *     // ... the filter for the PricingRules we want to count
     *   }
     * })
    **/
    count<T extends PricingRuleCountArgs>(
      args?: Subset<T, PricingRuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PricingRuleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PricingRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricingRuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PricingRuleAggregateArgs>(args: Subset<T, PricingRuleAggregateArgs>): Prisma.PrismaPromise<GetPricingRuleAggregateType<T>>

    /**
     * Group by PricingRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PricingRuleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PricingRuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PricingRuleGroupByArgs['orderBy'] }
        : { orderBy?: PricingRuleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PricingRuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPricingRuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PricingRule model
   */
  readonly fields: PricingRuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PricingRule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PricingRuleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    category<T extends ItemCategoryDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ItemCategoryDefaultArgs<ExtArgs>>): Prisma__ItemCategoryClient<$Result.GetResult<Prisma.$ItemCategoryPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PricingRule model
   */ 
  interface PricingRuleFieldRefs {
    readonly id: FieldRef<"PricingRule", 'BigInt'>
    readonly categoryId: FieldRef<"PricingRule", 'BigInt'>
    readonly regionCode: FieldRef<"PricingRule", 'String'>
    readonly priceType: FieldRef<"PricingRule", 'PriceType'>
    readonly basePrice: FieldRef<"PricingRule", 'Decimal'>
    readonly unit: FieldRef<"PricingRule", 'String'>
    readonly weightTiers: FieldRef<"PricingRule", 'Json'>
    readonly qualityFactors: FieldRef<"PricingRule", 'Json'>
    readonly seasonFactors: FieldRef<"PricingRule", 'Json'>
    readonly enabled: FieldRef<"PricingRule", 'Boolean'>
    readonly validFrom: FieldRef<"PricingRule", 'DateTime'>
    readonly validTo: FieldRef<"PricingRule", 'DateTime'>
    readonly createdAt: FieldRef<"PricingRule", 'DateTime'>
    readonly updatedAt: FieldRef<"PricingRule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PricingRule findUnique
   */
  export type PricingRuleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricingRule
     */
    select?: PricingRuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PricingRuleInclude<ExtArgs> | null
    /**
     * Filter, which PricingRule to fetch.
     */
    where: PricingRuleWhereUniqueInput
  }

  /**
   * PricingRule findUniqueOrThrow
   */
  export type PricingRuleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricingRule
     */
    select?: PricingRuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PricingRuleInclude<ExtArgs> | null
    /**
     * Filter, which PricingRule to fetch.
     */
    where: PricingRuleWhereUniqueInput
  }

  /**
   * PricingRule findFirst
   */
  export type PricingRuleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricingRule
     */
    select?: PricingRuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PricingRuleInclude<ExtArgs> | null
    /**
     * Filter, which PricingRule to fetch.
     */
    where?: PricingRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PricingRules to fetch.
     */
    orderBy?: PricingRuleOrderByWithRelationInput | PricingRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PricingRules.
     */
    cursor?: PricingRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PricingRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PricingRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PricingRules.
     */
    distinct?: PricingRuleScalarFieldEnum | PricingRuleScalarFieldEnum[]
  }

  /**
   * PricingRule findFirstOrThrow
   */
  export type PricingRuleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricingRule
     */
    select?: PricingRuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PricingRuleInclude<ExtArgs> | null
    /**
     * Filter, which PricingRule to fetch.
     */
    where?: PricingRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PricingRules to fetch.
     */
    orderBy?: PricingRuleOrderByWithRelationInput | PricingRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PricingRules.
     */
    cursor?: PricingRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PricingRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PricingRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PricingRules.
     */
    distinct?: PricingRuleScalarFieldEnum | PricingRuleScalarFieldEnum[]
  }

  /**
   * PricingRule findMany
   */
  export type PricingRuleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricingRule
     */
    select?: PricingRuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PricingRuleInclude<ExtArgs> | null
    /**
     * Filter, which PricingRules to fetch.
     */
    where?: PricingRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PricingRules to fetch.
     */
    orderBy?: PricingRuleOrderByWithRelationInput | PricingRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PricingRules.
     */
    cursor?: PricingRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PricingRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PricingRules.
     */
    skip?: number
    distinct?: PricingRuleScalarFieldEnum | PricingRuleScalarFieldEnum[]
  }

  /**
   * PricingRule create
   */
  export type PricingRuleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricingRule
     */
    select?: PricingRuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PricingRuleInclude<ExtArgs> | null
    /**
     * The data needed to create a PricingRule.
     */
    data: XOR<PricingRuleCreateInput, PricingRuleUncheckedCreateInput>
  }

  /**
   * PricingRule createMany
   */
  export type PricingRuleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PricingRules.
     */
    data: PricingRuleCreateManyInput | PricingRuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PricingRule createManyAndReturn
   */
  export type PricingRuleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricingRule
     */
    select?: PricingRuleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PricingRules.
     */
    data: PricingRuleCreateManyInput | PricingRuleCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PricingRuleIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PricingRule update
   */
  export type PricingRuleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricingRule
     */
    select?: PricingRuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PricingRuleInclude<ExtArgs> | null
    /**
     * The data needed to update a PricingRule.
     */
    data: XOR<PricingRuleUpdateInput, PricingRuleUncheckedUpdateInput>
    /**
     * Choose, which PricingRule to update.
     */
    where: PricingRuleWhereUniqueInput
  }

  /**
   * PricingRule updateMany
   */
  export type PricingRuleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PricingRules.
     */
    data: XOR<PricingRuleUpdateManyMutationInput, PricingRuleUncheckedUpdateManyInput>
    /**
     * Filter which PricingRules to update
     */
    where?: PricingRuleWhereInput
  }

  /**
   * PricingRule upsert
   */
  export type PricingRuleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricingRule
     */
    select?: PricingRuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PricingRuleInclude<ExtArgs> | null
    /**
     * The filter to search for the PricingRule to update in case it exists.
     */
    where: PricingRuleWhereUniqueInput
    /**
     * In case the PricingRule found by the `where` argument doesn't exist, create a new PricingRule with this data.
     */
    create: XOR<PricingRuleCreateInput, PricingRuleUncheckedCreateInput>
    /**
     * In case the PricingRule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PricingRuleUpdateInput, PricingRuleUncheckedUpdateInput>
  }

  /**
   * PricingRule delete
   */
  export type PricingRuleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricingRule
     */
    select?: PricingRuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PricingRuleInclude<ExtArgs> | null
    /**
     * Filter which PricingRule to delete.
     */
    where: PricingRuleWhereUniqueInput
  }

  /**
   * PricingRule deleteMany
   */
  export type PricingRuleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PricingRules to delete
     */
    where?: PricingRuleWhereInput
  }

  /**
   * PricingRule without action
   */
  export type PricingRuleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PricingRule
     */
    select?: PricingRuleSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PricingRuleInclude<ExtArgs> | null
  }


  /**
   * Model InventoryAlert
   */

  export type AggregateInventoryAlert = {
    _count: InventoryAlertCountAggregateOutputType | null
    _avg: InventoryAlertAvgAggregateOutputType | null
    _sum: InventoryAlertSumAggregateOutputType | null
    _min: InventoryAlertMinAggregateOutputType | null
    _max: InventoryAlertMaxAggregateOutputType | null
  }

  export type InventoryAlertAvgAggregateOutputType = {
    id: number | null
    itemId: number | null
    currentQty: Decimal | null
    thresholdQty: Decimal | null
    handledBy: number | null
  }

  export type InventoryAlertSumAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    currentQty: Decimal | null
    thresholdQty: Decimal | null
    handledBy: bigint | null
  }

  export type InventoryAlertMinAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    alertType: $Enums.AlertType | null
    alertLevel: $Enums.AlertLevel | null
    currentQty: Decimal | null
    thresholdQty: Decimal | null
    message: string | null
    status: $Enums.AlertStatus | null
    handledBy: bigint | null
    handledAt: Date | null
    handlerRemark: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InventoryAlertMaxAggregateOutputType = {
    id: bigint | null
    itemId: bigint | null
    alertType: $Enums.AlertType | null
    alertLevel: $Enums.AlertLevel | null
    currentQty: Decimal | null
    thresholdQty: Decimal | null
    message: string | null
    status: $Enums.AlertStatus | null
    handledBy: bigint | null
    handledAt: Date | null
    handlerRemark: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InventoryAlertCountAggregateOutputType = {
    id: number
    itemId: number
    alertType: number
    alertLevel: number
    currentQty: number
    thresholdQty: number
    message: number
    status: number
    handledBy: number
    handledAt: number
    handlerRemark: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type InventoryAlertAvgAggregateInputType = {
    id?: true
    itemId?: true
    currentQty?: true
    thresholdQty?: true
    handledBy?: true
  }

  export type InventoryAlertSumAggregateInputType = {
    id?: true
    itemId?: true
    currentQty?: true
    thresholdQty?: true
    handledBy?: true
  }

  export type InventoryAlertMinAggregateInputType = {
    id?: true
    itemId?: true
    alertType?: true
    alertLevel?: true
    currentQty?: true
    thresholdQty?: true
    message?: true
    status?: true
    handledBy?: true
    handledAt?: true
    handlerRemark?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InventoryAlertMaxAggregateInputType = {
    id?: true
    itemId?: true
    alertType?: true
    alertLevel?: true
    currentQty?: true
    thresholdQty?: true
    message?: true
    status?: true
    handledBy?: true
    handledAt?: true
    handlerRemark?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InventoryAlertCountAggregateInputType = {
    id?: true
    itemId?: true
    alertType?: true
    alertLevel?: true
    currentQty?: true
    thresholdQty?: true
    message?: true
    status?: true
    handledBy?: true
    handledAt?: true
    handlerRemark?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type InventoryAlertAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InventoryAlert to aggregate.
     */
    where?: InventoryAlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryAlerts to fetch.
     */
    orderBy?: InventoryAlertOrderByWithRelationInput | InventoryAlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InventoryAlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryAlerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryAlerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InventoryAlerts
    **/
    _count?: true | InventoryAlertCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: InventoryAlertAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: InventoryAlertSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InventoryAlertMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InventoryAlertMaxAggregateInputType
  }

  export type GetInventoryAlertAggregateType<T extends InventoryAlertAggregateArgs> = {
        [P in keyof T & keyof AggregateInventoryAlert]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInventoryAlert[P]>
      : GetScalarType<T[P], AggregateInventoryAlert[P]>
  }




  export type InventoryAlertGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InventoryAlertWhereInput
    orderBy?: InventoryAlertOrderByWithAggregationInput | InventoryAlertOrderByWithAggregationInput[]
    by: InventoryAlertScalarFieldEnum[] | InventoryAlertScalarFieldEnum
    having?: InventoryAlertScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InventoryAlertCountAggregateInputType | true
    _avg?: InventoryAlertAvgAggregateInputType
    _sum?: InventoryAlertSumAggregateInputType
    _min?: InventoryAlertMinAggregateInputType
    _max?: InventoryAlertMaxAggregateInputType
  }

  export type InventoryAlertGroupByOutputType = {
    id: bigint
    itemId: bigint
    alertType: $Enums.AlertType
    alertLevel: $Enums.AlertLevel
    currentQty: Decimal
    thresholdQty: Decimal
    message: string
    status: $Enums.AlertStatus
    handledBy: bigint | null
    handledAt: Date | null
    handlerRemark: string | null
    createdAt: Date
    updatedAt: Date
    _count: InventoryAlertCountAggregateOutputType | null
    _avg: InventoryAlertAvgAggregateOutputType | null
    _sum: InventoryAlertSumAggregateOutputType | null
    _min: InventoryAlertMinAggregateOutputType | null
    _max: InventoryAlertMaxAggregateOutputType | null
  }

  type GetInventoryAlertGroupByPayload<T extends InventoryAlertGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InventoryAlertGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InventoryAlertGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InventoryAlertGroupByOutputType[P]>
            : GetScalarType<T[P], InventoryAlertGroupByOutputType[P]>
        }
      >
    >


  export type InventoryAlertSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    alertType?: boolean
    alertLevel?: boolean
    currentQty?: boolean
    thresholdQty?: boolean
    message?: boolean
    status?: boolean
    handledBy?: boolean
    handledAt?: boolean
    handlerRemark?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["inventoryAlert"]>

  export type InventoryAlertSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    alertType?: boolean
    alertLevel?: boolean
    currentQty?: boolean
    thresholdQty?: boolean
    message?: boolean
    status?: boolean
    handledBy?: boolean
    handledAt?: boolean
    handlerRemark?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["inventoryAlert"]>

  export type InventoryAlertSelectScalar = {
    id?: boolean
    itemId?: boolean
    alertType?: boolean
    alertLevel?: boolean
    currentQty?: boolean
    thresholdQty?: boolean
    message?: boolean
    status?: boolean
    handledBy?: boolean
    handledAt?: boolean
    handlerRemark?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $InventoryAlertPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InventoryAlert"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      itemId: bigint
      alertType: $Enums.AlertType
      alertLevel: $Enums.AlertLevel
      currentQty: Prisma.Decimal
      thresholdQty: Prisma.Decimal
      message: string
      status: $Enums.AlertStatus
      handledBy: bigint | null
      handledAt: Date | null
      handlerRemark: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["inventoryAlert"]>
    composites: {}
  }

  type InventoryAlertGetPayload<S extends boolean | null | undefined | InventoryAlertDefaultArgs> = $Result.GetResult<Prisma.$InventoryAlertPayload, S>

  type InventoryAlertCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<InventoryAlertFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: InventoryAlertCountAggregateInputType | true
    }

  export interface InventoryAlertDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InventoryAlert'], meta: { name: 'InventoryAlert' } }
    /**
     * Find zero or one InventoryAlert that matches the filter.
     * @param {InventoryAlertFindUniqueArgs} args - Arguments to find a InventoryAlert
     * @example
     * // Get one InventoryAlert
     * const inventoryAlert = await prisma.inventoryAlert.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InventoryAlertFindUniqueArgs>(args: SelectSubset<T, InventoryAlertFindUniqueArgs<ExtArgs>>): Prisma__InventoryAlertClient<$Result.GetResult<Prisma.$InventoryAlertPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one InventoryAlert that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {InventoryAlertFindUniqueOrThrowArgs} args - Arguments to find a InventoryAlert
     * @example
     * // Get one InventoryAlert
     * const inventoryAlert = await prisma.inventoryAlert.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InventoryAlertFindUniqueOrThrowArgs>(args: SelectSubset<T, InventoryAlertFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InventoryAlertClient<$Result.GetResult<Prisma.$InventoryAlertPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first InventoryAlert that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryAlertFindFirstArgs} args - Arguments to find a InventoryAlert
     * @example
     * // Get one InventoryAlert
     * const inventoryAlert = await prisma.inventoryAlert.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InventoryAlertFindFirstArgs>(args?: SelectSubset<T, InventoryAlertFindFirstArgs<ExtArgs>>): Prisma__InventoryAlertClient<$Result.GetResult<Prisma.$InventoryAlertPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first InventoryAlert that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryAlertFindFirstOrThrowArgs} args - Arguments to find a InventoryAlert
     * @example
     * // Get one InventoryAlert
     * const inventoryAlert = await prisma.inventoryAlert.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InventoryAlertFindFirstOrThrowArgs>(args?: SelectSubset<T, InventoryAlertFindFirstOrThrowArgs<ExtArgs>>): Prisma__InventoryAlertClient<$Result.GetResult<Prisma.$InventoryAlertPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more InventoryAlerts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryAlertFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InventoryAlerts
     * const inventoryAlerts = await prisma.inventoryAlert.findMany()
     * 
     * // Get first 10 InventoryAlerts
     * const inventoryAlerts = await prisma.inventoryAlert.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inventoryAlertWithIdOnly = await prisma.inventoryAlert.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InventoryAlertFindManyArgs>(args?: SelectSubset<T, InventoryAlertFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryAlertPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a InventoryAlert.
     * @param {InventoryAlertCreateArgs} args - Arguments to create a InventoryAlert.
     * @example
     * // Create one InventoryAlert
     * const InventoryAlert = await prisma.inventoryAlert.create({
     *   data: {
     *     // ... data to create a InventoryAlert
     *   }
     * })
     * 
     */
    create<T extends InventoryAlertCreateArgs>(args: SelectSubset<T, InventoryAlertCreateArgs<ExtArgs>>): Prisma__InventoryAlertClient<$Result.GetResult<Prisma.$InventoryAlertPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many InventoryAlerts.
     * @param {InventoryAlertCreateManyArgs} args - Arguments to create many InventoryAlerts.
     * @example
     * // Create many InventoryAlerts
     * const inventoryAlert = await prisma.inventoryAlert.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InventoryAlertCreateManyArgs>(args?: SelectSubset<T, InventoryAlertCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InventoryAlerts and returns the data saved in the database.
     * @param {InventoryAlertCreateManyAndReturnArgs} args - Arguments to create many InventoryAlerts.
     * @example
     * // Create many InventoryAlerts
     * const inventoryAlert = await prisma.inventoryAlert.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InventoryAlerts and only return the `id`
     * const inventoryAlertWithIdOnly = await prisma.inventoryAlert.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InventoryAlertCreateManyAndReturnArgs>(args?: SelectSubset<T, InventoryAlertCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InventoryAlertPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a InventoryAlert.
     * @param {InventoryAlertDeleteArgs} args - Arguments to delete one InventoryAlert.
     * @example
     * // Delete one InventoryAlert
     * const InventoryAlert = await prisma.inventoryAlert.delete({
     *   where: {
     *     // ... filter to delete one InventoryAlert
     *   }
     * })
     * 
     */
    delete<T extends InventoryAlertDeleteArgs>(args: SelectSubset<T, InventoryAlertDeleteArgs<ExtArgs>>): Prisma__InventoryAlertClient<$Result.GetResult<Prisma.$InventoryAlertPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one InventoryAlert.
     * @param {InventoryAlertUpdateArgs} args - Arguments to update one InventoryAlert.
     * @example
     * // Update one InventoryAlert
     * const inventoryAlert = await prisma.inventoryAlert.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InventoryAlertUpdateArgs>(args: SelectSubset<T, InventoryAlertUpdateArgs<ExtArgs>>): Prisma__InventoryAlertClient<$Result.GetResult<Prisma.$InventoryAlertPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more InventoryAlerts.
     * @param {InventoryAlertDeleteManyArgs} args - Arguments to filter InventoryAlerts to delete.
     * @example
     * // Delete a few InventoryAlerts
     * const { count } = await prisma.inventoryAlert.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InventoryAlertDeleteManyArgs>(args?: SelectSubset<T, InventoryAlertDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InventoryAlerts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryAlertUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InventoryAlerts
     * const inventoryAlert = await prisma.inventoryAlert.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InventoryAlertUpdateManyArgs>(args: SelectSubset<T, InventoryAlertUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one InventoryAlert.
     * @param {InventoryAlertUpsertArgs} args - Arguments to update or create a InventoryAlert.
     * @example
     * // Update or create a InventoryAlert
     * const inventoryAlert = await prisma.inventoryAlert.upsert({
     *   create: {
     *     // ... data to create a InventoryAlert
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InventoryAlert we want to update
     *   }
     * })
     */
    upsert<T extends InventoryAlertUpsertArgs>(args: SelectSubset<T, InventoryAlertUpsertArgs<ExtArgs>>): Prisma__InventoryAlertClient<$Result.GetResult<Prisma.$InventoryAlertPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of InventoryAlerts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryAlertCountArgs} args - Arguments to filter InventoryAlerts to count.
     * @example
     * // Count the number of InventoryAlerts
     * const count = await prisma.inventoryAlert.count({
     *   where: {
     *     // ... the filter for the InventoryAlerts we want to count
     *   }
     * })
    **/
    count<T extends InventoryAlertCountArgs>(
      args?: Subset<T, InventoryAlertCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InventoryAlertCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InventoryAlert.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryAlertAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InventoryAlertAggregateArgs>(args: Subset<T, InventoryAlertAggregateArgs>): Prisma.PrismaPromise<GetInventoryAlertAggregateType<T>>

    /**
     * Group by InventoryAlert.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InventoryAlertGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InventoryAlertGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InventoryAlertGroupByArgs['orderBy'] }
        : { orderBy?: InventoryAlertGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InventoryAlertGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInventoryAlertGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InventoryAlert model
   */
  readonly fields: InventoryAlertFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InventoryAlert.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InventoryAlertClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the InventoryAlert model
   */ 
  interface InventoryAlertFieldRefs {
    readonly id: FieldRef<"InventoryAlert", 'BigInt'>
    readonly itemId: FieldRef<"InventoryAlert", 'BigInt'>
    readonly alertType: FieldRef<"InventoryAlert", 'AlertType'>
    readonly alertLevel: FieldRef<"InventoryAlert", 'AlertLevel'>
    readonly currentQty: FieldRef<"InventoryAlert", 'Decimal'>
    readonly thresholdQty: FieldRef<"InventoryAlert", 'Decimal'>
    readonly message: FieldRef<"InventoryAlert", 'String'>
    readonly status: FieldRef<"InventoryAlert", 'AlertStatus'>
    readonly handledBy: FieldRef<"InventoryAlert", 'BigInt'>
    readonly handledAt: FieldRef<"InventoryAlert", 'DateTime'>
    readonly handlerRemark: FieldRef<"InventoryAlert", 'String'>
    readonly createdAt: FieldRef<"InventoryAlert", 'DateTime'>
    readonly updatedAt: FieldRef<"InventoryAlert", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InventoryAlert findUnique
   */
  export type InventoryAlertFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlert
     */
    select?: InventoryAlertSelect<ExtArgs> | null
    /**
     * Filter, which InventoryAlert to fetch.
     */
    where: InventoryAlertWhereUniqueInput
  }

  /**
   * InventoryAlert findUniqueOrThrow
   */
  export type InventoryAlertFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlert
     */
    select?: InventoryAlertSelect<ExtArgs> | null
    /**
     * Filter, which InventoryAlert to fetch.
     */
    where: InventoryAlertWhereUniqueInput
  }

  /**
   * InventoryAlert findFirst
   */
  export type InventoryAlertFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlert
     */
    select?: InventoryAlertSelect<ExtArgs> | null
    /**
     * Filter, which InventoryAlert to fetch.
     */
    where?: InventoryAlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryAlerts to fetch.
     */
    orderBy?: InventoryAlertOrderByWithRelationInput | InventoryAlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InventoryAlerts.
     */
    cursor?: InventoryAlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryAlerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryAlerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InventoryAlerts.
     */
    distinct?: InventoryAlertScalarFieldEnum | InventoryAlertScalarFieldEnum[]
  }

  /**
   * InventoryAlert findFirstOrThrow
   */
  export type InventoryAlertFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlert
     */
    select?: InventoryAlertSelect<ExtArgs> | null
    /**
     * Filter, which InventoryAlert to fetch.
     */
    where?: InventoryAlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryAlerts to fetch.
     */
    orderBy?: InventoryAlertOrderByWithRelationInput | InventoryAlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InventoryAlerts.
     */
    cursor?: InventoryAlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryAlerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryAlerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InventoryAlerts.
     */
    distinct?: InventoryAlertScalarFieldEnum | InventoryAlertScalarFieldEnum[]
  }

  /**
   * InventoryAlert findMany
   */
  export type InventoryAlertFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlert
     */
    select?: InventoryAlertSelect<ExtArgs> | null
    /**
     * Filter, which InventoryAlerts to fetch.
     */
    where?: InventoryAlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InventoryAlerts to fetch.
     */
    orderBy?: InventoryAlertOrderByWithRelationInput | InventoryAlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InventoryAlerts.
     */
    cursor?: InventoryAlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InventoryAlerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InventoryAlerts.
     */
    skip?: number
    distinct?: InventoryAlertScalarFieldEnum | InventoryAlertScalarFieldEnum[]
  }

  /**
   * InventoryAlert create
   */
  export type InventoryAlertCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlert
     */
    select?: InventoryAlertSelect<ExtArgs> | null
    /**
     * The data needed to create a InventoryAlert.
     */
    data: XOR<InventoryAlertCreateInput, InventoryAlertUncheckedCreateInput>
  }

  /**
   * InventoryAlert createMany
   */
  export type InventoryAlertCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InventoryAlerts.
     */
    data: InventoryAlertCreateManyInput | InventoryAlertCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InventoryAlert createManyAndReturn
   */
  export type InventoryAlertCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlert
     */
    select?: InventoryAlertSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many InventoryAlerts.
     */
    data: InventoryAlertCreateManyInput | InventoryAlertCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InventoryAlert update
   */
  export type InventoryAlertUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlert
     */
    select?: InventoryAlertSelect<ExtArgs> | null
    /**
     * The data needed to update a InventoryAlert.
     */
    data: XOR<InventoryAlertUpdateInput, InventoryAlertUncheckedUpdateInput>
    /**
     * Choose, which InventoryAlert to update.
     */
    where: InventoryAlertWhereUniqueInput
  }

  /**
   * InventoryAlert updateMany
   */
  export type InventoryAlertUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InventoryAlerts.
     */
    data: XOR<InventoryAlertUpdateManyMutationInput, InventoryAlertUncheckedUpdateManyInput>
    /**
     * Filter which InventoryAlerts to update
     */
    where?: InventoryAlertWhereInput
  }

  /**
   * InventoryAlert upsert
   */
  export type InventoryAlertUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlert
     */
    select?: InventoryAlertSelect<ExtArgs> | null
    /**
     * The filter to search for the InventoryAlert to update in case it exists.
     */
    where: InventoryAlertWhereUniqueInput
    /**
     * In case the InventoryAlert found by the `where` argument doesn't exist, create a new InventoryAlert with this data.
     */
    create: XOR<InventoryAlertCreateInput, InventoryAlertUncheckedCreateInput>
    /**
     * In case the InventoryAlert was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InventoryAlertUpdateInput, InventoryAlertUncheckedUpdateInput>
  }

  /**
   * InventoryAlert delete
   */
  export type InventoryAlertDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlert
     */
    select?: InventoryAlertSelect<ExtArgs> | null
    /**
     * Filter which InventoryAlert to delete.
     */
    where: InventoryAlertWhereUniqueInput
  }

  /**
   * InventoryAlert deleteMany
   */
  export type InventoryAlertDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InventoryAlerts to delete
     */
    where?: InventoryAlertWhereInput
  }

  /**
   * InventoryAlert without action
   */
  export type InventoryAlertDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InventoryAlert
     */
    select?: InventoryAlertSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const WarehouseScalarFieldEnum: {
    id: 'id',
    name: 'name',
    code: 'code',
    type: 'type',
    address: 'address',
    contactName: 'contactName',
    contactPhone: 'contactPhone',
    capacity: 'capacity',
    status: 'status',
    description: 'description',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type WarehouseScalarFieldEnum = (typeof WarehouseScalarFieldEnum)[keyof typeof WarehouseScalarFieldEnum]


  export const ItemCategoryScalarFieldEnum: {
    id: 'id',
    name: 'name',
    code: 'code',
    parentId: 'parentId',
    level: 'level',
    enabled: 'enabled',
    iconUrl: 'iconUrl',
    description: 'description',
    sortOrder: 'sortOrder',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ItemCategoryScalarFieldEnum = (typeof ItemCategoryScalarFieldEnum)[keyof typeof ItemCategoryScalarFieldEnum]


  export const InventoryItemScalarFieldEnum: {
    id: 'id',
    warehouseId: 'warehouseId',
    categoryId: 'categoryId',
    name: 'name',
    description: 'description',
    unit: 'unit',
    quantity: 'quantity',
    reservedQty: 'reservedQty',
    availableQty: 'availableQty',
    unitPrice: 'unitPrice',
    totalPrice: 'totalPrice',
    location: 'location',
    status: 'status',
    itemType: 'itemType',
    condition: 'condition',
    sourceOrderId: 'sourceOrderId',
    qualityGrade: 'qualityGrade',
    processingStatus: 'processingStatus',
    expiryDate: 'expiryDate',
    batchNumber: 'batchNumber',
    minStockLevel: 'minStockLevel',
    maxStockLevel: 'maxStockLevel',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type InventoryItemScalarFieldEnum = (typeof InventoryItemScalarFieldEnum)[keyof typeof InventoryItemScalarFieldEnum]


  export const InventoryTransactionScalarFieldEnum: {
    id: 'id',
    itemId: 'itemId',
    type: 'type',
    quantity: 'quantity',
    unitPrice: 'unitPrice',
    totalPrice: 'totalPrice',
    referenceId: 'referenceId',
    notes: 'notes',
    createdAt: 'createdAt'
  };

  export type InventoryTransactionScalarFieldEnum = (typeof InventoryTransactionScalarFieldEnum)[keyof typeof InventoryTransactionScalarFieldEnum]


  export const SalesRecordScalarFieldEnum: {
    id: 'id',
    itemId: 'itemId',
    quantity: 'quantity',
    unitPrice: 'unitPrice',
    totalPrice: 'totalPrice',
    orderId: 'orderId',
    customerId: 'customerId',
    soldAt: 'soldAt',
    notes: 'notes',
    createdAt: 'createdAt'
  };

  export type SalesRecordScalarFieldEnum = (typeof SalesRecordScalarFieldEnum)[keyof typeof SalesRecordScalarFieldEnum]


  export const QualityCheckScalarFieldEnum: {
    id: 'id',
    itemId: 'itemId',
    checkerId: 'checkerId',
    checkType: 'checkType',
    result: 'result',
    score: 'score',
    notes: 'notes',
    images: 'images',
    checkedAt: 'checkedAt',
    createdAt: 'createdAt'
  };

  export type QualityCheckScalarFieldEnum = (typeof QualityCheckScalarFieldEnum)[keyof typeof QualityCheckScalarFieldEnum]


  export const ReservationScalarFieldEnum: {
    id: 'id',
    itemId: 'itemId',
    orderId: 'orderId',
    quantity: 'quantity',
    status: 'status',
    reservedAt: 'reservedAt',
    expiresAt: 'expiresAt',
    confirmedAt: 'confirmedAt',
    cancelledAt: 'cancelledAt',
    notes: 'notes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ReservationScalarFieldEnum = (typeof ReservationScalarFieldEnum)[keyof typeof ReservationScalarFieldEnum]


  export const InventoryMovementScalarFieldEnum: {
    id: 'id',
    itemId: 'itemId',
    warehouseId: 'warehouseId',
    categoryId: 'categoryId',
    movementType: 'movementType',
    direction: 'direction',
    quantity: 'quantity',
    unitPrice: 'unitPrice',
    totalAmount: 'totalAmount',
    beforeQty: 'beforeQty',
    afterQty: 'afterQty',
    referenceType: 'referenceType',
    referenceId: 'referenceId',
    referenceNo: 'referenceNo',
    operatorId: 'operatorId',
    operatorName: 'operatorName',
    remark: 'remark',
    createdAt: 'createdAt'
  };

  export type InventoryMovementScalarFieldEnum = (typeof InventoryMovementScalarFieldEnum)[keyof typeof InventoryMovementScalarFieldEnum]


  export const PricingRuleScalarFieldEnum: {
    id: 'id',
    categoryId: 'categoryId',
    regionCode: 'regionCode',
    priceType: 'priceType',
    basePrice: 'basePrice',
    unit: 'unit',
    weightTiers: 'weightTiers',
    qualityFactors: 'qualityFactors',
    seasonFactors: 'seasonFactors',
    enabled: 'enabled',
    validFrom: 'validFrom',
    validTo: 'validTo',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PricingRuleScalarFieldEnum = (typeof PricingRuleScalarFieldEnum)[keyof typeof PricingRuleScalarFieldEnum]


  export const InventoryAlertScalarFieldEnum: {
    id: 'id',
    itemId: 'itemId',
    alertType: 'alertType',
    alertLevel: 'alertLevel',
    currentQty: 'currentQty',
    thresholdQty: 'thresholdQty',
    message: 'message',
    status: 'status',
    handledBy: 'handledBy',
    handledAt: 'handledAt',
    handlerRemark: 'handlerRemark',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type InventoryAlertScalarFieldEnum = (typeof InventoryAlertScalarFieldEnum)[keyof typeof InventoryAlertScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'WarehouseType'
   */
  export type EnumWarehouseTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WarehouseType'>
    


  /**
   * Reference to a field of type 'WarehouseType[]'
   */
  export type ListEnumWarehouseTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WarehouseType[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'WarehouseStatus'
   */
  export type EnumWarehouseStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WarehouseStatus'>
    


  /**
   * Reference to a field of type 'WarehouseStatus[]'
   */
  export type ListEnumWarehouseStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WarehouseStatus[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'InventoryStatus'
   */
  export type EnumInventoryStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InventoryStatus'>
    


  /**
   * Reference to a field of type 'InventoryStatus[]'
   */
  export type ListEnumInventoryStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'InventoryStatus[]'>
    


  /**
   * Reference to a field of type 'ItemType'
   */
  export type EnumItemTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ItemType'>
    


  /**
   * Reference to a field of type 'ItemType[]'
   */
  export type ListEnumItemTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ItemType[]'>
    


  /**
   * Reference to a field of type 'ItemCondition'
   */
  export type EnumItemConditionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ItemCondition'>
    


  /**
   * Reference to a field of type 'ItemCondition[]'
   */
  export type ListEnumItemConditionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ItemCondition[]'>
    


  /**
   * Reference to a field of type 'ProcessingStatus'
   */
  export type EnumProcessingStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProcessingStatus'>
    


  /**
   * Reference to a field of type 'ProcessingStatus[]'
   */
  export type ListEnumProcessingStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProcessingStatus[]'>
    


  /**
   * Reference to a field of type 'TransactionType'
   */
  export type EnumTransactionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionType'>
    


  /**
   * Reference to a field of type 'TransactionType[]'
   */
  export type ListEnumTransactionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionType[]'>
    


  /**
   * Reference to a field of type 'CheckType'
   */
  export type EnumCheckTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CheckType'>
    


  /**
   * Reference to a field of type 'CheckType[]'
   */
  export type ListEnumCheckTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CheckType[]'>
    


  /**
   * Reference to a field of type 'CheckResult'
   */
  export type EnumCheckResultFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CheckResult'>
    


  /**
   * Reference to a field of type 'CheckResult[]'
   */
  export type ListEnumCheckResultFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CheckResult[]'>
    


  /**
   * Reference to a field of type 'ReservationStatus'
   */
  export type EnumReservationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ReservationStatus'>
    


  /**
   * Reference to a field of type 'ReservationStatus[]'
   */
  export type ListEnumReservationStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ReservationStatus[]'>
    


  /**
   * Reference to a field of type 'MovementType'
   */
  export type EnumMovementTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MovementType'>
    


  /**
   * Reference to a field of type 'MovementType[]'
   */
  export type ListEnumMovementTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MovementType[]'>
    


  /**
   * Reference to a field of type 'MovementDirection'
   */
  export type EnumMovementDirectionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MovementDirection'>
    


  /**
   * Reference to a field of type 'MovementDirection[]'
   */
  export type ListEnumMovementDirectionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MovementDirection[]'>
    


  /**
   * Reference to a field of type 'PriceType'
   */
  export type EnumPriceTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PriceType'>
    


  /**
   * Reference to a field of type 'PriceType[]'
   */
  export type ListEnumPriceTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PriceType[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'AlertType'
   */
  export type EnumAlertTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AlertType'>
    


  /**
   * Reference to a field of type 'AlertType[]'
   */
  export type ListEnumAlertTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AlertType[]'>
    


  /**
   * Reference to a field of type 'AlertLevel'
   */
  export type EnumAlertLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AlertLevel'>
    


  /**
   * Reference to a field of type 'AlertLevel[]'
   */
  export type ListEnumAlertLevelFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AlertLevel[]'>
    


  /**
   * Reference to a field of type 'AlertStatus'
   */
  export type EnumAlertStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AlertStatus'>
    


  /**
   * Reference to a field of type 'AlertStatus[]'
   */
  export type ListEnumAlertStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'AlertStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type WarehouseWhereInput = {
    AND?: WarehouseWhereInput | WarehouseWhereInput[]
    OR?: WarehouseWhereInput[]
    NOT?: WarehouseWhereInput | WarehouseWhereInput[]
    id?: BigIntFilter<"Warehouse"> | bigint | number
    name?: StringFilter<"Warehouse"> | string
    code?: StringFilter<"Warehouse"> | string
    type?: EnumWarehouseTypeFilter<"Warehouse"> | $Enums.WarehouseType
    address?: StringFilter<"Warehouse"> | string
    contactName?: StringNullableFilter<"Warehouse"> | string | null
    contactPhone?: StringNullableFilter<"Warehouse"> | string | null
    capacity?: DecimalNullableFilter<"Warehouse"> | Decimal | DecimalJsLike | number | string | null
    status?: EnumWarehouseStatusFilter<"Warehouse"> | $Enums.WarehouseStatus
    description?: StringNullableFilter<"Warehouse"> | string | null
    createdAt?: DateTimeFilter<"Warehouse"> | Date | string
    updatedAt?: DateTimeFilter<"Warehouse"> | Date | string
    inventoryItems?: InventoryItemListRelationFilter
    movements?: InventoryMovementListRelationFilter
  }

  export type WarehouseOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    type?: SortOrder
    address?: SortOrder
    contactName?: SortOrderInput | SortOrder
    contactPhone?: SortOrderInput | SortOrder
    capacity?: SortOrderInput | SortOrder
    status?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    inventoryItems?: InventoryItemOrderByRelationAggregateInput
    movements?: InventoryMovementOrderByRelationAggregateInput
  }

  export type WarehouseWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    code?: string
    AND?: WarehouseWhereInput | WarehouseWhereInput[]
    OR?: WarehouseWhereInput[]
    NOT?: WarehouseWhereInput | WarehouseWhereInput[]
    name?: StringFilter<"Warehouse"> | string
    type?: EnumWarehouseTypeFilter<"Warehouse"> | $Enums.WarehouseType
    address?: StringFilter<"Warehouse"> | string
    contactName?: StringNullableFilter<"Warehouse"> | string | null
    contactPhone?: StringNullableFilter<"Warehouse"> | string | null
    capacity?: DecimalNullableFilter<"Warehouse"> | Decimal | DecimalJsLike | number | string | null
    status?: EnumWarehouseStatusFilter<"Warehouse"> | $Enums.WarehouseStatus
    description?: StringNullableFilter<"Warehouse"> | string | null
    createdAt?: DateTimeFilter<"Warehouse"> | Date | string
    updatedAt?: DateTimeFilter<"Warehouse"> | Date | string
    inventoryItems?: InventoryItemListRelationFilter
    movements?: InventoryMovementListRelationFilter
  }, "id" | "code">

  export type WarehouseOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    type?: SortOrder
    address?: SortOrder
    contactName?: SortOrderInput | SortOrder
    contactPhone?: SortOrderInput | SortOrder
    capacity?: SortOrderInput | SortOrder
    status?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: WarehouseCountOrderByAggregateInput
    _avg?: WarehouseAvgOrderByAggregateInput
    _max?: WarehouseMaxOrderByAggregateInput
    _min?: WarehouseMinOrderByAggregateInput
    _sum?: WarehouseSumOrderByAggregateInput
  }

  export type WarehouseScalarWhereWithAggregatesInput = {
    AND?: WarehouseScalarWhereWithAggregatesInput | WarehouseScalarWhereWithAggregatesInput[]
    OR?: WarehouseScalarWhereWithAggregatesInput[]
    NOT?: WarehouseScalarWhereWithAggregatesInput | WarehouseScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"Warehouse"> | bigint | number
    name?: StringWithAggregatesFilter<"Warehouse"> | string
    code?: StringWithAggregatesFilter<"Warehouse"> | string
    type?: EnumWarehouseTypeWithAggregatesFilter<"Warehouse"> | $Enums.WarehouseType
    address?: StringWithAggregatesFilter<"Warehouse"> | string
    contactName?: StringNullableWithAggregatesFilter<"Warehouse"> | string | null
    contactPhone?: StringNullableWithAggregatesFilter<"Warehouse"> | string | null
    capacity?: DecimalNullableWithAggregatesFilter<"Warehouse"> | Decimal | DecimalJsLike | number | string | null
    status?: EnumWarehouseStatusWithAggregatesFilter<"Warehouse"> | $Enums.WarehouseStatus
    description?: StringNullableWithAggregatesFilter<"Warehouse"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Warehouse"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Warehouse"> | Date | string
  }

  export type ItemCategoryWhereInput = {
    AND?: ItemCategoryWhereInput | ItemCategoryWhereInput[]
    OR?: ItemCategoryWhereInput[]
    NOT?: ItemCategoryWhereInput | ItemCategoryWhereInput[]
    id?: BigIntFilter<"ItemCategory"> | bigint | number
    name?: StringFilter<"ItemCategory"> | string
    code?: StringFilter<"ItemCategory"> | string
    parentId?: BigIntNullableFilter<"ItemCategory"> | bigint | number | null
    level?: IntFilter<"ItemCategory"> | number
    enabled?: BoolFilter<"ItemCategory"> | boolean
    iconUrl?: StringNullableFilter<"ItemCategory"> | string | null
    description?: StringNullableFilter<"ItemCategory"> | string | null
    sortOrder?: IntFilter<"ItemCategory"> | number
    createdAt?: DateTimeFilter<"ItemCategory"> | Date | string
    updatedAt?: DateTimeFilter<"ItemCategory"> | Date | string
    parent?: XOR<ItemCategoryNullableRelationFilter, ItemCategoryWhereInput> | null
    children?: ItemCategoryListRelationFilter
    inventoryItems?: InventoryItemListRelationFilter
    movements?: InventoryMovementListRelationFilter
    pricingRules?: PricingRuleListRelationFilter
  }

  export type ItemCategoryOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    parentId?: SortOrderInput | SortOrder
    level?: SortOrder
    enabled?: SortOrder
    iconUrl?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    parent?: ItemCategoryOrderByWithRelationInput
    children?: ItemCategoryOrderByRelationAggregateInput
    inventoryItems?: InventoryItemOrderByRelationAggregateInput
    movements?: InventoryMovementOrderByRelationAggregateInput
    pricingRules?: PricingRuleOrderByRelationAggregateInput
  }

  export type ItemCategoryWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    code?: string
    AND?: ItemCategoryWhereInput | ItemCategoryWhereInput[]
    OR?: ItemCategoryWhereInput[]
    NOT?: ItemCategoryWhereInput | ItemCategoryWhereInput[]
    name?: StringFilter<"ItemCategory"> | string
    parentId?: BigIntNullableFilter<"ItemCategory"> | bigint | number | null
    level?: IntFilter<"ItemCategory"> | number
    enabled?: BoolFilter<"ItemCategory"> | boolean
    iconUrl?: StringNullableFilter<"ItemCategory"> | string | null
    description?: StringNullableFilter<"ItemCategory"> | string | null
    sortOrder?: IntFilter<"ItemCategory"> | number
    createdAt?: DateTimeFilter<"ItemCategory"> | Date | string
    updatedAt?: DateTimeFilter<"ItemCategory"> | Date | string
    parent?: XOR<ItemCategoryNullableRelationFilter, ItemCategoryWhereInput> | null
    children?: ItemCategoryListRelationFilter
    inventoryItems?: InventoryItemListRelationFilter
    movements?: InventoryMovementListRelationFilter
    pricingRules?: PricingRuleListRelationFilter
  }, "id" | "code">

  export type ItemCategoryOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    parentId?: SortOrderInput | SortOrder
    level?: SortOrder
    enabled?: SortOrder
    iconUrl?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ItemCategoryCountOrderByAggregateInput
    _avg?: ItemCategoryAvgOrderByAggregateInput
    _max?: ItemCategoryMaxOrderByAggregateInput
    _min?: ItemCategoryMinOrderByAggregateInput
    _sum?: ItemCategorySumOrderByAggregateInput
  }

  export type ItemCategoryScalarWhereWithAggregatesInput = {
    AND?: ItemCategoryScalarWhereWithAggregatesInput | ItemCategoryScalarWhereWithAggregatesInput[]
    OR?: ItemCategoryScalarWhereWithAggregatesInput[]
    NOT?: ItemCategoryScalarWhereWithAggregatesInput | ItemCategoryScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"ItemCategory"> | bigint | number
    name?: StringWithAggregatesFilter<"ItemCategory"> | string
    code?: StringWithAggregatesFilter<"ItemCategory"> | string
    parentId?: BigIntNullableWithAggregatesFilter<"ItemCategory"> | bigint | number | null
    level?: IntWithAggregatesFilter<"ItemCategory"> | number
    enabled?: BoolWithAggregatesFilter<"ItemCategory"> | boolean
    iconUrl?: StringNullableWithAggregatesFilter<"ItemCategory"> | string | null
    description?: StringNullableWithAggregatesFilter<"ItemCategory"> | string | null
    sortOrder?: IntWithAggregatesFilter<"ItemCategory"> | number
    createdAt?: DateTimeWithAggregatesFilter<"ItemCategory"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ItemCategory"> | Date | string
  }

  export type InventoryItemWhereInput = {
    AND?: InventoryItemWhereInput | InventoryItemWhereInput[]
    OR?: InventoryItemWhereInput[]
    NOT?: InventoryItemWhereInput | InventoryItemWhereInput[]
    id?: BigIntFilter<"InventoryItem"> | bigint | number
    warehouseId?: BigIntFilter<"InventoryItem"> | bigint | number
    categoryId?: BigIntFilter<"InventoryItem"> | bigint | number
    name?: StringFilter<"InventoryItem"> | string
    description?: StringNullableFilter<"InventoryItem"> | string | null
    unit?: StringFilter<"InventoryItem"> | string
    quantity?: DecimalFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    location?: StringNullableFilter<"InventoryItem"> | string | null
    status?: EnumInventoryStatusFilter<"InventoryItem"> | $Enums.InventoryStatus
    itemType?: EnumItemTypeFilter<"InventoryItem"> | $Enums.ItemType
    condition?: EnumItemConditionFilter<"InventoryItem"> | $Enums.ItemCondition
    sourceOrderId?: StringNullableFilter<"InventoryItem"> | string | null
    qualityGrade?: StringNullableFilter<"InventoryItem"> | string | null
    processingStatus?: EnumProcessingStatusFilter<"InventoryItem"> | $Enums.ProcessingStatus
    expiryDate?: DateTimeNullableFilter<"InventoryItem"> | Date | string | null
    batchNumber?: StringNullableFilter<"InventoryItem"> | string | null
    minStockLevel?: DecimalNullableFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: DecimalNullableFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFilter<"InventoryItem"> | Date | string
    updatedAt?: DateTimeFilter<"InventoryItem"> | Date | string
    warehouse?: XOR<WarehouseRelationFilter, WarehouseWhereInput>
    category?: XOR<ItemCategoryRelationFilter, ItemCategoryWhereInput>
    transactions?: InventoryTransactionListRelationFilter
    salesRecords?: SalesRecordListRelationFilter
    qualityChecks?: QualityCheckListRelationFilter
    movements?: InventoryMovementListRelationFilter
    reservations?: ReservationListRelationFilter
  }

  export type InventoryItemOrderByWithRelationInput = {
    id?: SortOrder
    warehouseId?: SortOrder
    categoryId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    unit?: SortOrder
    quantity?: SortOrder
    reservedQty?: SortOrder
    availableQty?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    location?: SortOrderInput | SortOrder
    status?: SortOrder
    itemType?: SortOrder
    condition?: SortOrder
    sourceOrderId?: SortOrderInput | SortOrder
    qualityGrade?: SortOrderInput | SortOrder
    processingStatus?: SortOrder
    expiryDate?: SortOrderInput | SortOrder
    batchNumber?: SortOrderInput | SortOrder
    minStockLevel?: SortOrderInput | SortOrder
    maxStockLevel?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    warehouse?: WarehouseOrderByWithRelationInput
    category?: ItemCategoryOrderByWithRelationInput
    transactions?: InventoryTransactionOrderByRelationAggregateInput
    salesRecords?: SalesRecordOrderByRelationAggregateInput
    qualityChecks?: QualityCheckOrderByRelationAggregateInput
    movements?: InventoryMovementOrderByRelationAggregateInput
    reservations?: ReservationOrderByRelationAggregateInput
  }

  export type InventoryItemWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    AND?: InventoryItemWhereInput | InventoryItemWhereInput[]
    OR?: InventoryItemWhereInput[]
    NOT?: InventoryItemWhereInput | InventoryItemWhereInput[]
    warehouseId?: BigIntFilter<"InventoryItem"> | bigint | number
    categoryId?: BigIntFilter<"InventoryItem"> | bigint | number
    name?: StringFilter<"InventoryItem"> | string
    description?: StringNullableFilter<"InventoryItem"> | string | null
    unit?: StringFilter<"InventoryItem"> | string
    quantity?: DecimalFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    location?: StringNullableFilter<"InventoryItem"> | string | null
    status?: EnumInventoryStatusFilter<"InventoryItem"> | $Enums.InventoryStatus
    itemType?: EnumItemTypeFilter<"InventoryItem"> | $Enums.ItemType
    condition?: EnumItemConditionFilter<"InventoryItem"> | $Enums.ItemCondition
    sourceOrderId?: StringNullableFilter<"InventoryItem"> | string | null
    qualityGrade?: StringNullableFilter<"InventoryItem"> | string | null
    processingStatus?: EnumProcessingStatusFilter<"InventoryItem"> | $Enums.ProcessingStatus
    expiryDate?: DateTimeNullableFilter<"InventoryItem"> | Date | string | null
    batchNumber?: StringNullableFilter<"InventoryItem"> | string | null
    minStockLevel?: DecimalNullableFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: DecimalNullableFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFilter<"InventoryItem"> | Date | string
    updatedAt?: DateTimeFilter<"InventoryItem"> | Date | string
    warehouse?: XOR<WarehouseRelationFilter, WarehouseWhereInput>
    category?: XOR<ItemCategoryRelationFilter, ItemCategoryWhereInput>
    transactions?: InventoryTransactionListRelationFilter
    salesRecords?: SalesRecordListRelationFilter
    qualityChecks?: QualityCheckListRelationFilter
    movements?: InventoryMovementListRelationFilter
    reservations?: ReservationListRelationFilter
  }, "id">

  export type InventoryItemOrderByWithAggregationInput = {
    id?: SortOrder
    warehouseId?: SortOrder
    categoryId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    unit?: SortOrder
    quantity?: SortOrder
    reservedQty?: SortOrder
    availableQty?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    location?: SortOrderInput | SortOrder
    status?: SortOrder
    itemType?: SortOrder
    condition?: SortOrder
    sourceOrderId?: SortOrderInput | SortOrder
    qualityGrade?: SortOrderInput | SortOrder
    processingStatus?: SortOrder
    expiryDate?: SortOrderInput | SortOrder
    batchNumber?: SortOrderInput | SortOrder
    minStockLevel?: SortOrderInput | SortOrder
    maxStockLevel?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: InventoryItemCountOrderByAggregateInput
    _avg?: InventoryItemAvgOrderByAggregateInput
    _max?: InventoryItemMaxOrderByAggregateInput
    _min?: InventoryItemMinOrderByAggregateInput
    _sum?: InventoryItemSumOrderByAggregateInput
  }

  export type InventoryItemScalarWhereWithAggregatesInput = {
    AND?: InventoryItemScalarWhereWithAggregatesInput | InventoryItemScalarWhereWithAggregatesInput[]
    OR?: InventoryItemScalarWhereWithAggregatesInput[]
    NOT?: InventoryItemScalarWhereWithAggregatesInput | InventoryItemScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"InventoryItem"> | bigint | number
    warehouseId?: BigIntWithAggregatesFilter<"InventoryItem"> | bigint | number
    categoryId?: BigIntWithAggregatesFilter<"InventoryItem"> | bigint | number
    name?: StringWithAggregatesFilter<"InventoryItem"> | string
    description?: StringNullableWithAggregatesFilter<"InventoryItem"> | string | null
    unit?: StringWithAggregatesFilter<"InventoryItem"> | string
    quantity?: DecimalWithAggregatesFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalWithAggregatesFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalWithAggregatesFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalWithAggregatesFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalWithAggregatesFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    location?: StringNullableWithAggregatesFilter<"InventoryItem"> | string | null
    status?: EnumInventoryStatusWithAggregatesFilter<"InventoryItem"> | $Enums.InventoryStatus
    itemType?: EnumItemTypeWithAggregatesFilter<"InventoryItem"> | $Enums.ItemType
    condition?: EnumItemConditionWithAggregatesFilter<"InventoryItem"> | $Enums.ItemCondition
    sourceOrderId?: StringNullableWithAggregatesFilter<"InventoryItem"> | string | null
    qualityGrade?: StringNullableWithAggregatesFilter<"InventoryItem"> | string | null
    processingStatus?: EnumProcessingStatusWithAggregatesFilter<"InventoryItem"> | $Enums.ProcessingStatus
    expiryDate?: DateTimeNullableWithAggregatesFilter<"InventoryItem"> | Date | string | null
    batchNumber?: StringNullableWithAggregatesFilter<"InventoryItem"> | string | null
    minStockLevel?: DecimalNullableWithAggregatesFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: DecimalNullableWithAggregatesFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeWithAggregatesFilter<"InventoryItem"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"InventoryItem"> | Date | string
  }

  export type InventoryTransactionWhereInput = {
    AND?: InventoryTransactionWhereInput | InventoryTransactionWhereInput[]
    OR?: InventoryTransactionWhereInput[]
    NOT?: InventoryTransactionWhereInput | InventoryTransactionWhereInput[]
    id?: BigIntFilter<"InventoryTransaction"> | bigint | number
    itemId?: BigIntFilter<"InventoryTransaction"> | bigint | number
    type?: EnumTransactionTypeFilter<"InventoryTransaction"> | $Enums.TransactionType
    quantity?: DecimalFilter<"InventoryTransaction"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFilter<"InventoryTransaction"> | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFilter<"InventoryTransaction"> | Decimal | DecimalJsLike | number | string
    referenceId?: StringNullableFilter<"InventoryTransaction"> | string | null
    notes?: StringNullableFilter<"InventoryTransaction"> | string | null
    createdAt?: DateTimeFilter<"InventoryTransaction"> | Date | string
    item?: XOR<InventoryItemRelationFilter, InventoryItemWhereInput>
  }

  export type InventoryTransactionOrderByWithRelationInput = {
    id?: SortOrder
    itemId?: SortOrder
    type?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    referenceId?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    item?: InventoryItemOrderByWithRelationInput
  }

  export type InventoryTransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    AND?: InventoryTransactionWhereInput | InventoryTransactionWhereInput[]
    OR?: InventoryTransactionWhereInput[]
    NOT?: InventoryTransactionWhereInput | InventoryTransactionWhereInput[]
    itemId?: BigIntFilter<"InventoryTransaction"> | bigint | number
    type?: EnumTransactionTypeFilter<"InventoryTransaction"> | $Enums.TransactionType
    quantity?: DecimalFilter<"InventoryTransaction"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFilter<"InventoryTransaction"> | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFilter<"InventoryTransaction"> | Decimal | DecimalJsLike | number | string
    referenceId?: StringNullableFilter<"InventoryTransaction"> | string | null
    notes?: StringNullableFilter<"InventoryTransaction"> | string | null
    createdAt?: DateTimeFilter<"InventoryTransaction"> | Date | string
    item?: XOR<InventoryItemRelationFilter, InventoryItemWhereInput>
  }, "id">

  export type InventoryTransactionOrderByWithAggregationInput = {
    id?: SortOrder
    itemId?: SortOrder
    type?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    referenceId?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: InventoryTransactionCountOrderByAggregateInput
    _avg?: InventoryTransactionAvgOrderByAggregateInput
    _max?: InventoryTransactionMaxOrderByAggregateInput
    _min?: InventoryTransactionMinOrderByAggregateInput
    _sum?: InventoryTransactionSumOrderByAggregateInput
  }

  export type InventoryTransactionScalarWhereWithAggregatesInput = {
    AND?: InventoryTransactionScalarWhereWithAggregatesInput | InventoryTransactionScalarWhereWithAggregatesInput[]
    OR?: InventoryTransactionScalarWhereWithAggregatesInput[]
    NOT?: InventoryTransactionScalarWhereWithAggregatesInput | InventoryTransactionScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"InventoryTransaction"> | bigint | number
    itemId?: BigIntWithAggregatesFilter<"InventoryTransaction"> | bigint | number
    type?: EnumTransactionTypeWithAggregatesFilter<"InventoryTransaction"> | $Enums.TransactionType
    quantity?: DecimalWithAggregatesFilter<"InventoryTransaction"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalWithAggregatesFilter<"InventoryTransaction"> | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalWithAggregatesFilter<"InventoryTransaction"> | Decimal | DecimalJsLike | number | string
    referenceId?: StringNullableWithAggregatesFilter<"InventoryTransaction"> | string | null
    notes?: StringNullableWithAggregatesFilter<"InventoryTransaction"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"InventoryTransaction"> | Date | string
  }

  export type SalesRecordWhereInput = {
    AND?: SalesRecordWhereInput | SalesRecordWhereInput[]
    OR?: SalesRecordWhereInput[]
    NOT?: SalesRecordWhereInput | SalesRecordWhereInput[]
    id?: BigIntFilter<"SalesRecord"> | bigint | number
    itemId?: BigIntFilter<"SalesRecord"> | bigint | number
    quantity?: DecimalFilter<"SalesRecord"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFilter<"SalesRecord"> | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFilter<"SalesRecord"> | Decimal | DecimalJsLike | number | string
    orderId?: StringFilter<"SalesRecord"> | string
    customerId?: BigIntFilter<"SalesRecord"> | bigint | number
    soldAt?: DateTimeFilter<"SalesRecord"> | Date | string
    notes?: StringNullableFilter<"SalesRecord"> | string | null
    createdAt?: DateTimeFilter<"SalesRecord"> | Date | string
    item?: XOR<InventoryItemRelationFilter, InventoryItemWhereInput>
  }

  export type SalesRecordOrderByWithRelationInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    orderId?: SortOrder
    customerId?: SortOrder
    soldAt?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    item?: InventoryItemOrderByWithRelationInput
  }

  export type SalesRecordWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    AND?: SalesRecordWhereInput | SalesRecordWhereInput[]
    OR?: SalesRecordWhereInput[]
    NOT?: SalesRecordWhereInput | SalesRecordWhereInput[]
    itemId?: BigIntFilter<"SalesRecord"> | bigint | number
    quantity?: DecimalFilter<"SalesRecord"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFilter<"SalesRecord"> | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFilter<"SalesRecord"> | Decimal | DecimalJsLike | number | string
    orderId?: StringFilter<"SalesRecord"> | string
    customerId?: BigIntFilter<"SalesRecord"> | bigint | number
    soldAt?: DateTimeFilter<"SalesRecord"> | Date | string
    notes?: StringNullableFilter<"SalesRecord"> | string | null
    createdAt?: DateTimeFilter<"SalesRecord"> | Date | string
    item?: XOR<InventoryItemRelationFilter, InventoryItemWhereInput>
  }, "id">

  export type SalesRecordOrderByWithAggregationInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    orderId?: SortOrder
    customerId?: SortOrder
    soldAt?: SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: SalesRecordCountOrderByAggregateInput
    _avg?: SalesRecordAvgOrderByAggregateInput
    _max?: SalesRecordMaxOrderByAggregateInput
    _min?: SalesRecordMinOrderByAggregateInput
    _sum?: SalesRecordSumOrderByAggregateInput
  }

  export type SalesRecordScalarWhereWithAggregatesInput = {
    AND?: SalesRecordScalarWhereWithAggregatesInput | SalesRecordScalarWhereWithAggregatesInput[]
    OR?: SalesRecordScalarWhereWithAggregatesInput[]
    NOT?: SalesRecordScalarWhereWithAggregatesInput | SalesRecordScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"SalesRecord"> | bigint | number
    itemId?: BigIntWithAggregatesFilter<"SalesRecord"> | bigint | number
    quantity?: DecimalWithAggregatesFilter<"SalesRecord"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalWithAggregatesFilter<"SalesRecord"> | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalWithAggregatesFilter<"SalesRecord"> | Decimal | DecimalJsLike | number | string
    orderId?: StringWithAggregatesFilter<"SalesRecord"> | string
    customerId?: BigIntWithAggregatesFilter<"SalesRecord"> | bigint | number
    soldAt?: DateTimeWithAggregatesFilter<"SalesRecord"> | Date | string
    notes?: StringNullableWithAggregatesFilter<"SalesRecord"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"SalesRecord"> | Date | string
  }

  export type QualityCheckWhereInput = {
    AND?: QualityCheckWhereInput | QualityCheckWhereInput[]
    OR?: QualityCheckWhereInput[]
    NOT?: QualityCheckWhereInput | QualityCheckWhereInput[]
    id?: BigIntFilter<"QualityCheck"> | bigint | number
    itemId?: BigIntFilter<"QualityCheck"> | bigint | number
    checkerId?: BigIntFilter<"QualityCheck"> | bigint | number
    checkType?: EnumCheckTypeFilter<"QualityCheck"> | $Enums.CheckType
    result?: EnumCheckResultFilter<"QualityCheck"> | $Enums.CheckResult
    score?: IntNullableFilter<"QualityCheck"> | number | null
    notes?: StringNullableFilter<"QualityCheck"> | string | null
    images?: StringNullableListFilter<"QualityCheck">
    checkedAt?: DateTimeFilter<"QualityCheck"> | Date | string
    createdAt?: DateTimeFilter<"QualityCheck"> | Date | string
    item?: XOR<InventoryItemRelationFilter, InventoryItemWhereInput>
  }

  export type QualityCheckOrderByWithRelationInput = {
    id?: SortOrder
    itemId?: SortOrder
    checkerId?: SortOrder
    checkType?: SortOrder
    result?: SortOrder
    score?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    images?: SortOrder
    checkedAt?: SortOrder
    createdAt?: SortOrder
    item?: InventoryItemOrderByWithRelationInput
  }

  export type QualityCheckWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    AND?: QualityCheckWhereInput | QualityCheckWhereInput[]
    OR?: QualityCheckWhereInput[]
    NOT?: QualityCheckWhereInput | QualityCheckWhereInput[]
    itemId?: BigIntFilter<"QualityCheck"> | bigint | number
    checkerId?: BigIntFilter<"QualityCheck"> | bigint | number
    checkType?: EnumCheckTypeFilter<"QualityCheck"> | $Enums.CheckType
    result?: EnumCheckResultFilter<"QualityCheck"> | $Enums.CheckResult
    score?: IntNullableFilter<"QualityCheck"> | number | null
    notes?: StringNullableFilter<"QualityCheck"> | string | null
    images?: StringNullableListFilter<"QualityCheck">
    checkedAt?: DateTimeFilter<"QualityCheck"> | Date | string
    createdAt?: DateTimeFilter<"QualityCheck"> | Date | string
    item?: XOR<InventoryItemRelationFilter, InventoryItemWhereInput>
  }, "id">

  export type QualityCheckOrderByWithAggregationInput = {
    id?: SortOrder
    itemId?: SortOrder
    checkerId?: SortOrder
    checkType?: SortOrder
    result?: SortOrder
    score?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    images?: SortOrder
    checkedAt?: SortOrder
    createdAt?: SortOrder
    _count?: QualityCheckCountOrderByAggregateInput
    _avg?: QualityCheckAvgOrderByAggregateInput
    _max?: QualityCheckMaxOrderByAggregateInput
    _min?: QualityCheckMinOrderByAggregateInput
    _sum?: QualityCheckSumOrderByAggregateInput
  }

  export type QualityCheckScalarWhereWithAggregatesInput = {
    AND?: QualityCheckScalarWhereWithAggregatesInput | QualityCheckScalarWhereWithAggregatesInput[]
    OR?: QualityCheckScalarWhereWithAggregatesInput[]
    NOT?: QualityCheckScalarWhereWithAggregatesInput | QualityCheckScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"QualityCheck"> | bigint | number
    itemId?: BigIntWithAggregatesFilter<"QualityCheck"> | bigint | number
    checkerId?: BigIntWithAggregatesFilter<"QualityCheck"> | bigint | number
    checkType?: EnumCheckTypeWithAggregatesFilter<"QualityCheck"> | $Enums.CheckType
    result?: EnumCheckResultWithAggregatesFilter<"QualityCheck"> | $Enums.CheckResult
    score?: IntNullableWithAggregatesFilter<"QualityCheck"> | number | null
    notes?: StringNullableWithAggregatesFilter<"QualityCheck"> | string | null
    images?: StringNullableListFilter<"QualityCheck">
    checkedAt?: DateTimeWithAggregatesFilter<"QualityCheck"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"QualityCheck"> | Date | string
  }

  export type ReservationWhereInput = {
    AND?: ReservationWhereInput | ReservationWhereInput[]
    OR?: ReservationWhereInput[]
    NOT?: ReservationWhereInput | ReservationWhereInput[]
    id?: BigIntFilter<"Reservation"> | bigint | number
    itemId?: BigIntFilter<"Reservation"> | bigint | number
    orderId?: StringFilter<"Reservation"> | string
    quantity?: DecimalFilter<"Reservation"> | Decimal | DecimalJsLike | number | string
    status?: EnumReservationStatusFilter<"Reservation"> | $Enums.ReservationStatus
    reservedAt?: DateTimeFilter<"Reservation"> | Date | string
    expiresAt?: DateTimeNullableFilter<"Reservation"> | Date | string | null
    confirmedAt?: DateTimeNullableFilter<"Reservation"> | Date | string | null
    cancelledAt?: DateTimeNullableFilter<"Reservation"> | Date | string | null
    notes?: StringNullableFilter<"Reservation"> | string | null
    createdAt?: DateTimeFilter<"Reservation"> | Date | string
    updatedAt?: DateTimeFilter<"Reservation"> | Date | string
    item?: XOR<InventoryItemRelationFilter, InventoryItemWhereInput>
  }

  export type ReservationOrderByWithRelationInput = {
    id?: SortOrder
    itemId?: SortOrder
    orderId?: SortOrder
    quantity?: SortOrder
    status?: SortOrder
    reservedAt?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    confirmedAt?: SortOrderInput | SortOrder
    cancelledAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    item?: InventoryItemOrderByWithRelationInput
  }

  export type ReservationWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    AND?: ReservationWhereInput | ReservationWhereInput[]
    OR?: ReservationWhereInput[]
    NOT?: ReservationWhereInput | ReservationWhereInput[]
    itemId?: BigIntFilter<"Reservation"> | bigint | number
    orderId?: StringFilter<"Reservation"> | string
    quantity?: DecimalFilter<"Reservation"> | Decimal | DecimalJsLike | number | string
    status?: EnumReservationStatusFilter<"Reservation"> | $Enums.ReservationStatus
    reservedAt?: DateTimeFilter<"Reservation"> | Date | string
    expiresAt?: DateTimeNullableFilter<"Reservation"> | Date | string | null
    confirmedAt?: DateTimeNullableFilter<"Reservation"> | Date | string | null
    cancelledAt?: DateTimeNullableFilter<"Reservation"> | Date | string | null
    notes?: StringNullableFilter<"Reservation"> | string | null
    createdAt?: DateTimeFilter<"Reservation"> | Date | string
    updatedAt?: DateTimeFilter<"Reservation"> | Date | string
    item?: XOR<InventoryItemRelationFilter, InventoryItemWhereInput>
  }, "id">

  export type ReservationOrderByWithAggregationInput = {
    id?: SortOrder
    itemId?: SortOrder
    orderId?: SortOrder
    quantity?: SortOrder
    status?: SortOrder
    reservedAt?: SortOrder
    expiresAt?: SortOrderInput | SortOrder
    confirmedAt?: SortOrderInput | SortOrder
    cancelledAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ReservationCountOrderByAggregateInput
    _avg?: ReservationAvgOrderByAggregateInput
    _max?: ReservationMaxOrderByAggregateInput
    _min?: ReservationMinOrderByAggregateInput
    _sum?: ReservationSumOrderByAggregateInput
  }

  export type ReservationScalarWhereWithAggregatesInput = {
    AND?: ReservationScalarWhereWithAggregatesInput | ReservationScalarWhereWithAggregatesInput[]
    OR?: ReservationScalarWhereWithAggregatesInput[]
    NOT?: ReservationScalarWhereWithAggregatesInput | ReservationScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"Reservation"> | bigint | number
    itemId?: BigIntWithAggregatesFilter<"Reservation"> | bigint | number
    orderId?: StringWithAggregatesFilter<"Reservation"> | string
    quantity?: DecimalWithAggregatesFilter<"Reservation"> | Decimal | DecimalJsLike | number | string
    status?: EnumReservationStatusWithAggregatesFilter<"Reservation"> | $Enums.ReservationStatus
    reservedAt?: DateTimeWithAggregatesFilter<"Reservation"> | Date | string
    expiresAt?: DateTimeNullableWithAggregatesFilter<"Reservation"> | Date | string | null
    confirmedAt?: DateTimeNullableWithAggregatesFilter<"Reservation"> | Date | string | null
    cancelledAt?: DateTimeNullableWithAggregatesFilter<"Reservation"> | Date | string | null
    notes?: StringNullableWithAggregatesFilter<"Reservation"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Reservation"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Reservation"> | Date | string
  }

  export type InventoryMovementWhereInput = {
    AND?: InventoryMovementWhereInput | InventoryMovementWhereInput[]
    OR?: InventoryMovementWhereInput[]
    NOT?: InventoryMovementWhereInput | InventoryMovementWhereInput[]
    id?: BigIntFilter<"InventoryMovement"> | bigint | number
    itemId?: BigIntFilter<"InventoryMovement"> | bigint | number
    warehouseId?: BigIntFilter<"InventoryMovement"> | bigint | number
    categoryId?: BigIntFilter<"InventoryMovement"> | bigint | number
    movementType?: EnumMovementTypeFilter<"InventoryMovement"> | $Enums.MovementType
    direction?: EnumMovementDirectionFilter<"InventoryMovement"> | $Enums.MovementDirection
    quantity?: DecimalFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalNullableFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string | null
    totalAmount?: DecimalNullableFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string
    referenceType?: StringNullableFilter<"InventoryMovement"> | string | null
    referenceId?: BigIntNullableFilter<"InventoryMovement"> | bigint | number | null
    referenceNo?: StringNullableFilter<"InventoryMovement"> | string | null
    operatorId?: BigIntNullableFilter<"InventoryMovement"> | bigint | number | null
    operatorName?: StringNullableFilter<"InventoryMovement"> | string | null
    remark?: StringNullableFilter<"InventoryMovement"> | string | null
    createdAt?: DateTimeFilter<"InventoryMovement"> | Date | string
    item?: XOR<InventoryItemRelationFilter, InventoryItemWhereInput>
    warehouse?: XOR<WarehouseRelationFilter, WarehouseWhereInput>
    category?: XOR<ItemCategoryRelationFilter, ItemCategoryWhereInput>
  }

  export type InventoryMovementOrderByWithRelationInput = {
    id?: SortOrder
    itemId?: SortOrder
    warehouseId?: SortOrder
    categoryId?: SortOrder
    movementType?: SortOrder
    direction?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrderInput | SortOrder
    totalAmount?: SortOrderInput | SortOrder
    beforeQty?: SortOrder
    afterQty?: SortOrder
    referenceType?: SortOrderInput | SortOrder
    referenceId?: SortOrderInput | SortOrder
    referenceNo?: SortOrderInput | SortOrder
    operatorId?: SortOrderInput | SortOrder
    operatorName?: SortOrderInput | SortOrder
    remark?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    item?: InventoryItemOrderByWithRelationInput
    warehouse?: WarehouseOrderByWithRelationInput
    category?: ItemCategoryOrderByWithRelationInput
  }

  export type InventoryMovementWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    AND?: InventoryMovementWhereInput | InventoryMovementWhereInput[]
    OR?: InventoryMovementWhereInput[]
    NOT?: InventoryMovementWhereInput | InventoryMovementWhereInput[]
    itemId?: BigIntFilter<"InventoryMovement"> | bigint | number
    warehouseId?: BigIntFilter<"InventoryMovement"> | bigint | number
    categoryId?: BigIntFilter<"InventoryMovement"> | bigint | number
    movementType?: EnumMovementTypeFilter<"InventoryMovement"> | $Enums.MovementType
    direction?: EnumMovementDirectionFilter<"InventoryMovement"> | $Enums.MovementDirection
    quantity?: DecimalFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalNullableFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string | null
    totalAmount?: DecimalNullableFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string
    referenceType?: StringNullableFilter<"InventoryMovement"> | string | null
    referenceId?: BigIntNullableFilter<"InventoryMovement"> | bigint | number | null
    referenceNo?: StringNullableFilter<"InventoryMovement"> | string | null
    operatorId?: BigIntNullableFilter<"InventoryMovement"> | bigint | number | null
    operatorName?: StringNullableFilter<"InventoryMovement"> | string | null
    remark?: StringNullableFilter<"InventoryMovement"> | string | null
    createdAt?: DateTimeFilter<"InventoryMovement"> | Date | string
    item?: XOR<InventoryItemRelationFilter, InventoryItemWhereInput>
    warehouse?: XOR<WarehouseRelationFilter, WarehouseWhereInput>
    category?: XOR<ItemCategoryRelationFilter, ItemCategoryWhereInput>
  }, "id">

  export type InventoryMovementOrderByWithAggregationInput = {
    id?: SortOrder
    itemId?: SortOrder
    warehouseId?: SortOrder
    categoryId?: SortOrder
    movementType?: SortOrder
    direction?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrderInput | SortOrder
    totalAmount?: SortOrderInput | SortOrder
    beforeQty?: SortOrder
    afterQty?: SortOrder
    referenceType?: SortOrderInput | SortOrder
    referenceId?: SortOrderInput | SortOrder
    referenceNo?: SortOrderInput | SortOrder
    operatorId?: SortOrderInput | SortOrder
    operatorName?: SortOrderInput | SortOrder
    remark?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: InventoryMovementCountOrderByAggregateInput
    _avg?: InventoryMovementAvgOrderByAggregateInput
    _max?: InventoryMovementMaxOrderByAggregateInput
    _min?: InventoryMovementMinOrderByAggregateInput
    _sum?: InventoryMovementSumOrderByAggregateInput
  }

  export type InventoryMovementScalarWhereWithAggregatesInput = {
    AND?: InventoryMovementScalarWhereWithAggregatesInput | InventoryMovementScalarWhereWithAggregatesInput[]
    OR?: InventoryMovementScalarWhereWithAggregatesInput[]
    NOT?: InventoryMovementScalarWhereWithAggregatesInput | InventoryMovementScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"InventoryMovement"> | bigint | number
    itemId?: BigIntWithAggregatesFilter<"InventoryMovement"> | bigint | number
    warehouseId?: BigIntWithAggregatesFilter<"InventoryMovement"> | bigint | number
    categoryId?: BigIntWithAggregatesFilter<"InventoryMovement"> | bigint | number
    movementType?: EnumMovementTypeWithAggregatesFilter<"InventoryMovement"> | $Enums.MovementType
    direction?: EnumMovementDirectionWithAggregatesFilter<"InventoryMovement"> | $Enums.MovementDirection
    quantity?: DecimalWithAggregatesFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalNullableWithAggregatesFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string | null
    totalAmount?: DecimalNullableWithAggregatesFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalWithAggregatesFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalWithAggregatesFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string
    referenceType?: StringNullableWithAggregatesFilter<"InventoryMovement"> | string | null
    referenceId?: BigIntNullableWithAggregatesFilter<"InventoryMovement"> | bigint | number | null
    referenceNo?: StringNullableWithAggregatesFilter<"InventoryMovement"> | string | null
    operatorId?: BigIntNullableWithAggregatesFilter<"InventoryMovement"> | bigint | number | null
    operatorName?: StringNullableWithAggregatesFilter<"InventoryMovement"> | string | null
    remark?: StringNullableWithAggregatesFilter<"InventoryMovement"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"InventoryMovement"> | Date | string
  }

  export type PricingRuleWhereInput = {
    AND?: PricingRuleWhereInput | PricingRuleWhereInput[]
    OR?: PricingRuleWhereInput[]
    NOT?: PricingRuleWhereInput | PricingRuleWhereInput[]
    id?: BigIntFilter<"PricingRule"> | bigint | number
    categoryId?: BigIntFilter<"PricingRule"> | bigint | number
    regionCode?: StringNullableFilter<"PricingRule"> | string | null
    priceType?: EnumPriceTypeFilter<"PricingRule"> | $Enums.PriceType
    basePrice?: DecimalFilter<"PricingRule"> | Decimal | DecimalJsLike | number | string
    unit?: StringFilter<"PricingRule"> | string
    weightTiers?: JsonNullableFilter<"PricingRule">
    qualityFactors?: JsonNullableFilter<"PricingRule">
    seasonFactors?: JsonNullableFilter<"PricingRule">
    enabled?: BoolFilter<"PricingRule"> | boolean
    validFrom?: DateTimeFilter<"PricingRule"> | Date | string
    validTo?: DateTimeNullableFilter<"PricingRule"> | Date | string | null
    createdAt?: DateTimeFilter<"PricingRule"> | Date | string
    updatedAt?: DateTimeFilter<"PricingRule"> | Date | string
    category?: XOR<ItemCategoryRelationFilter, ItemCategoryWhereInput>
  }

  export type PricingRuleOrderByWithRelationInput = {
    id?: SortOrder
    categoryId?: SortOrder
    regionCode?: SortOrderInput | SortOrder
    priceType?: SortOrder
    basePrice?: SortOrder
    unit?: SortOrder
    weightTiers?: SortOrderInput | SortOrder
    qualityFactors?: SortOrderInput | SortOrder
    seasonFactors?: SortOrderInput | SortOrder
    enabled?: SortOrder
    validFrom?: SortOrder
    validTo?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    category?: ItemCategoryOrderByWithRelationInput
  }

  export type PricingRuleWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    AND?: PricingRuleWhereInput | PricingRuleWhereInput[]
    OR?: PricingRuleWhereInput[]
    NOT?: PricingRuleWhereInput | PricingRuleWhereInput[]
    categoryId?: BigIntFilter<"PricingRule"> | bigint | number
    regionCode?: StringNullableFilter<"PricingRule"> | string | null
    priceType?: EnumPriceTypeFilter<"PricingRule"> | $Enums.PriceType
    basePrice?: DecimalFilter<"PricingRule"> | Decimal | DecimalJsLike | number | string
    unit?: StringFilter<"PricingRule"> | string
    weightTiers?: JsonNullableFilter<"PricingRule">
    qualityFactors?: JsonNullableFilter<"PricingRule">
    seasonFactors?: JsonNullableFilter<"PricingRule">
    enabled?: BoolFilter<"PricingRule"> | boolean
    validFrom?: DateTimeFilter<"PricingRule"> | Date | string
    validTo?: DateTimeNullableFilter<"PricingRule"> | Date | string | null
    createdAt?: DateTimeFilter<"PricingRule"> | Date | string
    updatedAt?: DateTimeFilter<"PricingRule"> | Date | string
    category?: XOR<ItemCategoryRelationFilter, ItemCategoryWhereInput>
  }, "id">

  export type PricingRuleOrderByWithAggregationInput = {
    id?: SortOrder
    categoryId?: SortOrder
    regionCode?: SortOrderInput | SortOrder
    priceType?: SortOrder
    basePrice?: SortOrder
    unit?: SortOrder
    weightTiers?: SortOrderInput | SortOrder
    qualityFactors?: SortOrderInput | SortOrder
    seasonFactors?: SortOrderInput | SortOrder
    enabled?: SortOrder
    validFrom?: SortOrder
    validTo?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PricingRuleCountOrderByAggregateInput
    _avg?: PricingRuleAvgOrderByAggregateInput
    _max?: PricingRuleMaxOrderByAggregateInput
    _min?: PricingRuleMinOrderByAggregateInput
    _sum?: PricingRuleSumOrderByAggregateInput
  }

  export type PricingRuleScalarWhereWithAggregatesInput = {
    AND?: PricingRuleScalarWhereWithAggregatesInput | PricingRuleScalarWhereWithAggregatesInput[]
    OR?: PricingRuleScalarWhereWithAggregatesInput[]
    NOT?: PricingRuleScalarWhereWithAggregatesInput | PricingRuleScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"PricingRule"> | bigint | number
    categoryId?: BigIntWithAggregatesFilter<"PricingRule"> | bigint | number
    regionCode?: StringNullableWithAggregatesFilter<"PricingRule"> | string | null
    priceType?: EnumPriceTypeWithAggregatesFilter<"PricingRule"> | $Enums.PriceType
    basePrice?: DecimalWithAggregatesFilter<"PricingRule"> | Decimal | DecimalJsLike | number | string
    unit?: StringWithAggregatesFilter<"PricingRule"> | string
    weightTiers?: JsonNullableWithAggregatesFilter<"PricingRule">
    qualityFactors?: JsonNullableWithAggregatesFilter<"PricingRule">
    seasonFactors?: JsonNullableWithAggregatesFilter<"PricingRule">
    enabled?: BoolWithAggregatesFilter<"PricingRule"> | boolean
    validFrom?: DateTimeWithAggregatesFilter<"PricingRule"> | Date | string
    validTo?: DateTimeNullableWithAggregatesFilter<"PricingRule"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"PricingRule"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"PricingRule"> | Date | string
  }

  export type InventoryAlertWhereInput = {
    AND?: InventoryAlertWhereInput | InventoryAlertWhereInput[]
    OR?: InventoryAlertWhereInput[]
    NOT?: InventoryAlertWhereInput | InventoryAlertWhereInput[]
    id?: BigIntFilter<"InventoryAlert"> | bigint | number
    itemId?: BigIntFilter<"InventoryAlert"> | bigint | number
    alertType?: EnumAlertTypeFilter<"InventoryAlert"> | $Enums.AlertType
    alertLevel?: EnumAlertLevelFilter<"InventoryAlert"> | $Enums.AlertLevel
    currentQty?: DecimalFilter<"InventoryAlert"> | Decimal | DecimalJsLike | number | string
    thresholdQty?: DecimalFilter<"InventoryAlert"> | Decimal | DecimalJsLike | number | string
    message?: StringFilter<"InventoryAlert"> | string
    status?: EnumAlertStatusFilter<"InventoryAlert"> | $Enums.AlertStatus
    handledBy?: BigIntNullableFilter<"InventoryAlert"> | bigint | number | null
    handledAt?: DateTimeNullableFilter<"InventoryAlert"> | Date | string | null
    handlerRemark?: StringNullableFilter<"InventoryAlert"> | string | null
    createdAt?: DateTimeFilter<"InventoryAlert"> | Date | string
    updatedAt?: DateTimeFilter<"InventoryAlert"> | Date | string
  }

  export type InventoryAlertOrderByWithRelationInput = {
    id?: SortOrder
    itemId?: SortOrder
    alertType?: SortOrder
    alertLevel?: SortOrder
    currentQty?: SortOrder
    thresholdQty?: SortOrder
    message?: SortOrder
    status?: SortOrder
    handledBy?: SortOrderInput | SortOrder
    handledAt?: SortOrderInput | SortOrder
    handlerRemark?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InventoryAlertWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    AND?: InventoryAlertWhereInput | InventoryAlertWhereInput[]
    OR?: InventoryAlertWhereInput[]
    NOT?: InventoryAlertWhereInput | InventoryAlertWhereInput[]
    itemId?: BigIntFilter<"InventoryAlert"> | bigint | number
    alertType?: EnumAlertTypeFilter<"InventoryAlert"> | $Enums.AlertType
    alertLevel?: EnumAlertLevelFilter<"InventoryAlert"> | $Enums.AlertLevel
    currentQty?: DecimalFilter<"InventoryAlert"> | Decimal | DecimalJsLike | number | string
    thresholdQty?: DecimalFilter<"InventoryAlert"> | Decimal | DecimalJsLike | number | string
    message?: StringFilter<"InventoryAlert"> | string
    status?: EnumAlertStatusFilter<"InventoryAlert"> | $Enums.AlertStatus
    handledBy?: BigIntNullableFilter<"InventoryAlert"> | bigint | number | null
    handledAt?: DateTimeNullableFilter<"InventoryAlert"> | Date | string | null
    handlerRemark?: StringNullableFilter<"InventoryAlert"> | string | null
    createdAt?: DateTimeFilter<"InventoryAlert"> | Date | string
    updatedAt?: DateTimeFilter<"InventoryAlert"> | Date | string
  }, "id">

  export type InventoryAlertOrderByWithAggregationInput = {
    id?: SortOrder
    itemId?: SortOrder
    alertType?: SortOrder
    alertLevel?: SortOrder
    currentQty?: SortOrder
    thresholdQty?: SortOrder
    message?: SortOrder
    status?: SortOrder
    handledBy?: SortOrderInput | SortOrder
    handledAt?: SortOrderInput | SortOrder
    handlerRemark?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: InventoryAlertCountOrderByAggregateInput
    _avg?: InventoryAlertAvgOrderByAggregateInput
    _max?: InventoryAlertMaxOrderByAggregateInput
    _min?: InventoryAlertMinOrderByAggregateInput
    _sum?: InventoryAlertSumOrderByAggregateInput
  }

  export type InventoryAlertScalarWhereWithAggregatesInput = {
    AND?: InventoryAlertScalarWhereWithAggregatesInput | InventoryAlertScalarWhereWithAggregatesInput[]
    OR?: InventoryAlertScalarWhereWithAggregatesInput[]
    NOT?: InventoryAlertScalarWhereWithAggregatesInput | InventoryAlertScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"InventoryAlert"> | bigint | number
    itemId?: BigIntWithAggregatesFilter<"InventoryAlert"> | bigint | number
    alertType?: EnumAlertTypeWithAggregatesFilter<"InventoryAlert"> | $Enums.AlertType
    alertLevel?: EnumAlertLevelWithAggregatesFilter<"InventoryAlert"> | $Enums.AlertLevel
    currentQty?: DecimalWithAggregatesFilter<"InventoryAlert"> | Decimal | DecimalJsLike | number | string
    thresholdQty?: DecimalWithAggregatesFilter<"InventoryAlert"> | Decimal | DecimalJsLike | number | string
    message?: StringWithAggregatesFilter<"InventoryAlert"> | string
    status?: EnumAlertStatusWithAggregatesFilter<"InventoryAlert"> | $Enums.AlertStatus
    handledBy?: BigIntNullableWithAggregatesFilter<"InventoryAlert"> | bigint | number | null
    handledAt?: DateTimeNullableWithAggregatesFilter<"InventoryAlert"> | Date | string | null
    handlerRemark?: StringNullableWithAggregatesFilter<"InventoryAlert"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"InventoryAlert"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"InventoryAlert"> | Date | string
  }

  export type WarehouseCreateInput = {
    id?: bigint | number
    name: string
    code: string
    type?: $Enums.WarehouseType
    address: string
    contactName?: string | null
    contactPhone?: string | null
    capacity?: Decimal | DecimalJsLike | number | string | null
    status?: $Enums.WarehouseStatus
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    inventoryItems?: InventoryItemCreateNestedManyWithoutWarehouseInput
    movements?: InventoryMovementCreateNestedManyWithoutWarehouseInput
  }

  export type WarehouseUncheckedCreateInput = {
    id?: bigint | number
    name: string
    code: string
    type?: $Enums.WarehouseType
    address: string
    contactName?: string | null
    contactPhone?: string | null
    capacity?: Decimal | DecimalJsLike | number | string | null
    status?: $Enums.WarehouseStatus
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    inventoryItems?: InventoryItemUncheckedCreateNestedManyWithoutWarehouseInput
    movements?: InventoryMovementUncheckedCreateNestedManyWithoutWarehouseInput
  }

  export type WarehouseUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    type?: EnumWarehouseTypeFieldUpdateOperationsInput | $Enums.WarehouseType
    address?: StringFieldUpdateOperationsInput | string
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    capacity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    status?: EnumWarehouseStatusFieldUpdateOperationsInput | $Enums.WarehouseStatus
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    inventoryItems?: InventoryItemUpdateManyWithoutWarehouseNestedInput
    movements?: InventoryMovementUpdateManyWithoutWarehouseNestedInput
  }

  export type WarehouseUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    type?: EnumWarehouseTypeFieldUpdateOperationsInput | $Enums.WarehouseType
    address?: StringFieldUpdateOperationsInput | string
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    capacity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    status?: EnumWarehouseStatusFieldUpdateOperationsInput | $Enums.WarehouseStatus
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    inventoryItems?: InventoryItemUncheckedUpdateManyWithoutWarehouseNestedInput
    movements?: InventoryMovementUncheckedUpdateManyWithoutWarehouseNestedInput
  }

  export type WarehouseCreateManyInput = {
    id?: bigint | number
    name: string
    code: string
    type?: $Enums.WarehouseType
    address: string
    contactName?: string | null
    contactPhone?: string | null
    capacity?: Decimal | DecimalJsLike | number | string | null
    status?: $Enums.WarehouseStatus
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WarehouseUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    type?: EnumWarehouseTypeFieldUpdateOperationsInput | $Enums.WarehouseType
    address?: StringFieldUpdateOperationsInput | string
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    capacity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    status?: EnumWarehouseStatusFieldUpdateOperationsInput | $Enums.WarehouseStatus
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WarehouseUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    type?: EnumWarehouseTypeFieldUpdateOperationsInput | $Enums.WarehouseType
    address?: StringFieldUpdateOperationsInput | string
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    capacity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    status?: EnumWarehouseStatusFieldUpdateOperationsInput | $Enums.WarehouseStatus
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemCategoryCreateInput = {
    id?: bigint | number
    name: string
    code: string
    level?: number
    enabled?: boolean
    iconUrl?: string | null
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: ItemCategoryCreateNestedOneWithoutChildrenInput
    children?: ItemCategoryCreateNestedManyWithoutParentInput
    inventoryItems?: InventoryItemCreateNestedManyWithoutCategoryInput
    movements?: InventoryMovementCreateNestedManyWithoutCategoryInput
    pricingRules?: PricingRuleCreateNestedManyWithoutCategoryInput
  }

  export type ItemCategoryUncheckedCreateInput = {
    id?: bigint | number
    name: string
    code: string
    parentId?: bigint | number | null
    level?: number
    enabled?: boolean
    iconUrl?: string | null
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: ItemCategoryUncheckedCreateNestedManyWithoutParentInput
    inventoryItems?: InventoryItemUncheckedCreateNestedManyWithoutCategoryInput
    movements?: InventoryMovementUncheckedCreateNestedManyWithoutCategoryInput
    pricingRules?: PricingRuleUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type ItemCategoryUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: ItemCategoryUpdateOneWithoutChildrenNestedInput
    children?: ItemCategoryUpdateManyWithoutParentNestedInput
    inventoryItems?: InventoryItemUpdateManyWithoutCategoryNestedInput
    movements?: InventoryMovementUpdateManyWithoutCategoryNestedInput
    pricingRules?: PricingRuleUpdateManyWithoutCategoryNestedInput
  }

  export type ItemCategoryUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    level?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: ItemCategoryUncheckedUpdateManyWithoutParentNestedInput
    inventoryItems?: InventoryItemUncheckedUpdateManyWithoutCategoryNestedInput
    movements?: InventoryMovementUncheckedUpdateManyWithoutCategoryNestedInput
    pricingRules?: PricingRuleUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type ItemCategoryCreateManyInput = {
    id?: bigint | number
    name: string
    code: string
    parentId?: bigint | number | null
    level?: number
    enabled?: boolean
    iconUrl?: string | null
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ItemCategoryUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemCategoryUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    level?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryItemCreateInput = {
    id?: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    warehouse: WarehouseCreateNestedOneWithoutInventoryItemsInput
    category: ItemCategoryCreateNestedOneWithoutInventoryItemsInput
    transactions?: InventoryTransactionCreateNestedManyWithoutItemInput
    salesRecords?: SalesRecordCreateNestedManyWithoutItemInput
    qualityChecks?: QualityCheckCreateNestedManyWithoutItemInput
    movements?: InventoryMovementCreateNestedManyWithoutItemInput
    reservations?: ReservationCreateNestedManyWithoutItemInput
  }

  export type InventoryItemUncheckedCreateInput = {
    id?: bigint | number
    warehouseId: bigint | number
    categoryId: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    transactions?: InventoryTransactionUncheckedCreateNestedManyWithoutItemInput
    salesRecords?: SalesRecordUncheckedCreateNestedManyWithoutItemInput
    qualityChecks?: QualityCheckUncheckedCreateNestedManyWithoutItemInput
    movements?: InventoryMovementUncheckedCreateNestedManyWithoutItemInput
    reservations?: ReservationUncheckedCreateNestedManyWithoutItemInput
  }

  export type InventoryItemUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    warehouse?: WarehouseUpdateOneRequiredWithoutInventoryItemsNestedInput
    category?: ItemCategoryUpdateOneRequiredWithoutInventoryItemsNestedInput
    transactions?: InventoryTransactionUpdateManyWithoutItemNestedInput
    salesRecords?: SalesRecordUpdateManyWithoutItemNestedInput
    qualityChecks?: QualityCheckUpdateManyWithoutItemNestedInput
    movements?: InventoryMovementUpdateManyWithoutItemNestedInput
    reservations?: ReservationUpdateManyWithoutItemNestedInput
  }

  export type InventoryItemUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    warehouseId?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactions?: InventoryTransactionUncheckedUpdateManyWithoutItemNestedInput
    salesRecords?: SalesRecordUncheckedUpdateManyWithoutItemNestedInput
    qualityChecks?: QualityCheckUncheckedUpdateManyWithoutItemNestedInput
    movements?: InventoryMovementUncheckedUpdateManyWithoutItemNestedInput
    reservations?: ReservationUncheckedUpdateManyWithoutItemNestedInput
  }

  export type InventoryItemCreateManyInput = {
    id?: bigint | number
    warehouseId: bigint | number
    categoryId: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InventoryItemUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryItemUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    warehouseId?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryTransactionCreateInput = {
    id?: bigint | number
    type: $Enums.TransactionType
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    referenceId?: string | null
    notes?: string | null
    createdAt?: Date | string
    item: InventoryItemCreateNestedOneWithoutTransactionsInput
  }

  export type InventoryTransactionUncheckedCreateInput = {
    id?: bigint | number
    itemId: bigint | number
    type: $Enums.TransactionType
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    referenceId?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type InventoryTransactionUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    item?: InventoryItemUpdateOneRequiredWithoutTransactionsNestedInput
  }

  export type InventoryTransactionUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryTransactionCreateManyInput = {
    id?: bigint | number
    itemId: bigint | number
    type: $Enums.TransactionType
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    referenceId?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type InventoryTransactionUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryTransactionUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SalesRecordCreateInput = {
    id?: bigint | number
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    orderId: string
    customerId: bigint | number
    soldAt: Date | string
    notes?: string | null
    createdAt?: Date | string
    item: InventoryItemCreateNestedOneWithoutSalesRecordsInput
  }

  export type SalesRecordUncheckedCreateInput = {
    id?: bigint | number
    itemId: bigint | number
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    orderId: string
    customerId: bigint | number
    soldAt: Date | string
    notes?: string | null
    createdAt?: Date | string
  }

  export type SalesRecordUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderId?: StringFieldUpdateOperationsInput | string
    customerId?: BigIntFieldUpdateOperationsInput | bigint | number
    soldAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    item?: InventoryItemUpdateOneRequiredWithoutSalesRecordsNestedInput
  }

  export type SalesRecordUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderId?: StringFieldUpdateOperationsInput | string
    customerId?: BigIntFieldUpdateOperationsInput | bigint | number
    soldAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SalesRecordCreateManyInput = {
    id?: bigint | number
    itemId: bigint | number
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    orderId: string
    customerId: bigint | number
    soldAt: Date | string
    notes?: string | null
    createdAt?: Date | string
  }

  export type SalesRecordUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderId?: StringFieldUpdateOperationsInput | string
    customerId?: BigIntFieldUpdateOperationsInput | bigint | number
    soldAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SalesRecordUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderId?: StringFieldUpdateOperationsInput | string
    customerId?: BigIntFieldUpdateOperationsInput | bigint | number
    soldAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QualityCheckCreateInput = {
    id?: bigint | number
    checkerId: bigint | number
    checkType: $Enums.CheckType
    result: $Enums.CheckResult
    score?: number | null
    notes?: string | null
    images?: QualityCheckCreateimagesInput | string[]
    checkedAt: Date | string
    createdAt?: Date | string
    item: InventoryItemCreateNestedOneWithoutQualityChecksInput
  }

  export type QualityCheckUncheckedCreateInput = {
    id?: bigint | number
    itemId: bigint | number
    checkerId: bigint | number
    checkType: $Enums.CheckType
    result: $Enums.CheckResult
    score?: number | null
    notes?: string | null
    images?: QualityCheckCreateimagesInput | string[]
    checkedAt: Date | string
    createdAt?: Date | string
  }

  export type QualityCheckUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    checkerId?: BigIntFieldUpdateOperationsInput | bigint | number
    checkType?: EnumCheckTypeFieldUpdateOperationsInput | $Enums.CheckType
    result?: EnumCheckResultFieldUpdateOperationsInput | $Enums.CheckResult
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    images?: QualityCheckUpdateimagesInput | string[]
    checkedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    item?: InventoryItemUpdateOneRequiredWithoutQualityChecksNestedInput
  }

  export type QualityCheckUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    checkerId?: BigIntFieldUpdateOperationsInput | bigint | number
    checkType?: EnumCheckTypeFieldUpdateOperationsInput | $Enums.CheckType
    result?: EnumCheckResultFieldUpdateOperationsInput | $Enums.CheckResult
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    images?: QualityCheckUpdateimagesInput | string[]
    checkedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QualityCheckCreateManyInput = {
    id?: bigint | number
    itemId: bigint | number
    checkerId: bigint | number
    checkType: $Enums.CheckType
    result: $Enums.CheckResult
    score?: number | null
    notes?: string | null
    images?: QualityCheckCreateimagesInput | string[]
    checkedAt: Date | string
    createdAt?: Date | string
  }

  export type QualityCheckUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    checkerId?: BigIntFieldUpdateOperationsInput | bigint | number
    checkType?: EnumCheckTypeFieldUpdateOperationsInput | $Enums.CheckType
    result?: EnumCheckResultFieldUpdateOperationsInput | $Enums.CheckResult
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    images?: QualityCheckUpdateimagesInput | string[]
    checkedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QualityCheckUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    checkerId?: BigIntFieldUpdateOperationsInput | bigint | number
    checkType?: EnumCheckTypeFieldUpdateOperationsInput | $Enums.CheckType
    result?: EnumCheckResultFieldUpdateOperationsInput | $Enums.CheckResult
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    images?: QualityCheckUpdateimagesInput | string[]
    checkedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReservationCreateInput = {
    id?: bigint | number
    orderId: string
    quantity: Decimal | DecimalJsLike | number | string
    status?: $Enums.ReservationStatus
    reservedAt?: Date | string
    expiresAt?: Date | string | null
    confirmedAt?: Date | string | null
    cancelledAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    item: InventoryItemCreateNestedOneWithoutReservationsInput
  }

  export type ReservationUncheckedCreateInput = {
    id?: bigint | number
    itemId: bigint | number
    orderId: string
    quantity: Decimal | DecimalJsLike | number | string
    status?: $Enums.ReservationStatus
    reservedAt?: Date | string
    expiresAt?: Date | string | null
    confirmedAt?: Date | string | null
    cancelledAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReservationUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    orderId?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumReservationStatusFieldUpdateOperationsInput | $Enums.ReservationStatus
    reservedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    item?: InventoryItemUpdateOneRequiredWithoutReservationsNestedInput
  }

  export type ReservationUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    orderId?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumReservationStatusFieldUpdateOperationsInput | $Enums.ReservationStatus
    reservedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReservationCreateManyInput = {
    id?: bigint | number
    itemId: bigint | number
    orderId: string
    quantity: Decimal | DecimalJsLike | number | string
    status?: $Enums.ReservationStatus
    reservedAt?: Date | string
    expiresAt?: Date | string | null
    confirmedAt?: Date | string | null
    cancelledAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReservationUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    orderId?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumReservationStatusFieldUpdateOperationsInput | $Enums.ReservationStatus
    reservedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReservationUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    orderId?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumReservationStatusFieldUpdateOperationsInput | $Enums.ReservationStatus
    reservedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryMovementCreateInput = {
    id?: bigint | number
    movementType: $Enums.MovementType
    direction: $Enums.MovementDirection
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice?: Decimal | DecimalJsLike | number | string | null
    totalAmount?: Decimal | DecimalJsLike | number | string | null
    beforeQty: Decimal | DecimalJsLike | number | string
    afterQty: Decimal | DecimalJsLike | number | string
    referenceType?: string | null
    referenceId?: bigint | number | null
    referenceNo?: string | null
    operatorId?: bigint | number | null
    operatorName?: string | null
    remark?: string | null
    createdAt?: Date | string
    item: InventoryItemCreateNestedOneWithoutMovementsInput
    warehouse: WarehouseCreateNestedOneWithoutMovementsInput
    category: ItemCategoryCreateNestedOneWithoutMovementsInput
  }

  export type InventoryMovementUncheckedCreateInput = {
    id?: bigint | number
    itemId: bigint | number
    warehouseId: bigint | number
    categoryId: bigint | number
    movementType: $Enums.MovementType
    direction: $Enums.MovementDirection
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice?: Decimal | DecimalJsLike | number | string | null
    totalAmount?: Decimal | DecimalJsLike | number | string | null
    beforeQty: Decimal | DecimalJsLike | number | string
    afterQty: Decimal | DecimalJsLike | number | string
    referenceType?: string | null
    referenceId?: bigint | number | null
    referenceNo?: string | null
    operatorId?: bigint | number | null
    operatorName?: string | null
    remark?: string | null
    createdAt?: Date | string
  }

  export type InventoryMovementUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    movementType?: EnumMovementTypeFieldUpdateOperationsInput | $Enums.MovementType
    direction?: EnumMovementDirectionFieldUpdateOperationsInput | $Enums.MovementDirection
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    referenceNo?: NullableStringFieldUpdateOperationsInput | string | null
    operatorId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    item?: InventoryItemUpdateOneRequiredWithoutMovementsNestedInput
    warehouse?: WarehouseUpdateOneRequiredWithoutMovementsNestedInput
    category?: ItemCategoryUpdateOneRequiredWithoutMovementsNestedInput
  }

  export type InventoryMovementUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    warehouseId?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    movementType?: EnumMovementTypeFieldUpdateOperationsInput | $Enums.MovementType
    direction?: EnumMovementDirectionFieldUpdateOperationsInput | $Enums.MovementDirection
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    referenceNo?: NullableStringFieldUpdateOperationsInput | string | null
    operatorId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryMovementCreateManyInput = {
    id?: bigint | number
    itemId: bigint | number
    warehouseId: bigint | number
    categoryId: bigint | number
    movementType: $Enums.MovementType
    direction: $Enums.MovementDirection
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice?: Decimal | DecimalJsLike | number | string | null
    totalAmount?: Decimal | DecimalJsLike | number | string | null
    beforeQty: Decimal | DecimalJsLike | number | string
    afterQty: Decimal | DecimalJsLike | number | string
    referenceType?: string | null
    referenceId?: bigint | number | null
    referenceNo?: string | null
    operatorId?: bigint | number | null
    operatorName?: string | null
    remark?: string | null
    createdAt?: Date | string
  }

  export type InventoryMovementUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    movementType?: EnumMovementTypeFieldUpdateOperationsInput | $Enums.MovementType
    direction?: EnumMovementDirectionFieldUpdateOperationsInput | $Enums.MovementDirection
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    referenceNo?: NullableStringFieldUpdateOperationsInput | string | null
    operatorId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryMovementUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    warehouseId?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    movementType?: EnumMovementTypeFieldUpdateOperationsInput | $Enums.MovementType
    direction?: EnumMovementDirectionFieldUpdateOperationsInput | $Enums.MovementDirection
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    referenceNo?: NullableStringFieldUpdateOperationsInput | string | null
    operatorId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PricingRuleCreateInput = {
    id?: bigint | number
    regionCode?: string | null
    priceType: $Enums.PriceType
    basePrice: Decimal | DecimalJsLike | number | string
    unit?: string
    weightTiers?: NullableJsonNullValueInput | InputJsonValue
    qualityFactors?: NullableJsonNullValueInput | InputJsonValue
    seasonFactors?: NullableJsonNullValueInput | InputJsonValue
    enabled?: boolean
    validFrom: Date | string
    validTo?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category: ItemCategoryCreateNestedOneWithoutPricingRulesInput
  }

  export type PricingRuleUncheckedCreateInput = {
    id?: bigint | number
    categoryId: bigint | number
    regionCode?: string | null
    priceType: $Enums.PriceType
    basePrice: Decimal | DecimalJsLike | number | string
    unit?: string
    weightTiers?: NullableJsonNullValueInput | InputJsonValue
    qualityFactors?: NullableJsonNullValueInput | InputJsonValue
    seasonFactors?: NullableJsonNullValueInput | InputJsonValue
    enabled?: boolean
    validFrom: Date | string
    validTo?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PricingRuleUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    regionCode?: NullableStringFieldUpdateOperationsInput | string | null
    priceType?: EnumPriceTypeFieldUpdateOperationsInput | $Enums.PriceType
    basePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unit?: StringFieldUpdateOperationsInput | string
    weightTiers?: NullableJsonNullValueInput | InputJsonValue
    qualityFactors?: NullableJsonNullValueInput | InputJsonValue
    seasonFactors?: NullableJsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: DateTimeFieldUpdateOperationsInput | Date | string
    validTo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: ItemCategoryUpdateOneRequiredWithoutPricingRulesNestedInput
  }

  export type PricingRuleUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    regionCode?: NullableStringFieldUpdateOperationsInput | string | null
    priceType?: EnumPriceTypeFieldUpdateOperationsInput | $Enums.PriceType
    basePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unit?: StringFieldUpdateOperationsInput | string
    weightTiers?: NullableJsonNullValueInput | InputJsonValue
    qualityFactors?: NullableJsonNullValueInput | InputJsonValue
    seasonFactors?: NullableJsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: DateTimeFieldUpdateOperationsInput | Date | string
    validTo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PricingRuleCreateManyInput = {
    id?: bigint | number
    categoryId: bigint | number
    regionCode?: string | null
    priceType: $Enums.PriceType
    basePrice: Decimal | DecimalJsLike | number | string
    unit?: string
    weightTiers?: NullableJsonNullValueInput | InputJsonValue
    qualityFactors?: NullableJsonNullValueInput | InputJsonValue
    seasonFactors?: NullableJsonNullValueInput | InputJsonValue
    enabled?: boolean
    validFrom: Date | string
    validTo?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PricingRuleUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    regionCode?: NullableStringFieldUpdateOperationsInput | string | null
    priceType?: EnumPriceTypeFieldUpdateOperationsInput | $Enums.PriceType
    basePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unit?: StringFieldUpdateOperationsInput | string
    weightTiers?: NullableJsonNullValueInput | InputJsonValue
    qualityFactors?: NullableJsonNullValueInput | InputJsonValue
    seasonFactors?: NullableJsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: DateTimeFieldUpdateOperationsInput | Date | string
    validTo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PricingRuleUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    regionCode?: NullableStringFieldUpdateOperationsInput | string | null
    priceType?: EnumPriceTypeFieldUpdateOperationsInput | $Enums.PriceType
    basePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unit?: StringFieldUpdateOperationsInput | string
    weightTiers?: NullableJsonNullValueInput | InputJsonValue
    qualityFactors?: NullableJsonNullValueInput | InputJsonValue
    seasonFactors?: NullableJsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: DateTimeFieldUpdateOperationsInput | Date | string
    validTo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryAlertCreateInput = {
    id?: bigint | number
    itemId: bigint | number
    alertType: $Enums.AlertType
    alertLevel: $Enums.AlertLevel
    currentQty: Decimal | DecimalJsLike | number | string
    thresholdQty: Decimal | DecimalJsLike | number | string
    message: string
    status?: $Enums.AlertStatus
    handledBy?: bigint | number | null
    handledAt?: Date | string | null
    handlerRemark?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InventoryAlertUncheckedCreateInput = {
    id?: bigint | number
    itemId: bigint | number
    alertType: $Enums.AlertType
    alertLevel: $Enums.AlertLevel
    currentQty: Decimal | DecimalJsLike | number | string
    thresholdQty: Decimal | DecimalJsLike | number | string
    message: string
    status?: $Enums.AlertStatus
    handledBy?: bigint | number | null
    handledAt?: Date | string | null
    handlerRemark?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InventoryAlertUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    alertType?: EnumAlertTypeFieldUpdateOperationsInput | $Enums.AlertType
    alertLevel?: EnumAlertLevelFieldUpdateOperationsInput | $Enums.AlertLevel
    currentQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thresholdQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    message?: StringFieldUpdateOperationsInput | string
    status?: EnumAlertStatusFieldUpdateOperationsInput | $Enums.AlertStatus
    handledBy?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    handledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    handlerRemark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryAlertUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    alertType?: EnumAlertTypeFieldUpdateOperationsInput | $Enums.AlertType
    alertLevel?: EnumAlertLevelFieldUpdateOperationsInput | $Enums.AlertLevel
    currentQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thresholdQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    message?: StringFieldUpdateOperationsInput | string
    status?: EnumAlertStatusFieldUpdateOperationsInput | $Enums.AlertStatus
    handledBy?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    handledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    handlerRemark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryAlertCreateManyInput = {
    id?: bigint | number
    itemId: bigint | number
    alertType: $Enums.AlertType
    alertLevel: $Enums.AlertLevel
    currentQty: Decimal | DecimalJsLike | number | string
    thresholdQty: Decimal | DecimalJsLike | number | string
    message: string
    status?: $Enums.AlertStatus
    handledBy?: bigint | number | null
    handledAt?: Date | string | null
    handlerRemark?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InventoryAlertUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    alertType?: EnumAlertTypeFieldUpdateOperationsInput | $Enums.AlertType
    alertLevel?: EnumAlertLevelFieldUpdateOperationsInput | $Enums.AlertLevel
    currentQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thresholdQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    message?: StringFieldUpdateOperationsInput | string
    status?: EnumAlertStatusFieldUpdateOperationsInput | $Enums.AlertStatus
    handledBy?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    handledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    handlerRemark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryAlertUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    alertType?: EnumAlertTypeFieldUpdateOperationsInput | $Enums.AlertType
    alertLevel?: EnumAlertLevelFieldUpdateOperationsInput | $Enums.AlertLevel
    currentQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    thresholdQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    message?: StringFieldUpdateOperationsInput | string
    status?: EnumAlertStatusFieldUpdateOperationsInput | $Enums.AlertStatus
    handledBy?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    handledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    handlerRemark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumWarehouseTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.WarehouseType | EnumWarehouseTypeFieldRefInput<$PrismaModel>
    in?: $Enums.WarehouseType[] | ListEnumWarehouseTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.WarehouseType[] | ListEnumWarehouseTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumWarehouseTypeFilter<$PrismaModel> | $Enums.WarehouseType
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type EnumWarehouseStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.WarehouseStatus | EnumWarehouseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.WarehouseStatus[] | ListEnumWarehouseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.WarehouseStatus[] | ListEnumWarehouseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumWarehouseStatusFilter<$PrismaModel> | $Enums.WarehouseStatus
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type InventoryItemListRelationFilter = {
    every?: InventoryItemWhereInput
    some?: InventoryItemWhereInput
    none?: InventoryItemWhereInput
  }

  export type InventoryMovementListRelationFilter = {
    every?: InventoryMovementWhereInput
    some?: InventoryMovementWhereInput
    none?: InventoryMovementWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type InventoryItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InventoryMovementOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type WarehouseCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    type?: SortOrder
    address?: SortOrder
    contactName?: SortOrder
    contactPhone?: SortOrder
    capacity?: SortOrder
    status?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WarehouseAvgOrderByAggregateInput = {
    id?: SortOrder
    capacity?: SortOrder
  }

  export type WarehouseMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    type?: SortOrder
    address?: SortOrder
    contactName?: SortOrder
    contactPhone?: SortOrder
    capacity?: SortOrder
    status?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WarehouseMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    type?: SortOrder
    address?: SortOrder
    contactName?: SortOrder
    contactPhone?: SortOrder
    capacity?: SortOrder
    status?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WarehouseSumOrderByAggregateInput = {
    id?: SortOrder
    capacity?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumWarehouseTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.WarehouseType | EnumWarehouseTypeFieldRefInput<$PrismaModel>
    in?: $Enums.WarehouseType[] | ListEnumWarehouseTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.WarehouseType[] | ListEnumWarehouseTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumWarehouseTypeWithAggregatesFilter<$PrismaModel> | $Enums.WarehouseType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumWarehouseTypeFilter<$PrismaModel>
    _max?: NestedEnumWarehouseTypeFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type EnumWarehouseStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.WarehouseStatus | EnumWarehouseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.WarehouseStatus[] | ListEnumWarehouseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.WarehouseStatus[] | ListEnumWarehouseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumWarehouseStatusWithAggregatesFilter<$PrismaModel> | $Enums.WarehouseStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumWarehouseStatusFilter<$PrismaModel>
    _max?: NestedEnumWarehouseStatusFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ItemCategoryNullableRelationFilter = {
    is?: ItemCategoryWhereInput | null
    isNot?: ItemCategoryWhereInput | null
  }

  export type ItemCategoryListRelationFilter = {
    every?: ItemCategoryWhereInput
    some?: ItemCategoryWhereInput
    none?: ItemCategoryWhereInput
  }

  export type PricingRuleListRelationFilter = {
    every?: PricingRuleWhereInput
    some?: PricingRuleWhereInput
    none?: PricingRuleWhereInput
  }

  export type ItemCategoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PricingRuleOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ItemCategoryCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    parentId?: SortOrder
    level?: SortOrder
    enabled?: SortOrder
    iconUrl?: SortOrder
    description?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ItemCategoryAvgOrderByAggregateInput = {
    id?: SortOrder
    parentId?: SortOrder
    level?: SortOrder
    sortOrder?: SortOrder
  }

  export type ItemCategoryMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    parentId?: SortOrder
    level?: SortOrder
    enabled?: SortOrder
    iconUrl?: SortOrder
    description?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ItemCategoryMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    code?: SortOrder
    parentId?: SortOrder
    level?: SortOrder
    enabled?: SortOrder
    iconUrl?: SortOrder
    description?: SortOrder
    sortOrder?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ItemCategorySumOrderByAggregateInput = {
    id?: SortOrder
    parentId?: SortOrder
    level?: SortOrder
    sortOrder?: SortOrder
  }

  export type BigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type EnumInventoryStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.InventoryStatus | EnumInventoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInventoryStatusFilter<$PrismaModel> | $Enums.InventoryStatus
  }

  export type EnumItemTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ItemType | EnumItemTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ItemType[] | ListEnumItemTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ItemType[] | ListEnumItemTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumItemTypeFilter<$PrismaModel> | $Enums.ItemType
  }

  export type EnumItemConditionFilter<$PrismaModel = never> = {
    equals?: $Enums.ItemCondition | EnumItemConditionFieldRefInput<$PrismaModel>
    in?: $Enums.ItemCondition[] | ListEnumItemConditionFieldRefInput<$PrismaModel>
    notIn?: $Enums.ItemCondition[] | ListEnumItemConditionFieldRefInput<$PrismaModel>
    not?: NestedEnumItemConditionFilter<$PrismaModel> | $Enums.ItemCondition
  }

  export type EnumProcessingStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProcessingStatus | EnumProcessingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProcessingStatus[] | ListEnumProcessingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProcessingStatus[] | ListEnumProcessingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProcessingStatusFilter<$PrismaModel> | $Enums.ProcessingStatus
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type WarehouseRelationFilter = {
    is?: WarehouseWhereInput
    isNot?: WarehouseWhereInput
  }

  export type ItemCategoryRelationFilter = {
    is?: ItemCategoryWhereInput
    isNot?: ItemCategoryWhereInput
  }

  export type InventoryTransactionListRelationFilter = {
    every?: InventoryTransactionWhereInput
    some?: InventoryTransactionWhereInput
    none?: InventoryTransactionWhereInput
  }

  export type SalesRecordListRelationFilter = {
    every?: SalesRecordWhereInput
    some?: SalesRecordWhereInput
    none?: SalesRecordWhereInput
  }

  export type QualityCheckListRelationFilter = {
    every?: QualityCheckWhereInput
    some?: QualityCheckWhereInput
    none?: QualityCheckWhereInput
  }

  export type ReservationListRelationFilter = {
    every?: ReservationWhereInput
    some?: ReservationWhereInput
    none?: ReservationWhereInput
  }

  export type InventoryTransactionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SalesRecordOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type QualityCheckOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ReservationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type InventoryItemCountOrderByAggregateInput = {
    id?: SortOrder
    warehouseId?: SortOrder
    categoryId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    unit?: SortOrder
    quantity?: SortOrder
    reservedQty?: SortOrder
    availableQty?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    location?: SortOrder
    status?: SortOrder
    itemType?: SortOrder
    condition?: SortOrder
    sourceOrderId?: SortOrder
    qualityGrade?: SortOrder
    processingStatus?: SortOrder
    expiryDate?: SortOrder
    batchNumber?: SortOrder
    minStockLevel?: SortOrder
    maxStockLevel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InventoryItemAvgOrderByAggregateInput = {
    id?: SortOrder
    warehouseId?: SortOrder
    categoryId?: SortOrder
    quantity?: SortOrder
    reservedQty?: SortOrder
    availableQty?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    minStockLevel?: SortOrder
    maxStockLevel?: SortOrder
  }

  export type InventoryItemMaxOrderByAggregateInput = {
    id?: SortOrder
    warehouseId?: SortOrder
    categoryId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    unit?: SortOrder
    quantity?: SortOrder
    reservedQty?: SortOrder
    availableQty?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    location?: SortOrder
    status?: SortOrder
    itemType?: SortOrder
    condition?: SortOrder
    sourceOrderId?: SortOrder
    qualityGrade?: SortOrder
    processingStatus?: SortOrder
    expiryDate?: SortOrder
    batchNumber?: SortOrder
    minStockLevel?: SortOrder
    maxStockLevel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InventoryItemMinOrderByAggregateInput = {
    id?: SortOrder
    warehouseId?: SortOrder
    categoryId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    unit?: SortOrder
    quantity?: SortOrder
    reservedQty?: SortOrder
    availableQty?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    location?: SortOrder
    status?: SortOrder
    itemType?: SortOrder
    condition?: SortOrder
    sourceOrderId?: SortOrder
    qualityGrade?: SortOrder
    processingStatus?: SortOrder
    expiryDate?: SortOrder
    batchNumber?: SortOrder
    minStockLevel?: SortOrder
    maxStockLevel?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InventoryItemSumOrderByAggregateInput = {
    id?: SortOrder
    warehouseId?: SortOrder
    categoryId?: SortOrder
    quantity?: SortOrder
    reservedQty?: SortOrder
    availableQty?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    minStockLevel?: SortOrder
    maxStockLevel?: SortOrder
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type EnumInventoryStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InventoryStatus | EnumInventoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInventoryStatusWithAggregatesFilter<$PrismaModel> | $Enums.InventoryStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInventoryStatusFilter<$PrismaModel>
    _max?: NestedEnumInventoryStatusFilter<$PrismaModel>
  }

  export type EnumItemTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ItemType | EnumItemTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ItemType[] | ListEnumItemTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ItemType[] | ListEnumItemTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumItemTypeWithAggregatesFilter<$PrismaModel> | $Enums.ItemType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumItemTypeFilter<$PrismaModel>
    _max?: NestedEnumItemTypeFilter<$PrismaModel>
  }

  export type EnumItemConditionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ItemCondition | EnumItemConditionFieldRefInput<$PrismaModel>
    in?: $Enums.ItemCondition[] | ListEnumItemConditionFieldRefInput<$PrismaModel>
    notIn?: $Enums.ItemCondition[] | ListEnumItemConditionFieldRefInput<$PrismaModel>
    not?: NestedEnumItemConditionWithAggregatesFilter<$PrismaModel> | $Enums.ItemCondition
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumItemConditionFilter<$PrismaModel>
    _max?: NestedEnumItemConditionFilter<$PrismaModel>
  }

  export type EnumProcessingStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProcessingStatus | EnumProcessingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProcessingStatus[] | ListEnumProcessingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProcessingStatus[] | ListEnumProcessingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProcessingStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProcessingStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProcessingStatusFilter<$PrismaModel>
    _max?: NestedEnumProcessingStatusFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type EnumTransactionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeFilter<$PrismaModel> | $Enums.TransactionType
  }

  export type InventoryItemRelationFilter = {
    is?: InventoryItemWhereInput
    isNot?: InventoryItemWhereInput
  }

  export type InventoryTransactionCountOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    type?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    referenceId?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type InventoryTransactionAvgOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
  }

  export type InventoryTransactionMaxOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    type?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    referenceId?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type InventoryTransactionMinOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    type?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    referenceId?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type InventoryTransactionSumOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
  }

  export type EnumTransactionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransactionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransactionTypeFilter<$PrismaModel>
    _max?: NestedEnumTransactionTypeFilter<$PrismaModel>
  }

  export type SalesRecordCountOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    orderId?: SortOrder
    customerId?: SortOrder
    soldAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type SalesRecordAvgOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    customerId?: SortOrder
  }

  export type SalesRecordMaxOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    orderId?: SortOrder
    customerId?: SortOrder
    soldAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type SalesRecordMinOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    orderId?: SortOrder
    customerId?: SortOrder
    soldAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
  }

  export type SalesRecordSumOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalPrice?: SortOrder
    customerId?: SortOrder
  }

  export type EnumCheckTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckType | EnumCheckTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CheckType[] | ListEnumCheckTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CheckType[] | ListEnumCheckTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCheckTypeFilter<$PrismaModel> | $Enums.CheckType
  }

  export type EnumCheckResultFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckResult | EnumCheckResultFieldRefInput<$PrismaModel>
    in?: $Enums.CheckResult[] | ListEnumCheckResultFieldRefInput<$PrismaModel>
    notIn?: $Enums.CheckResult[] | ListEnumCheckResultFieldRefInput<$PrismaModel>
    not?: NestedEnumCheckResultFilter<$PrismaModel> | $Enums.CheckResult
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type QualityCheckCountOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    checkerId?: SortOrder
    checkType?: SortOrder
    result?: SortOrder
    score?: SortOrder
    notes?: SortOrder
    images?: SortOrder
    checkedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type QualityCheckAvgOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    checkerId?: SortOrder
    score?: SortOrder
  }

  export type QualityCheckMaxOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    checkerId?: SortOrder
    checkType?: SortOrder
    result?: SortOrder
    score?: SortOrder
    notes?: SortOrder
    checkedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type QualityCheckMinOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    checkerId?: SortOrder
    checkType?: SortOrder
    result?: SortOrder
    score?: SortOrder
    notes?: SortOrder
    checkedAt?: SortOrder
    createdAt?: SortOrder
  }

  export type QualityCheckSumOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    checkerId?: SortOrder
    score?: SortOrder
  }

  export type EnumCheckTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckType | EnumCheckTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CheckType[] | ListEnumCheckTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CheckType[] | ListEnumCheckTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCheckTypeWithAggregatesFilter<$PrismaModel> | $Enums.CheckType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCheckTypeFilter<$PrismaModel>
    _max?: NestedEnumCheckTypeFilter<$PrismaModel>
  }

  export type EnumCheckResultWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckResult | EnumCheckResultFieldRefInput<$PrismaModel>
    in?: $Enums.CheckResult[] | ListEnumCheckResultFieldRefInput<$PrismaModel>
    notIn?: $Enums.CheckResult[] | ListEnumCheckResultFieldRefInput<$PrismaModel>
    not?: NestedEnumCheckResultWithAggregatesFilter<$PrismaModel> | $Enums.CheckResult
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCheckResultFilter<$PrismaModel>
    _max?: NestedEnumCheckResultFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type EnumReservationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ReservationStatus | EnumReservationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReservationStatus[] | ListEnumReservationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReservationStatus[] | ListEnumReservationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReservationStatusFilter<$PrismaModel> | $Enums.ReservationStatus
  }

  export type ReservationCountOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    orderId?: SortOrder
    quantity?: SortOrder
    status?: SortOrder
    reservedAt?: SortOrder
    expiresAt?: SortOrder
    confirmedAt?: SortOrder
    cancelledAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReservationAvgOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
  }

  export type ReservationMaxOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    orderId?: SortOrder
    quantity?: SortOrder
    status?: SortOrder
    reservedAt?: SortOrder
    expiresAt?: SortOrder
    confirmedAt?: SortOrder
    cancelledAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReservationMinOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    orderId?: SortOrder
    quantity?: SortOrder
    status?: SortOrder
    reservedAt?: SortOrder
    expiresAt?: SortOrder
    confirmedAt?: SortOrder
    cancelledAt?: SortOrder
    notes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ReservationSumOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
  }

  export type EnumReservationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ReservationStatus | EnumReservationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReservationStatus[] | ListEnumReservationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReservationStatus[] | ListEnumReservationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReservationStatusWithAggregatesFilter<$PrismaModel> | $Enums.ReservationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumReservationStatusFilter<$PrismaModel>
    _max?: NestedEnumReservationStatusFilter<$PrismaModel>
  }

  export type EnumMovementTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.MovementType | EnumMovementTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MovementType[] | ListEnumMovementTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MovementType[] | ListEnumMovementTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMovementTypeFilter<$PrismaModel> | $Enums.MovementType
  }

  export type EnumMovementDirectionFilter<$PrismaModel = never> = {
    equals?: $Enums.MovementDirection | EnumMovementDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.MovementDirection[] | ListEnumMovementDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.MovementDirection[] | ListEnumMovementDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumMovementDirectionFilter<$PrismaModel> | $Enums.MovementDirection
  }

  export type InventoryMovementCountOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    warehouseId?: SortOrder
    categoryId?: SortOrder
    movementType?: SortOrder
    direction?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalAmount?: SortOrder
    beforeQty?: SortOrder
    afterQty?: SortOrder
    referenceType?: SortOrder
    referenceId?: SortOrder
    referenceNo?: SortOrder
    operatorId?: SortOrder
    operatorName?: SortOrder
    remark?: SortOrder
    createdAt?: SortOrder
  }

  export type InventoryMovementAvgOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    warehouseId?: SortOrder
    categoryId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalAmount?: SortOrder
    beforeQty?: SortOrder
    afterQty?: SortOrder
    referenceId?: SortOrder
    operatorId?: SortOrder
  }

  export type InventoryMovementMaxOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    warehouseId?: SortOrder
    categoryId?: SortOrder
    movementType?: SortOrder
    direction?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalAmount?: SortOrder
    beforeQty?: SortOrder
    afterQty?: SortOrder
    referenceType?: SortOrder
    referenceId?: SortOrder
    referenceNo?: SortOrder
    operatorId?: SortOrder
    operatorName?: SortOrder
    remark?: SortOrder
    createdAt?: SortOrder
  }

  export type InventoryMovementMinOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    warehouseId?: SortOrder
    categoryId?: SortOrder
    movementType?: SortOrder
    direction?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalAmount?: SortOrder
    beforeQty?: SortOrder
    afterQty?: SortOrder
    referenceType?: SortOrder
    referenceId?: SortOrder
    referenceNo?: SortOrder
    operatorId?: SortOrder
    operatorName?: SortOrder
    remark?: SortOrder
    createdAt?: SortOrder
  }

  export type InventoryMovementSumOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    warehouseId?: SortOrder
    categoryId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    totalAmount?: SortOrder
    beforeQty?: SortOrder
    afterQty?: SortOrder
    referenceId?: SortOrder
    operatorId?: SortOrder
  }

  export type EnumMovementTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MovementType | EnumMovementTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MovementType[] | ListEnumMovementTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MovementType[] | ListEnumMovementTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMovementTypeWithAggregatesFilter<$PrismaModel> | $Enums.MovementType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMovementTypeFilter<$PrismaModel>
    _max?: NestedEnumMovementTypeFilter<$PrismaModel>
  }

  export type EnumMovementDirectionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MovementDirection | EnumMovementDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.MovementDirection[] | ListEnumMovementDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.MovementDirection[] | ListEnumMovementDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumMovementDirectionWithAggregatesFilter<$PrismaModel> | $Enums.MovementDirection
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMovementDirectionFilter<$PrismaModel>
    _max?: NestedEnumMovementDirectionFilter<$PrismaModel>
  }

  export type EnumPriceTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PriceType | EnumPriceTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PriceType[] | ListEnumPriceTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PriceType[] | ListEnumPriceTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPriceTypeFilter<$PrismaModel> | $Enums.PriceType
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type PricingRuleCountOrderByAggregateInput = {
    id?: SortOrder
    categoryId?: SortOrder
    regionCode?: SortOrder
    priceType?: SortOrder
    basePrice?: SortOrder
    unit?: SortOrder
    weightTiers?: SortOrder
    qualityFactors?: SortOrder
    seasonFactors?: SortOrder
    enabled?: SortOrder
    validFrom?: SortOrder
    validTo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PricingRuleAvgOrderByAggregateInput = {
    id?: SortOrder
    categoryId?: SortOrder
    basePrice?: SortOrder
  }

  export type PricingRuleMaxOrderByAggregateInput = {
    id?: SortOrder
    categoryId?: SortOrder
    regionCode?: SortOrder
    priceType?: SortOrder
    basePrice?: SortOrder
    unit?: SortOrder
    enabled?: SortOrder
    validFrom?: SortOrder
    validTo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PricingRuleMinOrderByAggregateInput = {
    id?: SortOrder
    categoryId?: SortOrder
    regionCode?: SortOrder
    priceType?: SortOrder
    basePrice?: SortOrder
    unit?: SortOrder
    enabled?: SortOrder
    validFrom?: SortOrder
    validTo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PricingRuleSumOrderByAggregateInput = {
    id?: SortOrder
    categoryId?: SortOrder
    basePrice?: SortOrder
  }

  export type EnumPriceTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PriceType | EnumPriceTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PriceType[] | ListEnumPriceTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PriceType[] | ListEnumPriceTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPriceTypeWithAggregatesFilter<$PrismaModel> | $Enums.PriceType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPriceTypeFilter<$PrismaModel>
    _max?: NestedEnumPriceTypeFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type EnumAlertTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertType | EnumAlertTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertTypeFilter<$PrismaModel> | $Enums.AlertType
  }

  export type EnumAlertLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertLevel | EnumAlertLevelFieldRefInput<$PrismaModel>
    in?: $Enums.AlertLevel[] | ListEnumAlertLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertLevel[] | ListEnumAlertLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertLevelFilter<$PrismaModel> | $Enums.AlertLevel
  }

  export type EnumAlertStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertStatus | EnumAlertStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AlertStatus[] | ListEnumAlertStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertStatus[] | ListEnumAlertStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertStatusFilter<$PrismaModel> | $Enums.AlertStatus
  }

  export type InventoryAlertCountOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    alertType?: SortOrder
    alertLevel?: SortOrder
    currentQty?: SortOrder
    thresholdQty?: SortOrder
    message?: SortOrder
    status?: SortOrder
    handledBy?: SortOrder
    handledAt?: SortOrder
    handlerRemark?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InventoryAlertAvgOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    currentQty?: SortOrder
    thresholdQty?: SortOrder
    handledBy?: SortOrder
  }

  export type InventoryAlertMaxOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    alertType?: SortOrder
    alertLevel?: SortOrder
    currentQty?: SortOrder
    thresholdQty?: SortOrder
    message?: SortOrder
    status?: SortOrder
    handledBy?: SortOrder
    handledAt?: SortOrder
    handlerRemark?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InventoryAlertMinOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    alertType?: SortOrder
    alertLevel?: SortOrder
    currentQty?: SortOrder
    thresholdQty?: SortOrder
    message?: SortOrder
    status?: SortOrder
    handledBy?: SortOrder
    handledAt?: SortOrder
    handlerRemark?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InventoryAlertSumOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    currentQty?: SortOrder
    thresholdQty?: SortOrder
    handledBy?: SortOrder
  }

  export type EnumAlertTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertType | EnumAlertTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertTypeWithAggregatesFilter<$PrismaModel> | $Enums.AlertType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAlertTypeFilter<$PrismaModel>
    _max?: NestedEnumAlertTypeFilter<$PrismaModel>
  }

  export type EnumAlertLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertLevel | EnumAlertLevelFieldRefInput<$PrismaModel>
    in?: $Enums.AlertLevel[] | ListEnumAlertLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertLevel[] | ListEnumAlertLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertLevelWithAggregatesFilter<$PrismaModel> | $Enums.AlertLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAlertLevelFilter<$PrismaModel>
    _max?: NestedEnumAlertLevelFilter<$PrismaModel>
  }

  export type EnumAlertStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertStatus | EnumAlertStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AlertStatus[] | ListEnumAlertStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertStatus[] | ListEnumAlertStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertStatusWithAggregatesFilter<$PrismaModel> | $Enums.AlertStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAlertStatusFilter<$PrismaModel>
    _max?: NestedEnumAlertStatusFilter<$PrismaModel>
  }

  export type InventoryItemCreateNestedManyWithoutWarehouseInput = {
    create?: XOR<InventoryItemCreateWithoutWarehouseInput, InventoryItemUncheckedCreateWithoutWarehouseInput> | InventoryItemCreateWithoutWarehouseInput[] | InventoryItemUncheckedCreateWithoutWarehouseInput[]
    connectOrCreate?: InventoryItemCreateOrConnectWithoutWarehouseInput | InventoryItemCreateOrConnectWithoutWarehouseInput[]
    createMany?: InventoryItemCreateManyWarehouseInputEnvelope
    connect?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
  }

  export type InventoryMovementCreateNestedManyWithoutWarehouseInput = {
    create?: XOR<InventoryMovementCreateWithoutWarehouseInput, InventoryMovementUncheckedCreateWithoutWarehouseInput> | InventoryMovementCreateWithoutWarehouseInput[] | InventoryMovementUncheckedCreateWithoutWarehouseInput[]
    connectOrCreate?: InventoryMovementCreateOrConnectWithoutWarehouseInput | InventoryMovementCreateOrConnectWithoutWarehouseInput[]
    createMany?: InventoryMovementCreateManyWarehouseInputEnvelope
    connect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
  }

  export type InventoryItemUncheckedCreateNestedManyWithoutWarehouseInput = {
    create?: XOR<InventoryItemCreateWithoutWarehouseInput, InventoryItemUncheckedCreateWithoutWarehouseInput> | InventoryItemCreateWithoutWarehouseInput[] | InventoryItemUncheckedCreateWithoutWarehouseInput[]
    connectOrCreate?: InventoryItemCreateOrConnectWithoutWarehouseInput | InventoryItemCreateOrConnectWithoutWarehouseInput[]
    createMany?: InventoryItemCreateManyWarehouseInputEnvelope
    connect?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
  }

  export type InventoryMovementUncheckedCreateNestedManyWithoutWarehouseInput = {
    create?: XOR<InventoryMovementCreateWithoutWarehouseInput, InventoryMovementUncheckedCreateWithoutWarehouseInput> | InventoryMovementCreateWithoutWarehouseInput[] | InventoryMovementUncheckedCreateWithoutWarehouseInput[]
    connectOrCreate?: InventoryMovementCreateOrConnectWithoutWarehouseInput | InventoryMovementCreateOrConnectWithoutWarehouseInput[]
    createMany?: InventoryMovementCreateManyWarehouseInputEnvelope
    connect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumWarehouseTypeFieldUpdateOperationsInput = {
    set?: $Enums.WarehouseType
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type EnumWarehouseStatusFieldUpdateOperationsInput = {
    set?: $Enums.WarehouseStatus
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type InventoryItemUpdateManyWithoutWarehouseNestedInput = {
    create?: XOR<InventoryItemCreateWithoutWarehouseInput, InventoryItemUncheckedCreateWithoutWarehouseInput> | InventoryItemCreateWithoutWarehouseInput[] | InventoryItemUncheckedCreateWithoutWarehouseInput[]
    connectOrCreate?: InventoryItemCreateOrConnectWithoutWarehouseInput | InventoryItemCreateOrConnectWithoutWarehouseInput[]
    upsert?: InventoryItemUpsertWithWhereUniqueWithoutWarehouseInput | InventoryItemUpsertWithWhereUniqueWithoutWarehouseInput[]
    createMany?: InventoryItemCreateManyWarehouseInputEnvelope
    set?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    disconnect?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    delete?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    connect?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    update?: InventoryItemUpdateWithWhereUniqueWithoutWarehouseInput | InventoryItemUpdateWithWhereUniqueWithoutWarehouseInput[]
    updateMany?: InventoryItemUpdateManyWithWhereWithoutWarehouseInput | InventoryItemUpdateManyWithWhereWithoutWarehouseInput[]
    deleteMany?: InventoryItemScalarWhereInput | InventoryItemScalarWhereInput[]
  }

  export type InventoryMovementUpdateManyWithoutWarehouseNestedInput = {
    create?: XOR<InventoryMovementCreateWithoutWarehouseInput, InventoryMovementUncheckedCreateWithoutWarehouseInput> | InventoryMovementCreateWithoutWarehouseInput[] | InventoryMovementUncheckedCreateWithoutWarehouseInput[]
    connectOrCreate?: InventoryMovementCreateOrConnectWithoutWarehouseInput | InventoryMovementCreateOrConnectWithoutWarehouseInput[]
    upsert?: InventoryMovementUpsertWithWhereUniqueWithoutWarehouseInput | InventoryMovementUpsertWithWhereUniqueWithoutWarehouseInput[]
    createMany?: InventoryMovementCreateManyWarehouseInputEnvelope
    set?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    disconnect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    delete?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    connect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    update?: InventoryMovementUpdateWithWhereUniqueWithoutWarehouseInput | InventoryMovementUpdateWithWhereUniqueWithoutWarehouseInput[]
    updateMany?: InventoryMovementUpdateManyWithWhereWithoutWarehouseInput | InventoryMovementUpdateManyWithWhereWithoutWarehouseInput[]
    deleteMany?: InventoryMovementScalarWhereInput | InventoryMovementScalarWhereInput[]
  }

  export type InventoryItemUncheckedUpdateManyWithoutWarehouseNestedInput = {
    create?: XOR<InventoryItemCreateWithoutWarehouseInput, InventoryItemUncheckedCreateWithoutWarehouseInput> | InventoryItemCreateWithoutWarehouseInput[] | InventoryItemUncheckedCreateWithoutWarehouseInput[]
    connectOrCreate?: InventoryItemCreateOrConnectWithoutWarehouseInput | InventoryItemCreateOrConnectWithoutWarehouseInput[]
    upsert?: InventoryItemUpsertWithWhereUniqueWithoutWarehouseInput | InventoryItemUpsertWithWhereUniqueWithoutWarehouseInput[]
    createMany?: InventoryItemCreateManyWarehouseInputEnvelope
    set?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    disconnect?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    delete?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    connect?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    update?: InventoryItemUpdateWithWhereUniqueWithoutWarehouseInput | InventoryItemUpdateWithWhereUniqueWithoutWarehouseInput[]
    updateMany?: InventoryItemUpdateManyWithWhereWithoutWarehouseInput | InventoryItemUpdateManyWithWhereWithoutWarehouseInput[]
    deleteMany?: InventoryItemScalarWhereInput | InventoryItemScalarWhereInput[]
  }

  export type InventoryMovementUncheckedUpdateManyWithoutWarehouseNestedInput = {
    create?: XOR<InventoryMovementCreateWithoutWarehouseInput, InventoryMovementUncheckedCreateWithoutWarehouseInput> | InventoryMovementCreateWithoutWarehouseInput[] | InventoryMovementUncheckedCreateWithoutWarehouseInput[]
    connectOrCreate?: InventoryMovementCreateOrConnectWithoutWarehouseInput | InventoryMovementCreateOrConnectWithoutWarehouseInput[]
    upsert?: InventoryMovementUpsertWithWhereUniqueWithoutWarehouseInput | InventoryMovementUpsertWithWhereUniqueWithoutWarehouseInput[]
    createMany?: InventoryMovementCreateManyWarehouseInputEnvelope
    set?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    disconnect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    delete?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    connect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    update?: InventoryMovementUpdateWithWhereUniqueWithoutWarehouseInput | InventoryMovementUpdateWithWhereUniqueWithoutWarehouseInput[]
    updateMany?: InventoryMovementUpdateManyWithWhereWithoutWarehouseInput | InventoryMovementUpdateManyWithWhereWithoutWarehouseInput[]
    deleteMany?: InventoryMovementScalarWhereInput | InventoryMovementScalarWhereInput[]
  }

  export type ItemCategoryCreateNestedOneWithoutChildrenInput = {
    create?: XOR<ItemCategoryCreateWithoutChildrenInput, ItemCategoryUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: ItemCategoryCreateOrConnectWithoutChildrenInput
    connect?: ItemCategoryWhereUniqueInput
  }

  export type ItemCategoryCreateNestedManyWithoutParentInput = {
    create?: XOR<ItemCategoryCreateWithoutParentInput, ItemCategoryUncheckedCreateWithoutParentInput> | ItemCategoryCreateWithoutParentInput[] | ItemCategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: ItemCategoryCreateOrConnectWithoutParentInput | ItemCategoryCreateOrConnectWithoutParentInput[]
    createMany?: ItemCategoryCreateManyParentInputEnvelope
    connect?: ItemCategoryWhereUniqueInput | ItemCategoryWhereUniqueInput[]
  }

  export type InventoryItemCreateNestedManyWithoutCategoryInput = {
    create?: XOR<InventoryItemCreateWithoutCategoryInput, InventoryItemUncheckedCreateWithoutCategoryInput> | InventoryItemCreateWithoutCategoryInput[] | InventoryItemUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: InventoryItemCreateOrConnectWithoutCategoryInput | InventoryItemCreateOrConnectWithoutCategoryInput[]
    createMany?: InventoryItemCreateManyCategoryInputEnvelope
    connect?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
  }

  export type InventoryMovementCreateNestedManyWithoutCategoryInput = {
    create?: XOR<InventoryMovementCreateWithoutCategoryInput, InventoryMovementUncheckedCreateWithoutCategoryInput> | InventoryMovementCreateWithoutCategoryInput[] | InventoryMovementUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: InventoryMovementCreateOrConnectWithoutCategoryInput | InventoryMovementCreateOrConnectWithoutCategoryInput[]
    createMany?: InventoryMovementCreateManyCategoryInputEnvelope
    connect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
  }

  export type PricingRuleCreateNestedManyWithoutCategoryInput = {
    create?: XOR<PricingRuleCreateWithoutCategoryInput, PricingRuleUncheckedCreateWithoutCategoryInput> | PricingRuleCreateWithoutCategoryInput[] | PricingRuleUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: PricingRuleCreateOrConnectWithoutCategoryInput | PricingRuleCreateOrConnectWithoutCategoryInput[]
    createMany?: PricingRuleCreateManyCategoryInputEnvelope
    connect?: PricingRuleWhereUniqueInput | PricingRuleWhereUniqueInput[]
  }

  export type ItemCategoryUncheckedCreateNestedManyWithoutParentInput = {
    create?: XOR<ItemCategoryCreateWithoutParentInput, ItemCategoryUncheckedCreateWithoutParentInput> | ItemCategoryCreateWithoutParentInput[] | ItemCategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: ItemCategoryCreateOrConnectWithoutParentInput | ItemCategoryCreateOrConnectWithoutParentInput[]
    createMany?: ItemCategoryCreateManyParentInputEnvelope
    connect?: ItemCategoryWhereUniqueInput | ItemCategoryWhereUniqueInput[]
  }

  export type InventoryItemUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<InventoryItemCreateWithoutCategoryInput, InventoryItemUncheckedCreateWithoutCategoryInput> | InventoryItemCreateWithoutCategoryInput[] | InventoryItemUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: InventoryItemCreateOrConnectWithoutCategoryInput | InventoryItemCreateOrConnectWithoutCategoryInput[]
    createMany?: InventoryItemCreateManyCategoryInputEnvelope
    connect?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
  }

  export type InventoryMovementUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<InventoryMovementCreateWithoutCategoryInput, InventoryMovementUncheckedCreateWithoutCategoryInput> | InventoryMovementCreateWithoutCategoryInput[] | InventoryMovementUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: InventoryMovementCreateOrConnectWithoutCategoryInput | InventoryMovementCreateOrConnectWithoutCategoryInput[]
    createMany?: InventoryMovementCreateManyCategoryInputEnvelope
    connect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
  }

  export type PricingRuleUncheckedCreateNestedManyWithoutCategoryInput = {
    create?: XOR<PricingRuleCreateWithoutCategoryInput, PricingRuleUncheckedCreateWithoutCategoryInput> | PricingRuleCreateWithoutCategoryInput[] | PricingRuleUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: PricingRuleCreateOrConnectWithoutCategoryInput | PricingRuleCreateOrConnectWithoutCategoryInput[]
    createMany?: PricingRuleCreateManyCategoryInputEnvelope
    connect?: PricingRuleWhereUniqueInput | PricingRuleWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ItemCategoryUpdateOneWithoutChildrenNestedInput = {
    create?: XOR<ItemCategoryCreateWithoutChildrenInput, ItemCategoryUncheckedCreateWithoutChildrenInput>
    connectOrCreate?: ItemCategoryCreateOrConnectWithoutChildrenInput
    upsert?: ItemCategoryUpsertWithoutChildrenInput
    disconnect?: ItemCategoryWhereInput | boolean
    delete?: ItemCategoryWhereInput | boolean
    connect?: ItemCategoryWhereUniqueInput
    update?: XOR<XOR<ItemCategoryUpdateToOneWithWhereWithoutChildrenInput, ItemCategoryUpdateWithoutChildrenInput>, ItemCategoryUncheckedUpdateWithoutChildrenInput>
  }

  export type ItemCategoryUpdateManyWithoutParentNestedInput = {
    create?: XOR<ItemCategoryCreateWithoutParentInput, ItemCategoryUncheckedCreateWithoutParentInput> | ItemCategoryCreateWithoutParentInput[] | ItemCategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: ItemCategoryCreateOrConnectWithoutParentInput | ItemCategoryCreateOrConnectWithoutParentInput[]
    upsert?: ItemCategoryUpsertWithWhereUniqueWithoutParentInput | ItemCategoryUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: ItemCategoryCreateManyParentInputEnvelope
    set?: ItemCategoryWhereUniqueInput | ItemCategoryWhereUniqueInput[]
    disconnect?: ItemCategoryWhereUniqueInput | ItemCategoryWhereUniqueInput[]
    delete?: ItemCategoryWhereUniqueInput | ItemCategoryWhereUniqueInput[]
    connect?: ItemCategoryWhereUniqueInput | ItemCategoryWhereUniqueInput[]
    update?: ItemCategoryUpdateWithWhereUniqueWithoutParentInput | ItemCategoryUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: ItemCategoryUpdateManyWithWhereWithoutParentInput | ItemCategoryUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: ItemCategoryScalarWhereInput | ItemCategoryScalarWhereInput[]
  }

  export type InventoryItemUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<InventoryItemCreateWithoutCategoryInput, InventoryItemUncheckedCreateWithoutCategoryInput> | InventoryItemCreateWithoutCategoryInput[] | InventoryItemUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: InventoryItemCreateOrConnectWithoutCategoryInput | InventoryItemCreateOrConnectWithoutCategoryInput[]
    upsert?: InventoryItemUpsertWithWhereUniqueWithoutCategoryInput | InventoryItemUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: InventoryItemCreateManyCategoryInputEnvelope
    set?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    disconnect?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    delete?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    connect?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    update?: InventoryItemUpdateWithWhereUniqueWithoutCategoryInput | InventoryItemUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: InventoryItemUpdateManyWithWhereWithoutCategoryInput | InventoryItemUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: InventoryItemScalarWhereInput | InventoryItemScalarWhereInput[]
  }

  export type InventoryMovementUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<InventoryMovementCreateWithoutCategoryInput, InventoryMovementUncheckedCreateWithoutCategoryInput> | InventoryMovementCreateWithoutCategoryInput[] | InventoryMovementUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: InventoryMovementCreateOrConnectWithoutCategoryInput | InventoryMovementCreateOrConnectWithoutCategoryInput[]
    upsert?: InventoryMovementUpsertWithWhereUniqueWithoutCategoryInput | InventoryMovementUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: InventoryMovementCreateManyCategoryInputEnvelope
    set?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    disconnect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    delete?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    connect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    update?: InventoryMovementUpdateWithWhereUniqueWithoutCategoryInput | InventoryMovementUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: InventoryMovementUpdateManyWithWhereWithoutCategoryInput | InventoryMovementUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: InventoryMovementScalarWhereInput | InventoryMovementScalarWhereInput[]
  }

  export type PricingRuleUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<PricingRuleCreateWithoutCategoryInput, PricingRuleUncheckedCreateWithoutCategoryInput> | PricingRuleCreateWithoutCategoryInput[] | PricingRuleUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: PricingRuleCreateOrConnectWithoutCategoryInput | PricingRuleCreateOrConnectWithoutCategoryInput[]
    upsert?: PricingRuleUpsertWithWhereUniqueWithoutCategoryInput | PricingRuleUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: PricingRuleCreateManyCategoryInputEnvelope
    set?: PricingRuleWhereUniqueInput | PricingRuleWhereUniqueInput[]
    disconnect?: PricingRuleWhereUniqueInput | PricingRuleWhereUniqueInput[]
    delete?: PricingRuleWhereUniqueInput | PricingRuleWhereUniqueInput[]
    connect?: PricingRuleWhereUniqueInput | PricingRuleWhereUniqueInput[]
    update?: PricingRuleUpdateWithWhereUniqueWithoutCategoryInput | PricingRuleUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: PricingRuleUpdateManyWithWhereWithoutCategoryInput | PricingRuleUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: PricingRuleScalarWhereInput | PricingRuleScalarWhereInput[]
  }

  export type NullableBigIntFieldUpdateOperationsInput = {
    set?: bigint | number | null
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type ItemCategoryUncheckedUpdateManyWithoutParentNestedInput = {
    create?: XOR<ItemCategoryCreateWithoutParentInput, ItemCategoryUncheckedCreateWithoutParentInput> | ItemCategoryCreateWithoutParentInput[] | ItemCategoryUncheckedCreateWithoutParentInput[]
    connectOrCreate?: ItemCategoryCreateOrConnectWithoutParentInput | ItemCategoryCreateOrConnectWithoutParentInput[]
    upsert?: ItemCategoryUpsertWithWhereUniqueWithoutParentInput | ItemCategoryUpsertWithWhereUniqueWithoutParentInput[]
    createMany?: ItemCategoryCreateManyParentInputEnvelope
    set?: ItemCategoryWhereUniqueInput | ItemCategoryWhereUniqueInput[]
    disconnect?: ItemCategoryWhereUniqueInput | ItemCategoryWhereUniqueInput[]
    delete?: ItemCategoryWhereUniqueInput | ItemCategoryWhereUniqueInput[]
    connect?: ItemCategoryWhereUniqueInput | ItemCategoryWhereUniqueInput[]
    update?: ItemCategoryUpdateWithWhereUniqueWithoutParentInput | ItemCategoryUpdateWithWhereUniqueWithoutParentInput[]
    updateMany?: ItemCategoryUpdateManyWithWhereWithoutParentInput | ItemCategoryUpdateManyWithWhereWithoutParentInput[]
    deleteMany?: ItemCategoryScalarWhereInput | ItemCategoryScalarWhereInput[]
  }

  export type InventoryItemUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<InventoryItemCreateWithoutCategoryInput, InventoryItemUncheckedCreateWithoutCategoryInput> | InventoryItemCreateWithoutCategoryInput[] | InventoryItemUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: InventoryItemCreateOrConnectWithoutCategoryInput | InventoryItemCreateOrConnectWithoutCategoryInput[]
    upsert?: InventoryItemUpsertWithWhereUniqueWithoutCategoryInput | InventoryItemUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: InventoryItemCreateManyCategoryInputEnvelope
    set?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    disconnect?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    delete?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    connect?: InventoryItemWhereUniqueInput | InventoryItemWhereUniqueInput[]
    update?: InventoryItemUpdateWithWhereUniqueWithoutCategoryInput | InventoryItemUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: InventoryItemUpdateManyWithWhereWithoutCategoryInput | InventoryItemUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: InventoryItemScalarWhereInput | InventoryItemScalarWhereInput[]
  }

  export type InventoryMovementUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<InventoryMovementCreateWithoutCategoryInput, InventoryMovementUncheckedCreateWithoutCategoryInput> | InventoryMovementCreateWithoutCategoryInput[] | InventoryMovementUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: InventoryMovementCreateOrConnectWithoutCategoryInput | InventoryMovementCreateOrConnectWithoutCategoryInput[]
    upsert?: InventoryMovementUpsertWithWhereUniqueWithoutCategoryInput | InventoryMovementUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: InventoryMovementCreateManyCategoryInputEnvelope
    set?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    disconnect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    delete?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    connect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    update?: InventoryMovementUpdateWithWhereUniqueWithoutCategoryInput | InventoryMovementUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: InventoryMovementUpdateManyWithWhereWithoutCategoryInput | InventoryMovementUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: InventoryMovementScalarWhereInput | InventoryMovementScalarWhereInput[]
  }

  export type PricingRuleUncheckedUpdateManyWithoutCategoryNestedInput = {
    create?: XOR<PricingRuleCreateWithoutCategoryInput, PricingRuleUncheckedCreateWithoutCategoryInput> | PricingRuleCreateWithoutCategoryInput[] | PricingRuleUncheckedCreateWithoutCategoryInput[]
    connectOrCreate?: PricingRuleCreateOrConnectWithoutCategoryInput | PricingRuleCreateOrConnectWithoutCategoryInput[]
    upsert?: PricingRuleUpsertWithWhereUniqueWithoutCategoryInput | PricingRuleUpsertWithWhereUniqueWithoutCategoryInput[]
    createMany?: PricingRuleCreateManyCategoryInputEnvelope
    set?: PricingRuleWhereUniqueInput | PricingRuleWhereUniqueInput[]
    disconnect?: PricingRuleWhereUniqueInput | PricingRuleWhereUniqueInput[]
    delete?: PricingRuleWhereUniqueInput | PricingRuleWhereUniqueInput[]
    connect?: PricingRuleWhereUniqueInput | PricingRuleWhereUniqueInput[]
    update?: PricingRuleUpdateWithWhereUniqueWithoutCategoryInput | PricingRuleUpdateWithWhereUniqueWithoutCategoryInput[]
    updateMany?: PricingRuleUpdateManyWithWhereWithoutCategoryInput | PricingRuleUpdateManyWithWhereWithoutCategoryInput[]
    deleteMany?: PricingRuleScalarWhereInput | PricingRuleScalarWhereInput[]
  }

  export type WarehouseCreateNestedOneWithoutInventoryItemsInput = {
    create?: XOR<WarehouseCreateWithoutInventoryItemsInput, WarehouseUncheckedCreateWithoutInventoryItemsInput>
    connectOrCreate?: WarehouseCreateOrConnectWithoutInventoryItemsInput
    connect?: WarehouseWhereUniqueInput
  }

  export type ItemCategoryCreateNestedOneWithoutInventoryItemsInput = {
    create?: XOR<ItemCategoryCreateWithoutInventoryItemsInput, ItemCategoryUncheckedCreateWithoutInventoryItemsInput>
    connectOrCreate?: ItemCategoryCreateOrConnectWithoutInventoryItemsInput
    connect?: ItemCategoryWhereUniqueInput
  }

  export type InventoryTransactionCreateNestedManyWithoutItemInput = {
    create?: XOR<InventoryTransactionCreateWithoutItemInput, InventoryTransactionUncheckedCreateWithoutItemInput> | InventoryTransactionCreateWithoutItemInput[] | InventoryTransactionUncheckedCreateWithoutItemInput[]
    connectOrCreate?: InventoryTransactionCreateOrConnectWithoutItemInput | InventoryTransactionCreateOrConnectWithoutItemInput[]
    createMany?: InventoryTransactionCreateManyItemInputEnvelope
    connect?: InventoryTransactionWhereUniqueInput | InventoryTransactionWhereUniqueInput[]
  }

  export type SalesRecordCreateNestedManyWithoutItemInput = {
    create?: XOR<SalesRecordCreateWithoutItemInput, SalesRecordUncheckedCreateWithoutItemInput> | SalesRecordCreateWithoutItemInput[] | SalesRecordUncheckedCreateWithoutItemInput[]
    connectOrCreate?: SalesRecordCreateOrConnectWithoutItemInput | SalesRecordCreateOrConnectWithoutItemInput[]
    createMany?: SalesRecordCreateManyItemInputEnvelope
    connect?: SalesRecordWhereUniqueInput | SalesRecordWhereUniqueInput[]
  }

  export type QualityCheckCreateNestedManyWithoutItemInput = {
    create?: XOR<QualityCheckCreateWithoutItemInput, QualityCheckUncheckedCreateWithoutItemInput> | QualityCheckCreateWithoutItemInput[] | QualityCheckUncheckedCreateWithoutItemInput[]
    connectOrCreate?: QualityCheckCreateOrConnectWithoutItemInput | QualityCheckCreateOrConnectWithoutItemInput[]
    createMany?: QualityCheckCreateManyItemInputEnvelope
    connect?: QualityCheckWhereUniqueInput | QualityCheckWhereUniqueInput[]
  }

  export type InventoryMovementCreateNestedManyWithoutItemInput = {
    create?: XOR<InventoryMovementCreateWithoutItemInput, InventoryMovementUncheckedCreateWithoutItemInput> | InventoryMovementCreateWithoutItemInput[] | InventoryMovementUncheckedCreateWithoutItemInput[]
    connectOrCreate?: InventoryMovementCreateOrConnectWithoutItemInput | InventoryMovementCreateOrConnectWithoutItemInput[]
    createMany?: InventoryMovementCreateManyItemInputEnvelope
    connect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
  }

  export type ReservationCreateNestedManyWithoutItemInput = {
    create?: XOR<ReservationCreateWithoutItemInput, ReservationUncheckedCreateWithoutItemInput> | ReservationCreateWithoutItemInput[] | ReservationUncheckedCreateWithoutItemInput[]
    connectOrCreate?: ReservationCreateOrConnectWithoutItemInput | ReservationCreateOrConnectWithoutItemInput[]
    createMany?: ReservationCreateManyItemInputEnvelope
    connect?: ReservationWhereUniqueInput | ReservationWhereUniqueInput[]
  }

  export type InventoryTransactionUncheckedCreateNestedManyWithoutItemInput = {
    create?: XOR<InventoryTransactionCreateWithoutItemInput, InventoryTransactionUncheckedCreateWithoutItemInput> | InventoryTransactionCreateWithoutItemInput[] | InventoryTransactionUncheckedCreateWithoutItemInput[]
    connectOrCreate?: InventoryTransactionCreateOrConnectWithoutItemInput | InventoryTransactionCreateOrConnectWithoutItemInput[]
    createMany?: InventoryTransactionCreateManyItemInputEnvelope
    connect?: InventoryTransactionWhereUniqueInput | InventoryTransactionWhereUniqueInput[]
  }

  export type SalesRecordUncheckedCreateNestedManyWithoutItemInput = {
    create?: XOR<SalesRecordCreateWithoutItemInput, SalesRecordUncheckedCreateWithoutItemInput> | SalesRecordCreateWithoutItemInput[] | SalesRecordUncheckedCreateWithoutItemInput[]
    connectOrCreate?: SalesRecordCreateOrConnectWithoutItemInput | SalesRecordCreateOrConnectWithoutItemInput[]
    createMany?: SalesRecordCreateManyItemInputEnvelope
    connect?: SalesRecordWhereUniqueInput | SalesRecordWhereUniqueInput[]
  }

  export type QualityCheckUncheckedCreateNestedManyWithoutItemInput = {
    create?: XOR<QualityCheckCreateWithoutItemInput, QualityCheckUncheckedCreateWithoutItemInput> | QualityCheckCreateWithoutItemInput[] | QualityCheckUncheckedCreateWithoutItemInput[]
    connectOrCreate?: QualityCheckCreateOrConnectWithoutItemInput | QualityCheckCreateOrConnectWithoutItemInput[]
    createMany?: QualityCheckCreateManyItemInputEnvelope
    connect?: QualityCheckWhereUniqueInput | QualityCheckWhereUniqueInput[]
  }

  export type InventoryMovementUncheckedCreateNestedManyWithoutItemInput = {
    create?: XOR<InventoryMovementCreateWithoutItemInput, InventoryMovementUncheckedCreateWithoutItemInput> | InventoryMovementCreateWithoutItemInput[] | InventoryMovementUncheckedCreateWithoutItemInput[]
    connectOrCreate?: InventoryMovementCreateOrConnectWithoutItemInput | InventoryMovementCreateOrConnectWithoutItemInput[]
    createMany?: InventoryMovementCreateManyItemInputEnvelope
    connect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
  }

  export type ReservationUncheckedCreateNestedManyWithoutItemInput = {
    create?: XOR<ReservationCreateWithoutItemInput, ReservationUncheckedCreateWithoutItemInput> | ReservationCreateWithoutItemInput[] | ReservationUncheckedCreateWithoutItemInput[]
    connectOrCreate?: ReservationCreateOrConnectWithoutItemInput | ReservationCreateOrConnectWithoutItemInput[]
    createMany?: ReservationCreateManyItemInputEnvelope
    connect?: ReservationWhereUniqueInput | ReservationWhereUniqueInput[]
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type EnumInventoryStatusFieldUpdateOperationsInput = {
    set?: $Enums.InventoryStatus
  }

  export type EnumItemTypeFieldUpdateOperationsInput = {
    set?: $Enums.ItemType
  }

  export type EnumItemConditionFieldUpdateOperationsInput = {
    set?: $Enums.ItemCondition
  }

  export type EnumProcessingStatusFieldUpdateOperationsInput = {
    set?: $Enums.ProcessingStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type WarehouseUpdateOneRequiredWithoutInventoryItemsNestedInput = {
    create?: XOR<WarehouseCreateWithoutInventoryItemsInput, WarehouseUncheckedCreateWithoutInventoryItemsInput>
    connectOrCreate?: WarehouseCreateOrConnectWithoutInventoryItemsInput
    upsert?: WarehouseUpsertWithoutInventoryItemsInput
    connect?: WarehouseWhereUniqueInput
    update?: XOR<XOR<WarehouseUpdateToOneWithWhereWithoutInventoryItemsInput, WarehouseUpdateWithoutInventoryItemsInput>, WarehouseUncheckedUpdateWithoutInventoryItemsInput>
  }

  export type ItemCategoryUpdateOneRequiredWithoutInventoryItemsNestedInput = {
    create?: XOR<ItemCategoryCreateWithoutInventoryItemsInput, ItemCategoryUncheckedCreateWithoutInventoryItemsInput>
    connectOrCreate?: ItemCategoryCreateOrConnectWithoutInventoryItemsInput
    upsert?: ItemCategoryUpsertWithoutInventoryItemsInput
    connect?: ItemCategoryWhereUniqueInput
    update?: XOR<XOR<ItemCategoryUpdateToOneWithWhereWithoutInventoryItemsInput, ItemCategoryUpdateWithoutInventoryItemsInput>, ItemCategoryUncheckedUpdateWithoutInventoryItemsInput>
  }

  export type InventoryTransactionUpdateManyWithoutItemNestedInput = {
    create?: XOR<InventoryTransactionCreateWithoutItemInput, InventoryTransactionUncheckedCreateWithoutItemInput> | InventoryTransactionCreateWithoutItemInput[] | InventoryTransactionUncheckedCreateWithoutItemInput[]
    connectOrCreate?: InventoryTransactionCreateOrConnectWithoutItemInput | InventoryTransactionCreateOrConnectWithoutItemInput[]
    upsert?: InventoryTransactionUpsertWithWhereUniqueWithoutItemInput | InventoryTransactionUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: InventoryTransactionCreateManyItemInputEnvelope
    set?: InventoryTransactionWhereUniqueInput | InventoryTransactionWhereUniqueInput[]
    disconnect?: InventoryTransactionWhereUniqueInput | InventoryTransactionWhereUniqueInput[]
    delete?: InventoryTransactionWhereUniqueInput | InventoryTransactionWhereUniqueInput[]
    connect?: InventoryTransactionWhereUniqueInput | InventoryTransactionWhereUniqueInput[]
    update?: InventoryTransactionUpdateWithWhereUniqueWithoutItemInput | InventoryTransactionUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: InventoryTransactionUpdateManyWithWhereWithoutItemInput | InventoryTransactionUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: InventoryTransactionScalarWhereInput | InventoryTransactionScalarWhereInput[]
  }

  export type SalesRecordUpdateManyWithoutItemNestedInput = {
    create?: XOR<SalesRecordCreateWithoutItemInput, SalesRecordUncheckedCreateWithoutItemInput> | SalesRecordCreateWithoutItemInput[] | SalesRecordUncheckedCreateWithoutItemInput[]
    connectOrCreate?: SalesRecordCreateOrConnectWithoutItemInput | SalesRecordCreateOrConnectWithoutItemInput[]
    upsert?: SalesRecordUpsertWithWhereUniqueWithoutItemInput | SalesRecordUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: SalesRecordCreateManyItemInputEnvelope
    set?: SalesRecordWhereUniqueInput | SalesRecordWhereUniqueInput[]
    disconnect?: SalesRecordWhereUniqueInput | SalesRecordWhereUniqueInput[]
    delete?: SalesRecordWhereUniqueInput | SalesRecordWhereUniqueInput[]
    connect?: SalesRecordWhereUniqueInput | SalesRecordWhereUniqueInput[]
    update?: SalesRecordUpdateWithWhereUniqueWithoutItemInput | SalesRecordUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: SalesRecordUpdateManyWithWhereWithoutItemInput | SalesRecordUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: SalesRecordScalarWhereInput | SalesRecordScalarWhereInput[]
  }

  export type QualityCheckUpdateManyWithoutItemNestedInput = {
    create?: XOR<QualityCheckCreateWithoutItemInput, QualityCheckUncheckedCreateWithoutItemInput> | QualityCheckCreateWithoutItemInput[] | QualityCheckUncheckedCreateWithoutItemInput[]
    connectOrCreate?: QualityCheckCreateOrConnectWithoutItemInput | QualityCheckCreateOrConnectWithoutItemInput[]
    upsert?: QualityCheckUpsertWithWhereUniqueWithoutItemInput | QualityCheckUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: QualityCheckCreateManyItemInputEnvelope
    set?: QualityCheckWhereUniqueInput | QualityCheckWhereUniqueInput[]
    disconnect?: QualityCheckWhereUniqueInput | QualityCheckWhereUniqueInput[]
    delete?: QualityCheckWhereUniqueInput | QualityCheckWhereUniqueInput[]
    connect?: QualityCheckWhereUniqueInput | QualityCheckWhereUniqueInput[]
    update?: QualityCheckUpdateWithWhereUniqueWithoutItemInput | QualityCheckUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: QualityCheckUpdateManyWithWhereWithoutItemInput | QualityCheckUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: QualityCheckScalarWhereInput | QualityCheckScalarWhereInput[]
  }

  export type InventoryMovementUpdateManyWithoutItemNestedInput = {
    create?: XOR<InventoryMovementCreateWithoutItemInput, InventoryMovementUncheckedCreateWithoutItemInput> | InventoryMovementCreateWithoutItemInput[] | InventoryMovementUncheckedCreateWithoutItemInput[]
    connectOrCreate?: InventoryMovementCreateOrConnectWithoutItemInput | InventoryMovementCreateOrConnectWithoutItemInput[]
    upsert?: InventoryMovementUpsertWithWhereUniqueWithoutItemInput | InventoryMovementUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: InventoryMovementCreateManyItemInputEnvelope
    set?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    disconnect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    delete?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    connect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    update?: InventoryMovementUpdateWithWhereUniqueWithoutItemInput | InventoryMovementUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: InventoryMovementUpdateManyWithWhereWithoutItemInput | InventoryMovementUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: InventoryMovementScalarWhereInput | InventoryMovementScalarWhereInput[]
  }

  export type ReservationUpdateManyWithoutItemNestedInput = {
    create?: XOR<ReservationCreateWithoutItemInput, ReservationUncheckedCreateWithoutItemInput> | ReservationCreateWithoutItemInput[] | ReservationUncheckedCreateWithoutItemInput[]
    connectOrCreate?: ReservationCreateOrConnectWithoutItemInput | ReservationCreateOrConnectWithoutItemInput[]
    upsert?: ReservationUpsertWithWhereUniqueWithoutItemInput | ReservationUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: ReservationCreateManyItemInputEnvelope
    set?: ReservationWhereUniqueInput | ReservationWhereUniqueInput[]
    disconnect?: ReservationWhereUniqueInput | ReservationWhereUniqueInput[]
    delete?: ReservationWhereUniqueInput | ReservationWhereUniqueInput[]
    connect?: ReservationWhereUniqueInput | ReservationWhereUniqueInput[]
    update?: ReservationUpdateWithWhereUniqueWithoutItemInput | ReservationUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: ReservationUpdateManyWithWhereWithoutItemInput | ReservationUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: ReservationScalarWhereInput | ReservationScalarWhereInput[]
  }

  export type InventoryTransactionUncheckedUpdateManyWithoutItemNestedInput = {
    create?: XOR<InventoryTransactionCreateWithoutItemInput, InventoryTransactionUncheckedCreateWithoutItemInput> | InventoryTransactionCreateWithoutItemInput[] | InventoryTransactionUncheckedCreateWithoutItemInput[]
    connectOrCreate?: InventoryTransactionCreateOrConnectWithoutItemInput | InventoryTransactionCreateOrConnectWithoutItemInput[]
    upsert?: InventoryTransactionUpsertWithWhereUniqueWithoutItemInput | InventoryTransactionUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: InventoryTransactionCreateManyItemInputEnvelope
    set?: InventoryTransactionWhereUniqueInput | InventoryTransactionWhereUniqueInput[]
    disconnect?: InventoryTransactionWhereUniqueInput | InventoryTransactionWhereUniqueInput[]
    delete?: InventoryTransactionWhereUniqueInput | InventoryTransactionWhereUniqueInput[]
    connect?: InventoryTransactionWhereUniqueInput | InventoryTransactionWhereUniqueInput[]
    update?: InventoryTransactionUpdateWithWhereUniqueWithoutItemInput | InventoryTransactionUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: InventoryTransactionUpdateManyWithWhereWithoutItemInput | InventoryTransactionUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: InventoryTransactionScalarWhereInput | InventoryTransactionScalarWhereInput[]
  }

  export type SalesRecordUncheckedUpdateManyWithoutItemNestedInput = {
    create?: XOR<SalesRecordCreateWithoutItemInput, SalesRecordUncheckedCreateWithoutItemInput> | SalesRecordCreateWithoutItemInput[] | SalesRecordUncheckedCreateWithoutItemInput[]
    connectOrCreate?: SalesRecordCreateOrConnectWithoutItemInput | SalesRecordCreateOrConnectWithoutItemInput[]
    upsert?: SalesRecordUpsertWithWhereUniqueWithoutItemInput | SalesRecordUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: SalesRecordCreateManyItemInputEnvelope
    set?: SalesRecordWhereUniqueInput | SalesRecordWhereUniqueInput[]
    disconnect?: SalesRecordWhereUniqueInput | SalesRecordWhereUniqueInput[]
    delete?: SalesRecordWhereUniqueInput | SalesRecordWhereUniqueInput[]
    connect?: SalesRecordWhereUniqueInput | SalesRecordWhereUniqueInput[]
    update?: SalesRecordUpdateWithWhereUniqueWithoutItemInput | SalesRecordUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: SalesRecordUpdateManyWithWhereWithoutItemInput | SalesRecordUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: SalesRecordScalarWhereInput | SalesRecordScalarWhereInput[]
  }

  export type QualityCheckUncheckedUpdateManyWithoutItemNestedInput = {
    create?: XOR<QualityCheckCreateWithoutItemInput, QualityCheckUncheckedCreateWithoutItemInput> | QualityCheckCreateWithoutItemInput[] | QualityCheckUncheckedCreateWithoutItemInput[]
    connectOrCreate?: QualityCheckCreateOrConnectWithoutItemInput | QualityCheckCreateOrConnectWithoutItemInput[]
    upsert?: QualityCheckUpsertWithWhereUniqueWithoutItemInput | QualityCheckUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: QualityCheckCreateManyItemInputEnvelope
    set?: QualityCheckWhereUniqueInput | QualityCheckWhereUniqueInput[]
    disconnect?: QualityCheckWhereUniqueInput | QualityCheckWhereUniqueInput[]
    delete?: QualityCheckWhereUniqueInput | QualityCheckWhereUniqueInput[]
    connect?: QualityCheckWhereUniqueInput | QualityCheckWhereUniqueInput[]
    update?: QualityCheckUpdateWithWhereUniqueWithoutItemInput | QualityCheckUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: QualityCheckUpdateManyWithWhereWithoutItemInput | QualityCheckUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: QualityCheckScalarWhereInput | QualityCheckScalarWhereInput[]
  }

  export type InventoryMovementUncheckedUpdateManyWithoutItemNestedInput = {
    create?: XOR<InventoryMovementCreateWithoutItemInput, InventoryMovementUncheckedCreateWithoutItemInput> | InventoryMovementCreateWithoutItemInput[] | InventoryMovementUncheckedCreateWithoutItemInput[]
    connectOrCreate?: InventoryMovementCreateOrConnectWithoutItemInput | InventoryMovementCreateOrConnectWithoutItemInput[]
    upsert?: InventoryMovementUpsertWithWhereUniqueWithoutItemInput | InventoryMovementUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: InventoryMovementCreateManyItemInputEnvelope
    set?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    disconnect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    delete?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    connect?: InventoryMovementWhereUniqueInput | InventoryMovementWhereUniqueInput[]
    update?: InventoryMovementUpdateWithWhereUniqueWithoutItemInput | InventoryMovementUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: InventoryMovementUpdateManyWithWhereWithoutItemInput | InventoryMovementUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: InventoryMovementScalarWhereInput | InventoryMovementScalarWhereInput[]
  }

  export type ReservationUncheckedUpdateManyWithoutItemNestedInput = {
    create?: XOR<ReservationCreateWithoutItemInput, ReservationUncheckedCreateWithoutItemInput> | ReservationCreateWithoutItemInput[] | ReservationUncheckedCreateWithoutItemInput[]
    connectOrCreate?: ReservationCreateOrConnectWithoutItemInput | ReservationCreateOrConnectWithoutItemInput[]
    upsert?: ReservationUpsertWithWhereUniqueWithoutItemInput | ReservationUpsertWithWhereUniqueWithoutItemInput[]
    createMany?: ReservationCreateManyItemInputEnvelope
    set?: ReservationWhereUniqueInput | ReservationWhereUniqueInput[]
    disconnect?: ReservationWhereUniqueInput | ReservationWhereUniqueInput[]
    delete?: ReservationWhereUniqueInput | ReservationWhereUniqueInput[]
    connect?: ReservationWhereUniqueInput | ReservationWhereUniqueInput[]
    update?: ReservationUpdateWithWhereUniqueWithoutItemInput | ReservationUpdateWithWhereUniqueWithoutItemInput[]
    updateMany?: ReservationUpdateManyWithWhereWithoutItemInput | ReservationUpdateManyWithWhereWithoutItemInput[]
    deleteMany?: ReservationScalarWhereInput | ReservationScalarWhereInput[]
  }

  export type InventoryItemCreateNestedOneWithoutTransactionsInput = {
    create?: XOR<InventoryItemCreateWithoutTransactionsInput, InventoryItemUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: InventoryItemCreateOrConnectWithoutTransactionsInput
    connect?: InventoryItemWhereUniqueInput
  }

  export type EnumTransactionTypeFieldUpdateOperationsInput = {
    set?: $Enums.TransactionType
  }

  export type InventoryItemUpdateOneRequiredWithoutTransactionsNestedInput = {
    create?: XOR<InventoryItemCreateWithoutTransactionsInput, InventoryItemUncheckedCreateWithoutTransactionsInput>
    connectOrCreate?: InventoryItemCreateOrConnectWithoutTransactionsInput
    upsert?: InventoryItemUpsertWithoutTransactionsInput
    connect?: InventoryItemWhereUniqueInput
    update?: XOR<XOR<InventoryItemUpdateToOneWithWhereWithoutTransactionsInput, InventoryItemUpdateWithoutTransactionsInput>, InventoryItemUncheckedUpdateWithoutTransactionsInput>
  }

  export type InventoryItemCreateNestedOneWithoutSalesRecordsInput = {
    create?: XOR<InventoryItemCreateWithoutSalesRecordsInput, InventoryItemUncheckedCreateWithoutSalesRecordsInput>
    connectOrCreate?: InventoryItemCreateOrConnectWithoutSalesRecordsInput
    connect?: InventoryItemWhereUniqueInput
  }

  export type InventoryItemUpdateOneRequiredWithoutSalesRecordsNestedInput = {
    create?: XOR<InventoryItemCreateWithoutSalesRecordsInput, InventoryItemUncheckedCreateWithoutSalesRecordsInput>
    connectOrCreate?: InventoryItemCreateOrConnectWithoutSalesRecordsInput
    upsert?: InventoryItemUpsertWithoutSalesRecordsInput
    connect?: InventoryItemWhereUniqueInput
    update?: XOR<XOR<InventoryItemUpdateToOneWithWhereWithoutSalesRecordsInput, InventoryItemUpdateWithoutSalesRecordsInput>, InventoryItemUncheckedUpdateWithoutSalesRecordsInput>
  }

  export type QualityCheckCreateimagesInput = {
    set: string[]
  }

  export type InventoryItemCreateNestedOneWithoutQualityChecksInput = {
    create?: XOR<InventoryItemCreateWithoutQualityChecksInput, InventoryItemUncheckedCreateWithoutQualityChecksInput>
    connectOrCreate?: InventoryItemCreateOrConnectWithoutQualityChecksInput
    connect?: InventoryItemWhereUniqueInput
  }

  export type EnumCheckTypeFieldUpdateOperationsInput = {
    set?: $Enums.CheckType
  }

  export type EnumCheckResultFieldUpdateOperationsInput = {
    set?: $Enums.CheckResult
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type QualityCheckUpdateimagesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type InventoryItemUpdateOneRequiredWithoutQualityChecksNestedInput = {
    create?: XOR<InventoryItemCreateWithoutQualityChecksInput, InventoryItemUncheckedCreateWithoutQualityChecksInput>
    connectOrCreate?: InventoryItemCreateOrConnectWithoutQualityChecksInput
    upsert?: InventoryItemUpsertWithoutQualityChecksInput
    connect?: InventoryItemWhereUniqueInput
    update?: XOR<XOR<InventoryItemUpdateToOneWithWhereWithoutQualityChecksInput, InventoryItemUpdateWithoutQualityChecksInput>, InventoryItemUncheckedUpdateWithoutQualityChecksInput>
  }

  export type InventoryItemCreateNestedOneWithoutReservationsInput = {
    create?: XOR<InventoryItemCreateWithoutReservationsInput, InventoryItemUncheckedCreateWithoutReservationsInput>
    connectOrCreate?: InventoryItemCreateOrConnectWithoutReservationsInput
    connect?: InventoryItemWhereUniqueInput
  }

  export type EnumReservationStatusFieldUpdateOperationsInput = {
    set?: $Enums.ReservationStatus
  }

  export type InventoryItemUpdateOneRequiredWithoutReservationsNestedInput = {
    create?: XOR<InventoryItemCreateWithoutReservationsInput, InventoryItemUncheckedCreateWithoutReservationsInput>
    connectOrCreate?: InventoryItemCreateOrConnectWithoutReservationsInput
    upsert?: InventoryItemUpsertWithoutReservationsInput
    connect?: InventoryItemWhereUniqueInput
    update?: XOR<XOR<InventoryItemUpdateToOneWithWhereWithoutReservationsInput, InventoryItemUpdateWithoutReservationsInput>, InventoryItemUncheckedUpdateWithoutReservationsInput>
  }

  export type InventoryItemCreateNestedOneWithoutMovementsInput = {
    create?: XOR<InventoryItemCreateWithoutMovementsInput, InventoryItemUncheckedCreateWithoutMovementsInput>
    connectOrCreate?: InventoryItemCreateOrConnectWithoutMovementsInput
    connect?: InventoryItemWhereUniqueInput
  }

  export type WarehouseCreateNestedOneWithoutMovementsInput = {
    create?: XOR<WarehouseCreateWithoutMovementsInput, WarehouseUncheckedCreateWithoutMovementsInput>
    connectOrCreate?: WarehouseCreateOrConnectWithoutMovementsInput
    connect?: WarehouseWhereUniqueInput
  }

  export type ItemCategoryCreateNestedOneWithoutMovementsInput = {
    create?: XOR<ItemCategoryCreateWithoutMovementsInput, ItemCategoryUncheckedCreateWithoutMovementsInput>
    connectOrCreate?: ItemCategoryCreateOrConnectWithoutMovementsInput
    connect?: ItemCategoryWhereUniqueInput
  }

  export type EnumMovementTypeFieldUpdateOperationsInput = {
    set?: $Enums.MovementType
  }

  export type EnumMovementDirectionFieldUpdateOperationsInput = {
    set?: $Enums.MovementDirection
  }

  export type InventoryItemUpdateOneRequiredWithoutMovementsNestedInput = {
    create?: XOR<InventoryItemCreateWithoutMovementsInput, InventoryItemUncheckedCreateWithoutMovementsInput>
    connectOrCreate?: InventoryItemCreateOrConnectWithoutMovementsInput
    upsert?: InventoryItemUpsertWithoutMovementsInput
    connect?: InventoryItemWhereUniqueInput
    update?: XOR<XOR<InventoryItemUpdateToOneWithWhereWithoutMovementsInput, InventoryItemUpdateWithoutMovementsInput>, InventoryItemUncheckedUpdateWithoutMovementsInput>
  }

  export type WarehouseUpdateOneRequiredWithoutMovementsNestedInput = {
    create?: XOR<WarehouseCreateWithoutMovementsInput, WarehouseUncheckedCreateWithoutMovementsInput>
    connectOrCreate?: WarehouseCreateOrConnectWithoutMovementsInput
    upsert?: WarehouseUpsertWithoutMovementsInput
    connect?: WarehouseWhereUniqueInput
    update?: XOR<XOR<WarehouseUpdateToOneWithWhereWithoutMovementsInput, WarehouseUpdateWithoutMovementsInput>, WarehouseUncheckedUpdateWithoutMovementsInput>
  }

  export type ItemCategoryUpdateOneRequiredWithoutMovementsNestedInput = {
    create?: XOR<ItemCategoryCreateWithoutMovementsInput, ItemCategoryUncheckedCreateWithoutMovementsInput>
    connectOrCreate?: ItemCategoryCreateOrConnectWithoutMovementsInput
    upsert?: ItemCategoryUpsertWithoutMovementsInput
    connect?: ItemCategoryWhereUniqueInput
    update?: XOR<XOR<ItemCategoryUpdateToOneWithWhereWithoutMovementsInput, ItemCategoryUpdateWithoutMovementsInput>, ItemCategoryUncheckedUpdateWithoutMovementsInput>
  }

  export type ItemCategoryCreateNestedOneWithoutPricingRulesInput = {
    create?: XOR<ItemCategoryCreateWithoutPricingRulesInput, ItemCategoryUncheckedCreateWithoutPricingRulesInput>
    connectOrCreate?: ItemCategoryCreateOrConnectWithoutPricingRulesInput
    connect?: ItemCategoryWhereUniqueInput
  }

  export type EnumPriceTypeFieldUpdateOperationsInput = {
    set?: $Enums.PriceType
  }

  export type ItemCategoryUpdateOneRequiredWithoutPricingRulesNestedInput = {
    create?: XOR<ItemCategoryCreateWithoutPricingRulesInput, ItemCategoryUncheckedCreateWithoutPricingRulesInput>
    connectOrCreate?: ItemCategoryCreateOrConnectWithoutPricingRulesInput
    upsert?: ItemCategoryUpsertWithoutPricingRulesInput
    connect?: ItemCategoryWhereUniqueInput
    update?: XOR<XOR<ItemCategoryUpdateToOneWithWhereWithoutPricingRulesInput, ItemCategoryUpdateWithoutPricingRulesInput>, ItemCategoryUncheckedUpdateWithoutPricingRulesInput>
  }

  export type EnumAlertTypeFieldUpdateOperationsInput = {
    set?: $Enums.AlertType
  }

  export type EnumAlertLevelFieldUpdateOperationsInput = {
    set?: $Enums.AlertLevel
  }

  export type EnumAlertStatusFieldUpdateOperationsInput = {
    set?: $Enums.AlertStatus
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumWarehouseTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.WarehouseType | EnumWarehouseTypeFieldRefInput<$PrismaModel>
    in?: $Enums.WarehouseType[] | ListEnumWarehouseTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.WarehouseType[] | ListEnumWarehouseTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumWarehouseTypeFilter<$PrismaModel> | $Enums.WarehouseType
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedEnumWarehouseStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.WarehouseStatus | EnumWarehouseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.WarehouseStatus[] | ListEnumWarehouseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.WarehouseStatus[] | ListEnumWarehouseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumWarehouseStatusFilter<$PrismaModel> | $Enums.WarehouseStatus
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedEnumWarehouseTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.WarehouseType | EnumWarehouseTypeFieldRefInput<$PrismaModel>
    in?: $Enums.WarehouseType[] | ListEnumWarehouseTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.WarehouseType[] | ListEnumWarehouseTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumWarehouseTypeWithAggregatesFilter<$PrismaModel> | $Enums.WarehouseType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumWarehouseTypeFilter<$PrismaModel>
    _max?: NestedEnumWarehouseTypeFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel> | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type NestedEnumWarehouseStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.WarehouseStatus | EnumWarehouseStatusFieldRefInput<$PrismaModel>
    in?: $Enums.WarehouseStatus[] | ListEnumWarehouseStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.WarehouseStatus[] | ListEnumWarehouseStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumWarehouseStatusWithAggregatesFilter<$PrismaModel> | $Enums.WarehouseStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumWarehouseStatusFilter<$PrismaModel>
    _max?: NestedEnumWarehouseStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBigIntNullableFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableFilter<$PrismaModel> | bigint | number | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBigIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel> | null
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel> | null
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntNullableWithAggregatesFilter<$PrismaModel> | bigint | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedBigIntNullableFilter<$PrismaModel>
    _min?: NestedBigIntNullableFilter<$PrismaModel>
    _max?: NestedBigIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedEnumInventoryStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.InventoryStatus | EnumInventoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInventoryStatusFilter<$PrismaModel> | $Enums.InventoryStatus
  }

  export type NestedEnumItemTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.ItemType | EnumItemTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ItemType[] | ListEnumItemTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ItemType[] | ListEnumItemTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumItemTypeFilter<$PrismaModel> | $Enums.ItemType
  }

  export type NestedEnumItemConditionFilter<$PrismaModel = never> = {
    equals?: $Enums.ItemCondition | EnumItemConditionFieldRefInput<$PrismaModel>
    in?: $Enums.ItemCondition[] | ListEnumItemConditionFieldRefInput<$PrismaModel>
    notIn?: $Enums.ItemCondition[] | ListEnumItemConditionFieldRefInput<$PrismaModel>
    not?: NestedEnumItemConditionFilter<$PrismaModel> | $Enums.ItemCondition
  }

  export type NestedEnumProcessingStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProcessingStatus | EnumProcessingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProcessingStatus[] | ListEnumProcessingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProcessingStatus[] | ListEnumProcessingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProcessingStatusFilter<$PrismaModel> | $Enums.ProcessingStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedEnumInventoryStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.InventoryStatus | EnumInventoryStatusFieldRefInput<$PrismaModel>
    in?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.InventoryStatus[] | ListEnumInventoryStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumInventoryStatusWithAggregatesFilter<$PrismaModel> | $Enums.InventoryStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumInventoryStatusFilter<$PrismaModel>
    _max?: NestedEnumInventoryStatusFilter<$PrismaModel>
  }

  export type NestedEnumItemTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ItemType | EnumItemTypeFieldRefInput<$PrismaModel>
    in?: $Enums.ItemType[] | ListEnumItemTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.ItemType[] | ListEnumItemTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumItemTypeWithAggregatesFilter<$PrismaModel> | $Enums.ItemType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumItemTypeFilter<$PrismaModel>
    _max?: NestedEnumItemTypeFilter<$PrismaModel>
  }

  export type NestedEnumItemConditionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ItemCondition | EnumItemConditionFieldRefInput<$PrismaModel>
    in?: $Enums.ItemCondition[] | ListEnumItemConditionFieldRefInput<$PrismaModel>
    notIn?: $Enums.ItemCondition[] | ListEnumItemConditionFieldRefInput<$PrismaModel>
    not?: NestedEnumItemConditionWithAggregatesFilter<$PrismaModel> | $Enums.ItemCondition
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumItemConditionFilter<$PrismaModel>
    _max?: NestedEnumItemConditionFilter<$PrismaModel>
  }

  export type NestedEnumProcessingStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProcessingStatus | EnumProcessingStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProcessingStatus[] | ListEnumProcessingStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProcessingStatus[] | ListEnumProcessingStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProcessingStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProcessingStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProcessingStatusFilter<$PrismaModel>
    _max?: NestedEnumProcessingStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedEnumTransactionTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeFilter<$PrismaModel> | $Enums.TransactionType
  }

  export type NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TransactionType | EnumTransactionTypeFieldRefInput<$PrismaModel>
    in?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.TransactionType[] | ListEnumTransactionTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumTransactionTypeWithAggregatesFilter<$PrismaModel> | $Enums.TransactionType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTransactionTypeFilter<$PrismaModel>
    _max?: NestedEnumTransactionTypeFilter<$PrismaModel>
  }

  export type NestedEnumCheckTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckType | EnumCheckTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CheckType[] | ListEnumCheckTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CheckType[] | ListEnumCheckTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCheckTypeFilter<$PrismaModel> | $Enums.CheckType
  }

  export type NestedEnumCheckResultFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckResult | EnumCheckResultFieldRefInput<$PrismaModel>
    in?: $Enums.CheckResult[] | ListEnumCheckResultFieldRefInput<$PrismaModel>
    notIn?: $Enums.CheckResult[] | ListEnumCheckResultFieldRefInput<$PrismaModel>
    not?: NestedEnumCheckResultFilter<$PrismaModel> | $Enums.CheckResult
  }

  export type NestedEnumCheckTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckType | EnumCheckTypeFieldRefInput<$PrismaModel>
    in?: $Enums.CheckType[] | ListEnumCheckTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.CheckType[] | ListEnumCheckTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumCheckTypeWithAggregatesFilter<$PrismaModel> | $Enums.CheckType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCheckTypeFilter<$PrismaModel>
    _max?: NestedEnumCheckTypeFilter<$PrismaModel>
  }

  export type NestedEnumCheckResultWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CheckResult | EnumCheckResultFieldRefInput<$PrismaModel>
    in?: $Enums.CheckResult[] | ListEnumCheckResultFieldRefInput<$PrismaModel>
    notIn?: $Enums.CheckResult[] | ListEnumCheckResultFieldRefInput<$PrismaModel>
    not?: NestedEnumCheckResultWithAggregatesFilter<$PrismaModel> | $Enums.CheckResult
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCheckResultFilter<$PrismaModel>
    _max?: NestedEnumCheckResultFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedEnumReservationStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ReservationStatus | EnumReservationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReservationStatus[] | ListEnumReservationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReservationStatus[] | ListEnumReservationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReservationStatusFilter<$PrismaModel> | $Enums.ReservationStatus
  }

  export type NestedEnumReservationStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ReservationStatus | EnumReservationStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ReservationStatus[] | ListEnumReservationStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ReservationStatus[] | ListEnumReservationStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumReservationStatusWithAggregatesFilter<$PrismaModel> | $Enums.ReservationStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumReservationStatusFilter<$PrismaModel>
    _max?: NestedEnumReservationStatusFilter<$PrismaModel>
  }

  export type NestedEnumMovementTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.MovementType | EnumMovementTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MovementType[] | ListEnumMovementTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MovementType[] | ListEnumMovementTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMovementTypeFilter<$PrismaModel> | $Enums.MovementType
  }

  export type NestedEnumMovementDirectionFilter<$PrismaModel = never> = {
    equals?: $Enums.MovementDirection | EnumMovementDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.MovementDirection[] | ListEnumMovementDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.MovementDirection[] | ListEnumMovementDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumMovementDirectionFilter<$PrismaModel> | $Enums.MovementDirection
  }

  export type NestedEnumMovementTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MovementType | EnumMovementTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MovementType[] | ListEnumMovementTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MovementType[] | ListEnumMovementTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMovementTypeWithAggregatesFilter<$PrismaModel> | $Enums.MovementType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMovementTypeFilter<$PrismaModel>
    _max?: NestedEnumMovementTypeFilter<$PrismaModel>
  }

  export type NestedEnumMovementDirectionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MovementDirection | EnumMovementDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.MovementDirection[] | ListEnumMovementDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.MovementDirection[] | ListEnumMovementDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumMovementDirectionWithAggregatesFilter<$PrismaModel> | $Enums.MovementDirection
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMovementDirectionFilter<$PrismaModel>
    _max?: NestedEnumMovementDirectionFilter<$PrismaModel>
  }

  export type NestedEnumPriceTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.PriceType | EnumPriceTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PriceType[] | ListEnumPriceTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PriceType[] | ListEnumPriceTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPriceTypeFilter<$PrismaModel> | $Enums.PriceType
  }

  export type NestedEnumPriceTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PriceType | EnumPriceTypeFieldRefInput<$PrismaModel>
    in?: $Enums.PriceType[] | ListEnumPriceTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.PriceType[] | ListEnumPriceTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumPriceTypeWithAggregatesFilter<$PrismaModel> | $Enums.PriceType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPriceTypeFilter<$PrismaModel>
    _max?: NestedEnumPriceTypeFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumAlertTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertType | EnumAlertTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertTypeFilter<$PrismaModel> | $Enums.AlertType
  }

  export type NestedEnumAlertLevelFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertLevel | EnumAlertLevelFieldRefInput<$PrismaModel>
    in?: $Enums.AlertLevel[] | ListEnumAlertLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertLevel[] | ListEnumAlertLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertLevelFilter<$PrismaModel> | $Enums.AlertLevel
  }

  export type NestedEnumAlertStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertStatus | EnumAlertStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AlertStatus[] | ListEnumAlertStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertStatus[] | ListEnumAlertStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertStatusFilter<$PrismaModel> | $Enums.AlertStatus
  }

  export type NestedEnumAlertTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertType | EnumAlertTypeFieldRefInput<$PrismaModel>
    in?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertType[] | ListEnumAlertTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertTypeWithAggregatesFilter<$PrismaModel> | $Enums.AlertType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAlertTypeFilter<$PrismaModel>
    _max?: NestedEnumAlertTypeFilter<$PrismaModel>
  }

  export type NestedEnumAlertLevelWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertLevel | EnumAlertLevelFieldRefInput<$PrismaModel>
    in?: $Enums.AlertLevel[] | ListEnumAlertLevelFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertLevel[] | ListEnumAlertLevelFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertLevelWithAggregatesFilter<$PrismaModel> | $Enums.AlertLevel
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAlertLevelFilter<$PrismaModel>
    _max?: NestedEnumAlertLevelFilter<$PrismaModel>
  }

  export type NestedEnumAlertStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.AlertStatus | EnumAlertStatusFieldRefInput<$PrismaModel>
    in?: $Enums.AlertStatus[] | ListEnumAlertStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.AlertStatus[] | ListEnumAlertStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumAlertStatusWithAggregatesFilter<$PrismaModel> | $Enums.AlertStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumAlertStatusFilter<$PrismaModel>
    _max?: NestedEnumAlertStatusFilter<$PrismaModel>
  }

  export type InventoryItemCreateWithoutWarehouseInput = {
    id?: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    category: ItemCategoryCreateNestedOneWithoutInventoryItemsInput
    transactions?: InventoryTransactionCreateNestedManyWithoutItemInput
    salesRecords?: SalesRecordCreateNestedManyWithoutItemInput
    qualityChecks?: QualityCheckCreateNestedManyWithoutItemInput
    movements?: InventoryMovementCreateNestedManyWithoutItemInput
    reservations?: ReservationCreateNestedManyWithoutItemInput
  }

  export type InventoryItemUncheckedCreateWithoutWarehouseInput = {
    id?: bigint | number
    categoryId: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    transactions?: InventoryTransactionUncheckedCreateNestedManyWithoutItemInput
    salesRecords?: SalesRecordUncheckedCreateNestedManyWithoutItemInput
    qualityChecks?: QualityCheckUncheckedCreateNestedManyWithoutItemInput
    movements?: InventoryMovementUncheckedCreateNestedManyWithoutItemInput
    reservations?: ReservationUncheckedCreateNestedManyWithoutItemInput
  }

  export type InventoryItemCreateOrConnectWithoutWarehouseInput = {
    where: InventoryItemWhereUniqueInput
    create: XOR<InventoryItemCreateWithoutWarehouseInput, InventoryItemUncheckedCreateWithoutWarehouseInput>
  }

  export type InventoryItemCreateManyWarehouseInputEnvelope = {
    data: InventoryItemCreateManyWarehouseInput | InventoryItemCreateManyWarehouseInput[]
    skipDuplicates?: boolean
  }

  export type InventoryMovementCreateWithoutWarehouseInput = {
    id?: bigint | number
    movementType: $Enums.MovementType
    direction: $Enums.MovementDirection
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice?: Decimal | DecimalJsLike | number | string | null
    totalAmount?: Decimal | DecimalJsLike | number | string | null
    beforeQty: Decimal | DecimalJsLike | number | string
    afterQty: Decimal | DecimalJsLike | number | string
    referenceType?: string | null
    referenceId?: bigint | number | null
    referenceNo?: string | null
    operatorId?: bigint | number | null
    operatorName?: string | null
    remark?: string | null
    createdAt?: Date | string
    item: InventoryItemCreateNestedOneWithoutMovementsInput
    category: ItemCategoryCreateNestedOneWithoutMovementsInput
  }

  export type InventoryMovementUncheckedCreateWithoutWarehouseInput = {
    id?: bigint | number
    itemId: bigint | number
    categoryId: bigint | number
    movementType: $Enums.MovementType
    direction: $Enums.MovementDirection
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice?: Decimal | DecimalJsLike | number | string | null
    totalAmount?: Decimal | DecimalJsLike | number | string | null
    beforeQty: Decimal | DecimalJsLike | number | string
    afterQty: Decimal | DecimalJsLike | number | string
    referenceType?: string | null
    referenceId?: bigint | number | null
    referenceNo?: string | null
    operatorId?: bigint | number | null
    operatorName?: string | null
    remark?: string | null
    createdAt?: Date | string
  }

  export type InventoryMovementCreateOrConnectWithoutWarehouseInput = {
    where: InventoryMovementWhereUniqueInput
    create: XOR<InventoryMovementCreateWithoutWarehouseInput, InventoryMovementUncheckedCreateWithoutWarehouseInput>
  }

  export type InventoryMovementCreateManyWarehouseInputEnvelope = {
    data: InventoryMovementCreateManyWarehouseInput | InventoryMovementCreateManyWarehouseInput[]
    skipDuplicates?: boolean
  }

  export type InventoryItemUpsertWithWhereUniqueWithoutWarehouseInput = {
    where: InventoryItemWhereUniqueInput
    update: XOR<InventoryItemUpdateWithoutWarehouseInput, InventoryItemUncheckedUpdateWithoutWarehouseInput>
    create: XOR<InventoryItemCreateWithoutWarehouseInput, InventoryItemUncheckedCreateWithoutWarehouseInput>
  }

  export type InventoryItemUpdateWithWhereUniqueWithoutWarehouseInput = {
    where: InventoryItemWhereUniqueInput
    data: XOR<InventoryItemUpdateWithoutWarehouseInput, InventoryItemUncheckedUpdateWithoutWarehouseInput>
  }

  export type InventoryItemUpdateManyWithWhereWithoutWarehouseInput = {
    where: InventoryItemScalarWhereInput
    data: XOR<InventoryItemUpdateManyMutationInput, InventoryItemUncheckedUpdateManyWithoutWarehouseInput>
  }

  export type InventoryItemScalarWhereInput = {
    AND?: InventoryItemScalarWhereInput | InventoryItemScalarWhereInput[]
    OR?: InventoryItemScalarWhereInput[]
    NOT?: InventoryItemScalarWhereInput | InventoryItemScalarWhereInput[]
    id?: BigIntFilter<"InventoryItem"> | bigint | number
    warehouseId?: BigIntFilter<"InventoryItem"> | bigint | number
    categoryId?: BigIntFilter<"InventoryItem"> | bigint | number
    name?: StringFilter<"InventoryItem"> | string
    description?: StringNullableFilter<"InventoryItem"> | string | null
    unit?: StringFilter<"InventoryItem"> | string
    quantity?: DecimalFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string
    location?: StringNullableFilter<"InventoryItem"> | string | null
    status?: EnumInventoryStatusFilter<"InventoryItem"> | $Enums.InventoryStatus
    itemType?: EnumItemTypeFilter<"InventoryItem"> | $Enums.ItemType
    condition?: EnumItemConditionFilter<"InventoryItem"> | $Enums.ItemCondition
    sourceOrderId?: StringNullableFilter<"InventoryItem"> | string | null
    qualityGrade?: StringNullableFilter<"InventoryItem"> | string | null
    processingStatus?: EnumProcessingStatusFilter<"InventoryItem"> | $Enums.ProcessingStatus
    expiryDate?: DateTimeNullableFilter<"InventoryItem"> | Date | string | null
    batchNumber?: StringNullableFilter<"InventoryItem"> | string | null
    minStockLevel?: DecimalNullableFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: DecimalNullableFilter<"InventoryItem"> | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFilter<"InventoryItem"> | Date | string
    updatedAt?: DateTimeFilter<"InventoryItem"> | Date | string
  }

  export type InventoryMovementUpsertWithWhereUniqueWithoutWarehouseInput = {
    where: InventoryMovementWhereUniqueInput
    update: XOR<InventoryMovementUpdateWithoutWarehouseInput, InventoryMovementUncheckedUpdateWithoutWarehouseInput>
    create: XOR<InventoryMovementCreateWithoutWarehouseInput, InventoryMovementUncheckedCreateWithoutWarehouseInput>
  }

  export type InventoryMovementUpdateWithWhereUniqueWithoutWarehouseInput = {
    where: InventoryMovementWhereUniqueInput
    data: XOR<InventoryMovementUpdateWithoutWarehouseInput, InventoryMovementUncheckedUpdateWithoutWarehouseInput>
  }

  export type InventoryMovementUpdateManyWithWhereWithoutWarehouseInput = {
    where: InventoryMovementScalarWhereInput
    data: XOR<InventoryMovementUpdateManyMutationInput, InventoryMovementUncheckedUpdateManyWithoutWarehouseInput>
  }

  export type InventoryMovementScalarWhereInput = {
    AND?: InventoryMovementScalarWhereInput | InventoryMovementScalarWhereInput[]
    OR?: InventoryMovementScalarWhereInput[]
    NOT?: InventoryMovementScalarWhereInput | InventoryMovementScalarWhereInput[]
    id?: BigIntFilter<"InventoryMovement"> | bigint | number
    itemId?: BigIntFilter<"InventoryMovement"> | bigint | number
    warehouseId?: BigIntFilter<"InventoryMovement"> | bigint | number
    categoryId?: BigIntFilter<"InventoryMovement"> | bigint | number
    movementType?: EnumMovementTypeFilter<"InventoryMovement"> | $Enums.MovementType
    direction?: EnumMovementDirectionFilter<"InventoryMovement"> | $Enums.MovementDirection
    quantity?: DecimalFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalNullableFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string | null
    totalAmount?: DecimalNullableFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFilter<"InventoryMovement"> | Decimal | DecimalJsLike | number | string
    referenceType?: StringNullableFilter<"InventoryMovement"> | string | null
    referenceId?: BigIntNullableFilter<"InventoryMovement"> | bigint | number | null
    referenceNo?: StringNullableFilter<"InventoryMovement"> | string | null
    operatorId?: BigIntNullableFilter<"InventoryMovement"> | bigint | number | null
    operatorName?: StringNullableFilter<"InventoryMovement"> | string | null
    remark?: StringNullableFilter<"InventoryMovement"> | string | null
    createdAt?: DateTimeFilter<"InventoryMovement"> | Date | string
  }

  export type ItemCategoryCreateWithoutChildrenInput = {
    id?: bigint | number
    name: string
    code: string
    level?: number
    enabled?: boolean
    iconUrl?: string | null
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: ItemCategoryCreateNestedOneWithoutChildrenInput
    inventoryItems?: InventoryItemCreateNestedManyWithoutCategoryInput
    movements?: InventoryMovementCreateNestedManyWithoutCategoryInput
    pricingRules?: PricingRuleCreateNestedManyWithoutCategoryInput
  }

  export type ItemCategoryUncheckedCreateWithoutChildrenInput = {
    id?: bigint | number
    name: string
    code: string
    parentId?: bigint | number | null
    level?: number
    enabled?: boolean
    iconUrl?: string | null
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    inventoryItems?: InventoryItemUncheckedCreateNestedManyWithoutCategoryInput
    movements?: InventoryMovementUncheckedCreateNestedManyWithoutCategoryInput
    pricingRules?: PricingRuleUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type ItemCategoryCreateOrConnectWithoutChildrenInput = {
    where: ItemCategoryWhereUniqueInput
    create: XOR<ItemCategoryCreateWithoutChildrenInput, ItemCategoryUncheckedCreateWithoutChildrenInput>
  }

  export type ItemCategoryCreateWithoutParentInput = {
    id?: bigint | number
    name: string
    code: string
    level?: number
    enabled?: boolean
    iconUrl?: string | null
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: ItemCategoryCreateNestedManyWithoutParentInput
    inventoryItems?: InventoryItemCreateNestedManyWithoutCategoryInput
    movements?: InventoryMovementCreateNestedManyWithoutCategoryInput
    pricingRules?: PricingRuleCreateNestedManyWithoutCategoryInput
  }

  export type ItemCategoryUncheckedCreateWithoutParentInput = {
    id?: bigint | number
    name: string
    code: string
    level?: number
    enabled?: boolean
    iconUrl?: string | null
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: ItemCategoryUncheckedCreateNestedManyWithoutParentInput
    inventoryItems?: InventoryItemUncheckedCreateNestedManyWithoutCategoryInput
    movements?: InventoryMovementUncheckedCreateNestedManyWithoutCategoryInput
    pricingRules?: PricingRuleUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type ItemCategoryCreateOrConnectWithoutParentInput = {
    where: ItemCategoryWhereUniqueInput
    create: XOR<ItemCategoryCreateWithoutParentInput, ItemCategoryUncheckedCreateWithoutParentInput>
  }

  export type ItemCategoryCreateManyParentInputEnvelope = {
    data: ItemCategoryCreateManyParentInput | ItemCategoryCreateManyParentInput[]
    skipDuplicates?: boolean
  }

  export type InventoryItemCreateWithoutCategoryInput = {
    id?: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    warehouse: WarehouseCreateNestedOneWithoutInventoryItemsInput
    transactions?: InventoryTransactionCreateNestedManyWithoutItemInput
    salesRecords?: SalesRecordCreateNestedManyWithoutItemInput
    qualityChecks?: QualityCheckCreateNestedManyWithoutItemInput
    movements?: InventoryMovementCreateNestedManyWithoutItemInput
    reservations?: ReservationCreateNestedManyWithoutItemInput
  }

  export type InventoryItemUncheckedCreateWithoutCategoryInput = {
    id?: bigint | number
    warehouseId: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    transactions?: InventoryTransactionUncheckedCreateNestedManyWithoutItemInput
    salesRecords?: SalesRecordUncheckedCreateNestedManyWithoutItemInput
    qualityChecks?: QualityCheckUncheckedCreateNestedManyWithoutItemInput
    movements?: InventoryMovementUncheckedCreateNestedManyWithoutItemInput
    reservations?: ReservationUncheckedCreateNestedManyWithoutItemInput
  }

  export type InventoryItemCreateOrConnectWithoutCategoryInput = {
    where: InventoryItemWhereUniqueInput
    create: XOR<InventoryItemCreateWithoutCategoryInput, InventoryItemUncheckedCreateWithoutCategoryInput>
  }

  export type InventoryItemCreateManyCategoryInputEnvelope = {
    data: InventoryItemCreateManyCategoryInput | InventoryItemCreateManyCategoryInput[]
    skipDuplicates?: boolean
  }

  export type InventoryMovementCreateWithoutCategoryInput = {
    id?: bigint | number
    movementType: $Enums.MovementType
    direction: $Enums.MovementDirection
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice?: Decimal | DecimalJsLike | number | string | null
    totalAmount?: Decimal | DecimalJsLike | number | string | null
    beforeQty: Decimal | DecimalJsLike | number | string
    afterQty: Decimal | DecimalJsLike | number | string
    referenceType?: string | null
    referenceId?: bigint | number | null
    referenceNo?: string | null
    operatorId?: bigint | number | null
    operatorName?: string | null
    remark?: string | null
    createdAt?: Date | string
    item: InventoryItemCreateNestedOneWithoutMovementsInput
    warehouse: WarehouseCreateNestedOneWithoutMovementsInput
  }

  export type InventoryMovementUncheckedCreateWithoutCategoryInput = {
    id?: bigint | number
    itemId: bigint | number
    warehouseId: bigint | number
    movementType: $Enums.MovementType
    direction: $Enums.MovementDirection
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice?: Decimal | DecimalJsLike | number | string | null
    totalAmount?: Decimal | DecimalJsLike | number | string | null
    beforeQty: Decimal | DecimalJsLike | number | string
    afterQty: Decimal | DecimalJsLike | number | string
    referenceType?: string | null
    referenceId?: bigint | number | null
    referenceNo?: string | null
    operatorId?: bigint | number | null
    operatorName?: string | null
    remark?: string | null
    createdAt?: Date | string
  }

  export type InventoryMovementCreateOrConnectWithoutCategoryInput = {
    where: InventoryMovementWhereUniqueInput
    create: XOR<InventoryMovementCreateWithoutCategoryInput, InventoryMovementUncheckedCreateWithoutCategoryInput>
  }

  export type InventoryMovementCreateManyCategoryInputEnvelope = {
    data: InventoryMovementCreateManyCategoryInput | InventoryMovementCreateManyCategoryInput[]
    skipDuplicates?: boolean
  }

  export type PricingRuleCreateWithoutCategoryInput = {
    id?: bigint | number
    regionCode?: string | null
    priceType: $Enums.PriceType
    basePrice: Decimal | DecimalJsLike | number | string
    unit?: string
    weightTiers?: NullableJsonNullValueInput | InputJsonValue
    qualityFactors?: NullableJsonNullValueInput | InputJsonValue
    seasonFactors?: NullableJsonNullValueInput | InputJsonValue
    enabled?: boolean
    validFrom: Date | string
    validTo?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PricingRuleUncheckedCreateWithoutCategoryInput = {
    id?: bigint | number
    regionCode?: string | null
    priceType: $Enums.PriceType
    basePrice: Decimal | DecimalJsLike | number | string
    unit?: string
    weightTiers?: NullableJsonNullValueInput | InputJsonValue
    qualityFactors?: NullableJsonNullValueInput | InputJsonValue
    seasonFactors?: NullableJsonNullValueInput | InputJsonValue
    enabled?: boolean
    validFrom: Date | string
    validTo?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PricingRuleCreateOrConnectWithoutCategoryInput = {
    where: PricingRuleWhereUniqueInput
    create: XOR<PricingRuleCreateWithoutCategoryInput, PricingRuleUncheckedCreateWithoutCategoryInput>
  }

  export type PricingRuleCreateManyCategoryInputEnvelope = {
    data: PricingRuleCreateManyCategoryInput | PricingRuleCreateManyCategoryInput[]
    skipDuplicates?: boolean
  }

  export type ItemCategoryUpsertWithoutChildrenInput = {
    update: XOR<ItemCategoryUpdateWithoutChildrenInput, ItemCategoryUncheckedUpdateWithoutChildrenInput>
    create: XOR<ItemCategoryCreateWithoutChildrenInput, ItemCategoryUncheckedCreateWithoutChildrenInput>
    where?: ItemCategoryWhereInput
  }

  export type ItemCategoryUpdateToOneWithWhereWithoutChildrenInput = {
    where?: ItemCategoryWhereInput
    data: XOR<ItemCategoryUpdateWithoutChildrenInput, ItemCategoryUncheckedUpdateWithoutChildrenInput>
  }

  export type ItemCategoryUpdateWithoutChildrenInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: ItemCategoryUpdateOneWithoutChildrenNestedInput
    inventoryItems?: InventoryItemUpdateManyWithoutCategoryNestedInput
    movements?: InventoryMovementUpdateManyWithoutCategoryNestedInput
    pricingRules?: PricingRuleUpdateManyWithoutCategoryNestedInput
  }

  export type ItemCategoryUncheckedUpdateWithoutChildrenInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    level?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    inventoryItems?: InventoryItemUncheckedUpdateManyWithoutCategoryNestedInput
    movements?: InventoryMovementUncheckedUpdateManyWithoutCategoryNestedInput
    pricingRules?: PricingRuleUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type ItemCategoryUpsertWithWhereUniqueWithoutParentInput = {
    where: ItemCategoryWhereUniqueInput
    update: XOR<ItemCategoryUpdateWithoutParentInput, ItemCategoryUncheckedUpdateWithoutParentInput>
    create: XOR<ItemCategoryCreateWithoutParentInput, ItemCategoryUncheckedCreateWithoutParentInput>
  }

  export type ItemCategoryUpdateWithWhereUniqueWithoutParentInput = {
    where: ItemCategoryWhereUniqueInput
    data: XOR<ItemCategoryUpdateWithoutParentInput, ItemCategoryUncheckedUpdateWithoutParentInput>
  }

  export type ItemCategoryUpdateManyWithWhereWithoutParentInput = {
    where: ItemCategoryScalarWhereInput
    data: XOR<ItemCategoryUpdateManyMutationInput, ItemCategoryUncheckedUpdateManyWithoutParentInput>
  }

  export type ItemCategoryScalarWhereInput = {
    AND?: ItemCategoryScalarWhereInput | ItemCategoryScalarWhereInput[]
    OR?: ItemCategoryScalarWhereInput[]
    NOT?: ItemCategoryScalarWhereInput | ItemCategoryScalarWhereInput[]
    id?: BigIntFilter<"ItemCategory"> | bigint | number
    name?: StringFilter<"ItemCategory"> | string
    code?: StringFilter<"ItemCategory"> | string
    parentId?: BigIntNullableFilter<"ItemCategory"> | bigint | number | null
    level?: IntFilter<"ItemCategory"> | number
    enabled?: BoolFilter<"ItemCategory"> | boolean
    iconUrl?: StringNullableFilter<"ItemCategory"> | string | null
    description?: StringNullableFilter<"ItemCategory"> | string | null
    sortOrder?: IntFilter<"ItemCategory"> | number
    createdAt?: DateTimeFilter<"ItemCategory"> | Date | string
    updatedAt?: DateTimeFilter<"ItemCategory"> | Date | string
  }

  export type InventoryItemUpsertWithWhereUniqueWithoutCategoryInput = {
    where: InventoryItemWhereUniqueInput
    update: XOR<InventoryItemUpdateWithoutCategoryInput, InventoryItemUncheckedUpdateWithoutCategoryInput>
    create: XOR<InventoryItemCreateWithoutCategoryInput, InventoryItemUncheckedCreateWithoutCategoryInput>
  }

  export type InventoryItemUpdateWithWhereUniqueWithoutCategoryInput = {
    where: InventoryItemWhereUniqueInput
    data: XOR<InventoryItemUpdateWithoutCategoryInput, InventoryItemUncheckedUpdateWithoutCategoryInput>
  }

  export type InventoryItemUpdateManyWithWhereWithoutCategoryInput = {
    where: InventoryItemScalarWhereInput
    data: XOR<InventoryItemUpdateManyMutationInput, InventoryItemUncheckedUpdateManyWithoutCategoryInput>
  }

  export type InventoryMovementUpsertWithWhereUniqueWithoutCategoryInput = {
    where: InventoryMovementWhereUniqueInput
    update: XOR<InventoryMovementUpdateWithoutCategoryInput, InventoryMovementUncheckedUpdateWithoutCategoryInput>
    create: XOR<InventoryMovementCreateWithoutCategoryInput, InventoryMovementUncheckedCreateWithoutCategoryInput>
  }

  export type InventoryMovementUpdateWithWhereUniqueWithoutCategoryInput = {
    where: InventoryMovementWhereUniqueInput
    data: XOR<InventoryMovementUpdateWithoutCategoryInput, InventoryMovementUncheckedUpdateWithoutCategoryInput>
  }

  export type InventoryMovementUpdateManyWithWhereWithoutCategoryInput = {
    where: InventoryMovementScalarWhereInput
    data: XOR<InventoryMovementUpdateManyMutationInput, InventoryMovementUncheckedUpdateManyWithoutCategoryInput>
  }

  export type PricingRuleUpsertWithWhereUniqueWithoutCategoryInput = {
    where: PricingRuleWhereUniqueInput
    update: XOR<PricingRuleUpdateWithoutCategoryInput, PricingRuleUncheckedUpdateWithoutCategoryInput>
    create: XOR<PricingRuleCreateWithoutCategoryInput, PricingRuleUncheckedCreateWithoutCategoryInput>
  }

  export type PricingRuleUpdateWithWhereUniqueWithoutCategoryInput = {
    where: PricingRuleWhereUniqueInput
    data: XOR<PricingRuleUpdateWithoutCategoryInput, PricingRuleUncheckedUpdateWithoutCategoryInput>
  }

  export type PricingRuleUpdateManyWithWhereWithoutCategoryInput = {
    where: PricingRuleScalarWhereInput
    data: XOR<PricingRuleUpdateManyMutationInput, PricingRuleUncheckedUpdateManyWithoutCategoryInput>
  }

  export type PricingRuleScalarWhereInput = {
    AND?: PricingRuleScalarWhereInput | PricingRuleScalarWhereInput[]
    OR?: PricingRuleScalarWhereInput[]
    NOT?: PricingRuleScalarWhereInput | PricingRuleScalarWhereInput[]
    id?: BigIntFilter<"PricingRule"> | bigint | number
    categoryId?: BigIntFilter<"PricingRule"> | bigint | number
    regionCode?: StringNullableFilter<"PricingRule"> | string | null
    priceType?: EnumPriceTypeFilter<"PricingRule"> | $Enums.PriceType
    basePrice?: DecimalFilter<"PricingRule"> | Decimal | DecimalJsLike | number | string
    unit?: StringFilter<"PricingRule"> | string
    weightTiers?: JsonNullableFilter<"PricingRule">
    qualityFactors?: JsonNullableFilter<"PricingRule">
    seasonFactors?: JsonNullableFilter<"PricingRule">
    enabled?: BoolFilter<"PricingRule"> | boolean
    validFrom?: DateTimeFilter<"PricingRule"> | Date | string
    validTo?: DateTimeNullableFilter<"PricingRule"> | Date | string | null
    createdAt?: DateTimeFilter<"PricingRule"> | Date | string
    updatedAt?: DateTimeFilter<"PricingRule"> | Date | string
  }

  export type WarehouseCreateWithoutInventoryItemsInput = {
    id?: bigint | number
    name: string
    code: string
    type?: $Enums.WarehouseType
    address: string
    contactName?: string | null
    contactPhone?: string | null
    capacity?: Decimal | DecimalJsLike | number | string | null
    status?: $Enums.WarehouseStatus
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    movements?: InventoryMovementCreateNestedManyWithoutWarehouseInput
  }

  export type WarehouseUncheckedCreateWithoutInventoryItemsInput = {
    id?: bigint | number
    name: string
    code: string
    type?: $Enums.WarehouseType
    address: string
    contactName?: string | null
    contactPhone?: string | null
    capacity?: Decimal | DecimalJsLike | number | string | null
    status?: $Enums.WarehouseStatus
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    movements?: InventoryMovementUncheckedCreateNestedManyWithoutWarehouseInput
  }

  export type WarehouseCreateOrConnectWithoutInventoryItemsInput = {
    where: WarehouseWhereUniqueInput
    create: XOR<WarehouseCreateWithoutInventoryItemsInput, WarehouseUncheckedCreateWithoutInventoryItemsInput>
  }

  export type ItemCategoryCreateWithoutInventoryItemsInput = {
    id?: bigint | number
    name: string
    code: string
    level?: number
    enabled?: boolean
    iconUrl?: string | null
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: ItemCategoryCreateNestedOneWithoutChildrenInput
    children?: ItemCategoryCreateNestedManyWithoutParentInput
    movements?: InventoryMovementCreateNestedManyWithoutCategoryInput
    pricingRules?: PricingRuleCreateNestedManyWithoutCategoryInput
  }

  export type ItemCategoryUncheckedCreateWithoutInventoryItemsInput = {
    id?: bigint | number
    name: string
    code: string
    parentId?: bigint | number | null
    level?: number
    enabled?: boolean
    iconUrl?: string | null
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: ItemCategoryUncheckedCreateNestedManyWithoutParentInput
    movements?: InventoryMovementUncheckedCreateNestedManyWithoutCategoryInput
    pricingRules?: PricingRuleUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type ItemCategoryCreateOrConnectWithoutInventoryItemsInput = {
    where: ItemCategoryWhereUniqueInput
    create: XOR<ItemCategoryCreateWithoutInventoryItemsInput, ItemCategoryUncheckedCreateWithoutInventoryItemsInput>
  }

  export type InventoryTransactionCreateWithoutItemInput = {
    id?: bigint | number
    type: $Enums.TransactionType
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    referenceId?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type InventoryTransactionUncheckedCreateWithoutItemInput = {
    id?: bigint | number
    type: $Enums.TransactionType
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    referenceId?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type InventoryTransactionCreateOrConnectWithoutItemInput = {
    where: InventoryTransactionWhereUniqueInput
    create: XOR<InventoryTransactionCreateWithoutItemInput, InventoryTransactionUncheckedCreateWithoutItemInput>
  }

  export type InventoryTransactionCreateManyItemInputEnvelope = {
    data: InventoryTransactionCreateManyItemInput | InventoryTransactionCreateManyItemInput[]
    skipDuplicates?: boolean
  }

  export type SalesRecordCreateWithoutItemInput = {
    id?: bigint | number
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    orderId: string
    customerId: bigint | number
    soldAt: Date | string
    notes?: string | null
    createdAt?: Date | string
  }

  export type SalesRecordUncheckedCreateWithoutItemInput = {
    id?: bigint | number
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    orderId: string
    customerId: bigint | number
    soldAt: Date | string
    notes?: string | null
    createdAt?: Date | string
  }

  export type SalesRecordCreateOrConnectWithoutItemInput = {
    where: SalesRecordWhereUniqueInput
    create: XOR<SalesRecordCreateWithoutItemInput, SalesRecordUncheckedCreateWithoutItemInput>
  }

  export type SalesRecordCreateManyItemInputEnvelope = {
    data: SalesRecordCreateManyItemInput | SalesRecordCreateManyItemInput[]
    skipDuplicates?: boolean
  }

  export type QualityCheckCreateWithoutItemInput = {
    id?: bigint | number
    checkerId: bigint | number
    checkType: $Enums.CheckType
    result: $Enums.CheckResult
    score?: number | null
    notes?: string | null
    images?: QualityCheckCreateimagesInput | string[]
    checkedAt: Date | string
    createdAt?: Date | string
  }

  export type QualityCheckUncheckedCreateWithoutItemInput = {
    id?: bigint | number
    checkerId: bigint | number
    checkType: $Enums.CheckType
    result: $Enums.CheckResult
    score?: number | null
    notes?: string | null
    images?: QualityCheckCreateimagesInput | string[]
    checkedAt: Date | string
    createdAt?: Date | string
  }

  export type QualityCheckCreateOrConnectWithoutItemInput = {
    where: QualityCheckWhereUniqueInput
    create: XOR<QualityCheckCreateWithoutItemInput, QualityCheckUncheckedCreateWithoutItemInput>
  }

  export type QualityCheckCreateManyItemInputEnvelope = {
    data: QualityCheckCreateManyItemInput | QualityCheckCreateManyItemInput[]
    skipDuplicates?: boolean
  }

  export type InventoryMovementCreateWithoutItemInput = {
    id?: bigint | number
    movementType: $Enums.MovementType
    direction: $Enums.MovementDirection
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice?: Decimal | DecimalJsLike | number | string | null
    totalAmount?: Decimal | DecimalJsLike | number | string | null
    beforeQty: Decimal | DecimalJsLike | number | string
    afterQty: Decimal | DecimalJsLike | number | string
    referenceType?: string | null
    referenceId?: bigint | number | null
    referenceNo?: string | null
    operatorId?: bigint | number | null
    operatorName?: string | null
    remark?: string | null
    createdAt?: Date | string
    warehouse: WarehouseCreateNestedOneWithoutMovementsInput
    category: ItemCategoryCreateNestedOneWithoutMovementsInput
  }

  export type InventoryMovementUncheckedCreateWithoutItemInput = {
    id?: bigint | number
    warehouseId: bigint | number
    categoryId: bigint | number
    movementType: $Enums.MovementType
    direction: $Enums.MovementDirection
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice?: Decimal | DecimalJsLike | number | string | null
    totalAmount?: Decimal | DecimalJsLike | number | string | null
    beforeQty: Decimal | DecimalJsLike | number | string
    afterQty: Decimal | DecimalJsLike | number | string
    referenceType?: string | null
    referenceId?: bigint | number | null
    referenceNo?: string | null
    operatorId?: bigint | number | null
    operatorName?: string | null
    remark?: string | null
    createdAt?: Date | string
  }

  export type InventoryMovementCreateOrConnectWithoutItemInput = {
    where: InventoryMovementWhereUniqueInput
    create: XOR<InventoryMovementCreateWithoutItemInput, InventoryMovementUncheckedCreateWithoutItemInput>
  }

  export type InventoryMovementCreateManyItemInputEnvelope = {
    data: InventoryMovementCreateManyItemInput | InventoryMovementCreateManyItemInput[]
    skipDuplicates?: boolean
  }

  export type ReservationCreateWithoutItemInput = {
    id?: bigint | number
    orderId: string
    quantity: Decimal | DecimalJsLike | number | string
    status?: $Enums.ReservationStatus
    reservedAt?: Date | string
    expiresAt?: Date | string | null
    confirmedAt?: Date | string | null
    cancelledAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReservationUncheckedCreateWithoutItemInput = {
    id?: bigint | number
    orderId: string
    quantity: Decimal | DecimalJsLike | number | string
    status?: $Enums.ReservationStatus
    reservedAt?: Date | string
    expiresAt?: Date | string | null
    confirmedAt?: Date | string | null
    cancelledAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ReservationCreateOrConnectWithoutItemInput = {
    where: ReservationWhereUniqueInput
    create: XOR<ReservationCreateWithoutItemInput, ReservationUncheckedCreateWithoutItemInput>
  }

  export type ReservationCreateManyItemInputEnvelope = {
    data: ReservationCreateManyItemInput | ReservationCreateManyItemInput[]
    skipDuplicates?: boolean
  }

  export type WarehouseUpsertWithoutInventoryItemsInput = {
    update: XOR<WarehouseUpdateWithoutInventoryItemsInput, WarehouseUncheckedUpdateWithoutInventoryItemsInput>
    create: XOR<WarehouseCreateWithoutInventoryItemsInput, WarehouseUncheckedCreateWithoutInventoryItemsInput>
    where?: WarehouseWhereInput
  }

  export type WarehouseUpdateToOneWithWhereWithoutInventoryItemsInput = {
    where?: WarehouseWhereInput
    data: XOR<WarehouseUpdateWithoutInventoryItemsInput, WarehouseUncheckedUpdateWithoutInventoryItemsInput>
  }

  export type WarehouseUpdateWithoutInventoryItemsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    type?: EnumWarehouseTypeFieldUpdateOperationsInput | $Enums.WarehouseType
    address?: StringFieldUpdateOperationsInput | string
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    capacity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    status?: EnumWarehouseStatusFieldUpdateOperationsInput | $Enums.WarehouseStatus
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    movements?: InventoryMovementUpdateManyWithoutWarehouseNestedInput
  }

  export type WarehouseUncheckedUpdateWithoutInventoryItemsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    type?: EnumWarehouseTypeFieldUpdateOperationsInput | $Enums.WarehouseType
    address?: StringFieldUpdateOperationsInput | string
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    capacity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    status?: EnumWarehouseStatusFieldUpdateOperationsInput | $Enums.WarehouseStatus
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    movements?: InventoryMovementUncheckedUpdateManyWithoutWarehouseNestedInput
  }

  export type ItemCategoryUpsertWithoutInventoryItemsInput = {
    update: XOR<ItemCategoryUpdateWithoutInventoryItemsInput, ItemCategoryUncheckedUpdateWithoutInventoryItemsInput>
    create: XOR<ItemCategoryCreateWithoutInventoryItemsInput, ItemCategoryUncheckedCreateWithoutInventoryItemsInput>
    where?: ItemCategoryWhereInput
  }

  export type ItemCategoryUpdateToOneWithWhereWithoutInventoryItemsInput = {
    where?: ItemCategoryWhereInput
    data: XOR<ItemCategoryUpdateWithoutInventoryItemsInput, ItemCategoryUncheckedUpdateWithoutInventoryItemsInput>
  }

  export type ItemCategoryUpdateWithoutInventoryItemsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: ItemCategoryUpdateOneWithoutChildrenNestedInput
    children?: ItemCategoryUpdateManyWithoutParentNestedInput
    movements?: InventoryMovementUpdateManyWithoutCategoryNestedInput
    pricingRules?: PricingRuleUpdateManyWithoutCategoryNestedInput
  }

  export type ItemCategoryUncheckedUpdateWithoutInventoryItemsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    level?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: ItemCategoryUncheckedUpdateManyWithoutParentNestedInput
    movements?: InventoryMovementUncheckedUpdateManyWithoutCategoryNestedInput
    pricingRules?: PricingRuleUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type InventoryTransactionUpsertWithWhereUniqueWithoutItemInput = {
    where: InventoryTransactionWhereUniqueInput
    update: XOR<InventoryTransactionUpdateWithoutItemInput, InventoryTransactionUncheckedUpdateWithoutItemInput>
    create: XOR<InventoryTransactionCreateWithoutItemInput, InventoryTransactionUncheckedCreateWithoutItemInput>
  }

  export type InventoryTransactionUpdateWithWhereUniqueWithoutItemInput = {
    where: InventoryTransactionWhereUniqueInput
    data: XOR<InventoryTransactionUpdateWithoutItemInput, InventoryTransactionUncheckedUpdateWithoutItemInput>
  }

  export type InventoryTransactionUpdateManyWithWhereWithoutItemInput = {
    where: InventoryTransactionScalarWhereInput
    data: XOR<InventoryTransactionUpdateManyMutationInput, InventoryTransactionUncheckedUpdateManyWithoutItemInput>
  }

  export type InventoryTransactionScalarWhereInput = {
    AND?: InventoryTransactionScalarWhereInput | InventoryTransactionScalarWhereInput[]
    OR?: InventoryTransactionScalarWhereInput[]
    NOT?: InventoryTransactionScalarWhereInput | InventoryTransactionScalarWhereInput[]
    id?: BigIntFilter<"InventoryTransaction"> | bigint | number
    itemId?: BigIntFilter<"InventoryTransaction"> | bigint | number
    type?: EnumTransactionTypeFilter<"InventoryTransaction"> | $Enums.TransactionType
    quantity?: DecimalFilter<"InventoryTransaction"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFilter<"InventoryTransaction"> | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFilter<"InventoryTransaction"> | Decimal | DecimalJsLike | number | string
    referenceId?: StringNullableFilter<"InventoryTransaction"> | string | null
    notes?: StringNullableFilter<"InventoryTransaction"> | string | null
    createdAt?: DateTimeFilter<"InventoryTransaction"> | Date | string
  }

  export type SalesRecordUpsertWithWhereUniqueWithoutItemInput = {
    where: SalesRecordWhereUniqueInput
    update: XOR<SalesRecordUpdateWithoutItemInput, SalesRecordUncheckedUpdateWithoutItemInput>
    create: XOR<SalesRecordCreateWithoutItemInput, SalesRecordUncheckedCreateWithoutItemInput>
  }

  export type SalesRecordUpdateWithWhereUniqueWithoutItemInput = {
    where: SalesRecordWhereUniqueInput
    data: XOR<SalesRecordUpdateWithoutItemInput, SalesRecordUncheckedUpdateWithoutItemInput>
  }

  export type SalesRecordUpdateManyWithWhereWithoutItemInput = {
    where: SalesRecordScalarWhereInput
    data: XOR<SalesRecordUpdateManyMutationInput, SalesRecordUncheckedUpdateManyWithoutItemInput>
  }

  export type SalesRecordScalarWhereInput = {
    AND?: SalesRecordScalarWhereInput | SalesRecordScalarWhereInput[]
    OR?: SalesRecordScalarWhereInput[]
    NOT?: SalesRecordScalarWhereInput | SalesRecordScalarWhereInput[]
    id?: BigIntFilter<"SalesRecord"> | bigint | number
    itemId?: BigIntFilter<"SalesRecord"> | bigint | number
    quantity?: DecimalFilter<"SalesRecord"> | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFilter<"SalesRecord"> | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFilter<"SalesRecord"> | Decimal | DecimalJsLike | number | string
    orderId?: StringFilter<"SalesRecord"> | string
    customerId?: BigIntFilter<"SalesRecord"> | bigint | number
    soldAt?: DateTimeFilter<"SalesRecord"> | Date | string
    notes?: StringNullableFilter<"SalesRecord"> | string | null
    createdAt?: DateTimeFilter<"SalesRecord"> | Date | string
  }

  export type QualityCheckUpsertWithWhereUniqueWithoutItemInput = {
    where: QualityCheckWhereUniqueInput
    update: XOR<QualityCheckUpdateWithoutItemInput, QualityCheckUncheckedUpdateWithoutItemInput>
    create: XOR<QualityCheckCreateWithoutItemInput, QualityCheckUncheckedCreateWithoutItemInput>
  }

  export type QualityCheckUpdateWithWhereUniqueWithoutItemInput = {
    where: QualityCheckWhereUniqueInput
    data: XOR<QualityCheckUpdateWithoutItemInput, QualityCheckUncheckedUpdateWithoutItemInput>
  }

  export type QualityCheckUpdateManyWithWhereWithoutItemInput = {
    where: QualityCheckScalarWhereInput
    data: XOR<QualityCheckUpdateManyMutationInput, QualityCheckUncheckedUpdateManyWithoutItemInput>
  }

  export type QualityCheckScalarWhereInput = {
    AND?: QualityCheckScalarWhereInput | QualityCheckScalarWhereInput[]
    OR?: QualityCheckScalarWhereInput[]
    NOT?: QualityCheckScalarWhereInput | QualityCheckScalarWhereInput[]
    id?: BigIntFilter<"QualityCheck"> | bigint | number
    itemId?: BigIntFilter<"QualityCheck"> | bigint | number
    checkerId?: BigIntFilter<"QualityCheck"> | bigint | number
    checkType?: EnumCheckTypeFilter<"QualityCheck"> | $Enums.CheckType
    result?: EnumCheckResultFilter<"QualityCheck"> | $Enums.CheckResult
    score?: IntNullableFilter<"QualityCheck"> | number | null
    notes?: StringNullableFilter<"QualityCheck"> | string | null
    images?: StringNullableListFilter<"QualityCheck">
    checkedAt?: DateTimeFilter<"QualityCheck"> | Date | string
    createdAt?: DateTimeFilter<"QualityCheck"> | Date | string
  }

  export type InventoryMovementUpsertWithWhereUniqueWithoutItemInput = {
    where: InventoryMovementWhereUniqueInput
    update: XOR<InventoryMovementUpdateWithoutItemInput, InventoryMovementUncheckedUpdateWithoutItemInput>
    create: XOR<InventoryMovementCreateWithoutItemInput, InventoryMovementUncheckedCreateWithoutItemInput>
  }

  export type InventoryMovementUpdateWithWhereUniqueWithoutItemInput = {
    where: InventoryMovementWhereUniqueInput
    data: XOR<InventoryMovementUpdateWithoutItemInput, InventoryMovementUncheckedUpdateWithoutItemInput>
  }

  export type InventoryMovementUpdateManyWithWhereWithoutItemInput = {
    where: InventoryMovementScalarWhereInput
    data: XOR<InventoryMovementUpdateManyMutationInput, InventoryMovementUncheckedUpdateManyWithoutItemInput>
  }

  export type ReservationUpsertWithWhereUniqueWithoutItemInput = {
    where: ReservationWhereUniqueInput
    update: XOR<ReservationUpdateWithoutItemInput, ReservationUncheckedUpdateWithoutItemInput>
    create: XOR<ReservationCreateWithoutItemInput, ReservationUncheckedCreateWithoutItemInput>
  }

  export type ReservationUpdateWithWhereUniqueWithoutItemInput = {
    where: ReservationWhereUniqueInput
    data: XOR<ReservationUpdateWithoutItemInput, ReservationUncheckedUpdateWithoutItemInput>
  }

  export type ReservationUpdateManyWithWhereWithoutItemInput = {
    where: ReservationScalarWhereInput
    data: XOR<ReservationUpdateManyMutationInput, ReservationUncheckedUpdateManyWithoutItemInput>
  }

  export type ReservationScalarWhereInput = {
    AND?: ReservationScalarWhereInput | ReservationScalarWhereInput[]
    OR?: ReservationScalarWhereInput[]
    NOT?: ReservationScalarWhereInput | ReservationScalarWhereInput[]
    id?: BigIntFilter<"Reservation"> | bigint | number
    itemId?: BigIntFilter<"Reservation"> | bigint | number
    orderId?: StringFilter<"Reservation"> | string
    quantity?: DecimalFilter<"Reservation"> | Decimal | DecimalJsLike | number | string
    status?: EnumReservationStatusFilter<"Reservation"> | $Enums.ReservationStatus
    reservedAt?: DateTimeFilter<"Reservation"> | Date | string
    expiresAt?: DateTimeNullableFilter<"Reservation"> | Date | string | null
    confirmedAt?: DateTimeNullableFilter<"Reservation"> | Date | string | null
    cancelledAt?: DateTimeNullableFilter<"Reservation"> | Date | string | null
    notes?: StringNullableFilter<"Reservation"> | string | null
    createdAt?: DateTimeFilter<"Reservation"> | Date | string
    updatedAt?: DateTimeFilter<"Reservation"> | Date | string
  }

  export type InventoryItemCreateWithoutTransactionsInput = {
    id?: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    warehouse: WarehouseCreateNestedOneWithoutInventoryItemsInput
    category: ItemCategoryCreateNestedOneWithoutInventoryItemsInput
    salesRecords?: SalesRecordCreateNestedManyWithoutItemInput
    qualityChecks?: QualityCheckCreateNestedManyWithoutItemInput
    movements?: InventoryMovementCreateNestedManyWithoutItemInput
    reservations?: ReservationCreateNestedManyWithoutItemInput
  }

  export type InventoryItemUncheckedCreateWithoutTransactionsInput = {
    id?: bigint | number
    warehouseId: bigint | number
    categoryId: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    salesRecords?: SalesRecordUncheckedCreateNestedManyWithoutItemInput
    qualityChecks?: QualityCheckUncheckedCreateNestedManyWithoutItemInput
    movements?: InventoryMovementUncheckedCreateNestedManyWithoutItemInput
    reservations?: ReservationUncheckedCreateNestedManyWithoutItemInput
  }

  export type InventoryItemCreateOrConnectWithoutTransactionsInput = {
    where: InventoryItemWhereUniqueInput
    create: XOR<InventoryItemCreateWithoutTransactionsInput, InventoryItemUncheckedCreateWithoutTransactionsInput>
  }

  export type InventoryItemUpsertWithoutTransactionsInput = {
    update: XOR<InventoryItemUpdateWithoutTransactionsInput, InventoryItemUncheckedUpdateWithoutTransactionsInput>
    create: XOR<InventoryItemCreateWithoutTransactionsInput, InventoryItemUncheckedCreateWithoutTransactionsInput>
    where?: InventoryItemWhereInput
  }

  export type InventoryItemUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: InventoryItemWhereInput
    data: XOR<InventoryItemUpdateWithoutTransactionsInput, InventoryItemUncheckedUpdateWithoutTransactionsInput>
  }

  export type InventoryItemUpdateWithoutTransactionsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    warehouse?: WarehouseUpdateOneRequiredWithoutInventoryItemsNestedInput
    category?: ItemCategoryUpdateOneRequiredWithoutInventoryItemsNestedInput
    salesRecords?: SalesRecordUpdateManyWithoutItemNestedInput
    qualityChecks?: QualityCheckUpdateManyWithoutItemNestedInput
    movements?: InventoryMovementUpdateManyWithoutItemNestedInput
    reservations?: ReservationUpdateManyWithoutItemNestedInput
  }

  export type InventoryItemUncheckedUpdateWithoutTransactionsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    warehouseId?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    salesRecords?: SalesRecordUncheckedUpdateManyWithoutItemNestedInput
    qualityChecks?: QualityCheckUncheckedUpdateManyWithoutItemNestedInput
    movements?: InventoryMovementUncheckedUpdateManyWithoutItemNestedInput
    reservations?: ReservationUncheckedUpdateManyWithoutItemNestedInput
  }

  export type InventoryItemCreateWithoutSalesRecordsInput = {
    id?: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    warehouse: WarehouseCreateNestedOneWithoutInventoryItemsInput
    category: ItemCategoryCreateNestedOneWithoutInventoryItemsInput
    transactions?: InventoryTransactionCreateNestedManyWithoutItemInput
    qualityChecks?: QualityCheckCreateNestedManyWithoutItemInput
    movements?: InventoryMovementCreateNestedManyWithoutItemInput
    reservations?: ReservationCreateNestedManyWithoutItemInput
  }

  export type InventoryItemUncheckedCreateWithoutSalesRecordsInput = {
    id?: bigint | number
    warehouseId: bigint | number
    categoryId: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    transactions?: InventoryTransactionUncheckedCreateNestedManyWithoutItemInput
    qualityChecks?: QualityCheckUncheckedCreateNestedManyWithoutItemInput
    movements?: InventoryMovementUncheckedCreateNestedManyWithoutItemInput
    reservations?: ReservationUncheckedCreateNestedManyWithoutItemInput
  }

  export type InventoryItemCreateOrConnectWithoutSalesRecordsInput = {
    where: InventoryItemWhereUniqueInput
    create: XOR<InventoryItemCreateWithoutSalesRecordsInput, InventoryItemUncheckedCreateWithoutSalesRecordsInput>
  }

  export type InventoryItemUpsertWithoutSalesRecordsInput = {
    update: XOR<InventoryItemUpdateWithoutSalesRecordsInput, InventoryItemUncheckedUpdateWithoutSalesRecordsInput>
    create: XOR<InventoryItemCreateWithoutSalesRecordsInput, InventoryItemUncheckedCreateWithoutSalesRecordsInput>
    where?: InventoryItemWhereInput
  }

  export type InventoryItemUpdateToOneWithWhereWithoutSalesRecordsInput = {
    where?: InventoryItemWhereInput
    data: XOR<InventoryItemUpdateWithoutSalesRecordsInput, InventoryItemUncheckedUpdateWithoutSalesRecordsInput>
  }

  export type InventoryItemUpdateWithoutSalesRecordsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    warehouse?: WarehouseUpdateOneRequiredWithoutInventoryItemsNestedInput
    category?: ItemCategoryUpdateOneRequiredWithoutInventoryItemsNestedInput
    transactions?: InventoryTransactionUpdateManyWithoutItemNestedInput
    qualityChecks?: QualityCheckUpdateManyWithoutItemNestedInput
    movements?: InventoryMovementUpdateManyWithoutItemNestedInput
    reservations?: ReservationUpdateManyWithoutItemNestedInput
  }

  export type InventoryItemUncheckedUpdateWithoutSalesRecordsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    warehouseId?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactions?: InventoryTransactionUncheckedUpdateManyWithoutItemNestedInput
    qualityChecks?: QualityCheckUncheckedUpdateManyWithoutItemNestedInput
    movements?: InventoryMovementUncheckedUpdateManyWithoutItemNestedInput
    reservations?: ReservationUncheckedUpdateManyWithoutItemNestedInput
  }

  export type InventoryItemCreateWithoutQualityChecksInput = {
    id?: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    warehouse: WarehouseCreateNestedOneWithoutInventoryItemsInput
    category: ItemCategoryCreateNestedOneWithoutInventoryItemsInput
    transactions?: InventoryTransactionCreateNestedManyWithoutItemInput
    salesRecords?: SalesRecordCreateNestedManyWithoutItemInput
    movements?: InventoryMovementCreateNestedManyWithoutItemInput
    reservations?: ReservationCreateNestedManyWithoutItemInput
  }

  export type InventoryItemUncheckedCreateWithoutQualityChecksInput = {
    id?: bigint | number
    warehouseId: bigint | number
    categoryId: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    transactions?: InventoryTransactionUncheckedCreateNestedManyWithoutItemInput
    salesRecords?: SalesRecordUncheckedCreateNestedManyWithoutItemInput
    movements?: InventoryMovementUncheckedCreateNestedManyWithoutItemInput
    reservations?: ReservationUncheckedCreateNestedManyWithoutItemInput
  }

  export type InventoryItemCreateOrConnectWithoutQualityChecksInput = {
    where: InventoryItemWhereUniqueInput
    create: XOR<InventoryItemCreateWithoutQualityChecksInput, InventoryItemUncheckedCreateWithoutQualityChecksInput>
  }

  export type InventoryItemUpsertWithoutQualityChecksInput = {
    update: XOR<InventoryItemUpdateWithoutQualityChecksInput, InventoryItemUncheckedUpdateWithoutQualityChecksInput>
    create: XOR<InventoryItemCreateWithoutQualityChecksInput, InventoryItemUncheckedCreateWithoutQualityChecksInput>
    where?: InventoryItemWhereInput
  }

  export type InventoryItemUpdateToOneWithWhereWithoutQualityChecksInput = {
    where?: InventoryItemWhereInput
    data: XOR<InventoryItemUpdateWithoutQualityChecksInput, InventoryItemUncheckedUpdateWithoutQualityChecksInput>
  }

  export type InventoryItemUpdateWithoutQualityChecksInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    warehouse?: WarehouseUpdateOneRequiredWithoutInventoryItemsNestedInput
    category?: ItemCategoryUpdateOneRequiredWithoutInventoryItemsNestedInput
    transactions?: InventoryTransactionUpdateManyWithoutItemNestedInput
    salesRecords?: SalesRecordUpdateManyWithoutItemNestedInput
    movements?: InventoryMovementUpdateManyWithoutItemNestedInput
    reservations?: ReservationUpdateManyWithoutItemNestedInput
  }

  export type InventoryItemUncheckedUpdateWithoutQualityChecksInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    warehouseId?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactions?: InventoryTransactionUncheckedUpdateManyWithoutItemNestedInput
    salesRecords?: SalesRecordUncheckedUpdateManyWithoutItemNestedInput
    movements?: InventoryMovementUncheckedUpdateManyWithoutItemNestedInput
    reservations?: ReservationUncheckedUpdateManyWithoutItemNestedInput
  }

  export type InventoryItemCreateWithoutReservationsInput = {
    id?: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    warehouse: WarehouseCreateNestedOneWithoutInventoryItemsInput
    category: ItemCategoryCreateNestedOneWithoutInventoryItemsInput
    transactions?: InventoryTransactionCreateNestedManyWithoutItemInput
    salesRecords?: SalesRecordCreateNestedManyWithoutItemInput
    qualityChecks?: QualityCheckCreateNestedManyWithoutItemInput
    movements?: InventoryMovementCreateNestedManyWithoutItemInput
  }

  export type InventoryItemUncheckedCreateWithoutReservationsInput = {
    id?: bigint | number
    warehouseId: bigint | number
    categoryId: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    transactions?: InventoryTransactionUncheckedCreateNestedManyWithoutItemInput
    salesRecords?: SalesRecordUncheckedCreateNestedManyWithoutItemInput
    qualityChecks?: QualityCheckUncheckedCreateNestedManyWithoutItemInput
    movements?: InventoryMovementUncheckedCreateNestedManyWithoutItemInput
  }

  export type InventoryItemCreateOrConnectWithoutReservationsInput = {
    where: InventoryItemWhereUniqueInput
    create: XOR<InventoryItemCreateWithoutReservationsInput, InventoryItemUncheckedCreateWithoutReservationsInput>
  }

  export type InventoryItemUpsertWithoutReservationsInput = {
    update: XOR<InventoryItemUpdateWithoutReservationsInput, InventoryItemUncheckedUpdateWithoutReservationsInput>
    create: XOR<InventoryItemCreateWithoutReservationsInput, InventoryItemUncheckedCreateWithoutReservationsInput>
    where?: InventoryItemWhereInput
  }

  export type InventoryItemUpdateToOneWithWhereWithoutReservationsInput = {
    where?: InventoryItemWhereInput
    data: XOR<InventoryItemUpdateWithoutReservationsInput, InventoryItemUncheckedUpdateWithoutReservationsInput>
  }

  export type InventoryItemUpdateWithoutReservationsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    warehouse?: WarehouseUpdateOneRequiredWithoutInventoryItemsNestedInput
    category?: ItemCategoryUpdateOneRequiredWithoutInventoryItemsNestedInput
    transactions?: InventoryTransactionUpdateManyWithoutItemNestedInput
    salesRecords?: SalesRecordUpdateManyWithoutItemNestedInput
    qualityChecks?: QualityCheckUpdateManyWithoutItemNestedInput
    movements?: InventoryMovementUpdateManyWithoutItemNestedInput
  }

  export type InventoryItemUncheckedUpdateWithoutReservationsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    warehouseId?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactions?: InventoryTransactionUncheckedUpdateManyWithoutItemNestedInput
    salesRecords?: SalesRecordUncheckedUpdateManyWithoutItemNestedInput
    qualityChecks?: QualityCheckUncheckedUpdateManyWithoutItemNestedInput
    movements?: InventoryMovementUncheckedUpdateManyWithoutItemNestedInput
  }

  export type InventoryItemCreateWithoutMovementsInput = {
    id?: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    warehouse: WarehouseCreateNestedOneWithoutInventoryItemsInput
    category: ItemCategoryCreateNestedOneWithoutInventoryItemsInput
    transactions?: InventoryTransactionCreateNestedManyWithoutItemInput
    salesRecords?: SalesRecordCreateNestedManyWithoutItemInput
    qualityChecks?: QualityCheckCreateNestedManyWithoutItemInput
    reservations?: ReservationCreateNestedManyWithoutItemInput
  }

  export type InventoryItemUncheckedCreateWithoutMovementsInput = {
    id?: bigint | number
    warehouseId: bigint | number
    categoryId: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    transactions?: InventoryTransactionUncheckedCreateNestedManyWithoutItemInput
    salesRecords?: SalesRecordUncheckedCreateNestedManyWithoutItemInput
    qualityChecks?: QualityCheckUncheckedCreateNestedManyWithoutItemInput
    reservations?: ReservationUncheckedCreateNestedManyWithoutItemInput
  }

  export type InventoryItemCreateOrConnectWithoutMovementsInput = {
    where: InventoryItemWhereUniqueInput
    create: XOR<InventoryItemCreateWithoutMovementsInput, InventoryItemUncheckedCreateWithoutMovementsInput>
  }

  export type WarehouseCreateWithoutMovementsInput = {
    id?: bigint | number
    name: string
    code: string
    type?: $Enums.WarehouseType
    address: string
    contactName?: string | null
    contactPhone?: string | null
    capacity?: Decimal | DecimalJsLike | number | string | null
    status?: $Enums.WarehouseStatus
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    inventoryItems?: InventoryItemCreateNestedManyWithoutWarehouseInput
  }

  export type WarehouseUncheckedCreateWithoutMovementsInput = {
    id?: bigint | number
    name: string
    code: string
    type?: $Enums.WarehouseType
    address: string
    contactName?: string | null
    contactPhone?: string | null
    capacity?: Decimal | DecimalJsLike | number | string | null
    status?: $Enums.WarehouseStatus
    description?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    inventoryItems?: InventoryItemUncheckedCreateNestedManyWithoutWarehouseInput
  }

  export type WarehouseCreateOrConnectWithoutMovementsInput = {
    where: WarehouseWhereUniqueInput
    create: XOR<WarehouseCreateWithoutMovementsInput, WarehouseUncheckedCreateWithoutMovementsInput>
  }

  export type ItemCategoryCreateWithoutMovementsInput = {
    id?: bigint | number
    name: string
    code: string
    level?: number
    enabled?: boolean
    iconUrl?: string | null
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: ItemCategoryCreateNestedOneWithoutChildrenInput
    children?: ItemCategoryCreateNestedManyWithoutParentInput
    inventoryItems?: InventoryItemCreateNestedManyWithoutCategoryInput
    pricingRules?: PricingRuleCreateNestedManyWithoutCategoryInput
  }

  export type ItemCategoryUncheckedCreateWithoutMovementsInput = {
    id?: bigint | number
    name: string
    code: string
    parentId?: bigint | number | null
    level?: number
    enabled?: boolean
    iconUrl?: string | null
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: ItemCategoryUncheckedCreateNestedManyWithoutParentInput
    inventoryItems?: InventoryItemUncheckedCreateNestedManyWithoutCategoryInput
    pricingRules?: PricingRuleUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type ItemCategoryCreateOrConnectWithoutMovementsInput = {
    where: ItemCategoryWhereUniqueInput
    create: XOR<ItemCategoryCreateWithoutMovementsInput, ItemCategoryUncheckedCreateWithoutMovementsInput>
  }

  export type InventoryItemUpsertWithoutMovementsInput = {
    update: XOR<InventoryItemUpdateWithoutMovementsInput, InventoryItemUncheckedUpdateWithoutMovementsInput>
    create: XOR<InventoryItemCreateWithoutMovementsInput, InventoryItemUncheckedCreateWithoutMovementsInput>
    where?: InventoryItemWhereInput
  }

  export type InventoryItemUpdateToOneWithWhereWithoutMovementsInput = {
    where?: InventoryItemWhereInput
    data: XOR<InventoryItemUpdateWithoutMovementsInput, InventoryItemUncheckedUpdateWithoutMovementsInput>
  }

  export type InventoryItemUpdateWithoutMovementsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    warehouse?: WarehouseUpdateOneRequiredWithoutInventoryItemsNestedInput
    category?: ItemCategoryUpdateOneRequiredWithoutInventoryItemsNestedInput
    transactions?: InventoryTransactionUpdateManyWithoutItemNestedInput
    salesRecords?: SalesRecordUpdateManyWithoutItemNestedInput
    qualityChecks?: QualityCheckUpdateManyWithoutItemNestedInput
    reservations?: ReservationUpdateManyWithoutItemNestedInput
  }

  export type InventoryItemUncheckedUpdateWithoutMovementsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    warehouseId?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactions?: InventoryTransactionUncheckedUpdateManyWithoutItemNestedInput
    salesRecords?: SalesRecordUncheckedUpdateManyWithoutItemNestedInput
    qualityChecks?: QualityCheckUncheckedUpdateManyWithoutItemNestedInput
    reservations?: ReservationUncheckedUpdateManyWithoutItemNestedInput
  }

  export type WarehouseUpsertWithoutMovementsInput = {
    update: XOR<WarehouseUpdateWithoutMovementsInput, WarehouseUncheckedUpdateWithoutMovementsInput>
    create: XOR<WarehouseCreateWithoutMovementsInput, WarehouseUncheckedCreateWithoutMovementsInput>
    where?: WarehouseWhereInput
  }

  export type WarehouseUpdateToOneWithWhereWithoutMovementsInput = {
    where?: WarehouseWhereInput
    data: XOR<WarehouseUpdateWithoutMovementsInput, WarehouseUncheckedUpdateWithoutMovementsInput>
  }

  export type WarehouseUpdateWithoutMovementsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    type?: EnumWarehouseTypeFieldUpdateOperationsInput | $Enums.WarehouseType
    address?: StringFieldUpdateOperationsInput | string
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    capacity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    status?: EnumWarehouseStatusFieldUpdateOperationsInput | $Enums.WarehouseStatus
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    inventoryItems?: InventoryItemUpdateManyWithoutWarehouseNestedInput
  }

  export type WarehouseUncheckedUpdateWithoutMovementsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    type?: EnumWarehouseTypeFieldUpdateOperationsInput | $Enums.WarehouseType
    address?: StringFieldUpdateOperationsInput | string
    contactName?: NullableStringFieldUpdateOperationsInput | string | null
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
    capacity?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    status?: EnumWarehouseStatusFieldUpdateOperationsInput | $Enums.WarehouseStatus
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    inventoryItems?: InventoryItemUncheckedUpdateManyWithoutWarehouseNestedInput
  }

  export type ItemCategoryUpsertWithoutMovementsInput = {
    update: XOR<ItemCategoryUpdateWithoutMovementsInput, ItemCategoryUncheckedUpdateWithoutMovementsInput>
    create: XOR<ItemCategoryCreateWithoutMovementsInput, ItemCategoryUncheckedCreateWithoutMovementsInput>
    where?: ItemCategoryWhereInput
  }

  export type ItemCategoryUpdateToOneWithWhereWithoutMovementsInput = {
    where?: ItemCategoryWhereInput
    data: XOR<ItemCategoryUpdateWithoutMovementsInput, ItemCategoryUncheckedUpdateWithoutMovementsInput>
  }

  export type ItemCategoryUpdateWithoutMovementsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: ItemCategoryUpdateOneWithoutChildrenNestedInput
    children?: ItemCategoryUpdateManyWithoutParentNestedInput
    inventoryItems?: InventoryItemUpdateManyWithoutCategoryNestedInput
    pricingRules?: PricingRuleUpdateManyWithoutCategoryNestedInput
  }

  export type ItemCategoryUncheckedUpdateWithoutMovementsInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    level?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: ItemCategoryUncheckedUpdateManyWithoutParentNestedInput
    inventoryItems?: InventoryItemUncheckedUpdateManyWithoutCategoryNestedInput
    pricingRules?: PricingRuleUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type ItemCategoryCreateWithoutPricingRulesInput = {
    id?: bigint | number
    name: string
    code: string
    level?: number
    enabled?: boolean
    iconUrl?: string | null
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    parent?: ItemCategoryCreateNestedOneWithoutChildrenInput
    children?: ItemCategoryCreateNestedManyWithoutParentInput
    inventoryItems?: InventoryItemCreateNestedManyWithoutCategoryInput
    movements?: InventoryMovementCreateNestedManyWithoutCategoryInput
  }

  export type ItemCategoryUncheckedCreateWithoutPricingRulesInput = {
    id?: bigint | number
    name: string
    code: string
    parentId?: bigint | number | null
    level?: number
    enabled?: boolean
    iconUrl?: string | null
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    children?: ItemCategoryUncheckedCreateNestedManyWithoutParentInput
    inventoryItems?: InventoryItemUncheckedCreateNestedManyWithoutCategoryInput
    movements?: InventoryMovementUncheckedCreateNestedManyWithoutCategoryInput
  }

  export type ItemCategoryCreateOrConnectWithoutPricingRulesInput = {
    where: ItemCategoryWhereUniqueInput
    create: XOR<ItemCategoryCreateWithoutPricingRulesInput, ItemCategoryUncheckedCreateWithoutPricingRulesInput>
  }

  export type ItemCategoryUpsertWithoutPricingRulesInput = {
    update: XOR<ItemCategoryUpdateWithoutPricingRulesInput, ItemCategoryUncheckedUpdateWithoutPricingRulesInput>
    create: XOR<ItemCategoryCreateWithoutPricingRulesInput, ItemCategoryUncheckedCreateWithoutPricingRulesInput>
    where?: ItemCategoryWhereInput
  }

  export type ItemCategoryUpdateToOneWithWhereWithoutPricingRulesInput = {
    where?: ItemCategoryWhereInput
    data: XOR<ItemCategoryUpdateWithoutPricingRulesInput, ItemCategoryUncheckedUpdateWithoutPricingRulesInput>
  }

  export type ItemCategoryUpdateWithoutPricingRulesInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    parent?: ItemCategoryUpdateOneWithoutChildrenNestedInput
    children?: ItemCategoryUpdateManyWithoutParentNestedInput
    inventoryItems?: InventoryItemUpdateManyWithoutCategoryNestedInput
    movements?: InventoryMovementUpdateManyWithoutCategoryNestedInput
  }

  export type ItemCategoryUncheckedUpdateWithoutPricingRulesInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    parentId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    level?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: ItemCategoryUncheckedUpdateManyWithoutParentNestedInput
    inventoryItems?: InventoryItemUncheckedUpdateManyWithoutCategoryNestedInput
    movements?: InventoryMovementUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type InventoryItemCreateManyWarehouseInput = {
    id?: bigint | number
    categoryId: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InventoryMovementCreateManyWarehouseInput = {
    id?: bigint | number
    itemId: bigint | number
    categoryId: bigint | number
    movementType: $Enums.MovementType
    direction: $Enums.MovementDirection
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice?: Decimal | DecimalJsLike | number | string | null
    totalAmount?: Decimal | DecimalJsLike | number | string | null
    beforeQty: Decimal | DecimalJsLike | number | string
    afterQty: Decimal | DecimalJsLike | number | string
    referenceType?: string | null
    referenceId?: bigint | number | null
    referenceNo?: string | null
    operatorId?: bigint | number | null
    operatorName?: string | null
    remark?: string | null
    createdAt?: Date | string
  }

  export type InventoryItemUpdateWithoutWarehouseInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    category?: ItemCategoryUpdateOneRequiredWithoutInventoryItemsNestedInput
    transactions?: InventoryTransactionUpdateManyWithoutItemNestedInput
    salesRecords?: SalesRecordUpdateManyWithoutItemNestedInput
    qualityChecks?: QualityCheckUpdateManyWithoutItemNestedInput
    movements?: InventoryMovementUpdateManyWithoutItemNestedInput
    reservations?: ReservationUpdateManyWithoutItemNestedInput
  }

  export type InventoryItemUncheckedUpdateWithoutWarehouseInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactions?: InventoryTransactionUncheckedUpdateManyWithoutItemNestedInput
    salesRecords?: SalesRecordUncheckedUpdateManyWithoutItemNestedInput
    qualityChecks?: QualityCheckUncheckedUpdateManyWithoutItemNestedInput
    movements?: InventoryMovementUncheckedUpdateManyWithoutItemNestedInput
    reservations?: ReservationUncheckedUpdateManyWithoutItemNestedInput
  }

  export type InventoryItemUncheckedUpdateManyWithoutWarehouseInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryMovementUpdateWithoutWarehouseInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    movementType?: EnumMovementTypeFieldUpdateOperationsInput | $Enums.MovementType
    direction?: EnumMovementDirectionFieldUpdateOperationsInput | $Enums.MovementDirection
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    referenceNo?: NullableStringFieldUpdateOperationsInput | string | null
    operatorId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    item?: InventoryItemUpdateOneRequiredWithoutMovementsNestedInput
    category?: ItemCategoryUpdateOneRequiredWithoutMovementsNestedInput
  }

  export type InventoryMovementUncheckedUpdateWithoutWarehouseInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    movementType?: EnumMovementTypeFieldUpdateOperationsInput | $Enums.MovementType
    direction?: EnumMovementDirectionFieldUpdateOperationsInput | $Enums.MovementDirection
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    referenceNo?: NullableStringFieldUpdateOperationsInput | string | null
    operatorId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryMovementUncheckedUpdateManyWithoutWarehouseInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    movementType?: EnumMovementTypeFieldUpdateOperationsInput | $Enums.MovementType
    direction?: EnumMovementDirectionFieldUpdateOperationsInput | $Enums.MovementDirection
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    referenceNo?: NullableStringFieldUpdateOperationsInput | string | null
    operatorId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ItemCategoryCreateManyParentInput = {
    id?: bigint | number
    name: string
    code: string
    level?: number
    enabled?: boolean
    iconUrl?: string | null
    description?: string | null
    sortOrder?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InventoryItemCreateManyCategoryInput = {
    id?: bigint | number
    warehouseId: bigint | number
    name: string
    description?: string | null
    unit: string
    quantity: Decimal | DecimalJsLike | number | string
    reservedQty?: Decimal | DecimalJsLike | number | string
    availableQty?: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    location?: string | null
    status?: $Enums.InventoryStatus
    itemType?: $Enums.ItemType
    condition?: $Enums.ItemCondition
    sourceOrderId?: string | null
    qualityGrade?: string | null
    processingStatus?: $Enums.ProcessingStatus
    expiryDate?: Date | string | null
    batchNumber?: string | null
    minStockLevel?: Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: Decimal | DecimalJsLike | number | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InventoryMovementCreateManyCategoryInput = {
    id?: bigint | number
    itemId: bigint | number
    warehouseId: bigint | number
    movementType: $Enums.MovementType
    direction: $Enums.MovementDirection
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice?: Decimal | DecimalJsLike | number | string | null
    totalAmount?: Decimal | DecimalJsLike | number | string | null
    beforeQty: Decimal | DecimalJsLike | number | string
    afterQty: Decimal | DecimalJsLike | number | string
    referenceType?: string | null
    referenceId?: bigint | number | null
    referenceNo?: string | null
    operatorId?: bigint | number | null
    operatorName?: string | null
    remark?: string | null
    createdAt?: Date | string
  }

  export type PricingRuleCreateManyCategoryInput = {
    id?: bigint | number
    regionCode?: string | null
    priceType: $Enums.PriceType
    basePrice: Decimal | DecimalJsLike | number | string
    unit?: string
    weightTiers?: NullableJsonNullValueInput | InputJsonValue
    qualityFactors?: NullableJsonNullValueInput | InputJsonValue
    seasonFactors?: NullableJsonNullValueInput | InputJsonValue
    enabled?: boolean
    validFrom: Date | string
    validTo?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ItemCategoryUpdateWithoutParentInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: ItemCategoryUpdateManyWithoutParentNestedInput
    inventoryItems?: InventoryItemUpdateManyWithoutCategoryNestedInput
    movements?: InventoryMovementUpdateManyWithoutCategoryNestedInput
    pricingRules?: PricingRuleUpdateManyWithoutCategoryNestedInput
  }

  export type ItemCategoryUncheckedUpdateWithoutParentInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    children?: ItemCategoryUncheckedUpdateManyWithoutParentNestedInput
    inventoryItems?: InventoryItemUncheckedUpdateManyWithoutCategoryNestedInput
    movements?: InventoryMovementUncheckedUpdateManyWithoutCategoryNestedInput
    pricingRules?: PricingRuleUncheckedUpdateManyWithoutCategoryNestedInput
  }

  export type ItemCategoryUncheckedUpdateManyWithoutParentInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    code?: StringFieldUpdateOperationsInput | string
    level?: IntFieldUpdateOperationsInput | number
    enabled?: BoolFieldUpdateOperationsInput | boolean
    iconUrl?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    sortOrder?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryItemUpdateWithoutCategoryInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    warehouse?: WarehouseUpdateOneRequiredWithoutInventoryItemsNestedInput
    transactions?: InventoryTransactionUpdateManyWithoutItemNestedInput
    salesRecords?: SalesRecordUpdateManyWithoutItemNestedInput
    qualityChecks?: QualityCheckUpdateManyWithoutItemNestedInput
    movements?: InventoryMovementUpdateManyWithoutItemNestedInput
    reservations?: ReservationUpdateManyWithoutItemNestedInput
  }

  export type InventoryItemUncheckedUpdateWithoutCategoryInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    warehouseId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transactions?: InventoryTransactionUncheckedUpdateManyWithoutItemNestedInput
    salesRecords?: SalesRecordUncheckedUpdateManyWithoutItemNestedInput
    qualityChecks?: QualityCheckUncheckedUpdateManyWithoutItemNestedInput
    movements?: InventoryMovementUncheckedUpdateManyWithoutItemNestedInput
    reservations?: ReservationUncheckedUpdateManyWithoutItemNestedInput
  }

  export type InventoryItemUncheckedUpdateManyWithoutCategoryInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    warehouseId?: BigIntFieldUpdateOperationsInput | bigint | number
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    unit?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    reservedQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    availableQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    location?: NullableStringFieldUpdateOperationsInput | string | null
    status?: EnumInventoryStatusFieldUpdateOperationsInput | $Enums.InventoryStatus
    itemType?: EnumItemTypeFieldUpdateOperationsInput | $Enums.ItemType
    condition?: EnumItemConditionFieldUpdateOperationsInput | $Enums.ItemCondition
    sourceOrderId?: NullableStringFieldUpdateOperationsInput | string | null
    qualityGrade?: NullableStringFieldUpdateOperationsInput | string | null
    processingStatus?: EnumProcessingStatusFieldUpdateOperationsInput | $Enums.ProcessingStatus
    expiryDate?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    batchNumber?: NullableStringFieldUpdateOperationsInput | string | null
    minStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    maxStockLevel?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryMovementUpdateWithoutCategoryInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    movementType?: EnumMovementTypeFieldUpdateOperationsInput | $Enums.MovementType
    direction?: EnumMovementDirectionFieldUpdateOperationsInput | $Enums.MovementDirection
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    referenceNo?: NullableStringFieldUpdateOperationsInput | string | null
    operatorId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    item?: InventoryItemUpdateOneRequiredWithoutMovementsNestedInput
    warehouse?: WarehouseUpdateOneRequiredWithoutMovementsNestedInput
  }

  export type InventoryMovementUncheckedUpdateWithoutCategoryInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    warehouseId?: BigIntFieldUpdateOperationsInput | bigint | number
    movementType?: EnumMovementTypeFieldUpdateOperationsInput | $Enums.MovementType
    direction?: EnumMovementDirectionFieldUpdateOperationsInput | $Enums.MovementDirection
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    referenceNo?: NullableStringFieldUpdateOperationsInput | string | null
    operatorId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryMovementUncheckedUpdateManyWithoutCategoryInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    itemId?: BigIntFieldUpdateOperationsInput | bigint | number
    warehouseId?: BigIntFieldUpdateOperationsInput | bigint | number
    movementType?: EnumMovementTypeFieldUpdateOperationsInput | $Enums.MovementType
    direction?: EnumMovementDirectionFieldUpdateOperationsInput | $Enums.MovementDirection
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    referenceNo?: NullableStringFieldUpdateOperationsInput | string | null
    operatorId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PricingRuleUpdateWithoutCategoryInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    regionCode?: NullableStringFieldUpdateOperationsInput | string | null
    priceType?: EnumPriceTypeFieldUpdateOperationsInput | $Enums.PriceType
    basePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unit?: StringFieldUpdateOperationsInput | string
    weightTiers?: NullableJsonNullValueInput | InputJsonValue
    qualityFactors?: NullableJsonNullValueInput | InputJsonValue
    seasonFactors?: NullableJsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: DateTimeFieldUpdateOperationsInput | Date | string
    validTo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PricingRuleUncheckedUpdateWithoutCategoryInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    regionCode?: NullableStringFieldUpdateOperationsInput | string | null
    priceType?: EnumPriceTypeFieldUpdateOperationsInput | $Enums.PriceType
    basePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unit?: StringFieldUpdateOperationsInput | string
    weightTiers?: NullableJsonNullValueInput | InputJsonValue
    qualityFactors?: NullableJsonNullValueInput | InputJsonValue
    seasonFactors?: NullableJsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: DateTimeFieldUpdateOperationsInput | Date | string
    validTo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PricingRuleUncheckedUpdateManyWithoutCategoryInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    regionCode?: NullableStringFieldUpdateOperationsInput | string | null
    priceType?: EnumPriceTypeFieldUpdateOperationsInput | $Enums.PriceType
    basePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unit?: StringFieldUpdateOperationsInput | string
    weightTiers?: NullableJsonNullValueInput | InputJsonValue
    qualityFactors?: NullableJsonNullValueInput | InputJsonValue
    seasonFactors?: NullableJsonNullValueInput | InputJsonValue
    enabled?: BoolFieldUpdateOperationsInput | boolean
    validFrom?: DateTimeFieldUpdateOperationsInput | Date | string
    validTo?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryTransactionCreateManyItemInput = {
    id?: bigint | number
    type: $Enums.TransactionType
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    referenceId?: string | null
    notes?: string | null
    createdAt?: Date | string
  }

  export type SalesRecordCreateManyItemInput = {
    id?: bigint | number
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice: Decimal | DecimalJsLike | number | string
    totalPrice: Decimal | DecimalJsLike | number | string
    orderId: string
    customerId: bigint | number
    soldAt: Date | string
    notes?: string | null
    createdAt?: Date | string
  }

  export type QualityCheckCreateManyItemInput = {
    id?: bigint | number
    checkerId: bigint | number
    checkType: $Enums.CheckType
    result: $Enums.CheckResult
    score?: number | null
    notes?: string | null
    images?: QualityCheckCreateimagesInput | string[]
    checkedAt: Date | string
    createdAt?: Date | string
  }

  export type InventoryMovementCreateManyItemInput = {
    id?: bigint | number
    warehouseId: bigint | number
    categoryId: bigint | number
    movementType: $Enums.MovementType
    direction: $Enums.MovementDirection
    quantity: Decimal | DecimalJsLike | number | string
    unitPrice?: Decimal | DecimalJsLike | number | string | null
    totalAmount?: Decimal | DecimalJsLike | number | string | null
    beforeQty: Decimal | DecimalJsLike | number | string
    afterQty: Decimal | DecimalJsLike | number | string
    referenceType?: string | null
    referenceId?: bigint | number | null
    referenceNo?: string | null
    operatorId?: bigint | number | null
    operatorName?: string | null
    remark?: string | null
    createdAt?: Date | string
  }

  export type ReservationCreateManyItemInput = {
    id?: bigint | number
    orderId: string
    quantity: Decimal | DecimalJsLike | number | string
    status?: $Enums.ReservationStatus
    reservedAt?: Date | string
    expiresAt?: Date | string | null
    confirmedAt?: Date | string | null
    cancelledAt?: Date | string | null
    notes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InventoryTransactionUpdateWithoutItemInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryTransactionUncheckedUpdateWithoutItemInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryTransactionUncheckedUpdateManyWithoutItemInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    type?: EnumTransactionTypeFieldUpdateOperationsInput | $Enums.TransactionType
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceId?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SalesRecordUpdateWithoutItemInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderId?: StringFieldUpdateOperationsInput | string
    customerId?: BigIntFieldUpdateOperationsInput | bigint | number
    soldAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SalesRecordUncheckedUpdateWithoutItemInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderId?: StringFieldUpdateOperationsInput | string
    customerId?: BigIntFieldUpdateOperationsInput | bigint | number
    soldAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SalesRecordUncheckedUpdateManyWithoutItemInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    totalPrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    orderId?: StringFieldUpdateOperationsInput | string
    customerId?: BigIntFieldUpdateOperationsInput | bigint | number
    soldAt?: DateTimeFieldUpdateOperationsInput | Date | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QualityCheckUpdateWithoutItemInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    checkerId?: BigIntFieldUpdateOperationsInput | bigint | number
    checkType?: EnumCheckTypeFieldUpdateOperationsInput | $Enums.CheckType
    result?: EnumCheckResultFieldUpdateOperationsInput | $Enums.CheckResult
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    images?: QualityCheckUpdateimagesInput | string[]
    checkedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QualityCheckUncheckedUpdateWithoutItemInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    checkerId?: BigIntFieldUpdateOperationsInput | bigint | number
    checkType?: EnumCheckTypeFieldUpdateOperationsInput | $Enums.CheckType
    result?: EnumCheckResultFieldUpdateOperationsInput | $Enums.CheckResult
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    images?: QualityCheckUpdateimagesInput | string[]
    checkedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type QualityCheckUncheckedUpdateManyWithoutItemInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    checkerId?: BigIntFieldUpdateOperationsInput | bigint | number
    checkType?: EnumCheckTypeFieldUpdateOperationsInput | $Enums.CheckType
    result?: EnumCheckResultFieldUpdateOperationsInput | $Enums.CheckResult
    score?: NullableIntFieldUpdateOperationsInput | number | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    images?: QualityCheckUpdateimagesInput | string[]
    checkedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryMovementUpdateWithoutItemInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    movementType?: EnumMovementTypeFieldUpdateOperationsInput | $Enums.MovementType
    direction?: EnumMovementDirectionFieldUpdateOperationsInput | $Enums.MovementDirection
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    referenceNo?: NullableStringFieldUpdateOperationsInput | string | null
    operatorId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    warehouse?: WarehouseUpdateOneRequiredWithoutMovementsNestedInput
    category?: ItemCategoryUpdateOneRequiredWithoutMovementsNestedInput
  }

  export type InventoryMovementUncheckedUpdateWithoutItemInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    warehouseId?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    movementType?: EnumMovementTypeFieldUpdateOperationsInput | $Enums.MovementType
    direction?: EnumMovementDirectionFieldUpdateOperationsInput | $Enums.MovementDirection
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    referenceNo?: NullableStringFieldUpdateOperationsInput | string | null
    operatorId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InventoryMovementUncheckedUpdateManyWithoutItemInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    warehouseId?: BigIntFieldUpdateOperationsInput | bigint | number
    categoryId?: BigIntFieldUpdateOperationsInput | bigint | number
    movementType?: EnumMovementTypeFieldUpdateOperationsInput | $Enums.MovementType
    direction?: EnumMovementDirectionFieldUpdateOperationsInput | $Enums.MovementDirection
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    unitPrice?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    totalAmount?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    beforeQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    afterQty?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    referenceType?: NullableStringFieldUpdateOperationsInput | string | null
    referenceId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    referenceNo?: NullableStringFieldUpdateOperationsInput | string | null
    operatorId?: NullableBigIntFieldUpdateOperationsInput | bigint | number | null
    operatorName?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReservationUpdateWithoutItemInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    orderId?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumReservationStatusFieldUpdateOperationsInput | $Enums.ReservationStatus
    reservedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReservationUncheckedUpdateWithoutItemInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    orderId?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumReservationStatusFieldUpdateOperationsInput | $Enums.ReservationStatus
    reservedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ReservationUncheckedUpdateManyWithoutItemInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    orderId?: StringFieldUpdateOperationsInput | string
    quantity?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    status?: EnumReservationStatusFieldUpdateOperationsInput | $Enums.ReservationStatus
    reservedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    confirmedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use WarehouseCountOutputTypeDefaultArgs instead
     */
    export type WarehouseCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = WarehouseCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ItemCategoryCountOutputTypeDefaultArgs instead
     */
    export type ItemCategoryCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ItemCategoryCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InventoryItemCountOutputTypeDefaultArgs instead
     */
    export type InventoryItemCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InventoryItemCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use WarehouseDefaultArgs instead
     */
    export type WarehouseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = WarehouseDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ItemCategoryDefaultArgs instead
     */
    export type ItemCategoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ItemCategoryDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InventoryItemDefaultArgs instead
     */
    export type InventoryItemArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InventoryItemDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InventoryTransactionDefaultArgs instead
     */
    export type InventoryTransactionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InventoryTransactionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SalesRecordDefaultArgs instead
     */
    export type SalesRecordArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SalesRecordDefaultArgs<ExtArgs>
    /**
     * @deprecated Use QualityCheckDefaultArgs instead
     */
    export type QualityCheckArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = QualityCheckDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ReservationDefaultArgs instead
     */
    export type ReservationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ReservationDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InventoryMovementDefaultArgs instead
     */
    export type InventoryMovementArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InventoryMovementDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PricingRuleDefaultArgs instead
     */
    export type PricingRuleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PricingRuleDefaultArgs<ExtArgs>
    /**
     * @deprecated Use InventoryAlertDefaultArgs instead
     */
    export type InventoryAlertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = InventoryAlertDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}
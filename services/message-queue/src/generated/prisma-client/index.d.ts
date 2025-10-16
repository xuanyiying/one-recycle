
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
 * Model JobStatus
 * 
 */
export type JobStatus = $Result.DefaultSelection<Prisma.$JobStatusPayload>
/**
 * Model DeadLetterQueue
 * 
 */
export type DeadLetterQueue = $Result.DefaultSelection<Prisma.$DeadLetterQueuePayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more JobStatuses
 * const jobStatuses = await prisma.jobStatus.findMany()
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
   * // Fetch zero or more JobStatuses
   * const jobStatuses = await prisma.jobStatus.findMany()
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
   * `prisma.jobStatus`: Exposes CRUD operations for the **JobStatus** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more JobStatuses
    * const jobStatuses = await prisma.jobStatus.findMany()
    * ```
    */
  get jobStatus(): Prisma.JobStatusDelegate<ExtArgs>;

  /**
   * `prisma.deadLetterQueue`: Exposes CRUD operations for the **DeadLetterQueue** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DeadLetterQueues
    * const deadLetterQueues = await prisma.deadLetterQueue.findMany()
    * ```
    */
  get deadLetterQueue(): Prisma.DeadLetterQueueDelegate<ExtArgs>;
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
    JobStatus: 'JobStatus',
    DeadLetterQueue: 'DeadLetterQueue'
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
      modelProps: "jobStatus" | "deadLetterQueue"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      JobStatus: {
        payload: Prisma.$JobStatusPayload<ExtArgs>
        fields: Prisma.JobStatusFieldRefs
        operations: {
          findUnique: {
            args: Prisma.JobStatusFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobStatusPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.JobStatusFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobStatusPayload>
          }
          findFirst: {
            args: Prisma.JobStatusFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobStatusPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.JobStatusFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobStatusPayload>
          }
          findMany: {
            args: Prisma.JobStatusFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobStatusPayload>[]
          }
          create: {
            args: Prisma.JobStatusCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobStatusPayload>
          }
          createMany: {
            args: Prisma.JobStatusCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.JobStatusCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobStatusPayload>[]
          }
          delete: {
            args: Prisma.JobStatusDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobStatusPayload>
          }
          update: {
            args: Prisma.JobStatusUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobStatusPayload>
          }
          deleteMany: {
            args: Prisma.JobStatusDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.JobStatusUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.JobStatusUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobStatusPayload>
          }
          aggregate: {
            args: Prisma.JobStatusAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateJobStatus>
          }
          groupBy: {
            args: Prisma.JobStatusGroupByArgs<ExtArgs>
            result: $Utils.Optional<JobStatusGroupByOutputType>[]
          }
          count: {
            args: Prisma.JobStatusCountArgs<ExtArgs>
            result: $Utils.Optional<JobStatusCountAggregateOutputType> | number
          }
        }
      }
      DeadLetterQueue: {
        payload: Prisma.$DeadLetterQueuePayload<ExtArgs>
        fields: Prisma.DeadLetterQueueFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DeadLetterQueueFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterQueuePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DeadLetterQueueFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterQueuePayload>
          }
          findFirst: {
            args: Prisma.DeadLetterQueueFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterQueuePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DeadLetterQueueFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterQueuePayload>
          }
          findMany: {
            args: Prisma.DeadLetterQueueFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterQueuePayload>[]
          }
          create: {
            args: Prisma.DeadLetterQueueCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterQueuePayload>
          }
          createMany: {
            args: Prisma.DeadLetterQueueCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DeadLetterQueueCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterQueuePayload>[]
          }
          delete: {
            args: Prisma.DeadLetterQueueDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterQueuePayload>
          }
          update: {
            args: Prisma.DeadLetterQueueUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterQueuePayload>
          }
          deleteMany: {
            args: Prisma.DeadLetterQueueDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DeadLetterQueueUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DeadLetterQueueUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DeadLetterQueuePayload>
          }
          aggregate: {
            args: Prisma.DeadLetterQueueAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDeadLetterQueue>
          }
          groupBy: {
            args: Prisma.DeadLetterQueueGroupByArgs<ExtArgs>
            result: $Utils.Optional<DeadLetterQueueGroupByOutputType>[]
          }
          count: {
            args: Prisma.DeadLetterQueueCountArgs<ExtArgs>
            result: $Utils.Optional<DeadLetterQueueCountAggregateOutputType> | number
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
   * Models
   */

  /**
   * Model JobStatus
   */

  export type AggregateJobStatus = {
    _count: JobStatusCountAggregateOutputType | null
    _avg: JobStatusAvgAggregateOutputType | null
    _sum: JobStatusSumAggregateOutputType | null
    _min: JobStatusMinAggregateOutputType | null
    _max: JobStatusMaxAggregateOutputType | null
  }

  export type JobStatusAvgAggregateOutputType = {
    attempts: number | null
    maxAttempts: number | null
  }

  export type JobStatusSumAggregateOutputType = {
    attempts: number | null
    maxAttempts: number | null
  }

  export type JobStatusMinAggregateOutputType = {
    id: string | null
    jobId: string | null
    jobType: string | null
    queueName: string | null
    status: string | null
    errorMessage: string | null
    attempts: number | null
    maxAttempts: number | null
    createdAt: Date | null
    updatedAt: Date | null
    completedAt: Date | null
  }

  export type JobStatusMaxAggregateOutputType = {
    id: string | null
    jobId: string | null
    jobType: string | null
    queueName: string | null
    status: string | null
    errorMessage: string | null
    attempts: number | null
    maxAttempts: number | null
    createdAt: Date | null
    updatedAt: Date | null
    completedAt: Date | null
  }

  export type JobStatusCountAggregateOutputType = {
    id: number
    jobId: number
    jobType: number
    queueName: number
    status: number
    payload: number
    result: number
    errorMessage: number
    attempts: number
    maxAttempts: number
    createdAt: number
    updatedAt: number
    completedAt: number
    _all: number
  }


  export type JobStatusAvgAggregateInputType = {
    attempts?: true
    maxAttempts?: true
  }

  export type JobStatusSumAggregateInputType = {
    attempts?: true
    maxAttempts?: true
  }

  export type JobStatusMinAggregateInputType = {
    id?: true
    jobId?: true
    jobType?: true
    queueName?: true
    status?: true
    errorMessage?: true
    attempts?: true
    maxAttempts?: true
    createdAt?: true
    updatedAt?: true
    completedAt?: true
  }

  export type JobStatusMaxAggregateInputType = {
    id?: true
    jobId?: true
    jobType?: true
    queueName?: true
    status?: true
    errorMessage?: true
    attempts?: true
    maxAttempts?: true
    createdAt?: true
    updatedAt?: true
    completedAt?: true
  }

  export type JobStatusCountAggregateInputType = {
    id?: true
    jobId?: true
    jobType?: true
    queueName?: true
    status?: true
    payload?: true
    result?: true
    errorMessage?: true
    attempts?: true
    maxAttempts?: true
    createdAt?: true
    updatedAt?: true
    completedAt?: true
    _all?: true
  }

  export type JobStatusAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JobStatus to aggregate.
     */
    where?: JobStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobStatuses to fetch.
     */
    orderBy?: JobStatusOrderByWithRelationInput | JobStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: JobStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobStatuses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned JobStatuses
    **/
    _count?: true | JobStatusCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: JobStatusAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: JobStatusSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: JobStatusMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: JobStatusMaxAggregateInputType
  }

  export type GetJobStatusAggregateType<T extends JobStatusAggregateArgs> = {
        [P in keyof T & keyof AggregateJobStatus]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateJobStatus[P]>
      : GetScalarType<T[P], AggregateJobStatus[P]>
  }




  export type JobStatusGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: JobStatusWhereInput
    orderBy?: JobStatusOrderByWithAggregationInput | JobStatusOrderByWithAggregationInput[]
    by: JobStatusScalarFieldEnum[] | JobStatusScalarFieldEnum
    having?: JobStatusScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: JobStatusCountAggregateInputType | true
    _avg?: JobStatusAvgAggregateInputType
    _sum?: JobStatusSumAggregateInputType
    _min?: JobStatusMinAggregateInputType
    _max?: JobStatusMaxAggregateInputType
  }

  export type JobStatusGroupByOutputType = {
    id: string
    jobId: string
    jobType: string
    queueName: string
    status: string
    payload: JsonValue
    result: JsonValue | null
    errorMessage: string | null
    attempts: number
    maxAttempts: number
    createdAt: Date
    updatedAt: Date
    completedAt: Date | null
    _count: JobStatusCountAggregateOutputType | null
    _avg: JobStatusAvgAggregateOutputType | null
    _sum: JobStatusSumAggregateOutputType | null
    _min: JobStatusMinAggregateOutputType | null
    _max: JobStatusMaxAggregateOutputType | null
  }

  type GetJobStatusGroupByPayload<T extends JobStatusGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<JobStatusGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof JobStatusGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], JobStatusGroupByOutputType[P]>
            : GetScalarType<T[P], JobStatusGroupByOutputType[P]>
        }
      >
    >


  export type JobStatusSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobId?: boolean
    jobType?: boolean
    queueName?: boolean
    status?: boolean
    payload?: boolean
    result?: boolean
    errorMessage?: boolean
    attempts?: boolean
    maxAttempts?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    completedAt?: boolean
  }, ExtArgs["result"]["jobStatus"]>

  export type JobStatusSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobId?: boolean
    jobType?: boolean
    queueName?: boolean
    status?: boolean
    payload?: boolean
    result?: boolean
    errorMessage?: boolean
    attempts?: boolean
    maxAttempts?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    completedAt?: boolean
  }, ExtArgs["result"]["jobStatus"]>

  export type JobStatusSelectScalar = {
    id?: boolean
    jobId?: boolean
    jobType?: boolean
    queueName?: boolean
    status?: boolean
    payload?: boolean
    result?: boolean
    errorMessage?: boolean
    attempts?: boolean
    maxAttempts?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    completedAt?: boolean
  }


  export type $JobStatusPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "JobStatus"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      jobId: string
      jobType: string
      queueName: string
      status: string
      payload: Prisma.JsonValue
      result: Prisma.JsonValue | null
      errorMessage: string | null
      attempts: number
      maxAttempts: number
      createdAt: Date
      updatedAt: Date
      completedAt: Date | null
    }, ExtArgs["result"]["jobStatus"]>
    composites: {}
  }

  type JobStatusGetPayload<S extends boolean | null | undefined | JobStatusDefaultArgs> = $Result.GetResult<Prisma.$JobStatusPayload, S>

  type JobStatusCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<JobStatusFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: JobStatusCountAggregateInputType | true
    }

  export interface JobStatusDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['JobStatus'], meta: { name: 'JobStatus' } }
    /**
     * Find zero or one JobStatus that matches the filter.
     * @param {JobStatusFindUniqueArgs} args - Arguments to find a JobStatus
     * @example
     * // Get one JobStatus
     * const jobStatus = await prisma.jobStatus.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends JobStatusFindUniqueArgs>(args: SelectSubset<T, JobStatusFindUniqueArgs<ExtArgs>>): Prisma__JobStatusClient<$Result.GetResult<Prisma.$JobStatusPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one JobStatus that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {JobStatusFindUniqueOrThrowArgs} args - Arguments to find a JobStatus
     * @example
     * // Get one JobStatus
     * const jobStatus = await prisma.jobStatus.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends JobStatusFindUniqueOrThrowArgs>(args: SelectSubset<T, JobStatusFindUniqueOrThrowArgs<ExtArgs>>): Prisma__JobStatusClient<$Result.GetResult<Prisma.$JobStatusPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first JobStatus that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobStatusFindFirstArgs} args - Arguments to find a JobStatus
     * @example
     * // Get one JobStatus
     * const jobStatus = await prisma.jobStatus.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends JobStatusFindFirstArgs>(args?: SelectSubset<T, JobStatusFindFirstArgs<ExtArgs>>): Prisma__JobStatusClient<$Result.GetResult<Prisma.$JobStatusPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first JobStatus that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobStatusFindFirstOrThrowArgs} args - Arguments to find a JobStatus
     * @example
     * // Get one JobStatus
     * const jobStatus = await prisma.jobStatus.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends JobStatusFindFirstOrThrowArgs>(args?: SelectSubset<T, JobStatusFindFirstOrThrowArgs<ExtArgs>>): Prisma__JobStatusClient<$Result.GetResult<Prisma.$JobStatusPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more JobStatuses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobStatusFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all JobStatuses
     * const jobStatuses = await prisma.jobStatus.findMany()
     * 
     * // Get first 10 JobStatuses
     * const jobStatuses = await prisma.jobStatus.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const jobStatusWithIdOnly = await prisma.jobStatus.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends JobStatusFindManyArgs>(args?: SelectSubset<T, JobStatusFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobStatusPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a JobStatus.
     * @param {JobStatusCreateArgs} args - Arguments to create a JobStatus.
     * @example
     * // Create one JobStatus
     * const JobStatus = await prisma.jobStatus.create({
     *   data: {
     *     // ... data to create a JobStatus
     *   }
     * })
     * 
     */
    create<T extends JobStatusCreateArgs>(args: SelectSubset<T, JobStatusCreateArgs<ExtArgs>>): Prisma__JobStatusClient<$Result.GetResult<Prisma.$JobStatusPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many JobStatuses.
     * @param {JobStatusCreateManyArgs} args - Arguments to create many JobStatuses.
     * @example
     * // Create many JobStatuses
     * const jobStatus = await prisma.jobStatus.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends JobStatusCreateManyArgs>(args?: SelectSubset<T, JobStatusCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many JobStatuses and returns the data saved in the database.
     * @param {JobStatusCreateManyAndReturnArgs} args - Arguments to create many JobStatuses.
     * @example
     * // Create many JobStatuses
     * const jobStatus = await prisma.jobStatus.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many JobStatuses and only return the `id`
     * const jobStatusWithIdOnly = await prisma.jobStatus.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends JobStatusCreateManyAndReturnArgs>(args?: SelectSubset<T, JobStatusCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobStatusPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a JobStatus.
     * @param {JobStatusDeleteArgs} args - Arguments to delete one JobStatus.
     * @example
     * // Delete one JobStatus
     * const JobStatus = await prisma.jobStatus.delete({
     *   where: {
     *     // ... filter to delete one JobStatus
     *   }
     * })
     * 
     */
    delete<T extends JobStatusDeleteArgs>(args: SelectSubset<T, JobStatusDeleteArgs<ExtArgs>>): Prisma__JobStatusClient<$Result.GetResult<Prisma.$JobStatusPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one JobStatus.
     * @param {JobStatusUpdateArgs} args - Arguments to update one JobStatus.
     * @example
     * // Update one JobStatus
     * const jobStatus = await prisma.jobStatus.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends JobStatusUpdateArgs>(args: SelectSubset<T, JobStatusUpdateArgs<ExtArgs>>): Prisma__JobStatusClient<$Result.GetResult<Prisma.$JobStatusPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more JobStatuses.
     * @param {JobStatusDeleteManyArgs} args - Arguments to filter JobStatuses to delete.
     * @example
     * // Delete a few JobStatuses
     * const { count } = await prisma.jobStatus.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends JobStatusDeleteManyArgs>(args?: SelectSubset<T, JobStatusDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more JobStatuses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobStatusUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many JobStatuses
     * const jobStatus = await prisma.jobStatus.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends JobStatusUpdateManyArgs>(args: SelectSubset<T, JobStatusUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one JobStatus.
     * @param {JobStatusUpsertArgs} args - Arguments to update or create a JobStatus.
     * @example
     * // Update or create a JobStatus
     * const jobStatus = await prisma.jobStatus.upsert({
     *   create: {
     *     // ... data to create a JobStatus
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the JobStatus we want to update
     *   }
     * })
     */
    upsert<T extends JobStatusUpsertArgs>(args: SelectSubset<T, JobStatusUpsertArgs<ExtArgs>>): Prisma__JobStatusClient<$Result.GetResult<Prisma.$JobStatusPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of JobStatuses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobStatusCountArgs} args - Arguments to filter JobStatuses to count.
     * @example
     * // Count the number of JobStatuses
     * const count = await prisma.jobStatus.count({
     *   where: {
     *     // ... the filter for the JobStatuses we want to count
     *   }
     * })
    **/
    count<T extends JobStatusCountArgs>(
      args?: Subset<T, JobStatusCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], JobStatusCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a JobStatus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobStatusAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends JobStatusAggregateArgs>(args: Subset<T, JobStatusAggregateArgs>): Prisma.PrismaPromise<GetJobStatusAggregateType<T>>

    /**
     * Group by JobStatus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobStatusGroupByArgs} args - Group by arguments.
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
      T extends JobStatusGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: JobStatusGroupByArgs['orderBy'] }
        : { orderBy?: JobStatusGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, JobStatusGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetJobStatusGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the JobStatus model
   */
  readonly fields: JobStatusFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for JobStatus.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__JobStatusClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the JobStatus model
   */ 
  interface JobStatusFieldRefs {
    readonly id: FieldRef<"JobStatus", 'String'>
    readonly jobId: FieldRef<"JobStatus", 'String'>
    readonly jobType: FieldRef<"JobStatus", 'String'>
    readonly queueName: FieldRef<"JobStatus", 'String'>
    readonly status: FieldRef<"JobStatus", 'String'>
    readonly payload: FieldRef<"JobStatus", 'Json'>
    readonly result: FieldRef<"JobStatus", 'Json'>
    readonly errorMessage: FieldRef<"JobStatus", 'String'>
    readonly attempts: FieldRef<"JobStatus", 'Int'>
    readonly maxAttempts: FieldRef<"JobStatus", 'Int'>
    readonly createdAt: FieldRef<"JobStatus", 'DateTime'>
    readonly updatedAt: FieldRef<"JobStatus", 'DateTime'>
    readonly completedAt: FieldRef<"JobStatus", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * JobStatus findUnique
   */
  export type JobStatusFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobStatus
     */
    select?: JobStatusSelect<ExtArgs> | null
    /**
     * Filter, which JobStatus to fetch.
     */
    where: JobStatusWhereUniqueInput
  }

  /**
   * JobStatus findUniqueOrThrow
   */
  export type JobStatusFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobStatus
     */
    select?: JobStatusSelect<ExtArgs> | null
    /**
     * Filter, which JobStatus to fetch.
     */
    where: JobStatusWhereUniqueInput
  }

  /**
   * JobStatus findFirst
   */
  export type JobStatusFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobStatus
     */
    select?: JobStatusSelect<ExtArgs> | null
    /**
     * Filter, which JobStatus to fetch.
     */
    where?: JobStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobStatuses to fetch.
     */
    orderBy?: JobStatusOrderByWithRelationInput | JobStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JobStatuses.
     */
    cursor?: JobStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobStatuses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JobStatuses.
     */
    distinct?: JobStatusScalarFieldEnum | JobStatusScalarFieldEnum[]
  }

  /**
   * JobStatus findFirstOrThrow
   */
  export type JobStatusFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobStatus
     */
    select?: JobStatusSelect<ExtArgs> | null
    /**
     * Filter, which JobStatus to fetch.
     */
    where?: JobStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobStatuses to fetch.
     */
    orderBy?: JobStatusOrderByWithRelationInput | JobStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for JobStatuses.
     */
    cursor?: JobStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobStatuses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of JobStatuses.
     */
    distinct?: JobStatusScalarFieldEnum | JobStatusScalarFieldEnum[]
  }

  /**
   * JobStatus findMany
   */
  export type JobStatusFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobStatus
     */
    select?: JobStatusSelect<ExtArgs> | null
    /**
     * Filter, which JobStatuses to fetch.
     */
    where?: JobStatusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of JobStatuses to fetch.
     */
    orderBy?: JobStatusOrderByWithRelationInput | JobStatusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing JobStatuses.
     */
    cursor?: JobStatusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` JobStatuses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` JobStatuses.
     */
    skip?: number
    distinct?: JobStatusScalarFieldEnum | JobStatusScalarFieldEnum[]
  }

  /**
   * JobStatus create
   */
  export type JobStatusCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobStatus
     */
    select?: JobStatusSelect<ExtArgs> | null
    /**
     * The data needed to create a JobStatus.
     */
    data: XOR<JobStatusCreateInput, JobStatusUncheckedCreateInput>
  }

  /**
   * JobStatus createMany
   */
  export type JobStatusCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many JobStatuses.
     */
    data: JobStatusCreateManyInput | JobStatusCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * JobStatus createManyAndReturn
   */
  export type JobStatusCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobStatus
     */
    select?: JobStatusSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many JobStatuses.
     */
    data: JobStatusCreateManyInput | JobStatusCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * JobStatus update
   */
  export type JobStatusUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobStatus
     */
    select?: JobStatusSelect<ExtArgs> | null
    /**
     * The data needed to update a JobStatus.
     */
    data: XOR<JobStatusUpdateInput, JobStatusUncheckedUpdateInput>
    /**
     * Choose, which JobStatus to update.
     */
    where: JobStatusWhereUniqueInput
  }

  /**
   * JobStatus updateMany
   */
  export type JobStatusUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update JobStatuses.
     */
    data: XOR<JobStatusUpdateManyMutationInput, JobStatusUncheckedUpdateManyInput>
    /**
     * Filter which JobStatuses to update
     */
    where?: JobStatusWhereInput
  }

  /**
   * JobStatus upsert
   */
  export type JobStatusUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobStatus
     */
    select?: JobStatusSelect<ExtArgs> | null
    /**
     * The filter to search for the JobStatus to update in case it exists.
     */
    where: JobStatusWhereUniqueInput
    /**
     * In case the JobStatus found by the `where` argument doesn't exist, create a new JobStatus with this data.
     */
    create: XOR<JobStatusCreateInput, JobStatusUncheckedCreateInput>
    /**
     * In case the JobStatus was found with the provided `where` argument, update it with this data.
     */
    update: XOR<JobStatusUpdateInput, JobStatusUncheckedUpdateInput>
  }

  /**
   * JobStatus delete
   */
  export type JobStatusDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobStatus
     */
    select?: JobStatusSelect<ExtArgs> | null
    /**
     * Filter which JobStatus to delete.
     */
    where: JobStatusWhereUniqueInput
  }

  /**
   * JobStatus deleteMany
   */
  export type JobStatusDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which JobStatuses to delete
     */
    where?: JobStatusWhereInput
  }

  /**
   * JobStatus without action
   */
  export type JobStatusDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the JobStatus
     */
    select?: JobStatusSelect<ExtArgs> | null
  }


  /**
   * Model DeadLetterQueue
   */

  export type AggregateDeadLetterQueue = {
    _count: DeadLetterQueueCountAggregateOutputType | null
    _avg: DeadLetterQueueAvgAggregateOutputType | null
    _sum: DeadLetterQueueSumAggregateOutputType | null
    _min: DeadLetterQueueMinAggregateOutputType | null
    _max: DeadLetterQueueMaxAggregateOutputType | null
  }

  export type DeadLetterQueueAvgAggregateOutputType = {
    failedAttempts: number | null
  }

  export type DeadLetterQueueSumAggregateOutputType = {
    failedAttempts: number | null
  }

  export type DeadLetterQueueMinAggregateOutputType = {
    id: string | null
    jobId: string | null
    queueName: string | null
    jobType: string | null
    errorMessage: string | null
    failedAttempts: number | null
    lastError: string | null
    createdAt: Date | null
    resolved: boolean | null
    resolvedAt: Date | null
    resolvedBy: string | null
    resolvedNote: string | null
  }

  export type DeadLetterQueueMaxAggregateOutputType = {
    id: string | null
    jobId: string | null
    queueName: string | null
    jobType: string | null
    errorMessage: string | null
    failedAttempts: number | null
    lastError: string | null
    createdAt: Date | null
    resolved: boolean | null
    resolvedAt: Date | null
    resolvedBy: string | null
    resolvedNote: string | null
  }

  export type DeadLetterQueueCountAggregateOutputType = {
    id: number
    jobId: number
    queueName: number
    jobType: number
    payload: number
    errorMessage: number
    failedAttempts: number
    lastError: number
    createdAt: number
    resolved: number
    resolvedAt: number
    resolvedBy: number
    resolvedNote: number
    _all: number
  }


  export type DeadLetterQueueAvgAggregateInputType = {
    failedAttempts?: true
  }

  export type DeadLetterQueueSumAggregateInputType = {
    failedAttempts?: true
  }

  export type DeadLetterQueueMinAggregateInputType = {
    id?: true
    jobId?: true
    queueName?: true
    jobType?: true
    errorMessage?: true
    failedAttempts?: true
    lastError?: true
    createdAt?: true
    resolved?: true
    resolvedAt?: true
    resolvedBy?: true
    resolvedNote?: true
  }

  export type DeadLetterQueueMaxAggregateInputType = {
    id?: true
    jobId?: true
    queueName?: true
    jobType?: true
    errorMessage?: true
    failedAttempts?: true
    lastError?: true
    createdAt?: true
    resolved?: true
    resolvedAt?: true
    resolvedBy?: true
    resolvedNote?: true
  }

  export type DeadLetterQueueCountAggregateInputType = {
    id?: true
    jobId?: true
    queueName?: true
    jobType?: true
    payload?: true
    errorMessage?: true
    failedAttempts?: true
    lastError?: true
    createdAt?: true
    resolved?: true
    resolvedAt?: true
    resolvedBy?: true
    resolvedNote?: true
    _all?: true
  }

  export type DeadLetterQueueAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeadLetterQueue to aggregate.
     */
    where?: DeadLetterQueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeadLetterQueues to fetch.
     */
    orderBy?: DeadLetterQueueOrderByWithRelationInput | DeadLetterQueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DeadLetterQueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeadLetterQueues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeadLetterQueues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DeadLetterQueues
    **/
    _count?: true | DeadLetterQueueCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DeadLetterQueueAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DeadLetterQueueSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DeadLetterQueueMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DeadLetterQueueMaxAggregateInputType
  }

  export type GetDeadLetterQueueAggregateType<T extends DeadLetterQueueAggregateArgs> = {
        [P in keyof T & keyof AggregateDeadLetterQueue]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDeadLetterQueue[P]>
      : GetScalarType<T[P], AggregateDeadLetterQueue[P]>
  }




  export type DeadLetterQueueGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DeadLetterQueueWhereInput
    orderBy?: DeadLetterQueueOrderByWithAggregationInput | DeadLetterQueueOrderByWithAggregationInput[]
    by: DeadLetterQueueScalarFieldEnum[] | DeadLetterQueueScalarFieldEnum
    having?: DeadLetterQueueScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DeadLetterQueueCountAggregateInputType | true
    _avg?: DeadLetterQueueAvgAggregateInputType
    _sum?: DeadLetterQueueSumAggregateInputType
    _min?: DeadLetterQueueMinAggregateInputType
    _max?: DeadLetterQueueMaxAggregateInputType
  }

  export type DeadLetterQueueGroupByOutputType = {
    id: string
    jobId: string
    queueName: string
    jobType: string
    payload: JsonValue
    errorMessage: string | null
    failedAttempts: number
    lastError: string | null
    createdAt: Date
    resolved: boolean
    resolvedAt: Date | null
    resolvedBy: string | null
    resolvedNote: string | null
    _count: DeadLetterQueueCountAggregateOutputType | null
    _avg: DeadLetterQueueAvgAggregateOutputType | null
    _sum: DeadLetterQueueSumAggregateOutputType | null
    _min: DeadLetterQueueMinAggregateOutputType | null
    _max: DeadLetterQueueMaxAggregateOutputType | null
  }

  type GetDeadLetterQueueGroupByPayload<T extends DeadLetterQueueGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DeadLetterQueueGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DeadLetterQueueGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DeadLetterQueueGroupByOutputType[P]>
            : GetScalarType<T[P], DeadLetterQueueGroupByOutputType[P]>
        }
      >
    >


  export type DeadLetterQueueSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobId?: boolean
    queueName?: boolean
    jobType?: boolean
    payload?: boolean
    errorMessage?: boolean
    failedAttempts?: boolean
    lastError?: boolean
    createdAt?: boolean
    resolved?: boolean
    resolvedAt?: boolean
    resolvedBy?: boolean
    resolvedNote?: boolean
  }, ExtArgs["result"]["deadLetterQueue"]>

  export type DeadLetterQueueSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    jobId?: boolean
    queueName?: boolean
    jobType?: boolean
    payload?: boolean
    errorMessage?: boolean
    failedAttempts?: boolean
    lastError?: boolean
    createdAt?: boolean
    resolved?: boolean
    resolvedAt?: boolean
    resolvedBy?: boolean
    resolvedNote?: boolean
  }, ExtArgs["result"]["deadLetterQueue"]>

  export type DeadLetterQueueSelectScalar = {
    id?: boolean
    jobId?: boolean
    queueName?: boolean
    jobType?: boolean
    payload?: boolean
    errorMessage?: boolean
    failedAttempts?: boolean
    lastError?: boolean
    createdAt?: boolean
    resolved?: boolean
    resolvedAt?: boolean
    resolvedBy?: boolean
    resolvedNote?: boolean
  }


  export type $DeadLetterQueuePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DeadLetterQueue"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      jobId: string
      queueName: string
      jobType: string
      payload: Prisma.JsonValue
      errorMessage: string | null
      failedAttempts: number
      lastError: string | null
      createdAt: Date
      resolved: boolean
      resolvedAt: Date | null
      resolvedBy: string | null
      resolvedNote: string | null
    }, ExtArgs["result"]["deadLetterQueue"]>
    composites: {}
  }

  type DeadLetterQueueGetPayload<S extends boolean | null | undefined | DeadLetterQueueDefaultArgs> = $Result.GetResult<Prisma.$DeadLetterQueuePayload, S>

  type DeadLetterQueueCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DeadLetterQueueFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DeadLetterQueueCountAggregateInputType | true
    }

  export interface DeadLetterQueueDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DeadLetterQueue'], meta: { name: 'DeadLetterQueue' } }
    /**
     * Find zero or one DeadLetterQueue that matches the filter.
     * @param {DeadLetterQueueFindUniqueArgs} args - Arguments to find a DeadLetterQueue
     * @example
     * // Get one DeadLetterQueue
     * const deadLetterQueue = await prisma.deadLetterQueue.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DeadLetterQueueFindUniqueArgs>(args: SelectSubset<T, DeadLetterQueueFindUniqueArgs<ExtArgs>>): Prisma__DeadLetterQueueClient<$Result.GetResult<Prisma.$DeadLetterQueuePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one DeadLetterQueue that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DeadLetterQueueFindUniqueOrThrowArgs} args - Arguments to find a DeadLetterQueue
     * @example
     * // Get one DeadLetterQueue
     * const deadLetterQueue = await prisma.deadLetterQueue.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DeadLetterQueueFindUniqueOrThrowArgs>(args: SelectSubset<T, DeadLetterQueueFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DeadLetterQueueClient<$Result.GetResult<Prisma.$DeadLetterQueuePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first DeadLetterQueue that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeadLetterQueueFindFirstArgs} args - Arguments to find a DeadLetterQueue
     * @example
     * // Get one DeadLetterQueue
     * const deadLetterQueue = await prisma.deadLetterQueue.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DeadLetterQueueFindFirstArgs>(args?: SelectSubset<T, DeadLetterQueueFindFirstArgs<ExtArgs>>): Prisma__DeadLetterQueueClient<$Result.GetResult<Prisma.$DeadLetterQueuePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first DeadLetterQueue that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeadLetterQueueFindFirstOrThrowArgs} args - Arguments to find a DeadLetterQueue
     * @example
     * // Get one DeadLetterQueue
     * const deadLetterQueue = await prisma.deadLetterQueue.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DeadLetterQueueFindFirstOrThrowArgs>(args?: SelectSubset<T, DeadLetterQueueFindFirstOrThrowArgs<ExtArgs>>): Prisma__DeadLetterQueueClient<$Result.GetResult<Prisma.$DeadLetterQueuePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more DeadLetterQueues that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeadLetterQueueFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DeadLetterQueues
     * const deadLetterQueues = await prisma.deadLetterQueue.findMany()
     * 
     * // Get first 10 DeadLetterQueues
     * const deadLetterQueues = await prisma.deadLetterQueue.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const deadLetterQueueWithIdOnly = await prisma.deadLetterQueue.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DeadLetterQueueFindManyArgs>(args?: SelectSubset<T, DeadLetterQueueFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeadLetterQueuePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a DeadLetterQueue.
     * @param {DeadLetterQueueCreateArgs} args - Arguments to create a DeadLetterQueue.
     * @example
     * // Create one DeadLetterQueue
     * const DeadLetterQueue = await prisma.deadLetterQueue.create({
     *   data: {
     *     // ... data to create a DeadLetterQueue
     *   }
     * })
     * 
     */
    create<T extends DeadLetterQueueCreateArgs>(args: SelectSubset<T, DeadLetterQueueCreateArgs<ExtArgs>>): Prisma__DeadLetterQueueClient<$Result.GetResult<Prisma.$DeadLetterQueuePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many DeadLetterQueues.
     * @param {DeadLetterQueueCreateManyArgs} args - Arguments to create many DeadLetterQueues.
     * @example
     * // Create many DeadLetterQueues
     * const deadLetterQueue = await prisma.deadLetterQueue.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DeadLetterQueueCreateManyArgs>(args?: SelectSubset<T, DeadLetterQueueCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DeadLetterQueues and returns the data saved in the database.
     * @param {DeadLetterQueueCreateManyAndReturnArgs} args - Arguments to create many DeadLetterQueues.
     * @example
     * // Create many DeadLetterQueues
     * const deadLetterQueue = await prisma.deadLetterQueue.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DeadLetterQueues and only return the `id`
     * const deadLetterQueueWithIdOnly = await prisma.deadLetterQueue.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DeadLetterQueueCreateManyAndReturnArgs>(args?: SelectSubset<T, DeadLetterQueueCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DeadLetterQueuePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a DeadLetterQueue.
     * @param {DeadLetterQueueDeleteArgs} args - Arguments to delete one DeadLetterQueue.
     * @example
     * // Delete one DeadLetterQueue
     * const DeadLetterQueue = await prisma.deadLetterQueue.delete({
     *   where: {
     *     // ... filter to delete one DeadLetterQueue
     *   }
     * })
     * 
     */
    delete<T extends DeadLetterQueueDeleteArgs>(args: SelectSubset<T, DeadLetterQueueDeleteArgs<ExtArgs>>): Prisma__DeadLetterQueueClient<$Result.GetResult<Prisma.$DeadLetterQueuePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one DeadLetterQueue.
     * @param {DeadLetterQueueUpdateArgs} args - Arguments to update one DeadLetterQueue.
     * @example
     * // Update one DeadLetterQueue
     * const deadLetterQueue = await prisma.deadLetterQueue.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DeadLetterQueueUpdateArgs>(args: SelectSubset<T, DeadLetterQueueUpdateArgs<ExtArgs>>): Prisma__DeadLetterQueueClient<$Result.GetResult<Prisma.$DeadLetterQueuePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more DeadLetterQueues.
     * @param {DeadLetterQueueDeleteManyArgs} args - Arguments to filter DeadLetterQueues to delete.
     * @example
     * // Delete a few DeadLetterQueues
     * const { count } = await prisma.deadLetterQueue.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DeadLetterQueueDeleteManyArgs>(args?: SelectSubset<T, DeadLetterQueueDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DeadLetterQueues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeadLetterQueueUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DeadLetterQueues
     * const deadLetterQueue = await prisma.deadLetterQueue.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DeadLetterQueueUpdateManyArgs>(args: SelectSubset<T, DeadLetterQueueUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one DeadLetterQueue.
     * @param {DeadLetterQueueUpsertArgs} args - Arguments to update or create a DeadLetterQueue.
     * @example
     * // Update or create a DeadLetterQueue
     * const deadLetterQueue = await prisma.deadLetterQueue.upsert({
     *   create: {
     *     // ... data to create a DeadLetterQueue
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DeadLetterQueue we want to update
     *   }
     * })
     */
    upsert<T extends DeadLetterQueueUpsertArgs>(args: SelectSubset<T, DeadLetterQueueUpsertArgs<ExtArgs>>): Prisma__DeadLetterQueueClient<$Result.GetResult<Prisma.$DeadLetterQueuePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of DeadLetterQueues.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeadLetterQueueCountArgs} args - Arguments to filter DeadLetterQueues to count.
     * @example
     * // Count the number of DeadLetterQueues
     * const count = await prisma.deadLetterQueue.count({
     *   where: {
     *     // ... the filter for the DeadLetterQueues we want to count
     *   }
     * })
    **/
    count<T extends DeadLetterQueueCountArgs>(
      args?: Subset<T, DeadLetterQueueCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DeadLetterQueueCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DeadLetterQueue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeadLetterQueueAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends DeadLetterQueueAggregateArgs>(args: Subset<T, DeadLetterQueueAggregateArgs>): Prisma.PrismaPromise<GetDeadLetterQueueAggregateType<T>>

    /**
     * Group by DeadLetterQueue.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DeadLetterQueueGroupByArgs} args - Group by arguments.
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
      T extends DeadLetterQueueGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DeadLetterQueueGroupByArgs['orderBy'] }
        : { orderBy?: DeadLetterQueueGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, DeadLetterQueueGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDeadLetterQueueGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DeadLetterQueue model
   */
  readonly fields: DeadLetterQueueFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DeadLetterQueue.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DeadLetterQueueClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the DeadLetterQueue model
   */ 
  interface DeadLetterQueueFieldRefs {
    readonly id: FieldRef<"DeadLetterQueue", 'String'>
    readonly jobId: FieldRef<"DeadLetterQueue", 'String'>
    readonly queueName: FieldRef<"DeadLetterQueue", 'String'>
    readonly jobType: FieldRef<"DeadLetterQueue", 'String'>
    readonly payload: FieldRef<"DeadLetterQueue", 'Json'>
    readonly errorMessage: FieldRef<"DeadLetterQueue", 'String'>
    readonly failedAttempts: FieldRef<"DeadLetterQueue", 'Int'>
    readonly lastError: FieldRef<"DeadLetterQueue", 'String'>
    readonly createdAt: FieldRef<"DeadLetterQueue", 'DateTime'>
    readonly resolved: FieldRef<"DeadLetterQueue", 'Boolean'>
    readonly resolvedAt: FieldRef<"DeadLetterQueue", 'DateTime'>
    readonly resolvedBy: FieldRef<"DeadLetterQueue", 'String'>
    readonly resolvedNote: FieldRef<"DeadLetterQueue", 'String'>
  }
    

  // Custom InputTypes
  /**
   * DeadLetterQueue findUnique
   */
  export type DeadLetterQueueFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterQueue
     */
    select?: DeadLetterQueueSelect<ExtArgs> | null
    /**
     * Filter, which DeadLetterQueue to fetch.
     */
    where: DeadLetterQueueWhereUniqueInput
  }

  /**
   * DeadLetterQueue findUniqueOrThrow
   */
  export type DeadLetterQueueFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterQueue
     */
    select?: DeadLetterQueueSelect<ExtArgs> | null
    /**
     * Filter, which DeadLetterQueue to fetch.
     */
    where: DeadLetterQueueWhereUniqueInput
  }

  /**
   * DeadLetterQueue findFirst
   */
  export type DeadLetterQueueFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterQueue
     */
    select?: DeadLetterQueueSelect<ExtArgs> | null
    /**
     * Filter, which DeadLetterQueue to fetch.
     */
    where?: DeadLetterQueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeadLetterQueues to fetch.
     */
    orderBy?: DeadLetterQueueOrderByWithRelationInput | DeadLetterQueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeadLetterQueues.
     */
    cursor?: DeadLetterQueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeadLetterQueues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeadLetterQueues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeadLetterQueues.
     */
    distinct?: DeadLetterQueueScalarFieldEnum | DeadLetterQueueScalarFieldEnum[]
  }

  /**
   * DeadLetterQueue findFirstOrThrow
   */
  export type DeadLetterQueueFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterQueue
     */
    select?: DeadLetterQueueSelect<ExtArgs> | null
    /**
     * Filter, which DeadLetterQueue to fetch.
     */
    where?: DeadLetterQueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeadLetterQueues to fetch.
     */
    orderBy?: DeadLetterQueueOrderByWithRelationInput | DeadLetterQueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DeadLetterQueues.
     */
    cursor?: DeadLetterQueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeadLetterQueues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeadLetterQueues.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DeadLetterQueues.
     */
    distinct?: DeadLetterQueueScalarFieldEnum | DeadLetterQueueScalarFieldEnum[]
  }

  /**
   * DeadLetterQueue findMany
   */
  export type DeadLetterQueueFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterQueue
     */
    select?: DeadLetterQueueSelect<ExtArgs> | null
    /**
     * Filter, which DeadLetterQueues to fetch.
     */
    where?: DeadLetterQueueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DeadLetterQueues to fetch.
     */
    orderBy?: DeadLetterQueueOrderByWithRelationInput | DeadLetterQueueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DeadLetterQueues.
     */
    cursor?: DeadLetterQueueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DeadLetterQueues from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DeadLetterQueues.
     */
    skip?: number
    distinct?: DeadLetterQueueScalarFieldEnum | DeadLetterQueueScalarFieldEnum[]
  }

  /**
   * DeadLetterQueue create
   */
  export type DeadLetterQueueCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterQueue
     */
    select?: DeadLetterQueueSelect<ExtArgs> | null
    /**
     * The data needed to create a DeadLetterQueue.
     */
    data: XOR<DeadLetterQueueCreateInput, DeadLetterQueueUncheckedCreateInput>
  }

  /**
   * DeadLetterQueue createMany
   */
  export type DeadLetterQueueCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DeadLetterQueues.
     */
    data: DeadLetterQueueCreateManyInput | DeadLetterQueueCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DeadLetterQueue createManyAndReturn
   */
  export type DeadLetterQueueCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterQueue
     */
    select?: DeadLetterQueueSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many DeadLetterQueues.
     */
    data: DeadLetterQueueCreateManyInput | DeadLetterQueueCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DeadLetterQueue update
   */
  export type DeadLetterQueueUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterQueue
     */
    select?: DeadLetterQueueSelect<ExtArgs> | null
    /**
     * The data needed to update a DeadLetterQueue.
     */
    data: XOR<DeadLetterQueueUpdateInput, DeadLetterQueueUncheckedUpdateInput>
    /**
     * Choose, which DeadLetterQueue to update.
     */
    where: DeadLetterQueueWhereUniqueInput
  }

  /**
   * DeadLetterQueue updateMany
   */
  export type DeadLetterQueueUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DeadLetterQueues.
     */
    data: XOR<DeadLetterQueueUpdateManyMutationInput, DeadLetterQueueUncheckedUpdateManyInput>
    /**
     * Filter which DeadLetterQueues to update
     */
    where?: DeadLetterQueueWhereInput
  }

  /**
   * DeadLetterQueue upsert
   */
  export type DeadLetterQueueUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterQueue
     */
    select?: DeadLetterQueueSelect<ExtArgs> | null
    /**
     * The filter to search for the DeadLetterQueue to update in case it exists.
     */
    where: DeadLetterQueueWhereUniqueInput
    /**
     * In case the DeadLetterQueue found by the `where` argument doesn't exist, create a new DeadLetterQueue with this data.
     */
    create: XOR<DeadLetterQueueCreateInput, DeadLetterQueueUncheckedCreateInput>
    /**
     * In case the DeadLetterQueue was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DeadLetterQueueUpdateInput, DeadLetterQueueUncheckedUpdateInput>
  }

  /**
   * DeadLetterQueue delete
   */
  export type DeadLetterQueueDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterQueue
     */
    select?: DeadLetterQueueSelect<ExtArgs> | null
    /**
     * Filter which DeadLetterQueue to delete.
     */
    where: DeadLetterQueueWhereUniqueInput
  }

  /**
   * DeadLetterQueue deleteMany
   */
  export type DeadLetterQueueDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DeadLetterQueues to delete
     */
    where?: DeadLetterQueueWhereInput
  }

  /**
   * DeadLetterQueue without action
   */
  export type DeadLetterQueueDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DeadLetterQueue
     */
    select?: DeadLetterQueueSelect<ExtArgs> | null
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


  export const JobStatusScalarFieldEnum: {
    id: 'id',
    jobId: 'jobId',
    jobType: 'jobType',
    queueName: 'queueName',
    status: 'status',
    payload: 'payload',
    result: 'result',
    errorMessage: 'errorMessage',
    attempts: 'attempts',
    maxAttempts: 'maxAttempts',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    completedAt: 'completedAt'
  };

  export type JobStatusScalarFieldEnum = (typeof JobStatusScalarFieldEnum)[keyof typeof JobStatusScalarFieldEnum]


  export const DeadLetterQueueScalarFieldEnum: {
    id: 'id',
    jobId: 'jobId',
    queueName: 'queueName',
    jobType: 'jobType',
    payload: 'payload',
    errorMessage: 'errorMessage',
    failedAttempts: 'failedAttempts',
    lastError: 'lastError',
    createdAt: 'createdAt',
    resolved: 'resolved',
    resolvedAt: 'resolvedAt',
    resolvedBy: 'resolvedBy',
    resolvedNote: 'resolvedNote'
  };

  export type DeadLetterQueueScalarFieldEnum = (typeof DeadLetterQueueScalarFieldEnum)[keyof typeof DeadLetterQueueScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


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


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


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


  export type JobStatusWhereInput = {
    AND?: JobStatusWhereInput | JobStatusWhereInput[]
    OR?: JobStatusWhereInput[]
    NOT?: JobStatusWhereInput | JobStatusWhereInput[]
    id?: StringFilter<"JobStatus"> | string
    jobId?: StringFilter<"JobStatus"> | string
    jobType?: StringFilter<"JobStatus"> | string
    queueName?: StringFilter<"JobStatus"> | string
    status?: StringFilter<"JobStatus"> | string
    payload?: JsonFilter<"JobStatus">
    result?: JsonNullableFilter<"JobStatus">
    errorMessage?: StringNullableFilter<"JobStatus"> | string | null
    attempts?: IntFilter<"JobStatus"> | number
    maxAttempts?: IntFilter<"JobStatus"> | number
    createdAt?: DateTimeFilter<"JobStatus"> | Date | string
    updatedAt?: DateTimeFilter<"JobStatus"> | Date | string
    completedAt?: DateTimeNullableFilter<"JobStatus"> | Date | string | null
  }

  export type JobStatusOrderByWithRelationInput = {
    id?: SortOrder
    jobId?: SortOrder
    jobType?: SortOrder
    queueName?: SortOrder
    status?: SortOrder
    payload?: SortOrder
    result?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    attempts?: SortOrder
    maxAttempts?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
  }

  export type JobStatusWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    jobId?: string
    AND?: JobStatusWhereInput | JobStatusWhereInput[]
    OR?: JobStatusWhereInput[]
    NOT?: JobStatusWhereInput | JobStatusWhereInput[]
    jobType?: StringFilter<"JobStatus"> | string
    queueName?: StringFilter<"JobStatus"> | string
    status?: StringFilter<"JobStatus"> | string
    payload?: JsonFilter<"JobStatus">
    result?: JsonNullableFilter<"JobStatus">
    errorMessage?: StringNullableFilter<"JobStatus"> | string | null
    attempts?: IntFilter<"JobStatus"> | number
    maxAttempts?: IntFilter<"JobStatus"> | number
    createdAt?: DateTimeFilter<"JobStatus"> | Date | string
    updatedAt?: DateTimeFilter<"JobStatus"> | Date | string
    completedAt?: DateTimeNullableFilter<"JobStatus"> | Date | string | null
  }, "id" | "jobId">

  export type JobStatusOrderByWithAggregationInput = {
    id?: SortOrder
    jobId?: SortOrder
    jobType?: SortOrder
    queueName?: SortOrder
    status?: SortOrder
    payload?: SortOrder
    result?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    attempts?: SortOrder
    maxAttempts?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    _count?: JobStatusCountOrderByAggregateInput
    _avg?: JobStatusAvgOrderByAggregateInput
    _max?: JobStatusMaxOrderByAggregateInput
    _min?: JobStatusMinOrderByAggregateInput
    _sum?: JobStatusSumOrderByAggregateInput
  }

  export type JobStatusScalarWhereWithAggregatesInput = {
    AND?: JobStatusScalarWhereWithAggregatesInput | JobStatusScalarWhereWithAggregatesInput[]
    OR?: JobStatusScalarWhereWithAggregatesInput[]
    NOT?: JobStatusScalarWhereWithAggregatesInput | JobStatusScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"JobStatus"> | string
    jobId?: StringWithAggregatesFilter<"JobStatus"> | string
    jobType?: StringWithAggregatesFilter<"JobStatus"> | string
    queueName?: StringWithAggregatesFilter<"JobStatus"> | string
    status?: StringWithAggregatesFilter<"JobStatus"> | string
    payload?: JsonWithAggregatesFilter<"JobStatus">
    result?: JsonNullableWithAggregatesFilter<"JobStatus">
    errorMessage?: StringNullableWithAggregatesFilter<"JobStatus"> | string | null
    attempts?: IntWithAggregatesFilter<"JobStatus"> | number
    maxAttempts?: IntWithAggregatesFilter<"JobStatus"> | number
    createdAt?: DateTimeWithAggregatesFilter<"JobStatus"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"JobStatus"> | Date | string
    completedAt?: DateTimeNullableWithAggregatesFilter<"JobStatus"> | Date | string | null
  }

  export type DeadLetterQueueWhereInput = {
    AND?: DeadLetterQueueWhereInput | DeadLetterQueueWhereInput[]
    OR?: DeadLetterQueueWhereInput[]
    NOT?: DeadLetterQueueWhereInput | DeadLetterQueueWhereInput[]
    id?: StringFilter<"DeadLetterQueue"> | string
    jobId?: StringFilter<"DeadLetterQueue"> | string
    queueName?: StringFilter<"DeadLetterQueue"> | string
    jobType?: StringFilter<"DeadLetterQueue"> | string
    payload?: JsonFilter<"DeadLetterQueue">
    errorMessage?: StringNullableFilter<"DeadLetterQueue"> | string | null
    failedAttempts?: IntFilter<"DeadLetterQueue"> | number
    lastError?: StringNullableFilter<"DeadLetterQueue"> | string | null
    createdAt?: DateTimeFilter<"DeadLetterQueue"> | Date | string
    resolved?: BoolFilter<"DeadLetterQueue"> | boolean
    resolvedAt?: DateTimeNullableFilter<"DeadLetterQueue"> | Date | string | null
    resolvedBy?: StringNullableFilter<"DeadLetterQueue"> | string | null
    resolvedNote?: StringNullableFilter<"DeadLetterQueue"> | string | null
  }

  export type DeadLetterQueueOrderByWithRelationInput = {
    id?: SortOrder
    jobId?: SortOrder
    queueName?: SortOrder
    jobType?: SortOrder
    payload?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    failedAttempts?: SortOrder
    lastError?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    resolved?: SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    resolvedBy?: SortOrderInput | SortOrder
    resolvedNote?: SortOrderInput | SortOrder
  }

  export type DeadLetterQueueWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DeadLetterQueueWhereInput | DeadLetterQueueWhereInput[]
    OR?: DeadLetterQueueWhereInput[]
    NOT?: DeadLetterQueueWhereInput | DeadLetterQueueWhereInput[]
    jobId?: StringFilter<"DeadLetterQueue"> | string
    queueName?: StringFilter<"DeadLetterQueue"> | string
    jobType?: StringFilter<"DeadLetterQueue"> | string
    payload?: JsonFilter<"DeadLetterQueue">
    errorMessage?: StringNullableFilter<"DeadLetterQueue"> | string | null
    failedAttempts?: IntFilter<"DeadLetterQueue"> | number
    lastError?: StringNullableFilter<"DeadLetterQueue"> | string | null
    createdAt?: DateTimeFilter<"DeadLetterQueue"> | Date | string
    resolved?: BoolFilter<"DeadLetterQueue"> | boolean
    resolvedAt?: DateTimeNullableFilter<"DeadLetterQueue"> | Date | string | null
    resolvedBy?: StringNullableFilter<"DeadLetterQueue"> | string | null
    resolvedNote?: StringNullableFilter<"DeadLetterQueue"> | string | null
  }, "id">

  export type DeadLetterQueueOrderByWithAggregationInput = {
    id?: SortOrder
    jobId?: SortOrder
    queueName?: SortOrder
    jobType?: SortOrder
    payload?: SortOrder
    errorMessage?: SortOrderInput | SortOrder
    failedAttempts?: SortOrder
    lastError?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    resolved?: SortOrder
    resolvedAt?: SortOrderInput | SortOrder
    resolvedBy?: SortOrderInput | SortOrder
    resolvedNote?: SortOrderInput | SortOrder
    _count?: DeadLetterQueueCountOrderByAggregateInput
    _avg?: DeadLetterQueueAvgOrderByAggregateInput
    _max?: DeadLetterQueueMaxOrderByAggregateInput
    _min?: DeadLetterQueueMinOrderByAggregateInput
    _sum?: DeadLetterQueueSumOrderByAggregateInput
  }

  export type DeadLetterQueueScalarWhereWithAggregatesInput = {
    AND?: DeadLetterQueueScalarWhereWithAggregatesInput | DeadLetterQueueScalarWhereWithAggregatesInput[]
    OR?: DeadLetterQueueScalarWhereWithAggregatesInput[]
    NOT?: DeadLetterQueueScalarWhereWithAggregatesInput | DeadLetterQueueScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DeadLetterQueue"> | string
    jobId?: StringWithAggregatesFilter<"DeadLetterQueue"> | string
    queueName?: StringWithAggregatesFilter<"DeadLetterQueue"> | string
    jobType?: StringWithAggregatesFilter<"DeadLetterQueue"> | string
    payload?: JsonWithAggregatesFilter<"DeadLetterQueue">
    errorMessage?: StringNullableWithAggregatesFilter<"DeadLetterQueue"> | string | null
    failedAttempts?: IntWithAggregatesFilter<"DeadLetterQueue"> | number
    lastError?: StringNullableWithAggregatesFilter<"DeadLetterQueue"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"DeadLetterQueue"> | Date | string
    resolved?: BoolWithAggregatesFilter<"DeadLetterQueue"> | boolean
    resolvedAt?: DateTimeNullableWithAggregatesFilter<"DeadLetterQueue"> | Date | string | null
    resolvedBy?: StringNullableWithAggregatesFilter<"DeadLetterQueue"> | string | null
    resolvedNote?: StringNullableWithAggregatesFilter<"DeadLetterQueue"> | string | null
  }

  export type JobStatusCreateInput = {
    id?: string
    jobId: string
    jobType: string
    queueName: string
    status: string
    payload: JsonNullValueInput | InputJsonValue
    result?: NullableJsonNullValueInput | InputJsonValue
    errorMessage?: string | null
    attempts?: number
    maxAttempts?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
  }

  export type JobStatusUncheckedCreateInput = {
    id?: string
    jobId: string
    jobType: string
    queueName: string
    status: string
    payload: JsonNullValueInput | InputJsonValue
    result?: NullableJsonNullValueInput | InputJsonValue
    errorMessage?: string | null
    attempts?: number
    maxAttempts?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
  }

  export type JobStatusUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    queueName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    result?: NullableJsonNullValueInput | InputJsonValue
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    attempts?: IntFieldUpdateOperationsInput | number
    maxAttempts?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type JobStatusUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    queueName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    result?: NullableJsonNullValueInput | InputJsonValue
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    attempts?: IntFieldUpdateOperationsInput | number
    maxAttempts?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type JobStatusCreateManyInput = {
    id?: string
    jobId: string
    jobType: string
    queueName: string
    status: string
    payload: JsonNullValueInput | InputJsonValue
    result?: NullableJsonNullValueInput | InputJsonValue
    errorMessage?: string | null
    attempts?: number
    maxAttempts?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    completedAt?: Date | string | null
  }

  export type JobStatusUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    queueName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    result?: NullableJsonNullValueInput | InputJsonValue
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    attempts?: IntFieldUpdateOperationsInput | number
    maxAttempts?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type JobStatusUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    queueName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    result?: NullableJsonNullValueInput | InputJsonValue
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    attempts?: IntFieldUpdateOperationsInput | number
    maxAttempts?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type DeadLetterQueueCreateInput = {
    id?: string
    jobId: string
    queueName: string
    jobType: string
    payload: JsonNullValueInput | InputJsonValue
    errorMessage?: string | null
    failedAttempts: number
    lastError?: string | null
    createdAt?: Date | string
    resolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    resolvedNote?: string | null
  }

  export type DeadLetterQueueUncheckedCreateInput = {
    id?: string
    jobId: string
    queueName: string
    jobType: string
    payload: JsonNullValueInput | InputJsonValue
    errorMessage?: string | null
    failedAttempts: number
    lastError?: string | null
    createdAt?: Date | string
    resolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    resolvedNote?: string | null
  }

  export type DeadLetterQueueUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    queueName?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    failedAttempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedNote?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DeadLetterQueueUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    queueName?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    failedAttempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedNote?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DeadLetterQueueCreateManyInput = {
    id?: string
    jobId: string
    queueName: string
    jobType: string
    payload: JsonNullValueInput | InputJsonValue
    errorMessage?: string | null
    failedAttempts: number
    lastError?: string | null
    createdAt?: Date | string
    resolved?: boolean
    resolvedAt?: Date | string | null
    resolvedBy?: string | null
    resolvedNote?: string | null
  }

  export type DeadLetterQueueUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    queueName?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    failedAttempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedNote?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DeadLetterQueueUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    jobId?: StringFieldUpdateOperationsInput | string
    queueName?: StringFieldUpdateOperationsInput | string
    jobType?: StringFieldUpdateOperationsInput | string
    payload?: JsonNullValueInput | InputJsonValue
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    failedAttempts?: IntFieldUpdateOperationsInput | number
    lastError?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    resolved?: BoolFieldUpdateOperationsInput | boolean
    resolvedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    resolvedBy?: NullableStringFieldUpdateOperationsInput | string | null
    resolvedNote?: NullableStringFieldUpdateOperationsInput | string | null
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
  export type JsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type JobStatusCountOrderByAggregateInput = {
    id?: SortOrder
    jobId?: SortOrder
    jobType?: SortOrder
    queueName?: SortOrder
    status?: SortOrder
    payload?: SortOrder
    result?: SortOrder
    errorMessage?: SortOrder
    attempts?: SortOrder
    maxAttempts?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completedAt?: SortOrder
  }

  export type JobStatusAvgOrderByAggregateInput = {
    attempts?: SortOrder
    maxAttempts?: SortOrder
  }

  export type JobStatusMaxOrderByAggregateInput = {
    id?: SortOrder
    jobId?: SortOrder
    jobType?: SortOrder
    queueName?: SortOrder
    status?: SortOrder
    errorMessage?: SortOrder
    attempts?: SortOrder
    maxAttempts?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completedAt?: SortOrder
  }

  export type JobStatusMinOrderByAggregateInput = {
    id?: SortOrder
    jobId?: SortOrder
    jobType?: SortOrder
    queueName?: SortOrder
    status?: SortOrder
    errorMessage?: SortOrder
    attempts?: SortOrder
    maxAttempts?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    completedAt?: SortOrder
  }

  export type JobStatusSumOrderByAggregateInput = {
    attempts?: SortOrder
    maxAttempts?: SortOrder
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
  export type JsonWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
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
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
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

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DeadLetterQueueCountOrderByAggregateInput = {
    id?: SortOrder
    jobId?: SortOrder
    queueName?: SortOrder
    jobType?: SortOrder
    payload?: SortOrder
    errorMessage?: SortOrder
    failedAttempts?: SortOrder
    lastError?: SortOrder
    createdAt?: SortOrder
    resolved?: SortOrder
    resolvedAt?: SortOrder
    resolvedBy?: SortOrder
    resolvedNote?: SortOrder
  }

  export type DeadLetterQueueAvgOrderByAggregateInput = {
    failedAttempts?: SortOrder
  }

  export type DeadLetterQueueMaxOrderByAggregateInput = {
    id?: SortOrder
    jobId?: SortOrder
    queueName?: SortOrder
    jobType?: SortOrder
    errorMessage?: SortOrder
    failedAttempts?: SortOrder
    lastError?: SortOrder
    createdAt?: SortOrder
    resolved?: SortOrder
    resolvedAt?: SortOrder
    resolvedBy?: SortOrder
    resolvedNote?: SortOrder
  }

  export type DeadLetterQueueMinOrderByAggregateInput = {
    id?: SortOrder
    jobId?: SortOrder
    queueName?: SortOrder
    jobType?: SortOrder
    errorMessage?: SortOrder
    failedAttempts?: SortOrder
    lastError?: SortOrder
    createdAt?: SortOrder
    resolved?: SortOrder
    resolvedAt?: SortOrder
    resolvedBy?: SortOrder
    resolvedNote?: SortOrder
  }

  export type DeadLetterQueueSumOrderByAggregateInput = {
    failedAttempts?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
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
  export type NestedJsonFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
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

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use JobStatusDefaultArgs instead
     */
    export type JobStatusArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = JobStatusDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DeadLetterQueueDefaultArgs instead
     */
    export type DeadLetterQueueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DeadLetterQueueDefaultArgs<ExtArgs>

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
declare module 'vue' {
  const Vue: any;
  export default Vue;
}

declare module 'immer' {
  export type Draft<T> = T;
}

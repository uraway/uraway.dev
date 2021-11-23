---
title: 同値型を判定する型
date: '2021-11-23'
description: ''
tags: [typescript]
comments: true
---

ref: https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650

ある程度型パズルに慣れている方は、型同士が同じかどうか判定する型と聞いて次のように思いつくのではないでしょうか：

```ts twoslash
type Equals<X, Y> = [X] extends [Y] ? ([Y] extends [X] ? true : false) : false;
```

しかし、これは assignability（代入可能かどうか）だけを判定しているため、`any`型に対してはうまく動作しません。

```ts twoslash
type Equals<X, Y> = [X] extends [Y] ? ([Y] extends [X] ? true : false) : false;

// should be true, got true
type test01 = Equals<string, string>;
//     ^?
// should be false, got false
type test02 = Equals<{ foo: string }, { bar: string }>;
//     ^?
// should be false, but got true
type test03 = Equals<any, { bar: string }>;
//     ^?
```

型が全くの同値であるかを判定するには、「条件付き型同士が割り当て可能になるには`extends`直後の型どうしが同値でなければならない」というチェッカーの性質を利用します。

```ts twoslash
export type Equals<A1 extends any, A2 extends any> = (<A>() => A extends A2
  ? 'assignable'
  : 'not assignable') extends <B>() => B extends A1
  ? 'assignable'
  : 'not assignable'
  ? true
  : false;

// should be true, got true
type test01 = Equals<string, string>;
//     ^?
// should be false, got false
type test02 = Equals<{ foo: string }, { bar: string }>;
//     ^?
// should be false, got false
type test03 = Equals<any, { bar: string }>;
//     ^?
```

詳細に見るために、`Equals`を分解してみます。

```ts
declare let x: <A>() => A extends A2 ? 'assignable' : 'not assignable';
declare let y: <B>() => B extends A1 ? 'assignable' : 'not assignable';
x = y;
```

x に y が割り当て可能（代入可能）なとき、`Equals`の戻り値は`true`であるということが言えます。

[参考にした Issue のコメント](https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650)では、次のように述べられていました：

> Here's a solution that makes creative use of the assignability rule for conditional types, which requires that the types after extends be "identical" as that is defined by the checker:

したがって、上記コードにおいて、条件付き型 x に条件付き型 y が割り当て可能であるためには、`extends`直後の型`A1`と`A2`が同値である必要があるということです。

具体的に値を入れて確認してみます。`A1`が`any`、`A2`が`string`であるケース：

```ts twoslash
// @errors: 2322
declare let x: <A>() => A extends string ? 'assignable' : 'not assignable';
declare let y: <B>() => B extends any ? 'assignable' : 'not assignable';
// エラーが発生して代入できない
x = y;
```

`A1`と`A2`がともに`string`であるケースでは：

```ts twoslash
declare let x: <A>() => A extends string ? 'assignable' : 'not assignable';
declare let y: <B>() => B extends string ? 'assignable' : 'not assignable';
// 代入可能
x = y;
```

---

ではなぜ「条件付き型同士が割り当て可能になるには`extends`直後の型どうしが同値でなければならない」という性質があるのでしょうか。

`extends`直後の型が同値でなくても、条件付き型同士が割り当て可能だと仮定してみます：

```ts twoslash
declare let x: <A>() => A extends string ? 'assignable' : 'not assignable';
declare let y: <B>() => B extends number ? 'assignable' : 'not assignable';

const x_1 = x<string>();
//     ^?
const y_1 = y<string>();
//     ^?

// @ts-ignore
x = y;

// 関数シグネチャの定義から戻り値はx_2は`assignable`のはず
// しかし、xにyを代入しており、y_1の戻り値は`not assignable`なので
// 戻り値は`assignable | not assignable`のユニオン型でなければ矛盾する
const x_2 = x<string>();
//     ^?
```

---

### インターセクション型と通常の型は同値とみなされない

`{ foo: true } & { bar: false }`と`{ foo: true; bar: false }`は同値とみなされないことには注意が必要です。

```ts twoslash
type X1 = { foo: true } & { bar: false };
type X2 = { foo: true; bar: false };

export type Equals<A1 extends any, A2 extends any> = (<A>() => A extends A2
  ? 'assignable'
  : 'not assignable') extends <B>() => B extends A1
  ? 'assignable'
  : 'not assignable'
  ? true
  : false;

// should be true, but got false
type test01 = Equals<X1, X2>;
//     ^?
```

これが意図したものであるかは不明ですが、同値かどうか比較している部分のソースコードを見ると、フラグ（`flags`）を比較していることが分かります。

```ts
// https://raw.githubusercontent.com/microsoft/TypeScript/main/src/compiler/checker.ts
function isTypeRelatedTo(
  source: Type,
  target: Type,
  relation: ESMap<string, RelationComparisonResult>
) {
  // ...
  if (relation !== identityRelation) {
    // ...
  } else {
    if (source.flags !== target.flags) return false;
    // ...
  }
  // ...
}
```

フラグの定義（`TypeFlags`）を見てみると、インターセクション型のフラグとオブジェクト型のフラグが異なるため、同値とみなされないようです。

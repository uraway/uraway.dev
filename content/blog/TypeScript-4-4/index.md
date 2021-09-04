---
title: TypeScript 4.4
date: "2021-09-04T07:26:03.284Z"
description: ""
tags: [typescript]
comments: true
---

ref: https://devblogs.microsoft.com/typescript/announcing-typescript-4-4/

### 代入された判別式の control flow analysis

以前の TypeScript では、type guard の判別式を変数に代入した場合、その判別式は機能しない。

```ts twoslash
function foo(arg: unknown) {
  const argIsString = typeof arg === "string"
  if (argIsString) {
    console.log(arg.toUpperCase())
    // Error! Property 'toUpperCase' does not exist on type 'unknown'.
  }
}
```

TypeScript 4.4 では、変数をチェックし、内容が判別式であれば変数の型を絞り込むことができる。

### シンボルとテンプレート文字列としての Index Signature

TypeScript 4.4 からはシンボルとテンプレート文字列パターンが Index Signature として使用できる

```ts twoslash
interface Colors {
  [sym: symbol]: number
}

const red = Symbol("red")

let colors: Colors = {}

colors[red] = 255
```

```ts twoslash
interface Options {
    width?: number;
    height?: number;
    // 任意の`data-`から始まる文字列をプロパティのキーとして使用できる
    [optName: `data-${string}`]: unknown;
}

let option: Options = {
    width: 100,
    height: 100,
    "data-blah": true
};
```

### `useUnknownInCatchVariables`オプション

`catch`句の変数の型を`any`から`unknown`に変更するオプション

```ts twoslash
try {
} catch (err) {
  // unknown
}
```

`strict`オプション下では自動的にオンになる。

### `exactOptionalPropertyTypes`オプション

多くの JavaScript コードでは、存在しないプロパティと`undefined`を値として持つプロパティは同一のものとして扱われる。そのため TypeScript でも、オプショナルプロパティは、`undefined`とのユニオンタイプとして考えられてきた。例えば、

```ts twoslash
interface Person {
  name: string
  age?: number
}
```

これは下記と同様:

```ts twoslash
interface Person {
  name: string
  age?: number | undefined
}
```

`exactOptionalPropertyTypes`オプション下では、オプショナルプロパティは`undefined`とのユニオンタイプを追加しない。存在しないプロパティと区別される。

```ts twoslash
// @errors: 2304
interface Person {
  name: string
  age?: number | undefined
}

const p: Person = {
  name: "Daniel",
  age: undefined, // Type 'undefined' is not assignable to type 'number'.(2322)
}
```

### static ブロック

[ECMAScript プロポーザル](https://github.com/tc39/proposal-class-static-block#ecmascript-class-static-initialization-blocks)の static ブロックをサポート:

```ts twoslash
// @errors: 2304
class Foo {
  static count = 0
}
```

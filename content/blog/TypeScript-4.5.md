---
title: TypeScript 4.5
date: '2021-11-15'
description: ''
tags: [typescript]
comments: true
---

ref: https://devblogs.microsoft.com/typescript/announcing-typescript-4-5/

### ECMAScript モジュールサポートの延期

当初 TypeScript 4.5 beta では、ECMAScript モジュールをサポートするオプションがあったが、現在はナイトリーリリースのみで利用可能。

### `Awaited`型の追加

4.5 では、`Awaited`型が追加されました。この型は、非同期関数の await や、Promise の`.then()`メソッドをモデル化するものです。

```ts twoslash
// A = string
type A = Awaited<Promise<string>>;

// B = number
type B = Awaited<Promise<Promise<number>>>;

// C = boolean | number
type C = Awaited<boolean | Promise<number>>;
```

### node_modules による lib のサポート

TypeScript は一般的な宣言ファイル（JavaScript で利用可能な API や DOM API）をバンドルしていますが、TypeScript をアップグレードすると、これらの変更にも対応しなければなりません。

4.5 では、`package.json`にバージョンを指定することで、特定のビルトイン宣言ファイルをオーバーライドできます。

```json
{
  "dependencies": {
    "@typescript/lib-dom": "npm:@types/web"
  }
}
```

4.5 以降は、TypeScript をアップグレードしても依存ファイルのバージョンの宣言ファイルが使用されます。

### 識別記号としてのテンプレート文字列

4.5 では、テンプレート文字列型を識別記号として認識できるようになりました。

```ts twoslash
export interface Success {
  type: `${string}Success`;
  body: string;
}

export interface Error {
  type: `${string}Error`;
  message: string;
}

export function handler(r: Success | Error) {
  if (r.type === 'HttpSuccess') {
    // 'r'はSuccess型となり、
    // `body`型はstringとなる
    let token = r.body;
  }
}
```

### es2022 モジュールのサポート

トップレベル await などの機能を持つ、`es2022`をサポートしています。

```json
{
  "compilerOptions": {
    "module": "es2022"
  }
}
```

### 条件付き型における末尾呼び出しの除去

TypeScript では、無限に続く可能性のある再帰や、時間がかかってエディタの操作に影響があるような型の拡張を検出したときに、潔く失敗する必要があることがあります。そのため、無限に深い型を分解しようとするときや、多くの中間結果を生成する型を扱うときに、暴走しないようにするヒューリスティックを備えています。

```ts twoslash
// @errors: 2589
type InfiniteBox<T> = { item: InfiniteBox<T> };

type Unpack<T> = T extends { item: infer U } ? Unpack<U> : T;

type Test = Unpack<InfiniteBox<number>>;
```

例えば、下記の`TrimLeft`は、一つの分岐で末尾再帰的になるように書かれています。呼び出しごとにスタックに呼び出し元に戻るための情報を保存する必要がなく、末尾呼び出しの最適化（末尾呼び出しの除去）が行えます。

```ts twoslash
type TrimLeft<T extends string> = T extends ` ${infer Rest}`
  ? TrimLeft<Rest>
  : T;

// 4.4以前はエラー: Type instantiation is excessively deep and possibly infinite.
type Test = TrimLeft<'                                                oops'>;
```

### インポート削除の無効化

TypeScript では、インポートを使用していることが検知できない場合があります

```ts twoslash
// @preserveValueImports: true
import { Animal } from './animal.js';

eval('console.log(new Animal().isDangerous())');

// @filename: ./animal.js
export class Animal() {}
```

デフォルトでは、このようなインポートは常に削除されます。4.5 では、`--preserveValueImports`フラグを使ってインポートを削除しないようにできます。

### インポート名の`type`修飾子

4.4 以前にも、インポートを削除することができる印として`type`修飾子がありますが、値もインポートしたい場合、同じモジュール名に対して 2 つの `import`文が必要でした。

```ts twoslash
import { someFunc } from './some-module.js';
import type { BaseType } from './some-module.js';

export class Thing implements BaseType {}

// @filename: some-module.js
export function someFunc() {}
export class BaseType {}
```

4.5 では、個々の名前付き`import`に`type`修飾子を付けることができるようになりました。

```ts twoslash
import { someFunc, type BaseType } from './some-module.js';

export class Thing implements BaseType {}

// @filename: some-module.js
export function someFunc() {}
export class BaseType {}
```

### プライベートフィールドの存在チェック

4.5 では、オブジェクトがプライベートフィールドを持っているかチェックする ECMAScript のプロポーザルをサポートしています。

```ts twoslash
class Person {
  #name: string;
  constructor(name: string) {
    this.#name = name;
  }

  equals(other: unknown) {
    return (
      other &&
      typeof other === 'object' &&
      #name in other && // <- this is new!
      this.#name === other.#name
    );
  }
}
```

### インポートアサーション

4.5 では、ECMAScript によるインポートアサーションのプロポーザルをサポートしています。これはランタイム時にインポートが期待されるフォーマットを持っているかどうかを確認するために使用する構文です。

```ts twoslash
// @resolveJsonModule: true
import obj from './something.json' assert { type: 'json' };

// @filename: something.json
{
}
```

### JSDoc における const アサーションとデフォルト型引数

4.5 では、にいくつかの JSDoc 表現が加わりました。

その一つの例が const アサーションです。TypeScript では、リテラルの後に const を書くことでより正確で不変的な型を表現することができます。

```ts twoslash
let a = { prop: 'hello' };
//  ^?
let b = { prop: 'hello' } as const;
//  ^?
```

JS ファイルでも、JSDoc のタイプアサーションを使って同じことができるようになりました。

```js
let a = { prop: 'hello' };

let b = /** @type {const} */ { prop: 'hello' };
```

4.5 では、さらにデフォルト型引数が JSDoc に追加されました。

```ts twoslash
type Foo<T extends string | number = number> = { prop: T };
```

JavaScript では`@typedef`宣言を使って次のように書くことができます

```js
/**
 * @template {string | number} [T=number]
 * @typedef Foo
 * @property prop {T}
 */

// or

/**
 * @template {string | number} [T=number]
 * @typedef {{ prop: T }} Foo
 */
```

### realpathSync.native によるロードタイムの高速化

TypeScript は、すべての OS で Node.js の realpathSync.native 関数を利用するようになりました。

以前はこの関数は Linux でのみ使用されていましたが、TypeScript 4.5 では、Node.js の最新バージョンを実行している限り、コンパイラは Windows や MacOS のような一般的に大文字小文字を区別しない OS でもこの関数を使用します。この変更により、Windows 上の特定のコードベースにおいて、プロジェクトの読み込みが 5-13%速くなりました。

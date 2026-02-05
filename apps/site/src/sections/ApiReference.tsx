import { Section } from '../components'
import styles from './ApiReference.module.css'

export const ApiReference = () => {
  return (
    <Section
      id="reference"
      number="04"
      title="API Reference"
      subTitle="apizel の全 API インターフェースと詳細な振る舞い。"
    >
      {/* 1. apizel() */}
      <div className={styles.refBlock} id="reference-apizel">
        <h3 className={styles.refTitle}>apizel(config)</h3>
        <p className={styles.refDesc}>ApiClient インスタンスを生成します。</p>
        <div className={styles.signature}>
          <code>apizel(config: ApizelConfig): ApiClient</code>
        </div>
      </div>

      {/* 2. ApizelConfig */}
      <div className={styles.refBlock} id="reference-config">
        <h3 className={styles.refTitle}>ApizelConfig</h3>
        <p className={styles.refDesc}>
          設定オブジェクト（フラットな構造です）。
          <br />
          <code>auth</code> や <code>observe</code> は論理的なグルーピングであり、ネストではありません。
        </p>
        <div className={styles.propGrid}>
          <div className={styles.propRow}>
            <div className={styles.propName}>
              baseURL<span>required</span>
            </div>
            <div className={styles.propDetail}>
              <code>string</code>
              <p>リクエストの起点となるURL。endpointと結合時にスラッシュは自動補正されます。</p>
            </div>
          </div>
          <div className={styles.propRow}>
            <div className={styles.propName}>headers</div>
            <div className={styles.propDetail}>
              <code>Record&lt;string, string&gt;</code>
              <p>全リクエスト共通ヘッダー。リクエスト単位で上書き可能です（後勝ち）。</p>
            </div>
          </div>

          {/* headers group: Auth */}
          <div className={styles.propHeader}>Auth</div>
          <div className={styles.propRow}>
            <div className={styles.propName}>getAccessToken</div>
            <div className={styles.propDetail}>
              <code>() =&gt; string | null | Promise&lt;string | null&gt;</code>
              <p>現在のアクセストークンを取得する関数。同期・非同期のどちらでも可能です。</p>
            </div>
          </div>
          <div className={styles.propRow}>
            <div className={styles.propName}>shouldAttachToken</div>
            <div className={styles.propDetail}>
              <code>(req: RequestMeta) =&gt; boolean</code>
              <p>
                特定のリクエストにトークンを付与するかどうかの判定。
                <br />
                未定義の場合は<strong>全リクエストに付与</strong>されます。
              </p>
            </div>
          </div>
          <div className={styles.propRow}>
            <div className={styles.propName}>refresh</div>
            <div className={styles.propDetail}>
              <code>() =&gt; Promise&lt;string&gt;</code>
              <p>
                401エラー時に実行されるトークン再取得関数。新しいトークンを返してください。
                <br />
                <strong>Single-flight: </strong>
                並行リクエストがあっても1回だけ実行され、他は待機します。
                <br />
                <strong>Safety: </strong>
                リフレッシュ処理中の再帰的な401エラーは無視され、無限ループを防ぎます。
              </p>
            </div>
          </div>
          <div className={styles.propRow}>
            <div className={styles.propName}>onRefreshFailed</div>
            <div className={styles.propDetail}>
              <code>() =&gt; void | Promise&lt;void&gt;</code>
              <p>リフレッシュ処理が失敗（例外スロー）した場合のフック。ログアウト処理などに。</p>
            </div>
          </div>

          {/* headers group: Analyze */}
          <div className={styles.propHeader}>Observe</div>
          <div className={styles.propRow}>
            <div className={styles.propName}>
              onRequest
              <br />
              onResponse
            </div>
            <div className={styles.propDetail}>
              <code>(ctx) =&gt; void | Promise&lt;void&gt;</code>
              <p>観測用フック。ログ、計測、デバッグ出力などに使用（挙動の変更は不可）。</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ApiClient */}
      <div className={styles.refBlock} id="reference-client">
        <h3 className={styles.refTitle}>ApiClient</h3>
        <p className={styles.refDesc}>Promise&lt;DTO&gt; を返す薄い5つのメソッドを提供します。</p>
        <div className={styles.methodList}>
          <code>.get&lt;T&gt;(endpoint, options?)</code>
          <code>.delete&lt;T&gt;(endpoint, options?)</code>
          <code>.post&lt;T&gt;(endpoint, body?, options?)</code>
          <code>.put&lt;T&gt;(endpoint, body?, options?)</code>
          <code>.patch&lt;T&gt;(endpoint, body?, options?)</code>
        </div>
        <div className={styles.note}>
          <strong>Body Handling:</strong>
          <ul>
            <li>
              <code>FormData</code>, <code>URLSearchParams</code>, <code>Blob</code> はそのまま送信
            </li>
            <li>
              その他は <code>JSON.stringify</code> され、Content-Type: application/json が自動付与
            </li>
          </ul>
        </div>
      </div>

      {/* 4. RequestOptions & Params */}
      <div className={styles.refBlock} id="reference-options">
        <h3 className={styles.refTitle}>RequestOptions & Params</h3>
        <div className={styles.propGrid}>
          <div className={styles.propRow}>
            <div className={styles.propName}>params</div>
            <div className={styles.propDetail}>
              <p>
                Query String として展開されます。
                <br />
                配列は repeat 形式（<code>tag: ['a','b']</code> → <code>?tag=a&tag=b</code>）
                <br />※ 軽量化のため Object のネストは非対応（意図的にエラーをスロー）。
              </p>
            </div>
          </div>
          <div className={styles.propRow}>
            <div className={styles.propName}>timeoutMs</div>
            <div className={styles.propDetail}>
              <code>number</code>
              <p>
                指定時間経過後にリクエストを <strong>Abort</strong> します。HttpError ではなく
                AbortError が投げられます。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Errors */}
      <div className={styles.refBlock} id="reference-errors">
        <h3 className={styles.refTitle}>Errors</h3>
        <div className={styles.propGrid}>
          <div className={styles.propRow}>
            <div className={styles.propName}>HttpError</div>
            <div className={styles.propDetail}>
              <p>
                <code>res.ok === false</code> の場合にスロー。
                <code>status</code>, <code>data</code>, <code>url</code> 等を保持します。
              </p>
            </div>
          </div>
          <div className={styles.propRow}>
            <div className={styles.propName}>AbortError</div>
            <div className={styles.propDetail}>
              <p>
                タイムアウトや <code>signal.abort()</code> による中断時にスロー。 apizel はこれを{' '}
                <strong>HttpError に変換しません</strong>。
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

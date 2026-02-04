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
      <div className={styles.refBlock}>
        <h3 className={styles.refTitle}>apizel(config)</h3>
        <p className={styles.refDesc}>ApiClient インスタンスを生成します。</p>
        <div className={styles.signature}>
          <code>apizel(config: ApizelConfig): ApiClient</code>
        </div>
      </div>

      {/* 2. ApizelConfig */}
      <div className={styles.refBlock}>
        <h3 className={styles.refTitle}>ApizelConfig</h3>
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
              <p>全リクエスト共通ヘッダー。リクエスト単位で上書き可能です。</p>
            </div>
          </div>
          <div className={styles.propRow}>
            <div className={styles.propName}>auth</div>
            <div className={styles.propDetail}>
              <code>{'{ getAccessToken, refresh, ... }'}</code>
              <p>
                <strong>getAccessToken:</strong> トークン取得関数。
                <br />
                <strong>refresh:</strong> 401時に1度だけ実行される新トークン取得関数。
              </p>
            </div>
          </div>
          <div className={styles.propRow}>
            <div className={styles.propName}>observe</div>
            <div className={styles.propDetail}>
              <code>{'{ onRequest, onResponse }'}</code>
              <p>観測用フック。ログ、計測、デバッグ出力などに使用（挙動の変更は不可）。</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ApiClient */}
      <div className={styles.refBlock}>
        <h3 className={styles.refTitle}>ApiClient</h3>
        <p className={styles.refDesc}>Promise&lt;DTO&gt; を返す薄い5つのメソッドを提供します。</p>
        <div className={styles.methodList}>
          <code>.get&lt;T&gt;(endpoint, options?)</code>
          <code>.delete&lt;T&gt;(endpoint, options?)</code>
          <code>.post&lt;T&gt;(endpoint, body?, options?)</code>
          <code>.put&lt;T&gt;(endpoint, body?, options?)</code>
          <code>.patch&lt;T&gt;(endpoint, body?, options?)</code>
        </div>
      </div>

      {/* 4. RequestOptions & Params */}
      <div className={styles.refBlock}>
        <h3 className={styles.refTitle}>RequestOptions & Params</h3>
        <div className={styles.propGrid}>
          <div className={styles.propRow}>
            <div className={styles.propName}>params</div>
            <div className={styles.propDetail}>
              <p>
                配列は repeat 形式（<code>tag: ['a','b']</code> → <code>?tag=a&tag=b</code>
                ）で展開。
                <br />※ Object 形式は非対応（エラーをスロー）。
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
      <div className={styles.refBlock}>
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

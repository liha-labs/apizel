import { Layout } from './components'
import { ApiReference, Examples, Footer, Hero, Introduction, QuickStart, Usage } from './sections'

export const App = () => {
  return (
    <Layout hero={<Hero />} footer={<Footer />}>
      <Introduction />
      <QuickStart />
      <Usage />
      <ApiReference />
      <Examples />
    </Layout>
  )
}

import type { NextPage } from "next"
import Link from "next/link"
import styled from "styled-components"

import { Page } from "../components/Page"

const Paragraph = styled.p`
  font-size: 24px;
  margin: 14px 0;
`

const Error: NextPage = () => (
  <Page title="Error" centered>
    <Paragraph>Nothing to see here</Paragraph>
    <Link href="/">Start over</Link>
  </Page>
)

export default Error

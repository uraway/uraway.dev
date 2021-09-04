import React from 'react'
import { Facebook, Twitter } from "react-feather"
import {
  FacebookShareButton,
  TwitterShareButton,
} from "react-share"

const ShareButtons = ({ url, title, description }) => (
  <div style={{ display: 'flex', gap: '2rem' }}>
    <FacebookShareButton url={url} quote={description}>
      <Facebook strokeWidth={1.25} />
    </FacebookShareButton>
    <TwitterShareButton url={url} title={description}>
      <Twitter strokeWidth={1.25} />
    </TwitterShareButton>
  </div>
)

export default ShareButtons

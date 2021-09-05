import React from 'react';
import { Link, graphql, PageProps } from 'gatsby';

import Layout from '../components/layout';
import SEO from '../components/seo';
import ShareButtons from '../components/share-buttons.js';
import { rhythm, scale } from '../utils/typography';

const BlogPostTemplate = ({
  data,
  pageContext,
  location,
}: PageProps<GatsbyTypes.BlogPostQuery, GatsbyTypes.MarkdownRemarkEdge>) => {
  const post = data.markdownRemark;
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const { title, date, tags } = post.frontmatter;
  const description = post.frontmatter.description
    ? post.frontmatter.description
    : post.excerpt;
  // const siteTitle = data.site.siteMetadata.title
  const { previous, next } = pageContext;
  return (
    <Layout location={location} title="Home">
      <SEO title={title} description={description} />
      <article>
        <header>
          <h1
            style={{
              marginBottom: 0,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              ...scale(-1 / 5),
              display: `block`,
              marginBottom: rhythm(1),
            }}
          >
            {date}
          </p>
          <p>
            {tags.map((tag) => (
              <Link
                key={tag}
                to={`/tags/${tag}`}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '2px',
                  textDecoration: 'none',
                  padding: '2px 6px',
                  marginRight: '0.5rem',
                  color: '#ccc',
                  boxShadow: 'none',
                }}
              >
                {tag}
              </Link>
            ))}
          </p>
        </header>
        <section dangerouslySetInnerHTML={{ __html: post.html }} />
        <hr
          style={{
            marginBottom: rhythm(1),
          }}
        />
        <footer>
          <ShareButtons url={url} title={title} description={description} />
        </footer>
      </article>

      <nav>
        <ul
          style={{
            display: `flex`,
            flexWrap: `wrap`,
            justifyContent: `space-between`,
            listStyle: `none`,
            padding: 0,
          }}
        >
          <li>
            {previous && (
              <Link to={previous.fields.slug} rel="prev">
                ← {previous.frontmatter.title}
              </Link>
            )}
          </li>
          <li>
            {next && (
              <Link to={next.fields.slug} rel="next">
                {next.frontmatter.title} →
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </Layout>
  );
};

export default BlogPostTemplate;

export const pageQuery = graphql`
  query BlogPost($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
        tags
      }
    }
  }
`;

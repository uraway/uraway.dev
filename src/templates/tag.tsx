import React from 'react';
import { graphql } from 'gatsby';
import Layout from '../components/layout';
import ArticleSummary from './article-summary';

const Tag = ({ pageContext, data, location }) => {
  const siteTitle = data.site.siteMetadata.title;
  const { tag } = pageContext;
  const { edges, totalCount } = data.allMarkdownRemark;
  const tagHeader = `${totalCount} post${
    totalCount === 1 ? '' : 's'
  } tagged with "${tag}"`;

  return (
    <Layout location={location} title={siteTitle}>
      <h1>{tagHeader}</h1>
      {edges.map(({ node }) => {
        const { slug } = node.fields;
        const { title } = node.frontmatter;
        return <ArticleSummary key={slug} node={node} title={title} />;
      })}
    </Layout>
  );
};

export default Tag;

export const pageQuery = graphql`
  query($tag: String) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
          }
        }
      }
    }
  }
`;

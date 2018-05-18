# Source content

* Trello board
* GitHub repo

## Usage

### GraphQL End-point

* API: `https://1.source.collected.design/graphql`
* Interactive: `https://1.source.collected.design/graphiql`

### GitHub: All files in the RoyalIcing/lofi-bootstrap repo

```graphql
gitHubRepo(owner: "RoyalIcing", repoName: "lofi-bootstrap") {
  owner,
  files {
    path
    content
  }
}
```

### Trello: Lists and their cards in a board

```graphql
query Trello {
  trelloBoard(id: "580710faeb62c4f7a6fa7786") {
    name
    id
    lists {
      id
      name
      cards {
        id
        name
        desc
      }
    }
  }
}
```

### Trello: Cards tagged #page in a list named ‘Stripe’

```graphql
{
  collectedNavs: trelloBoard(id: "4wctPH1u") {
    name
    stripe: list(name: "Stripe") {
      name
      pages: cards(tags: ["page"]) {
        name
        body: desc {
          headings {
            text
            level
          }
        }
      }
    }
  }
}
```

## Deploying

### AWS Lambda with Apex Up

1.  [Install Up](https://github.com/apex/up/issues#quick-start)

#### Staging

    up

#### Production

    up deploy production

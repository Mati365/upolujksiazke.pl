# Bookmeter.org

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square)](https://www.gnu.org/licenses/gpl-3.0)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fbookmeter.org&style=flat-square)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

OpenSource book reviews aggregator that helps with searching book reviews. Something like Metacritic / Digg for books.

## Goals

- [ ] Notifications about new reviews
- [ ] Front page customization (pin sections)
- [ ] Read list
- [ ] Category books RSS
- [ ] Allow users to books exchange

## Available websites

🇵🇱 Poland

- [x] Wykop.pl (#bookmeter tag)
- [ ] Booklips.pl
- [ ] Swiatksiazki.pl

🌍 World

- [ ] Reddit
- [ ] Goodreads

## Development

### Setup

```bash
yarn install
mikro-orm migration:up
yarn run develop
gulp scrapper:refresh
```

### Tasks

Fetchers:

```bash
# Fetches single review by id
gulp scrapper:refresh:single --remoteId 123 --website https://wykop.pl

# Fetches all reviews from scrapper
gulp scrapper:refresh:all --initialPage 1 --website https://wykop.pl

# Refreshes only first remote reviews page using all scrappers
gulp scrapper:refresh:latest

# Fetches all reviews pages from websites using all scrappers
gulp scrapper:refresh:all
```

Analyzers:

```bash
# Iteratores over all records and reparses them, dangerous!!
# it removes records that are not classified as reviews after analyze
gulp scrapper:reanalyze:all
```

### Importers

#### Flow

  1. Running `scrapper` tasks such as `refreshLatest`, `refreshSingle` triggers fetching new records into `scrapper_metadata` table. All of these functions are stored in `ServiceModule -> ScrapperService`. After successful fetching page of scrapped content `ScrapperService` creates new background job stored in redis that runs database and book matchers.

  2. Each job is later executed and `MetadataDbLoaderService` tries to match book in database and saves it.

#### Scrappers

  Adding new scrapper:

  1. Create scrapper file

  ```bash
    cd ./src/server/modules/importer/modules/scrapper/service/scrappers/
    mkdir example-scrapper/
    touch example-scrapper/ExampleScrapper.ts
  ```

  2. Assign scrapper to `scrappers` variable inside `ScrapperService`

## Stack

Real World Nest.JS + MikroORM app.

- Node.JS
- Nest.JS
- Mikro-orm
- React
- nginx

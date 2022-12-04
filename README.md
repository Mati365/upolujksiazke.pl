# upolujksiazke.pl

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/9251952df8934dd7b138acf02de68b1d)](https://www.codacy.com/gh/upolujksiazke/upolujksiazke.pl/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=upolujksiazke/upolujksiazke.pl&amp;utm_campaign=Badge_Grade)
![Website](https://img.shields.io/website?url=https%3A%2F%2Fupolujksiazke.pl&style=flat-square)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

Real world open source book reviews aggregator, something like Metacritic / Digg for books. It allows to compare book price between different shops.

## Screens

![Filtered books](/doc/screens/filtered-books.png) <br />
![Book](/doc/screens/reviews.png) <br />
![Book](/doc/screens/book-2.png) <br />
![Book](/doc/screens/book.png) <br />
![Home](/doc/screens/home.png) <br />
![Bot](/doc/screens/integration.png)

## Available websites

🇵🇱 Poland

- [x] Wykop.pl (#bookmeter tag)
- [x] Gildia.pl
- [x] Literatura Gildia
- [x] Granice.pl
- [x] Matras.pl
- [x] Bonito.pl
- [x] Skupszop.pl
- [x] Dadada.pl
- [x] Aros.pl
- [x] Publio.pl
- [x] Hrosskar.blogspot.com
- [x] krytycznymokiem.blogspot.com
- [x] Madbooks.pl
- [x] Gandalf.com.pl
- [x] ibuk.pl
- [x] Woblink.com
- [x] Taniaksiazka.pl
- [x] Bryk.pl
- [x] Streszczenia.pl
- [x] klp.pl
- [x] legimi.pl

To be added soon:

🇵🇱 Poland

- [ ] polskina5.pl
- [ ] Virtualo.pl
- [ ] tantis.pl
- [ ] Znak.com.pl
- [ ] Swiatksiazki.pl
- [ ] wbibliotece.pl
- [ ] Wolnelektury.pl
- [ ] LitRes.pl
- [ ] audible.com
- [ ] Chodnikliteracki.pl
- [ ] czeskieklimaty.pl
- [ ] paskarz.pl
- [ ] litres.pl
- [ ] selkar.pl
- [ ] promocjeksiazkowe.pl (Blog Post)
- [ ] eczytanie-eksiazki.blogspot.com (Blog Post)
- [ ] Tantis.pl
- [ ] Gandalf.com
- [ ] Booklips.pl
- [ ] Allegro.pl
- [ ] Cyfroteka.pl
- [ ] Amazon.com
- [ ] Nieprzeczytane.pl
- [ ] wolnelektury.pl
- [ ] bookbook.pl
- [ ] nakanapie.pl
- [ ] opracowania.pl
- [ ] ksiegarnia-armoryka.pl

🌍 World

- [ ] Reddit
- [ ] Goodreads

## Goals

- [x] wykop #książki as blog
- [x] Book summary
- [ ] Changes history
- [x] Mark as school reading
- [x] Book summary aggregation
- [ ] Free readings download button
- [ ] Discover all author books (links discover queue, discover all series book, all author book)
- [ ] Add article scrapping (wykop, reddit, etc)
- [ ] Book series tree (al'a tree box)
- [ ] Allegro.pl / Amazon.pl / Skąpiec.pl price synchronization integration
- [ ] Wikipedia style edit info proposals
- [ ] Automatic daily summary tag posting (wykop.pl, #bookmeter tag)
- [ ] Notifications about new reviews
- [ ] Front page customization (pin sections)
- [ ] Read list
- [ ] Category books RSS
- [ ] Price, activity diagram, notifications
- [x] Category filters
- [ ] Trending books
- [ ] Emoji reactions
- [ ] Add comment after publishing entry on wykop.pl with links to shops, add comment to verify matched book
- [ ] Add current user library link to wykop comment
- [x] Add website spiders (as separate module that appends content to redis)
- [ ] Fb top offers bot post publish
- [ ] product basket, compare multiple books prices in table and summarize per shop basket price
- [ ] RSS integration
- [ ] E-Book readers price section and reviews
- [ ] Section: Top Books/Reviews from Wykop.pl
- [ ] Machine learning for book (review) picking
- [ ] Users who bought this book bought also section
- [ ] Automatic blog posts
- [x] SEOLinks on blog posts / reviews
- [ ] Tinder alternative but for books
- [ ] Wykop charts in comment
- [ ] Add trending stats
- [ ] Books summaries
- [ ] Dynamic create e-leaflets from books grouped by shop
- [ ] Add button on availability table with "add store link" and if user adds try to parse
- [x] Video reviews
- [ ] Users might create own book regals
- [ ] allow users to add book store by configuring JSON / XML (https://news.ycombinator.com/item?id=27739568)
- [ ] add e-leaflets
- [ ] youtube reviews
- [ ] add coupons
- [ ] books cons table
- [ ] Lookup in Empik go, Legimi

## Development

### Setup

```bash
cp .env.example .env # edit .env config
yarn install

yarn run migration:run
yarn run seed:run
gulp entity:reindex:all

[yarn run console]:
  await app.select(ScrapperModule).get('BookParentCategoryService').findAndAssignMissingParentCategories();
  await app.select(ScrapperModule).get('BookCategoryRankingService').refreshCategoryRanking();
  await app.select(ScrapperModule).get('BookStatsService').refreshAllBooksStats();
[/console]

yarn run develop
gulp scrapper:refresh
```

### Remote connect

Proxy local 9201 to remote ES

```bash
ssh -g -L 9201:localhost:9200 -f -N deploy@upolujksiazke.pl
```

### REPL

There is NestJS context present on window, it is called `app`. All entities are exporeted to context.

```bash
yarn console
```

#### REPL Examples

**⚠️ Use services to remove records!** (TypeORM async callbacks are buggy)

Remove book:

```bash
app.select(ScrapperModule).get('BookService').delete([13])
```

Reindex all record of particular type (after index structure change or something):

```bash
app.select(ScrapperModule).get('EsBookIndex').reindexAllEntities();
```

### Tasks

Sitemap:

```bash
gulp sitemap:refresh
```

Fetchers:

```bash
# Reindex all records
gulp entity:reindex:all

# Fetches single review by id
gulp scrapper:refresh:single --kind BOOK_REVIEW --remoteId 123 --website wykop.pl

# Fetches single book by url
gulp scrapper:refresh:single --remoteId szepty-spoza-nicosci-remigiusz-mroz,p697692.html --website www.publio.pl

# Fetches all reviews from scrapper
gulp scrapper:refresh:all --kind BOOK_REVIEW --website wykop.pl

# Refreshes only first remote reviews page using all scrappers
gulp scrapper:refresh:latest --kind BOOK_REVIEW
gulp scrapper:refresh:latest --kind BOOK_REVIEW --website wykop.pl

# Fetches all reviews pages from websites using all scrappers
gulp scrapper:refresh:all --kind BOOK_REVIEW

# Fetches missing favicons
gulp entity:website:fetch-missing-logos

# Refreshes promotion value in categories
gulp entity:category:refresh-ranking

# After adding new scrapper fetch availability for books
gulp scrapper:loader:fetch-availability --scrapperGroupId=26
```

Analyzers:

```bash
# Iterates over all records and reparses them, dangerous!!
# it removes records that are not classified as reviews after analyze
gulp scrapper:reanalyze:all --kind BOOK_REVIEW

# Parses again single record
gulp scrapper:reanalyze:single --remoteId szepty-spoza-nicosci-remigiusz-mroz,p697692.html --website www.publio.pl
```

Stats (console):

```bash
app.select(BookModule).get('BookStatsService').refreshBooksStats(R.pluck('id', books))
```

Spiders:

```bash
 gulp scrapper:spider:run
```

Scrappers:

Refresh all books from all websites:

```bash
 node_modules/.bin/gulp scrapper:refresh:all --kind BOOK_REVIEW --initialPage 1 --website wykop.pl
 node_modules/.bin/gulp scrapper:refresh:all --kind BOOK_REVIEW --website hrosskar.blogspot.com
```

### Locks

Prevent clearing redis when warmup when lock is available (used for long tasks)

```bash
dist/locks/redis_warmup_flushdb.lock
```

### Importers

#### Flow

  1. Running `scrapper` tasks such as `refreshLatest`, `refreshSingle` triggers fetching new records into `scrapper_metadata` table. All of these functions are stored in `ServiceModule -> ScrapperService`. After successful fetching page of scrapped content `ScrapperService` creates new background job stored in redis that runs database and book matchers.

  2. Each job is later executed and `MetadataDbLoaderService` tries to match book in database and saves it.

#### Scrappers

  Adding new scrapper:

  1. Create scrapper file

  ```bash
    cd ./src/server/modules/importer/sites/
    mkdir example-scrapper/
    touch example-scrapper/ExampleScrapperGroup.ts
  ```

  2. Assign scrapper to `scrappersGroups` variable inside `ScrapperService`

## Stack

Real World Nest.JS + TypeORM app.

- Node.JS
- Nest.JS
- TypeORM
- React
- nginx
- Nomad

# Bookmeter.org

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

OpenSource platform that aggregates reviews and book ratings from all websites. Something like Metacritic / Digg for books.

## Goals

- [ ] Notifications about new reviews
- [ ] Front page customization (pin sections)
- [ ] Read list
- [ ] Category books RSS

## Available websites

- [x] Wykop.pl #bookmeter
- [ ] Booklips.pl
- [ ] Reddit
- [ ] Goodreads

## Development

**Setup:**

```bash
yarn install
yarn run develop
mikro-orm schema:update -r
gulp scrapper:refresh
```

**Tasks:**

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

## Stack

- Node.JS
- Nest.JS
- Mikro-orm
- React
- nginx

# Bookmeter.org

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

OpenSource platform that aggregates reviews and book ratings.

## Development

Setup:

```bash
yarn install
yarn run develop
mikro-orm schema:update -r
gulp scrapper:refresh
```

Tasks:

```bash
gulp scrapper:refresh:single --remoteId 123 --website https://wykop.pl # Fetches single review by id
gulp scrapper:refresh:latest # Refreshes only first remote page of reviews
gulp scrapper:refresh:all # Refreshes all reviews on website
```

## Stack

- Node.JS
- Nest.JS
- Mikro-orm
- React
- nginx

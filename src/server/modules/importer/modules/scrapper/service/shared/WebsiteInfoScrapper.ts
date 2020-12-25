import cheerio from 'cheerio';
import {ScrapperWebsiteEntity} from '../../entity';

export interface WebsiteInfoScrapper {
  readonly websiteURL: string;
  fetchWebsiteEntity(): Promise<ScrapperWebsiteEntity>
}

/**
 * Fetch basic info about website from meta tags
 *
 * @export
 * @param {string} url
 * @returns {Promise<ScrapperWebsiteEntity>}
 */
export async function fetchWebsiteInfo(url: string): Promise<ScrapperWebsiteEntity> {
  const $ = cheerio.load(
    await fetch(url).then((r) => r.text()),
  );

  return new ScrapperWebsiteEntity(
    {
      url,
      title: $('title').text(),
      description: $('meta[name="description"]').attr('content'),
      faviconUrl: $('link[rel="icon"]').attr('href'),
    },
  );
}

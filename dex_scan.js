import axios from 'axios';
import { formatTimestamp } from '@moncici/date-time-processor';
import { sleep } from '@moncici/sleep';
import { log } from '@moncici/log';
import { notify } from 'feishu-notifier';

export async function getPriceByToken(tokenAddreses) {
  const pairs = await getPairs(tokenAddreses);
  if (pairs.length == 0) {
    return [0, 0];
  }
  const max = pairs.reduce((max, pair) => pair && pair.priceUsd > max ? pair.priceUsd : max, pairs[0].priceUsd);
  const min = pairs.reduce((min, pair) => pair && pair.priceUsd < min ? pair.priceUsd : min, pairs[0].priceUsd);
  return [max, min];
}

export async function getPairs(tokenAddreses) {
    const url = `https://api.dexscreener.com/latest/dex/tokens/${tokenAddreses}`;
  
    try {
      const response = await axios.get(url);
      if (response.status == 429) {
        sleep(retryDuration);
      }
      const data = response.data;
      let max = 0;
      let min = 10000000;
      if (response.data && Array.isArray(response.data.pairs)) {
        response.data.pairs.map(pair => {
          log(pair.dexId, formatTimestamp(pair.pairCreatedAt), pair.baseToken.symbol, pair.baseToken.address, pair.quoteToken.symbol, pair.quoteToken.address, pair.priceUsd);
        })
        return response.data.pairs;
      } else {
        return [];
      }
    } catch(error) {
      log(`error: `, error);
      notify('BUY', error);
      return [];
      // throw error; // 将错误向上抛出
    }
  }

// getPairs("0x2170Ed0880ac9A755fd29B2688956BD959F933F8,0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c");
// getPairs("0x2170Ed0880ac9A755fd29B2688956BD959F933F8");


import { Subscription } from 'rxjs';
import { IAragonApp } from '@aragon/types';

/**
 * Fetch the given script and create a local URL for it
 *
 * @param {string} scriptUrl Real world location of the script
 * @returns {Promise<string>} Local url for the script
 */
export async function getBlobUrl(scriptUrl: string) {
  // In the future, we might support IPFS protocols in addition to http
  const text = await fetchUrl(scriptUrl);
  const blob = new Blob([text], { type: 'application/javascript' });

  return URL.createObjectURL(blob);
}

const fetchUrl = async (url: string) => {
  const res = await fetch(url, {
    method: 'GET',
    mode: 'cors',
  });

  // If status is not a 2xx (based on Response.ok), assume it's an error
  // See https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
  if (!(res && res.ok)) {
    throw res;
  }

  return res.text();
};

export class WorkerSubscriptionPool {
  public workers = new Map<string, {
    app: IAragonApp;
    subscription: Subscription;
    worker: Worker;
  }>();

  public addWorker = (app: IAragonApp, subscription: Subscription, worker: Worker) => {
    this.workers.set(app.proxyAddress, { app, subscription, worker });
  }
  public hasWorker = (proxyAddress: string) => {
    return this.workers.has(proxyAddress);
  }
  public unsubscribe = () => {
    this.workers.forEach(({ subscription, worker }) => {
      // TODO: ask worker to nicely terminate itself first
      worker.terminate();
      subscription.unsubscribe();
    });
  }
}

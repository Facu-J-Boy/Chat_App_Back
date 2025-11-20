import { PubSub } from 'graphql-subscriptions';
import { MessageModel } from '../models';

// Definimos los triggers y sus payloads
// interface PubSubAsyncIterator extends PubSub {
//   asyncIterator<T>(triggers: string | string[]): AsyncIterator<T>;
// }
export const pubsub = new PubSub();

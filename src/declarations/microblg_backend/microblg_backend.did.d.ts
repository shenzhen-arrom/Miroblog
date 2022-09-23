import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export interface Message { 'text' : string, 'time' : Time, 'author' : string }
export type Time = bigint;
export interface _SERVICE {
  'follow' : ActorMethod<[Principal], undefined>,
  'follows' : ActorMethod<[], Array<[Principal, string]>>,
  'get_name' : ActorMethod<[], [] | [string]>,
  'post' : ActorMethod<[string, string], Time>,
  'posts' : ActorMethod<[Time], Array<Message>>,
  'set_name' : ActorMethod<[string, string], undefined>,
  'timeline' : ActorMethod<[Array<Principal>, Time], Array<Message>>,
}

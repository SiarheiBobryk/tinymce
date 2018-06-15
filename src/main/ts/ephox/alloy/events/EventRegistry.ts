import { Objects } from '@ephox/boulder';
import { Fun, Obj, Option, Struct } from '@ephox/katamari';

import * as TransformFind from '../alien/TransformFind';
import * as Tagger from '../registry/Tagger';
import * as DescribedHandler from './DescribedHandler';
import { SugarElement } from 'ephox/alloy/api/Main';

export interface ElementAndHandler {
  element: () => SugarElement;
  descHandler: () => CurriedHandler;
}

const eventHandler: (element: SugarElement, descHandler: CurriedHandler) => ElementAndHandler =
  Struct.immutable('element', 'descHandler');

export interface CurriedHandler {
  purpose: () => string;
  cHandler: Function;
}

export class UncurriedHandler {
  purpose: () => string;
  handler: Function;
}

export interface UidAndHandler {
  id: () => string;
  descHandler: () => CurriedHandler;
}

const broadcastHandler = (id: string, handler: CurriedHandler): UidAndHandler => {
  return {
    id: Fun.constant(id),
    descHandler: Fun.constant(handler)
  };
};

export type EventName = string;
export type Uid = string;

export default () => {
  const registry: Record<EventName, Record<Uid, CurriedHandler>> = { };

  const registerId = (extraArgs: any[], id: string, events: Record<EventName, UncurriedHandler>) => {
    Obj.each(events, (v: UncurriedHandler, k: EventName) => {
      const handlers = registry[k] !== undefined ? registry[k] : { };
      handlers[id] = DescribedHandler.curryArgs(v, extraArgs);
      registry[k] = handlers;
    });
  };

  const findHandler = (handlers: Option<Record<Uid, CurriedHandler>>, elem: SugarElement): Option<ElementAndHandler> => {
    return Tagger.read(elem).fold(() => {
      return Option.none();
    }, (id) => {
      const reader = Objects.readOpt(id);
      return handlers.bind(reader).map((descHandler: CurriedHandler) => {
        return eventHandler(elem, descHandler);
      });
    });
  };

  // Given just the event type, find all handlers regardless of element
  const filterByType = (type: string): UidAndHandler[] => {
    return Objects.readOptFrom(registry, type).map((handlers) => {
      return Obj.mapToArray(handlers, (f, id) => {
        return broadcastHandler(id, f);
      });
    }).getOr([ ]);
  };

  // Given event type, and element, find the handler.
  const find = (isAboveRoot: (SugarElement) => boolean, type: string, target: SugarElement): Option<ElementAndHandler> => {
    const readType = Objects.readOpt(type);
    const handlers = readType(registry) as Option<Record<string, CurriedHandler>>;
    return TransformFind.closest(target, (elem: SugarElement) => {
      return findHandler(handlers, elem);
    }, isAboveRoot);
  };

  const unregisterId = (id: string): void => {
    // INVESTIGATE: Find a better way than mutation if we can.
    Obj.each(registry, (handlersById: Record<string, CurriedHandler>, eventName) => {
      if (handlersById.hasOwnProperty(id)) { delete handlersById[id]; }
    });
  };

  return {
    registerId,
    unregisterId,
    filterByType,
    find
  };
};
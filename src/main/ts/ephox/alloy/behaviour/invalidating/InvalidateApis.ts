import { Future, Result } from '@ephox/katamari';
import { Body, Class, Html } from '@ephox/sugar';

import * as AriaVoice from '../../alien/AriaVoice';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { InvalidatingConfig } from '../../behaviour/invalidating/InvalidateTypes';
import { Stateless } from '../../behaviour/common/BehaviourState';

const markValid = (component: AlloyComponent, invalidConfig: InvalidatingConfig/*, invalidState */): void => {
  const elem = invalidConfig.getRoot()(component).getOr(component.element());
  Class.remove(elem, invalidConfig.invalidClass());
  invalidConfig.notify().each((notifyInfo) => {
    notifyInfo.getContainer()(component).each((container) => {
      Html.set(container, notifyInfo.validHtml());
    });

    notifyInfo.onValid()(component);
  });
};

const markInvalid = (component: AlloyComponent, invalidConfig: InvalidatingConfig, invalidState: Stateless, text: string): void => {
  const elem = invalidConfig.getRoot()(component).getOr(component.element());
  Class.add(elem, invalidConfig.invalidClass());
  invalidConfig.notify().each((notifyInfo) => {
    // Probably want to make "Body" configurable as well.
    AriaVoice.shout(Body.body(), text);
    notifyInfo.getContainer()(component).each((container) => {
      // TODO: Should we just use Text here, not HTML?
      Html.set(container, text);
    });

    notifyInfo.onInvalid()(component, text);
  });
};

const query = (component: AlloyComponent, invalidConfig: InvalidatingConfig, invalidState: Stateless): Future<Result<any, string>> => {
  return invalidConfig.validator().fold(() => {
    return Future.pure(Result.value(true));
  }, (validatorInfo) => {
    return validatorInfo.validate()(component);
  });
};

const run = (component: AlloyComponent, invalidConfig: InvalidatingConfig, invalidState: Stateless): Future<Result<any, string>> => {
  invalidConfig.notify().each((notifyInfo) => {
    notifyInfo.onValidate()(component);
  });

  return query(component, invalidConfig, invalidState).map((valid: Result<any, string>) => {
    if (component.getSystem().isConnected()) {
      return valid.fold((err) => {
        markInvalid(component, invalidConfig, invalidState, err);
        return Result.error(err);
      }, (v) => {
        markValid(component, invalidConfig);
        return Result.value(v);
      });
    } else {
      return Result.error('No longer in system');
    }
  });
};

export {
  markValid,
  markInvalid,
  query,
  run
};
import { Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { switchMap } from 'rxjs';

/**
 * `FormControl.touched`/`.invalid` are plain mutable properties, not signals — reading them
 * inside a `computed()` creates no reactive dependency on them. In this zoneless app that means a
 * `computed` built like `this.control().invalid && this.control().touched` never re-evaluates
 * after `markAsTouched()`/`markAllAsTouched()` (which, on top of that, don't even emit
 * `statusChanges`): nothing ever signals it to. `control.events` does fire on every touched/value/
 * status change, so exposing it as a signal gives a real dependency to depend on — call the
 * returned signal at the top of any `computed()` that reads the control's mutable state.
 */
export function controlEvents(control: Signal<FormControl>) {
  return toSignal(
    toObservable(control).pipe(switchMap((c) => c.events)),
    { initialValue: null },
  );
}
